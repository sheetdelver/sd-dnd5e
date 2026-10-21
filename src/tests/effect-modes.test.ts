import assert from 'node:assert/strict';
import { DnD5eAdapter } from '../logic/adapter';
import { modeEffectCases,modeEffectSource } from './fixtures/mode-effect-scenarios';
import { skillContext,unavailableContexts,setSkillRoll } from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter(),failures:string[]=[];
const formula=(mode:number,total:number)=>`${mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20'}+${total}`;
for(const row of modeEffectCases){
 const source=modeEffectSource(row),before=structuredClone(source),prepared=adapter.prepareActorData(source,skillContext()),e=row.expected;
 if(e){
  if(adapter.getRollData(prepared,'skill','prc')?.formula!==formula(e.mode,5)){failures.push(row.id);continue;}
  assert.equal((prepared.derived as any).skills.prc.passive,e.passive,row.id);
  assert.equal(adapter.getRollData(prepared,'skill','prc',{tool:'thief'})?.formula,formula(e.combinedMode,5),row.id);
  assert.equal(adapter.getRollData(prepared,'tool','thief',{skill:'prc',ability:'wis'})?.formula,formula(e.combinedToolMode,5),row.id);
  assert.equal(adapter.getRollData(prepared,'save','wis')?.formula,formula(e.saveMode,2),row.id);
  assert.equal(adapter.getRollData(prepared,'tool','thief')?.formula,formula(e.toolMode,4),row.id);
  assert.equal(adapter.getRollData(prepared,'ability','wis')?.formula,formula(e.abilityMode,2),row.id);
  for(const [advantage,mode] of [['normal',0],['adv',1],['dis',-1]] as const)assert.equal(adapter.getRollData(prepared,'skill','prc',{tool:'thief',advantage,situationalBonus:'2'})?.formula,formula(mode,5)+'+(2)',row.id);
  const bounded=structuredClone(source);setSkillRoll(bounded,'skills.prc.roll',{min:10});assert.equal(adapter.getRollData(adapter.prepareActorData(bounded,skillContext()),'skill','prc'),null,row.id);
  for(const {context} of unavailableContexts())assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null,row.id);
  assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,formula(e.mode,5));
 }else assert.equal(adapter.getRollData(prepared,'skill','prc'),null,row.id);
 assert.deepEqual(source,before,row.id);
}
console.log('Effect mode requests failing before:',JSON.stringify(failures));assert.deepEqual(failures,[]);
