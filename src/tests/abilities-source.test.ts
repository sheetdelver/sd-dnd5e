import assert from 'node:assert/strict';
import type { PreparedActorData } from '@sheet-delver/sdk';
import { DnD5eAdapter } from '../logic/adapter';
import { abilityCases, abilitySource } from './fixtures/ability-scenarios';
import { skillContext, unavailableContexts } from './fixtures/skill-scenarios';

const adapter = new DnD5eAdapter(), failures: string[] = [];
const formula = (total: number) => `1d20${total < 0 ? '' : '+'}${total}`;
for (const row of abilityCases) {
    const actor = abilitySource(row), before = structuredClone(actor), prepared = adapter.prepareActorData(actor, skillContext());
    try {
        const ability = (prepared.derived.abilities as Record<string, any>)[row.ability];
        assert.equal(ability.mod, row.sourceExpected.mod); assert.equal(ability.save, row.sourceExpected.save);
        assert.equal(adapter.getRollData(prepared, 'ability', row.ability)?.formula, formula(row.sourceExpected.check));
        assert.equal(adapter.getRollData(prepared, 'save', row.ability)?.formula, formula(row.sourceExpected.save));
    } catch { failures.push(row.id); }
    assert.deepEqual(actor, before);
}
assert.deepEqual(failures, [], 'Independent native method/static expectations must match both preparation and direct execution');

const baseRow = abilityCases[2];
const prepare = (actor = abilitySource(baseRow), context = skillContext()) => adapter.prepareActorData(actor, context);
const ability = (prepared: PreparedActorData) => (prepared.derived.abilities as Record<string, any>)[baseRow.ability];
const initial = prepare();
assert.equal(ability(initial).check.total, 5); assert.equal(ability(initial).saveRoll.total, 10);
assert.equal(initial.derived.profBonus, 3); assert.equal(initial.derived.level, 5);
assert.equal(adapter.getActorCardData(initial).blocks?.find(block => block.title === 'Prof')?.value, '+3');
assert.equal(adapter.getActorCardData(initial).blocks?.find(block => block.title === 'Level')?.value, 5);
assert.equal(adapter.getRollData(initial, 'save', baseRow.ability, { advantage: 'adv', situationalBonus: '2' })?.formula, '2d20kh1+10+(2)');
assert.equal(adapter.getRollData(initial, 'ability', baseRow.ability, { advantage: 'dis' })?.formula, '2d20kl1+5');
assert.equal(adapter.getRollData(initial, 'ability', baseRow.ability, { situationalBonus: '2+1d4' }), null);
for (const type of ['check', 'save']) for (const scope of ['ability', 'global']) for (const field of ['min', 'max']) {
    const actor = abilitySource(baseRow), system = actor.system as Record<string, any>;
    const target = scope === 'ability' ? system.abilities[baseRow.ability][type].roll : system.rolls.ability[type];
    target[field] = 10;
    const prepared = prepare(actor);
    const rollType = type === 'check' ? 'ability' : 'save';
    assert.equal(adapter.getRollData(prepared, rollType, baseRow.ability)?.formula, `1d20${field}10+${type==='check'?5:10}`);
    assert.equal(adapter.getRollData(prepared,rollType,baseRow.ability,{advantage:'adv'}),null);
    assert.equal(ability(prepared)[type === 'check' ? 'check' : 'saveRoll'].total, type === 'check' ? 5 : 10);
}
for (const { context } of unavailableContexts()) {
    const actor = abilitySource(baseRow), before = structuredClone(actor), unavailable = prepare(actor, context), recovered = prepare(actor);
    assert.equal(ability(unavailable).mod, null); assert.equal(ability(unavailable).save, null);
    assert.equal(adapter.getRollData(unavailable, 'ability', baseRow.ability), null);
    assert.equal(adapter.getRollData(unavailable, 'save', baseRow.ability), null);
    assert.equal(ability(recovered).check.total, 5); assert.equal(ability(recovered).save, 10);
    assert.deepEqual(actor, before);
}
const poisoned = abilitySource(baseRow), raw = (poisoned.system as Record<string, any>).abilities[baseRow.ability];
raw.mod = 99; raw.check.value = 99; raw.save.value = 99;
assert.equal(ability(prepare(poisoned)).mod, 2); assert.equal(ability(prepare(poisoned)).check.total, 5);
assert.equal(adapter.getRollData({ ...initial, derived: {} }, 'ability', baseRow.ability), null);
assert.equal(adapter.getRollData({ ...initial, derived: {} }, 'save', baseRow.ability), null);
for (const lifecycle of [undefined, { status: 'unavailable' }, { status: 'unsupported', profile: '2024' }]) {
    const retired = { ...initial, derived: { ...initial.derived, lifecycle } };
    for (const [type, key] of [['ability', 'wis'], ['save', 'wis'], ['skill', 'prc']]) {
        assert.equal(adapter.getRollData(retired, type, key), null, 'Retained prepared numbers cannot authorize an unknown/currently unavailable context');
    }
}
for (const [level, expectedSave] of [[1,4],[5,5],[9,6],[13,7],[17,8],[20,8]]) {
    const input = abilitySource({ ...abilityCases[1], levels: [level] });
    assert.equal(ability(adapter.prepareActorData(input, skillContext())).save, expectedSave);
}
for (const value of ['1d4', '1+2', {}, true]) {
    const input = abilitySource(baseRow), data = input.system as Record<string, any>;
    data.abilities.wis.save.roll.bonus = value;
    const output = prepare(input);
    assert.equal(ability(output).save, null); assert.equal(ability(output).check.total, 5);
}
console.log('R/S: shared source ability/check/save preparation and explicit execution/context gates: PASS (bounded profile)');
