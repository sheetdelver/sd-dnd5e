import { record } from '../native/6.0.6/source';
import {constantFilter606,type ConstantFilter} from './constant-filters';
import {itemEffectState606,type ItemEffectState} from './item-effect-state';
export interface EffectDecision {id:string;parentId?:string;status:string;reason?:string;eligibility?:ItemEffectState;condition?:ConstantFilter;key?:string}
export interface EffectChange {effectId:string;key:string;type:string;value:unknown;phase:'initial'|'final';priority:number;order:number;condition?:ConstantFilter}
export interface EffectPlan {initial:EffectChange[];final:EffectChange[];decisions:EffectDecision[];reason?:string}
const priorities:Readonly<Record<string,number>>={custom:0,multiply:10,add:20,subtract:20,downgrade:30,upgrade:40,override:50};
/** Source-only eligibility/phase plan for exact6.0.6/Foundry14.367.
 * No Item preparation, snapshot-dependent filters, statuses or time are fabricated. Item-targeted
 * effects stay blocked because prepared Items can feed Actor class/rule data.
 * Field/phase qualification is handled separately by numeric-effects. */
export function planEffects606(actor:unknown):EffectPlan {
    const source=record(actor)??{},initial:EffectChange[]=[],final:EffectChange[]=[],decisions:EffectDecision[]=[];
    let reason:string|undefined,order=0;
    const fail=(id:string,status:string,message:string,parentId?:string)=>{reason??=message;decisions.push({id,parentId,status,reason:message});};
    function collect(list:unknown,item?:Record<string,unknown>){
        if(list===undefined)return;
        const parentId=typeof item?._id==='string'?item._id:undefined;
        if(!Array.isArray(list)){fail('', 'malformed','Active effect source collection malformed',parentId);return;}
        for(const raw of list){
            const effect=record(raw),id=typeof effect?._id==='string'?effect._id:'';
            if(effect?.disabled===true){decisions.push({id,parentId,status:'disabled'});continue;}
            if(!effect||!id){fail(id,'malformed','Active effect source identity unavailable',parentId);continue;}
            if(effect.disabled!==undefined&&effect.disabled!==false){fail(id,'malformed','Active effect disabled state malformed',parentId);continue;}
            if(effect.system!==undefined&&!record(effect.system)){fail(id,'malformed','Effect system source malformed',parentId);continue;}
            const system=record(effect.system)??{};
            let eligibility:ItemEffectState|undefined;
            if(item){
                // Source schema transfer defaults true; no Actor-target claim
                // follows for Item-target/nontransfer effects.
                if(effect.transfer!==undefined&&typeof effect.transfer!=='boolean'){fail(id,'malformed','Effect transfer state malformed',parentId);continue;}
                if(effect.transfer===false||effect.type==='enchantment'){fail(id,'item-preparation-unavailable','Owned Item effect preparation unavailable',parentId);continue;}
                eligibility=itemEffectState606(item);
                if(eligibility.reason){fail(id,'item-preparation-unavailable',eligibility.reason,parentId);continue;}
                if(eligibility.suppressed){decisions.push({id,parentId,status:'item-suppressed',eligibility});continue;}
                // Hidden/dependent Items and riders need qualified Item phases.
                if(Object.values(record(record(item.flags)?.dnd5e)??{}).some(Boolean)){fail(id,'item-preparation-unavailable','Item dependency/rider preparation unavailable',parentId);continue;}
            }
            if(effect.type!==undefined&&effect.type!=='base'){fail(id,'type-unavailable','Active effect type preparation unavailable',parentId);continue;}
            const duration=record(effect.duration);
            if(effect.start!=null||duration&&Object.entries(duration).some(([key,value])=>!['units','value','expiry','expired'].includes(key)||key==='value'&&value!=null||key==='expiry'&&value!=null||key==='expired'&&value!==false)){
                fail(id,'duration-unavailable','Effect duration/expiry preparation unavailable',parentId);continue;
            }
            if(effect.duration!=null&&!duration){fail(id,'duration-unavailable','Effect duration source malformed',parentId);continue;}
            if(Object.values(record(record(effect.flags)?.dnd5e)??{}).some(Boolean)){
                fail(id,'conditions-unavailable','Effect conditions/dependencies require Q02a qualification',parentId);continue;
            }
            const rider=system.rider==null?{}:record(system.rider),statuses=effect.statuses,riderStatuses=rider?.statuses;
            if(!rider||[statuses,riderStatuses].some(value=>value!==undefined&&(!Array.isArray(value)||value.some(entry=>typeof entry!=='string')))){
                fail(id,'status-unavailable','Effect status/rider source malformed',parentId);continue;
            }
            if(effect.changes!==undefined){fail(id,'legacy-unavailable','Legacy effect change migration requires qualification',parentId);continue;}
            const changes=system.changes===undefined?[]:system.changes;
            if(!Array.isArray(changes)){fail(id,'malformed','Effect changes source malformed',parentId);continue;}
            const envelopes:Array<{change:Record<string,unknown>;key:string;phase:'initial'|'final';type:string;priority:number}>=[];
            for(const rawChange of changes){
                const change=record(rawChange);if(change?.key==='')continue;
                if(!change||typeof change.key!=='string'||!change.key){fail(id,'malformed','Effect change key unavailable',parentId);continue;}
                const phase=change.phase===undefined?'initial':change.phase,type=change.type===undefined?'add':change.type;
                if(phase!=='initial'&&phase!=='final'||typeof type!=='string'||!Object.hasOwn(priorities,type)){
                    fail(id,'change-unavailable','Effect change phase/type requires qualification',parentId);continue;
                }
                const priority=change.priority??priorities[type];
                if(typeof priority!=='number'||!Number.isFinite(priority)){fail(id,'malformed','Effect priority source malformed',parentId);continue;}
                envelopes.push({change,key:change.key,phase:phase as 'initial'|'final',type,priority});
            }
            const condition=constantFilter606(system.conditions);
            if(condition.status==='unavailable'){
                fail(id,'conditions-unavailable',condition.reason,parentId);continue;
            }
            if(!condition.matches){decisions.push({id,parentId,status:'condition-suppressed',condition,...(eligibility?{eligibility}:{})});continue;}
            if((statuses as unknown[]|undefined)?.length||(riderStatuses as unknown[]|undefined)?.length){
                fail(id,'status-unavailable','Effect status/rider preparation unavailable',parentId);continue;
            }
            let any=false;
            for(const {change,key,phase,type,priority} of envelopes){
                const changeCondition=constantFilter606(change.conditions);
                if(changeCondition.status==='unavailable'||change.replacement!==undefined&&change.replacement!==''){
                    fail(id,'conditions-unavailable','Effect change filters/replacement require Q02a qualification',parentId);continue;
                }
                if(!changeCondition.matches){decisions.push({id,parentId,key,status:'change-filtered',condition:changeCondition});continue;}
                const entry:EffectChange={effectId:id,key,type,value:structuredClone(change.value),phase:phase as 'initial'|'final',priority,order:order++,condition:changeCondition};
                (phase==='initial'?initial:final).push(entry);any=true;
            }
            decisions.push({id,parentId,status:any?'eligible':'no-changes',condition,...(eligibility?{eligibility}:{})});
        }
    }
    collect(source.effects);
    if(Array.isArray(source.items))for(const raw of source.items){const item=record(raw);if(item)collect(item.effects,item);}
    for(const changes of [initial,final])changes.sort((a,b)=>a.priority-b.priority||a.order-b.order);
    return {initial,final,decisions,...(reason?{reason}:{})};
}
