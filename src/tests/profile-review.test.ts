import assert from 'node:assert/strict';
import { DnD5eAdapter } from '../logic/adapter';
import { skillSource, skillContext, unavailableContexts } from './fixtures/skill-scenarios';
import { abilitySource, abilityCases } from './fixtures/ability-scenarios';
const adapter = new DnD5eAdapter(), failures: string[] = [];
const cases = unavailableContexts().map(row => ({ ...row, actor: skillSource(), expected: null }));
const invalid = skillSource(); (invalid.items[0].system as any).levels = 'unknown';
cases.push({ id: 'invalid-class', actor: invalid, context: skillContext(), expected: null });
const poison = skillSource(); Object.assign(poison.system as any, { details: { level: 99 }, attributes: { prof: 99 } });
cases.push({ id: 'unsupported-poison', actor: poison, context: unavailableContexts()[1].context, expected: null });
for (const row of cases) {
    const before = structuredClone(row.actor), prepared = adapter.prepareActorData(row.actor, row.context), card = adapter.getActorCardData(prepared);
    try {
        assert.equal(prepared.derived.level, null); assert.equal(prepared.derived.profBonus, null);
        assert.equal(card.blocks?.find(b => b.title === 'Level')?.value, '—');
        assert.equal(card.blocks?.find(b => b.title === 'Prof')?.value, '—');
        const recovered = adapter.prepareActorData(skillSource(), skillContext());
        assert.equal(recovered.derived.level, 5); assert.equal(recovered.derived.profBonus, 3);
    } catch { failures.push('DD-R03/'+row.id); }
    assert.deepEqual(row.actor, before);
}
for (const scope of ['check','save','skill','tool']) {
    const actor = abilitySource(abilityCases[1]), system = actor.system as any;
    if (scope === 'save') system.abilities.wis.proficient = 0;
    const baseline = adapter.prepareActorData(actor, skillContext());
    system.rolls.ability[scope] ??= {}; system.rolls.ability[scope].proficiency = scope === 'save' ? 1 : 2;
    const before = structuredClone(actor), prepared = adapter.prepareActorData(actor, skillContext());
    try {
        assert.deepEqual(prepared.derived.abilities, baseline.derived.abilities);
        assert.deepEqual(prepared.derived.skillChecks, baseline.derived.skillChecks);
    } catch { failures.push('DD-R04/'+scope); }
    assert.deepEqual(actor, before);
}
const armor = skillSource();
armor.items.push({ _id: 'armor', name: 'Armor', type: 'equipment', system: { equipped: true } } as any);
const poisonedKnown = adapter.prepareActorData(poison, skillContext());
assert.equal(poisonedKnown.derived.level, 5); assert.equal(poisonedKnown.derived.profBonus, 3);
const armored = adapter.prepareActorData(armor, skillContext());
assert.equal(armored.derived.level, 5); assert.equal(armored.derived.profBonus, 3);
assert.equal(adapter.getRollData(armored, 'skill', 'prc'), null, 'Known class facts do not qualify equipment rules');
for (const value of [99, null, '2', true, {}, -1]) for (const scope of ['check','save','skill','tool']) {
    const actor = skillSource(), baseline = adapter.prepareActorData(actor, skillContext());
    const system = actor.system as any;
    system.rolls ??= {}; system.rolls.ability ??= {}; system.rolls.ability[scope] ??= {};
    system.rolls.ability[scope].proficiency = value;
    const before = structuredClone(actor), prepared = adapter.prepareActorData(actor, skillContext());
    assert.deepEqual(prepared.derived.skillChecks, baseline.derived.skillChecks);
    assert.deepEqual(prepared.derived.abilities, baseline.derived.abilities);
    assert.deepEqual(actor, before);
}
const affected = skillSource(); affected.effects = [{ disabled: false, changes: [{ key: 'system.rolls.ability.check.proficiency', value: 2 }] }] as any;
const unavailable = adapter.prepareActorData(affected, skillContext());
assert.equal(unavailable.derived.level, null);
assert.equal(adapter.getRollData(unavailable, 'ability', 'wis'), null, 'Unqualified effects cannot be simulated by source overrides');
const persisted = skillSource(), system = persisted.system as any;
system.rolls = { ability: { check: { bonus: '2', proficiency: 99 } } };
assert.equal(adapter.getRollData(adapter.prepareActorData(persisted, skillContext()), 'skill', 'prc')?.formula, '1d20+7');
system.skills.prc.value = 2;
assert.equal(adapter.getRollData(adapter.prepareActorData(persisted, skillContext()), 'skill', 'prc')?.formula, '1d20+10');
system.rolls.ability.check.min = 10;
assert.equal(adapter.getRollData(adapter.prepareActorData(persisted, skillContext()), 'skill', 'prc'), null);
delete system.rolls.ability.check.min; system.rolls.ability.check.mode = 9;
assert.equal(adapter.getRollData(adapter.prepareActorData(persisted, skillContext()), 'skill', 'prc'), null);
console.log('R: DD-R03 fact availability and DD-R04 source/default invariance PASS; review failures:', failures);
assert.deepEqual(failures, []);
