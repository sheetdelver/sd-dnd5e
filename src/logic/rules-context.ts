import { isWorldValue, type ModuleWorldSnapshot, type WorldSettingResult } from '@sheet-delver/sdk';
import info from '../../info.json';
import { deepFreeze, record } from './native/6.0.6/source';

export function resolveRulesContext(snapshot?: Readonly<ModuleWorldSnapshot>) {
    if (!snapshot) return deepFreeze({ status: 'unavailable' as const, reason: 'world-context-unavailable', identity: null, profile: null, settings: {} as Record<string, WorldSettingResult> });
    const { identity } = snapshot;
    const settings: Record<string, WorldSettingResult> = {};
    for (const declaration of info.worldSettings) {
        const input = snapshot.settings[declaration.key];
        if (!input) { settings[declaration.key] = { status: 'unavailable', reason: 'not-ready' }; continue; }
        if (input.status === 'unavailable') { settings[declaration.key] = structuredClone(input); continue; }
        const valid = isWorldValue(input.value, declaration.schema as Parameters<typeof isWorldValue>[1]);
        // Host schemas intentionally have only shallow JSON types. Validate the
        // selected native structured domains before any module consumer uses them.
        const object = record(input.value);
        const structuredValid = declaration.key === 'dnd5e.packSourceConfiguration'
            ? object && Object.values(object).every(value => typeof value === 'boolean')
            : declaration.key === 'dnd5e.calendarConfig' ? object && typeof object.enabled === 'boolean' && ['', 'calendar', 'manual'].includes(String(object.dailyRecovery))
                : true;
        settings[declaration.key] = valid && structuredValid ? structuredClone(input) : { status: 'unavailable', reason: 'invalid-value' };
    }
    const rules = settings['dnd5e.rulesVersion'];
    const versionSupported = identity.systemId === 'dnd5e' && identity.systemVersion === '6.0.6'
        && identity.foundryGeneration === 14 && /^\d+$/.test(identity.foundryBuild) && Number(identity.foundryBuild) >= 367;
    const ready = rules?.status !== 'unavailable' && rules !== undefined;
    return deepFreeze({ status: !versionSupported ? 'unsupported' as const : ready ? 'supported' as const : 'unavailable' as const,
        reason: !versionSupported ? 'unsupported-native-version' : ready ? null : 'rules-version-unavailable',
        identity: structuredClone(identity), profile: ready ? rules.value === 'modern' ? '2024' as const : 'legacy-limited' as const : null, settings });
}
export type RulesContext = ReturnType<typeof resolveRulesContext>;
/** Must be checked with current runtime snapshots again immediately before writes. */
export function assertSameRulesContext(reviewed: RulesContext, current: RulesContext): void {
    if (reviewed.status !== 'supported' || current.status !== 'supported' || !reviewed.identity || !current.identity) throw new Error('Rule context unavailable or unsupported');
    for (const key of ['instanceId', 'worldId', 'systemId', 'systemVersion', 'foundryGeneration', 'foundryBuild', 'runtimeEpoch', 'contextRevision'] as const) {
        if (reviewed.identity[key] !== current.identity[key]) throw new Error('Rule context changed; review again');
    }
}
