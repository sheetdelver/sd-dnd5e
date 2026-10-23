/** Offline QA probe, not a native acceptance suite. No listener or live requests.
 * Run with --core PATH --browser-tools PATH --chromium PATH [--core-css PATH]. */
import {createRequire} from 'node:module';
import {mkdtempSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {coreRoot,moduleRoot,option} from '../../../scripts/lib/toolchain.mjs';
const args=process.argv.slice(2),core=coreRoot(args),out=mkdtempSync(join(tmpdir(),'dnd5e-qa-usability-'));
const req=createRequire(join(core,'package.json')),{build}=req('esbuild');
const browserTools=option(args,'--browser-tools');
if(!browserTools)throw new Error('--browser-tools required');
const {chromium}=createRequire(join(browserTools,'package.json'))('playwright');
const driver=join(out,'prepare.ts');
writeFileSync(driver,`
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {DnD5eAdapter} from ${JSON.stringify(join(moduleRoot,'src/logic/adapter.ts'))};
import {skillContext} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/skill-scenarios.ts'))};
import {healthCases,healthSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/health-scenarios.ts'))};
const adapter=new DnD5eAdapter();
const variants=[
 ['baseline',null],['plain-effect',{}],
 ['migration-marker',{persistSourceMigration:true}],
 ['empty-dependents',{dependents:[]}],['spell-level-metadata',{spellLevel:1}],
 ['real-dependency',{dependentOn:'OtherEffect'}],
 ['temporary',{isTemporary:true}],['explicit-nontemporary',{isTemporary:false}],
 ['disabled-marker',{persistSourceMigration:true}],
 ['condition-baseline',{}],['condition-migration-marker',{persistSourceMigration:true}],
 ['item-migration-marker',{}]
];
const rows=variants.map(([id,flags])=>{
 const source:any=healthSource(healthCases[0]);source.name='Offline QA character';
 source.effects=[];
 if(flags!==null){const effect:any={_id:'QAEffect',type:'base',disabled:id==='disabled-marker',flags:{dnd5e:flags},system:{changes:[{key:'system.abilities.wis.value',type:'add',value:2,phase:'initial'}]}};
 if(String(id).startsWith('condition-')){effect.type='condition';effect.statuses=['poisoned'];effect.system={type:'poisoned'};}
 if(id==='item-migration-marker')source.items.push({_id:'QAFeature',name:'QA feature',type:'feat',system:{},flags:{dnd5e:{persistSourceMigration:true}},effects:[effect]});
 else source.effects=[effect];}
 const before=structuredClone(source),actor:any=adapter.prepareActorData(source,skillContext());assert.deepEqual(source,before);
 const d=actor.derived;
 const summary={id,level:d.level,proficiency:d.profBonus,hp:d.hp.value,hpMax:d.hp.max,ac:d.ac,initiative:d.initiative,
 scores:Object.values(d.abilities).map((v:any)=>v.score),readyAbilityChecks:Object.values(d.abilities).filter((v:any)=>v.check?.formula).length,
 readySkillChecks:Object.values(d.skills).filter((v:any)=>v.formula).length,
 reason:d.effectPreparation.reason??null,decisions:d.effectPreparation.decisions};
 return {id,actor,summary};
});
writeFileSync(${JSON.stringify(join(out,'states.json'))},JSON.stringify(rows));
`);
const prepared=spawnSync(process.execPath,[join(core,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',join(core,'tsconfig.json'),driver],{cwd:core,encoding:'utf8'});
if(prepared.status!==0)throw new Error(prepared.stderr||prepared.stdout);
const rows=JSON.parse(readFileSync(join(out,'states.json'),'utf8'));
const bundle=await build({entryPoints:[join(moduleRoot,'tests/browser/skill-lifecycle.tsx')],bundle:true,write:false,
 platform:'browser',format:'iife',jsx:'automatic',tsconfig:join(core,'tsconfig.json'),
 plugins:[{name:'sdk-fixture',setup(b){b.onResolve({filter:/^@sheet-delver\/sdk(?:\/react)?$/},()=>({path:join(moduleRoot,'tests/browser/sdk-fixture.tsx')}));}}],
 define:{'process.env.NODE_ENV':'"development"'},logLevel:'silent'});
const coreCss=option(args,'--core-css'),geometry=[],browser=await chromium.launch({headless:true,executablePath:option(args,'--chromium')});
try{
 for(const width of [390,1024,1280,1440]){
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.href==='http://qa.invalid/')return route.fulfill({contentType:'text/html',body:'<html><body><div class="sdk-module--dnd5e" id="root"></div></body></html>'});
   if(url.origin==='http://qa.invalid'&&/^\/fonts\/[a-z-]+\/[A-Za-z-]+\.ttf$/.test(url.pathname)){
    const path=join(moduleRoot,'assets',url.pathname);if(existsSync(path))return route.fulfill({contentType:'font/ttf',body:readFileSync(path)});
   }
   return route.abort();
  });
  await page.goto('http://qa.invalid/');
  if(coreCss)await page.addStyleTag({content:readFileSync(coreCss,'utf8')});
  await page.addStyleTag({content:readFileSync(join(moduleRoot,'assets/dnd5e.css'),'utf8')});
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  for(const row of rows.filter(r=>['baseline','migration-marker'].includes(r.id))){
   await page.evaluate(actor=>window.skillFixture.render(actor),row.actor);
   await page.evaluate(()=>document.fonts.ready);
   await page.getByRole('button',{name:'Theme Settings'}).count();
   const facts=await page.evaluate(()=>{
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    const ability=document.querySelector('button[aria-label="Wisdom Check"]');
    const save=document.querySelector('button[aria-label="Wisdom Saving Throw"]');
    const cards=[...document.querySelectorAll('.block-card')].map(e=>({title:e.querySelector('.block-heading')?.textContent??'',...rect(e)}));
    const abilityGrid=ability?.parentElement;
    const abilityRects=abilityGrid?[...abilityGrid.children].map(rect):[];
    const abilityOverflow=abilityGrid?Math.max(0,...abilityRects.map(r=>r.right-abilityGrid.getBoundingClientRect().right)):null;
    const saveGrid=save?.parentElement;
    const saveOverflow=saveGrid?Math.max(0,...[...saveGrid.children].map(e=>e.getBoundingClientRect().right-saveGrid.getBoundingClientRect().right)):null;
    const message='Effect conditions/dependencies require Q02a qualification';
    return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
     repeatedDiagnostic:document.body.innerText.split(message).length-1,abilityOverflow,saveOverflow,cards,
     blockedButtons:[...document.querySelectorAll('button:disabled')].length};
   });
   geometry.push({id:row.id,width,...facts,errors:[...errors]});
   await page.screenshot({path:join(out,row.id+'-'+width+'.png'),fullPage:true});
  }
  await context.close();
 }
}finally{await browser.close();}
const evidence={method:'Offline module adapter and actual Sheet with SDK presentation seam; local fonts; all network intercepted. Not Krusky source/native acceptance.',coreCss:coreCss??null,preparation:rows.map(r=>r.summary),geometry};
writeFileSync(join(out,'evidence.json'),JSON.stringify(evidence,null,2));
process.stdout.write(JSON.stringify({artifacts:out,preparation:evidence.preparation,geometry:geometry.map(({cards,...rest})=>rest)},null,2)+'\n');
