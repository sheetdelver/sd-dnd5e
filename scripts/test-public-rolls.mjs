import assert from 'node:assert/strict';
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
writeFileSync(join(fixture,'module/server.ts'),`export const apiRoutes={probe:async(req)=>{const {cases}=await req.json(); const results=[];for(const row of cases){globalThis.__q00Faces(row.faces);results.push({...await req.runtime.rolls.roll(row.formula,'Q00 silent fixture',{displayChat:false}),remaining:globalThis.__q00Remaining()});}return {results};}};`);
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
import {numericD20Formula} from ${JSON.stringify(join(moduleRoot,'src/logic/preparation/d20-configuration.ts'))};
const adapter=new DnD5eAdapter(), cases=[];
function add(mode,faces,total=5,bonus=undefined){const actor=skillSource();setSkillRoll(actor,'skills.prc.roll',{mode,bonus:total-5});const prepared=adapter.prepareActorData(actor,skillContext());const options=bonus===undefined?{}:{situationalBonus:String(bonus)};const formula=mode===0?adapter.getRollData(prepared,'skill','prc',options)?.formula:numericD20Formula(total,mode);if(!formula)throw new Error('Unavailable normal formula');const selected=mode===1?Math.max(...faces):mode===-1?Math.min(...faces):faces[0];cases.push({formula,faces,expected:selected+total+(bonus??0),mode,total,bonus});}
for(const mode of [-1,1])for(let a=1;a<=20;a++)for(let b=1;b<=20;b++)add(mode,[a,b]);
for(let a=1;a<=20;a++)add(0,[a],[-1,0,1.5,1000000000][a%4],a%2?-2:2.5);
for(const row of modes.cases){const actor=skillSource();modes.scopeOrder.forEach((path,i)=>setSkillRoll(actor,path,{mode:row.modes[i]}));const prepared=adapter.prepareActorData(actor,skillContext());const formula=numericD20Formula(prepared.derived.skillChecks.prc.total,row.expectedMode);const faces=row.expectedMode===0?[7]:[3,18];cases.push({formula,faces,expected:(row.expectedMode===1?18:row.expectedMode===-1?3:7)+5,mode:row.expectedMode,total:5});}
process.stdout.write(JSON.stringify(cases));`);
    const generated=spawnSync(process.execPath,[join(core,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',join(core,'tsconfig.json'),driver],{cwd:root,encoding:'utf8',env:{PATH:process.env.PATH}});
    assert.equal(generated.status,0,generated.stderr);const cases=JSON.parse(generated.stdout);
    const response=await fetch(origin+'/api/modules/q00/probe',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify({cases})});
    const payload=await response.json(); assert.equal(response.status,200,JSON.stringify(payload));
    writeFileSync(join(root,'observed.json'),JSON.stringify(payload,null,2));
    const selectionMismatches=[];
    const histogram={adv:Array(20).fill(0),dis:Array(20).fill(0)};
    for(let i=0;i<cases.length;i++){
        const row=cases[i], observed=payload.results[i];
        assert.equal(observed.remaining,0);assert.equal(observed.total,row.expected);
        assert.equal(observed.author,'fixtureplayer');
        const serialized=JSON.parse(observed.rolls[0]), die=serialized.terms.find(term=>term.class==='Die') ?? serialized.dice.find(term=>term.class==='Die');
        assert.equal(serialized.total,row.expected);assert.equal(serialized.formula,row.formula);
        assert.deepEqual(die.results.map(result=>result.result),row.faces);
        const kept=die.results.flatMap((result,index)=>result.active?[index]:[]);
        const selected=row.mode===1?Math.max(...row.faces):row.mode===-1?Math.min(...row.faces):row.faces[0];
        const expectedIndex=row.faces.indexOf(selected);
        if(kept.length!==1 || kept[0]!==expectedIndex)selectionMismatches.push({case:i,formula:row.formula,faces:row.faces,expectedKept:[expectedIndex],observedKept:kept});
        if(i<800)histogram[row.mode===1?'adv':'dis'][selected-1]++;
    }
    assert.deepEqual(histogram.adv,Array.from({length:20},(_,i)=>2*i+1));
    assert.deepEqual(histogram.dis,Array.from({length:20},(_,i)=>39-2*i));
    const invalid=await fetch(origin+'/api/modules/q00/probe',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify({cases:[{formula:'1d20+1000000001',faces:[1]}]})});
    assert.ok(invalid.status>=400,'Host numeric literal bound rejects without fallback');
    assert.deepEqual(writes,[],'Silent rolls dispatch no synthetic native writes/chat');
    writeFileSync(join(root,'evidence.json'),JSON.stringify({evidence:'Isolated real public host SDK silent rolls; synthetic transport/auth and controlled dependency entropy, not native/operator acceptance',result:selectionMismatches.length?'blocked-native-tie-selection':'qualified-numeric-profile',selectionMismatches,coreVersion,coreCommit,caseCount:cases.length,controlledPairs:800,normalFaces:20,sourceModeCases:81,histogram,numericLiteralBoundaryRejected:true,nativeWrites:0,limits:['Test-only module invokes req.runtime.rolls; not full actor endpoint or installed D&D UI','Exact faces and entropy consumption verified; no critical annotations/chat audience/native/operator acceptance']},null,2));
    process.stdout.write(`Public-host controlled rolls: ${cases.length} totals/serialized faces and distributions PASS; ${selectionMismatches.length} native selection mismatches\n`);
    if(selectionMismatches.length)process.exitCode=2;
} catch(error) {process.stderr.write(logs.slice(-9000));throw error;}
finally {
    writeFileSync(join(root,'host.log'),logs); writeFileSync(join(root,'transport.json'),JSON.stringify(traffic,null,2));
    try{process.kill(-child.pid,'SIGTERM');}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
    try{process.kill(-child.pid,'SIGKILL');}catch{}
    await new Promise(resolve=>sockets.close(resolve)); await new Promise(resolve=>fake.close(resolve));
}
