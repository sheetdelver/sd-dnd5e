import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {finalCiCases,finalCiSource} from './fixtures/final-ci-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import {preparedRollFormula,rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
const formula=(mode:number,total:number)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+(total<0?'':'+')+total;
for(const row of finalCiCases){
 const source=finalCiSource(row),before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any,e=row.expected;
 assert.deepEqual(source,before);
 if(adapter.getRollData(actor,'skill','prc')?.formula!==formula(e.preparedMode,e.skill)){failures.push(row.id);continue;}
 assert.deepEqual(d.conditions.actorStatuses,e.actorStatuses);assert.deepEqual(d.conditions.levels,e.conditionLevels);assert.equal(d.conditions.rollReduction,e.cachedReduction);assert.deepEqual(d.conditions.currentImmunities,e.afterCI);assert.deepEqual(d.conditions.statuses,e.actorStatuses.filter(id=>!e.afterCI.includes(id)));assert.equal(d.conditions.statuses.includes('poisoned'),e.freshAbilityDisadvantageQuery);assert.equal(d.skills.prc.passive,e.passive);assert.deepEqual(d.defenses.categories.ci.values,e.afterCI);assert.equal(d.initiativeFacts.value,e.initiative);assert.equal(d.initiativeFacts.score,e.initiativeScore);
 for(const [kind,key,selection,total,mode]of [['skill','prc',{},e.skill,e.preparedMode],['tool','thief',{},e.skill,e.preparedMode],['skill','prc',{tool:'thief'},e.skill,e.combinedMode],['tool','thief',{skill:'prc',ability:'wis'},e.skill,e.combinedMode],['ability','wis',{},e.checkSave,e.preparedMode],['save','wis',{},e.checkSave,0],['initiative','initiative',{},e.initiative,e.preparedMode]]as const){assert.equal(adapter.getRollData(actor,kind,key,selection)?.formula,formula(mode,total),row.id+'/'+kind);assert.equal(preparedRollFormula(actor,kind,key,selection),formula(mode,total));for(const [advantage,manual]of [['normal',0],['adv',1],['dis',-1]]as const)assert.equal(adapter.getRollData(actor,kind,key,{...selection,advantage,situationalBonus:'2'})?.formula,formula(manual,total)+'+(2)');}
 const fixed=skillContext();(fixed.world!.settings as any)['dnd5e.initiativeScore']={status:'world',value:'all'};assert.equal(adapter.getRollData(adapter.prepareActorData(source,fixed),'initiative','initiative')?.formula,String(e.initiativeScore));
 for(const {context}of unavailableContexts()){assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,formula(e.preparedMode,e.skill));}
 const changed=structuredClone(source);(changed.effects![1]as any)._id='differentCI';assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(adapter.prepareActorData(changed,skillContext()),'skill'));assert.deepEqual(source,before);
}
console.log('Final CI conditions failing-before:',failures.length,'of',finalCiCases.length,failures.slice(0,4));assert.deepEqual(failures,[]);
for(const value of [undefined,null,true,[],{},'@traits.ci.value','[1]','["unknown"]','["stunned"]']){const source=finalCiSource(finalCiCases[0]);(source.effects![1]as any).system.changes[0].value=value;const actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc'),null);}
for(const scope of ['another-condition','false-guard','initial-ci','other-defense']){
 const source=finalCiSource(finalCiCases.find(row=>row.id==='poisoned/1/0/add')!);
 if(scope==='another-condition')source.effects!.push({...structuredClone(source.effects![0]as any),_id:'duplicateCondition'});
 if(scope==='false-guard')(source.effects![0]as any).system.conditions='{"o":"OR","v":[]}';
 if(scope==='initial-ci')source.effects!.push({_id:'initialCI',type:'base',system:{changes:[{key:'system.traits.ci.value',type:'add',value:'["poisoned"]',phase:'initial'}]}}as any);
 if(scope==='other-defense')Object.assign((source.effects![1]as any).system.changes[0],{key:'system.traits.dr.value',value:'["fire"]'});
 assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc'),null,scope);
}
for(const immune of [false,true]){
 const source=finalCiSource(finalCiCases.find(row=>row.id===`poisoned/1/${Number(immune)}/add`)!);(source.effects![1]as any).system.changes=[{key:'system.traits.ci.value',type:'add',value:'["poisoned"]',phase:'final',priority:0},{key:'system.traits.ci.value',type:'subtract',value:'["poisoned"]',phase:'final',priority:1}];
 const actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any;assert.deepEqual(d.conditions.statuses,immune?[]:['poisoned']);assert.deepEqual(d.conditions.actorStatuses,immune?[]:['poisoned']);assert.deepEqual(d.conditions.currentImmunities,[]);assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,immune?'1d20+5':'2d20kl1+5');assert.equal(d.effectPreparation.applied.filter((v:any)=>v.effectId==='finalCI')[1].operandPhase,'final');
}
