import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {transferredFieldCases,transferredFieldInput,transferredFieldSource,transferredFieldContext} from './fixtures/transferred-field-scenarios';
import {unavailableContexts} from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const c of transferredFieldCases){try{
 const row=transferredFieldInput(c),source=transferredFieldSource(c),before=structuredClone(source),actor=adapter.prepareActorData(source,transferredFieldContext()),d=actor.derived as any,p=d.effectPreparation;
 assert.equal(p.reason,undefined,JSON.stringify(c));const receipt=p.applied.findLast((r:any)=>r.key===c.key&&r.phase==='final');if(c.expected.active){assert.equal(receipt?.itemId,'ExactGear');assert.deepEqual(receipt?.value,c.expected.current,JSON.stringify(c));}else assert.equal(receipt,undefined);
 if(c.family==='training'){
  const fields=d.training.categories,current=c.expected.active?row.expectedAfter:row.expectedBefore;
  assert.deepEqual(fields.armor.sourceKeys,current['armorProf.value']);assert.deepEqual(fields.weapons.sourceKeys,current['weaponProf.value']);assert.deepEqual(fields.mastery.weaponKeys,current['weaponProf.mastery.value']);assert.deepEqual(fields.mastery.additional.map((r:any)=>r.key),current['weaponProf.mastery.bonus']);assert.deepEqual(fields.languages.sourceKeys,current['languages.value']);
  assert.deepEqual(fields.languages.preparedSpoken,row.expectedSpokenBeforeAndAfter);assert.deepEqual(fields.languages.spoken,c.expected.active?row.expectedCallerSpoken:row.expectedSpokenBeforeAndAfter);
 }else if(c.family==='defense'){
  const current=c.expected.active?row.expectedAfter:row.expectedBefore;for(const key of ['dr','di','dv','ci','dm']){const fields=d.defenses.categories[key],expected=current[key];if('value'in expected)assert.deepEqual(fields.values,expected.value);assert.deepEqual(fields.bypasses,expected.bypasses??[]);}
 }else if(c.family==='custom'){
  const key=row.field.split('.')[0],training=['armorProf','weaponProf','languages'].includes(key),category=training?d.training.categories[key==='armorProf'?'armor':key==='weaponProf'?'weapons':'languages']:d.defenses.categories[key];
  if(training)assert.deepEqual(category.entries.map((r:any)=>r.label),c.expected.active?row.expectedCurrentLabels:row.expectedPreparedLabels);
  // The7 frozen canonical-prefix examples contain exactly1 known value;the
  // other fixtures contain none. Separate native custom labels from that prefix.
  else assert.deepEqual(category.custom,c.expected.active?row.expectedCustomLabels??row.expectedCurrentLabels:row.expectedPreparedLabels.slice(row.source.value?.length??0));
  if(key==='languages')assert.deepEqual(category.preparedSpoken,row.expectedPreparedLabels);
 }else{
  assert.equal(p.preparedFlags[row.key],row.initial);assert.equal(p.currentFlags[row.key],c.expected.current);const e=row.expected,current=c.expected.current,skill=2+Number(row.key==='jackOfAllTrades'&&current),tool=row.key==='toolExpertise'&&current?8:5,blocked=row.key==='halflingLucky'&&current,talent=row.key==='reliableTalent'&&current;
  assert.equal(d.skills.prc.preparedTotal,e.skill);assert.equal(d.skills.prc.total,skill);assert.equal(d.skills.prc.passive,e.passive);assert.equal(d.tools.thief.preparedTotal,e.tool);assert.equal(d.tools.thief.total,tool);assert.equal(d.abilities.wis.save,e.save);assert.equal(d.initiativeFacts.value,e.initiative);assert.equal(d.initiativeFacts.score,e.score);
  assert.equal(adapter.getRollData(actor,'skill','prc',{advantage:'normal'})?.formula??null,blocked?null:'1d20+'+skill);assert.equal(adapter.getRollData(actor,'tool','thief',{advantage:'normal'})?.formula??null,blocked?null:'1d20'+(talent?'min10':'')+'+'+tool);
 }
 if(c.family!=='flag')assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,'1d20+5');
 const card=adapter.getActorCardData(actor);assert.equal(card.blocks?.find(b=>b.title==='Training')?.value,d.training.summary);assert.equal(card.blocks?.find(b=>b.title==='Defenses')?.value,d.defenses.summary);assert.deepEqual(source,before);
}catch(error){failures.push(String(error));}}
if(failures.length){process.stderr.write(failures.slice(0,4).join('\n')+'\n');throw Error(`${failures.length}/${transferredFieldCases.length} transferred field profiles failed`);}
for(const family of ['training','defense','custom','flag']){
 const c=transferredFieldCases.find(c=>c.family===family&&c.expected.active&&c.type==='weapon'&&JSON.stringify(c.expected.current)!==JSON.stringify(c.expected.before))!,source=transferredFieldSource(c),ready=adapter.prepareActorData(source,transferredFieldContext());for(const {context}of unavailableContexts())assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);assert.deepEqual(adapter.prepareActorData(source,transferredFieldContext()).derived,ready.derived);
 const empty=transferredFieldSource(c,false),emptyBefore=structuredClone(empty),emptyReady=adapter.prepareActorData(empty,transferredFieldContext());assert.equal((emptyReady.derived as any).effectPreparation.reason,undefined);assert.deepEqual((emptyReady.derived as any).effectPreparation.applied.findLast((r:any)=>r.key===c.key).value,c.expected.current);assert.deepEqual(empty,emptyBefore);
 const poison=structuredClone(source),s=poison.system as any;s.rolls??={};s.rolls.ability??={};for(const k of ['check','save','skill','tool'])s.rolls.ability[k]={...s.rolls.ability[k],proficiency:99};s.skills.prc.total=999;s.skills.prc.passive=999;const poisonBefore=structuredClone(poison),poisonReady=adapter.prepareActorData(poison,transferredFieldContext());for(const key of ['training','defenses','skills','tools'])assert.deepEqual(poisonReady.derived[key],ready.derived[key]);assert.deepEqual(poison,poisonBefore);
 const before=structuredClone(source);(source.items!.at(-1)!as any).system.activities={Unknown:{_id:'Unknown',type:'attack'}};assert.equal(adapter.getRollData(adapter.prepareActorData(source,transferredFieldContext()),'skill','prc'),null);assert.notDeepEqual(source,before);
}
process.stdout.write('R:'+transferredFieldCases.length+' native-expected transferred Sets/custom Strings/flags,shared Card/current facts,source preservation and context/Item gates PASS\n');
