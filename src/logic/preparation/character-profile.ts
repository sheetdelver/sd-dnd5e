import { record } from '../native/6.0.6/source';
import type { RulesContext } from '../rules-context';

/** Qualified constant part of native simplifyBonus. Never evaluates expressions. */
export function numericConstant(input: unknown): number | null {
    if (input === undefined || input === null || input === '') return 0;
    if (typeof input === 'number') return Number.isFinite(input) ? input : null;
    if (typeof input === 'string' && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(input.trim())) {
        const value = Number(input); return Number.isFinite(value) ? value : null;
    }
    return null;
}
export function qualifiedNumericTotal(value: number): boolean {
    return Number.isFinite(value) && /^-?\d+(?:\.\d+)?$/.test(String(value));
}
/** Common source-only PC prerequisites, shared by skills/checks/saves. Excluded
 * domains remain explicit work, not proof that those native rules don't matter.
 */
export function numericCharacterProfile(actor: unknown, context: RulesContext):
    { status: 'ready'; level: number; proficiency: number } | { status: 'unavailable'; reason: string } {
    const source = record(actor) ?? {}, system = record(source.system) ?? {};
    if (context.status !== 'supported' || context.profile !== '2024') return { status: 'unavailable', reason: `Character rules context unavailable: ${context.reason ?? context.profile ?? 'unknown'}` };
    let reason: string | undefined, level = 0;
    if (source.type !== 'character') reason = 'Character rule profile unavailable';
    const proficiency = context.settings['dnd5e.proficiencyModifier'];
    if (!proficiency || proficiency.status === 'unavailable' || proficiency.value !== 'bonus') reason = 'Proficiency dice or setting unavailable; Q00 qualification required';
    const encumbrance = context.settings['dnd5e.encumbrance'];
    if (!encumbrance || encumbrance.status === 'unavailable' || encumbrance.value !== 'none') reason = 'Encumbrance rule preparation unavailable';
    const items = Array.isArray(source.items) ? source.items : null;
    if (!items) reason = 'Class source collection unavailable';
    for (const value of items ?? []) {
        const item = record(value);
        if (item?.type !== 'class') continue;
        const levels = record(item.system)?.levels;
        if (typeof levels !== 'number' || !Number.isInteger(levels) || levels < 0 || levels > 20) reason = 'Class level source unavailable';
        else level += levels;
    }
    if (level > 20) reason = 'Class levels above 20 unsupported';
    const effects = [source.effects, ...(items ?? []).map(item => record(item)?.effects)];
    if (effects.some(list => list !== undefined && (!Array.isArray(list) || list.some(effect => record(effect)?.disabled !== true)))) reason = 'Active effect preparation unavailable';
    if ((items ?? []).some(value => record(value)?.type === 'equipment' && record(record(value)?.system)?.equipped === true)) reason = 'Equipped armor/item rule preparation unavailable';
    const attributes = record(system.attributes) ?? {};
    if (attributes.exhaustion !== undefined && attributes.exhaustion !== 0 || Array.isArray(source.statuses) && source.statuses.length) reason = 'Condition preparation unavailable';
    if (Object.values(record(record(source.flags)?.dnd5e) ?? {}).some(Boolean)) reason = 'Native skill/roll flag or transformation preparation unavailable';
    if (Object.values(record(record(system.bonuses)?.abilities) ?? {}).some(Boolean)) reason = 'Legacy global ability bonus schema requires qualification';
    return reason ? { status: 'unavailable', reason } : { status: 'ready', level, proficiency: Math.floor((level + 7) / 4) };
}
