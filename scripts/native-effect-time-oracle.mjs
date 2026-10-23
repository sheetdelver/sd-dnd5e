import assert from 'node:assert/strict';
import vm from 'node:vm';
import {writeFileSync} from 'node:fs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
import {option} from './lib/toolchain.mjs';
await import('./native-effect-admission-oracle.mjs');
const {effectOracle606:e}=await import('./native-effect-oracle.mjs');
const {sandbox:s,f,NActor,NEffect}=e;
// Only duration methods are evaluated. No Document/DataModel runtime or native
// service is started. Calendar collaborators deliberately implement seconds only.
vm.runInNewContext(`class TimedDuration extends admission.DurationNative {
 ${f('client/documents/active-effect.mjs','ActiveEffect','_prepareTimeBasedDuration')}
}
globalThis.TimedDuration=TimedDuration;`,s);
s.CONST={ACTIVE_EFFECT_TIME_DURATION_UNITS:['seconds']};
s.iterateEntries=Object.entries;
s.foundry.data={CalendarData:{_DURATION_FORMAT_UNITS:new Set(['second'])}};
let now=0;
s.game={time:{get worldTime(){return now;},calendar:{
 componentsToTime:({second})=>second,
 difference:(from,to)=>({second:Math.abs(to===undefined?from-now:to-from)}),
 componentsToUnit:({second})=>second,format:()=>''
}}};
s._loc=value=>value;
const cases=[];
for(const expired of [false,true])for(const concealed of [false,true])for(const time of [99,100,101,102]){
 now=time;
 const source={start:{time:100},duration:{value:1,units:'seconds',expiry:'turnStart',expired}},before=structuredClone(source);
 const effect=Object.assign(new s.TimedDuration(),structuredClone(source),{img:'fixture',concealed,system:{changes:[]}});
 effect.prepareBaseData();const duration=effect._prepareDuration(effect.duration);
 const expectedExpired=concealed?false:expired&&time>=101;
 assert.equal(duration.expired,expectedExpired);assert.equal(duration.secondsRemaining,101-time);
 const actor=Object.assign(new NActor(),{system:{isGroup:false},effects:[],items:[],statuses:new Set(),hiddenItems:new Set()});
 const nativeEffect=Object.assign(new NEffect(),{id:'TimedEffect',type:'base',disabled:false,transfer:true,actor,duration,system:{magical:false,applicableType:'Actor'}});
 actor.effects=[nativeEffect];const active=Array.from(actor.allApplicableEffects()).filter(e=>e.active).length;
 assert.equal(active,expectedExpired?0:1);assert.deepEqual(source,before);
 cases.push({source,worldTime:time,concealed,expected:{expired:expectedExpired,remaining:101-time,active}});
}
const before=cases.find(r=>r.source.duration.expired&&!r.concealed&&r.worldTime===99),after=cases.find(r=>r.source.duration.expired&&!r.concealed&&r.worldTime===102);
assert.deepEqual(before.source,after.source);assert.notEqual(before.expected.active,after.expected.active);
const out=option(process.argv.slice(2),'--write-evidence');
if(out)writeFileSync(out,JSON.stringify({nativeCommit,cases,sourceHashes:{nativeEffect:sha256(e.files.get('module/documents/active-effect.mjs')),foundryEffect:sha256(e.core.get('client/documents/active-effect.mjs'))},
 limits:['Actual Foundry14.367 duration methods and pinned native isTemporary,Actor collection,active/suppression getters execute. Seconds-only calendar/formatting and explicit concealment are declared collaborators;no calendar,permission,registry or full DataModel parity.','Source duration.expired is persisted,but not always the prepared applicability:future remaining time clears true;at/after expiry it is retained,not automatically set true here. Registry expiry automation is separate. Concealment resets indefinite applicability even while finite readout computes remaining time.','Two identical source snapshots require different applicability at99 and102. This establishes a world-time read dependency for the full timed profile,not a license to infer Date.now or replay source expired as authoritative preparation.']},null,2)+'\n');
process.stdout.write('S:'+cases.length+' timed duration/expiry/concealment source comparisons;identical source needs different world clock PASS\n');
