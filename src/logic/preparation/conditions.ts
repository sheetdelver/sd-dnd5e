import {record} from '../native/6.0.6/source';
import {FAMILY_CONDITION_IDS_606,type QualifiedCondition606} from '../native/6.0.6/condition-identities';
import {initializeTraitSet606} from './trait-fields';
import {constantFilter606,type ConstantFilter} from './constant-filters';
import type {RulesContext} from '../rules-context';
export interface ConditionSource606 {
    id:string;type:QualifiedCondition606;statuses:string[];level:number|null;condition:ConstantFilter;
    source:{type:string;statuses:string[]|null|'[absent]';level:number|null|'[absent]';disabled:boolean|null|'[absent]'};
}
export interface ConditionPreparation606 {
    status:'ready'|'unavailable';reason?:string;initialStatuses:string[];statuses:string[];
    sources:ConditionSource606[];levels:Record<string,number>;rollReduction:number;speedReduction:number;
    rules:{noMovement:boolean;crawl:boolean};
    modes:Array<{path:string;mode:-1|1;phase:'abilities'|'initiative';source:string}>;
    immunitySource?:string[]|null|'[absent]'|'[malformed]';provenance:string;
}
const provenance='release-6.0.6 nonpersisted Common.conditions / ConditionData / Actor initial status collection / TraitsFields.prepareResistImmune / CommonTemplate.prepareAbilities / AttributesFields.prepareInitiative/prepareMovement';
/** Bounded Actor-owned condition mode/movement source envelope after generic effect
 * admission. No type/name-to-status inference; source remains unchanged. */
export function conditionSource606(effect:Record<string,unknown>,id:string):ConditionSource606|{reason:string} {
    const system=record(effect.system)??{},type=system.type;
    if(typeof type!=='string'||!['poisoned','exhaustion',...FAMILY_CONDITION_IDS_606].includes(type.trim()))return {reason:'Condition type outside qualified mode/movement profile'};
    const identity=type.trim() as ConditionSource606['type'];
    const level=system.level;
    if(level!=null&&(typeof level!=='number'||!Number.isSafeInteger(level)||level<1))return {reason:'Condition level source malformed or unqualified'};
    const raw=effect.statuses;
    if(raw!=null&&(!Array.isArray(raw)||raw.length>256||raw.some(value=>typeof value!=='string'||(['poisoned','exhaustion'].includes(identity)?value.trim()!==identity:!FAMILY_CONDITION_IDS_606.includes(value.trim() as typeof FAMILY_CONDITION_IDS_606[number])))))return {reason:'Condition statuses outside qualified type profile'};
    const statuses=initializeTraitSet606(raw);if(!statuses)return {reason:'Condition statuses source unavailable'};
    const condition=constantFilter606(system.conditions);
    if(condition.status!=='ready')return {reason:'Condition predicate requires first-evaluation snapshot qualification'};
    const rider=record(system.rider);
    if(system.rider!=null&&(!rider||Object.keys(rider).some(key=>key!=='statuses')||rider.statuses!=null&&(!Array.isArray(rider.statuses)||rider.statuses.length)))return {reason:'Condition rider preparation unavailable'};
    return {id,type:identity,statuses,level:identity==='exhaustion'?Math.min(6,level??1):null,condition,source:{type,statuses:raw===undefined?'[absent]':raw===null?null:[...raw as string[]],level:level===undefined?'[absent]':level as number|null,disabled:effect.disabled===undefined?'[absent]':effect.disabled as boolean|null}};
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
    const initialStatuses:string[]=[],statuses:string[]=[],levels:Record<string,number>={},rules={noMovement:false,crawl:false},modes:ConditionPreparation606['modes']=[];
    if(!failed){
        for(const source of sources){
            if(initial?.includes(source.type))continue;
            // Condition derived data runs while the cached guard is still null.
            // Preserve last-active assignment separately from initial status collection.
            if(source.level!==null)levels[source.type]=source.level;
            const derivedStatuses=[...source.statuses,...(source.type==='exhaustion'&&source.level===6?['dead']:[])];
            if(source.condition.matches)for(const status of derivedStatuses)if(!initialStatuses.includes(status))initialStatuses.push(status);
        }
        statuses.push(...initialStatuses.filter(status=>!final?.includes(status)));
        if(statuses.includes('poisoned'))for(const ability of ['str','dex','con','int','wis','cha'])if(record(record(system.abilities)?.[ability]))modes.push({path:`system.abilities.${ability}.check.roll.mode`,mode:-1,phase:'abilities',source:'poisoned'});
        rules.noMovement=statuses.some(id=>['grappled','paralyzed','restrained'].includes(id));rules.crawl=statuses.includes('prone');
        if(record(record(system.abilities)?.dex)){
            if(statuses.includes('dodging')&&!statuses.includes('incapacitated')&&!rules.noMovement)modes.push({path:'system.abilities.dex.save.roll.mode',mode:1,phase:'abilities',source:'dexteritySaveAdvantage'});
            if(statuses.includes('restrained'))modes.push({path:'system.abilities.dex.save.roll.mode',mode:-1,phase:'abilities',source:'dexteritySaveDisadvantage'});
        }
        if(statuses.includes('invisible'))modes.push({path:'system.attributes.init.roll.mode',mode:1,phase:'initiative',source:'initiativeAdvantage'});
        if(statuses.some(id=>['incapacitated','surprised'].includes(id)))modes.push({path:'system.attributes.init.roll.mode',mode:-1,phase:'initiative',source:'initiativeDisadvantage'});
    }
    // Native nonpersisted map initialization discards raw prepared-looking fields.
    system.conditions={...levels};
    const exhaustion=statuses.includes('exhaustion')?(levels.exhaustion??0):0;
    const rawImmunity=record(record(raw.traits)?.ci)?.value;
    const immunitySource=rawImmunity===undefined?'[absent]':rawImmunity===null?null:Array.isArray(rawImmunity)&&initial!==null?[...rawImmunity] as string[]:'[malformed]';
    return {immunitySource,rules,levels,rollReduction:exhaustion?-2*exhaustion:0,speedReduction:5*exhaustion,status:failed?'unavailable':'ready',...(failed?{reason:failed}:{}),sources,initialStatuses,statuses,modes,provenance};
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
    return derived?.conditions??{status:'unavailable',reason:'Condition preparation unavailable',initialStatuses:[],statuses:[],sources:[],rules:{noMovement:false,crawl:false},levels:{},rollReduction:0,speedReduction:0,modes:[],provenance};
}
