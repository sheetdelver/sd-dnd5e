import { record } from '../native/6.0.6/source';

/** Exact 6.0.6 D20RollModificationField: min/max default null, integer 1–20.
 * Configured bounds are preserved as an execution blocker until Q00 qualifies
 * equivalent public roll semantics. They do not modify static/passive totals.
 */
export function d20RangeReason(scopes: readonly { path: string; value: unknown }[]): string | undefined {
    for (const { path, value } of scopes) {
        if (value == null) continue;
        const scope = record(value);
        if (!scope) return `Malformed native die range configuration: ${path}`;
        for (const field of ['min', 'max']) {
            const bound = scope[field];
            if (bound == null) continue;
            if (typeof bound !== 'number' || !Number.isInteger(bound) || bound < 1 || bound > 20) return `Malformed native die range: ${path}.${field}`;
        }
    }
    for (const { path, value } of scopes) {
        const scope = record(value);
        if (scope?.min != null || scope?.max != null) return `Native die range requires Q00 execution qualification: ${path}`;
    }
    return undefined;
}
export function skillRollScopes(actor: unknown, key: string) {
    const system = record(record(actor)?.system), skill = record(record(system?.skills)?.[key]);
    const ability = typeof skill?.ability === 'string' ? skill.ability : '';
    const abilities = record(system?.abilities), global = record(record(system?.rolls)?.ability);
    return [
        { path: `skills.${key}.roll`, value: skill?.roll },
        { path: `abilities.${ability}.check.roll`, value: record(record(abilities?.[ability])?.check)?.roll },
        { path: 'rolls.ability.check', value: global?.check },
        { path: 'rolls.ability.skill', value: global?.skill },
    ];
}
