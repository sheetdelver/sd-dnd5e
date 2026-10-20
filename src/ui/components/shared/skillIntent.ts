import { record } from '../../../logic/native/6.0.6/source';
import type { PreparedNumericD20 } from '../../../logic/preparation/d20-configuration';

/** Consumer intent identity only; no rule calculation and no source cache. */
export type PreparedRollKind = 'skill' | 'ability' | 'save';
export function rollIntentSignature(actor: unknown, kind: PreparedRollKind): string | null {
    const value = record(actor), derived = record(value?.derived), lifecycle = record(derived?.lifecycle);
    if (lifecycle?.status !== 'supported' || !['2024', 'legacy-limited'].includes(String(lifecycle.profile))) return null;
    return JSON.stringify({ actor: value?._id ?? value?.id, identity: lifecycle.identity,
        sourceRevision: lifecycle.sourceRevision, worldEpoch: lifecycle.worldEpoch,
        profile: lifecycle.profile, kind, checks: kind === 'skill' ? derived?.skills : derived?.abilities });
}
export function preparedRollCheck(actor: unknown, kind: PreparedRollKind, key: string): PreparedNumericD20 | undefined {
    if (!rollIntentSignature(actor, kind)) return undefined;
    const derived = record(record(actor)?.derived);
    const row = kind === 'skill' ? record(record(derived?.skills)?.[key]) : record(record(derived?.abilities)?.[key]);
    const check = kind === 'skill' ? row : record(row?.[kind === 'ability' ? 'check' : 'saveRoll']);
    return check && typeof check.ability === 'string' && typeof check.total === 'number' && typeof check.formula === 'string' && !check.unavailableReason
        ? check as unknown as PreparedNumericD20 : undefined;
}
export function preparedRollAvailable(actor: unknown, kind: PreparedRollKind, key: string): boolean {
    return Boolean(preparedRollCheck(actor, kind, key));
}
