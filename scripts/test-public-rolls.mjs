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
    writeFileSync(driver, `import {DnD5eAdapter} from ${JSON.stringify(join(moduleRoot,'src/logic/adapter.ts'))};
import {skillSource,skillContext,setSkillRoll} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/skill-scenarios.ts'))};
import modes from ${JSON.stringify(join(moduleRoot,'tests/fixtures/native-6.0.6/skill-modes.json'))};
import {toolCases,toolSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/tool-scenarios.ts'))};
import {combinedCases,combinedSource,combinedOptions} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/combined-scenarios.ts'))};
import effectFixture from ${JSON.stringify(join(moduleRoot,'tests/fixtures/native-6.0.6/effect-phases.json'))};
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
import {proficiencyIndicatorCases,proficiencyIndicatorSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/proficiency-indicator-scenarios.ts'))};
import {normalRangeMatrix} from ${JSON.stringify(join(moduleRoot,'scripts/lib/range-expectations.mjs'))};
const adapter=new DnD5eAdapter(), cases=[];
function add(mode,faces,total=5,bonus=undefined){const actor=skillSource();setSkillRoll(actor,'skills.prc.roll',{mode,bonus:total-5});const prepared=adapter.prepareActorData(actor,skillContext());const options=bonus===undefined?{}:{situationalBonus:String(bonus)};const formula=adapter.getRollData(prepared,'skill','prc',options)?.formula;if(!formula)throw new Error('Unavailable normal formula');const selected=mode===1?Math.max(...faces):mode===-1?Math.min(...faces):faces[0];cases.push({formula,faces,expected:selected+total+(bonus??0),mode,total,bonus});}
for(const mode of [-1,1])for(let a=1;a<=20;a++)for(let b=1;b<=20;b++)add(mode,[a,b]);
for(let a=1;a<=20;a++)add(0,[a],[-1,0,1.5,1000000000][a%4],a%2?-2:2.5);
for(const row of modes.cases){const actor=skillSource();modes.scopeOrder.forEach((path,i)=>setSkillRoll(actor,path,{mode:row.modes[i]}));const prepared=adapter.prepareActorData(actor,skillContext());const formula=adapter.getRollData(prepared,'skill','prc')?.formula;const faces=row.expectedMode===0?[7]:[3,18];cases.push({formula,faces,expected:(row.expectedMode===1?18:row.expectedMode===-1?3:7)+5,mode:row.expectedMode,total:5});}
for(const sourceMode of [-1,0,1])for(const [choice,mode] of [['normal',0],['adv',1],['dis',-1]])for(const bonus of [2,-1.5]){const actor=skillSource();setSkillRoll(actor,'skills.prc.roll',{mode:sourceMode});const formula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'skill','prc',{advantage:choice,situationalBonus:String(bonus)})?.formula;const faces=mode===0?[7]:[2,19];cases.push({formula,faces,expected:(mode===1?19:mode===-1?2:7)+5+bonus,mode,total:5,bonus});}
for(const row of toolCases)for(const mode of [-1,0,1]){const actor=toolSource(row);const roll=actor.system.tools[row.key].roll;roll.mode=mode;const formula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'tool',row.key)?.formula;const faces=mode===0?[7]:[3,18];cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+row.expectedTotal,mode,total:row.expectedTotal,toolCase:row.id});}
for(const row of combinedCases)for(const manual of [undefined,'normal','adv','dis']){const options={...combinedOptions(row),...(manual?{advantage:manual,situationalBonus:'2'}:{})};const formula=adapter.getRollData(adapter.prepareActorData(combinedSource(row),skillContext()),row.kind,row.kind==='skill'?'prc':'thief',options)?.formula;const mode=manual==='adv'?1:manual==='dis'?-1:manual==='normal'?0:row.expectedMode,faces=mode===0?[7]:[3,18],bonus=manual?2:0;cases.push({formula,faces,expected:(mode===1?18:mode===-1?3:7)+row.expectedTotal+bonus,mode,total:row.expectedTotal,...(bonus?{bonus}:{}),selectedCase:row.id});}
const effectCases=effectFixture.cases;
for(const row of effectCases.filter(row=>row.expected.ready)){const actor=skillSource();actor.effects=row.effects;actor.items.push(...row.items);const formula=adapter.getRollData(adapter.prepareActorData(actor,skillContext()),'skill','prc')?.formula;cases.push({formula,faces:[11],expected:16,mode:0,total:5,effectCase:row.id});}

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
process.stdout.write(JSON.stringify(cases));`);
    const generated=spawnSync(process.execPath,[join(core,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',join(core,'tsconfig.json'),driver],{cwd:root,encoding:'utf8',env:{PATH:process.env.PATH},maxBuffer:64*1024*1024});
    if(generated.error)throw generated.error;
    assert.equal(generated.status,0,generated.stderr);const cases=JSON.parse(generated.stdout);
    assert.equal(cases.filter(row=>row.trainingEffectCase).length,576,'24 training field cases exercise six requests/four manual selections');
    assert.equal(cases.filter(row=>row.normalRangeTrainingEffectCase).length,24,'Every supported training field case preserves normal bounds');
    assert.equal(cases.filter(row=>row.constantFilterCase).length,816,'34 filter workflows exercise six requests/four manual selections');
    assert.equal(cases.filter(row=>row.normalRangeFilterCase).length,34,'Every qualified filter workflow preserves normal bounds');
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
    writeFileSync(join(root,'evidence.json'),JSON.stringify({evidence:'Isolated real public host SDK silent rolls; synthetic transport/auth and controlled dependency entropy, not native/operator acceptance',result:'qualified-plain-d20-numeric-profile',equalIndexDiagnostics:selectionMismatches,selectionMismatches,coreVersion,coreCommit,caseCount:cases.length-candidateRejections.length,requestCount:cases.length,candidateRejections,controlledPairs:800,normalFaces:20,sourceModeCases:81,manualModeCases:18,toolCases:cases.filter(row=>row.toolCase).length,selectedCases:cases.filter(row=>row.selectedCase).length,effectCases:cases.filter(row=>row.effectCase).length,numericEffectCases:cases.filter(row=>row.numericEffectCase).length,itemEffectCases:cases.filter(row=>row.itemEffectCase).length,traitEffectCases:cases.filter(row=>row.traitEffectCase).length,trainingEffectCases:cases.filter(row=>row.trainingEffectCase).length,constantFilterCases:cases.filter(row=>row.constantFilterCase).length,normalRangeFilterCases:cases.filter(row=>row.normalRangeFilterCase).length,normalRangeTrainingEffectCases:cases.filter(row=>row.normalRangeTrainingEffectCase).length,indicatorCases:cases.filter(row=>row.indicatorCase).length,traitFormulaCases:cases.filter(row=>row.traitFormulaCase).length,normalRangeTraitEffectCases:cases.filter(row=>row.normalRangeTraitEffectCase).length,initiativeCases:cases.filter(row=>row.initiativeCase).length,equipmentCases:cases.filter(row=>row.equipmentCase).length,normalRangeCases:cases.filter(row=>row.rangeBounds).length,normalRangeMatrixCases:cases.filter(row=>row.normalRangeMatrixCase).length,normalRangeScopeCases:cases.filter(row=>row.normalRangeScopeCase).length,normalRangeEffectCases:cases.filter(row=>row.normalRangeEffectCase).length,fixedScoreCases:cases.filter(row=>row.fixed).length,modeEffectCases:cases.filter(row=>row.modeEffectCase).length,constantFormulaCases:cases.filter(row=>row.constantFormulaCase).length,bonusEffectCases:cases.filter(row=>row.bonusEffectCase).length,histogram,normalRangeDistributions:normalHistogram,numericLiteralBoundaryRejected:true,nativeWrites:0,limits:['Test-only module invokes req.runtime.rolls; not full actor endpoint or installed D&D UI','Exact faces and entropy consumption verified; no critical annotations/chat audience/native/operator acceptance']},null,2));
    process.stdout.write(`Public-host controlled rolls: ${cases.length-candidateRejections.length} totals/serialized faces and distributions PASS; ${candidateRejections.length} rejected-candidate diagnostics; ${selectionMismatches.length} nonblocking equal-index diagnostics\n`);
} catch(error) {process.stderr.write(logs.slice(-9000));throw error;}
finally {
    writeFileSync(join(root,'host.log'),logs); writeFileSync(join(root,'transport.json'),JSON.stringify(traffic,null,2));
    try{process.kill(-child.pid,'SIGTERM');}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
    try{process.kill(-child.pid,'SIGKILL');}catch{}
    await new Promise(resolve=>sockets.close(resolve)); await new Promise(resolve=>fake.close(resolve));
}
