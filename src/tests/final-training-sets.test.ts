import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {finalTrainingCases,finalTrainingSource} from './fixtures/final-training-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import {preparedRollFormula,rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of finalTrainingCases){
 const source=finalTrainingSource(row),before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any;
 assert.deepEqual(source,before);
 if(adapter.getRollData(actor,'skill','prc')?.formula!=='1d20+5'){failures.push(row.id);continue;}
 const c=d.training.categories,e=row.expectedAfter;
 assert.deepEqual(c.armor.sourceKeys,e['armorProf.value']);assert.deepEqual(c.weapons.sourceKeys,e['weaponProf.value']);assert.deepEqual(c.mastery.weaponKeys,e['weaponProf.mastery.value']);assert.deepEqual(c.mastery.additional.map((v:any)=>v.key),e['weaponProf.mastery.bonus']);assert.deepEqual(c.languages.sourceKeys,e['languages.value']);
 assert.deepEqual(c.languages.preparedKeys,row.expectedBefore['languages.value']);assert.deepEqual(c.languages.preparedSpoken,row.expectedSpokenBeforeAndAfter);assert.deepEqual(c.languages.spoken,row.expectedCallerSpoken);assert.equal(c.languages.display,row.expectedCallerSpoken.join('; ')||'None');
 if(JSON.stringify(row.expectedCallerSpoken)!==JSON.stringify(row.expectedSpokenBeforeAndAfter))assert.ok(c.languages.preparationNote);else assert.equal(c.languages.preparationNote,undefined);
 const applied=d.effectPreparation.applied.find((v:any)=>v.effectId==='finalTraining');assert.deepEqual(applied.before,(row.expectedBefore as any)[row.change.key.slice('system.traits.'.length)]);assert.deepEqual(applied.value,(row.expectedAfter as any)[row.change.key.slice('system.traits.'.length)]);assert.equal(applied.phase,'final');assert.equal(applied.operandPhase,'prepared');
 assert.equal(adapter.getActorCardData(actor).blocks?.find(block=>block.title==='Training')?.value,d.training.summary);
 for(const [advantage,prefix]of [[undefined,'1d20'],['normal','1d20'],['adv','2d20kh1'],['dis','2d20kl1']]as const){const options=advantage?{advantage,situationalBonus:'2'}:{};assert.equal(adapter.getRollData(actor,'skill','prc',options)?.formula,prefix+'+5'+(advantage?'+(2)':''));assert.equal(preparedRollFormula(actor,'skill','prc',options),prefix+'+5'+(advantage?'+(2)':''));}
 for(const {context}of unavailableContexts()){assert.equal((adapter.prepareActorData(source,context).derived as any).training.status,'unavailable');assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,'1d20+5');}
 const changed=structuredClone(source);(changed.effects![0]as any)._id='differentTraining';assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(adapter.prepareActorData(changed,skillContext()),'skill'));assert.deepEqual(source,before);
}
console.log('Final training Sets failing-before:',failures.length,'of',finalTrainingCases.length,failures.slice(0,4));assert.deepEqual(failures,[]);
for(const value of [undefined,null,true,[],{},'@traits.armorProf.value','[1]','["unknown"]']){const source=finalTrainingSource(finalTrainingCases[0]);(source.effects![0]as any).system.changes[0].value=value;const actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc'),null);assert.equal((actor.derived as any).training.status,'unavailable');}
for(const path of ['armorProf.value','weaponProf.value','weaponProf.mastery.value','weaponProf.mastery.bonus','languages.value']){
 const row=finalTrainingCases.find(row=>row.change.key==='system.traits.'+path)!,source=finalTrainingSource(row),parts=path.split('.');let target=(source.system as any).traits;for(const key of parts.slice(0,-1))target=target[key];target[parts.at(-1)!]=['unknown'];const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc'),null);assert.deepEqual(source,before);
}
{const source=finalTrainingSource(finalTrainingCases[0]);(source.effects![0]as any).system.changes=[{key:'system.traits.languages.value',type:'add',value:'["dwarvish"]',phase:'final',priority:0},{key:'system.traits.languages.value',type:'override',value:'["elvish"]',phase:'final',priority:1}];const actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any;assert.deepEqual(d.training.categories.languages.spoken,['Elvish']);assert.deepEqual(d.training.categories.languages.preparedSpoken,[]);assert.deepEqual(d.effectPreparation.applied.map((v:any)=>[v.before,v.value,v.operandPhase]),[[[],['dwarvish'],'prepared'],[['dwarvish'],['elvish'],'final']]);}
{const source=finalTrainingSource(finalTrainingCases[0]);source.items.push({_id:'finalTrainingItem',type:'tool',system:{equipped:true},effects:source.effects}as any);source.effects=[];assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc'),null);}
