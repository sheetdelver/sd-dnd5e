/** Actual offline Sheet, representative source corpus and public SDK UI seam.
 * No listener, world connection or native/operator acceptance. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
const args=process.argv.slice(2),core=coreRoot(args),out=mkdtempSync(join(tmpdir(),'dnd5e-workflow-smoke-'));
const {build}=createRequire(join(core,'package.json'))('esbuild');
const browserTools=option(args,'--browser-tools');if(!browserTools)throw new Error('--browser-tools required');
const {chromium}=createRequire(join(browserTools,'package.json'))('playwright');
writeFileSync(join(out,'prepare.ts'),`
import assert from 'node:assert/strict';import {writeFileSync} from 'node:fs';
import {DnD5eAdapter} from ${JSON.stringify(join(moduleRoot,'src/logic/adapter.ts'))};
import {playerCorpus} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/player-corpus.ts'))};
const a=new DnD5eAdapter();writeFileSync(${JSON.stringify(join(out,'states.json'))},JSON.stringify(playerCorpus().map(row=>{
 const before=structuredClone(row.source),actor=a.prepareActorData(row.source,row.context);assert.deepEqual(row.source,before);
 assert.equal(a.getRollData(actor,'skill','prc')?.formula??null,row.formula,row.id);return {...row,actor};})));`);
const prepared=spawnSync(process.execPath,[join(core,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',join(core,'tsconfig.json'),join(out,'prepare.ts')],{cwd:core,encoding:'utf8'});
assert.equal(prepared.status,0,prepared.stderr||prepared.stdout);
const rows=JSON.parse(readFileSync(join(out,'states.json'),'utf8'));
const bundle=await build({entryPoints:[join(moduleRoot,'tests/browser/skill-lifecycle.tsx')],bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',tsconfig:join(core,'tsconfig.json'),
 plugins:[{name:'sdk-fixture',setup(b){b.onResolve({filter:/^@sheet-delver\/sdk(?:\/react)?$/},()=>({path:join(moduleRoot,'tests/browser/sdk-fixture.tsx')}));}}],define:{'process.env.NODE_ENV':'"development"'},logLevel:'silent'});
const browser=await chromium.launch({headless:true,executablePath:option(args,'--chromium')}),evidence=[];
try{for(const width of [390,1024,1280,1440]){
 const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{
  const url=new URL(route.request().url());if(url.href==='http://smoke.invalid/')return route.fulfill({contentType:'text/html',body:'<html><body><div class="sdk-module--dnd5e" id="root"></div></body></html>'});
  if(url.origin==='http://smoke.invalid'&&/^\/fonts\/[a-z-]+\/[A-Za-z-]+\.ttf$/.test(url.pathname)){const path=join(moduleRoot,'assets',url.pathname);if(existsSync(path))return route.fulfill({contentType:'font/ttf',body:readFileSync(path)});}return route.abort();
 });
 await page.goto('http://smoke.invalid/');
 const css=option(args,'--core-css');if(css)await page.addStyleTag({content:readFileSync(css,'utf8')});
 await page.addStyleTag({content:readFileSync(join(moduleRoot,'assets/dnd5e.css'),'utf8')});await page.addScriptTag({content:bundle.outputFiles[0].text});
 for(const row of rows){
  await page.evaluate(actor=>window.skillFixture.render(actor),row.actor);await page.evaluate(()=>document.fonts.ready);
  const button=page.getByRole('button',{name:'Wisdom Check',exact:true});await button.waitFor();
  const geometry=await page.evaluate(()=>{
   const grids=[...document.querySelectorAll('[data-ability-grid],[data-save-grid]')];
   const outside=grids.flatMap(g=>{const r=g.getBoundingClientRect();return [...g.children].filter(c=>{const s=c.getBoundingClientRect();return s.left<r.left-1||s.right>r.right+1||s.top<r.top-1||s.bottom>r.bottom+1;}).map(c=>c.textContent);});
   const cards=[...document.querySelectorAll('.block-card')].filter(c=>!c.parentElement?.closest('.block-card')).map(c=>c.getBoundingClientRect());
   let overlaps=0;for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++){const a=cards[i],b=cards[j];if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)overlaps++;}
   return {documentWidth:document.documentElement.scrollWidth,outside,overlaps,initialText:document.body.innerText};
  });
  assert.equal(geometry.documentWidth,width,`${row.id}/${width} document width`);assert.deepEqual(geometry.outside,[],`${row.id}/${width} grid containment`);assert.equal(geometry.overlaps,0,`${row.id}/${width} card overlap`);
  assert.doesNotMatch(geometry.initialText,/Q02a|futureMechanic/,'technical reason must remain collapsed');
  if(row.formula){
   await button.scrollIntoViewIfNeeded();assert.equal(await button.evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),true,'roll button is hit-testable');
   const count=await page.evaluate(()=>window.skillFixture.calls.length);await button.click();await page.getByRole('dialog').waitFor();await page.getByRole('button',{name:'Normal',exact:true}).click();
   await page.waitForFunction(n=>window.skillFixture.calls.length===n+1,count);const call=await page.evaluate(()=>window.skillFixture.calls.at(-1));assert.equal(call.type,'ability');assert.ok(call.formula);
   await button.click({modifiers:['Shift']});await page.waitForFunction(n=>window.skillFixture.calls.length===n+2,count);
  }else{
   assert.equal(await button.isDisabled(),true);assert.equal(await page.getByRole('region',{name:'Sheet diagnostics'}).count(),1);
   await page.getByText('View details',{exact:false}).click();const details=await page.getByRole('region',{name:'Sheet diagnostics'}).innerText();
   if(row.id==='unknown-mechanics')assert.match(details,/Migrated focus \(MigratedFocus\)/);
  }
  assert.deepEqual(errors,[]);evidence.push({id:row.id,width,documentWidth:geometry.documentWidth,gridOverflow:geometry.outside.length,cardOverlaps:geometry.overlaps,checkAvailable:!!row.formula});
  if(['migration','unknown-mechanics','local-unavailable'].includes(row.id))await page.screenshot({path:join(out,row.id+'-'+width+'.png'),fullPage:true});
 }
 // Same mounted sheet: old roll retires on context loss; recovery needs a new click.
 const supported=rows[1],unsupported=rows.at(-1);await page.evaluate(a=>window.skillFixture.render(a),supported.actor);await page.getByRole('button',{name:'Wisdom Check',exact:true}).click();
 await page.evaluate(a=>window.skillFixture.render(a),unsupported.actor);await page.getByRole('dialog').waitFor({state:'detached'});
 const count=await page.evaluate(()=>window.skillFixture.calls.length);await page.evaluate(a=>window.skillFixture.render(a),supported.actor);assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),count);
 await context.close();
}}finally{await browser.close();}
writeFileSync(join(out,'evidence.json'),JSON.stringify({method:'Offline actual Sheet + SDK presentation seam, synthetic representative source. No native/operator acceptance.',results:evidence},null,2));
process.stdout.write(JSON.stringify({artifacts:out,cases:evidence.length,result:'PASS'},null,2)+'\n');
