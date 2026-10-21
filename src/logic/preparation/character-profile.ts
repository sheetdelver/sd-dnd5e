import { record } from '../native/6.0.6/source';
import type { RulesContext } from '../rules-context';
import { prepareNumericEffects606, type NumericEffects } from './numeric-effects';

export { numericConstant, qualifiedNumericTotal } from './numeric';
import {initializeClassFacts606,proficiencyBonus606} from './class-initialization';
export {proficiencyBonus606} from './class-initialization';
export interface NumericFact {
    status: 'ready' | 'unavailable' | 'legacy-unqualified';
    value: number | null; display: string; provenance: string; reason?: string;
}
export interface CharacterFacts { level: NumericFact; proficiency: NumericFact }
const provenance = 'release-6.0.6 CharacterData.prepareBaseData / Proficiency.calculateMod';
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
    const initial=initializeClassFacts606(actor);
    if(initial.status==='ready')level=initial.level;else reason??=initial.reason;
    reason ??= effects.reason;
    if (Object.values(record(record(source.flags)?.dnd5e) ?? {}).some(Boolean)) reason ??= 'Native flag or transformation preparation unavailable';
    const levelFact = numericFact(reason ? null : level, reason);
    const setting = context.settings['dnd5e.proficiencyModifier'];
    const profReason = reason ?? (!setting || setting.status === 'unavailable' || setting.value !== 'bonus' ? 'Proficiency dice or setting unavailable; Q00 qualification required' : undefined);
    const prof = numericFact(profReason ? null : proficiencyBonus606(level), profReason);
    if (prof.value !== null) prof.display = `+${prof.value}`;
    return { level: levelFact, proficiency: prof };
}
/** Projection accessor only; never reconstruct facts from raw/fallback numbers. */
export function characterFactsProjection(derived: Record<string, any>): CharacterFacts {
    return derived.characterFacts ?? { level: numericFact(null, 'Level preparation unavailable'), proficiency: numericFact(null, 'Proficiency preparation unavailable') };
}
/** Common source-only PC roll prerequisites, shared by skills/checks/saves. */
export function numericCharacterProfile(actor: unknown, context: RulesContext, effects:NumericEffects=prepareNumericEffects606(actor),requiresProficiency=true):
    { status: 'ready'; level: number; proficiency: number } | { status: 'unavailable'; reason: string } {
    const source = record(actor) ?? {}, system = record(source.system) ?? {}, facts = characterFacts606(actor, context,effects);
    if (facts.level.value === null || requiresProficiency && facts.proficiency.value === null) return { status: 'unavailable', reason: facts.level.reason ?? facts.proficiency.reason ?? 'Character facts unavailable' };
    let reason: string | undefined;
    const encumbrance = context.settings['dnd5e.encumbrance'];
    if (!encumbrance || encumbrance.status === 'unavailable' || encumbrance.value !== 'none') reason = 'Encumbrance rule preparation unavailable';
    reason ??= effects.equipment.reason;
    const attributes = record(system.attributes) ?? {};
    if (attributes.exhaustion !== undefined && attributes.exhaustion !== 0 || Array.isArray(source.statuses) && source.statuses.length) reason = 'Condition preparation unavailable';
    if (Object.values(record(record(system.bonuses)?.abilities) ?? {}).some(Boolean)) reason = 'Legacy global ability bonus schema requires qualification';
    return reason ? { status: 'unavailable', reason } : { status: 'ready', level: facts.level.value, proficiency: facts.proficiency.value??proficiencyBonus606(facts.level.value) };
}
