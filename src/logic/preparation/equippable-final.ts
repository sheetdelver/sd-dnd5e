import {record,ownedItemUuid} from '../native/6.0.6/source';
import {initializeTraitSet606} from './trait-fields';
import {itemEffectState606,EQUIPPABLE_TYPES_606,OTHER_ITEM_TYPES_606,type ItemEffectState} from './item-effect-state';
import {itemLocalEffectsReason606} from './effect-admission';
export interface EquippableFinal606 {status:'ready'|'unavailable';reason?:string;initial:ItemEffectState;current?:ItemEffectState;attunement:string|null;attuned:boolean|null;count:number|null;actorFinalReason?:string;provenance:string}
export interface EquippableItems606 {items:Record<string,EquippableFinal606>;count:number|null;reason?:string}
const provenance='release-6.0.6 EquippableItemTemplate.prepareFinalEquippableData / Item.areEffectsSuppressed;source/defaults and final fields distinct';
/** All five native equippable types declare mgc as a valid property. This is a
 * pinned type/schema fact,not inference from an Item label or supplied getter. */
function prepareItem(item:Record<string,unknown>,identityReason?:string):EquippableFinal606 {
 const initial=itemEffectState606(item),data=item.system===undefined?{}:record(item.system),properties=initializeTraitSet606(data?.properties),reason=identityReason??initial.reason??itemLocalEffectsReason606(item)??(!data||!properties?'Equippable property source malformed':undefined);
 if(reason||!initial.initialized)return {status:'unavailable',reason:reason??'Equippable initialized operands unavailable',initial,attunement:null,attuned:null,count:null,provenance};
 const attunement=properties!.includes('mgc')?initial.initialized.attunement:'',attuned=Boolean(attunement)&&initial.initialized.attuned,current=itemEffectState606({...item,system:{...data,attunement,attuned}});
 // These origins describe input cleaning only. Computed final fields must not
 // be relabeled as persisted source.
 delete current.origins;
 return {status:'ready',initial,current,attunement,attuned,count:Number(attuned),actorFinalReason:actorFinalRecipeReason(item,data!),provenance};
}
/** C91's actual per-type no-activity/no-counter final hook profile. Other Item
 * final lifecycles remain explicit qualification work. */
function actorFinalRecipeReason(item:Record<string,unknown>,data:Record<string,unknown>):string|undefined {
 if(item.type!=='container'){
  const activities=data.activities===undefined?{}:record(data.activities),uses=data.uses===undefined?{}:record(data.uses);
  if(!activities||Object.keys(activities).length)return 'Transferred Item final activities require qualification';
  if(!uses||uses.max!==undefined&&uses.max!==''||uses.spent!==undefined&&uses.spent!==0||uses.recovery!==undefined&&(!Array.isArray(uses.recovery)||uses.recovery.length))return 'Transferred Item final configured uses require qualification';
 }
 if(item.type==='weapon'){
  const emptyRange=(value:unknown)=>value==null||value===0;
  const type=record(data.type)?.value??'simpleM',range=record(data.range),properties=initializeTraitSet606(data.properties);
  if(type!=='simpleM'||!range||!emptyRange(range.value)||!emptyRange(range.long)||!emptyRange(range.reach)||range.units!=='ft'||properties?.includes('thr'))return 'Transferred weapon final range/label profile requires qualification';
 }
}
/** One revision-owned result consumed by effect planning and Item projections.
 * No source mutation,reference lookup,world cache or activity execution. */
export function prepareEquippableItems606(actor:unknown):EquippableItems606 {
 const source=record(actor),list=source?.items,items:EquippableItems606['items']=Object.create(null);if(!Array.isArray(list))return {items,count:null,reason:'Owned Item collection unavailable'};
 const ids=new Map<unknown,number>();for(const raw of list){const id=record(raw)?._id;ids.set(id,(ids.get(id)??0)+1);}
 let reason:string|undefined,count=0;
 for(const raw of list){const item=record(raw);if(!item||![...EQUIPPABLE_TYPES_606,...OTHER_ITEM_TYPES_606].includes(String(item.type))){reason??='Owned Item type/source unavailable for attunement';continue;}if(!EQUIPPABLE_TYPES_606.includes(String(item.type)))continue;const id=item._id;let identityReason:string|undefined;
  if(typeof id!=='string'||!id||ids.get(id)!==1){reason??='Equippable Item identity missing or duplicated';continue;}
  try{const uuid=ownedItemUuid(source?._id as string,id);if(item.uuid!==undefined&&item.uuid!==uuid)identityReason='Equippable Item canonical identity mismatch';}catch{identityReason='Equippable Item canonical identity unavailable';}
  const state=prepareItem(item,identityReason);items[id]=state;if(state.count===null)reason??=state.reason;else count+=state.count;
 }
 return {items,count:reason?null:count,reason};
}
export function equippableActorFinalReason606(itemId:string|null,prepared:EquippableItems606,hasConditions:boolean):string|undefined {
 if(!itemId||!Object.hasOwn(prepared.items,itemId))return 'Transferred Item final recipe/identity requires qualification';
 if(hasConditions)return 'Transferred Item final condition composition requires qualification';
 const state=prepared.items[itemId];return state.reason??state.actorFinalReason;
}

/** Same Actor field handlers after the qualified Item final hook. Identity and
 * native schema validation still occur in numeric-effects;this permits no new
 * Item activities,counters,conditions or field arithmetic. */
export const transferredFinalCheckPath606=(key:string):boolean=>/^system\.(?:abilities\.(?:str|dex|con|int|wis|cha)\.(?:value|check\.roll\.(?:bonus|mode))|(?:skills|tools)\.[^.]+\.(?:value|roll\.(?:bonus|mode))|rolls\.ability\.(?:check|skill|tool)\.(?:proficiency|bonus|mode))$/.test(key);
