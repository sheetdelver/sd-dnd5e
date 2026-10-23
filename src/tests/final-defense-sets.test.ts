import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {finalDefenseCases,finalDefenseSource} from './fixtures/final-defense-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import {rollIntentSignature,preparedRollFormula} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of finalDefenseCases){
 const source=finalDefenseSource(row),before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any;
 assert.deepEqual(source,before);
 if(d.defenses.status!=='ready'){failures.push(row.id);continue;}
 for(const key of ['dr','di','dv','ci','dm']as const){const e=row.expectedAfter[key],actual=d.defenses.categories[key];assert.equal(actual.status,'ready');if('value'in e)assert.deepEqual(actual.values,e.value,row.id+'/'+key);assert.deepEqual(actual.bypasses,'bypasses'in e?e.bypasses:[],row.id+'/'+key);}
 const earlier=Object.fromEntries(Object.entries(row.expectedBefore).flatMap(([key,fields])=>Object.entries(fields).filter(([field])=>field==='value'||field==='bypasses').map(([field,value])=>[`system.traits.${key}.${field}`,value])));
 assert.deepEqual(d.defenses.preparation.fields,earlier,row.id+'/earlier normalized fields');
 if(row.petrified){
  assert.deepEqual(d.conditions.actorStatuses,['petrified']);assert.deepEqual(d.conditions.statuses,['petrified']);assert.equal(d.skills.prc.passive,15);
  assert.deepEqual(d.conditions.traitGrant.granted,{dr:['ALL'],di:['poison'],ci:['poisoned','diseased'],clearBypasses:true});
  assert.equal(d.defenses.preparation.nativeResistanceDisplay.value,'All Damage');assert.equal(d.defenses.preparation.nativeResistanceDisplay.condition,'petrified');
  assert.equal(Boolean(d.defenses.preparationNote),JSON.stringify(row.expectedBefore)!==JSON.stringify(row.expectedAfter));
  const poisoned=structuredClone(source),system=poisoned.system as any;
  system.rolls={ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:99}]))};system.skills.prc.total=999;system.skills.prc.passive=999;system.conditions={poisoned:99};
  const poisonBefore=structuredClone(poisoned),again=adapter.prepareActorData(poisoned,skillContext());assert.deepEqual((again.derived as any).defenses,d.defenses);assert.equal(adapter.getRollData(again,'skill','prc')?.formula,'1d20+5');assert.deepEqual(poisoned,poisonBefore);
  const dr=d.defenses.categories.dr;if(dr.values.includes('ALL')&&dr.bypasses.length)assert.match(dr.display,/physical damage bypassed by/);
  const bounded=structuredClone(source);(bounded.system as any).skills.prc.roll={min:10};const boundedActor=adapter.prepareActorData(bounded,skillContext());assert.ok(adapter.getRollData(boundedActor,'skill','prc',{advantage:'normal'}));assert.equal(adapter.getRollData(boundedActor,'skill','prc',{advantage:'adv'}),null);assert.equal(adapter.getRollData(boundedActor,'skill','prc',{advantage:'dis'}),null);assert.equal((boundedActor.derived as any).skills.prc.passive,15);
 }
 const receipt=d.effectPreparation.applied.find((v:any)=>v.effectId==='finalDefense'),[key,field]=row.field.split('.');assert.deepEqual(receipt.before,(row.expectedBefore as any)[key][field]);assert.deepEqual(receipt.value,(row.expectedAfter as any)[key][field]);assert.equal(receipt.phase,'final');assert.equal(receipt.operandPhase,'prepared');
 assert.equal(adapter.getActorCardData(actor).blocks?.find(block=>block.title==='Defenses')?.value,d.defenses.summary);
 for(const [advantage,prefix]of [[undefined,'1d20'],['normal','1d20'],['adv','2d20kh1'],['dis','2d20kl1']]as const){const options=advantage?{advantage,situationalBonus:'2'}:{};assert.equal(adapter.getRollData(actor,'skill','prc',options)?.formula,prefix+'+5'+(advantage?'+(2)':''));assert.equal(preparedRollFormula(actor,'skill','prc',options),prefix+'+5'+(advantage?'+(2)':''));}
 for(const {context}of unavailableContexts()){const lost=adapter.prepareActorData(source,context);assert.equal((lost.derived as any).defenses.status,'unavailable');assert.equal(adapter.getRollData(lost,'skill','prc'),null);assert.equal((adapter.prepareActorData(source,skillContext()).derived as any).defenses.status,'ready');}
 const changed=structuredClone(source);(changed.effects![0]as any)._id='differentFinalDefense';assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(adapter.prepareActorData(changed,skillContext()),'skill'));assert.deepEqual(source,before);
}
console.log('Final defense Set failing-before:',failures.length,'of',finalDefenseCases.length,failures.slice(0,4));assert.deepEqual(failures,[]);
for(const value of [null,undefined,[],{},true,'@traits.dr.value','[1]','["not-a-damage-type"]']){const source=finalDefenseSource(finalDefenseCases[0]);(source.effects![0]as any).system.changes[0].value=value;const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext());assert.equal((actor.derived as any).defenses.status,'unavailable');assert.equal(adapter.getRollData(actor,'skill','prc'),null);assert.deepEqual(source,before);}
for(const path of ['traits.dr.value','traits.di.value','traits.ci.value','traits.dm.bypasses']){const source=finalDefenseSource(finalDefenseCases[0]);const parts=path.split('.');let target=source.system as any;for(const key of parts.slice(0,-1))target=target[key]??={};target[parts.at(-1)!]=['unknown'];assert.equal((adapter.prepareActorData(source,skillContext()).derived as any).defenses.status,'unavailable');}
// Repeated final operations consume prior final results, not earlier normalized values.
{const source=finalDefenseSource(finalDefenseCases[0]);(source.effects![0]as any).system.changes=[{key:'system.traits.dr.value',type:'add',value:'["fire"]',phase:'final',priority:0},{key:'system.traits.dr.value',type:'subtract',value:'["cold"]',phase:'final',priority:1}];const actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any;assert.deepEqual(d.defenses.categories.dr.values,['fire']);assert.deepEqual(d.effectPreparation.applied.map((v:any)=>[v.before,v.value,v.operandPhase]),[[['cold'],['cold','fire'],'prepared'],[['cold','fire'],['fire'],'final']]);}
// C63 does not qualify inferred/mixed statuses, initial trait composition or
// final immunity to petrification itself. Requested unsupported cases stay gated.
for(const scope of ['duplicate','incapacitated','absent-status','false-guard','initial-trait','petrified-immunity']){
 const source=finalDefenseSource(finalDefenseCases.find(row=>row.petrified)!);
 const condition=source.effects![0]as any,change=(source.effects![1]as any).system.changes[0];
 if(scope==='duplicate')source.effects!.push({...structuredClone(condition),_id:'duplicate'});
 if(scope==='incapacitated')condition.statuses.push('incapacitated');
 if(scope==='absent-status')delete condition.statuses;
 if(scope==='false-guard')condition.system.conditions='{"o":"OR","v":[]}';
 if(scope==='initial-trait')source.effects!.push({_id:'initialTrait',type:'base',system:{changes:[{key:'system.traits.dr.value',type:'add',value:'["fire"]',phase:'initial'}]}}as any);
 if(scope==='petrified-immunity')Object.assign(change,{key:'system.traits.ci.value',value:'["petrified"]'});
 const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext());assert.equal((actor.derived as any).defenses.status,'unavailable',scope);assert.equal(adapter.getRollData(actor,'skill','prc'),null,scope);assert.deepEqual(source,before);
}
{const source=finalDefenseSource(finalDefenseCases.find(row=>row.petrified)!);(source.effects![1]as any).system.changes=[{key:'system.traits.dr.value',type:'override',value:'["cold"]',phase:'final',priority:0},{key:'system.traits.dr.value',type:'add',value:'["fire"]',phase:'final',priority:1}];const actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any;assert.deepEqual(d.defenses.categories.dr.values,['cold','fire']);assert.deepEqual(d.defenses.preparation.fields['system.traits.dr.value'],['ALL']);assert.deepEqual(d.effectPreparation.applied.map((v:any)=>v.operandPhase),['prepared','final']);assert.deepEqual(d.conditions.statuses,['petrified']);}
