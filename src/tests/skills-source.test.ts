import assert from 'node:assert/strict';
import type { ActorPreparationContext, FoundryActor, ModuleWorldSnapshot, WorldSettingResult } from '@sheet-delver/sdk';
import info from '../../info.json';
import source from '../../tests/fixtures/native-6.0.6/source-before.json';
import expected from '../../tests/fixtures/native-6.0.6/expected.json';
import { DnD5eAdapter } from '../logic/adapter';

const world: ModuleWorldSnapshot = { identity: { instanceId: 'offline', worldId: 'fixture', systemId: 'dnd5e', systemVersion: '6.0.6',
    foundryGeneration: 14, foundryBuild: '367', runtimeEpoch: 1, contextRevision: 7 }, settings: Object.fromEntries(info.worldSettings.map(row => [row.key,
        { status: 'world', value: row.key === 'dnd5e.calendarConfig' ? { enabled: false, dailyRecovery: '' } : row.default?.value }])) as Record<string, WorldSettingResult> };
const context: ActorPreparationContext = { world, worldEpoch: 1, contextRevision: 7, sourceRevision: 1, systemId: 'dnd5e', systemVersion: '6.0.6' };
const adapter = new DnD5eAdapter();
const before = structuredClone(source);
const prepared = adapter.prepareActorData(source as unknown as FoundryActor, context);
const skills = prepared.derived.skills as Record<string, { total: number | null; prof: number; formula: string | null; unavailableReason?: string }>;
assert.equal(skills.prc.total, expected.skill.total);
assert.equal(skills.prc.prof, expected.skill.proficiencyMultiplier);
assert.equal(prepared.derived.passivePerception, expected.skill.passive);
assert.equal(adapter.getRollData(prepared, 'skill', 'prc')?.formula, expected.skill.formula);
assert.equal(adapter.getRollData(prepared, 'skill', 'prc', { advantage: 'adv', situationalBonus: '2' })?.formula, '2d20kh1+5+(2)');
assert.equal(adapter.getRollData(prepared, 'skill', 'prc', { advantage: 'dis', situationalBonus: '-2' })?.formula, '2d20kl1+5+(-2)');
assert.equal(adapter.getRollData(prepared, 'skill', 'prc', { situationalBonus: '1+1d4' }), null);
assert.equal(adapter.getRollData(prepared, 'skill', 'prc', { ability: 'dex' })?.formula,'1d20+3','C76 default Dexterity10 supports explicit alternate ability');
assert.equal(adapter.getRollData(prepared, 'skill', 'prc', { advantage: 'invalid' }), null);
assert.deepEqual(source, before);
// Persisted source is authoritative; fake prepared-looking totals cannot win.
const poisoned = structuredClone(source);
Object.assign(poisoned.system.skills.prc, { total: 99, passive: 109 });
assert.equal((adapter.prepareActorData(poisoned as unknown as FoundryActor, context).derived.skills as typeof skills).prc.total, 5);
// Independent table: WIS+2 and native proficiency by class level; half rounds down.
for (const [level, multiplier, total, passive] of [[1, 0, 2, 12], [5, .5, 3, 13], [9, 1, 6, 16], [13, 2, 12, 22], [17, 2, 14, 24], [20, 1, 8, 18]]) {
    const actor = structuredClone(source);
    actor.items[0].system.levels = level;
    actor.system.skills.prc.value = multiplier;
    const result = adapter.prepareActorData(actor as unknown as FoundryActor, context);
    assert.equal((result.derived.skills as typeof skills).prc.total, total);
    assert.equal(result.derived.passivePerception, passive);
}
const unsupported = structuredClone(source);
unsupported.effects[0].disabled = false;
const unavailable = adapter.prepareActorData(unsupported as unknown as FoundryActor, context);
assert.equal((unavailable.derived.skills as typeof skills).prc.total, null);
assert.equal(adapter.getRollData(unavailable, 'skill', 'prc'), null);
assert.match((unavailable.derived.skills as typeof skills).prc.unavailableReason!, /effect/);
const formula = structuredClone(source);
Object.assign(formula.system.skills.prc, { roll: { bonus: '1+1d4' } });
assert.equal((adapter.prepareActorData(formula as unknown as FoundryActor, context).derived.skills as typeof skills).prc.total, null);
const missing = structuredClone(source);
Object.assign(missing.system.abilities.wis, { value: null });
assert.equal((adapter.prepareActorData(missing as unknown as FoundryActor, context).derived.skills as typeof skills).prc.total, null);
const overflow = structuredClone(source);
Object.assign(overflow.system.skills.prc, { roll: { bonus: 1e308 } });
assert.equal((adapter.prepareActorData(overflow as unknown as FoundryActor, context).derived.skills as typeof skills).prc.total, null);
const flagged = { ...structuredClone(source), flags: { dnd5e: { halflingLucky: true } } };
assert.equal((adapter.prepareActorData(flagged as unknown as FoundryActor, context).derived.skills as typeof skills).prc.total, null);
const armored = { ...structuredClone(source), items: [...source.items, { _id: 'armor', name: 'Armor', type: 'equipment', system: { equipped: true } }] };
assert.equal((adapter.prepareActorData(armored as unknown as FoundryActor, context).derived.skills as typeof skills).prc.total, null);
console.log('R/S: source-derived bounded numeric skills +5/passive15: PASS (effects/formulas/dice qualification open)');
