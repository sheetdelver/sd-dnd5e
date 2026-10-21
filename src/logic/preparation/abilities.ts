import { numericAbilityValue } from './numeric';
import { prepareNumericEffects606, type NumericEffects } from './numeric-effects';
import { record } from '../native/6.0.6/source';
import type { RulesContext } from '../rules-context';
import { numericCharacterProfile, numericConstant, qualifiedNumericTotal } from './character-profile';
import { abilityRollScopes, d20RangeReason, sourceD20Mode, numericD20Formula, numericD20ExecutionReason, type PreparedNumericD20 } from './d20-configuration';

export interface PreparedNumericAbility {
    score: number | null; mod: number | null; save: number | null; saveProficient: boolean | null;
    check: PreparedNumericD20; saveRoll: PreparedNumericD20;
}
/** Bounded CommonTemplate.prepareAbilities numeric check/save semantics at
 * 87e94db. Raw source mod/check.value/save.value and AC cover are not source
 * inputs. Cover is zero only in the qualified profile without status/cover effects.
 */
export function prepareNumericAbilities606(actor: unknown, context: RulesContext,effects:NumericEffects=prepareNumericEffects606(actor)): Record<string, PreparedNumericAbility> {
    const system = effects.system, abilities = record(system.abilities) ?? {};
    const globals = effects.globals, profile = numericCharacterProfile(actor, context,effects);
    const result: Record<string, PreparedNumericAbility> = {};
    for (const [key, value] of Object.entries(abilities)) {
        const data = record(value) ?? {}, rawScore = data.value;
        let reason = profile.status === 'unavailable' ? profile.reason : undefined;
        if (!['str','dex','con','int','wis','cha'].includes(key)) reason = 'Ability outside qualified profile';
        const numeric=numericAbilityValue(rawScore);
        if (!numeric) reason = 'Ability source score unavailable';
        const score = reason ? null : numeric!.score, mod = reason ? null : numeric!.mod;
        function prepare(type: 'check' | 'save'): PreparedNumericD20 {
            let unavailableReason = reason;
            const local = record(data[type]) ?? {}, roll = record(local.roll) ?? {}, global = record(globals[type]) ?? {};
            if (data[type] != null && !record(data[type]) || globals[type] != null && !record(globals[type])) unavailableReason = 'Malformed native ability roll configuration';
            const bonuses = [roll.bonus, global.bonus].map(numericConstant);
            if (bonuses.some(value => value === null) || record(data.bonuses)?.[type]) unavailableReason = 'Ability bonus formula requires Q00 qualification';
            const mode = sourceD20Mode(abilityRollScopes(actor, key, type,effects.modes));
            if (mode.reason) unavailableReason = mode.reason;
            const base = type === 'check' ? 0 : data.proficient;
            const multipliers = [base, global.proficiency].filter(value => value !== undefined);
            if (base === undefined || multipliers.some(value => typeof value !== 'number' || !(type === 'check' ? [0,.5,1,2] : [0,1]).includes(value))) unavailableReason = 'Ability proficiency source unavailable';
            if (unavailableReason || mod === null || mode.mode === undefined || profile.status !== 'ready') return { ability: key, total: null, formula: null, unavailableReason: unavailableReason ?? 'Ability preparation unavailable' };
            const total = mod + Math.floor(profile.proficiency * Math.max(...multipliers as number[])) + (bonuses[0] as number) + (bonuses[1] as number);
            if (!qualifiedNumericTotal(total)) return { ability: key, total: null, formula: null, unavailableReason: 'Ability result outside qualified numeric representation' };
            unavailableReason = d20RangeReason(abilityRollScopes(actor, key, type,effects.modes)) ?? numericD20ExecutionReason(total, mode.mode);
            return { ability: key, total, sourceMode: mode.mode, formula: unavailableReason ? null : numericD20Formula(total, mode.mode), ...(unavailableReason ? { unavailableReason } : {}) };
        }
        const check = prepare('check'), saveRoll = prepare('save');
        const saveMultiplier = Math.max(typeof data.proficient === 'number' ? data.proficient : 0, typeof record(globals.save)?.proficiency === 'number' ? record(globals.save)!.proficiency as number : 0);
        result[key] = { score, mod, check, saveRoll, save: saveRoll.total, saveProficient: saveRoll.total === null ? null : saveMultiplier >= 1 };
    }
    return result;
}
