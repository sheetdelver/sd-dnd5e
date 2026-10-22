import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {itemCustomCases,itemCustomSource} from './fixtures/item-custom-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import {preparedRollFormula,rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of itemCustomCases){
 const source=itemCustomSource(row),before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any,key=row.field.split('.')[0];
 assert.deepEqual(source,before,row.id+'/source preservation');
 if(adapter.getRollData(actor,'skill','prc')?.formula!=='1d20+5'){failures.push(row.id);continue;}
 if(['dr','di','dv','ci'].includes(key))assert.deepEqual(d.defenses.categories[key].custom,row.expectedCustomLabels,row.id+'/defense text');
 else assert.deepEqual(d.training.categories[key==='armorProf'?'armor':key==='weaponProf'?'weapons':'languages'].entries.map((entry:any)=>entry.label),row.expectedCurrentLabels,row.id+'/training');
 assert.deepEqual(d.training.categories.languages.preparedSpoken,key==='languages'?row.expectedPreparedLabels:[],row.id+'/earlier labels');
 assert.deepEqual(d.effectPreparation.applied.map(({phase,before,value}:any)=>({phase,before,value})),row.expectedReceipts,row.id+'/phase receipts');
 assert.deepEqual(d.effectPreparation.applied.map(({effectId,itemId}:any)=>({effectId,...(itemId===undefined?{}:{itemId})})),row.expectedIdentities,row.id+'/effect and owned Item identities');
 for(const receipt of d.effectPreparation.applied)assert.equal(receipt.initializedFrom,Object.hasOwn(row.source,'custom')?'source':'default');
 for(const [kind,id,selection,sourceMode,total]of [['skill','prc',{},0,5],['tool','thief',{},0,5],['skill','prc',{tool:'thief'},1,5],['tool','thief',{skill:'prc',ability:'wis'},1,5],['ability','wis',{},0,2],['save','wis',{},0,2]]as const){
  for(const [advantage,mode]of [[undefined,sourceMode],['normal',0],['adv',1],['dis',-1]]as const){const opts={...selection,...(advantage?{advantage,situationalBonus:'2.5'}:{})};const formula=(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+'+'+total+(advantage?'+(2.5)':'');assert.equal(adapter.getRollData(actor,kind,id,opts)?.formula,formula,row.id+'/direct');assert.equal(preparedRollFormula(actor,kind,id,opts),formula,row.id+'/preview');}
 }
 assert.equal(d.skills.prc.passive,15);for(const [title,projection]of [['Defenses','defenses'],['Training','training']])assert.equal(adapter.getActorCardData(actor).blocks?.find(block=>block.title===title)?.value,d[projection].summary);
 for(const {context}of unavailableContexts()){assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,'1d20+5');}
 const poisoned=structuredClone(source);(poisoned.system as any).rolls={ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:99}]))};const poisonBefore=structuredClone(poisoned),again=adapter.prepareActorData(poisoned,skillContext());assert.deepEqual((again.derived as any).training,d.training);assert.deepEqual((again.derived as any).defenses,d.defenses);assert.equal(adapter.getRollData(again,'skill','prc')?.formula,'1d20+5');assert.deepEqual(poisoned,poisonBefore);
 const changed=structuredClone(source);changed.items.at(-1)!._id='differentOwnedItem';assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(adapter.prepareActorData(changed,skillContext()),'skill'),row.id+'/owned identity intent');
}
console.log('Transferred initial custom String failing-before:',failures.length,'of',itemCustomCases.length,failures.slice(0,4));assert.deepEqual(failures,[]);
const live=()=>itemCustomSource(itemCustomCases.find(row=>row.id==='transferred/initial/duplicates/languages.custom/add')!);
for(const kind of ['final','nontransfer','condition','dependency','rider','reference','missing-identity','empty-identity','malformed-source','malformed-delta']){
 const source=live(),item=source.items.at(-1)as any,effect=item.effects[0],change=effect.system.changes[0];
 if(kind==='final')change.phase='final';if(kind==='nontransfer')effect.transfer=false;if(kind==='condition')source.effects!.push({_id:'poisoned',type:'condition',statuses:['poisoned'],system:{type:'poisoned'}}as any);
 if(kind==='dependency')item.flags={dnd5e:{dependentOn:'not-guessed'}};if(kind==='rider')effect.system.rider={statuses:['poisoned']};if(kind==='reference')change.value='@abilities.wis.mod';if(kind==='missing-identity')delete item._id;if(kind==='empty-identity')item._id='';if(kind==='malformed-source')(source.system as any).traits.languages.custom=null;if(kind==='malformed-delta')change.value={text:'not coerced'};
 const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc')?.formula??null,kind==='final'?'1d20+5':null,kind);if(kind==='final'){assert.deepEqual((actor.derived as any).training.categories.languages.spoken,['Echo','Echo','RootEcho']);assert.deepEqual((actor.derived as any).training.categories.languages.preparedSpoken,['Echo','Echo','Root']);assert.equal((actor.derived as any).effectPreparation.applied[0].phase,'final');assert.equal((actor.derived as any).effectPreparation.applied[0].itemId,'customItem');}assert.deepEqual(source,before);
}
{const source=live();(source.system as any).skills.prc.roll={mode:-1,bonus:'2',min:10};const actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc'),null);assert.equal(adapter.getRollData(actor,'skill','prc',{advantage:'adv'}),null);assert.equal(adapter.getRollData(actor,'skill','prc',{advantage:'normal'})?.formula,'1d20min10+7');assert.equal((actor.derived as any).skills.prc.passive,12);}

for(const mode of [-1,0,1]){const source=live();(source.system as any).skills.prc.roll={mode,bonus:'2'};const actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+'+7');assert.equal((actor.derived as any).skills.prc.passive,17+5*mode);assert.equal(adapter.getRollData(actor,'skill','prc',{tool:'thief'})?.formula,(mode===-1?'1d20':'2d20kh1')+'+7');assert.equal(adapter.getRollData(actor,'tool','thief',{skill:'prc',ability:'wis'})?.formula,'2d20kh1+5');for(const [advantage,die]of [['normal','1d20'],['adv','2d20kh1'],['dis','2d20kl1']])assert.equal(adapter.getRollData(actor,'skill','prc',{advantage})?.formula,die+'+7');}
