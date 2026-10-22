import {prepareItemProficiency606,itemProficiencyBindings606,type ItemProficiency606} from './item-proficiency';
import type {PhysicalItem606} from './physical';
import {preparedFormulaBindings606} from './formula-fields';
import {deterministicFormula606,formulaUnavailableReason606,type FormulaBindings606} from './deterministic-formula';
import {spellMetadata606,type SpellMetadata} from './spell-metadata';
import {weaponModes606,itemAttack606,type AttackFacts} from './item-combat';
import type {NumericEffects} from './numeric-effects';
import {record,activityTypes,ownedItemUuid} from '../native/6.0.6/source';
import type {RulesContext} from '../rules-context';
import {numericConstant} from './numeric';
import {itemEffectState606} from './item-effect-state';
export interface ItemFact<T>{status:'ready'|'unavailable'|'not-applicable';value:T|null;reason?:string;origin:'source'|'schema-default'|'prepared';provenance:string}
export interface RecoveryFact {period:string;type:string;formula:string|null}
export interface UsesFacts {status:'ready'|'unavailable'|'not-applicable';reason?:string;max:number|null;spent:number|null;remaining:number|null;limited:boolean|null;capacitySource:string|null;origin:'source'|'schema-default';recovery:ItemFact<RecoveryFact[]>;display:string;provenance:string}
export interface ActivityFacts {id:string;itemId:string;type:string;name:string;sort:number;activation:string|null;uses:UsesFacts;status:'ready'|'unavailable';reason?:string;executionReason:string;attack?:ItemFact<AttackFacts>}
export interface ItemFacts {proficiency:ItemProficiency606;physical?:PhysicalItem606;id:string;uuid:string|null;type:string;name:string;status:'ready'|'partial'|'unavailable';reason?:string;quantity:ItemFact<number>;weight:ItemFact<{value:number;units:string;stack:number|null}>;equipped:ItemFact<boolean>;attuned:ItemFact<boolean>;uses:UsesFacts;activities:ActivityFacts[];activityStatus:'ready'|'unavailable';activityReason?:string;provenance:string;attackModes:ItemFact<string[]>;spell?:ItemFact<SpellMetadata>}
export interface OwnedItemFacts {resourceSummary:string;status:'ready'|'partial'|'unavailable';reason?:string;items:Record<string,ItemFacts>;provenance:string}
const provenance='release-6.0.6 PhysicalItemTemplate / ActivitiesTemplate / UsesField; source-only read preparation';
export const activityItemTypes=['consumable','equipment','facility','feat','spell','tool','weapon'];
export const physicalItemTypes=['consumable','container','equipment','loot','tool','weapon'];
const equippableItemTypes=['consumable','container','equipment','tool','weapon'];
const knownTypes=[...new Set([...activityItemTypes,...physicalItemTypes,'background','class','race','subclass'])];
const fact=<T>(value:T|null,reason?:string,origin:ItemFact<T>['origin']='source'):ItemFact<T>=>({status:reason?'unavailable':'ready',value:reason?null:value,origin,provenance,...(reason?{reason}:{})});
const na=<T>():ItemFact<T>=>({...fact<T>(null),status:'not-applicable'});
const nat=(value:unknown,fallback:number,integer=false):number|null=>value===undefined?fallback:typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=1e9&&(!integer||Number.isSafeInteger(value))?value:null;
const emptyUses=(status:UsesFacts['status'],reason?:string):UsesFacts=>({status,reason,max:null,spent:null,remaining:null,limited:null,capacitySource:null,origin:'schema-default',recovery:status==='not-applicable'?na<RecoveryFact[]>():fact<RecoveryFact[]>(null,reason??'Uses preparation unavailable'),display:status==='not-applicable'?'Not applicable':'Unavailable',provenance});
/** The counter is independent of its recovery recipe. Source uses.value/label
 * are nonpersisted; neither can supply an override or hide a malformed maximum. */
