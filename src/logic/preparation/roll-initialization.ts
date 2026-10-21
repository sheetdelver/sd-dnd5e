import { record } from '../native/6.0.6/source';

/** CreatureTemplate.defineSchema: global proficiency targets are initial0,
 * persisted:false. Detached initialized config only; source stays unchanged.
 * Qualified effect phases must supply later values, never stale source fields.
 */
export function initializedAbilityRolls606(actor: unknown): Record<string, Record<string, unknown>> {
    const raw = record(record(record(record(actor)?.system)?.rolls)?.ability) ?? {};
    return Object.fromEntries(['check', 'save', 'skill', 'tool'].map(key => [key, { ...record(raw[key]), proficiency: 0 }]));
}

/** CommonTemplate persisted save coefficient: missing on an existing ability
 * initializes0. Null/coerced/out-of-profile values remain unqualified. */
export function initializedSaveProficiency606(ability:unknown):number|null {
    const data=record(ability);if(!data)return null;
    const value=data.proficient===undefined?0:data.proficient;
    return value===0||value===1?value:null;
}
