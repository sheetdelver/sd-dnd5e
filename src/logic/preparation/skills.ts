import { initializedAbilityRolls606 } from './roll-initialization';
import { record } from '../native/6.0.6/source';
import type { RulesContext } from '../rules-context';
import { d20RangeReason, skillRollScopes, numericD20Roll } from './d20-configuration';
import { numericCharacterProfile, numericConstant, qualifiedNumericTotal } from './character-profile';

export interface PreparedSkill {
    ability: string; prof: number | null; total: number | null; passive: number | null;
    formula: string | null; unavailableReason?: string;
}
export function numericSkillRoll(skill: PreparedSkill | undefined, options: Record<string, unknown> = {}): string | null {
    return numericD20Roll(skill, options);
}
export function unavailableSkillChecks(actor: unknown, reason: string): Record<string, PreparedSkill> {
    const skills = record(record(record(actor)?.system)?.skills) ?? {};
    return Object.fromEntries(Object.entries(skills).map(([key, value]) => [key, {
        ability: typeof record(value)?.ability === 'string' ? record(value)!.ability as string : '',
        prof: null, total: null, passive: null, formula: null, unavailableReason: reason,
    }]));
}
/** Source-only numeric subset of CharacterData.prepareEmbeddedData,
 * CreatureTemplate.prepareSkill and Proficiency at exact release-6.0.6.
 * Effects, transformed skills, proficiency dice and expressions await Q00/M2.
 * Never read source.total/passive/mod as independent prepared results.
 */
export function prepareNumericSkills606(actor: unknown, context: RulesContext): Record<string, PreparedSkill> {
    if (context.status !== 'supported' || context.profile !== '2024') return unavailableSkillChecks(actor, `Skill rules context unavailable: ${context.reason ?? context.profile ?? 'unknown profile'}`);
    const source = record(actor) ?? {}, system = record(source.system) ?? {};
    const skills = record(system.skills) ?? {}, abilities = record(system.abilities) ?? {};
    const rolls = initializedAbilityRolls606(actor);
    const globalCheck = record(rolls.check) ?? {}, globalSkill = record(rolls.skill) ?? {};
    const profile = numericCharacterProfile(actor, context);
    if (profile.status !== 'ready') return unavailableSkillChecks(actor, profile.reason);
    const profBonus = profile.proficiency;
    const result: Record<string, PreparedSkill> = {};
    for (const [key, value] of Object.entries(skills)) {
        const skill = record(value) ?? {}, ability = typeof skill.ability === 'string' ? skill.ability : '';
        const abilityData = record(abilities[ability]) ?? {}, abilityRoll = record(record(abilityData.check)?.roll) ?? {};
        const skillRoll = record(skill.roll) ?? {}, bonuses = record(skill.bonuses) ?? {};
        const score = abilityData.value;
        let reason: string | undefined;
        if (!['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(ability)) reason = 'Skill ability is outside the qualified profile';
        if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 30) reason = 'Ability source score unavailable';
        const modifiers = [skillRoll.bonus, globalCheck.bonus, abilityRoll.bonus, globalSkill.bonus, bonuses.passive].map(numericConstant);
        if (modifiers.some(value => value === null) || bonuses.check) reason = 'Skill formula requires Q00 qualification';
        if ([skillRoll.mode, abilityRoll.mode, globalCheck.mode, globalSkill.mode].some(mode => mode !== undefined && mode !== 0)) reason = 'Skill advantage mode preparation unavailable';
        const multipliers = [skill.value, globalCheck.proficiency, globalSkill.proficiency].filter(value => value !== undefined);
        if (skill.value === undefined || multipliers.some(value => typeof value !== 'number' || ![0, .5, 1, 2].includes(value))) reason = 'Skill proficiency source unavailable';
        const multiplier = reason ? null : Math.max(...multipliers as number[]);
        if (reason || multiplier === null) {
            result[key] = { ability, prof: null, total: null, passive: null, formula: null, unavailableReason: reason ?? 'Skill preparation unavailable' };
            continue;
        }
        const mod = Math.floor(((score as number) - 10) / 2), prof = Math.floor(multiplier * profBonus);
        const [skillBonus, checkBonus, abilityBonus, globalSkillBonus, passiveBonus] = modifiers as number[];
        const total = mod + prof + skillBonus + checkBonus + abilityBonus + globalSkillBonus;
        if (!qualifiedNumericTotal(total) || !Number.isFinite(total + passiveBonus)) {
            result[key] = { ability, prof: multiplier, total: null, passive: null, formula: null, unavailableReason: 'Numeric skill result outside qualified roll representation' };
            continue;
        }
        const unavailableReason = d20RangeReason(skillRollScopes(actor, key));
        result[key] = { ability, prof: multiplier, total, passive: 10 + total + passiveBonus,
            formula: unavailableReason ? null : `1d20${total < 0 ? '' : '+'}${total}`, ...(unavailableReason ? { unavailableReason } : {}) };
    }
    return result;
}