export function prepareUses606(raw:unknown,reason?:string,bindings:FormulaBindings606={}):UsesFacts {
 const data=raw===undefined?{}:record(raw);if(!data)return emptyUses('unavailable','Uses source mapping malformed');
 const source=data.max,capacity=source==null?undefined:typeof source==='string'?source.trim():typeof source==='number'&&Number.isFinite(source)?String(source):null;
 const spent=nat(data.spent,0,true),max=capacity===undefined||capacity===''?0:deterministicFormula606(capacity,bindings);
 const counterReason=reason??(capacity===null||max===null||max<0||max>1e9?formulaUnavailableReason606(capacity,bindings):spent===null?'Uses spent source must be a nonnegative integer':undefined);
 const recovery:RecoveryFact[]=[];let recoveryReason:string|undefined;
 if(data.recovery!==undefined&&!Array.isArray(data.recovery))recoveryReason='Uses recovery collection malformed';
 else for(const entry of (data.recovery as unknown[]|undefined)??[]){const row=record(entry),period=row?.period===undefined?'lr':row?.period,type=row?.type===undefined?'recoverAll':row?.type,formula=row?.formula;
  if(!row||typeof period!=='string'||!period.trim()||typeof type!=='string'||!type.trim()||formula!=null&&typeof formula!=='string'){recoveryReason='Uses recovery source requires qualification';break;}
  if(period.trim().startsWith('@scale')){recoveryReason='Recovery period scale dependency requires preparation qualification';break;}
  recovery.push({period:period.trim(),type:period.trim()==='recharge'?'recoverAll':type,formula:period.trim()==='recharge'&&formula==null?'6':typeof formula==='string'?formula.trim():null});
 }
 const initialized=counterReason?emptyUses('unavailable',counterReason):{status:'ready' as const,max:max!,spent:spent!,remaining:max?Math.min(max,Math.max(0,max-spent!)):0,limited:Boolean(capacity),capacitySource:capacity??null,origin:(source===undefined?'schema-default':'source') as UsesFacts['origin'],display:capacity?`${max?Math.min(max,Math.max(0,max-spent!)):0}/${max}`:'No limited uses',provenance};
 return {...initialized,recovery:recoveryReason?fact<RecoveryFact[]>(null,recoveryReason):fact(recovery,undefined,data.recovery===undefined?'schema-default':'source')};
}
/** A single detached owned-Item projection. It does not execute activities,
 * infer grants from names, or present old prepared-looking fields as source. */
