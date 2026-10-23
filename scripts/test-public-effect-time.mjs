import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import {coreRoot,moduleRoot} from './lib/toolchain.mjs';
import {sha256} from './lib/native-release.mjs';

// Public released host only. All configuration/auth/transport is synthetic and
// temporary. No production configuration,native connection or private API import.
const core=coreRoot(),require=createRequire(join(core,'package.json'));
const {Server}=require('socket.io'),yaml=require('js-yaml');
const version=JSON.parse(readFileSync(join(core,'package.json'),'utf8')).version;
assert.equal(version,'0.19.3');
const commit=execFileSync('git',['-C',core,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const root=mkdtempSync(join(tmpdir(),'dnd5e-public-effect-time-')),data=join(root,'data');
writeFileSync(join(root,'package.json'),JSON.stringify({version,type:'module'}));
for(const name of ['src','node_modules','.managed'])symlinkSync(join(core,name),join(root,name),'dir');
const users=[{_id:'fixturegm',name:'Fixture GM',role:4},{_id:'fixtureplayer',name:'Fixture Player',role:2}],writes=[],traffic=[],observations=[];
let worldTime=99,child,logs='';
const source={_id:'ClockActor000001',name:'Clock source',type:'character',ownership:{default:0,fixturegm:3,fixtureplayer:3},flags:{},_stats:{modifiedTime:1,systemId:'q04',systemVersion:'1.0.0'},system:{},items:[],effects:[{_id:'TimedEffect00001',type:'base',start:{time:100},duration:{value:1,units:'seconds',expiry:'turnStart',expired:true},system:{changes:[{key:'system.abilities.wis.value',type:'add',value:4}]}}]};
const game=()=>({world:{id:'q04world',_id:'q04world',title:'Offline Q04',system:'q04'},system:{id:'q04',version:'1.0.0',title:'Offline Q04'},version:'14.367',release:{generation:14,build:367},time:{worldTime},worldTime,users,activeUsers:[],packs:[],modules:[],settings:[],actors:[source],items:[],scenes:[],combats:[],messages:[],folders:[],journal:[],macros:[],playlists:[],tables:[],cards:[]});
const fake=createServer(async(req,res)=>{
 traffic.push({method:req.method,path:req.url});res.setHeader('Content-Type','application/json');
 if(req.url==='/api/status')return res.end(JSON.stringify({active:true,world:'Offline Q04',version:'14.367'}));
 if(req.url==='/join'){let body='';for await(const part of req)body+=part;const login=JSON.parse(body),id=login.userId??login.userid??users.find(u=>u.name===login.username)?._id;assert.ok(users.some(u=>u._id===id));res.setHeader('Set-Cookie',`session=${id}; Path=/; HttpOnly`);return res.end(JSON.stringify({success:true}));}
 res.statusCode=404;res.end('{}');
});
const sockets=new Server(fake);
sockets.on('connection',socket=>{
 const userId=socket.handshake.auth?.session??socket.handshake.query.session;socket.emit('session',{userId});
 socket.on('getJoinData',ack=>ack(game()));socket.on('world',ack=>ack({...game(),userId}));socket.on('getWorldStatus',ack=>ack(true));
 socket.onAny((event,...args)=>{if(['getJoinData','world','getWorldStatus'].includes(event))return;traffic.push({event});const request=args[0];if(event==='modifyDocument'&&request?.action!=='get')writes.push(request);const ack=args.at(-1);if(typeof ack==='function')ack(event==='modifyDocument'&&request?.action==='get'?{...request,result:request.type==='Actor'?[source]:[]}:{result:[]});});
});
await new Promise(resolve=>fake.listen(0,'127.0.0.1',resolve));
const reservation=createServer();await new Promise(resolve=>reservation.listen(0,'127.0.0.1',resolve));const port=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
const origin=`http://127.0.0.1:${port}`;
mkdirSync(join(data,'config'),{recursive:true});mkdirSync(join(data,'cache/core'),{recursive:true});
writeFileSync(join(data,'cache/core/worlds.json'),JSON.stringify({worlds:{},currentWorldId:null}));
writeFileSync(join(data,'config/settings.yaml'),yaml.dump({app:{host:'127.0.0.1',port,'api-port':port,protocol:'http'},foundry:{host:'127.0.0.1',port:fake.address().port,protocol:'http',connector:'socket',username:'Fixture GM'},debug:{enabled:false,level:3},security:{'rate-limit':{enabled:false},cors:{'allowed-origins':[origin]}}}),{mode:0o600});
const fixture=join(data,'local/modules/q04');mkdirSync(join(fixture,'module'),{recursive:true});
const info=JSON.parse(readFileSync(join(moduleRoot,'info.json'),'utf8'));
writeFileSync(join(fixture,'info.json'),JSON.stringify({...info,id:'q04',title:'Offline Q04',experimental:false,worldSettings:[],compendiumPacks:{packs:[]},manifest:{logic:'module/logic.ts',server:'module/server.ts',ui:'module/ui.ts'}}));
writeFileSync(join(fixture,'module/ui.ts'),'export default {};');
writeFileSync(join(fixture,'module/logic.ts'),"import {BaseSystemAdapter} from '@sheet-delver/sdk';export class Adapter extends BaseSystemAdapter {systemId='q04';match(){return true;}}");
writeFileSync(join(fixture,'module/server.ts'),`export const apiRoutes={probe:async req=>({snapshot:req.runtime.world.snapshot(),unknownSetting:req.runtime.world.settings.get('core.worldTime'),source:await req.runtime.documents.get('Actor','ClockActor000001'),runtimeKeys:Object.keys(req.runtime).sort()})};`);
async function start(){
 logs='';child=spawn(process.execPath,[join(core,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',join(core,'tsconfig.json'),join(core,'src/server/index.ts'),'--data-dir',data],{cwd:root,env:{PATH:process.env.PATH,NODE_ENV:'development',SHEET_DELVER_DATA:data,HOST:'127.0.0.1',API_PORT:String(port),APP_FOUNDRY_SESSION_KEY:'hex:'+'4'.repeat(64)},stdio:['ignore','pipe','pipe'],detached:true});
 child.stdout.on('data',v=>logs+=v);child.stderr.on('data',v=>logs+=v);
 const end=Date.now()+45000;while(Date.now()<end){if(child.exitCode!==null)throw Error('Fixture host exited');if(logs.includes('Bootstrap encountered error:'))throw Error('Fixture bootstrap failed');if(logs.includes('World bootstrap complete.'))return;await new Promise(r=>setTimeout(r,100));}throw Error('Bounded fixture startup timed out');
}
async function stop(){if(!child)return;const stopping=child;try{process.kill(-stopping.pid,'SIGTERM');}catch{}await new Promise(r=>setTimeout(r,250));try{process.kill(-stopping.pid,'SIGKILL');}catch{}child=null;}
process.stdout.write('Isolated public effect-time artifacts '+root+'\n');
try{
 for(const clock of [99,102]){
  worldTime=clock;await start();
  const login=await fetch(origin+'/api/login',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({username:'Fixture Player'})});assert.equal(login.status,200,await login.text());
  const cookie=login.headers.getSetCookie().map(s=>s.split(';')[0]).join(';');
  const response=await fetch(origin+'/api/modules/q04/probe',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:'{}'}),result=await response.json();assert.equal(response.status,200,JSON.stringify(result));
  assert.deepEqual(Object.keys(result.snapshot).sort(),['identity','settings']);assert.equal(result.snapshot.identity.systemId,'q04');
  assert.deepEqual(result.unknownSetting,{status:'unavailable',reason:'undeclared'});
  assert.deepEqual(result.source.effects,source.effects);assert.equal(result.source._id,source._id);
  assert.equal(result.runtimeKeys.some(key=>/time|clock|calendar/i.test(key)),false);
  observations.push({syntheticWorldTime:clock,result});await stop();writeFileSync(join(root,'host-'+clock+'.log'),logs);
 }
 assert.deepEqual(observations[0].result.source.effects,observations[1].result.source.effects);assert.deepEqual(observations[0].result.snapshot.settings,observations[1].result.snapshot.settings);assert.deepEqual(writes,[]);
 writeFileSync(join(root,'evidence.json'),JSON.stringify({evidence:'Isolated released public-host runtime;synthetic time/bootstrap/auth/transport,not installed/native/operator acceptance',coreVersion:version,coreCommit:commit,observations,writes,sourceHashes:Object.fromEntries(['src/shared/sdk/world.ts','src/shared/sdk/runtime.ts'].map(path=>[path,sha256(readFileSync(join(core,path)))])),limits:['Only public world.snapshot/settings and authorized Actor get are used. Two independent bootstraps have different synthetic clocks and unchanged source effects;their public snapshots expose no clock/calendar. This is not an assertion that a particular native time update event is supported or was exercised.','Typed public contracts also have no clock capability;native-system worldSetting declarations cannot create a core.time authority. No private imports,direct transport,host mutation or module time cache.','Existing E04 read limitation prevents the full timed-effect profile;minimum required read is a host-owned authorized world-time snapshot with readiness,revision/invalidation and appropriate calendar/combat context. Advancing time and registry writes remain separately scoped.']},null,2)+'\n');
 process.stdout.write('I:two clocks,identical effect source,no public time capability;zero writes PASS\n');
}finally{await stop();await new Promise(resolve=>sockets.close(resolve));await new Promise(resolve=>fake.close(resolve));writeFileSync(join(root,'host-final.log'),logs);writeFileSync(join(root,'traffic.json'),JSON.stringify({traffic,writes},null,2)+'\n');}
