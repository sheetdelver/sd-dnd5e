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
const root = mkdtempSync(join(tmpdir(), 'dnd5e-public-proficiency-')), data = join(root, 'data');
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

    const fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/proficiency-dice.json'),'utf8'));
    assert.equal(fixture.nativeCommit,'87e94dbd9f930135e0694cd7e7d49f210603cd2c');
    const driver=join(root,'compiled.ts');
    writeFileSync(driver,`import {DnD5eAdapter} from ${JSON.stringify(join(moduleRoot,'src/logic/adapter.ts'))};import {skillSource,skillContext,skillWorld} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/skill-scenarios.ts'))};import fixture from ${JSON.stringify(join(moduleRoot,'tests/fixtures/native-6.0.6/proficiency-dice.json'))};const result={},adapter=new DnD5eAdapter();for(const row of fixture.cases.filter(row=>!row.execution))for(const bounds of [{},{minimum:10},{maximum:15},{minimum:10,maximum:15},{minimum:14,maximum:12}]){const source=skillSource(),s=source.system,world=skillWorld();source.items[0].system.levels=row.level;s.skills.prc.value=row.coefficient;s.skills.prc.roll={min:bounds.minimum,max:bounds.maximum};world.settings['dnd5e.proficiencyModifier']={status:'world',value:'dice'};const actor=adapter.prepareActorData(source,skillContext(world));result[row.base+'/'+row.coefficient+'/'+JSON.stringify(bounds)]=adapter.getRollData(actor,'skill','prc')?.formula;}process.stdout.write(JSON.stringify(result));`);
    const generated=await new Promise((resolve,reject)=>{let stdout='',stderr='';const generator=spawn(process.execPath,[join(core,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',join(core,'tsconfig.json'),driver],{cwd:core,stdio:['ignore','pipe','pipe']});generator.stdout.on('data',b=>stdout+=b);generator.stderr.on('data',b=>stderr+=b);generator.on('error',reject);generator.on('exit',code=>code===0?resolve(stdout):reject(new Error(stderr)));});
    const compiled=JSON.parse(generated);assert.equal(Object.keys(compiled).length,120);writeFileSync(join(root,'module-formulas.json'),JSON.stringify(compiled,null,2));
    const cases=[],histogram={},expectedHistogram={};
    function append(row,faces,mode=0,probe=false,bounds={}){
        const modifiers=(bounds.minimum===undefined?'':'min'+bounds.minimum)+(bounds.maximum===undefined?'':'max'+bounds.maximum),term=row.term==='0'?'':'+'+row.term,formula=(mode===0?'1d20':mode===1?'2d20kh1':'2d20kl1')+modifiers+'+2'+term;
        const primary=faces.slice(0,mode===0?1:2),prof=faces.slice(primary.length),selection=mode===1?Math.max(...primary):mode===-1?Math.min(...primary):primary[0];
        let contribution20=selection;if(bounds.minimum!==undefined&&selection<bounds.minimum)contribution20=bounds.minimum;if(bounds.maximum!==undefined&&selection>bounds.maximum)contribution20=bounds.maximum;
        const contribution=row.coefficient===.5?Math.floor(prof[0]/2):prof.reduce((a,b)=>a+b,0),expected=contribution20+2+contribution;
        const group=row.base+'/'+row.coefficient+'/'+JSON.stringify(bounds);if(!probe)assert.equal(compiled[group],formula,'Actual shared module compiler versus independent native candidate');const c={formula,faces,expected,row,mode,probe,primary,prof,bounds};cases.push(c);
        if(!probe){const h=expectedHistogram[group]??={};h[expected]=(h[expected]??0)+1;}
    }
    for(const row of fixture.cases.filter(row=>!row.execution))for(const bounds of [{},{minimum:10},{maximum:15},{minimum:10,maximum:15},{minimum:14,maximum:12}]){const size=row.base*2;
        for(let face=1;face<=20;face++){
            if(row.coefficient===0)append(row,[face],0,false,bounds);
            else for(let a=1;a<=size;a++)if(row.coefficient===2)for(let b=1;b<=size;b++)append(row,[face,a,b],0,false,bounds);else append(row,[face,a],0,false,bounds);
        }
    }
    const profile=fixture.cases.find(row=>row.base===3&&row.coefficient===1);
    for(const mode of [-1,1])for(let a=1;a<=20;a++)for(let b=1;b<=20;b++)append(profile,[a,b,3],mode,true);
    writeFileSync(join(root,'inputs.json'),JSON.stringify(cases));
    const payload={results:[]};
    for(let start=0;start<cases.length;start+=128){const response=await fetch(origin+'/api/modules/q00/probe',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify({cases:cases.slice(start,start+128)})}),batch=await response.json();assert.equal(response.status,200,JSON.stringify(batch));assert.equal(batch.results.length,Math.min(128,cases.length-start));payload.results.push(...batch.results);}
    writeFileSync(join(root,'observed.json'),JSON.stringify(payload));
    const equalIndexDiagnostics=[];
    for(let i=0;i<cases.length;i++){
        const row=cases[i],result=payload.results[i],serialized=JSON.parse(result.rolls[0]);assert.equal(result.total,row.expected);assert.equal(result.remaining,0);assert.equal(result.author,'fixtureplayer');assert.equal(serialized.class,'Roll');assert.equal(serialized.evaluated,true);assert.equal(serialized.formula,row.formula);assert.equal(serialized.total,row.expected);assert.deepEqual(serialized.options,{});
        const topDice=serialized.terms.filter(term=>term.class==='Die'),dice=topDice.length?topDice:serialized.dice;
        assert.equal(dice.length,row.prof.length?2:1);const [primary,proficiency]=dice;
        assert.equal(primary.faces,20);assert.equal(primary.number,row.primary.length);assert.deepEqual(primary.modifiers,[...(row.mode===0?[]:[row.mode===1?'kh1':'kl1']),...(row.bounds.minimum===undefined?[]:['min'+row.bounds.minimum]),...(row.bounds.maximum===undefined?[]:['max'+row.bounds.maximum])]);assert.deepEqual(primary.results.map(r=>r.result),row.primary);assert.deepEqual(primary.options,{});
        const kept=primary.results.flatMap((r,index)=>r.active?[index]:[]);assert.equal(kept.length,1);const value=row.mode===1?Math.max(...row.primary):row.mode===-1?Math.min(...row.primary):row.primary[0];assert.equal(primary.results[kept[0]].result,value);
        for(const r of primary.results){let count=r.result;if(row.bounds.minimum!==undefined&&r.result<row.bounds.minimum)count=row.bounds.minimum;if(row.bounds.maximum!==undefined&&r.result>row.bounds.maximum)count=row.bounds.maximum;const changed=count!==r.result;assert.equal(r.count,changed?count:undefined);assert.equal(!!r.rerolled,changed);assert.ok(Object.keys(r).every(k=>['result','active','discarded','count','rerolled'].includes(k)));if(r.active)assert.notEqual(r.discarded,true);else assert.equal(r.discarded,true);}
        if(kept[0]!==row.primary.indexOf(value)){assert.equal(row.primary[0],row.primary[1],'Unequal faces require exact selection');equalIndexDiagnostics.push({formula:row.formula,faces:row.primary,nativeFirst:0,hostKept:kept[0],profile:'unqualified-adv/dis-proficiency-probe'});}
        if(proficiency){assert.equal(proficiency.faces,row.row.base*2);assert.equal(proficiency.number,row.prof.length);assert.deepEqual(proficiency.modifiers,[]);assert.deepEqual(proficiency.options,{});assert.deepEqual(proficiency.results.map(r=>r.result),row.prof);for(const r of proficiency.results){assert.equal(r.active,true);assert.notEqual(r.discarded,true);assert.ok(Object.keys(r).every(k=>['result','active','discarded'].includes(k)));}}
        if(!row.probe){const h=histogram[row.row.base+'/'+row.row.coefficient+'/'+JSON.stringify(row.bounds)]??={};h[result.total]=(h[result.total]??0)+1;}
    }
    assert.deepEqual(histogram,expectedHistogram,'All120 complete Normal/bounded distributions');assert.deepEqual(writes,[]);
    const evidence={evidence:'Isolated real public runtime.rolls;synthetic transport/auth/entropy;not native/operator acceptance',coreVersion,coreCommit,result:'Normal-only numeric proficiency-dice candidate qualified',compiledModuleProfiles:120,normalCases:cases.filter(r=>!r.probe).length,probeCases:cases.filter(r=>r.probe).length,equalIndexDiagnostics,histogram,sourceFixture:'tests/fixtures/native-6.0.6/proficiency-dice.json',nativeWrites:0,limits:['Adv/dis probes have400 pairs each at one proficiency context. Their complete joint distributions across proficiency faces/types are NOT established and tied selection differs;no adv/dis proficiency qualification or equivalence expansion follows.','Normal and five source-bound profiles scalar/dice outcomes,ordered entropy,counts,active/discard states,serialization and all120 distributions checked. Full native parser/operator/actor endpoint and UI acceptance remain separate.']};
    writeFileSync(join(root,'evidence.json'),JSON.stringify(evidence,null,2));process.stdout.write('Public Normal proficiency dice: '+evidence.normalCases+' cases/120 complete distributions PASS;'+evidence.probeCases+' adv/dis probes/'+equalIndexDiagnostics.length+' UNQUALIFIED tie diagnostics;0 native writes\n');
} catch(error) {process.stderr.write(logs.slice(-9000));throw error;}
finally {
    writeFileSync(join(root,'host.log'),logs); writeFileSync(join(root,'transport.json'),JSON.stringify(traffic,null,2));
    try{process.kill(-child.pid,'SIGTERM');}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
    try{process.kill(-child.pid,'SIGKILL');}catch{}
    await new Promise(resolve=>sockets.close(resolve)); await new Promise(resolve=>fake.close(resolve));
}
