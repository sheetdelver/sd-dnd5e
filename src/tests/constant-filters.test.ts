import assert from 'node:assert/strict';
import {constantFilter606} from '../logic/preparation/constant-filters';
import {DnD5eAdapter} from '../logic/adapter';
import {planEffects606} from '../logic/preparation/effects';
import {filterCases,filterSource,filterExpected} from './fixtures/filter-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import {rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of filterCases){
    const guard=constantFilter606(row.conditions);
    if(row.truth===undefined)assert.equal(guard.status,'unavailable',row.id);else {assert.equal(guard.status,'ready');assert.equal(guard.status==='ready'&&guard.matches,row.truth,row.id);}
    const source=filterSource(row),before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),expected=filterExpected(row),plan=planEffects606(source);
    assert.deepEqual(source,before,row.id);
    const formula=adapter.getRollData(actor,'skill','prc')?.formula??null;
    if(expected){
        if(formula!==`1d20+${expected.skill}`){failures.push(row.id);continue;}
        assert.equal(plan.reason,undefined,row.id);assert.equal((actor.derived as any).skills.prc.passive,expected.passive);
        assert.equal(adapter.getRollData(actor,'ability','wis')?.formula,`1d20+${expected.check}`);
        assert.equal(adapter.getRollData(actor,'skill','prc',{tool:'thief',advantage:'adv',situationalBonus:'2'})?.formula,`2d20kh1+${expected.combined}+(2)`);
        for(const {context} of unavailableContexts()){
            assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);
            assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,formula);
        }
        const poison=structuredClone(source);(poison.system as any).rolls={ability:Object.fromEntries(['check','save','tool','skill'].map(key=>[key,{proficiency:99}]))};
        assert.equal(adapter.getRollData(adapter.prepareActorData(poison,skillContext()),'skill','prc')?.formula,formula);
        const changed=structuredClone(source);const effect=changed.effects![0] as any;
        if(row.scope==='change')effect.system.changes[0].conditions=row.conditions==='[]'?'{}':'[]';else effect.system.conditions=row.conditions==='[]'?'{}':'[]';
        assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(adapter.prepareActorData(changed,skillContext()),'skill'),'Equal outcome/source context still retires different filter intent');
    }else {assert.equal(formula,null,row.id);assert.ok(plan.reason,row.id);}
    assert.deepEqual(source,before,row.id);
}
console.log('Snapshot-invariant filter requests failing-before:',JSON.stringify(failures));assert.deepEqual(failures,[]);

let deep:any={o:'AND',v:[]};for(let i=0;i<20;i++)deep={o:'NOT',v:deep};
assert.equal(constantFilter606(JSON.stringify(deep)).status,'unavailable');
assert.equal(constantFilter606(JSON.stringify({o:'AND',v:Array.from({length:260},()=>({o:'OR',v:[]}))})).status,'unavailable');
