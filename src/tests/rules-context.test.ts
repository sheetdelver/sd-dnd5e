import assert from 'node:assert/strict';
import type { ModuleWorldSnapshot, WorldSettingResult } from '@sheet-delver/sdk';
import info from '../../info.json';
import inventory from '../../tests/fixtures/native-6.0.6/source-inventory.json';
import { resolveRulesContext, assertSameRulesContext } from '../logic/rules-context';

type MutableWorld = { identity: { -readonly [K in keyof ModuleWorldSnapshot['identity']]: ModuleWorldSnapshot['identity'][K] }; settings: Record<string, WorldSettingResult> };
export function fixtureWorld(): MutableWorld {
    return {
        identity: { instanceId: 'offline', worldId: 'fixture', systemId: 'dnd5e', systemVersion: '6.0.6', foundryGeneration: 14,
            foundryBuild: '367', runtimeEpoch: 1, contextRevision: 7 },
        settings: Object.fromEntries(info.worldSettings.map(declaration => [declaration.key, { status: 'world',
            value: declaration.key === 'dnd5e.calendarConfig' ? { enabled: false, dailyRecovery: '' } : structuredClone(declaration.default?.value) }])),
    };
}
// Defaults are compared with independently parsed exact-release registrations.
for (const declaration of info.worldSettings) {
    const native = inventory.settings[declaration.key as keyof typeof inventory.settings];
    assert.equal(native.scope, 'world');
    assert.equal(declaration.systemVersion, '=6.0.6');
    if (declaration.key === 'dnd5e.calendarConfig') assert.equal(declaration.default, undefined);
    else assert.deepEqual(declaration.default?.value, native.default, declaration.key);
}
assert.ok(!info.worldSettings.some(row => row.key.includes('transformationSettings')));
const snapshot = fixtureWorld();
const before = structuredClone(snapshot);
const context = resolveRulesContext(snapshot);
assert.equal(context.status, 'supported');
assert.equal(context.profile, '2024');
assert.deepEqual(snapshot, before);
assert.ok(Object.isFrozen(context.settings['dnd5e.packSourceConfiguration']));
const next = structuredClone(snapshot);
next.identity.contextRevision++;
next.settings['dnd5e.rulesVersion'] = { status: 'world', value: 'legacy' };
assert.equal(resolveRulesContext(next).profile, 'legacy-limited');
assert.throws(() => assertSameRulesContext(context, resolveRulesContext(next)), /changed/);
assert.equal(context.profile, '2024');
const otherWorld = structuredClone(snapshot); otherWorld.identity.worldId = 'another-world';
assert.throws(() => assertSameRulesContext(context, resolveRulesContext(otherWorld)), /changed/);
for (const version of ['5.3.3', '6.0.7', 'unknown']) {
    const unsupported = structuredClone(snapshot); unsupported.identity.systemVersion = version;
    assert.equal(resolveRulesContext(unsupported).status, 'unsupported');
}
const v13 = structuredClone(snapshot); v13.identity.foundryGeneration = 13;
assert.equal(resolveRulesContext(v13).status, 'unsupported');
assert.equal(resolveRulesContext().status, 'unavailable');
const missing = structuredClone(snapshot);
delete (missing.settings as Record<string, unknown>)['dnd5e.rulesVersion'];
assert.equal(resolveRulesContext(missing).status, 'unavailable');
const invalid = structuredClone(snapshot);
invalid.settings['dnd5e.rulesVersion'] = { status: 'world', value: 'invented' };
assert.equal(resolveRulesContext(invalid).status, 'unavailable');
invalid.settings['dnd5e.packSourceConfiguration'] = { status: 'world', value: { 'dnd5e.spells24': 'false' } };
assert.deepEqual(resolveRulesContext(invalid).settings['dnd5e.packSourceConfiguration'], { status: 'unavailable', reason: 'invalid-value' });
invalid.settings['dnd5e.calendarConfig'] = { status: 'world', value: {} };
assert.equal(resolveRulesContext(invalid).settings['dnd5e.calendarConfig'].status, 'unavailable');
console.log('R/S: immutable exact-version rule context/defaults: PASS (offline)');
