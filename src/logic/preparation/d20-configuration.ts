import {deterministicFormula606,qualifiedFormulaBonus606,type FormulaBindings606} from './deterministic-formula';
import { initializedModeState, type EffectModeState } from './mode-effects';
import { record } from '../native/6.0.6/source';
import {numericConstant} from './numeric';

export interface PreparedNumericD20 {
    ability: string; total: number | null; fixed?:boolean;trailingBonus?:number; formula: string | null; sourceMode?: -1 | 0 | 1; unavailableReason?: string;
    range?:NumericD20Range;defaultUnavailableReason?:string;preparedTotal?:number|null;preparationNote?:string;
}
/** Final constants are prepared by the shared effect phase, never inferred from
 * arbitrary formula strings or caller-supplied prepared-looking source. */
export function numericScopeBonus(scope:{path:string;value:unknown},executionBonuses:Readonly<Record<string,number>>={},formulaContext?:{bindings:FormulaBindings606;expressions:Readonly<Record<string,string>>}):number|null {
    const expression=formulaContext?.expressions['system.'+scope.path+'.bonus'];
    if(expression!==undefined){const value=deterministicFormula606(expression,formulaContext!.bindings);return value!==null&&qualifiedFormulaBonus606(value)?value:null;}
    return executionBonuses['system.'+scope.path+'.bonus']??numericConstant(record(scope.value)?.bonus);
}
export function preparedBonusNote(prepared:number|null,current:number|null,preparedProf?:number|null,currentProf?:number|null):string|undefined {
    if(prepared===null||current===null||prepared===current&&preparedProf===currentProf)return undefined;
    return `Prepared bonus ${prepared<0?'':'+'}${prepared}${preparedProf==null?'':` (${preparedProf}× proficiency)`}; current roll bonus ${current<0?'':'+'}${current}${currentProf==null?'':` (${currentProf}× proficiency)`}.`;
}
export interface NumericD20Range {minimum?:number;maximum?:number}
export function independentD20Options(options: Record<string, unknown> = {}): boolean {
    return !['skill','tool','pace'].some(key => options[key] !== undefined);
}
export function numericD20Roll(check: PreparedNumericD20 | undefined, options: Record<string, unknown> = {}): string | null {
    if(!record(options)||options.advantage!==undefined&&!['normal','adv','dis'].includes(String(options.advantage)))return null;
    if(Object.keys(options).some(key=>!['ability','advantage','situationalBonus','rollMode','speaker'].includes(key)))return null;
    if (!check || check.total === null || check.unavailableReason) return null;
    if(!check.formula&&!(check.defaultUnavailableReason&&check.range&&(check.sourceMode===1||check.sourceMode===-1)))return null;
    // Native combined checks change proficiency and can grant advantage. Never
    // silently execute the independent profile for a requested combination.
    if (!independentD20Options(options)) return null;
    if (options.ability !== undefined && options.ability !== check.ability) return null;
    if(check.fixed)return options.situationalBonus===undefined&&(options.advantage===undefined||options.advantage==='normal')?check.formula:null;
    const advantage = options.advantage ?? (check.sourceMode === 1 ? 'adv' : check.sourceMode === -1 ? 'dis' : 'normal');
    const die = advantage === 'normal' ? '1d20' : advantage === 'adv' ? '2d20kh1' : advantage === 'dis' ? '2d20kl1' : null;
    if (!die) return null;
    const bonus = options.situationalBonus;
    if (bonus !== undefined && (typeof bonus !== 'string' || bonus.length > 64 || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(bonus.trim()) || !Number.isFinite(Number(bonus)) || Math.abs(Number(bonus)) > 1_000_000_000)) return null;
    const base=numericD20Formula(check.total,advantage==='adv'?1:advantage==='dis'?-1:0,check.trailingBonus,check.range);
    if(!base)return null;
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
export function numericD20Formula(total: number, mode: -1 | 0 | 1,trailingBonus=0,range:NumericD20Range={}): string|null {
    if(!record(range)||Object.values(range).some(value=>typeof value!=='number'||!Number.isInteger(value)||value<1||value>20))return null;
    const bounded=range.minimum!==undefined||range.maximum!==undefined;
    if(bounded&&mode!==0)return null;
    const modifiers=(range.minimum===undefined?'':`min${range.minimum}`)+(range.maximum===undefined?'':`max${range.maximum}`);
    return `${mode === 1 ? '2d20kh1' : mode === -1 ? '2d20kl1' : '1d20'}${modifiers}${total < 0 ? '' : '+'}${total}`+(trailingBonus?`${trailingBonus<0?'':'+'}${trailingBonus}`:'');
}
/** Shared current-source readiness; mode-specific limits never turn a missing
 * context/formula or malformed input into an executable manual alternative. */
export function prepareD20Configuration(total:number,mode:-1|0|1,scopes:readonly {path:string;value:unknown}[],trailingBonus=0,hasDice=true):Pick<PreparedNumericD20,'formula'|'range'|'unavailableReason'|'defaultUnavailableReason'> {
    const parsed=d20SourceRange(scopes),reason=parsed.reason??numericD20ExecutionReason(total+trailingBonus,mode);
    if(reason)return {formula:null,unavailableReason:reason};
    if(!hasDice)return {formula:String(total)};
    const range=parsed.range,bounded=range.minimum!==undefined||range.maximum!==undefined;
    const formula=numericD20Formula(total,mode,trailingBonus,range);
    return {formula,...(bounded?{range}:{}),...(bounded&&mode!==0?{defaultUnavailableReason:'Advantage and disadvantage are unavailable with these die bounds. Choose Normal.'}:{})};
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
 * Normal bounds compile after C20/C21 public qualification. Bounded adv/dis
 * remains unqualified; ranges never modify static/passive totals.
 */
export function d20SourceRange(scopes:readonly {path:string;value:unknown}[]):{range:NumericD20Range;reason?:string} {
    const range:NumericD20Range={};
    for (const { path, value } of scopes) {
        if (value == null) continue;
        const scope = record(value);
        if (!scope) return {range,reason:`Malformed native die range configuration: ${path}`};
        for (const field of ['min', 'max']) {
            const bound = scope[field];
            if (bound == null) continue;
            if (typeof bound !== 'number' || !Number.isInteger(bound) || bound < 1 || bound > 20) return {range,reason:`Malformed native die range: ${path}.${field}`};
            if(field==='min')range.minimum=Math.max(range.minimum??-Infinity,bound);else range.maximum=Math.min(range.maximum??Infinity,bound);
        }
    }
    return {range};
}
/** Selected legacy profile retains its separate unqualified range boundary. */
export function d20RangeReason(scopes:readonly {path:string;value:unknown}[],hasDice=true):string|undefined {
    const parsed=d20SourceRange(scopes);return parsed.reason??(hasDice&&(parsed.range.minimum!==undefined||parsed.range.maximum!==undefined)?'Native die range requires qualification for the selected profile':undefined);
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
