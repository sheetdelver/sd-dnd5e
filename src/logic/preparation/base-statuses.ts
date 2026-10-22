import {record} from '../native/6.0.6/source';
import type {ConstantFilter} from './constant-filters';
export const ENCUMBRANCE_STATUS_IDS_606=['encumbered','heavilyEncumbered','exceedingCarryingCapacity']as const;
export const ENCUMBRANCE_STATUS_LABELS_606:Readonly<Record<string,string>>={encumbered:'Encumbered',heavilyEncumbered:'Heavily Encumbered',exceedingCarryingCapacity:'Exceeding Carrying Capacity'};
export interface BaseStatusSource606 {id:string;kind:'base';statuses:string[];condition:ConstantFilter;provenance:string}
/** Actor-owned base status source,not a typed ConditionData document. No names,
 * weight thresholds or raw Actor.statuses generate a status. Snapshot-dependent
 * guards,riders,changes,magic and Item transfer remain outside this profile. */
export function baseStatusSource606(effect:Record<string,unknown>,id:string,condition:ConstantFilter):BaseStatusSource606|{reason:string}{
 const system=record(effect.system)??{},rider=record(system.rider),raw=effect.statuses;
 if(effect.type!==undefined&&effect.type!=='base'||!Array.isArray(raw)||!raw.length||raw.length>256||raw.some(v=>typeof v!=='string'||!ENCUMBRANCE_STATUS_IDS_606.includes(v.trim()as typeof ENCUMBRANCE_STATUS_IDS_606[number])))return {reason:'Base statuses outside qualified encumbrance source profile'};
 if(system.magical!=null&&system.magical!==false||rider&&Object.entries(rider).some(([key,value])=>key!=='statuses'||Array.isArray(value)&&value.length))return {reason:'Base status magic/rider preparation requires qualification'};
 return {id,kind:'base',statuses:[...new Set(raw.map(v=>(v as string).trim()))],condition,provenance:'release-6.0.6 Actor.applyActiveEffects / BaseEffect status collection;source-only encumbrance statuses'};
}
