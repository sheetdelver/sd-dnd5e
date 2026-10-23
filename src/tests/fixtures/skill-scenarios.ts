import type { ActorPreparationContext, FoundryActor, ModuleWorldSnapshot, WorldSettingResult } from '@sheet-delver/sdk';
import info from '../../../info.json';
import source from '../../../tests/fixtures/native-6.0.6/source-before.json';

export function skillWorld(): ModuleWorldSnapshot {
    return { identity: { instanceId: 'review', worldId: 'offline', systemId: 'dnd5e', systemVersion: '6.0.6',
        foundryGeneration: 14, foundryBuild: '367', runtimeEpoch: 1, contextRevision: 1 },
        settings: Object.fromEntries(info.worldSettings.map(row => [row.key, { status: 'world', value: row.key === 'dnd5e.calendarConfig'
            ? { enabled: false, dailyRecovery: '' } : structuredClone(row.default?.value) }])) as Record<string, WorldSettingResult> };
}
export function skillContext(world: ModuleWorldSnapshot | undefined = skillWorld()): ActorPreparationContext {
    return { world, worldEpoch: 1, contextRevision: 1, sourceRevision: 1, systemId: 'dnd5e', systemVersion: world?.identity.systemVersion ?? '6.0.6' };
}
export const skillSource = () => structuredClone(source) as unknown as FoundryActor;
export const rollScopes = ['skills.prc.roll', 'abilities.wis.check.roll', 'rolls.ability.check', 'rolls.ability.skill'] as const;
export function setSkillRoll(actor: FoundryActor, scope: string, config: Record<string, unknown>) {
    let target = actor.system as Record<string, any>;
    const parts = scope.split('.');
    for (const part of parts.slice(0, -1)) target = target[part] ??= {};
    target[parts.at(-1)!] = config;
}
export function unavailableContexts(): Array<{ id: string; context: ActorPreparationContext }> {
    const unavailable = skillWorld();
    (unavailable.settings as Record<string, WorldSettingResult>)['dnd5e.rulesVersion'] = { status: 'unavailable', reason: 'not-ready' };
    const future = skillWorld();
    const futureWorld = { ...future, identity: { ...future.identity, systemVersion: '6.0.7' } };
    return [{ id: 'rules-setting-unavailable', context: skillContext(unavailable) },
        { id: 'unsupported-native-version', context: skillContext(futureWorld) },
        { id: 'snapshot-absent', context: { ...skillContext(), world: undefined } }];
}
