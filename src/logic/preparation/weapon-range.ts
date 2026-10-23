import {record} from '../native/6.0.6/source';
import {initializeTraitSet606} from './trait-fields';
import type {RulesContext} from '../rules-context';
import {defaultLengthUnits606,lengthConversions606} from './length-units';
export const weaponAttackTypes606:Readonly<Record<string,'melee'|'ranged'>>=Object.freeze({simpleM:'melee',simpleR:'ranged',martialM:'melee',martialR:'ranged',siege:'ranged'});
export interface WeaponRangeValues606 {value:number|null|undefined;long:number|null|undefined;reach:number|null|undefined;units:string}
export interface WeaponRangeNumber606 {status:'ready'|'unavailable'|'not-applicable';value:number|null;reason?:string}
export interface WeaponRange606 {status:'ready'|'unavailable';reason?:string;initialized?:WeaponRangeValues606;values?:WeaponRangeValues606;hasRange:boolean|null;fields:Record<'value'|'long'|'reach',WeaponRangeNumber606>;origins?:Record<string,'source'|'schema-default'>;provenance:string}
const provenance='release-6.0.6 WeaponData range schema/prepareDerivedData/attackType/hasRange;before Activity inheritance';
const no=(reason:string):WeaponRange606=>({status:'unavailable',reason,hasRange:null,fields:Object.fromEntries(['value','long','reach'].map(key=>[key,{status:'unavailable',value:null,reason}]))as WeaponRange606['fields'],provenance});
/** Native range fields are not prepared source. Preserve absent versus null
 * through initialization,then derive reach and clear irrelevant stored ranges.
 * Optional missing numeric facts never become0 or default reach5. */
export function prepareWeaponRange606(item:unknown,context?:RulesContext,gate?:string):WeaponRange606 {
 if(gate)return no(gate);
 if(context&&(context.status!=='supported'||context.profile!=='2024'))return no('Weapon range rules context unavailable');
 const raw=record(item),s=raw?.system===undefined?{}:record(raw?.system),type=s?.type===undefined?{}:record(s?.type),range=s?.range===undefined?{}:record(s?.range),properties=initializeTraitSet606(s?.properties),kind=type?.value===undefined?'simpleM':type?.value;
 if(raw?.type!=='weapon'||!s||!type||!range||!properties||typeof kind!=='string'||!['simpleM','simpleR','martialM','martialR','siege','natural','improv'].includes(kind))return no('Weapon range source type/properties/mapping unavailable');
 const numeric=(value:unknown)=>value==null||typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=1e9;
 if(![range.value,range.long,range.reach].every(numeric))return no('Weapon range source outside qualified numeric profile');
 if(range.units!=null&&typeof range.units!=='string')return no('Weapon range units source malformed');
 const units=(typeof range.units==='string'?range.units.trim():'')||defaultLengthUnits606(context);if(!units||!Object.hasOwn(lengthConversions606,units))return no('Weapon range units/default length setting unavailable');
 const initialized:WeaponRangeValues606={value:range.value as number|null|undefined,long:range.long as number|null|undefined,reach:range.reach as number|null|undefined,units},values={...initialized},attackType=weaponAttackTypes606[kind];
 if(attackType==='ranged')values.reach=null;
 else if(values.reach===null)values.reach=(properties.includes('rch')?10:5)/lengthConversions606[units];
 const hasRange=attackType==='ranged'||properties.includes('thr')||kind==='natural'&&Boolean(values.value);
 if(!hasRange)values.value=values.long=null;
 const fields:WeaponRange606['fields']={}as WeaponRange606['fields'];
 for(const key of ['value','long','reach']as const){const value=values[key],notApplicable=key==='reach'?attackType==='ranged':!hasRange;fields[key]=notApplicable?{status:'not-applicable',value:null,reason:key==='reach'?'Ranged weapons have no melee reach':'Weapon has no ranged profile'}:typeof value==='number'?{status:'ready',value}:{status:'unavailable',value:null,reason:'Weapon '+(key==='value'?'range':key)+' not specified'};}
 const origins=Object.fromEntries(['value','long','reach','units'].map(key=>[key,range[key]===undefined?'schema-default':'source']))as WeaponRange606['origins'];
 if(origins&&!(typeof range.units==='string'&&range.units.trim()))origins.units='schema-default';
 return {status:'ready',initialized,values,hasRange,fields,origins,provenance};
}
