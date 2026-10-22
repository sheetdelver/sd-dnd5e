import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {ruleCases,ruleSource,ruleContext} from './fixtures/applied-rule-scenarios';
const adapter=new DnD5eAdapter();
for (const row of ruleCases) {
 const source=ruleSource(row),before=structuredClone(source),actor=adapter.prepareActorData(source,ruleContext()),d=actor.derived as any,e=row.expected;
 assert.equal(d.skillChecks.prc.total,e.skill,row.id);
 assert.equal(d.skillChecks.prc.passive,e.passive,row.id);
 assert.equal(d.tools.thief.total,e.tool,row.id);
 assert.equal(d.abilities.wis.check.total,e.ability,row.id);
 assert.equal(d.abilities.wis.saveRoll.total,e.save,row.id);
 assert.equal(d.combatModifiers.abilities.dex.attack.value,e.attack,row.id);
 assert.equal(d.initiativeFacts.value,e.initiative,row.id);
 assert.equal(d.initiativeCheck.total,e.initiativeRoll??e.initiative,row.id);
 assert.equal(d.skillChecks.prc.sourceMode,e.mode,row.id);
 assert.deepEqual(d.skillChecks.prc.range,e.minimum||e.maximum?{minimum:e.minimum,maximum:e.maximum}:undefined);
 source.items.push({_id:'AttackProbe',name:'Exact weapon',type:'weapon',system:{
  proficient:1,type:{value:'simpleM'},activities:{attack:{_id:'attack',type:'attack',attack:{ability:'dex',type:{value:'melee',classification:'weapon'}}}}
 }} as any);
 const itemActor=adapter.prepareActorData(source,ruleContext());
 assert.equal((itemActor.derived as any).ownedItems.items.AttackProbe.activities[0].attack.value.total,e.itemAttack??e.attack,row.id+'/Item attack');
 source.items.pop();assert.deepEqual(source,before);
}
process.stdout.write('R:applied rule source/phase/order/filter/bonus/mode/range profiles PASS\n');

// Current options,source filters and prepared phases use the same interpretation.
{const source=ruleSource(ruleCases.find(r=>r.id==='ability-filter')!),actor=adapter.prepareActorData(source,ruleContext());assert.equal(adapter.getRollData(actor,'skill','prc',{ability:'dex'})?.formula,'1d20+5');assert.equal(adapter.getRollData(actor,'skill','prc',{tool:'thief'})?.formula,'2d20kh1+7');assert.equal(adapter.getRollData(actor,'skill','prc',{tool:'thief',advantage:'normal'})?.formula,'1d20+7');}
for(const patch of [{type:'dnd5e.bonus',value:'1d4'},{type:'dnd5e.bonus',value:'2',conditions:'{"k":"scene.darkness","v":1}'},{type:'dnd5e.minimum',value:'2.5'},{type:'dnd5e.minimum',value:'21'}]){const source=ruleSource(ruleCases[0]);(source.effects![0]as any).system.changes=[{key:'check',...patch}];const before=structuredClone(source),actor=adapter.prepareActorData(source,ruleContext());assert.equal(adapter.getRollData(actor,'skill','prc'),null);assert.ok((actor.derived as any).skillChecks.prc.unavailableReason);assert.deepEqual(source,before);}
{const source=ruleSource(ruleCases.find(r=>r.id==='normal-range')!),actor=adapter.prepareActorData(source,ruleContext());assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,'1d20min7max16+5');assert.equal(adapter.getRollData(actor,'skill','prc',{advantage:'adv'}),null);assert.equal((actor.derived as any).skillChecks.prc.passive,15);}
{const source=ruleSource(ruleCases.find(r=>r.id==='advantage')!);(source.effects![0]as any).system.conditions='{"o":"OR","v":[]}';const actor=adapter.prepareActorData(source,ruleContext());assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,'1d20+5');}
{const source=ruleSource(ruleCases[0]),effect=source.effects![0] as Record<string,unknown>;source.effects=[];source.items.push({_id:'RuleFeat',type:'feat',name:'Exact rule source',system:{},effects:[{...effect,transfer:true}]}as any);const before=structuredClone(source),actor=adapter.prepareActorData(source,ruleContext());assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,'1d20+7');assert.deepEqual(source,before);}
