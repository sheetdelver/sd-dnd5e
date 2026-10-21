import assert from 'node:assert/strict';
import {rangeCases,verifyRangeData,verifyRangeSelection} from './lib/range-expectations.mjs';
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
const root = mkdtempSync(join(tmpdir(), 'dnd5e-public-ranges-')), data = join(root, 'data');
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
    const cases=rangeCases(),observations=[],selectionDifferences=[],histograms={},expectedHistograms={};
    for(let start=0;start<cases.length;start+=128){
        const batch=cases.slice(start,start+128);
        const response=await fetch(origin+'/api/modules/q00/probe',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify({cases:batch})});
        const payload=await response.json();assert.equal(response.status,200,JSON.stringify(payload));assert.equal(payload.failure,undefined);assert.equal(payload.results.length,batch.length);
        writeFileSync(join(root,'observed-batch-'+start+'.json'),JSON.stringify(payload,null,2));
        for(let index=0;index<batch.length;index++){
            const row=batch[index],observed=payload.results[index];assert.equal(observed.remaining,0,'exact entropy consumption');assert.equal(observed.author,'fixtureplayer');assert.equal(observed.total,row.total);
            const serialized=JSON.parse(observed.rolls[0]),die=verifyRangeData(serialized,row);
            try{verifyRangeSelection(die,row);}catch(error){
                const diagnostic={id:row.id,formula:row.formula,mode:row.mode,faces:row.faces,expectedKept:row.kept,observedKept:die.results.findIndex(r=>r.active&&!r.discarded),message:error.message};selectionDifferences.push(diagnostic);
                assert.notEqual(row.mode,0,'Normal bounded profile requires strict parity');assert.equal(row.faces[0],row.faces[1],'Unequal-pair selection must match exactly');
            }
            const key=row.id+'/'+row.mode,histogram=histograms[key]??={},expected=expectedHistograms[key]??={};histogram[observed.total]=(histogram[observed.total]??0)+1;expected[row.total]=(expected[row.total]??0)+1;
            observations.push({case:start+index,...observed});
        }
    }
    assert.deepEqual(histograms,expectedHistograms,'complete distributions');assert.deepEqual(writes,[],'no synthetic native writes/chat');
    const profiles=Object.fromEntries([0,1,-1].map(mode=>[mode,{requests:cases.filter(c=>c.mode===mode).length,strictSelectionDifferences:selectionDifferences.filter(c=>c.mode===mode).length,status:selectionDifferences.some(c=>c.mode===mode)?'unqualified-exact-selection':'qualified-controlled-public-host'}]));
    writeFileSync(join(root,'observed.json'),JSON.stringify(observations,null,2));
    writeFileSync(join(root,'evidence.json'),JSON.stringify({evidence:'Isolated public Core runtime.rolls with synthetic transport and controlled entropy; no installed/native/operator acceptance',coreVersion,coreCommit,caseCount:cases.length,profiles,histograms,selectionDifferences,rawFacesCountsFlagsTotalsDistributionsPass:true,nativeWrites:0,limits:['Bounded strict profile has no equal-value index exception','No host result/formula/serialization rewriting; observations preserved','No effects/flags/groups/rerolls/proficiency dice/custom terms or general formula/preparation acceptance']},null,2));
    process.stdout.write(`Public ranges: ${cases.length} exact entropy/faces/counts/flags/totals,24 distributions PASS; strict profiles ${JSON.stringify(profiles)}; differences remain unqualified\n`);
} catch(error) {process.stderr.write(logs.slice(-9000));throw error;}
finally {
    writeFileSync(join(root,'host.log'),logs); writeFileSync(join(root,'transport.json'),JSON.stringify(traffic,null,2));
    try{process.kill(-child.pid,'SIGTERM');}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
    try{process.kill(-child.pid,'SIGKILL');}catch{}
    await new Promise(resolve=>sockets.close(resolve)); await new Promise(resolve=>fake.close(resolve));
}
