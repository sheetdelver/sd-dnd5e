import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {transferredScalarCases,transferredScalarInput,transferredScalarSource,transferredScalarContext} from './fixtures/transferred-scalar-scenarios';
import {unavailableContexts} from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter(),failures:string[]=[];let count=0;
for(const c of transferredScalarCases)for(const includeUtility of c.utility?[false,true]:[false]){try{count++;
 const row=transferredScalarInput(c),source=transferredScalarSource(c,includeUtility),before=structuredClone(source),actor=adapter.prepareActorData(source,transferredScalarContext()),d=actor.derived as any,p=d.effectPreparation,key='system.'+c.path;
 assert.equal(p.reason,undefined,JSON.stringify(c));
 const receipt=p.applied.findLast((r:any)=>r.key===key&&r.phase==='final'),expected=c.expected.negativeZero?-0:c.expected.current;
 if(c.expected.active){assert.ok(receipt,JSON.stringify(c));assert.equal(receipt.itemId,'ExactGear');assert.equal(p.currentScalars[key],expected,JSON.stringify(c));}
 else assert.equal(receipt,undefined,JSON.stringify(c));
 if(c.path.startsWith('attributes.hp.')){const field=c.path.split('.').at(-1)!;assert.equal(d.hp[field],expected);assert.equal(d.hp.effectiveMax,c.path==='attributes.hp.tempmax'?46:44);}
 if(c.path==='attributes.movement.multiplier')assert.equal(d.movement.speeds.walk,30);
 if(c.path.startsWith('attributes.senses.'))assert.equal(d.senses.ranges[c.path.split('.').at(-1)!],expected);
 if(c.path==='attributes.ac.cover'){assert.equal(d.abilities.dex.saveRoll.preparedTotal,4);assert.equal(d.abilities.dex.saveRoll.total,2+Number(c.expected.current));assert.equal(d.armorClass.value,14);}
 if(c.family==='formula'&&'expectedArmorClass'in row)assert.equal(d.armorClass.value,row.expectedArmorClass);
 if(c.family==='formula'&&'expectedMax'in row){assert.equal(d.movement.max,row.expectedMax);assert.equal(d.movement.speeds[c.path.split('.').at(-1)!],c.expected.current);}
 if(c.family==='zero'){assert.equal(d.armorClass.value,12);if(c.path.includes('.movement.')){assert.equal(d.movement.speeds.burrow,c.expected.current);assert.equal(d.movement.max,30);}}
 if(includeUtility){const item=d.ownedItems.items.ExactGear,activity=item.activities[0];assert.equal(item.uses.remaining,2);assert.equal(activity.common.duration.value,2);assert.equal(activity.common.range.value,5);assert.equal(activity.uses.remaining,1);}
 const card=adapter.getActorCardData(actor);assert.ok(card.blocks);assert.equal(card.blocks.find(b=>b.title==='HP')?.value,d.hp.value);assert.equal(card.blocks.find(b=>b.title==='HP')?.subValue,'/ '+d.hp.effectiveMax);assert.equal(card.blocks.find(b=>b.title==='AC')?.value,d.armorClass.value);
 assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,'1d20+'+(2+(row.currentProf??3)));assert.deepEqual(source,before);
}catch(error){failures.push(String(error));}}
if(failures.length){process.stderr.write(failures.slice(0,4).join('\n')+'\n');throw Error(`${failures.length}/${count} transferred scalar profiles failed`);}
for(const c of transferredScalarCases.filter(c=>c.expected.active&&c.type==='weapon').slice(0,12)){
 const source=transferredScalarSource(c),s=source.system as any,baseline=adapter.prepareActorData(source,transferredScalarContext());s.attributes.ac.cover=99;s.attributes.ac.bonus=99;s.attributes.ac.min=99;s.attributes.movement.multiplier=99;s.attributes.hp.effectiveMax=99;const before=structuredClone(source),poison=adapter.prepareActorData(source,transferredScalarContext());for(const key of ['hp','armorClass','skills','senses','movement'])assert.deepEqual(poison.derived[key],baseline.derived[key]);assert.deepEqual(source,before);
 for(const {context}of unavailableContexts())assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);assert.ok(adapter.getRollData(adapter.prepareActorData(source,transferredScalarContext()),'skill','prc'));
 const gear=source.items!.at(-1)! as any;gear.system.activities={Unqualified:{_id:'Unqualified',type:'attack'}};assert.equal(adapter.getRollData(adapter.prepareActorData(source,transferredScalarContext()),'skill','prc'),null);
}
process.stdout.write('R:'+count+' native-expected empty/utility transferred scalar/nullable/formula/zero profiles,source/poison/context/Item-phase gates PASS\n');
