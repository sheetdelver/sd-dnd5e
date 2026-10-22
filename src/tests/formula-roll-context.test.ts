import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {formulaSource} from './fixtures/formula-scenarios';
import {skillContext} from './fixtures/skill-scenarios';
const a=new DnD5eAdapter();
for(const [coefficient,prepared,current]of [[0,8,8],[.5,9,7],[1,11,11],[2,14,17]]){const source=formulaSource();(source.system as any).skills.prc.value=coefficient;const before=structuredClone(source),actor=a.prepareActorData(source,skillContext()),d=actor.derived as any;assert.equal(d.skills.prc.preparedTotal,prepared);assert.equal(d.skills.prc.total,current,'coefficient'+coefficient);assert.equal(d.skills.prc.passive,prepared+12);assert.equal(a.getRollData(actor,'skill','prc')?.formula,'1d20+'+current);assert.deepEqual(source,before);}

{const source=formulaSource();(source.system as any).skills.prc.value=2;const actor=a.prepareActorData(source,skillContext());assert.equal(a.getRollData(actor,'tool','thief',{skill:'prc'})?.formula,'2d20kh1+19');}
{const source=formulaSource();source.effects=[{_id:'target2',system:{changes:[{key:'system.rolls.ability.check.proficiency',value:2,type:'override'}]}}as any];const actor=a.prepareActorData(source,skillContext());assert.equal((actor.derived as any).abilities.wis.check.preparedTotal,12);assert.equal(a.getRollData(actor,'ability','wis')?.formula,'1d20+15');}

for(const [level,coefficient,prepared,current,passive]of [[0,.5,4,3,15],[20,.5,22,19,35],[20,2,31,37,44]]){const source=formulaSource();(source.items.find(i=>i.type==='class')!.system as any).levels=level;(source.system as any).skills.prc.value=coefficient;const actor=a.prepareActorData(source,skillContext()),d=actor.derived as any;assert.equal(d.skills.prc.preparedTotal,prepared);assert.equal(d.skills.prc.total,current);assert.equal(d.skills.prc.passive,passive);}

{const actor=a.prepareActorData(formulaSource(),skillContext());delete (actor.derived.checkConfiguration as any).formulaContext;assert.equal(a.getRollData(actor,'skill','prc'),null,'Old/incomplete execution metadata never restores a precomputed fallback');}
process.stdout.write('R: native @prof root replacement distinguishes prepared base from fresh selected proficiency PASS\n');
