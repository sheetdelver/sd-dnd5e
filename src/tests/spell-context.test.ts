import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {spellContextCases,spellAttackCases,spellContextSource,spellContextContext} from './fixtures/spell-context-scenarios';
import {unavailableContexts} from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter(),failures:string[]=[];
const owned=(source:ReturnType<typeof spellContextSource>,context=spellContextContext())=>(adapter.prepareActorData(source,context).derived as any).ownedItems.items.SpellProbe000001;
for(const row of spellContextCases){try{
 const source=spellContextSource(row),before=structuredClone(source),c=owned(source).casting;
 assert.equal(c?.status,'ready',row.id+': '+c?.reason);assert.deepEqual(c.availableAbilities,row.expected.available,row.id);assert.equal(c.classIdentifier,row.expected.classIdentifier,row.id);assert.equal(c.activityAbility,row.expected.activity,row.id);assert.equal(c.modifier,row.expected.mod,row.id);assert.deepEqual(source,before);
}catch(error){failures.push(String(error));}}
for(const row of spellAttackCases){try{
 const source=spellContextSource(spellContextCases.find(c=>c.id===row.case)!,row.selection,row.ranged),before=structuredClone(source),attack=owned(source).activities[0].attack;
 assert.equal(attack.status,'ready',row.case+'/'+row.selection+': '+attack.reason);assert.equal(attack.value.ability,row.expected.ability);assert.equal(attack.value.total,row.expected.total,row.case+'/'+row.selection);assert.deepEqual(source,before);
}catch(error){failures.push(String(error));}}
if(failures.length){process.stderr.write(failures.slice(0,5).join('\n')+'\n');throw Error(`${failures.length}/144 spell ability/attack profiles failed`);}
for(const row of spellContextCases){const source=spellContextSource(row),before=structuredClone(source),expected=owned(source),probe=source.items.find(i=>i._id==='SpellProbe000001')!.system as any;
 probe.availableAbilities=['str'];probe.classIdentifier='poison';probe.spellcastingAbility='str';probe.activities.AttackProbe00001.attack.abilities=['str'];probe.activities.AttackProbe00001.attack.total=99;probe.activities.AttackProbe00001.attack.toHit=99;
 const poisoned=structuredClone(source),actual=owned(source);assert.deepEqual(actual.casting,expected.casting);assert.deepEqual(actual.activities[0].attack,expected.activities[0].attack);assert.deepEqual(source,poisoned);
 for(const {context}of unavailableContexts()){assert.equal(owned(source,context).casting.status,'unavailable');assert.equal(owned(source,context).activities[0].attack.value,null);assert.deepEqual(owned(source).casting,expected.casting);}
 assert.equal(before._id,source._id);
}
for(const [name,change]of [
 ['ability',(s:any)=>{s.items.at(-1).system.ability='unknown';}],
 ['source syntax',(s:any)=>{s.items.at(-1).system.sourceItem='class:wizard:extra';}],
 ['missing index',(s:any)=>{delete s.items[0].system.identifier;s.items[0].name='wizard';}],
 ['enchantment',(s:any)=>{s.items.at(-1).effects=[{type:'enchantment'}];}],
 ['ownership',(s:any)=>{s.items.at(-1).uuid='Actor.Other.Item.SpellProbe000001';}]
]as const){const source=spellContextSource(spellContextCases.find(c=>c.id==='linked-class')!);change(source);const before=structuredClone(source),fact=owned(source);assert.equal(fact.casting.status,'unavailable',name);assert.equal(fact.activities[0].attack.value,null,name);assert.deepEqual(source,before);}
{const source=spellContextSource(spellContextCases[0]);(source.items.at(-1)!.system as any).activities.AttackProbe00001.attack.ability='bogus';assert.equal(owned(source).activities[0].attack.value,null);}
process.stdout.write('R:16 spell source/initialized-class/Actor/Activity contexts and128 native-expected numeric spell attacks;poison,malformed/context recovery and source preservation PASS\n');
