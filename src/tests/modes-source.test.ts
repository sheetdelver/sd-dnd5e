import assert from 'node:assert/strict';
import { DnD5eAdapter } from '../logic/adapter';
import { skillSource, skillContext, setSkillRoll } from './fixtures/skill-scenarios';
import fixture from '../../tests/fixtures/native-6.0.6/skill-modes.json';
const adapter = new DnD5eAdapter(); let failures = 0;
for (const row of fixture.cases) {
    const source = skillSource();
    fixture.scopeOrder.forEach((scope, i) => setSkillRoll(source, scope, { mode: row.modes[i] }));
    const before = structuredClone(source), prepared = adapter.prepareActorData(source, skillContext()), check = (prepared.derived.skillChecks as any).prc;
    const die = row.expectedMode === 1 ? '2d20kh1' : row.expectedMode === -1 ? '2d20kl1' : '1d20';
    try { assert.equal(check.total, row.expectedTotal); assert.equal(check.passive, row.expectedPassive); assert.equal(adapter.getRollData(prepared, 'skill', 'prc')?.formula, die+'+5'); }
    catch { failures++; }
    assert.equal(adapter.getRollData(prepared, 'skill', 'prc', {advantage:'normal'})?.formula, '1d20+5');
    assert.equal(adapter.getRollData(prepared, 'skill', 'prc', {advantage:'adv'})?.formula, '2d20kh1+5');
    assert.equal(adapter.getRollData(prepared, 'skill', 'prc', {advantage:'dis',situationalBonus:'2'})?.formula, '2d20kl1+5+(2)');
    const bounded = structuredClone(source); (bounded.system as any).skills.prc.roll.min = 10;
    const blocked = adapter.prepareActorData(bounded, skillContext());
    assert.equal((blocked.derived.skillChecks as any).prc.passive, row.expectedPassive);
    assert.equal(adapter.getRollData(blocked, 'skill', 'prc')?.formula??null,row.expectedMode===0?'1d20min10+5':null);
    assert.equal(adapter.getRollData(blocked,'skill','prc',{advantage:'normal'})?.formula,'1d20min10+5');
    assert.equal(adapter.getRollData(blocked,'skill','prc',{advantage:'adv'}),null);
    assert.deepEqual(source, before);
}
assert.equal(failures, 0, 'Independent81 source mode/passive cases');
for (const value of [null, 2, '1', {}, true]) {
    const source = skillSource(); setSkillRoll(source, 'skills.prc.roll', {mode:value});
    assert.equal(adapter.getRollData(adapter.prepareActorData(source, skillContext()), 'skill', 'prc'), null);
}
for (const type of ['check','save']) for (const a of [-1,0,1]) for (const b of [-1,0,1]) {
    const source = skillSource(), system = source.system as any;
    system.abilities.wis.proficient = 1;
    setSkillRoll(source, `abilities.wis.${type}.roll`, {mode:a}); setSkillRoll(source, `rolls.ability.${type}`, {mode:b});
    const mode = ([a,b].includes(1)?1:0)-([a,b].includes(-1)?1:0);
    const die = mode === 1 ? '2d20kh1' : mode === -1 ? '2d20kl1' : '1d20';
    assert.equal(adapter.getRollData(adapter.prepareActorData(source, skillContext()), type === 'check'?'ability':'save','wis')?.formula, die+(type === 'check'?'+2':'+5'));
}
const poisoned = skillSource(); setSkillRoll(poisoned,'skills.prc.roll',{mode:1,modeCounts:{override:-1}});
const ignoredCounts=adapter.prepareActorData(poisoned,skillContext());
assert.equal((ignoredCounts.derived.skillChecks as any).prc.sourceMode,1);
assert.equal((ignoredCounts.derived.skillChecks as any).prc.passive,20);
assert.equal(adapter.getRollData(ignoredCounts,'skill','prc')?.formula,'2d20kh1+5');
const large=skillSource();setSkillRoll(large,'skills.prc.roll',{bonus:1000000001});
const limited=adapter.prepareActorData(large,skillContext());
assert.equal((limited.derived.skillChecks as any).prc.total,1000000006);assert.equal(adapter.getRollData(limited,'skill','prc'),null);
assert.equal(adapter.getRollData(adapter.prepareActorData(skillSource(),skillContext()),'skill','prc',{situationalBonus:'1000000001'}),null);
console.log('R/S:81 source mode/passive cases PASS');
