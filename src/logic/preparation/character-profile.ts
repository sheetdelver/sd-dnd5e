import { record } from '../native/6.0.6/source';
import type { RulesContext } from '../rules-context';
import { prepareNumericEffects606, type NumericEffects } from './numeric-effects';

export { numericConstant, qualifiedNumericTotal } from './numeric';
export interface NumericFact {
    status: 'ready' | 'unavailable' | 'legacy-unqualified';
    value: number | null; display: string; provenance: string; reason?: string;
}
export interface CharacterFacts { level: NumericFact; proficiency: NumericFact }
const provenance = 'release-6.0.6 CharacterData.prepareEmbeddedData / Proficiency.calculateMod';
export function numericFact(value: number | null, reason?: string): NumericFact {
    return { status: value === null ? 'unavailable' : 'ready', value, display: value === null ? '—' : String(value), provenance, ...(reason ? { reason } : {}) };
}
/** Class facts are independent of unresolved equipped armor/encumbrance rules.
 * Effects/transformations remain unqualified, including possible stat changes.
 */
export function characterFacts606(actor: unknown, context: RulesContext, effects:NumericEffects=prepareNumericEffects606(actor)): CharacterFacts {
    const source = record(actor) ?? {}, system = record(source.system) ?? {};
    let reason: string | undefined, level = 0;
    if (context.status !== 'supported' || context.profile !== '2024') reason = `Character rules context unavailable: ${context.reason ?? context.profile ?? 'unknown'}`;
    else if (source.type !== 'character') reason = 'Character rule profile unavailable';
    const items = Array.isArray(source.items) ? source.items : null;
    if (!items) reason ??= 'Class source collection unavailable';
    for (const value of items ?? []) {
        const item = record(value);
        if (item?.type !== 'class') continue;
        const levels = record(item.system)?.levels;
        if (typeof levels !== 'number' || !Number.isInteger(levels) || levels < 0 || levels > 20) reason ??= 'Class level source unavailable';
        else level += levels;
    }
    if (level > 20) reason ??= 'Class levels above 20 unsupported';
    reason ??= effects.reason;
    if (Object.values(record(record(source.flags)?.dnd5e) ?? {}).some(Boolean)) reason ??= 'Native flag or transformation preparation unavailable';
    const levelFact = numericFact(reason ? null : level, reason);
    const setting = context.settings['dnd5e.proficiencyModifier'];
    const profReason = reason ?? (!setting || setting.status === 'unavailable' || setting.value !== 'bonus' ? 'Proficiency dice or setting unavailable; Q00 qualification required' : undefined);
    const prof = numericFact(profReason ? null : Math.floor((level + 7) / 4), profReason);
    if (prof.value !== null) prof.display = `+${prof.value}`;
    return { level: levelFact, proficiency: prof };
}
/** Projection accessor only; never reconstruct facts from raw/fallback numbers. */
export function characterFactsProjection(derived: Record<string, any>): CharacterFacts {
    return derived.characterFacts ?? { level: numericFact(null, 'Level preparation unavailable'), proficiency: numericFact(null, 'Proficiency preparation unavailable') };
}
/** Common source-only PC roll prerequisites, shared by skills/checks/saves. */
export function numericCharacterProfile(actor: unknown, context: RulesContext, effects:NumericEffects=prepareNumericEffects606(actor)):
    { status: 'ready'; level: number; proficiency: number } | { status: 'unavailable'; reason: string } {
    const source = record(actor) ?? {}, system = record(source.system) ?? {}, facts = characterFacts606(actor, context,effects);
    if (facts.level.value === null || facts.proficiency.value === null) return { status: 'unavailable', reason: facts.level.reason ?? facts.proficiency.reason ?? 'Character facts unavailable' };
    let reason: string | undefined;
    const encumbrance = context.settings['dnd5e.encumbrance'];
    if (!encumbrance || encumbrance.status === 'unavailable' || encumbrance.value !== 'none') reason = 'Encumbrance rule preparation unavailable';
    if ((source.items as unknown[]).some(value => record(value)?.type === 'equipment' && record(record(value)?.system)?.equipped === true)) reason = 'Equipped armor/item rule preparation unavailable';
    const attributes = record(system.attributes) ?? {};
    if (attributes.exhaustion !== undefined && attributes.exhaustion !== 0 || Array.isArray(source.statuses) && source.statuses.length) reason = 'Condition preparation unavailable';
    if (Object.values(record(record(system.bonuses)?.abilities) ?? {}).some(Boolean)) reason = 'Legacy global ability bonus schema requires qualification';
    return reason ? { status: 'unavailable', reason } : { status: 'ready', level: facts.level.value, proficiency: facts.proficiency.value };
}
