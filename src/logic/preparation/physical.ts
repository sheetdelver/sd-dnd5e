import {itemLocalEffectsReason606} from './effect-admission';
import {record} from '../native/6.0.6/source';
import type {RulesContext} from '../rules-context';
import type {NumericEffects} from './numeric-effects';
import type {ItemFact,OwnedItemFacts} from './item-facts';
export interface ContainerCapacity606 {value:number;max:number|null;percent:number;units:string;kind:'count'|'weight'|'unlimited'}
export interface PhysicalItem606 {totalWeight:ItemFact<number>;containerId:string|null;contentsWeight:ItemFact<number>;contentsCount:ItemFact<number>;capacity:ItemFact<ContainerCapacity606>;units:string|null}
export interface Encumbrance606 {value:number;max:number;mod:number;thresholds:{encumbered:number;heavilyEncumbered:number;maximum:number};percent:number|null;setting:'none'|'normal'|'variant'}
export interface Physical606 {weight:ItemFact<number>;currency:ItemFact<Record<string,number>>;encumbrance:ItemFact<Encumbrance606>;units:string|null;items:Record<string,PhysicalItem606>;provenance:string}
const provenance='release-6.0.6 embedded PhysicalItem/Container/Currency/Attributes.prepareEncumbrance;source-only read preparation';
const fact=<T>(value:T|null,reason?:string):ItemFact<T>=>({status:reason?'unavailable':'ready',value:reason?null:value,reason,origin:'prepared',provenance});
const na=<T>():ItemFact<T>=>({...fact<T>(null),status:'not-applicable'});
const number=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=1e9;
const unitScale:Record<string,number>={lb:1,kg:2.5,tn:2000,Mg:2500};
export const convertWeight606=(value:number,from:string,to:string):number=>value*unitScale[from]/unitScale[to];
const tenth=(value:number)=>Number((Math.round(value/.1)*.1).toFixed(1));
const percent=(value:number,max:number)=>Math.min(Math.max(value*100/max,0),100);
function coins(raw:unknown):Record<string,number>|null {const map=raw===undefined?{}:record(raw);if(!map)return null;const result:Record<string,number>={};for(const key of ['pp','gp','ep','sp','cp']){const value=map[key]??0;if(!number(value)||map[key]===null)return null;result[key]=Math.floor(value);}return result;}
/** Embedded source tree only. No compendium resolution, cached world data,source
 * repair,generated encumbrance status writes or Item effect execution. Raw
 * nonpersisted encumbrance overrides never supply thresholds. */
