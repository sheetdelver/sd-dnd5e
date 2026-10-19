import { record } from '../../../logic/native/6.0.6/source';

/** Consumer intent identity only; no rule calculation and no source cache. */
export function skillIntentSignature(actor: unknown): string | null {
    const value = record(actor), derived = record(value?.derived), lifecycle = record(derived?.lifecycle);
    if (lifecycle?.status !== 'supported' || !['2024', 'legacy-limited'].includes(String(lifecycle.profile))) return null;
    return JSON.stringify({ actor: value?._id ?? value?.id, identity: lifecycle.identity,
        sourceRevision: lifecycle.sourceRevision, worldEpoch: lifecycle.worldEpoch,
        profile: lifecycle.profile, skills: derived?.skills });
}
