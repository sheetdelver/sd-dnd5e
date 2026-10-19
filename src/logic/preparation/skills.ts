import { record } from '../native/6.0.6/source';
import type { RulesContext } from '../rules-context';

export interface PreparedSkill {
    ability: string; prof: number | null; total: number | null; passive: number | null;
    formula: string | null; unavailableReason?: string;
}
export function numericSkillRoll(skill: PreparedSkill | undefined, options: Record<string, unknown> = {}): string | null {
    if (!skill?.formula || skill.total === null) return null;
    if (options.ability !== undefined && options.ability !== skill.ability) return null;
    const advantage = options.advantage ?? 'normal';
    const die = advantage === 'normal' ? '1d20' : advantage === 'adv' ? '2d20kh1' : advantage === 'dis' ? '2d20kl1' : null;
    if (!die) return null;
    const bonus = options.situationalBonus;
    if (bonus !== undefined && (typeof bonus !== 'string' || bonus.length > 64 || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(bonus.trim()) || !Number.isFinite(Number(bonus)))) return null;
    const base = `${die}${skill.total < 0 ? '' : '+'}${skill.total}`;
    return bonus === undefined ? base : `${base}+(${String(bonus).trim()})`;
}
/** Source-only numeric subset of CharacterData.prepareEmbeddedData,
 * CreatureTemplate.prepareSkill and Proficiency at exact release-6.0.6.
 * Effects, transformed skills, proficiency dice and expressions await Q00/M2.
 * Never read source.total/passive/mod as independent prepared results.
 */
export function prepareNumericSkills606(actor: unknown, context: RulesContext): Record<string, PreparedSkill> {
    const source = record(actor) ?? {}, system = record(source.system) ?? {};
    const skills = record(system.skills) ?? {}, abilities = record(system.abilities) ?? {};
    const attributes = record(system.attributes) ?? {}, flags = record(record(source.flags)?.dnd5e) ?? {};
    const rolls = record(record(system.rolls)?.ability) ?? {};
    const globalCheck = record(rolls.check) ?? {}, globalSkill = record(rolls.skill) ?? {};
    const constant = (input: unknown): number | null => {
        // simplifyBonus explicitly treats absent/empty bonuses as zero. This
        // does not authorize substituting zero for an unknown expression.
        if (input === undefined || input === null || input === '') return 0;
        if (typeof input === 'number' && Number.isFinite(input)) return input;
        if (typeof input === 'string' && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(input.trim())) return Number(input);
        return null;
    };
    const items = Array.isArray(source.items) ? source.items : null;
    let level = 0, globalReason: string | undefined;
    if (source.type !== 'character' || context.status !== 'supported' || context.profile !== '2024') globalReason = 'Character rule profile unavailable';
    const proficiency = context.settings['dnd5e.proficiencyModifier'];
    if (!proficiency || proficiency.status === 'unavailable' || proficiency.value !== 'bonus') globalReason = 'Proficiency dice or setting unavailable; Q00 qualification required';
    const encumbrance = context.settings['dnd5e.encumbrance'];
    if (!encumbrance || encumbrance.status === 'unavailable' || encumbrance.value !== 'none') globalReason = 'Encumbrance rule preparation unavailable';
    if (!items) globalReason = 'Class source collection unavailable';
    for (const value of items ?? []) {
        const item = record(value);
        if (item?.type !== 'class') continue;
        const levels = record(item.system)?.levels;
        if (typeof levels !== 'number' || !Number.isInteger(levels) || levels < 0 || levels > 20) globalReason = 'Class level source unavailable';
        else level += levels;
    }
    if (level > 20) globalReason = 'Class levels above 20 unsupported';
    const effects = [source.effects, ...(items ?? []).map(item => record(item)?.effects)];
    if (effects.some(list => list !== undefined && (!Array.isArray(list) || list.some(effect => record(effect)?.disabled !== true)))) globalReason = 'Active effect preparation unavailable';
    if ((items ?? []).some(value => {
        const item = record(value);
        return item?.type === 'equipment' && record(item.system)?.equipped === true;
    })) globalReason = 'Equipped armor/item rule preparation unavailable';
    if (attributes.exhaustion !== undefined && attributes.exhaustion !== 0 || Array.isArray(source.statuses) && source.statuses.length) globalReason = 'Condition preparation unavailable';
    if (Object.values(flags).some(Boolean)) globalReason = 'Native skill/roll flag or transformation preparation unavailable';
    const profBonus = Math.floor((level + 7) / 4);
    const result: Record<string, PreparedSkill> = {};
    for (const [key, value] of Object.entries(skills)) {
        const skill = record(value) ?? {}, ability = typeof skill.ability === 'string' ? skill.ability : '';
        const abilityData = record(abilities[ability]) ?? {}, abilityRoll = record(record(abilityData.check)?.roll) ?? {};
        const skillRoll = record(skill.roll) ?? {}, bonuses = record(skill.bonuses) ?? {};
        const score = abilityData.value;
        let reason = globalReason;
        if (!['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(ability)) reason = 'Skill ability is outside the qualified profile';
        if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 30) reason = 'Ability source score unavailable';
        const modifiers = [skillRoll.bonus, globalCheck.bonus, abilityRoll.bonus, globalSkill.bonus, bonuses.passive].map(constant);
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
        if (!Number.isFinite(total + passiveBonus) || !/^-?\d+(?:\.\d+)?$/.test(String(total))) {
            result[key] = { ability, prof: multiplier, total: null, passive: null, formula: null, unavailableReason: 'Numeric skill result outside qualified roll representation' };
            continue;
        }
        result[key] = { ability, prof: multiplier, total, passive: 10 + total + passiveBonus, formula: `1d20${total < 0 ? '' : '+'}${total}` };
    }
    return result;
}