export function preparePhysical606(actor:unknown,context:RulesContext,owned:OwnedItemFacts,effects:NumericEffects):Physical606 {
 const source=record(actor),system=record(source?.system)??{},metric=context.settings['dnd5e.metricWeightUnits'],currencySetting=context.settings['dnd5e.currencyWeight'];
 const units=metric&&metric.status!=='unavailable'&&typeof metric.value==='boolean'?(metric.value?'kg':'lb'):null;
 const weighted=currencySetting&&currencySetting.status!=='unavailable'&&typeof currencySetting.value==='boolean'?currencySetting.value:null;
 let reason=context.status!=='supported'||context.profile!=='2024'||source?.type!=='character'?'Physical rules context unavailable':!units||weighted===null?'Physical unit/currency settings unavailable':undefined;
 reason??=effects.reason;
 const list=Array.isArray(source?.items)?source.items:[],sources=new Map<string,Record<string,unknown>>(),items:Physical606['items']=Object.create(null),currency=coins(system.currency);
 if(!Array.isArray(source?.items))reason??='Owned Item collection unavailable';
 for(const raw of list){const item=record(raw),id=item?._id;if(!item||typeof id!=='string'||!id||sources.has(id)){reason??='Owned physical Item identity missing or duplicated';continue;}sources.set(id,item);}
 const currencyWeight=(value:Record<string,number>)=>weighted?Object.values(value).reduce((a,b)=>a+b,0)/(units==='kg'?110:50):0;
 const pending=new Set<string>(),counts=new Map<string,number>();
 function unavailable(id:string,why:string):PhysicalItem606 {const row={containerId:null,units:null,totalWeight:fact<number>(null,why),contentsWeight:fact<number>(null,why),contentsCount:fact<number>(null,why),capacity:fact<ContainerCapacity606>(null,why)};items[id]=row;return row;}
 function prepare(id:string,depth=0):PhysicalItem606 {
  const cached=items[id];if(cached)return cached;if(pending.has(id)||depth>128)return unavailable(id,'Recursive or excessive embedded container depth');
  const source=sources.get(id)!,s=source.system===undefined?{}:record(source.system),known=owned.items[id],weight=known?.weight.value;
  let why=reason??known?.weight.reason??(!s?'Physical Item source malformed':!weight||known?.quantity.value===null?'Physical Item preparation unavailable':undefined);
  if(source.uuid!==undefined&&known?.uuid===null)why??='Owned physical Item identity unavailable';
  const rawContainer=s?.container,parent=rawContainer==null||rawContainer===''?null:typeof rawContainer==='string'?rawContainer:null;
  if(rawContainer!=null&&rawContainer!==''&&!parent)why??='Container identity source malformed';
  if(parent&&sources.get(parent)?.type!=='container')why??='Referenced owned container missing or unsupported';
  why??=itemLocalEffectsReason606(source);
  if(why)return unavailable(id,why);pending.add(id);
  const row:PhysicalItem606={containerId:parent,units:weight!.units,totalWeight:fact(weight!.stack??weight!.value),contentsWeight:na(),contentsCount:na(),capacity:na()};
  if(source.type==='container'){
   const properties=s!.properties===undefined?[]:s!.properties,heldCurrency=coins(s!.currency),capacity=s!.capacity===undefined?{}:record(s!.capacity),capWeight=capacity?.weight===undefined?{}:record(capacity?.weight),count=capacity?.count??0,maxWeight=capWeight?.value??0,capUnits=capWeight?.units??units;
   if(!Array.isArray(properties)||properties.some(v=>typeof v!=='string')||!heldCurrency||!capacity||!capWeight||!number(count)||!Number.isSafeInteger(count)||!number(maxWeight)||!Object.hasOwn(unitScale,String(capUnits)))why='Container properties/currency/capacity source malformed';
   let contentsWeight=heldCurrency?currencyWeight(heldCurrency):0,contentsCount=0;
   for(const [childId,child]of sources){if(owned.items[childId]?.weight.status==='not-applicable'||record(child.system)?.container!==id)continue;
    const prepared=prepare(childId,depth+1),quantity=owned.items[childId]?.quantity.value;
    if(prepared.totalWeight.value===null||!prepared.units||quantity==null){why??=prepared.totalWeight.reason??'Contained Item is outside qualified physical schema';continue;}
    contentsWeight+=convertWeight606(prepared.totalWeight.value,prepared.units,weight!.units);contentsCount+=quantity+(counts.get(childId)??0);
   }
   counts.set(id,contentsCount);
   const hidden=Array.isArray(properties)&&properties.includes('unidentifiedContents')&&s!.identified===false;
   row.totalWeight=fact(Array.isArray(properties)&&properties.includes('weightlessContents')?weight!.value:weight!.value+contentsWeight,why);
   row.contentsWeight=fact(contentsWeight,why??(hidden?'Unidentified container contents unavailable':undefined));row.contentsCount=fact(contentsCount,why??(hidden?'Unidentified container contents unavailable':undefined));
   const capacityCount=typeof count==='number'?count:0,capacityWeight=typeof maxWeight==='number'?maxWeight:0;
   const kind=capacityCount?'count':capacityWeight?'weight':'unlimited',max=capacityCount||capacityWeight||null,value=tenth(capacityCount?contentsCount:capacityWeight?contentsWeight:0);
   row.capacity=fact({value,max,percent:max?percent(value,max):0,kind,units:kind==='count'?'items':kind==='weight'?String(capUnits):''},why??(hidden?'Unidentified container capacity unavailable':undefined));
  }
  pending.delete(id);if(items[id]?.totalWeight.reason)return items[id];items[id]=row;return row;
 }
 for(const [id]of sources){if(owned.items[id]?.weight.status!=='not-applicable')prepare(id);}
 // Validate the complete parent graph even for weightless containers. Never
 // omit unknown children or use name lookup to repair broken membership.
 for(const [id,row]of Object.entries(items)){const seen=new Set([id]);let parent=row.containerId;while(parent){if(seen.has(parent)){reason??='Recursive embedded container membership';break;}seen.add(parent);parent=items[parent]?.containerId??null;}}
 let total=currency?currencyWeight(currency):0;if(!currency)reason??='Actor currency source malformed';
 for(const row of Object.values(items)){if(row.totalWeight.value===null)reason??=row.totalWeight.reason??'Physical Item weight unavailable';else if(!row.containerId&&units&&row.units)total+=convertWeight606(row.totalWeight.value,row.units,units);}
 const weight=fact(reason?null:tenth(total),reason);
 let thresholdReason=reason??effects.reason;const rawSize=record(effects.system.traits)?.size??'med',sizes=['tiny','sm','med','lg','huge','grg'],index=sizes.indexOf(String(rawSize)),build=effects.ruleFlags.powerfulBuild;
 if(index<0||build!==undefined&&typeof build!=='boolean')thresholdReason??='Carrying size/Powerful Build source requires qualification';
 const sizeMod=[.5,1,1,2,4,8][Math.min(index+Number(build===true),5)],strength=effects.formulaPreparation?.preparedBindings['abilities.str.value'];if(typeof strength!=='number')thresholdReason??='Carrying Strength preparation unavailable';
 const setting=context.settings['dnd5e.encumbrance'];if(!setting||setting.status==='unavailable'||!['none','normal','variant'].includes(String(setting.value)))thresholdReason??='Encumbrance setting unavailable';
 const thresholds={encumbered:tenth((strength??0)*(units==='kg'?2.5:5)*sizeMod),heavilyEncumbered:tenth((strength??0)*(units==='kg'?5:10)*sizeMod),maximum:tenth((strength??0)*(units==='kg'?7.5:15)*sizeMod)};
 const encumbrance=fact<Encumbrance606>({value:weight.value??0,max:thresholds.maximum,mod:sizeMod,thresholds,percent:thresholds.maximum===0&&(weight.value??0)===0?null:percent(weight.value??0,thresholds.maximum),setting:setting&&setting.status!=='unavailable'?setting.value as Encumbrance606['setting']:'none'},thresholdReason);
 return {weight,currency:fact(currency,context.status!=='supported'||context.profile!=='2024'?'Currency rules context unavailable':!currency?'Actor currency source malformed':undefined),encumbrance,items,units,provenance};
}
