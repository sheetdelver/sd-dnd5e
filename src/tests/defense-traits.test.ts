import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {defenseTraitCases,defenseTraitSource} from './fixtures/defense-trait-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import registry from '../../tests/fixtures/native-6.0.6/defense-registries.json';
import {DAMAGE_LABELS_606,CONDITION_LABELS_606,BYPASS_LABELS_606,PHYSICAL_DAMAGE_606,ALL_DAMAGE_LABEL_606} from '../logic/native/6.0.6/defense-identities';
assert.equal(ALL_DAMAGE_LABEL_606,registry.allDamage);assert.deepEqual(PHYSICAL_DAMAGE_606,registry.physical);assert.deepEqual(DAMAGE_LABELS_606,registry.damage);assert.deepEqual(CONDITION_LABELS_606,registry.conditions);assert.deepEqual(BYPASS_LABELS_606,registry.bypasses);
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of defenseTraitCases){
    const source=defenseTraitSource(row),before=structuredClone(source),prepared=adapter.prepareActorData(source,skillContext());
    const facts=(prepared.derived as any).defenses;
    if(!facts){failures.push(row.id);assert.deepEqual(source,before);continue;}
    for(const key of ['dr','di','dv','ci','dm'] as const){
        const expected=row.expected[key],fact=facts.categories[key];
        if(!expected){assert.equal(fact.status,'unavailable',row.id+'/'+key);assert.ok(fact.reason);continue;}
        assert.equal(fact.status,'ready',row.id+'/'+key);
        assert.deepEqual(key==='dm'?fact.amount:fact.values,key==='dm'?('amount' in expected?expected.amount:{}):('values' in expected?expected.values:[]),row.id+'/'+key);
        assert.deepEqual(fact.bypasses,expected.bypasses);
        for(const entry of fact.entries){
            const expectedBypasses:string[]=entry.key&&registry.physical.includes(entry.key)?expected.bypasses:[];
            assert.deepEqual(entry.bypasses,expectedBypasses,row.id+'/physical bypass metadata');
        }
        if(key!=='dm')assert.deepEqual(fact.custom,'custom' in expected?expected.custom:[]);
    }
    assert.equal(adapter.getActorCardData(prepared).blocks?.find(block=>block.title==='Defenses')?.value,facts.summary);
    for(const {context} of unavailableContexts()){
        const lost=adapter.prepareActorData(source,context);
        assert.equal((lost.derived as any).defenses.status,'unavailable');
        assert.equal(adapter.getActorCardData(lost).blocks?.find(block=>block.title==='Defenses')?.value,'—');
        assert.deepEqual((adapter.prepareActorData(source,skillContext()).derived as any).defenses,facts);
    }
    assert.deepEqual(source,before,row.id);
}
console.log('Defense trait source cases failing-before:',JSON.stringify(failures));assert.deepEqual(failures,[]);