export function prepareOwnedItems606(actor:unknown,context:RulesContext,effects?:NumericEffects):OwnedItemFacts {
 const source=record(actor),list=source?.items,items:Record<string,ItemFacts>=Object.create(null),ids=new Map<string,number>();
 if(!Array.isArray(list))return {resourceSummary:'Unavailable',status:'unavailable',reason:'Owned Item collection unavailable',items,provenance};
 for(const raw of list){const id=record(raw)?._id;if(typeof id==='string')ids.set(id,(ids.get(id)??0)+1);}
 let overallReason:string|undefined;
 const contextReason=context.status!=='supported'||context.profile!=='2024'?'Item rules context unavailable':undefined;
 for(const raw of list){const item=record(raw),id=item?._id;if(!item||typeof id!=='string'||!id||ids.get(id)!==1){overallReason??='Owned Item identity missing or duplicated';continue;}
  let uuid:string|null=null,identityReason:string|undefined;
  try{uuid=ownedItemUuid(source?._id as string,id);if(item.uuid!==undefined&&item.uuid!==uuid)identityReason='Owned Item canonical identity mismatch';}catch{identityReason='Owned Item canonical identity unavailable';}
  const system=item.system===undefined?{}:record(item.system),type=typeof item.type==='string'?item.type:'',name=typeof item.name==='string'?item.name:id;
  const common=contextReason??identityReason??(!system?'Item system source malformed':!knownTypes.includes(type)?'Item type outside native6.0.6 schema':undefined);
  const data=system??{},physical=physicalItemTypes.includes(type),hasActivities=activityItemTypes.includes(type),equippable=equippableItemTypes.includes(type);
  const quantity=type==='container'?1:nat(data.quantity,1,true),weight=data.weight===undefined?{}:record(data.weight),weightValue=weight?nat(weight.value,0):null;
  const metric=context.settings['dnd5e.metricWeightUnits'],units=weight?.units===undefined?metric&&metric.status!=='unavailable'&&typeof metric.value==='boolean'?(metric.value?'kg':'lb'):null:weight.units;
  const weightReason=common??(quantity===null||weightValue===null?'Physical quantity/weight source malformed':!['lb','kg','tn','Mg'].includes(String(units))?'Weight units unavailable or unqualified':undefined);
  const q=physical?fact(quantity,common??(quantity===null?'Item quantity source malformed':undefined),type==='container'?'prepared':data.quantity===undefined?'schema-default':'source'):na<number>();
  const w=physical?fact(weightValue!==null&&quantity!==null&&typeof units==='string'?{value:weightValue,units,stack:type==='container'?null:weightValue*quantity}:null,weightReason,data.weight===undefined?'schema-default':'source'):na<{value:number;units:string;stack:number|null}>();
  const eligibility=itemEffectState606(item),equipped=equippable?fact(typeof data.equipped==='boolean'?data.equipped:false,common??eligibility.reason,data.equipped==null?'schema-default':'source'):na<boolean>(),attuned=equippable?fact(typeof data.attuned==='boolean'?data.attuned:false,common??eligibility.reason,data.attuned==null?'schema-default':'source'):na<boolean>();
  const itemEffects=item.effects===undefined?[]:item.effects,itemEffectReason=!Array.isArray(itemEffects)||itemEffects.some((effect:unknown)=>{const e=record(effect);return !e||e.disabled!==true&&(e.transfer===false||e.type==='enchantment');})?'Owned Item-target effects require Item preparation qualification':undefined;
  const proficiency=effects?prepareItemProficiency606(actor,item,context,effects,common??itemEffectReason):{status:'unavailable' as const,base:null,multiplier:null,flat:null,term:null,mode:null,reason:'Item proficiency preparation unavailable',origin:'unavailable',provenance};
  const itemBindings:Record<string,number>={...preparedFormulaBindings606(effects),...itemProficiencyBindings606(proficiency)};
  if(q.value!==null)itemBindings['item.quantity']=q.value;
  if(w.value)itemBindings['item.weight.value']=w.value.value;
  const sourceSpent=nat(record(data.uses)?.spent,0,true);if(hasActivities&&sourceSpent!==null)itemBindings['item.uses.spent']=sourceSpent;
  const uses=hasActivities?prepareUses606(data.uses,common??itemEffectReason,itemBindings):emptyUses('not-applicable');
  const activityBindings={...itemBindings};
  if(uses.status==='ready'){activityBindings['item.uses.value']=uses.remaining!;if(uses.limited)activityBindings['item.uses.max']=uses.max!;}
  const activities:ActivityFacts[]=[];let activityReason=common??itemEffectReason;
  const collection=data.activities===undefined?{}:record(data.activities);
  if(!collection)activityReason??='Activity source mapping malformed';
  else for(const [key,entry]of Object.entries(collection)){const a=record(entry),aid=a?._id,atype=a?.type;
   if(!a||typeof aid!=='string'||aid!==key||!aid||typeof atype!=='string'||!activityTypes.includes(atype as typeof activityTypes[number])){activityReason??='Activity identity/type unavailable';continue;}
   const activation=record(a.activation),activationType=activation?.type===undefined?null:typeof activation.type==='string'?activation.type:null;
   const reason=common??itemEffectReason??(a.activation!==undefined&&!activation?'Activity activation source malformed':undefined);
   const scopedBindings={...activityBindings,...(nat(record(a.uses)?.spent,0,true)!==null?{'activity.uses.spent':nat(record(a.uses)?.spent,0,true)!}:{}),...(atype==='utility'&&type!=='spell'?{mod:0}:{})};
   const activityUses=prepareUses606(a.uses,reason,scopedBindings),currentBindings:Record<string,number>={...scopedBindings};
   if(activityUses.status==='ready'){currentBindings['activity.uses.value']=activityUses.remaining!;if(activityUses.limited)currentBindings['activity.uses.max']=activityUses.max!;}
   activities.push({id:aid,itemId:id,type:atype,name:typeof a.name==='string'&&a.name?a.name:`${name}: ${atype}`,sort:typeof a.sort==='number'&&Number.isFinite(a.sort)?a.sort:0,activation:activationType,uses:activityUses,status:reason?'unavailable':'ready',reason,executionReason:'Activity execution requires the M4 reviewed command pipeline',...(atype==='attack'&&effects?{attack:reason?fact<AttackFacts>(null,reason,'prepared'):itemAttack606(actor,item,a,context,effects,proficiency,currentBindings)}:{})});
  }
  activities.sort((a,b)=>a.sort-b.sort);
  if(activityReason)for(const a of activities){a.status='unavailable';a.reason??=activityReason;}
  const status=common?'unavailable':uses.status==='unavailable'||proficiency.status==='unavailable'||q.status==='unavailable'||w.status==='unavailable'||activityReason||activities.some(activity=>activity.uses.status==='unavailable')?'partial':'ready';
  items[id]={id,proficiency,...(type==='spell'?{spell:spellMetadata606(data,common)}:{}),attackModes:weaponModes606(item,common??effects?.ruleFlags.reason,effects?.ruleFlags.enhancedDualWielding),uuid:identityReason?null:uuid,type,name,status,reason:common??uses.reason??q.reason??w.reason??activityReason??proficiency.reason??activities.find(activity=>activity.uses.status==='unavailable')?.uses.reason,quantity:q,weight:w,equipped,attuned,uses,activities,activityStatus:activityReason?'unavailable':'ready',activityReason,provenance};
 }
 return {resourceSummary:Object.values(items).filter(item=>item.uses.limited||item.uses.status==='unavailable').map(item=>item.name+': '+item.uses.display).join('; ')||(overallReason||contextReason?'Unavailable':'No limited uses'),status:overallReason?'partial':Object.values(items).some(item=>item.status!=='ready')?'partial':'ready',reason:overallReason,items,provenance};
}
export function ownedItemProjection(derived:Record<string,any>|undefined):OwnedItemFacts{return derived?.ownedItems??{resourceSummary:'Unavailable',status:'unavailable',reason:'Owned Item preparation unavailable',items:{},provenance};}
