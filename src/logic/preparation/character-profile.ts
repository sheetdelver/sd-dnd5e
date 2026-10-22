import { record } from '../native/6.0.6/source';
import type { RulesContext } from '../rules-context';
import { prepareNumericEffects606, type NumericEffects } from './numeric-effects';

export { numericConstant, qualifiedNumericTotal } from './numeric';
import {initializeClassFacts606,proficiencyBonus606,type ClassSource606} from './class-initialization';
export {proficiencyBonus606} from './class-initialization';
export interface NumericFact {
    status: 'ready' | 'unavailable' | 'legacy-unqualified';mode?:'bonus'|'dice';term?:string;
    value: number | null; display: string; provenance: string; reason?: string;
}
export interface CharacterFacts { level: NumericFact; proficiency: NumericFact;classSources?:ClassSource606[] }
const provenance = 'release-6.0.6 CharacterData.prepareBaseData / Proficiency.calculateMod';
export function numericFact(value: number | null, reason?: string): NumericFact {
    return { status: value === null ? 'unavailable' : 'ready', value, display: value === null ? '—' : String(value), provenance, ...(reason ? { reason } : {}) };
}
/** Class facts are independent of unresolved equipped armor/encumbrance rules.
 * Effects/transformations remain unqualified, including possible stat changes.
 */
export function characterFacts606(actor: unknown, context: RulesContext, effects:NumericEffects=prepareNumericEffects606(actor,context)): CharacterFacts {
    const source = record(actor) ?? {}, system = record(source.system) ?? {};
    let reason: string | undefined, level = 0;
    if (context.status !== 'supported' || context.profile !== '2024') reason = `Character rules context unavailable: ${context.reason ?? context.profile ?? 'unknown'}`;
    else if (source.type !== 'character') reason = 'Character rule profile unavailable';
    const initial=initializeClassFacts606(actor);
    if(initial.status==='ready')level=initial.level;else reason??=initial.reason;
    reason ??= effects.reason;
    reason ??= effects.ruleFlags.reason;
    const levelFact = numericFact(reason ? null : level, reason);
    const setting = context.settings['dnd5e.proficiencyModifier'];
    const profReason = reason ?? (!setting || setting.status === 'unavailable' || !['bonus','dice'].includes(String(setting.value)) ? 'Proficiency setting unavailable or unsupported' : undefined);
    const prof = numericFact(profReason ? null : proficiencyBonus606(level), profReason);
    if (prof.value !== null){prof.mode=setting&&setting.status!=='unavailable'&&setting.value==='dice'?'dice':'bonus';prof.term=prof.mode==='dice'?`1d${prof.value*2}`:String(prof.value);prof.display=prof.mode==='dice'?prof.term:`+${prof.value}`;}
    return { level: levelFact, proficiency: prof,...(initial.status==='ready'?{classSources:initial.classes}:{}) };
}
/** Projection accessor only; never reconstruct facts from raw/fallback numbers. */
export function characterFactsProjection(derived: Record<string, any>): CharacterFacts {
    return derived.characterFacts ?? { level: numericFact(null, 'Level preparation unavailable'), proficiency: numericFact(null, 'Proficiency preparation unavailable') };
}
/** Common source-only PC roll prerequisites, shared by skills/checks/saves. */
export function numericCharacterProfile(actor: unknown, context: RulesContext, effects:NumericEffects=prepareNumericEffects606(actor,context),requiresProficiency=true,allowDice=false):
    { status: 'ready'; level: number; proficiency: number;proficiencyMode:'bonus'|'dice' } | { status: 'unavailable'; reason: string } {
    const source = record(actor) ?? {}, system = record(source.system) ?? {}, facts = characterFacts606(actor, context,effects);
    if (facts.level.value === null || requiresProficiency && facts.proficiency.value === null) return { status: 'unavailable', reason: facts.level.reason ?? facts.proficiency.reason ?? 'Character facts unavailable' };
    let reason: string | undefined;
    if(requiresProficiency&&facts.proficiency.mode==='dice'&&!allowDice)reason='Proficiency dice require qualification for this workflow';
    const encumbrance = context.settings['dnd5e.encumbrance'];
    if (!encumbrance || encumbrance.status === 'unavailable' || !['none','normal','variant'].includes(String(encumbrance.value))) reason = 'Encumbrance rule preparation unavailable';
    reason ??= effects.equipment.reason;
    const attributes = record(system.attributes) ?? {};
    if (attributes.exhaustion !== undefined && attributes.exhaustion !== 0 || Array.isArray(source.statuses) && source.statuses.length) reason = 'Condition preparation unavailable';
    if (Object.values(record(record(system.bonuses)?.abilities) ?? {}).some(Boolean)) reason = 'Legacy global ability bonus schema requires qualification';
    return reason ? { status: 'unavailable', reason } : { status: 'ready', level: facts.level.value, proficiency: facts.proficiency.value??proficiencyBonus606(facts.level.value),proficiencyMode:facts.proficiency.mode??'bonus' };
}
