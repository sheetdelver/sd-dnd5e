import { initializedModeState, type EffectModeState } from './mode-effects';
import { record } from '../native/6.0.6/source';

export interface PreparedNumericD20 {
    ability: string; total: number | null; formula: string | null; sourceMode?: -1 | 0 | 1; unavailableReason?: string;
}
export function independentD20Options(options: Record<string, unknown> = {}): boolean {
    return !['skill','tool','pace'].some(key => options[key] !== undefined);
}
export function numericD20Roll(check: PreparedNumericD20 | undefined, options: Record<string, unknown> = {}): string | null {
    if (!check?.formula || check.total === null || check.unavailableReason) return null;
    // Native combined checks change proficiency and can grant advantage. Never
    // silently execute the independent profile for a requested combination.
    if (!independentD20Options(options)) return null;
    if (options.ability !== undefined && options.ability !== check.ability) return null;
    const advantage = options.advantage ?? (check.sourceMode === 1 ? 'adv' : check.sourceMode === -1 ? 'dis' : 'normal');
    const die = advantage === 'normal' ? '1d20' : advantage === 'adv' ? '2d20kh1' : advantage === 'dis' ? '2d20kl1' : null;
    if (!die) return null;
    const bonus = options.situationalBonus;
    if (bonus !== undefined && (typeof bonus !== 'string' || bonus.length > 64 || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(bonus.trim()) || !Number.isFinite(Number(bonus)) || Math.abs(Number(bonus)) > 1_000_000_000)) return null;
    const base = `${die}${check.total < 0 ? '' : '+'}${check.total}`;
    return bonus === undefined ? base : `${base}+(${String(bonus).trim()})`;
}
/** Source modes plus qualified prepared effect counts. Raw modeCounts and
 * overrides are never trusted. Combination preserves native source multiplicity,
 * suppression, ordered overrides and the distinct passive/dispatch phases. */
export interface D20ModeScope {path:string;value:unknown;effectMode?:EffectModeState}
export function sourceD20Mode(scopes:readonly D20ModeScope[],automaticAdvantage=false,purpose:'roll'|'passive'='roll'): {mode:-1|0|1;reason?:undefined}|{mode?:undefined;reason:string} {
    let override:-1|0|1|null=null,advantages=Number(automaticAdvantage),disadvantages=0,suppressAdvantages=false,suppressDisadvantages=false;
    for(const {path,value,effectMode} of scopes){
        if(value!==undefined&&value!==null&&!record(value))return {reason:`Malformed source roll configuration: ${path}`};
        const state=effectMode??initializedModeState(record(value)?.mode);
        if(!state)return {reason:`Malformed source roll mode: ${path}`};
        if(state.override!==null)override=state.override;
        advantages+=state.advantages.count+Number(state.source===1);disadvantages+=state.disadvantages.count+Number(state.source===-1);
        suppressAdvantages||=state.advantages.suppressed;suppressDisadvantages||=state.disadvantages.suppressed;
    }
    // Native passive uses resolveMode's override before suppression; dispatch
    // uses combineFields' separate booleans, which suppression can still mask.
    if(purpose==='passive'&&override!==null)return {mode:override};
    const adv=(override===1||override===null&&advantages>0)&&!suppressAdvantages;
    const dis=(override===-1||override===null&&disadvantages>0)&&!suppressDisadvantages;
    return {mode:(Number(adv)-Number(dis)) as -1|0|1};
}
export function numericD20Formula(total: number, mode: -1 | 0 | 1): string {
    return `${mode === 1 ? '2d20kh1' : mode === -1 ? '2d20kl1' : '1d20'}${total < 0 ? '' : '+'}${total}`;
}
export function numericD20ExecutionReason(total: number, mode: -1 | 0 | 1): string | undefined {
    if (Math.abs(total) > 1_000_000_000) return 'Numeric roll bonus exceeds the supported host limit';
    return undefined;
}
export function abilityRollScopes(actor: unknown, ability: string, type: 'check' | 'save',modes:Readonly<Record<string,EffectModeState>>={}) {
    const system = record(record(actor)?.system), data = record(record(system?.abilities)?.[ability]);
    return [{ path: `abilities.${ability}.${type}.roll`, value: record(data?.[type])?.roll },
        { path: `rolls.ability.${type}`, value: record(record(system?.rolls)?.ability)?.[type] }].map(scope=>({...scope,effectMode:modes['system.'+scope.path+'.mode']}));
}

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
