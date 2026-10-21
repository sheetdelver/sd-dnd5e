import assert from 'node:assert/strict';
import {initialFilterData606} from '../logic/preparation/initial-filter-data';
import {DnD5eAdapter} from '../logic/adapter';
import {initialCollectionFilterCases as cases,initialCollectionFilterSource as sourceFor,initialCollectionFilterExpected as expectedFor} from './fixtures/initial-collection-filter-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import {rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of cases){
    const source=sourceFor(row),before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),expected=expectedFor(row);
    const formula=adapter.getRollData(actor,'skill','prc')?.formula??null;assert.deepEqual(source,before,row.id);
    if(!expected){assert.equal(formula,null,row.id);continue;}
    if(formula!==`1d20+${expected.skill}`){failures.push(row.id);continue;}
    const read=initialFilterData606(source)('traits.'+row.path);
    assert.ok(read&&'kind'in read&&read.kind==='set',row.id+'/typed initial Set read');
    if(read&&'kind'in read){
        assert.deepEqual(read.value,row.expectedInitial,row.id+'/independent schema members');
        assert.deepEqual(read.sourceValue,row.raw,row.id+'/source before initialization');
    }
    if(Array.isArray(row.raw)&&row.raw.length){
        const sameResult=structuredClone(source);let parent=(sameResult.system as any).traits;const parts=row.path.split('.');
        for(const part of parts.slice(0,-1))parent=parent[part];parent[parts.at(-1)!].push(row.raw[0]);
        const rePrepared=adapter.prepareActorData(sameResult,skillContext());assert.equal(adapter.getRollData(rePrepared,'skill','prc')?.formula,formula);
        assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(rePrepared,'skill'),row.id+'/same-result source definition retirement');
    }
    assert.equal((actor.derived as any).skills.prc.passive,expected.passive,row.id);
    assert.equal(adapter.getRollData(actor,'ability','wis')?.formula,`1d20+${expected.check}`,row.id);
    assert.equal(adapter.getRollData(actor,'save','wis')?.formula,`1d20+${expected.save}`,row.id);
    assert.equal(adapter.getRollData(actor,'tool','thief')?.formula,`1d20+${expected.tool}`,row.id);
    assert.equal(adapter.getRollData(actor,'skill','prc',{tool:'thief',advantage:'dis',situationalBonus:'2'})?.formula,`2d20kl1+${expected.combined}+(2)`,row.id);
    assert.equal(adapter.getActorCardData(actor).blocks?.find(block=>block.title==='Prof')?.value,'+3');
    const poisoned=structuredClone(source);(poisoned.system as any).abilities.wis.mod=99;
    (poisoned.system as any).rolls={ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:99}]))};
    assert.equal(adapter.getRollData(adapter.prepareActorData(poisoned,skillContext()),'skill','prc')?.formula,formula,row.id+'/nonpersisted poison');
    const definition=structuredClone(source),effect=definition.effects!.at(-1) as any;
    if(row.scope==='change')effect.system.changes[0].conditions+=' ';else effect.system.conditions+=' ';
    assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(adapter.prepareActorData(definition,skillContext()),'skill'),row.id+'/definition retirement');
    for(const {context} of unavailableContexts()){
        assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);
        assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,formula);
    }
    assert.deepEqual(source,before,row.id);
}
console.log('Initial collection filter requests failing-before:',JSON.stringify(failures));assert.deepEqual(failures,[]);
