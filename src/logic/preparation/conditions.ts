import {record} from '../native/6.0.6/source';
import {initializeTraitSet606} from './trait-fields';
import {constantFilter606,type ConstantFilter} from './constant-filters';
import type {RulesContext} from '../rules-context';
export interface ConditionSource606 {
    id:string;type:'poisoned';statuses:string[];level:null;condition:ConstantFilter;
    source:{type:string;statuses:string[]|null|'[absent]';level:number|null|'[absent]';disabled:boolean|null|'[absent]'};
}
export interface ConditionPreparation606 {
    status:'ready'|'unavailable';reason?:string;initialStatuses:string[];statuses:string[];
    sources:ConditionSource606[];
    modes:Array<{path:string;mode:-1;phase:'abilities';source:'poisoned'}>;
    provenance:string;
}
const provenance='release-6.0.6 ConditionData / Actor initial status collection / TraitsFields.prepareResistImmune / CommonTemplate.prepareAbilities';
/** Bounded Actor-owned, nonleveled poisoned source envelope after generic effect
 * admission. No type/name-to-status inference; source remains unchanged. */
export function conditionSource606(effect:Record<string,unknown>,id:string):ConditionSource606|{reason:string} {
    const system=record(effect.system)??{},type=system.type;
    if(typeof type!=='string'||type.trim()!=='poisoned')return {reason:'Condition type outside qualified poisoned profile'};
    const level=system.level;
    if(level!=null&&(typeof level!=='number'||!Number.isSafeInteger(level)||level<1))return {reason:'Condition level source malformed or unqualified'};
    const raw=effect.statuses;
    if(raw!=null&&(!Array.isArray(raw)||raw.length>256||raw.some(value=>typeof value!=='string'||value.trim()!=='poisoned')))return {reason:'Condition statuses outside qualified poisoned profile'};
    const statuses=initializeTraitSet606(raw);if(!statuses)return {reason:'Condition statuses source unavailable'};
    const condition=constantFilter606(system.conditions);
    if(condition.status!=='ready')return {reason:'Condition predicate requires first-evaluation snapshot qualification'};
    const rider=record(system.rider);
    if(system.rider!=null&&(!rider||Object.keys(rider).some(key=>key!=='statuses')||rider.statuses!=null&&(!Array.isArray(rider.statuses)||rider.statuses.length)))return {reason:'Condition rider preparation unavailable'};
    return {id,type:'poisoned',statuses,level:null,condition,source:{type,statuses:raw===undefined?'[absent]':raw===null?null:[...raw as string[]],level:level===undefined?'[absent]':level as number|null,disabled:effect.disabled===undefined?'[absent]':effect.disabled as boolean|null}};
}
function immunities(system:Record<string,unknown>):string[]|null {
    const traits=system.traits==null?{}:record(system.traits);if(!traits)return null;
    const ci=traits.ci==null?{}:record(traits.ci);if(!ci)return null;
    const raw=ci.value;
    if(raw!=null&&(!Array.isArray(raw)||raw.length>256||raw.some(value=>typeof value!=='string'||value.length>256)))return null;
    return initializeTraitSet606(raw);
}
/** Snapshot statuses BEFORE initial CI writes, then remove final immunities.
 * Never recompute from final Document.active: removal of an initial immunity
 * cannot retroactively add an omitted status. Source/prepared maps stay distinct. */
export function prepareConditions606(actor:unknown,system:Record<string,unknown>,sources:ConditionSource606[],reason?:string):ConditionPreparation606 {
    const source=record(actor),raw=record(source?.system)??{},initial=immunities(raw),final=immunities(system);
    const failed=reason??(source?.statuses!==undefined&&(!Array.isArray(source.statuses)||source.statuses.length)?'Prepared status source requires qualification':undefined)??(sources.length&&(!initial||!final)?'Condition immunity source/preparation unavailable':undefined);
    const initialStatuses:string[]=[],statuses:string[]=[],modes:ConditionPreparation606['modes']=[];
    if(!failed){
        for(const source of sources)if(source.condition.matches&&!initial?.includes(source.type))for(const status of source.statuses)if(!initialStatuses.includes(status))initialStatuses.push(status);
        statuses.push(...initialStatuses.filter(status=>!final?.includes(status)));
        if(statuses.includes('poisoned'))for(const ability of ['str','dex','con','int','wis','cha'])if(record(record(system.abilities)?.[ability]))modes.push({path:`system.abilities.${ability}.check.roll.mode`,mode:-1,phase:'abilities',source:'poisoned'});
    }
    return {status:failed?'unavailable':'ready',...(failed?{reason:failed}:{}),sources,initialStatuses,statuses,modes,provenance};
}
export function projectConditions606(actor:unknown,context:RulesContext,prepared:ConditionPreparation606):ConditionPreparation606 {
    const source=record(actor),s=record(source?.system),attributes=record(s?.attributes),flags=record(record(source?.flags)?.dnd5e),encumbrance=context.settings['dnd5e.encumbrance'];
    const reason=context.status!=='supported'||context.profile!=='2024'?'Condition rules context unavailable':source?.type!=='character'?'Condition profile requires a player character'
        :Object.values(flags??{}).some(Boolean)?'Native flag or transformation condition preparation unavailable'
        :!encumbrance||encumbrance.status==='unavailable'||encumbrance.value!=='none'?'Condition/encumbrance interaction unavailable'
            :attributes?.exhaustion!==undefined&&attributes.exhaustion!==0?'Legacy exhaustion source migration requires qualification'
                :source?.statuses!==undefined&&(!Array.isArray(source.statuses)||source.statuses.length)?'Prepared status source requires qualification':prepared.reason;
    return reason?{...prepared,status:'unavailable',reason,statuses:[],modes:[]}:prepared;
}
export function conditionsProjection(derived:Record<string,any>|undefined):ConditionPreparation606 {
    return derived?.conditions??{status:'unavailable',reason:'Condition preparation unavailable',initialStatuses:[],statuses:[],sources:[],modes:[],provenance};
}
