import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {physicalSource,physicalContext} from './fixtures/physical-scenarios';
import {unavailableContexts} from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter(),source=physicalSource(),before=structuredClone(source),actor=adapter.prepareActorData(source,physicalContext()),physical=(actor.derived as any).physical;
assert.equal(physical?.weight.value,26,'2lb +1 container currency +6kg nested +6lb loose +2 Actor currency;native mixed units' );
assert.equal(physical.items.outer.totalWeight.value,18);assert.equal(physical.items.inner.totalWeight.value,6);assert.equal(physical.items.outer.capacity.value.value,3);assert.equal(physical.items.inner.capacity.value.value,5);
assert.equal(physical.encumbrance.value.thresholds.maximum,150);assert.deepEqual(physical.currency.value,{pp:0,gp:50,ep:0,sp:50,cp:0});assert.deepEqual(source,before);
const weightless=structuredClone(source);(weightless.items.find(i=>i._id==='inner')!.system as any).properties=['weightlessContents'];const hidden=adapter.prepareActorData(weightless,physicalContext()).derived as any;assert.equal(hidden.physical.weight.value,13.5);assert.equal(hidden.physical.items.inner.capacity.value.value,5);
const poison=structuredClone(source);(poison.system as any).attributes.encumbrance={value:999,max:999,multipliers:{overall:'99'},bonuses:{overall:'999'}};(poison.items.find(i=>i._id==='outer')!.system as any).totalWeight=999;assert.deepEqual((adapter.prepareActorData(poison,physicalContext()).derived as any).physical,physical);
for(const {context}of unavailableContexts()){assert.equal((adapter.prepareActorData(source,context).derived as any).physical.weight.value,null);assert.equal((adapter.prepareActorData(source,physicalContext()).derived as any).physical.weight.value,26);}

for(const [metric,currency,expected]of [[false,true,26],[false,false,20.5],[true,true,9.7],[true,false,8.2]]as const){const p=(adapter.prepareActorData(source,physicalContext(metric,currency)).derived as any).physical;assert.equal(p.weight.value,expected);assert.equal(p.encumbrance.value.max,metric?75:150);assert.equal(p.items.outer.capacity.value.value,3);}
for(const [size,multiplier]of [['tiny',.5],['sm',1],['med',1],['lg',2],['huge',4],['grg',8]]as const){const changed=structuredClone(source);(changed.system as any).traits.size=size;assert.equal((adapter.prepareActorData(changed,physicalContext()).derived as any).physical.encumbrance.value.max,150*multiplier);changed.flags={dnd5e:{powerfulBuild:true}};const stronger={tiny:1,sm:1,med:2,lg:4,huge:8,grg:8}[size];assert.equal((adapter.prepareActorData(changed,physicalContext()).derived as any).physical.encumbrance.value.max,150*stronger);}
for(const [label,mutate]of [
 ['dangling',(s:any)=>s.items.find((i:any)=>i._id==='cargo').system.container='gone'],
 ['cycle',(s:any)=>s.items.find((i:any)=>i._id==='outer').system.container='inner'],
 ['self',(s:any)=>s.items.find((i:any)=>i._id==='outer').system.container='outer'],
 ['wrong-parent',(s:any)=>s.items.find((i:any)=>i._id==='cargo').system.container='loose'],
 ['quantity-null',(s:any)=>s.items.find((i:any)=>i._id==='cargo').system.quantity=null],
 ['quantity-text',(s:any)=>s.items.find((i:any)=>i._id==='cargo').system.quantity='2'],
 ['units',(s:any)=>s.items.find((i:any)=>i._id==='cargo').system.weight.units='pounds'],
 ['coin-null',(s:any)=>s.system.currency={gp:null}],
 ['item-coins',(s:any)=>s.items.find((i:any)=>i._id==='inner').system.currency={gp:'50'}],
 ['properties',(s:any)=>s.items.find((i:any)=>i._id==='inner').system.properties='weightlessContents'],
 ['capacity',(s:any)=>s.items.find((i:any)=>i._id==='inner').system.capacity={weight:{value:-1}}],
 ['target-effect',(s:any)=>s.items.find((i:any)=>i._id==='inner').effects=[{_id:'local',type:'enchantment'}]],
]as const){const changed=structuredClone(source)as any;mutate(changed);const saved=structuredClone(changed),p=(adapter.prepareActorData(changed,physicalContext()).derived as any).physical;assert.equal(p.weight.value,null,label);assert.match(p.weight.reason,/.+/);assert.deepEqual(changed,saved);assert.equal((adapter.prepareActorData(source,physicalContext()).derived as any).physical.weight.value,26);}
{const changed=structuredClone(source)as any;changed.items.find((i:any)=>i._id==='inner').system.properties=['unidentifiedContents'];changed.items.find((i:any)=>i._id==='inner').system.identified=false;changed.items[0].system.container='outer';const p=(adapter.prepareActorData(changed,physicalContext()).derived as any).physical;assert.equal(p.weight.value,26,'Native visible total remains independent of contents visibility and undeclared class container poison');assert.equal(p.items.inner.capacity.value,null);assert.equal(p.items.inner.contentsCount.value,null);assert.equal(p.items.outer.capacity.value.value,3);}

{const zero=physicalSource();zero.items=zero.items.filter(i=>i.type==='class');(zero.system as any).currency={};(zero.system as any).abilities.str.value=0;const p=(adapter.prepareActorData(zero,physicalContext()).derived as any).physical;assert.equal(p.weight.value,0);assert.equal(p.encumbrance.value.max,0);assert.equal(p.encumbrance.value.percent,null,'Native0/0 percentage is not a usable number');}
process.stdout.write('R: source physical tree,coins,units,capacity,size thresholds,12 malformed cases,hidden data and poison/context recovery PASS\n');
