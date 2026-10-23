import assert from 'node:assert/strict';
import {verifyPlainD20} from './lib/plain-d20-equivalence.mjs';
import {normalRangeMatrix,verifyRange} from './lib/range-expectations.mjs';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { coreRoot, moduleRoot } from './lib/toolchain.mjs';

const core = coreRoot(), require = createRequire(join(core, 'package.json'));
const { Server } = require('socket.io'), yaml = require('js-yaml');
const coreVersion = JSON.parse(readFileSync(join(core,'package.json'),'utf8')).version;
assert.equal(coreVersion,'0.19.3','Qualification is pinned to the released baseline');
const coreCommit = execFileSync('git',['-C',core,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const root = mkdtempSync(join(tmpdir(), 'dnd5e-public-rolls-')), data = join(root, 'data');
writeFileSync(join(root,'package.json'),JSON.stringify({version:'0.19.3',type:'module'}));
for(const name of ['src','node_modules','.managed'])symlinkSync(join(core,name),join(root,name),'dir');
const users = [{_id:'fixturegm',name:'Fixture GM',role:4},{_id:'fixtureplayer',name:'Fixture Player',role:2}];
const game = { world:{id:'q00world',_id:'q00world',title:'Offline Q00',system:'q00'}, system:{id:'q00',version:'1.0.0',title:'Offline Q00'},
    version:'14.367', release:{generation:14,build:367}, users, activeUsers:[], packs:[], modules:[], settings:[],
    actors:[],items:[],scenes:[],combats:[],messages:[],folders:[],journal:[],macros:[],playlists:[],tables:[],cards:[] };
const traffic = [], writes = [];
const fake = createServer(async (req,res) => {
    traffic.push({method:req.method,path:req.url});
    res.setHeader('Content-Type','application/json');
    if (req.url === '/api/status') return res.end(JSON.stringify({active:true,world:'Offline Q00',version:'14.367'}));
    if (req.url === '/join') {
        let body=''; for await (const chunk of req) body+=chunk;
        const login=JSON.parse(body), id=login.userId ?? login.userid ?? users.find(u=>u.name===login.username)?._id;
        assert.ok(users.some(u=>u._id===id)); res.setHeader('Set-Cookie',`session=${id}; Path=/; HttpOnly`);
        return res.end(JSON.stringify({success:true}));
    }
    res.statusCode=404; res.end('{}');
});
const sockets = new Server(fake);
sockets.on('connection', socket => {
    const userId = socket.handshake.auth?.session ?? socket.handshake.query.session;
    socket.emit('session',{userId});
    socket.on('getJoinData', ack=>ack(game));
    socket.on('world', ack=>ack({...game,userId}));
    socket.on('getWorldStatus', ack=>ack(true));
    socket.onAny((event,...args)=>{
        if (['getJoinData','world','getWorldStatus'].includes(event)) return;
        traffic.push({event}); const ack=args.at(-1);
        if (event==='modifyDocument' && args[0]?.action !== 'get') writes.push(args[0]);
        if (typeof ack==='function') ack({result:[]});
    });
});
await new Promise(resolve=>fake.listen(0,'127.0.0.1',resolve));
const fakePort=fake.address().port;
const reservation=createServer(); await new Promise(resolve=>reservation.listen(0,'127.0.0.1',resolve));
const port=reservation.address().port; await new Promise(resolve=>reservation.close(resolve));
const origin=`http://127.0.0.1:${port}`;
mkdirSync(join(data,'config'),{recursive:true}); mkdirSync(join(data,'cache/core'),{recursive:true});
writeFileSync(join(data,'cache/core/worlds.json'),JSON.stringify({worlds:{},currentWorldId:null}));
writeFileSync(join(data,'config/settings.yaml'),yaml.dump({app:{host:'127.0.0.1',port,'api-port':port,protocol:'http'},foundry:{host:'127.0.0.1',port:fakePort,protocol:'http',connector:'socket',username:'Fixture GM'},debug:{enabled:false,level:3},security:{'rate-limit':{enabled:false},cors:{'allowed-origins':[origin]}}}),{mode:0o600});
const fixture=join(data,'local/modules/q00'); mkdirSync(join(fixture,'module'),{recursive:true});
const info=JSON.parse(readFileSync(join(moduleRoot,'info.json'),'utf8'));
writeFileSync(join(fixture,'info.json'),JSON.stringify({...info,id:'q00',title:'Offline Q00',experimental:false,worldSettings:[],compendiumPacks:{packs:[]},manifest:{logic:'module/logic.ts',server:'module/server.ts',ui:'module/ui.ts'}}));
writeFileSync(join(fixture,'module/ui.ts'),'export default {};');
writeFileSync(join(fixture,'module/logic.ts'),`import {BaseSystemAdapter} from '@sheet-delver/sdk'; export class Adapter extends BaseSystemAdapter {systemId='q00';match(){return true;}}`);
writeFileSync(join(fixture,'module/server.ts'),`export const apiRoutes={probe:async(req)=>{const {cases}=await req.json(); const results=[];for(const row of cases){globalThis.__q00Faces(row.faces);try{results.push({...await req.runtime.rolls.roll(row.formula,'Q00 silent fixture',{displayChat:false}),remaining:globalThis.__q00Remaining()});}catch(error){if(row.expectedRejection){results.push({rejected:error instanceof Error?error.message:String(error),remaining:globalThis.__q00Remaining()});}else throw error;}}return {results};}};`);
const preload=join(root,'entropy.mjs');
writeFileSync(preload,`import {createRequire} from 'node:module';const require=createRequire(${JSON.stringify(join(core,'package.json'))});const cjs=require('@dice-roller/rpg-dice-roller'),esm=await import('@dice-roller/rpg-dice-roller');let faces=[];globalThis.__q00Faces=input=>{faces=[...input];};globalThis.__q00Remaining=()=>faces.length;for(const {NumberGenerator} of [cjs,esm])NumberGenerator.generator.engine={next(){if(!faces.length)throw new Error('Unexpected dice draw');return faces.shift()-1;}};`);
let logs='';
const child=spawn(process.execPath,['--import',preload,join(core,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',join(core,'tsconfig.json'),join(core,'src/server/index.ts'),'--data-dir',data],{
    cwd:root, env:{NODE_OPTIONS:'--import='+preload, PATH:process.env.PATH, NODE_ENV:'development', SHEET_DELVER_DATA:data, HOST:'127.0.0.1', API_PORT:String(port), APP_FOUNDRY_SESSION_KEY:'hex:'+'1'.repeat(64)},stdio:['ignore','pipe','pipe'],detached:true});
child.stdout.on('data',value=>{logs+=value;});child.stderr.on('data',value=>{logs+=value;});
child.on('exit',(code,signal)=>{logs+='\nIsolated host exit: code='+code+' signal='+signal+'\n';});
process.stdout.write(`Isolated public-host artifacts ${root}\n`);
try {
    const deadline=Date.now()+45000;
    while(Date.now()<deadline){
        if(child.exitCode!==null)throw new Error('Host exited');
        if(logs.includes('Bootstrap encountered error:'))throw new Error('Fixture bootstrap failed');
        if(logs.includes('World bootstrap complete.'))break;
        try {const status=await fetch(origin+'/api/status');if(status.ok){const text=await status.text();if(text.includes('q00'))break;}}catch{}
        await new Promise(resolve=>setTimeout(resolve,200));
    }
    assert.ok(logs.includes('World bootstrap complete.'),'Bounded host startup timed out');
    const login=await fetch(origin+'/api/login',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({username:'Fixture Player'})});
    assert.equal(login.status,200,await login.text());
    const cookie=login.headers.getSetCookie().map(s=>s.split(';')[0]).join(';');
    const driver=join(root,'cases.ts');
    // Actual module compilation, independently expected face selection/arithmetic.
    writeFileSync(driver, `import assert from 'node:assert/strict';
import {DnD5eAdapter} from ${JSON.stringify(join(moduleRoot,'src/logic/adapter.ts'))};
import {skillSource,skillContext,setSkillRoll} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/skill-scenarios.ts'))};
import {equippableFinalCases,equippableFinalSource,equippableFinalContext} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/equippable-final-scenarios.ts'))};
import {scalarNumberCases,scalarPhaseSource,scalarPhaseContext} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/scalar-phase-scenarios.ts'))};
import {baseProficiencyCases,baseProficiencySource,baseProficiencyContext} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/base-proficiency-scenarios.ts'))};
import {formulaEffectCases,formulaEffectSource,formulaEffectContext} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/formula-effect-scenarios.ts'))};
import {flagEffectCases,flagEffectSource,flagEffectContext} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/flag-effect-scenarios.ts'))};
import {remainingFlags,reliableSource,reliableOptions,remainingFlagSource,remainingFlagContext} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/remaining-flag-scenarios.ts'))};
import {readFlagCases,readFlagSource,readFlagContext} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/read-rule-flag-scenarios.ts'))};
import {ruleCases,ruleSource,ruleContext} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/applied-rule-scenarios.ts'))};
import {encumbranceSource,encumbranceContext} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/encumbrance-scenarios.ts'))};
import modes from ${JSON.stringify(join(moduleRoot,'tests/fixtures/native-6.0.6/skill-modes.json'))};
import {toolCases,toolSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/tool-scenarios.ts'))};
import {combinedCases,combinedSource,combinedOptions} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/combined-scenarios.ts'))};
import {effectPhaseCases} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/effect-phase-scenarios.ts'))};
import {numericEffectCases,numericEffectSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/effect-scenarios.ts'))};
import {itemEffectCases,itemEffectSource,itemEffectExpected} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/item-effect-scenarios.ts'))};
import {bonusEffectCases,bonusEffectSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/bonus-effect-scenarios.ts'))};
import {modeEffectCases,modeEffectSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/mode-effect-scenarios.ts'))};
import {defenseCases,defenseSource,defenseContext,defenseRangeSuffix} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/defense-scenarios.ts'))};
import {equipmentCases,equipmentSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/equipment-scenarios.ts'))};
import {normalRangeCases,rangeSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/range-scenarios.ts'))};
import {traitEffectCases,traitEffectSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/trait-effect-scenarios.ts'))};
import {trainingEffectCases,trainingEffectSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/training-effect-scenarios.ts'))};
import {filterCases,filterSource,filterExpected} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/filter-scenarios.ts'))};
import {initialFilterCases,initialFilterSource,initialFilterExpected} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/initial-filter-scenarios.ts'))};
import {initialCollectionFilterCases,initialCollectionFilterSource,initialCollectionFilterExpected} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/initial-collection-filter-scenarios.ts'))};
import {initialClassFilterCases,initialClassFilterSource,initialClassFilterExpected} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/initial-class-filter-scenarios.ts'))};
import {conditionCases,conditionSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/condition-scenarios.ts'))};
import {initiativeRollExpectedTotal} from ${JSON.stringify(join(moduleRoot,'scripts/lib/initiative-expectations.mjs'))};
import {conditionCustomCases,conditionCustomSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/condition-custom-scenarios.ts'))};
import {initialCustomCases,initialCustomSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/initial-custom-scenarios.ts'))};
import {itemCustomCases,itemCustomSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/item-custom-scenarios.ts'))};
import {featCustomCases,featCustomSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/feat-custom-scenarios.ts'))};
import {finalCustomCases,finalCustomSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-custom-scenarios.ts'))};
import {finalCiCases,finalCiSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-ci-scenarios.ts'))};
import {finalTrainingCases,finalTrainingSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-training-scenarios.ts'))};
import {finalDefenseCases,finalDefenseSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-defense-scenarios.ts'))};
import {sourceFlagCases,sourceFlagSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/source-flag-scenarios.ts'))};
import {finalNumberCases,finalNumberSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-number-scenarios.ts'))};
import {finalBonusCases,finalBonusSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-bonus-scenarios.ts'))};
import {finalProficiencyCases,finalProficiencySource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-proficiency-scenarios.ts'))};
import {finalModeCases,finalModeSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-mode-scenarios.ts'))};
import {petrificationCases,petrificationSource,petrificationModeCases,petrificationModeSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/petrification-scenarios.ts'))};
import {familyCases,familySource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/condition-family-scenarios.ts'))};
import {exhaustionCases,exhaustionSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/exhaustion-scenarios.ts'))};
import conditionFixture from ${JSON.stringify(join(moduleRoot,'tests/fixtures/native-6.0.6/poisoned-condition.json'))};
import {proficiencyIndicatorCases,proficiencyIndicatorSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/proficiency-indicator-scenarios.ts'))};
import {normalRangeMatrix} from ${JSON.stringify(join(moduleRoot,'scripts/lib/range-expectations.mjs'))};
import {formulaSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/formula-scenarios.ts'))};
import {scaleSource606} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/class-scale-scenarios.ts'))};
const adapter=new DnD5eAdapter(), cases=[];
function add(mode,faces,total=5,bonus=undefined){const actor=skillSource();setSkillRoll(actor,'skills.prc.roll',{mode,bonus:total-5});const prepared=adapter.prepareActorData(actor,skillContext());const options=bonus===undefined?{}:{situationalBonus:String(bonus)};const formula=adapter.getRollData(prepared,'skill','prc',options)?.formula;if(!formula)throw new Error('Unavailable normal formula');const selected=mode===1?Math.max(...faces):mode===-1?Math.min(...faces):faces[0];cases.push({formula,faces,expected:selected+total+(bonus??0),mode,total,bonus});}
for(const mode of [-1,1])for(let a=1;a<=20;a++)for(let b=1;b<=20;b++)add(mode,[a,b]);
for(let a=1;a<=20;a++)add(0,[a],[-1,0,1.5,1000000000][a%4],a%2?-2:2.5);
for(const row of modes.cases){const actor=skillSource();modes.scopeOrder.forEach((path,i)=>setSkillRoll(actor,path,{mode:row.modes[i]}));const prepared=adapter.prepareActorData(actor,skillContext());const formula=adapter.getRollData(prepared,'skill','prc')?.formula;const faces=row.expectedMode===0?[7]:[3,18];cases.push({formula,faces,expected:(row.expectedMode===1?18:row.expectedMode===-1?3:7)+5,mode:row.expectedMode,total:5});}
for(const sourceMode of [-1,0,1])for(const [choice,mode] of [['normal',0],['adv',1],['dis',-1]])for(const bonus of [2,-1.5]){const actor=skillSource();setSkillRoll(actor,'skills.prc.roll',{mode:sourceMode});const formula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'skill','prc',{advantage:choice,situationalBonus:String(bonus)})?.formula;const faces=mode===0?[7]:[2,19];cases.push({formula,faces,expected:(mode===1?19:mode===-1?2:7)+5+bonus,mode,total:5,bonus});}
for(const row of toolCases)for(const mode of [-1,0,1]){const actor=toolSource(row);const roll=actor.system.tools[row.key].roll;roll.mode=mode;const formula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'tool',row.key)?.formula;const faces=mode===0?[7]:[3,18];cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+row.expectedTotal,mode,total:row.expectedTotal,toolCase:row.id});}
for(const row of combinedCases)for(const manual of [undefined,'normal','adv','dis']){const options={...combinedOptions(row),...(manual?{advantage:manual,situationalBonus:'2'}:{})};const formula=adapter.getRollData(adapter.prepareActorData(combinedSource(row),skillContext()),row.kind,row.kind==='skill'?'prc':'thief',options)?.formula;const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:row.expectedMode,faces=mode===0?[7]:[3,18],bonus=manual?2:0;cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+row.expectedTotal+bonus,mode,total:row.expectedTotal,...(bonus?{bonus}:{}),selectedCase:row.id});}
const effectCases=effectPhaseCases;
for(const row of effectCases.filter(row=>row.expected.ready)){const actor=skillSource();actor.effects=row.effects;actor.items.push(...row.items);const formula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'skill','prc')?.formula;cases.push({formula,faces:[11],expected:11+(row.expected.total??5),mode:0,total:row.expected.total??5,effectCase:row.id});}

for(const row of numericEffectCases.filter(row=>row.expected)){
 const e=row.expected,prepared=adapter.prepareActorData(numericEffectSource(row),skillContext());
 for(const [kind,key,total,combined] of [['skill','prc',e.skill,false],['tool','thief',e.tool,false],['ability','wis',e.check,false],['save','wis',e.save,false],['skill','prc',e.combined,true],['tool','thief',e.combinedTool??e.combined,true]])for(const manual of [undefined,'normal','adv','dis']){
  const options={...(combined?{ability:'wis',[kind==='skill'?'tool':'skill']:kind==='skill'?'thief':'prc'}:{}),...(manual?{advantage:manual,situationalBonus:'2'}:{})};
  const formula=adapter.getRollData(prepared,kind,key,options)?.formula,mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:combined?e.combinedMode:0,faces=mode===0?[7]:[3,18],bonus=manual?2:0;
  cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),numericEffectCase:row.id});
 }
}

for(const row of itemEffectCases.filter(row=>!row.reason)){
 const e=itemEffectExpected(row),prepared=adapter.prepareActorData(itemEffectSource(row),skillContext());
 for(const [kind,key,total,selection] of [['skill','prc',e.skill,{}],['tool','thief',e.tool,{}],['ability','wis',e.check,{}],['save','wis',e.save,{}],['skill','prc',e.combined,{tool:'thief'}],['tool','thief',e.combinedTool,{skill:'prc',ability:'wis'}]])for(const manual of [undefined,'normal','adv','dis']){
  const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:Object.keys(selection).length?1:0,bonus=manual?2:0,faces=mode===0?[7]:[3,18];
  const formula=adapter.getRollData(prepared,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2'}:{})})?.formula;
  cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),itemEffectCase:row.id});
 }
}

for(const {row,actor,family} of [...traitEffectCases.filter(row=>row.expectedOperands).map(row=>({row,actor:traitEffectSource(row),family:'defense'})),...trainingEffectCases.filter(row=>row.expectedOperands).map(row=>({row,actor:trainingEffectSource(row),family:'training'}))]){
 const prepared=adapter.prepareActorData(actor,skillContext());
 for(const [kind,key,total,selection] of [['skill','prc',5,{}],['tool','thief',5,{}],['ability','wis',2,{}],['save','wis',2,{}],['skill','prc',5,{tool:'thief'}],['tool','thief',5,{skill:'prc',ability:'wis'}]])for(const manual of [undefined,'normal','adv','dis']){
  const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:Object.keys(selection).length?1:0,bonus=manual?2:0,faces=mode===0?[7]:[3,18];
  const formula=adapter.getRollData(prepared,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2'}:{})})?.formula;
  cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),...(family==='training'?{trainingEffectCase:row.id}:{traitEffectCase:row.id})});
 }
 if(row.expectedFormula){const total=row.expectedOperands['dm.amount.fire'];cases.push({formula:'1d20+('+row.expectedFormula+')',faces:[7],expected:7+total,mode:0,total,traitFormulaCase:row.id});}
 actor.system.skills.prc.roll={min:10};const formula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'skill','prc')?.formula;
 if(formula!=='1d20min10+5')throw Error('Trait effect changed numeric range configuration');
 cases.push({formula,faces:[7],expected:15,mode:0,total:5,rangeBounds:{minimum:10,maximum:null},...(family==='training'?{normalRangeTrainingEffectCase:row.id}:{normalRangeTraitEffectCase:row.id})});
}

for(const row of filterCases){
 const e=filterExpected(row);if(!e)continue;
 const actor=filterSource(row),prepared=adapter.prepareActorData(actor,skillContext());
 for(const [kind,key,total,selection] of [['skill','prc',e.skill,{}],['tool','thief',e.tool,{}],['ability','wis',e.check,{}],['save','wis',e.save,{}],['skill','prc',e.combined,{tool:'thief'}],['tool','thief',e.combinedTool,{skill:'prc',ability:'wis'}]])for(const manual of [undefined,'normal','adv','dis']){
  const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:Object.keys(selection).length?1:0,bonus=manual?2:0,faces=mode===0?[7]:[3,18];
  const formula=adapter.getRollData(prepared,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2'}:{})})?.formula;
  cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),constantFilterCase:row.id});
 }
 actor.system.skills.prc.roll={min:10};const formula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'skill','prc')?.formula;
 if(formula!=='1d20min10+'+e.skill)throw Error('Filter guard changed numeric range configuration');
 cases.push({formula,faces:[7],expected:10+e.skill,mode:0,total:e.skill,rangeBounds:{minimum:10,maximum:null},normalRangeFilterCase:row.id});
}

for(const row of initialFilterCases){
 const e=initialFilterExpected(row);if(!e)continue;
 const actor=initialFilterSource(row),prepared=adapter.prepareActorData(actor,skillContext());
 for(const [kind,key,total,selection] of [['skill','prc',e.skill,{}],['tool','thief',e.tool,{}],['ability','wis',e.check,{}],['save','wis',e.save,{}],['skill','prc',e.combined,{tool:'thief'}],['tool','thief',e.combinedTool,{skill:'prc',ability:'wis'}]])for(const manual of [undefined,'normal','adv','dis']){
  const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:Object.keys(selection).length?1:0,bonus=manual?2:0,faces=mode===0?[7]:[3,18];
  const formula=adapter.getRollData(prepared,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2'}:{})})?.formula;
  cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),initialFilterCase:row.id});
 }
 actor.system.skills.prc.roll={min:10};const formula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'skill','prc')?.formula;
 if(formula!=='1d20min10+'+e.skill)throw Error('Initial filter guard changed numeric range configuration');
 cases.push({formula,faces:[7],expected:10+e.skill,mode:0,total:e.skill,rangeBounds:{minimum:10,maximum:null},normalRangeInitialFilterCase:row.id});
}

for(const row of initialCollectionFilterCases){
 const e=initialCollectionFilterExpected(row);if(!e)continue;
 const actor=initialCollectionFilterSource(row),prepared=adapter.prepareActorData(actor,skillContext());
 for(const [kind,key,total,selection] of [['skill','prc',e.skill,{}],['tool','thief',e.tool,{}],['ability','wis',e.check,{}],['save','wis',e.save,{}],['skill','prc',e.combined,{tool:'thief'}],['tool','thief',e.combinedTool,{skill:'prc',ability:'wis'}]])for(const manual of [undefined,'normal','adv','dis']){
  const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:Object.keys(selection).length?1:0,bonus=manual?2:0,faces=mode===0?[7]:[3,18];
  const formula=adapter.getRollData(prepared,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2'}:{})})?.formula;
  cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),initialCollectionFilterCase:row.id});
 }
 actor.system.skills.prc.roll={min:10};const formula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'skill','prc')?.formula;
 if(formula!=='1d20min10+'+e.skill)throw Error('Initial filter guard changed numeric range configuration');
 cases.push({formula,faces:[7],expected:10+e.skill,mode:0,total:e.skill,rangeBounds:{minimum:10,maximum:null},normalRangeInitialCollectionFilterCase:row.id});
}

for(const row of initialClassFilterCases){
 const e=initialClassFilterExpected(row);if(!e)continue;
 const actor=initialClassFilterSource(row),prepared=adapter.prepareActorData(actor,skillContext());
 for(const [kind,key,total,selection] of [['skill','prc',e.skill,{}],['tool','thief',e.tool,{}],['ability','wis',e.check,{}],['save','wis',e.save,{}],['skill','prc',e.combined,{tool:'thief'}],['tool','thief',e.combinedTool,{skill:'prc',ability:'wis'}]])for(const manual of [undefined,'normal','adv','dis']){
  const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:Object.keys(selection).length?1:0,bonus=manual?2:0,faces=mode===0?[7]:[3,18];
  const formula=adapter.getRollData(prepared,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2'}:{})})?.formula;
  cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),initialClassFilterCase:row.id});
 }
 actor.system.skills.prc.roll={min:10};const formula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'skill','prc')?.formula;
 if(formula!=='1d20min10+'+e.skill)throw Error('Initial filter guard changed numeric range configuration');
 cases.push({formula,faces:[7],expected:10+e.skill,mode:0,total:e.skill,rangeBounds:{minimum:10,maximum:null},normalRangeInitialClassFilterCase:row.id});
}

{const source=trainingEffectSource(trainingEffectCases.find(row=>row.id==='custom-string-not-set'));cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,faces:[7],expected:12,mode:0,total:5,historicalInitialCustom:true});}
for(const row of conditionCustomCases){const source=conditionCustomSource(row),actor=adapter.prepareActorData(source,skillContext()),e=row.expected;
 for(const [kind,key,selection,total,sourceMode]of [['skill','prc',{},e.skill,e.skillMode],['tool','thief',{},e.skill,e.toolMode],['skill','prc',{tool:'thief'},e.skill,e.combinedSkillMode],['tool','thief',{skill:'prc',ability:'wis'},e.skill,e.combinedToolMode],['ability','wis',{},e.checkSave,e.abilityMode],['save','wis',{},e.checkSave,0],['initiative','initiative',{},e.initiative,e.initiativeMode]])for(const manual of [undefined,'normal','adv','dis']){const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,bonus=manual?2.5:0;cases.push({formula:adapter.getRollData(actor,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2.5'}:{})})?.formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),conditionCustomCase:row.id});}
 const fixed=skillContext();fixed.world.settings['dnd5e.initiativeScore']={status:'world',value:'all'};cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,fixed),'initiative','initiative')?.formula,faces:[],expected:e.score,mode:0,total:e.score,fixed:true,fixedConditionCustomCase:row.id});source.system.skills.prc.roll.min=10;cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc',{advantage:'normal'})?.formula,faces:[7],expected:10+e.skill,mode:0,total:e.skill,rangeBounds:{minimum:10,maximum:null},normalRangeConditionCustomCase:row.id});
}
for(const row of featCustomCases){const source=featCustomSource(row),actor=adapter.prepareActorData(source,skillContext());
 for(const [kind,key,selection,total,sourceMode]of [['skill','prc',{},5,0],['tool','thief',{},5,0],['skill','prc',{tool:'thief'},5,1],['tool','thief',{skill:'prc',ability:'wis'},5,1],['ability','wis',{},2,0],['save','wis',{},2,0]])for(const manual of [undefined,'normal','adv','dis']){const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,bonus=manual?2.5:0;cases.push({formula:adapter.getRollData(actor,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2.5'}:{})})?.formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),featCustomCase:row.id});}
 source.system.skills.prc.roll={min:10};cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc',{advantage:'normal'})?.formula,faces:[7],expected:15,mode:0,total:5,rangeBounds:{minimum:10,maximum:null},normalRangeFeatCustomCase:row.id});
}
for(const row of itemCustomCases){const source=itemCustomSource(row),actor=adapter.prepareActorData(source,skillContext());
 for(const [kind,key,selection,total,sourceMode]of [['skill','prc',{},5,0],['tool','thief',{},5,0],['skill','prc',{tool:'thief'},5,1],['tool','thief',{skill:'prc',ability:'wis'},5,1],['ability','wis',{},2,0],['save','wis',{},2,0]])for(const manual of [undefined,'normal','adv','dis']){const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,bonus=manual?2.5:0;cases.push({formula:adapter.getRollData(actor,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2.5'}:{})})?.formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),itemCustomCase:row.id});}
 source.system.skills.prc.roll={min:10};cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc',{advantage:'normal'})?.formula,faces:[7],expected:15,mode:0,total:5,rangeBounds:{minimum:10,maximum:null},normalRangeItemCustomCase:row.id});
}
for(const row of initialCustomCases){const source=initialCustomSource(row),actor=adapter.prepareActorData(source,skillContext());for(const [advantage,mode]of [[undefined,0],['normal',0],['adv',1],['dis',-1]]){const bonus=advantage?2.5:0;cases.push({formula:adapter.getRollData(actor,'skill','prc',advantage?{advantage,situationalBonus:'2.5'}:{})?.formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+5+bonus,mode,total:5,...(bonus?{bonus}:{}),initialCustomCase:row.id});}source.system.skills.prc.roll={min:10};cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc',{advantage:'normal'})?.formula,faces:[7],expected:15,mode:0,total:5,rangeBounds:{minimum:10,maximum:null},normalRangeInitialCustomCase:row.id});}
for(const row of finalCustomCases){const source=finalCustomSource(row),actor=adapter.prepareActorData(source,skillContext());for(const [advantage,mode]of [[undefined,0],['normal',0],['adv',1],['dis',-1]]){const bonus=advantage?2.5:0;cases.push({formula:adapter.getRollData(actor,'skill','prc',advantage?{advantage,situationalBonus:'2.5'}:{})?.formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+5+bonus,mode,total:5,...(bonus?{bonus}:{}),finalCustomCase:row.id});}source.system.skills.prc.roll={min:10};cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc',{advantage:'normal'})?.formula,faces:[7],expected:15,mode:0,total:5,rangeBounds:{minimum:10,maximum:null},normalRangeFinalCustomCase:row.id});}
for(const row of finalCiCases){const source=finalCiSource(row),actor=adapter.prepareActorData(source,skillContext()),e=row.expected;
 for(const [kind,key,selection,total,sourceMode]of [['skill','prc',{},e.skill,e.preparedMode],['tool','thief',{},e.skill,e.preparedMode],['skill','prc',{tool:'thief'},e.skill,e.combinedMode],['tool','thief',{skill:'prc',ability:'wis'},e.skill,e.combinedMode],['ability','wis',{},e.checkSave,e.preparedMode],['save','wis',{},e.checkSave,0],['initiative','initiative',{},e.initiative,e.preparedMode]])for(const manual of [undefined,'normal','adv','dis']){const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,bonus=manual?2.5:0;cases.push({formula:adapter.getRollData(actor,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2.5'}:{})})?.formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),finalCiCase:row.id});}
 const fixed=skillContext();fixed.world.settings['dnd5e.initiativeScore']={status:'world',value:'all'};cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,fixed),'initiative','initiative')?.formula,faces:[],expected:e.initiativeScore,mode:0,total:e.initiativeScore,fixed:true,fixedFinalCiCase:row.id});source.system.skills.prc.roll={min:10};cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc',{advantage:'normal'})?.formula,faces:[7],expected:10+e.skill,mode:0,total:e.skill,rangeBounds:{minimum:10,maximum:null},normalRangeFinalCiCase:row.id});
}
for(const row of finalTrainingCases){const source=finalTrainingSource(row),actor=adapter.prepareActorData(source,skillContext());for(const [advantage,mode]of [[undefined,0],['normal',0],['adv',1],['dis',-1]]){const bonus=advantage?2.5:0;cases.push({formula:adapter.getRollData(actor,'skill','prc',advantage?{advantage,situationalBonus:'2.5'}:{})?.formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+5+bonus,mode,total:5,...(bonus?{bonus}:{}),finalTrainingCase:row.id});}source.system.skills.prc.roll={min:10};cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc',{advantage:'normal'})?.formula,faces:[7],expected:15,mode:0,total:5,rangeBounds:{minimum:10,maximum:null},normalRangeFinalTrainingCase:row.id});}
for(const row of finalDefenseCases){const source=finalDefenseSource(row),actor=adapter.prepareActorData(source,skillContext());
 for(const [advantage,mode]of [[undefined,0],['normal',0],['adv',1],['dis',-1]]){const bonus=advantage?2.5:0;cases.push({formula:adapter.getRollData(actor,'skill','prc',advantage?{advantage,situationalBonus:'2.5'}:{})?.formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+5+bonus,mode,total:5,...(bonus?{bonus}:{}),finalDefenseCase:row.id});}
 source.system.skills.prc.roll={min:10};cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc',{advantage:'normal'})?.formula,faces:[7],expected:15,mode:0,total:5,rangeBounds:{minimum:10,maximum:null},normalRangeFinalDefenseCase:row.id});
}
for(const row of sourceFlagCases){const source=sourceFlagSource(row),actor=adapter.prepareActorData(source,skillContext()),e=row.expected;
 for(const [kind,key,selection,total,sourceMode]of [['skill','prc',{},e.skill,e.sourceMode],['tool','thief',{},e.tool,e.sourceMode],['skill','prc',{tool:'thief'},e.combined,e.combinedMode],['tool','thief',{skill:'prc',ability:'wis'},e.combined,e.combinedMode],['ability','wis',{},e.check,e.sourceMode],['save','wis',{},e.save,0],['initiative','initiative',{},e.initiative,e.sourceMode]])for(const manual of [undefined,'normal','adv','dis']){const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,bonus=manual?2.5:0;cases.push({formula:adapter.getRollData(actor,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2.5'}:{})})?.formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),sourceFlagCase:row.id});}
 const fixed=skillContext();fixed.world.settings['dnd5e.initiativeScore']={status:'world',value:'all'};cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,fixed),'initiative','initiative')?.formula,faces:[],expected:e.score,mode:0,total:e.score,fixed:true,fixedSourceFlagCase:row.id});source.system.skills.prc.roll.min=10;cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc',{advantage:'normal'})?.formula,faces:[7],expected:10+e.skill,mode:0,total:e.skill,rangeBounds:{minimum:10,maximum:null},normalRangeSourceFlagCase:row.id});
}
for(const row of finalNumberCases){const source=finalNumberSource(row),actor=adapter.prepareActorData(source,skillContext()),e=row.expected;
 for(const [name,kind,key,selection,sourceMode]of [['skill','skill','prc',{},0],['tool','tool','thief',{},0],['combined','skill','prc',{tool:'thief'},Number(e.automaticAdvantage)],['combined','tool','thief',{skill:'prc',ability:'wis'},Number(e.automaticAdvantage)],['wisCheck','ability','wis',{},0],['dexCheck','ability','dex',{},0],['strCheck','ability','str',{},0],['wisSave','save','wis',{},0],['dexSave','save','dex',{},0]])for(const manual of [undefined,'normal','adv','dis']){const total=e.rolls[name],mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,bonus=manual?2.5:0,formula=adapter.getRollData(actor,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2.5'}:{})})?.formula;cases.push({formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),finalNumberCase:row.id});}
 for(const tie of [false,true]){const context=skillContext();context.world.settings['dnd5e.initiativeDexTiebreaker']={status:'world',value:tie};const prepared=adapter.prepareActorData(source,context);for(const [advantage,mode]of [[undefined,0],['normal',0],['adv',1],['dis',-1]]){const total=tie?e.initiativeWithTie:2;cases.push({formula:adapter.getRollData(prepared,'initiative','initiative',advantage?{advantage}:{})?.formula,faces:mode===0?[7]:[3,18],expected:initiativeRollExpectedTotal(mode===1?18:mode===-1?3:7,2,tie?e.currentFields['abilities.dex.value']:0),mode,total,finalNumberInitiativeCase:row.id,tie});}}
 const fixed=skillContext();fixed.world.settings['dnd5e.initiativeScore']={status:'world',value:'all'};fixed.world.settings['dnd5e.initiativeDexTiebreaker']={status:'world',value:true};cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,fixed),'initiative','initiative')?.formula,faces:[],expected:12,mode:0,total:12,fixed:true,fixedFinalNumberCase:row.id});source.system.skills.prc.roll.min=10;cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc',{advantage:'normal'})?.formula,faces:[7],expected:10+e.rolls.skill,mode:0,total:e.rolls.skill,rangeBounds:{minimum:10,maximum:null},normalRangeFinalNumberCase:row.id});
}
for(const row of finalBonusCases){const source=finalBonusSource(row),actor=adapter.prepareActorData(source,skillContext()),e=row.expected;
 for(const [name,kind,key,selection,sourceMode]of [['skill','skill','prc',{},0],['tool','tool','thief',{},0],['combinedSkill','skill','prc',{tool:'thief'},1],['combinedTool','tool','thief',{skill:'prc',ability:'wis'},1],['alternateSkill','skill','prc',{ability:'dex'},0],['wisCheck','ability','wis',{},0],['dexCheck','ability','dex',{},0],['wisSave','save','wis',{},0],['dexSave','save','dex',{},0],['initiative','initiative','initiative',{},0]])for(const manual of [undefined,'normal','adv','dis']){const total=e.fresh[name],mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,bonus=manual?2.5:0,formula=adapter.getRollData(actor,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2.5'}:{})})?.formula;cases.push({formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),finalBonusCase:row.id});}
 source.system.skills.prc.roll.min=10;cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc',{advantage:'normal'})?.formula,faces:[7],expected:10+e.fresh.skill,mode:0,total:e.fresh.skill,rangeBounds:{minimum:10,maximum:null},normalRangeFinalBonusCase:row.id});const fixed=skillContext();fixed.world.settings['dnd5e.initiativeScore']={status:'world',value:'all'};cases.push({formula:adapter.getRollData(adapter.prepareActorData(finalBonusSource(row),fixed),'initiative','initiative')?.formula,faces:[],expected:e.initiativeScore,mode:0,total:e.initiativeScore,fixed:true,fixedFinalBonusCase:row.id});
}
for(const row of finalProficiencyCases){const source=finalProficiencySource(row),actor=adapter.prepareActorData(source,skillContext()),e=row.expected;
 for(const [kind,key,selection,total,sourceMode]of [['skill','prc',{},e.skill,e.mode],['tool','thief',{},e.tool,e.mode],['skill','prc',{tool:'thief',ability:'str'},e.combined-2,e.combinedMode],['tool','thief',{skill:'prc',ability:'wis'},e.combined,e.combinedMode],['ability','wis',{},e.check,e.mode],['save','wis',{},e.save,0]])for(const manual of [undefined,'normal','adv','dis']){
 const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,bonus=manual?-1.5:0,formula=adapter.getRollData(actor,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'-1.5'}:{})})?.formula;cases.push({formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),finalProficiencyCase:row.id});
 }
 source.system.skills.prc.roll.min=10;cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc',{advantage:'normal'})?.formula,faces:[7],expected:10+e.skill,mode:0,total:e.skill,rangeBounds:{minimum:10,maximum:null},normalRangeFinalProficiencyCase:row.id});
}
for(const row of finalModeCases){const e=row.expected,source=finalModeSource(row),actor=adapter.prepareActorData(source,skillContext());
 for(const [kind,key,selection,sourceMode,total]of [['skill','prc',{},e.skill,5],['tool','thief',{},e.tool,5],['skill','prc',{tool:'thief'},e.combinedSkill,5],['tool','thief',{skill:'prc',ability:'wis'},e.combinedTool,5],['ability','wis',{},e.wisCheck,2],['ability','dex',{},e.dexCheck,2],['save','wis',{},e.wisSave,2],['save','dex',{},e.dexSave,2],['initiative','initiative',{},e.initiative,2]])for(const manual of [undefined,'normal','adv','dis']){const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,bonus=manual?2:0,formula=adapter.getRollData(actor,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2'}:{})})?.formula;cases.push({formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),finalModeCase:row.id});}
 source.system.skills.prc.roll.min=10;cases.push({formula:adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc',{advantage:'normal'})?.formula,faces:[7],expected:15,mode:0,total:5,rangeBounds:{minimum:10,maximum:null},normalRangeFinalModeCase:row.id});const context=skillContext();context.world.settings['dnd5e.initiativeScore']={status:'world',value:'all'};cases.push({formula:adapter.getRollData(adapter.prepareActorData(finalModeSource(row),context),'initiative','initiative')?.formula,faces:[],expected:e.score,mode:0,total:e.score,fixed:true,fixedFinalModeCase:row.id});
}

for(const row of petrificationModeCases){const actor=adapter.prepareActorData(petrificationModeSource(row),skillContext());
 for(const [kind,key,selection,sourceMode,total]of [['skill','prc',{},row.mode,5],['tool','thief',{},row.toolMode,5],['skill','prc',{tool:'thief'},row.combinedMode,5],['tool','thief',{skill:'prc',ability:'wis'},row.combinedMode,5],['initiative','initiative',{},row.toolMode,2]])for(const manual of [undefined,'normal','adv','dis']){const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,bonus=manual?2:0,formula=adapter.getRollData(actor,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2'}:{})})?.formula;cases.push({formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),petrificationModeCase:row.id});}
}

for(const row of petrificationCases){
 const e=row.expected,source=petrificationSource(row),actor=adapter.prepareActorData(source,skillContext()),combined=e.checkMode===-1?0:1;
 for(const [kind,key,total,selection,sourceMode]of [['skill','prc',5,{},e.checkMode],['tool','thief',5,{},e.checkMode],['ability','wis',2,{},e.checkMode],['save','dex',2,{},0],['initiative','initiative',2,{},e.initMode],['skill','prc',5,{tool:'thief'},combined],['tool','thief',5,{skill:'prc',ability:'wis'},combined]])for(const manual of [undefined,'normal','adv','dis']){
 const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,bonus=manual?2:0,formula=adapter.getRollData(actor,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2'}:{})})?.formula;cases.push({formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),petrificationCase:row.id});}
 source.system.skills.prc.roll.min=10;const formula=adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc',{advantage:'normal'})?.formula;if(formula!=='1d20min10+5')throw Error('Petrification changed Normal bounds');cases.push({formula,faces:[7],expected:15,mode:0,total:5,rangeBounds:{minimum:10,maximum:null},normalRangePetrificationCase:row.id});const context=skillContext();context.world.settings['dnd5e.initiativeScore']={status:'world',value:'all'};cases.push({formula:adapter.getRollData(adapter.prepareActorData(petrificationSource(row),context),'initiative','initiative')?.formula,faces:[],expected:e.score,mode:0,total:e.score,fixed:true,fixedPetrificationCase:row.id});
}

for(const row of familyCases){
 const e=row.expected,source=familySource(row),actor=adapter.prepareActorData(source,skillContext());
 for(const [kind,key,total,selection,sourceMode]of [['save','dex',2,{},e.dexSave],['save','wis',2,{},e.wisSave],['ability','wis',2,{},e.skillMode],['skill','prc',5,{},e.skillMode],['tool','thief',5,{},e.skillMode],['initiative','initiative',2,{},e.init],['skill','prc',5,{tool:'thief'},e.combinedMode],['tool','thief',5,{skill:'prc',ability:'wis'},e.combinedMode]])for(const manual of [undefined,'normal','adv','dis']){
  const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,bonus=manual?2:0,formula=adapter.getRollData(actor,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2'}:{})})?.formula;
  cases.push({formula,faces:mode===0?[7]:[3,18],expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),conditionFamilyCase:row.id});
 }
 source.system.abilities.dex.save.roll.min=10;const formula=adapter.getRollData(adapter.prepareActorData(source,skillContext()),'save','dex',{advantage:'normal'})?.formula;if(formula!=='1d20min10+2')throw Error('Condition family changed Normal bounds');cases.push({formula,faces:[7],expected:12,mode:0,total:2,rangeBounds:{minimum:10,maximum:null},normalRangeConditionFamilyCase:row.id});
 const context=skillContext();context.world.settings['dnd5e.initiativeScore']={status:'world',value:'all'};const fixedFormula=adapter.getRollData(adapter.prepareActorData(familySource(row),context),'initiative','initiative')?.formula;cases.push({formula:fixedFormula,faces:[],expected:e.score,mode:0,total:e.score,fixed:true,fixedConditionFamilyCase:row.id});
}

for(const row of exhaustionCases){
 const e=row.expected,actor=exhaustionSource(row),prepared=adapter.prepareActorData(actor,skillContext());
 for(const [kind,key,total,selection,sourceMode]of [['skill','prc',5+e.reduction,{},e.mode],['tool','thief',5+e.reduction,{},e.toolMode],['ability','wis',2+e.reduction,{},e.checkMode],['save','wis',2+e.reduction,{},0],['skill','prc',5+e.reduction,{tool:'thief'},e.combinedSkillMode],['tool','thief',5+e.reduction,{skill:'prc',ability:'wis'},e.combinedToolMode]])for(const manual of [undefined,'normal','adv','dis']){
  const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,bonus=manual?2:0,faces=mode===0?[7]:[3,18],formula=adapter.getRollData(prepared,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2'}:{})})?.formula;
  cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),exhaustionCase:row.id});
 }
 actor.system.skills.prc.roll.min=10;const formula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'skill','prc',{advantage:'normal'})?.formula,total=5+e.reduction;if(formula!=='1d20min10'+(total<0?'':'+')+total)throw Error('Exhaustion normal bound changed');cases.push({formula,faces:[7],expected:10+total,mode:0,total,rangeBounds:{minimum:10,maximum:null},normalRangeExhaustionCase:row.id});
 for(const initMode of (row.modes?[0]:[-1,0,1]))for(const fixed of [false,true]){const context=skillContext();context.world.settings['dnd5e.initiativeScore']={status:'world',value:fixed?'all':'none'};const source=exhaustionSource(row);source.system.attributes.init={ability:'dex',roll:{mode:initMode}};const prepared=adapter.prepareActorData(source,context),inputs=[e.toolMode,initMode],mode=fixed?0:Number(inputs.includes(1))-Number(inputs.includes(-1)),total=fixed?12+e.reduction+5*initMode:2+e.reduction,formula=adapter.getRollData(prepared,'initiative','initiative')?.formula;cases.push({formula,faces:fixed?[]:mode===0?[7]:[3,18],expected:fixed?total:(mode===1?18:mode===-1?3:7)+total,mode,total,...(fixed?{fixed:true}:{}),exhaustionInitiativeCase:row.id});}
}

for(const row of conditionCases){
 const e=row.expected;if(!e)continue;const actor=conditionSource(row),prepared=adapter.prepareActorData(actor,skillContext());
 for(const [kind,key,total,selection,sourceMode]of [['skill','prc',e.skill,{},e.mode],['tool','thief',e.tool,{},e.toolMode],['ability','wis',e.check,{},e.checkMode],['save','wis',e.save,{},0],['skill','prc',e.combined,{tool:'thief'},e.combinedMode],['tool','thief',e.combined,{skill:'prc',ability:'wis'},e.combinedMode]])for(const manual of [undefined,'normal','adv','dis']){
  const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,bonus=manual?2:0,faces=mode===0?[7]:[3,18];
  const formula=adapter.getRollData(prepared,kind,key,{...selection,...(manual?{advantage:manual,situationalBonus:'2'}:{})})?.formula;
  cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),conditionCase:row.id});
 }
 actor.system.skills.prc.roll.min=10;const formula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'skill','prc',{advantage:'normal'})?.formula;
 if(formula!=='1d20min10+'+e.skill)throw Error('Condition source changed explicit normal bound semantics');
 cases.push({formula,faces:[7],expected:10+e.skill,mode:0,total:e.skill,rangeBounds:{minimum:10,maximum:null},normalRangeConditionCase:row.id});
}
for(const row of conditionFixture.initiativeCases){const actor=conditionSource(conditionCases[0]);actor.system.attributes.init={ability:'dex',roll:{mode:row.initMode}};const context=skillContext();context.world.settings['dnd5e.initiativeScore']={status:'world',value:row.scoreMode};context.world.settings['dnd5e.initiativeDexTiebreaker']={status:'world',value:row.tie};const formula=adapter.getRollData(adapter.prepareActorData(actor,context),'initiative','initiative')?.formula,faces=row.fixed?[]:row.mode===0?[7]:[3,18];cases.push({formula,faces,expected:row.fixed?row.rollBonus:((row.mode===0?7:3)+row.total)+(row.tie?.14:0),mode:row.mode,total:row.rollBonus,...(row.fixed?{fixed:true}:{}),conditionInitiativeCase:row.id});}


for(const row of proficiencyIndicatorCases){
 const prepared=adapter.prepareActorData(proficiencyIndicatorSource(row),skillContext());
 if(row.total!==null)for(const [choice,mode] of [['normal',0],['adv',1],['dis',-1]]){
  const formula=adapter.getRollData(prepared,'skill','prc',{advantage:choice})?.formula;
  if(row.bounded&&mode!==0){if(formula!==undefined)throw Error('Bounded mode readiness changed');continue;}
  const faces=mode===0?[7]:[3,18];cases.push({formula,faces,expected:(row.bounded?10:mode===1?18:mode===-1?3:7)+row.total,mode,total:row.total,...(row.bounded?{rangeBounds:{minimum:10,maximum:null}}:{}),indicatorCase:row.id});
 }
 for(const [choice,mode] of [['normal',0],['adv',1],['dis',-1]]){
  const formula=adapter.getRollData(prepared,'save','wis',{advantage:choice})?.formula,faces=mode===0?[7]:[3,18];
  cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+row.saveTotal,mode,total:row.saveTotal,indicatorCase:row.id+'/save'});
 }
}

for(const row of bonusEffectCases.filter(row=>row.expected)){
 const e=row.expected,prepared=adapter.prepareActorData(bonusEffectSource(row),skillContext());
 // These strings are independently specified and compared with pinned native
 // FormulaField methods, never derived from the module's numeric reduction.
 let candidate='1d20+('+row.expectedFormula+')';
 if(row.expectedFormula.startsWith('-(')){
  cases.push({formula:candidate,faces:[7],expectedRejection:true,nativeCandidateRejection:row.id});
  candidate='1d20+(0'+row.expectedFormula+')';
 }
 cases.push({formula:candidate,faces:[7],expected:7+row.expectedBonus,mode:0,total:row.expectedBonus,constantFormulaCase:row.id});
 for(const [kind,key,total,combined] of [['skill','prc',e.skill,false],['tool','thief',e.tool,false],['ability','wis',e.check,false],['save','wis',e.save,false],['skill','prc',e.combined,true],['tool','thief',e.combinedTool,true]])for(const manual of [undefined,'normal','adv','dis']){
  const options={...(combined?{ability:'wis',[kind==='skill'?'tool':'skill']:kind==='skill'?'thief':'prc'}:{}),...(manual?{advantage:manual,situationalBonus:'2'}:{})};
  const formula=adapter.getRollData(prepared,kind,key,options)?.formula,mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:combined?1:0,faces=mode===0?[7]:[3,18],bonus=manual?2:0;
  cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),bonusEffectCase:row.id});
 }
}

for(const row of modeEffectCases.filter(row=>row.expected)){
 const e=row.expected,prepared=adapter.prepareActorData(modeEffectSource(row),skillContext());
 for(const [kind,key,total,sourceMode,combined] of [['skill','prc',5,e.mode,false],['tool','thief',4,e.toolMode,false],['ability','wis',2,e.abilityMode,false],['save','wis',2,e.saveMode,false],['skill','prc',5,e.combinedMode,true],['tool','thief',5,e.combinedToolMode,true]])for(const manual of [undefined,'normal','adv','dis']){
  const options={...(combined?{ability:'wis',[kind==='skill'?'tool':'skill']:kind==='skill'?'thief':'prc'}:{}),...(manual?{advantage:manual,situationalBonus:'2'}:{})};
  const formula=adapter.getRollData(prepared,kind,key,options)?.formula,mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,faces=mode===0?[7]:[3,18],bonus=manual?2:0;
  cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),modeEffectCase:row.id});
 }
}

for(const row of defenseCases.filter(row=>row.expected.total!==null&&!row.executionUnavailable)){
 const e=row.expected,prepared=adapter.prepareActorData(defenseSource(row),defenseContext(row));
 const suffix=defenseRangeSuffix(row),scopes=Object.values(row.bounds??{}),minima=scopes.map(value=>value.min).filter(value=>typeof value==='number'),maxima=scopes.map(value=>value.max).filter(value=>typeof value==='number'),rangeBounds=suffix?{minimum:minima.length?Math.max(...minima):null,maximum:maxima.length?Math.min(...maxima):null}:undefined;
 for(const manual of e.fixed||suffix?[undefined,'normal']:[undefined,'normal','adv','dis']){
  const options=manual?{advantage:manual,...(!e.fixed?{situationalBonus:'2'}:{})}:{},formula=manual||suffix?adapter.getRollData(prepared,'initiative','initiative',options)?.formula:adapter.getInitiativeFormula(prepared),mode=e.fixed?0:manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:e.mode,faces=e.fixed?[]:mode===0?[7]:[3,18],bonus=manual&&!e.fixed?2:0;
  let selected=mode===1?18:mode===-1?3:7,contribution=selected;if(rangeBounds?.minimum!==null&&rangeBounds?.minimum!==undefined&&selected<rangeBounds.minimum)contribution=rangeBounds.minimum;if(rangeBounds?.maximum!==null&&rangeBounds?.maximum!==undefined&&selected>rangeBounds.maximum)contribution=rangeBounds.maximum;
  cases.push({formula,faces,expected:e.fixed?e.rollBonus:(contribution+e.total)+(row.settings?.tie ? .14 : 0)+bonus,mode,total:e.rollBonus,...(bonus?{bonus}:{}),...(rangeBounds?{rangeBounds}:{}),initiativeCase:row.id,fixed:e.fixed});
 }
 if(row.id==='tie-breaker')for(let face=1;face<=20;face++)cases.push({formula:adapter.getInitiativeFormula(prepared),faces:[face],expected:(face+e.total)+.14,mode:0,total:e.rollBonus,initiativeCase:'tie-all-faces'});
}
for(const row of equipmentCases.filter(row=>row.expected.skill!==null)){
 const e=row.expected,prepared=adapter.prepareActorData(equipmentSource(row),skillContext());
 const requests=[['skill','ste',e.skill,e.mode,{}],...(row.selected?[['skill','ste',5,0,{tool:'thief'}],['tool','thief',5,1,{skill:'ste'}],['skill','ste',6,-1,{ability:'wis'}]]:[])];
 for(const [kind,key,total,sourceMode,selection] of requests)for(const manual of [undefined,'normal','adv','dis']){
  const options={...selection,...(manual?{advantage:manual,situationalBonus:'2'}:{})},formula=adapter.getRollData(prepared,kind,key,options)?.formula,mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:sourceMode,faces=mode===0?[7]:[3,18],bonus=manual?2:0;
  cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,mode,total,...(bonus?{bonus}:{}),equipmentCase:row.id});
 }
}
for(const [family,rows,make] of [['numeric',numericEffectCases,numericEffectSource],['bonus',bonusEffectCases,bonusEffectSource],['mode',modeEffectCases,modeEffectSource]])for(const row of rows.filter(row=>row.expected)){
 const actor=make(row);actor.system.skills.prc.roll={...actor.system.skills.prc.roll,min:10};const total=row.expected.skill??5;
 const formula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'skill','prc',{advantage:'normal'})?.formula;
 if(formula!=='1d20min10'+(total<0?'':'+')+total)throw Error('Prepared effect/bound composition mismatch '+family+'/'+row.id);
 cases.push({formula,faces:[7],expected:10+total,mode:0,total,rangeBounds:{minimum:10,maximum:null},normalRangeEffectCase:family+'/'+row.id});
}
let previousRange,rangeFormula;
for(const row of normalRangeMatrix()){
 if(row.id!==previousRange){const actor=skillSource();setSkillRoll(actor,'skills.prc.roll',{min:row.minimum,max:row.maximum});rangeFormula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'skill','prc')?.formula;if(rangeFormula!==row.formula)throw Error('Normal range source formula mismatch '+row.id);previousRange=row.id;}
 cases.push({formula:rangeFormula,faces:row.faces,expected:row.total,mode:0,total:5,rangeBounds:{minimum:row.minimum,maximum:row.maximum},normalRangeMatrixCase:row.id});
}
for(const row of normalRangeCases)for(const sourceMode of [-1,0,1]){
 const prepared=adapter.prepareActorData(rangeSource(row,sourceMode),skillContext());
 if(sourceMode!==0&&adapter.getRollData(prepared,row.kind,row.key)!==null)throw Error('Unsupported bounded default executed');
 for(const advantage of ['adv','dis'])if(adapter.getRollData(prepared,row.kind,row.key,{advantage})!==null)throw Error('Unsupported bounded mode executed');
 const formula=adapter.getRollData(prepared,row.kind,row.key,{advantage:'normal',situationalBonus:'-1.5'})?.formula;if(formula!==row.formula+'+(-1.5)')throw Error('Bounded manual Normal mismatch '+row.id);
 cases.push({formula,faces:[7],expected:(row.field==='min'?10:7)+row.total-1.5,mode:0,total:row.total,bonus:-1.5,rangeBounds:{minimum:row.field==='min'?10:null,maximum:row.field==='max'?10:null},normalRangeScopeCase:row.id,sourceMode});
}
for(const kind of ['skill','tool']){
 const actor=toolSource();setSkillRoll(actor,kind==='skill'?'skills.prc.roll':'tools.thief.roll',{min:10});const prepared=adapter.prepareActorData(actor,skillContext()),key=kind==='skill'?'prc':'thief',selection={[kind==='skill'?'tool':'skill']:kind==='skill'?'thief':'prc'};
 if(adapter.getRollData(prepared,kind,key,selection)!==null)throw Error('Bounded automatic advantage executed');
 const formula=adapter.getRollData(prepared,kind,key,{...selection,advantage:'normal'})?.formula;if(formula!=='1d20min10+5')throw Error('Combined normal bounds mismatch');
 cases.push({formula,faces:[7],expected:15,mode:0,total:5,rangeBounds:{minimum:10,maximum:null},normalRangeSelectedCase:kind});
}
const tiedActor=rangeSource(normalRangeCases.find(row=>row.kind==='initiative'&&row.field==='min'));
const tieContext=skillContext();tieContext.world.settings['dnd5e.initiativeDexTiebreaker']={status:'world',value:true};
const tiedPrepared=adapter.prepareActorData(tiedActor,tieContext),tiedFormula=adapter.getRollData(tiedPrepared,'initiative','initiative')?.formula;if(tiedFormula!=='1d20min10+2+0.14')throw Error('Range/tiebreaker order mismatch');
for(let face=1;face<=20;face++)cases.push({formula:tiedFormula,faces:[face],expected:((face<10?10:face)+2)+.14,mode:0,total:2.14,rangeBounds:{minimum:10,maximum:null},normalRangeTieCase:true});
for(const shape of ['absent','empty','partial','existing-partial']){const source=skillSource();if(shape==='absent'){delete source.system.abilities;delete source.system.skills;}if(shape==='empty'){source.system.abilities={};source.system.skills={};}if(shape==='partial'){source.system.abilities={wis:{value:14}};source.system.skills={prc:{value:1,ability:'wis'}};}if(shape==='existing-partial'){source.system.abilities={wis:{}};source.system.skills={prc:{}};}source.system.tools={thief:{ability:'dex',value:1}};const actor=adapter.prepareActorData(source,skillContext());
 for(const [kind,key,total,choices]of [['skill','acr',0,{}],['skill','prc',shape==='partial'?5:0,{}],['tool','thief',3,{}],['save','dex',0,{}],['ability','wis',shape==='partial'?2:0,{}],['tool','thief',3,{skill:'prc',ability:'str'}]])for(const [advantage,mode]of [['normal',0],['adv',1],['dis',-1]])for(const bonus of [-1.5,2]){const formula=adapter.getRollData(actor,kind,key,{...choices,advantage,situationalBonus:String(bonus)})?.formula,faces=mode===0?[7]:[3,18];assert.ok(formula,'Source/default check remains executable');cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,total,mode,bonus,sourceDefaultCase:shape+'/'+kind+'/'+key});}}
{const actor=adapter.prepareActorData(formulaSource(),skillContext());for(const [kind,key,total,choices]of [['skill','prc',11,{}],['tool','thief',13,{}],['ability','wis',6,{}],['save','wis',2,{}],['skill','prc',11,{tool:'thief'}],['tool','thief',13,{skill:'prc'}],['tool','thief',12,{skill:'prc',ability:'str'}]])for(const [advantage,mode]of [['normal',0],['adv',1],['dis',-1]])for(const bonus of [-1.5,2]){const formula=adapter.getRollData(actor,kind,key,{...choices,advantage,situationalBonus:String(bonus)})?.formula,faces=mode===0?[7]:[3,18];assert.ok(formula);cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,total,mode,bonus,preparedFormulaCase:kind+'/'+key});}}
for(const level of [1,5,13,17,20]){const source=scaleSource606(level);source.system.skills.prc.roll.bonus='@scale.fighter.uses';const actor=adapter.prepareActorData(source,skillContext()),prof=Math.floor((level+7)/4),scale=level<5?2:level<13?3:level<17?0:6,total=2+prof+(prof-1)+scale+2;for(const [advantage,mode]of [['normal',0],['adv',1],['dis',-1]]){const formula=adapter.getRollData(actor,'skill','prc',{advantage})?.formula,faces=mode===0?[7]:[3,18];assert.ok(formula);cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total,total,mode,numericScaleCase:level});}}
for(const [coefficient,total]of [[0,8],[.5,7],[1,11],[2,17]]){const source=formulaSource();source.system.skills.prc.value=coefficient;const actor=adapter.prepareActorData(source,skillContext());for(const [advantage,mode]of [['normal',0],['adv',1],['dis',-1]]){const formula=adapter.getRollData(actor,'skill','prc',{advantage})?.formula,faces=mode===0?[7]:[3,18];assert.ok(formula);cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total,total,mode,formulaContextCase:coefficient});}}
for(const setting of ['none','normal','variant'])for(const statuses of [[],['heavilyEncumbered'],['exceedingCarryingCapacity']])for(const extra of ['none','poisoned','exhaustion','prone']){const source=encumbranceSource(statuses),id=setting+'/'+statuses.join(',')+'/'+extra;if(extra!=='none')source.effects.push({_id:'Extra',type:'condition',statuses:[extra],system:{type:extra,...(extra==='exhaustion'?{level:1}:{})}});const actor=adapter.prepareActorData(source,encumbranceContext(setting)),heavy=statuses.includes('heavilyEncumbered'),poisoned=extra==='poisoned',reduction=extra==='exhaustion'?-2:0,physicalMode=heavy||poisoned?-1:0;
 for(const [kind,key,total,defaultMode,choices]of [['skill','ath',reduction,physicalMode,{}],['skill','prc',5+reduction,poisoned?-1:0,{}],['tool','thief',5+reduction,physicalMode,{}],['save','dex',2+reduction,heavy?-1:0,{}],['ability','str',reduction,physicalMode,{}],['skill','prc',5+reduction,poisoned?0:1,{tool:'thief',ability:'wis'}],['tool','thief',3+reduction,heavy||poisoned?0:1,{skill:'prc',ability:'str'}]])for(const [advantage,manualMode]of [[undefined,undefined],['normal',0],['adv',1],['dis',-1]])for(const bonus of [-1.5,2]){const mode=manualMode??defaultMode,formula=adapter.getRollData(actor,kind,key,{...choices,...(advantage?{advantage}:{}),situationalBonus:String(bonus)})?.formula,faces=mode===0?[7]:[3,18];assert.ok(formula);cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,total,mode,bonus,encumbranceCase:id+'/'+kind+'/'+key});}
 source.system.skills.ath.roll={min:10};const bounded=adapter.prepareActorData(source,encumbranceContext(setting)),formula=adapter.getRollData(bounded,'skill','ath',{advantage:'normal'})?.formula;assert.ok(formula);cases.push({formula,faces:[7],expected:10+reduction,total:reduction,mode:0,rangeBounds:{minimum:10,maximum:null},encumbranceCase:id+'/normal-bound'});
}
for(const row of ruleCases){const actor=adapter.prepareActorData(ruleSource(row),ruleContext()),e=row.expected;for(const [manual,forced]of [[undefined,undefined],['normal',0],['adv',1],['dis',-1]]){const mode=forced??e.mode;if((e.minimum||e.maximum)&&mode!==0)continue;const formula=adapter.getRollData(actor,'skill','prc',{...(manual?{advantage:manual}:{}),situationalBonus:'2'})?.formula,faces=mode===0?[7]:[3,18],kept=mode===1?18:mode===-1?3:Math.min(e.maximum??20,Math.max(e.minimum??1,7));assert.ok(formula);cases.push({formula,faces,expected:kept+e.skill+2,total:e.skill,mode,bonus:2,...(e.minimum||e.maximum?{rangeBounds:{minimum:e.minimum??null,maximum:e.maximum??null}}:{}),appliedRuleCase:row.id});}}
for(const row of readFlagCases){const actor=adapter.prepareActorData(readFlagSource(row),readFlagContext()),e=row.expected,combinedMode=e.skillProf>0&&e.toolProf>0?1:0;for(const [kind,key,total,defaultMode,choices]of [['skill','prc',e.skill,0,{}],['tool','thief',e.tool,0,{}],['skill','ath',e.ath,row.flags.remarkableAthlete?1:0,{}],['save','wis',e.save,0,{}],['ability','wis',e.ability,0,{}],['initiative','initiative',e.initiative,row.flags.remarkableAthlete?1:0,{}],['skill','prc',e.combined,combinedMode,{tool:'thief'}],['tool','thief',e.combined,combinedMode,{skill:'prc'}]])for(const [manual,forced]of [[undefined,undefined],['normal',0],['adv',1],['dis',-1]]){const mode=forced??defaultMode,bonus=manual?2:0,formula=adapter.getRollData(actor,kind,key,{...choices,...(manual?{advantage:manual,situationalBonus:'2'}:{})})?.formula,faces=mode===0?[7]:[3,18];assert.ok(formula);cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,total,mode,bonus,readFlagCase:row.id+'/'+kind});}}
for(const [index,row]of remainingFlags.reliable.entries()){const actor=adapter.prepareActorData(reliableSource(row),remainingFlagContext()),key=row.kind==='skill'?'prc':'thief',formula=adapter.getRollData(actor,row.kind,key,{...reliableOptions(row),advantage:'normal'})?.formula;assert.ok(formula);for(let face=1;face<=20;face++){let kept=row.expectedMin!==null&&face<row.expectedMin?row.expectedMin:face;if(row.expectedMax!==null&&face>row.expectedMax)kept=row.expectedMax;cases.push({formula,faces:[face],expected:kept+row.total,total:row.total,mode:0,...(row.expectedMin!==null||row.expectedMax!==null?{rangeBounds:{minimum:row.expectedMin,maximum:row.expectedMax}}:{}),reliableTalentCase:'source/'+index});}}
for(const [index,row]of remainingFlags.finalCases.entries()){const source=remainingFlagSource({reliableTalent:true},row.coefficient),key=row.kind==='skill'?'prc':'thief';source.effects=[{_id:'FinalPrimary',system:{changes:[{key:'system.'+row.kind+'s.'+key+'.value',type:'override',value:row.currentValue,phase:'final'}]}}];const actor=adapter.prepareActorData(source,remainingFlagContext()),formula=adapter.getRollData(actor,row.kind,key,{...(row.selected?(row.kind==='skill'?{tool:'thief'}:{skill:'prc'}):{}),advantage:'normal'})?.formula;assert.ok(formula);for(let face=1;face<=20;face++){const kept=row.expectedMin!==null&&face<row.expectedMin?row.expectedMin:face;cases.push({formula,faces:[face],expected:kept+row.total,total:row.total,mode:0,...(row.expectedMin!==null?{rangeBounds:{minimum:row.expectedMin,maximum:null}}:{}),reliableTalentCase:'final/'+index});}}
// Frozen independent expectations from native-flag-effects-oracle,not module totals.
for(const row of flagEffectCases.filter(row=>row.sourceValue==='absent'&&row.raw===true&&row.type==='override')){const actor=adapter.prepareActorData(flagEffectSource(row),flagEffectContext());for(const [kind,key,total]of [['skill','prc',row.expected.currentSkill],['tool','thief',row.expected.currentTool]]){const formula=adapter.getRollData(actor,kind,key,{advantage:'normal'})?.formula;if(row.expected.halflingBlocked){assert.equal(formula,undefined);continue;}assert.ok(formula);for(let face=1;face<=20;face++){const minimum=kind==='tool'&&row.expected.toolTalent?10:null;cases.push({formula,faces:[face],expected:(minimum!==null?Math.max(face,minimum):face)+total,total,mode:0,...(minimum!==null?{rangeBounds:{minimum,maximum:null}}:{}),flagEffectCase:row.key+'/'+row.phase+'/'+kind});}}}
for(const [flag,kind,key,total]of [['jackOfAllTrades','skill','prc',3],['toolExpertise','tool','thief',8],['remarkableAthlete','skill','ath',2]]){const row=flagEffectCases.find(row=>row.key===flag&&row.phase===(flag==='remarkableAthlete'?'initial':'final')&&row.sourceValue==='absent'&&row.raw===true&&row.type==='override'),actor=adapter.prepareActorData(flagEffectSource(row),flagEffectContext());for(const [advantage,mode]of [['adv',1],['dis',-1]]){const formula=adapter.getRollData(actor,kind,key,{advantage})?.formula;assert.ok(formula);for(let first=1;first<=20;first++)for(let second=1;second<=20;second++)cases.push({formula,faces:[first,second],expected:(mode===1?Math.max(first,second):Math.min(first,second))+total,total,mode,flagEffectCase:flag+'/'+advantage});}}
for(const [index,row]of formulaEffectCases.entries()){const actor=adapter.prepareActorData(formulaEffectSource(row),formulaEffectContext());for(const [advantage,mode,faces]of [['normal',0,[7]],['adv',1,[3,18]],['dis',-1,[3,18]]]){const formula=adapter.getRollData(actor,'skill','prc',{advantage,situationalBonus:'2'})?.formula;assert.ok(formula);cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+row.current+2,total:row.current,bonus:2,mode,formulaEffectCase:index});}}
for(const row of formulaEffectCases.filter(row=>row.source==='@prof + 1'&&row.raw==='2'&&row.type==='multiply'&&[.5,2].includes(row.coefficient))){const actor=adapter.prepareActorData(formulaEffectSource(row),formulaEffectContext());for(const [advantage,mode]of [['normal',0],['adv',1],['dis',-1]]){const formula=adapter.getRollData(actor,'skill','prc',{advantage})?.formula;assert.ok(formula);for(let first=1;first<=20;first++)for(let second=1;second<=(mode===0?1:20);second++)cases.push({formula,faces:mode===0?[first]:[first,second],expected:(mode===1?Math.max(first,second):mode===-1?Math.min(first,second):first)+row.current,total:row.current,mode,formulaEffectCase:'distribution'});}const bounded=formulaEffectSource(row);bounded.system.skills.prc.roll.min=10;const formula=adapter.getRollData(adapter.prepareActorData(bounded,formulaEffectContext()),'skill','prc',{advantage:'normal'})?.formula;assert.ok(formula);for(let face=1;face<=20;face++)cases.push({formula,faces:[face],expected:Math.max(10,face)+row.current,total:row.current,mode:0,rangeBounds:{minimum:10,maximum:null},formulaEffectCase:'bounds'});}
for(const [index,row]of baseProficiencyCases.entries()){const actor=adapter.prepareActorData(baseProficiencySource(row),baseProficiencyContext());for(const [kind,key,total]of [['skill','prc',row.expected.current],['tool','thief',row.expected.tool],['ability','wis',row.expected.ability],['save','wis',row.expected.save]])for(const [advantage,mode,faces]of [['normal',0,[7]],['adv',1,[3,18]],['dis',-1,[3,18]]]){const formula=adapter.getRollData(actor,kind,key,{advantage,situationalBonus:'2'})?.formula;assert.ok(formula);cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+2,total,bonus:2,mode,baseProficiencyCase:index});}}
for(const row of baseProficiencyCases.filter(row=>row.type==='add'&&row.raw===1&&row.phase==='final'&&[.5,2].includes(row.coefficient)))for(const [kind,key,total]of [['skill','prc',row.expected.current],['tool','thief',row.expected.tool],['ability','wis',row.expected.ability],['save','wis',row.expected.save]]){const actor=adapter.prepareActorData(baseProficiencySource(row),baseProficiencyContext());for(const [advantage,mode]of [['normal',0],['adv',1],['dis',-1]]){const formula=adapter.getRollData(actor,kind,key,{advantage})?.formula;assert.ok(formula);for(let first=1;first<=20;first++)for(let second=1;second<=(mode===0?1:20);second++)cases.push({formula,faces:mode===0?[first]:[first,second],expected:(mode===1?Math.max(first,second):mode===-1?Math.min(first,second):first)+total,total,mode,baseProficiencyCase:'distribution'});}const bounded=baseProficiencySource(row),path=kind==='skill'?'skills.prc.roll':kind==='tool'?'tools.thief.roll':kind==='ability'?'abilities.wis.check.roll':'abilities.wis.save.roll';setSkillRoll(bounded,path,{min:10});const formula=adapter.getRollData(adapter.prepareActorData(bounded,baseProficiencyContext()),kind,key,{advantage:'normal'})?.formula;assert.ok(formula);for(let face=1;face<=20;face++)cases.push({formula,faces:[face],expected:Math.max(10,face)+total,total,mode:0,rangeBounds:{minimum:10,maximum:null},baseProficiencyCase:'bounds'});}
for(const [index,row]of equippableFinalCases.entries()){const actor=adapter.prepareActorData(equippableFinalSource(row),equippableFinalContext()),total=2+row.expected.currentBase;for(const [advantage,mode,faces]of [['normal',0,[7]],['adv',1,[3,18]],['dis',-1,[3,18]]]){const formula=adapter.getRollData(actor,'skill','prc',{advantage,situationalBonus:'2'})?.formula;assert.ok(formula);cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+2,total,bonus:2,mode,equippableFinalCase:index});}}
const equippableDistributions=[equippableFinalCases.find(row=>row.type==='tool'&&row.phase==='initial'&&!row.source.properties.length&&row.source.attunement==='required'&&!row.source.attuned&&row.source.equipped),equippableFinalCases.find(row=>row.type==='tool'&&row.phase==='final'&&!row.source.properties.length&&row.source.attunement==='required'&&!row.source.attuned&&row.source.equipped),equippableFinalCases.find(row=>row.type==='equipment'&&row.phase==='initial'&&row.source.properties.length&&row.source.attunement==='required'&&row.source.attuned&&row.source.equipped),equippableFinalCases.find(row=>row.type==='consumable'&&row.phase==='final'&&row.source.properties.length&&row.source.attunement==='optional'&&row.source.attuned&&!row.source.equipped)];
for(const row of equippableDistributions){assert.ok(row);const actor=adapter.prepareActorData(equippableFinalSource(row),equippableFinalContext()),total=2+row.expected.currentBase;for(const [advantage,mode]of [['normal',0],['adv',1],['dis',-1]]){const formula=adapter.getRollData(actor,'skill','prc',{advantage})?.formula;assert.ok(formula);for(let first=1;first<=20;first++)for(let second=1;second<=(mode===0?1:20);second++)cases.push({formula,faces:mode===0?[first]:[first,second],expected:(mode===1?Math.max(first,second):mode===-1?Math.min(first,second):first)+total,total,mode,equippableFinalCase:'distribution'});}const bounded=equippableFinalSource(row);setSkillRoll(bounded,'skills.prc.roll',{min:10});const formula=adapter.getRollData(adapter.prepareActorData(bounded,equippableFinalContext()),'skill','prc',{advantage:'normal'})?.formula;assert.ok(formula);for(let face=1;face<=20;face++)cases.push({formula,faces:[face],expected:Math.max(10,face)+total,total,mode:0,rangeBounds:{minimum:10,maximum:null},equippableFinalCase:'bounds'});}
for(const row of scalarNumberCases.filter(row=>row.path==='attributes.ac.cover')){const actor=adapter.prepareActorData(scalarPhaseSource(row),scalarPhaseContext()),total=row.expectedCurrentSave;for(const [advantage,mode]of [['normal',0],['adv',1],['dis',-1]])for(const bonus of [-1.5,2]){const formula=adapter.getRollData(actor,'save','dex',{advantage,situationalBonus:String(bonus)})?.formula,faces=mode===0?[7]:[3,18];assert.ok(formula);cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+total+bonus,total,mode,bonus,scalarPhaseCase:row.phase+'/'+row.type+'/'+row.delta});}}
for(const phase of ['initial','final']){const row=scalarNumberCases.find(row=>row.path==='attributes.ac.cover'&&row.phase===phase&&row.type===(phase==='initial'?'multiply':'subtract')&&row.delta===2),source=scalarPhaseSource(row),actor=adapter.prepareActorData(source,scalarPhaseContext()),total=row.expectedCurrentSave;for(const [advantage,mode]of [['normal',0],['adv',1],['dis',-1]]){const formula=adapter.getRollData(actor,'save','dex',{advantage})?.formula;assert.ok(formula);for(let a=1;a<=20;a++)for(let b=1;b<=(mode===0?1:20);b++)cases.push({formula,faces:mode===0?[a]:[a,b],expected:(mode===1?Math.max(a,b):mode===-1?Math.min(a,b):a)+total,total,mode,scalarPhaseCase:'distribution/'+phase});}setSkillRoll(source,'abilities.dex.save.roll',{min:10});const formula=adapter.getRollData(adapter.prepareActorData(source,scalarPhaseContext()),'save','dex',{advantage:'normal'})?.formula;assert.ok(formula);for(let a=1;a<=20;a++)cases.push({formula,faces:[a],expected:Math.max(a,10)+total,total,mode:0,rangeBounds:{minimum:10,maximum:null},scalarPhaseCase:'bounds/'+phase});}
process.stdout.write(JSON.stringify(cases));`);
    // Keep the synthetic transport's event loop responsive during the growing
    // source-preparation matrix. No synchronous child blocks socket heartbeats.
    const generated=await new Promise((resolve,reject)=>{const processCase=spawn(process.execPath,[join(core,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',join(core,'tsconfig.json'),driver],{cwd:root,env:{PATH:process.env.PATH}});let stdout='',stderr='';processCase.stdout.on('data',part=>{stdout+=part;if(stdout.length>96*1024*1024){processCase.kill();reject(new Error('Case fixture exceeds96MiB'));}});processCase.stderr.on('data',part=>stderr+=part);processCase.on('error',reject);processCase.on('close',status=>resolve({status,stdout,stderr}));});
    if(generated.error)throw generated.error;
    assert.equal(generated.status,0,generated.stderr);let cases=JSON.parse(generated.stdout);
    assert.equal(cases.filter(row=>row.trainingEffectCase).length,576,'24 training field cases exercise six requests/four manual selections');
    assert.equal(cases.filter(row=>row.normalRangeTrainingEffectCase).length,24,'Every supported training field case preserves normal bounds');
    assert.equal(cases.filter(row=>row.constantFilterCase).length,864,'36 constant/initial filter workflows exercise six requests/four manual selections');
    assert.equal(cases.filter(row=>row.normalRangeFilterCase).length,36,'Every qualified filter workflow preserves normal bounds');
    assert.equal(cases.filter(row=>row.initialFilterCase).length,792,'33 initial-field workflows including C76 missing-score initialization exercise six requests/four manual choices');
    assert.equal(cases.filter(row=>row.normalRangeInitialFilterCase).length,33,'All initial-field workflows preserve normal bounds');
    assert.equal(cases.filter(row=>row.initialCollectionFilterCase).length,1416,'59 initial collection workflows exercise six requests/four choices');
    assert.equal(cases.filter(row=>row.normalRangeInitialCollectionFilterCase).length,59,'Every collection workflow preserves normal bounds');
    assert.equal(cases.filter(row=>row.initialClassFilterCase).length,744,'31 initial class workflows including C78 default1 exercise six requests/four choices');
    assert.equal(cases.filter(row=>row.normalRangeInitialClassFilterCase).length,31,'All class workflows preserve normal bounds');
    assert.equal(cases.filter(row=>row.conditionCase).length,3000,'125 condition workflows/six requests/four choices');
    assert.equal(cases.filter(row=>row.normalRangeConditionCase).length,125,'All conditions preserve explicit normal bounds');
    assert.equal(cases.filter(row=>row.historicalInitialCustom).length,1);
    assert.equal(cases.filter(row=>row.conditionCustomCase).length,442*28);assert.equal(cases.filter(row=>row.fixedConditionCustomCase).length,442);assert.equal(cases.filter(row=>row.normalRangeConditionCustomCase).length,442);
    assert.equal(cases.filter(row=>row.featCustomCase).length,434*24);assert.equal(cases.filter(row=>row.normalRangeFeatCustomCase).length,434);
    assert.equal(cases.filter(row=>row.itemCustomCase).length,686*24);assert.equal(cases.filter(row=>row.normalRangeItemCustomCase).length,686);
    assert.equal(cases.filter(row=>row.initialCustomCase).length,238*4);assert.equal(cases.filter(row=>row.normalRangeInitialCustomCase).length,238);
    assert.equal(cases.filter(row=>row.finalCustomCase).length,217*4);assert.equal(cases.filter(row=>row.normalRangeFinalCustomCase).length,217);
    assert.equal(cases.filter(row=>row.finalCiCase).length,168*28);assert.equal(cases.filter(row=>row.fixedFinalCiCase).length,168);assert.equal(cases.filter(row=>row.normalRangeFinalCiCase).length,168);
    assert.equal(cases.filter(row=>row.finalTrainingCase).length,90*4);assert.equal(cases.filter(row=>row.normalRangeFinalTrainingCase).length,90);
    assert.equal(cases.filter(row=>row.finalDefenseCase).length,196*4);assert.equal(cases.filter(row=>row.normalRangeFinalDefenseCase).length,196);
    assert.equal(cases.filter(row=>row.sourceFlagCase).length,864*28);assert.equal(cases.filter(row=>row.fixedSourceFlagCase).length,864);assert.equal(cases.filter(row=>row.normalRangeSourceFlagCase).length,864);
    assert.equal(cases.filter(row=>row.finalNumberCase).length,1300*36);assert.equal(cases.filter(row=>row.finalNumberInitiativeCase).length,1300*8);assert.equal(cases.filter(row=>row.fixedFinalNumberCase).length,1300);assert.equal(cases.filter(row=>row.normalRangeFinalNumberCase).length,1300);
    assert.equal(cases.filter(row=>row.finalBonusCase).length,576*40);assert.equal(cases.filter(row=>row.normalRangeFinalBonusCase).length,576);assert.equal(cases.filter(row=>row.fixedFinalBonusCase).length,576);
    assert.equal(cases.filter(row=>row.finalProficiencyCase).length,852*24,'All final proficiency workflows/six requests/four choices');
    assert.equal(cases.filter(row=>row.normalRangeFinalProficiencyCase).length,852);
    assert.equal(cases.filter(row=>row.sourceDefaultCase).length,144,'4 source shapes/6 requests/3 modes/2 bonuses');
    assert.equal(cases.filter(row=>row.preparedFormulaCase).length,42);
    assert.equal(cases.filter(row=>row.numericScaleCase!==undefined).length,15);
    assert.equal(cases.filter(row=>row.encumbranceCase).length,2052);assert.equal(cases.filter(row=>row.appliedRuleCase).length,64);assert.equal(cases.filter(row=>row.readFlagCase).length,10240);assert.equal(cases.filter(row=>row.reliableTalentCase).length,4160);assert.equal(cases.filter(row=>row.equippableFinalCase!==undefined).length,4080);assert.equal(cases.filter(row=>row.baseProficiencyCase!==undefined).length,15744);assert.equal(cases.filter(row=>row.formulaEffectCase!==undefined).length,6240);assert.equal(cases.filter(row=>row.flagEffectCase).length,3440);assert.equal(cases.filter(row=>row.scalarPhaseCase).length,1896);const generatedCaseCount=cases.length;
    if(process.argv.includes('--dependency-profile'))cases=cases.filter((row,index)=>index<820||row.scalarPhaseCase||row.encumbranceCase||row.appliedRuleCase||row.readFlagCase||row.reliableTalentCase||row.flagEffectCase||row.formulaEffectCase!==undefined||row.baseProficiencyCase!==undefined||row.equippableFinalCase!==undefined||row.normalRangeMatrixCase||row.expectedRejection||row.formulaContextCase!==undefined||row.numericScaleCase!==undefined||row.preparedFormulaCase||row.sourceDefaultCase||row.initialClassFilterCase==='missing-class-level'||row.normalRangeInitialClassFilterCase==='missing-class-level');
    const payload={results:[]};
    for(let start=0;start<cases.length;start+=128){const response=await fetch(origin+'/api/modules/q00/probe',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify({cases:cases.slice(start,start+128)})});const batch=await response.json();assert.equal(response.status,200,JSON.stringify(batch));assert.equal(batch.failure,undefined,JSON.stringify(batch.failure));assert.equal(batch.results.length,Math.min(128,cases.length-start));payload.results.push(...batch.results);}
    writeFileSync(join(root,'observed.json'),JSON.stringify(payload,null,2));
    const normalLookup=new Map(normalRangeMatrix().map(row=>[[row.minimum,row.maximum,row.faces[0]].join('/'),row]));
    const selectionMismatches=[],candidateRejections=[];
    const histogram={adv:Array(20).fill(0),dis:Array(20).fill(0)},normalHistogram={},normalExpectedHistogram={};
    for(const row of normalRangeMatrix()){const group=normalExpectedHistogram[row.id]??={};group[row.total]=(group[row.total]??0)+1;}
    for(let i=0;i<cases.length;i++){
        if(cases[i].expectedRejection){assert.equal(cases[i].formula,'1d20+(-(3))');assert.match(payload.results[i].rejected,/Invalid or unsupported dice formula/);assert.equal(payload.results[i].remaining,1);candidateRejections.push({formula:cases[i].formula,message:payload.results[i].rejected,adaptation:'Known constant operation compiles to numeric -3; binary-zero expression separately qualified'});continue;}
        const row=cases[i], observed=payload.results[i];
        assert.equal(observed.remaining,0);assert.equal(observed.total,row.expected);
        assert.equal(observed.author,'fixtureplayer');
        if(row.fixed){
            const serialized=JSON.parse(observed.rolls[0]);assert.match(row.formula,/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/);assert.equal(row.faces.length,0);assert.equal(serialized.formula,row.formula);assert.equal(serialized.total,row.expected);
            assert.equal([...(serialized.terms??[]),...(serialized.dice??[])].filter(term=>term.class==='Die'||term.class==='RollGroup').length,0);continue;
        }
        if(row.rangeBounds){const expected=normalLookup.get([row.rangeBounds.minimum,row.rangeBounds.maximum,row.faces[0]].join('/'));assert.ok(expected);verifyRange(JSON.parse(observed.rolls[0]),{...expected,formula:row.formula,total:row.expected});if(row.normalRangeMatrixCase){const group=normalHistogram[row.normalRangeMatrixCase]??={};group[observed.total]=(group[observed.total]??0)+1;}continue;}
        const serialized=JSON.parse(observed.rolls[0]), die=serialized.terms.find(term=>term.class==='Die') ?? serialized.dice.find(term=>term.class==='Die');
        assert.equal(serialized.total,row.expected);assert.equal(serialized.formula,row.formula);
        assert.deepEqual(die.results.map(result=>result.result),row.faces);
        const diagnostic=verifyPlainD20(serialized,row);
        if(diagnostic)selectionMismatches.push({case:i,...diagnostic});
        const selected=row.mode===1?Math.max(...row.faces):row.mode===-1?Math.min(...row.faces):row.faces[0];
        if(i<800)histogram[row.mode===1?'adv':'dis'][selected-1]++;
    }
    assert.deepEqual(normalHistogram,normalExpectedHistogram,'441 complete normal range distributions');
    assert.deepEqual(histogram.adv,Array.from({length:20},(_,i)=>2*i+1));
    assert.deepEqual(histogram.dis,Array.from({length:20},(_,i)=>39-2*i));
    const invalid=await fetch(origin+'/api/modules/q00/probe',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify({cases:[{formula:'1d20+1000000001',faces:[1]}]})});
    assert.ok(invalid.status>=400,'Host numeric literal bound rejects without fallback');
    assert.deepEqual(writes,[],'Silent rolls dispatch no synthetic native writes/chat');
    writeFileSync(join(root,'evidence.json'),JSON.stringify({evidence:'Isolated real public host SDK silent rolls; synthetic transport/auth and controlled dependency entropy, not native/operator acceptance',result:'qualified-plain-d20-numeric-profile',equalIndexDiagnostics:selectionMismatches,selectionMismatches,coreVersion,coreCommit,scalarPhaseCases:cases.filter(row=>row.scalarPhaseCase).length,equippableFinalCases:cases.filter(row=>row.equippableFinalCase!==undefined).length,baseProficiencyCases:cases.filter(row=>row.baseProficiencyCase!==undefined).length,formulaEffectCases:cases.filter(row=>row.formulaEffectCase!==undefined).length,flagEffectCases:cases.filter(row=>row.flagEffectCase).length,reliableTalentCases:cases.filter(row=>row.reliableTalentCase).length,readFlagCases:cases.filter(row=>row.readFlagCase).length,appliedRuleCases:cases.filter(row=>row.appliedRuleCase).length,encumbranceCases:cases.filter(row=>row.encumbranceCase).length,formulaContextCases:cases.filter(row=>row.formulaContextCase!==undefined).length,generatedCaseCount,executionProfile:process.argv.includes('--dependency-profile')?'dependency-profile':'full',numericScaleCases:cases.filter(row=>row.numericScaleCase!==undefined).length,preparedFormulaCases:cases.filter(row=>row.preparedFormulaCase).length,sourceDefaultCases:cases.filter(row=>row.sourceDefaultCase).length,featCustomCases:cases.filter(row=>row.featCustomCase).length,normalRangeFeatCustomCases:cases.filter(row=>row.normalRangeFeatCustomCase).length,itemCustomCases:cases.filter(row=>row.itemCustomCase).length,normalRangeItemCustomCases:cases.filter(row=>row.normalRangeItemCustomCase).length,conditionCustomCases:cases.filter(row=>row.conditionCustomCase).length,fixedConditionCustomCases:cases.filter(row=>row.fixedConditionCustomCase).length,normalRangeConditionCustomCases:cases.filter(row=>row.normalRangeConditionCustomCase).length,initialCustomCases:cases.filter(row=>row.initialCustomCase).length,normalRangeInitialCustomCases:cases.filter(row=>row.normalRangeInitialCustomCase).length,finalCustomCases:cases.filter(row=>row.finalCustomCase).length,normalRangeFinalCustomCases:cases.filter(row=>row.normalRangeFinalCustomCase).length,finalCiCases:cases.filter(row=>row.finalCiCase).length,fixedFinalCiCases:cases.filter(row=>row.fixedFinalCiCase).length,normalRangeFinalCiCases:cases.filter(row=>row.normalRangeFinalCiCase).length,finalTrainingCases:cases.filter(row=>row.finalTrainingCase).length,normalRangeFinalTrainingCases:cases.filter(row=>row.normalRangeFinalTrainingCase).length,finalDefenseCases:cases.filter(row=>row.finalDefenseCase).length,normalRangeFinalDefenseCases:cases.filter(row=>row.normalRangeFinalDefenseCase).length,sourceFlagCases:cases.filter(row=>row.sourceFlagCase).length,sourceFlagFixedCases:cases.filter(row=>row.fixedSourceFlagCase).length,sourceFlagNormalBoundCases:cases.filter(row=>row.normalRangeSourceFlagCase).length,finalNumberCases:cases.filter(row=>row.finalNumberCase).length,finalNumberInitiativeCases:cases.filter(row=>row.finalNumberInitiativeCase).length,fixedFinalNumberCases:cases.filter(row=>row.fixedFinalNumberCase).length,normalRangeFinalNumberCases:cases.filter(row=>row.normalRangeFinalNumberCase).length,finalBonusCases:cases.filter(row=>row.finalBonusCase).length,normalRangeFinalBonusCases:cases.filter(row=>row.normalRangeFinalBonusCase).length,fixedFinalBonusCases:cases.filter(row=>row.fixedFinalBonusCase).length,finalProficiencyCases:cases.filter(row=>row.finalProficiencyCase).length,normalRangeFinalProficiencyCases:cases.filter(row=>row.normalRangeFinalProficiencyCase).length,caseCount:cases.length-candidateRejections.length,requestCount:cases.length,candidateRejections,controlledPairs:800,normalFaces:20,sourceModeCases:81,manualModeCases:18,toolCases:cases.filter(row=>row.toolCase).length,selectedCases:cases.filter(row=>row.selectedCase).length,effectCases:cases.filter(row=>row.effectCase).length,numericEffectCases:cases.filter(row=>row.numericEffectCase).length,itemEffectCases:cases.filter(row=>row.itemEffectCase).length,traitEffectCases:cases.filter(row=>row.traitEffectCase).length,trainingEffectCases:cases.filter(row=>row.trainingEffectCase).length,constantFilterCases:cases.filter(row=>row.constantFilterCase).length,initialFilterCases:cases.filter(row=>row.initialFilterCase).length,finalModeCases:cases.filter(row=>row.finalModeCase).length,normalRangeFinalModeCases:cases.filter(row=>row.normalRangeFinalModeCase).length,fixedFinalModeCases:cases.filter(row=>row.fixedFinalModeCase).length,petrificationModeCases:cases.filter(row=>row.petrificationModeCase).length,petrificationCases:cases.filter(row=>row.petrificationCase).length,normalRangePetrificationCases:cases.filter(row=>row.normalRangePetrificationCase).length,fixedPetrificationCases:cases.filter(row=>row.fixedPetrificationCase).length,conditionFamilyCases:cases.filter(row=>row.conditionFamilyCase).length,normalRangeConditionFamilyCases:cases.filter(row=>row.normalRangeConditionFamilyCase).length,fixedConditionFamilyCases:cases.filter(row=>row.fixedConditionFamilyCase).length,exhaustionCases:cases.filter(row=>row.exhaustionCase).length,normalRangeExhaustionCases:cases.filter(row=>row.normalRangeExhaustionCase).length,exhaustionInitiativeCases:cases.filter(row=>row.exhaustionInitiativeCase).length,conditionCases:cases.filter(row=>row.conditionCase).length,normalRangeConditionCases:cases.filter(row=>row.normalRangeConditionCase).length,conditionInitiativeCases:cases.filter(row=>row.conditionInitiativeCase).length,initialClassFilterCases:cases.filter(row=>row.initialClassFilterCase).length,normalRangeInitialClassFilterCases:cases.filter(row=>row.normalRangeInitialClassFilterCase).length,initialCollectionFilterCases:cases.filter(row=>row.initialCollectionFilterCase).length,normalRangeInitialCollectionFilterCases:cases.filter(row=>row.normalRangeInitialCollectionFilterCase).length,normalRangeInitialFilterCases:cases.filter(row=>row.normalRangeInitialFilterCase).length,normalRangeFilterCases:cases.filter(row=>row.normalRangeFilterCase).length,normalRangeTrainingEffectCases:cases.filter(row=>row.normalRangeTrainingEffectCase).length,indicatorCases:cases.filter(row=>row.indicatorCase).length,traitFormulaCases:cases.filter(row=>row.traitFormulaCase).length,normalRangeTraitEffectCases:cases.filter(row=>row.normalRangeTraitEffectCase).length,initiativeCases:cases.filter(row=>row.initiativeCase).length,equipmentCases:cases.filter(row=>row.equipmentCase).length,normalRangeCases:cases.filter(row=>row.rangeBounds).length,normalRangeMatrixCases:cases.filter(row=>row.normalRangeMatrixCase).length,normalRangeScopeCases:cases.filter(row=>row.normalRangeScopeCase).length,normalRangeEffectCases:cases.filter(row=>row.normalRangeEffectCase).length,fixedScoreCases:cases.filter(row=>row.fixed).length,modeEffectCases:cases.filter(row=>row.modeEffectCase).length,constantFormulaCases:cases.filter(row=>row.constantFormulaCase).length,bonusEffectCases:cases.filter(row=>row.bonusEffectCase).length,histogram,normalRangeDistributions:normalHistogram,numericLiteralBoundaryRejected:true,nativeWrites:0,limits:['Test-only module invokes req.runtime.rolls; not full actor endpoint or installed D&D UI','Exact faces and entropy consumption verified; no critical annotations/chat audience/native/operator acceptance']},null,2));
    process.stdout.write(`Public-host controlled rolls: ${cases.length-candidateRejections.length} totals/serialized faces and distributions PASS; ${candidateRejections.length} rejected-candidate diagnostics; ${selectionMismatches.length} nonblocking equal-index diagnostics\n`);
} catch(error) {process.stderr.write(logs.slice(-9000));throw error;}
finally {
    writeFileSync(join(root,'host.log'),logs); writeFileSync(join(root,'transport.json'),JSON.stringify(traffic,null,2));
    try{process.kill(-child.pid,'SIGTERM');}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
    try{process.kill(-child.pid,'SIGKILL');}catch{}
    await new Promise(resolve=>sockets.close(resolve)); await new Promise(resolve=>fake.close(resolve));
}
