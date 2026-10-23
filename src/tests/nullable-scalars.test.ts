import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {nullableScalarCases,zeroScalarCases,nullableScalarSource,nullableScalarContext} from './fixtures/nullable-scalar-scenarios';
import {unavailableContexts} from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of nullableScalarCases){try{
 const source=nullableScalarSource(row),original=structuredClone(source),a=adapter.prepareActorData(source,nullableScalarContext()),d=a.derived as any,id=JSON.stringify(row),receipt=d.effectPreparation.applied.findLast((r:any)=>r.key==='system.'+row.path);
 assert.equal(d.effectPreparation.reason,undefined,id);assert.equal(receipt?.before,row.before,id);assert.equal(receipt?.value,row.negativeZero?-0:row.expected,id);
 assert.equal(receipt?.initializedFrom,row.source==='null'?'source':'default',id);
 if(row.path.startsWith('attributes.hp.')){const key=row.path.split('.').at(-1)!;assert.equal(d.hp.status,'ready',id);assert.equal(d.hp[key],row.phase==='initial'?(key==='max'?row.expected??44:Math.min(row.expected??0,44)):row.expected,id);if(row.phase==='final')assert.equal(d.hp.effectiveMax,44,id);}
 if(row.path==='attributes.ac.override')assert.equal(d.armorClass.value,row.phase==='initial'?row.expected??12:12,id);
 assert.equal(adapter.getRollData(a,'skill','prc')?.formula,'1d20+5',id);assert.deepEqual(source,original,id);
 for(const {context}of unavailableContexts())assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);
 assert.equal(adapter.getRollData(adapter.prepareActorData(source,nullableScalarContext()),'skill','prc')?.formula,'1d20+5');
 }catch(error){failures.push(String(error));}}
for(const row of zeroScalarCases){try{const source=nullableScalarSource(row),original=structuredClone(source),a=adapter.prepareActorData(source,nullableScalarContext()),d=a.derived as any;assert.equal(d.effectPreparation.reason,undefined,JSON.stringify(row));assert.equal(d.effectPreparation.currentScalars['system.'+row.path],row.expected);assert.equal(d.armorClass.value,12);if(row.path.includes('.movement.')){assert.equal(d.movement.speeds.burrow,row.expected);assert.equal(d.movement.max,30);}assert.equal(adapter.getRollData(a,'skill','prc')?.formula,'1d20+5');assert.deepEqual(source,original);}catch(error){failures.push(String(error));}}
if(failures.length){process.stderr.write(failures.slice(0,4).join('\n')+'\n');throw Error(`${failures.length}/${nullableScalarCases.length+zeroScalarCases.length} native nullable/zero profiles failed`);}
// Malformed containers remain explicit boundaries; never clean over the source.
for(const path of ['hp','ac'])for(const invalid of [null,false,'bad',[]]){const source=nullableScalarSource(nullableScalarCases.find(row=>row.path===`attributes.${path}.${path==='hp'?'max':'override'}`)!),s=source.system as any;s.attributes[path]=invalid;const original=structuredClone(source),a=adapter.prepareActorData(source,nullableScalarContext());assert.equal(adapter.getRollData(a,'skill','prc'),null);assert.deepEqual(source,original);}
for(const value of ['@missing','1d4',true,null,{},'']){const source=nullableScalarSource({path:'attributes.ac.bonus',type:'multiply',delta:2});(source.effects![0]as any).system.changes[0].value=value;const original=structuredClone(source);assert.equal(adapter.getRollData(adapter.prepareActorData(source,nullableScalarContext()),'skill','prc'),null);assert.deepEqual(source,original);}
// Nonpersisted stale values cannot replace initialized scalar defaults.
{const source=nullableScalarSource({path:'attributes.ac.bonus',type:'downgrade',delta:2}),baseline=adapter.prepareActorData(source,nullableScalarContext());const s=source.system as any;s.attributes.ac.bonus=99;s.attributes.ac.min=99;s.attributes.ac.cover=99;s.attributes.hp.effectiveMax=99;s.attributes.hp.damage=99;s.attributes.hp.pct=99;const original=structuredClone(source),poisoned=adapter.prepareActorData(source,nullableScalarContext());for(const key of ['hp','armorClass','skills'])assert.deepEqual(poisoned.derived[key],baseline.derived[key]);assert.deepEqual(source,original);}
process.stdout.write(`R:${nullableScalarCases.length} nullable source/default/phase profiles and${zeroScalarCases.length} falsey prepared FormulaFields,malformed containers/source preservation/context recovery PASS\n`);
