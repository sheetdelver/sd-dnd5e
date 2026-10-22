import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {sourceFlagCases,sourceFlagSource,sourceFlagFormula as formula} from './fixtures/source-flag-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import {preparedRollFormula,rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of sourceFlagCases){
 const source=sourceFlagSource(row),before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any,e=row.expected;
 assert.deepEqual(source,before);
 if(adapter.getRollData(actor,'skill','prc')?.formula!==formula(e.sourceMode,e.skill)){failures.push(row.id);continue;}
 const card=adapter.getActorCardData(actor);assert.equal(card.blocks?.find(block=>block.title==='Level')?.value,row.level);assert.equal(card.blocks?.find(block=>block.title==='Prof')?.value,'+'+e.baseProficiency);
 assert.equal(d.skills.prc.prof,e.skillProf);assert.equal(d.skills.prc.passive,e.passive);assert.equal(d.tools.thief.prof,e.toolProf);assert.equal(d.initiativeFacts.value,e.initiative);assert.equal(d.initiativeFacts.score,e.score);assert.equal(d.characterFacts.proficiency.value,e.baseProficiency);
 for(const [kind,key,options,total,mode]of [['skill','prc',{},e.skill,e.sourceMode],['tool','thief',{},e.tool,e.sourceMode],['skill','prc',{tool:'thief'},e.combined,e.combinedMode],['tool','thief',{skill:'prc',ability:'wis'},e.combined,e.combinedMode],['ability','wis',{},e.check,e.sourceMode],['save','wis',{},e.save,0],['initiative','initiative',{},e.initiative,e.sourceMode]]as const){
  assert.equal(adapter.getRollData(actor,kind,key,options)?.formula,formula(mode,total),row.id+'/'+kind);assert.equal(preparedRollFormula(actor,kind,key,options),formula(mode,total));
  for(const [advantage,manual]of [['normal',0],['adv',1],['dis',-1]]as const)assert.equal(adapter.getRollData(actor,kind,key,{...options,advantage,situationalBonus:'2'})?.formula,formula(manual,total)+'+(2)');
 }
 const fixed=skillContext();(fixed.world!.settings as any)['dnd5e.initiativeScore']={status:'world',value:'all'};assert.equal(adapter.getRollData(adapter.prepareActorData(source,fixed),'initiative','initiative')?.formula,String(e.score));
 for(const {context}of unavailableContexts()){assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,formula(e.sourceMode,e.skill));}
 const change=structuredClone(source);change.flags={dnd5e:{originalActor:true}};assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(adapter.prepareActorData(change,skillContext()),'skill'));assert.deepEqual(source,before);
}
console.log('Source flags failing-before:',failures.length,'of',sourceFlagCases.length,failures.slice(0,4));assert.deepEqual(failures,[]);
for(const flag of ['jackOfAllTrades','initiativeAlert'])for(const value of [undefined,null,false,0,'']){const source=sourceFlagSource(sourceFlagCases[0]);source.flags={dnd5e:{[flag]:value}};const actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,'2d20kl1+2');assert.equal((actor.derived as any).initiativeFacts.value,2);}
for(const flag of ['jackOfAllTrades','initiativeAlert','remarkableAthlete','originalActor'])for(const value of [1,'true','false',[],{},true]){if(value===true&&['jackOfAllTrades','initiativeAlert'].includes(flag))continue;const source=sourceFlagSource(sourceFlagCases[0]);source.flags={dnd5e:{[flag]:value}};assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc'),null,flag+'/'+String(value));}
for(const flags of [true,[],{dnd5e:'bad'},{dnd5e:[]}]){const source=sourceFlagSource(sourceFlagCases[0]);source.flags=flags as any;assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc'),null);}
for(const alert of [false,true]){const source=sourceFlagSource(sourceFlagCases[0]);source.flags={dnd5e:{initiativeAlert:alert}};const context=skillContext();(context.world!.settings as any)['dnd5e.proficiencyModifier']={status:'world',value:'dice'};const actor=adapter.prepareActorData(source,context);assert.equal(adapter.getRollData(actor,'skill','prc'),null);assert.equal(adapter.getRollData(actor,'initiative','initiative')?.formula??null,alert?null:'2d20kl1+2');if(alert)assert.match((actor.derived as any).initiativeFacts.reason,/Proficiency dice/);}

// Final NumberField starts at Jack's earlier half, never the raw zero or a fresh target.
{const source=sourceFlagSource(sourceFlagCases[0]);source.flags={dnd5e:{jackOfAllTrades:true,initiativeAlert:true}};(source.items.find(item=>item.type==='class')!.system as any).levels=5;(source.system as any).rolls.ability.check.mode=0;source.effects!.push({_id:'JackFinal',type:'base',system:{changes:[{key:'system.skills.prc.value',type:'add',value:.5,phase:'final'}]}}as any);const actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any;assert.equal(d.effectPreparation.applied.find((v:any)=>v.effectId==='JackFinal').value,1);assert.equal(d.skills.prc.prof,.5);assert.equal(d.skills.prc.passive,13);assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,'1d20+3');assert.equal(d.initiativeFacts.value,5);}
// Numeric bonus scopes and normal-range compiler remain independent of these flags.
{const source=sourceFlagSource(sourceFlagCases[0]);source.flags={dnd5e:{jackOfAllTrades:true}};(source.system as any).skills.prc.roll={bonus:'2',min:10};const actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc',{advantage:'normal',situationalBonus:'-1.5'})?.formula,'1d20min10+4+(-1.5)');assert.equal(adapter.getRollData(actor,'skill','prc',{advantage:'adv'}),null);}
