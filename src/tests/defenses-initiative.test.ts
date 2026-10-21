import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {defenseCases,defenseSource,defenseContext} from './fixtures/defense-scenarios';
import {unavailableContexts} from './fixtures/skill-scenarios';
import {preparedRollFormula,preparedRollAvailable,rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of defenseCases){
 const source=defenseSource(row),before=structuredClone(source),prepared=adapter.prepareActorData(source,defenseContext(row)),d=prepared.derived as any,e=row.expected;
 if(d.ac!==e.ac||d.initiative!==e.total){failures.push(row.id);continue;}
 if(e.total!==null){assert.equal(d.initiativeFacts.score,e.score,row.id);if(row.calculation)assert.equal(d.armorClass.calculation,row.calculation,row.id);}
 const expected=e.total===null||row.executionUnavailable?null:e.fixed?String(e.rollBonus):`${e.mode===1?'2d20kh1':e.mode===-1?'2d20kl1':'1d20'}${e.total!<0?'':'+'}${e.total}${row.settings?.tie&&!e.fixed?'+0.14':''}`;
 assert.equal(adapter.getRollData(prepared,'initiative','initiative')?.formula??null,expected,row.id);
 if(expected===null)assert.throws(()=>adapter.getInitiativeFormula(prepared),row.id);else assert.equal(adapter.getInitiativeFormula(prepared),expected,row.id);
 for(const {context} of unavailableContexts()){
  const lost=adapter.prepareActorData(source,context);assert.equal(lost.derived.ac,null);assert.equal(lost.derived.initiative,null);assert.equal(adapter.getRollData(lost,'initiative','initiative'),null);assert.throws(()=>adapter.getInitiativeFormula(lost));
 }
 assert.equal(adapter.getRollData(prepared,'initiative','missing'),null);
 assert.equal(preparedRollFormula(prepared,'initiative','missing'),null);
 assert.equal(preparedRollAvailable(prepared,'initiative','missing'),false);
 assert.notEqual(rollIntentSignature(prepared,'initiative'),rollIntentSignature({...prepared,uuid:'Actor.other'},'initiative'));
 assert.equal(adapter.getRollData(prepared,'initiative','initiative',{ability:'missing'}),null);
 if(expected!==null){
  if(e.fixed){assert.equal(adapter.getRollData(prepared,'initiative','initiative',{advantage:'adv'}),null);assert.equal(adapter.getRollData(prepared,'initiative','initiative',{situationalBonus:'2'}),null);}
  else for(const [advantage,die] of [['normal','1d20'],['adv','2d20kh1'],['dis','2d20kl1']] as const)assert.equal(adapter.getRollData(prepared,'initiative','initiative',{advantage,situationalBonus:'2'})?.formula,`${die}${e.total!<0?'':'+'}${e.total}${row.settings?.tie?'+0.14':''}+(2)`,row.id);
 }
 assert.deepEqual(source,before,row.id);
}
const {healthCases,healthSource}=await import('./fixtures/health-scenarios');const {skillContext}=await import('./fixtures/skill-scenarios');const resource=adapter.prepareActorData(healthSource(healthCases[3]),skillContext());assert.deepEqual((resource.derived as any).combatStats.hp,{value:32,max:32});assert.deepEqual((resource.derived as any).combatStats.hitDice,{value:3,max:4});
console.log('AC/initiative source cases failing before:',JSON.stringify(failures));assert.deepEqual(failures,[]);
