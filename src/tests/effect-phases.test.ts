import assert from 'node:assert/strict';
import fixture from '../../tests/fixtures/native-6.0.6/effect-phases.json';
import { DnD5eAdapter } from '../logic/adapter';
import { skillSource, skillContext } from './fixtures/skill-scenarios';
import { planEffects606 } from '../logic/preparation/effects';
const adapter=new DnD5eAdapter();
const failures:string[]=[];
for(const row of fixture.cases){
    const source=skillSource();source.effects=structuredClone(row.effects) as any;
    source.items.push(...structuredClone(row.items) as any);
    const before=structuredClone(source),prepared=adapter.prepareActorData(source,skillContext());
    const plan=planEffects606(source);
    assert.deepEqual(plan.decisions.filter(entry=>entry.id!=='fixtureEffect001').map(entry=>entry.status),row.expected.decisions,row.id);
    if('initial' in row.expected)assert.deepEqual(plan.initial.map(entry=>entry.key),row.expected.initial,row.id);
    if('final' in row.expected)assert.deepEqual(plan.final.map(entry=>entry.key),row.expected.final,row.id);
    const formula=adapter.getRollData(prepared,'skill','prc')?.formula,available=typeof formula==='string';
    if(row.expected.ready)assert.equal(formula,'formula' in row.expected?row.expected.formula:'1d20+5',row.id+'/qualified arithmetic');
    if('passive' in row.expected)assert.equal((prepared.derived.skills as any).prc.passive,row.expected.passive,row.id+'/earlier passive');
    if(available!==row.expected.ready)failures.push(row.id);
    assert.deepEqual(source,before);
}
console.log('Eligibility cases failing before correction:',JSON.stringify(failures));
assert.deepEqual(failures,[]);
