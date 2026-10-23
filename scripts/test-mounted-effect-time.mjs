import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
const args=process.argv.slice(2),core=coreRoot(args),require=createRequire(join(core,'package.json')),browserRequire=createRequire(join(option(args,'--browser-tools','/tmp/sd-dice-preview-tools'),'package.json'));
const {build}=require('esbuild'),{chromium}=browserRequire('playwright'),root=mkdtempSync(join(tmpdir(),'dnd5e-effect-time-mounted-')),driver=join(root,'states.ts');
writeFileSync(driver,`import {DnD5eAdapter} from ${JSON.stringify(join(moduleRoot,'src/logic/adapter.ts'))};import {skillSource,skillContext,unavailableContexts} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/skill-scenarios.ts'))};const adapter=new DnD5eAdapter(),source=skillSource(),timed=structuredClone(source);timed.effects=[{_id:'Timed',type:'base',start:{time:100},duration:{value:1,units:'seconds',expiry:'turnStart',expired:true},system:{changes:[{key:'system.abilities.wis.value',type:'add',value:4}]}}];const poison=structuredClone(timed);Object.assign(poison.effects[0].duration,{_worldTime:99,remaining:2,secondsRemaining:2,label:'Ready'});process.stdout.write(JSON.stringify({ready:adapter.prepareActorData(source,skillContext()),timed:adapter.prepareActorData(timed,skillContext()),poison:adapter.prepareActorData(poison,skillContext()),lost:unavailableContexts().map(({context})=>adapter.prepareActorData(source,context))}));`);
const output=spawnSync(process.execPath,[join(core,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',join(core,'tsconfig.json'),driver],{encoding:'utf8',cwd:core,maxBuffer:4e6});assert.equal(output.status,0,output.stderr);const data=JSON.parse(output.stdout);
const bundle=await build({entryPoints:[join(moduleRoot,'tests/browser/skill-lifecycle.tsx')],bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',tsconfig:join(core,'tsconfig.json'),plugins:[{name:'sdk-seam',setup(b){b.onResolve({filter:/^@sheet-delver\/sdk(?:\/react)?$/},()=>({path:join(moduleRoot,'tests/browser/sdk-fixture.tsx')}));}}],define:{'process.env.NODE_ENV':'"development"'},logLevel:'silent'}),js=bundle.outputFiles[0].text;
const browser=await chromium.launch({headless:true,executablePath:option(args,'--chromium')}),rows=[];
try{for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:1100}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().url()==='http://dnd5e-fixture.invalid/'?r.fulfill({contentType:'text/html',body:'<div id="root"></div>'}):r.abort());await page.goto('http://dnd5e-fixture.invalid/');await page.addStyleTag({content:readFileSync(join(moduleRoot,'assets/dnd5e.css'),'utf8')});await page.addScriptTag({content:js});
 const render=(actor,probe=false)=>page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor,probe});
 await render(data.ready);if(width<1024){await page.getByRole('button',{name:'▲',exact:true}).click();await page.getByRole('button',{name:/Skills/}).click();}
 const perception=page.getByRole('button',{name:/Perception/});assert.equal(await perception.isDisabled(),false);
 await render(data.timed);assert.equal(await perception.isDisabled(),true);assert.match(await perception.getAttribute('title'),/public world-time context \(E04\)/);
 await render(data.poison);assert.equal(await perception.isDisabled(),true);for(const actor of data.lost){await render(actor);assert.equal(await perception.isDisabled(),true);}
 await render(data.ready);await perception.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');
 for(const changed of [data.timed,data.poison,...data.lost]){await render(data.ready,true);await perception.click();await page.evaluate(()=>window.skillFixture.hold());await render(changed,true);assert.equal(await page.locator('dialog[open]').count(),0);await render(data.ready,true);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
 await perception.click();const dialog=page.locator('dialog[open]');await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');assert.equal(await page.evaluate(()=>window.skillFixture.updates.length),0);assert.deepEqual(errors,[]);
 rows.push({width,actualLayoutUnavailableReason:true,poisonRejected:true,sourceContextRecovery:true,shortcut:true,heldCallbackRetired:true,freshIntentRequired:true,zeroWrites:true});await context.close();
}}finally{await browser.close();}
writeFileSync(join(root,'evidence.json'),JSON.stringify({evidence:'Mounted actual consumers with isolated SDK seam;not installed/native/operator acceptance',rows},null,2)+'\n');process.stdout.write('Mounted explicit timed-effect boundary/recovery both layouts PASS;artifacts '+root+'\n');
