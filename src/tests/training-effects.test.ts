import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {prepareNumericEffects606} from '../logic/preparation/numeric-effects';
import {trainingEffectCases,trainingEffectSource} from './fixtures/training-effect-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import {rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
const get=(obj:any,path:string)=>path.split('.').reduce((value,key)=>value?.[key],obj);
for(const row of trainingEffectCases){
    const source=trainingEffectSource(row),before=structuredClone(source),effects=prepareNumericEffects606(source),actor=adapter.prepareActorData(source,skillContext());
    assert.deepEqual(source,before);
    const formula=adapter.getRollData(actor,'skill','prc')?.formula??null;
    if(row.expectedOperands){
        if(formula!=='1d20+5'){failures.push(row.id);continue;}
        assert.equal(effects.reason,undefined,row.id);
        for(const [key,expected] of Object.entries(row.expectedOperands))assert.deepEqual(get(effects.system,'traits.'+key),expected,row.id+'/'+key);
        if(row.expectedApplied)assert.deepEqual(effects.applied.map(entry=>entry.value),row.expectedApplied,row.id+'/order');
        if(row.spoken)assert.deepEqual((actor.derived as any).training.categories.languages.spoken,row.spoken,row.id+'/spoken');
        const training=(actor.derived as any).training;
        assert.notEqual(training.status,'unavailable');
        assert.equal(adapter.getActorCardData(actor).blocks?.find(block=>block.title==='Training')?.value,training.summary);
        for(const {context} of unavailableContexts()){
            assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);
            assert.equal((adapter.prepareActorData(source,context).derived as any).training.status,'unavailable');
            assert.deepEqual((adapter.prepareActorData(source,skillContext()).derived as any).training,training);
        }
        const poison=structuredClone(source),system=poison.system as any;
        system.rolls={ability:Object.fromEntries(['check','skill','save','tool'].map(key=>[key,{proficiency:99}]))};
        system.tools.thief.effectValue=99;system.tools.thief.prof={multiplier:99};
        (system.traits.languages??={}).labels={languages:['Invented'],ranged:['Unlimited']};
        const poisonBefore=structuredClone(poison),poisoned=adapter.prepareActorData(poison,skillContext());
        assert.deepEqual(poison,poisonBefore);assert.deepEqual((poisoned.derived as any).training,training);
        for(const [choice,die] of [['normal','1d20'],['adv','2d20kh1'],['dis','2d20kl1']])assert.equal(adapter.getRollData(poisoned,'skill','prc',{tool:'thief',advantage:choice,situationalBonus:'2'})?.formula,`${die}+5+(2)`);
        const cleared=structuredClone(source);cleared.effects=[];
        assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(adapter.prepareActorData(cleared,skillContext()),'skill'),'Training source changes retire even equal-total intents');
    }else {
        assert.equal(formula,null,row.id);assert.ok(effects.reason,row.id);
        assert.equal((actor.derived as any).training.status,'unavailable',row.id);
    }
    assert.deepEqual(source,before,row.id);
}
console.log('Initial training Set requests failing-before:',JSON.stringify(failures));assert.deepEqual(failures,[]);
