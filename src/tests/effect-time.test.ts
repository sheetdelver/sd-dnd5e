import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {planEffects606} from '../logic/preparation/effects';
import {skillSource,skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import native from '../../tests/fixtures/native-6.0.6/effect-time.json';
const adapter=new DnD5eAdapter();
// Frozen expectations come from actual pinned duration/getter comparisons with
// declared seconds-calendar/concealment seams,never from module output.
assert.equal(native.nativeCommit,'87e94dbd9f930135e0694cd7e7d49f210603cd2c');
for(const row of native.cases){
 const source=skillSource();source.effects=[{_id:'TimedEffect',type:'base',...structuredClone(row.source),system:{changes:[{key:'system.abilities.wis.value',type:'add',value:4}]}}as any];
 const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),plan=planEffects606(source);
 assert.equal(plan.decisions[0].status,'duration-unavailable');assert.match(plan.reason!,/public world-time context \(E04\)/);
 assert.equal(adapter.getRollData(actor,'skill','prc'),null);assert.deepEqual(source,before);
 // Poisoned native-looking presentation fields cannot replace missing clock
 // authority. Context recovery must not silently turn the timed roll on.
 Object.assign((source.effects![0]as any).duration,{_worldTime:row.worldTime,remaining:row.expected.remaining,secondsRemaining:row.expected.remaining,label:'Ready'});
 for(const {context}of unavailableContexts())assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);
 assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc'),null);
 source.effects=[];assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,'1d20+5');
}
const future=native.cases.find(row=>row.source.duration.expired&&!row.concealed&&row.worldTime===99)!,past=native.cases.find(row=>row.source.duration.expired&&!row.concealed&&row.worldTime===102)!;
assert.deepEqual(future.source,past.source);assert.equal(future.expected.active,1);assert.equal(past.expected.active,0);
process.stdout.write('R:16 clock-dependent source fixtures retain explicit E04 gate,source preservation,poison and recovery PASS\n');
