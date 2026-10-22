import {proficiencyDiceTerm606} from './proficiency-term';
import {executionFormulaContext606} from './formula-fields';
import { numericAbilityValue } from './numeric';
import { prepareNumericEffects606, type NumericEffects } from './numeric-effects';
import { record } from '../native/6.0.6/source';
import type { RulesContext } from '../rules-context';
import { numericCharacterProfile, numericConstant, qualifiedNumericTotal } from './character-profile';
import { abilityRollScopes, prepareD20Configuration, sourceD20Mode,numericScopeBonus,preparedBonusNote,type PreparedNumericD20 } from './d20-configuration';
import {checkProficiency606,saveProficiency606} from './proficiency';

export interface PreparedNumericAbility {
    score: number | null; mod: number | null; save: number | null; saveProficient: boolean | null;preparedScore?:number|null;scorePreparationNote?:string;
    check: PreparedNumericD20; saveRoll: PreparedNumericD20;
}
/** Bounded CommonTemplate.prepareAbilities numeric check/save semantics at
 * 87e94db. Raw source mod/check.value/save.value and AC cover are not source
 * inputs. Cover is zero only in the qualified profile without status/cover effects.
 */
export function prepareNumericAbilities606(actor: unknown, context: RulesContext,effects:NumericEffects=prepareNumericEffects606(actor,context)): Record<string, PreparedNumericAbility> {
    const system = effects.system, abilities = record(system.abilities) ?? {};
    const globals = effects.globals, profile = numericCharacterProfile(actor, context,effects,true,true);
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
            const scopes=[{path:`abilities.${key}.${type}.roll`,value:local.roll},{path:`rolls.ability.${type}`,value:global}];
            const prof=type==='save'?saveProficiency606(data.proficient,global.proficiency):checkProficiency606(0,undefined,[],{check:global.proficiency,skill:0,tool:0});
            const formulaContext=executionFormulaContext606(effects,profile.status==='ready'&&profile.proficiencyMode==='dice'?null:prof!==null&&profile.status==='ready'?(prof>0?Math.floor(profile.proficiency*prof):profile.proficiency):null);
            const preparedBonuses = [roll.bonus, global.bonus].map(numericConstant),bonuses=scopes.map(scope=>numericScopeBonus(scope,effects.executionBonuses,formulaContext));
            if ([...preparedBonuses,...bonuses].some(value => value === null) || record(data.bonuses)?.[type]) unavailableReason = 'Ability bonus formula requires Q00 qualification';
            const mode = sourceD20Mode(abilityRollScopes(actor, key, type,effects.executionModes));
            if (mode.reason) unavailableReason = mode.reason;

            if (prof===null) unavailableReason = 'Ability proficiency source unavailable';
            if (unavailableReason || mod === null || mode.mode === undefined || profile.status !== 'ready'||prof===null) return { ability: key, total: null,preparedTotal:null, formula: null, unavailableReason: unavailableReason ?? 'Ability preparation unavailable' };
            const proficiencyTerm=profile.proficiencyMode==='dice'&&prof>0?proficiencyDiceTerm606(profile.proficiency,prof)??undefined:undefined;
            const baseTotal=mod+(profile.proficiencyMode==='dice'?0:Math.floor(profile.proficiency*prof))+effects.conditions.rollReduction;
            const total=baseTotal+(bonuses[0]as number)+(bonuses[1]as number),preparedTotal=baseTotal+(preparedBonuses[0]as number)+(preparedBonuses[1]as number);
            if (!qualifiedNumericTotal(total)) return { ability: key, total: null, formula: null, unavailableReason: 'Ability result outside qualified numeric representation' };
            return {ability:key,total,preparedTotal,proficiencyMode:profile.proficiencyMode,...(proficiencyTerm?{proficiencyTerm}:{}),preparationNote:preparedBonusNote(preparedTotal,total),sourceMode:mode.mode,...prepareD20Configuration(total,mode.mode,abilityRollScopes(actor,key,type,effects.executionModes),0,true,proficiencyTerm)};
        }
        const check = prepare('check'), saveRoll = prepare('save');
        const saveMultiplier=saveProficiency606(data.proficient,record(globals.save)?.proficiency);
        const currentScore=reason?null:effects.finalNumbers[`system.abilities.${key}.value`]??score;
        result[key] = { score:currentScore,preparedScore:score,...(currentScore!==null&&score!==null&&currentScore!==score?{scorePreparationNote:`Modifier prepared from score ${score}.`}:{}),mod,check,saveRoll,save:saveRoll.total,saveProficient:saveRoll.total===null||saveMultiplier===null?null:saveMultiplier>=1 };
    }
    return result;
}
