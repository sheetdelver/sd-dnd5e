import { record } from '../native/6.0.6/source';
export interface EffectDecision {id:string;parentId?:string;status:string;reason?:string}
export interface EffectChange {effectId:string;key:string;type:string;value:unknown;phase:'initial'|'final';priority:number;order:number}
export interface EffectPlan {initial:EffectChange[];final:EffectChange[];decisions:EffectDecision[];reason?:string}
const priorities:Readonly<Record<string,number>>={custom:0,multiply:10,add:20,subtract:20,downgrade:30,upgrade:40,override:50};
/** Source-only eligibility/phase plan for exact6.0.6/Foundry14.367.
 * No Item preparation, filters, statuses or time are fabricated. Item-targeted
 * effects stay blocked because prepared Items can feed Actor class/rule data.
 * Active changes remain unavailable until their field/phase is qualified. */
export function planEffects606(actor:unknown):EffectPlan {
    const source=record(actor)??{},initial:EffectChange[]=[],final:EffectChange[]=[],decisions:EffectDecision[]=[];
    let reason:string|undefined,order=0;
    const fail=(id:string,status:string,message:string,parentId?:string)=>{reason??=message;decisions.push({id,parentId,status,reason:message});};
    const emptyCondition=(value:unknown)=>value===undefined||value==='{}';
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
            const system=record(effect.system)??{},itemSystem=record(item?.system)??{};
            if(item){
                // Source schema transfer defaults true; no Actor-target claim
                // follows for Item-target/nontransfer effects.
                if(effect.transfer!==undefined&&typeof effect.transfer!=='boolean'){fail(id,'malformed','Effect transfer state malformed',parentId);continue;}
                if(effect.transfer===false||effect.type==='enchantment'){fail(id,'item-preparation-unavailable','Owned Item effect preparation unavailable',parentId);continue;}
                const type=record(itemSystem.type)?.value;
                const requireEquipped=item.type!=='consumable'||['rod','trinket','wand'].includes(String(type));
                if(requireEquipped&&itemSystem.equipped===false||itemSystem.attunement==='required'&&itemSystem.attuned===false){decisions.push({id,parentId,status:'item-suppressed'});continue;}
                // Hidden/dependent Items and riders need qualified Item phases.
                if(Object.values(record(record(item.flags)?.dnd5e)??{}).some(Boolean)){fail(id,'item-preparation-unavailable','Item dependency/rider preparation unavailable',parentId);continue;}
            }
            if(effect.type!==undefined&&effect.type!=='base'){fail(id,'type-unavailable','Active effect type preparation unavailable',parentId);continue;}
            const duration=record(effect.duration);
            if(effect.start!=null||duration&&Object.entries(duration).some(([key,value])=>!['units','value','expiry','expired'].includes(key)||key==='value'&&value!=null||key==='expiry'&&value!=null||key==='expired'&&value!==false)){
                fail(id,'duration-unavailable','Effect duration/expiry preparation unavailable',parentId);continue;
            }
            if(effect.duration!=null&&!duration){fail(id,'duration-unavailable','Effect duration source malformed',parentId);continue;}
            if(!emptyCondition(system.conditions)||Object.values(record(record(effect.flags)?.dnd5e)??{}).some(Boolean)){
                fail(id,'conditions-unavailable','Effect conditions/dependencies require Q02a qualification',parentId);continue;
            }
            if(effect.statuses!==undefined&&(!Array.isArray(effect.statuses)||effect.statuses.length)||record(system.rider)?.statuses&&(!Array.isArray(record(system.rider)!.statuses)||(record(system.rider)!.statuses as unknown[]).length)){
                fail(id,'status-unavailable','Effect status/rider preparation unavailable',parentId);continue;
            }
            if(effect.changes!==undefined){fail(id,'legacy-unavailable','Legacy effect change migration requires qualification',parentId);continue;}
            const changes=system.changes===undefined?[]:system.changes;
            if(!Array.isArray(changes)){fail(id,'malformed','Effect changes source malformed',parentId);continue;}
            let any=false;
            for(const rawChange of changes){
                const change=record(rawChange);if(change?.key==='')continue;
                if(!change||typeof change.key!=='string'||!change.key){fail(id,'malformed','Effect change key unavailable',parentId);continue;}
                const phase=change.phase===undefined?'initial':change.phase,type=change.type===undefined?'add':change.type;
                if(!['initial','final'].includes(String(phase))||typeof type!=='string'||!Object.hasOwn(priorities,type)){
                    fail(id,'change-unavailable','Effect change phase/type requires qualification',parentId);continue;
                }
                if(!emptyCondition(change.conditions)||change.replacement!==undefined&&change.replacement!==''){
                    fail(id,'conditions-unavailable','Effect change filters/replacement require Q02a qualification',parentId);continue;
                }
                const priority=change.priority??priorities[type];
                if(typeof priority!=='number'||!Number.isFinite(priority)){fail(id,'malformed','Effect priority source malformed',parentId);continue;}
                const entry:EffectChange={effectId:id,key:change.key,type,value:structuredClone(change.value),phase:phase as 'initial'|'final',priority,order:order++};
                (phase==='initial'?initial:final).push(entry);any=true;
            }
            decisions.push({id,parentId,status:any?'eligible':'no-changes'});
        }
    }
    collect(source.effects);
    if(Array.isArray(source.items))for(const raw of source.items){const item=record(raw);if(item)collect(item.effects,item);}
    for(const changes of [initial,final])changes.sort((a,b)=>a.priority-b.priority||a.order-b.order);
    if(initial.length||final.length)reason??='Active effect field/phase preparation unavailable';
    return {initial,final,decisions,...(reason?{reason}:{})};
}
