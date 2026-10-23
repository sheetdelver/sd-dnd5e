import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {healthCases,healthSource} from './fixtures/health-scenarios';
import {skillContext,skillWorld,unavailableContexts} from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of healthCases){
 const source=healthSource(row),before=structuredClone(source),prepared=adapter.prepareActorData(source,skillContext()),d=prepared.derived as any;
 if(row.expected){
  const e=row.expected;if(d.hp?.max!==e.max||d.hp?.value!==e.value||d.hp?.effectiveMax!==e.effectiveMax){failures.push(row.id);continue;}
  assert.equal(d.hp.status,'ready');assert.equal(d.hp.temp,e.temp);assert.equal(d.hitDice.max,e.hdMax);assert.equal(d.hitDice.value,e.hdValue);assert.deepEqual(d.hitDice.bySize,e.bySize);
  const card=adapter.getActorCardData(prepared),hp=card.blocks!.find(block=>block.title==='HP')!;assert.equal(hp.value,e.value);assert.equal(hp.subValue,`/ ${e.effectiveMax}`);
 }else{
  if(d.hp?.status!==('hpUnavailable' in row&&row.hpUnavailable?'unavailable':'ready')||d.hitDice?.status!==('hdUnavailable' in row&&row.hdUnavailable?'unavailable':'ready')){failures.push(row.id);continue;}
 }
 if('availableHp' in row&&row.availableHp)for(const [key,value] of Object.entries(row.availableHp))assert.equal(d.hp[key],value,row.id);
 if('availableHd' in row&&row.availableHd)for(const [key,value] of Object.entries(row.availableHd))assert.equal(d.hitDice[key],value,row.id);
 for(const {context} of unavailableContexts()){
  const lost=adapter.prepareActorData(source,context);assert.equal((lost.derived.hp as any).status,'unavailable');assert.equal((lost.derived.hitDice as any).status,'unavailable');
  const recovered=adapter.prepareActorData(source,skillContext());assert.deepEqual(recovered.derived.hp,d.hp,row.id);assert.deepEqual(recovered.derived.hitDice,d.hitDice,row.id);
 }
 assert.deepEqual(source,before,row.id);assert.equal(Object.isFrozen(source.items.find(item=>item.type==='class')?.system.advancement),false,row.id);
}
const invalidId=healthSource(healthCases[4]);invalidId.items.find(item=>item.type==='class')!._id='bad.identity';const independent=adapter.prepareActorData(invalidId,skillContext());assert.equal((independent.derived.hp as any).max,20);assert.equal((independent.derived.hitDice as any).status,'unavailable');
const legacyWorld=skillWorld();(legacyWorld.settings as any)['dnd5e.rulesVersion']={status:'world',value:'legacy'};const legacy=adapter.prepareActorData(healthSource(healthCases[4]),skillContext(legacyWorld));assert.equal((legacy.derived.hp as any).status,'legacy-unqualified');assert.equal((legacy.derived.hp as any).value,8);assert.equal((legacy.derived.hp as any).max,20);
const armored=healthSource(healthCases[0]);armored.items.push({_id:'armorFixture',type:'equipment',name:'Unresolved armor',system:{equipped:true}} as any);const independentArmor=adapter.prepareActorData(armored,skillContext());assert.equal((independentArmor.derived.hp as any).max,10);assert.equal(adapter.getRollData(independentArmor,'skill','prc'),null);
const tokenIdentity=healthSource(healthCases[0]);(tokenIdentity as any).uuid='Scene.offline.Token.synthetic.Actor.fixture';const unqualifiedIdentity=adapter.prepareActorData(tokenIdentity,skillContext());assert.equal((unqualifiedIdentity.derived.hp as any).status,'unavailable');
console.log('Health source requests failing before:',JSON.stringify(failures));assert.deepEqual(failures,[]);
