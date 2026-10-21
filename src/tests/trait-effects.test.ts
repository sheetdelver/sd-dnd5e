import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {prepareNumericEffects606} from '../logic/preparation/numeric-effects';
import {traitEffectCases,traitEffectSource} from './fixtures/trait-effect-scenarios';
import {skillContext,skillWorld,unavailableContexts} from './fixtures/skill-scenarios';
import {rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
const get=(obj:any,path:string)=>path.split('.').reduce((v,k)=>v?.[k],obj);
for(const row of traitEffectCases){
    const source=traitEffectSource(row),before=structuredClone(source),effects=prepareNumericEffects606(source),prepared=adapter.prepareActorData(source,skillContext());
    const formula=adapter.getRollData(prepared,'skill','prc')?.formula??null;
    assert.deepEqual(source,before,row.id);
    if(row.expectedOperands){
        if(formula!=='1d20+5'){failures.push(row.id);continue;}
        assert.equal(effects.reason,undefined,row.id);
        for(const [key,value] of Object.entries(row.expectedOperands))assert.deepEqual(get(effects.system,'traits.'+key),value,row.id+'/'+key);
        if(row.expectedAmounts)assert.deepEqual((prepared.derived as any).defenses.categories.dm.amount,row.expectedAmounts,row.id+'/derived amounts');
        if(row.expectedApplied)assert.deepEqual(effects.applied.map(entry=>entry.value),row.expectedApplied,row.id);
        if(row.expectedFormula)assert.equal(effects.applied.at(-1)?.formula,row.expectedFormula,row.id);
        for(const [key,values] of Object.entries(row.expectedDefense??{}))assert.deepEqual((prepared.derived as any).defenses.categories[key].values,values,row.id+'/derived');
        assert.equal((prepared.derived as any).defenses.status,'ready',row.id);
        assert.equal((prepared.derived as any).skills.prc.passive,15,row.id);
        for(const [choice,die] of [['normal','1d20'],['adv','2d20kh1'],['dis','2d20kl1']])assert.equal(adapter.getRollData(prepared,'skill','prc',{tool:'thief',advantage:choice,situationalBonus:'2'})?.formula,`${die}+5+(2)`);
        for(const {context} of unavailableContexts()){
            assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);
            assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,formula);
        }
        const poison=structuredClone(source);(poison.system as any).rolls={ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:99}]))};
        const poisonBefore=structuredClone(poison);
        assert.equal(adapter.getRollData(adapter.prepareActorData(poison,skillContext()),'skill','prc')?.formula,'1d20+5','Nonpersisted roll proficiency stays initialized despite trait effects');
        assert.deepEqual(poison,poisonBefore);
        const cleared=structuredClone(source);cleared.effects=[];
        assert.notEqual(rollIntentSignature(prepared,'skill'),rollIntentSignature(adapter.prepareActorData(cleared,skillContext()),'skill'),'Same numeric total does not retain an effect intent');
        const bounded=structuredClone(source);(bounded.system as any).skills.prc.roll={min:10};
        const boundedPrepared=adapter.prepareActorData(bounded,skillContext());
        assert.equal(adapter.getRollData(boundedPrepared,'skill','prc')?.formula,'1d20min10+5');
        assert.equal(adapter.getRollData(boundedPrepared,'skill','prc',{tool:'thief'}),null,'Bounded automatic advantage stays unavailable');
        assert.equal(adapter.getRollData(boundedPrepared,'skill','prc',{tool:'thief',advantage:'normal'})?.formula,'1d20min10+5');
    }else {assert.equal(formula,null,row.id);assert.ok(effects.reason,row.id);assert.equal((prepared.derived as any).defenses.status,'unavailable',row.id);}
    assert.deepEqual(source,before,row.id);
}
console.log('Initial trait effect requests failing-before:',JSON.stringify(failures));assert.deepEqual(failures,[]);
const legacy=skillWorld();(legacy.settings as Record<string,unknown>)['dnd5e.rulesVersion']={status:'world',value:'legacy'};
const legacySource=traitEffectSource(traitEffectCases[0]),legacyPrepared=adapter.prepareActorData(legacySource,skillContext(legacy));
assert.equal((legacyPrepared.derived as any).defenses.status,'unavailable','Modern trait effects do not qualify legacy defenses');
legacySource.effects=[];
assert.deepEqual(adapter.getRollData(legacyPrepared,'skill','prc'),adapter.getRollData(adapter.prepareActorData(legacySource,skillContext(legacy)),'skill','prc'),'Explicit limited legacy numeric behavior is unchanged');
