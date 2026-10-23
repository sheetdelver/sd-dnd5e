import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {conditionCases,conditionSource} from './fixtures/condition-scenarios';
import {skillContext,unavailableContexts,skillWorld} from './fixtures/skill-scenarios';
import {rollIntentSignature} from '../ui/components/shared/skillIntent';
import fixture from '../../tests/fixtures/native-6.0.6/poisoned-condition.json';
const adapter=new DnD5eAdapter(),failures:string[]=[];
const formula=(mode:number,total:number)=>`${mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20'}${total<0?'':'+'}${total}`;
for(const row of conditionCases){
    const source=conditionSource(row),before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),e=row.expected;
    assert.deepEqual(source,before,row.id);
    if(row.profile.duplicate)assert.deepEqual(source.effects?.map((effect:any)=>effect._id),['conditionSrc001','conditionSrc002']);
    if(!e){assert.equal(adapter.getRollData(actor,'skill','prc'),null,row.id);continue;}
    if(adapter.getRollData(actor,'skill','prc')?.formula!==formula(e.mode,e.skill)||!(actor.derived as any).conditions){failures.push(row.id);continue;}
    assert.equal((actor.derived as any).skills.prc.passive,e.passive,row.id);
    assert.deepEqual((actor.derived as any).conditions.statuses,e.statuses,row.id);
    assert.equal(adapter.getRollData(actor,'ability','wis')?.formula,formula(e.checkMode,e.check),row.id);
    assert.equal(adapter.getRollData(actor,'save','wis')?.formula,formula(0,e.save),row.id);
    assert.equal(adapter.getRollData(actor,'tool','thief')?.formula,formula(e.toolMode,e.tool),row.id);
    for(const [kind,key,options]of [['skill','prc',{tool:'thief'}],['tool','thief',{skill:'prc',ability:'wis'}]] as const){
        assert.equal(adapter.getRollData(actor,kind,key,options)?.formula,formula(e.combinedMode,e.combined),row.id);
        for(const [advantage,mode]of [['normal',0],['adv',1],['dis',-1]] as const)assert.equal(adapter.getRollData(actor,kind,key,{...options,advantage,situationalBonus:'2'})?.formula,formula(mode,e.combined)+'+(2)',row.id);
    }
    const bounded=structuredClone(source);(bounded.system as any).skills.prc.roll.min=10;
    const preparedBounded=adapter.prepareActorData(bounded,skillContext());
    assert.equal(adapter.getRollData(preparedBounded,'skill','prc',{advantage:'normal'})?.formula,'1d20min10+'+e.skill,row.id+'/normal bounds');
    assert.equal(adapter.getRollData(preparedBounded,'skill','prc',{advantage:'adv'}),null);assert.equal(adapter.getRollData(preparedBounded,'skill','prc',{advantage:'dis'}),null);
    assert.equal((preparedBounded.derived as any).skills.prc.passive,e.passive,row.id+'/bounds never passive bonus');
    const changed=structuredClone(source);(changed.effects![0] as any)._id='differentCondition';
    assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(adapter.prepareActorData(changed,skillContext()),'skill'),row.id+'/source identity');
    for(const {context}of unavailableContexts()){assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,formula(e.mode,e.skill));}
    assert.deepEqual(source,before,row.id);
}
console.log('Condition workflows failing-before:',JSON.stringify(failures));assert.deepEqual(failures,[]);
for(const row of fixture.initiativeCases){const source=conditionSource(conditionCases[0]),s=source.system as any;s.attributes.init={ability:'dex',roll:{mode:row.initMode}};const world=skillWorld();(world.settings as any)['dnd5e.initiativeScore']={status:'world',value:row.scoreMode};(world.settings as any)['dnd5e.initiativeDexTiebreaker']={status:'world',value:row.tie};const actor=adapter.prepareActorData(source,skillContext(world));assert.equal((actor.derived as any).initiativeFacts.score,row.score);assert.equal(adapter.getRollData(actor,'initiative','initiative')?.formula,row.fixed?String(row.rollBonus):formula(row.mode,row.total)+(row.tie?'+0.14':''));}

const legacyExhaustion=conditionSource(conditionCases[0]);(legacyExhaustion.system as any).attributes.exhaustion=null;
const legacyPrepared=adapter.prepareActorData(legacyExhaustion,skillContext());assert.equal((legacyPrepared.derived as any).conditions.status,'unavailable');assert.equal(adapter.getRollData(legacyPrepared,'skill','prc'),null);

for(const statuses of [null,{},'poisoned']){const source=conditionSource(conditionCases[0]);(source as any).statuses=statuses;const actor=adapter.prepareActorData(source,skillContext());assert.equal((actor.derived as any).conditions.status,'unavailable');assert.equal(adapter.getRollData(actor,'skill','prc'),null);}
