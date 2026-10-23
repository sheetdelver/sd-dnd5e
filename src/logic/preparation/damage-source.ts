/*! DamageData formula assembly adapted from D&D5e6.0.6 (MIT),
 * Copyright 2021 Andrew Clayton. See assets/licenses/dnd5e-system-MIT.txt. */
import {record} from '../native/6.0.6/source';
import {initializeTraitSet606} from './trait-fields';
export interface DamageSource606 {
 formula:string;number:number|null;denomination:number|null;bonus:string|null;
 types:string[];modifiers:string[];custom:{enabled:boolean;formula:string|null};
 scaling:{mode:string|null;number:number|null;formula:string|null};
 origins:Record<string,'source'|'schema-default'>;
}
export interface DamageSourceFact606 {status:'ready'|'unavailable';value:DamageSource606|null;reason?:string;phase:'initialized-source';provenance:string}
const provenance='release-6.0.6 DamageData.defineSchema/formula/_automaticFormula/_manualFormula/scaledFormula(0);base source formula only';
const bad=(reason:string):DamageSourceFact606=>({status:'unavailable',value:null,reason,phase:'initialized-source',provenance});
/** Native base formula construction only. No evaluation,reference substitution,
 * scaling,ability/magic/rule addition or claim about effective rolled damage.
 * Persisted modifiers/custom/scaling survive as metadata;getter-looking source
 * fields cannot replace the schema-owned operands. */
export function prepareDamageSource606(raw:unknown,gate?:string):DamageSourceFact606 {
 if(gate)return bad(gate);
 const source=raw===undefined?{}:record(raw);if(!source)return bad('Damage part source mapping malformed');
 const custom=source.custom===undefined?{}:record(source.custom),scaling=source.scaling===undefined?{}:record(source.scaling);
 if(!custom||!scaling)return bad('Damage custom/scaling source mapping malformed');
 const integer=(raw:unknown,fallback:number|null):number|null|undefined=>{if(raw===undefined)return fallback;if(raw===null)return null;const value=typeof raw==='string'&&/^\+?\d+$/.test(raw.trim())?Number(raw.trim()):raw;return typeof value==='number'&&Number.isSafeInteger(value)&&value>=0&&value<=1000?value:undefined;};
 const text=(raw:unknown):string|null|undefined=>raw==null?null:typeof raw==='string'&&raw.length<=2048?raw.trim():typeof raw==='number'&&Number.isFinite(raw)&&Math.abs(raw)<=1e9?String(raw):undefined;
 const number=integer(source.number,null),denomination=integer(source.denomination,null),bonus=text(source.bonus),formula=text(custom.formula),mode=text(scaling.mode),scaleNumber=integer(scaling.number,1),scaleFormula=text(scaling.formula),types=initializeTraitSet606(source.types),modifiers=initializeTraitSet606(source.modifiers);
 if([number,denomination,bonus,formula,mode,scaleNumber,scaleFormula].some(value=>value===undefined)||!types||!modifiers||types.length>64||modifiers.length>32||[...types,...modifiers].some(value=>value.length>256))return bad('Damage part fields outside qualified source/default profile');
 const enabled=custom.enabled==null?false:custom.enabled;if(typeof enabled!=='boolean')return bad('Damage custom enabled source outside qualified Boolean profile');
 let compiled:string;
 if(enabled)compiled=formula?formula.replace(/(?:\d|\))?d(?:\d+\w*|\([^)]+\)\d*\w*)/,'$&'+modifiers.join('')):'';
 else {compiled=number&&denomination?`${number}d${denomination}${modifiers.join('')}`:'';if(bonus)compiled=compiled?compiled+' + '+bonus:bonus;}
 if(compiled.length>4096)return bad('Base damage formula exceeds qualified read limit');
 const origins:DamageSource606['origins']={};for(const [key,value]of Object.entries({number:source.number,denomination:source.denomination,bonus:source.bonus,types:source.types,modifiers:source.modifiers,'custom.enabled':custom.enabled,'custom.formula':custom.formula,'scaling.mode':scaling.mode,'scaling.number':scaling.number,'scaling.formula':scaling.formula}))origins[key]=value===undefined?'schema-default':'source';
 return {status:'ready',value:{formula:compiled,number:number!,denomination:denomination!,bonus:bonus!,types,modifiers,custom:{enabled,formula:formula!},scaling:{mode:mode!,number:scaleNumber!,formula:scaleFormula!},origins},phase:'initialized-source',provenance};
}

export interface ActivityDamageSource606 {status:'ready'|'unavailable';reason?:string;parts:Array<{key:string;role:'base'|'additional'|'healing';fact:DamageSourceFact606}>}
/** Exact schema locations,not legacy damage.parts or Item-name inference. These
 * are base/source parts;Actor,weapon,offhand,critical and scaling construction is
 * deliberately separate and cannot execute via this read model. */
export function prepareActivityDamageSource606(activity:unknown,item:unknown,gate?:string):ActivityDamageSource606|undefined {
 const a=record(activity),parent=record(item),system=record(parent?.system);if(!a||!['attack','save','damage','heal'].includes(String(a.type)))return;
 const parts:ActivityDamageSource606['parts']=[];let reason=gate;
 if(a.type==='heal')parts.push({key:'healing',role:'healing',fact:prepareDamageSource606(a.healing,gate)});
 else {
  const damage=a.damage===undefined?{}:record(a.damage);if(!damage)return {status:'unavailable',reason:'Activity damage source mapping malformed',parts};
  const includeBase=damage.includeBase===undefined?true:damage.includeBase;
  if(a.type==='attack'&&typeof includeBase!=='boolean')reason??='Activity include-base source outside qualified Boolean profile';
  if(a.type==='attack'&&includeBase===true&&parent?.type==='consumable')reason??='Consumable ammunition base-damage offer requires qualification';
  if(a.type==='attack'&&includeBase===true&&parent?.type==='weapon'){
   const field=system?.damage===undefined?{}:record(system.damage),fact=prepareDamageSource606(field?.base,reason??(!field?'Weapon base damage source mapping malformed':undefined));
   // Native Attack final omits an empty base formula rather than inventing a die.
   if(fact.status==='unavailable'||fact.value?.formula)parts.push({key:'item.damage.base',role:'base',fact});
  }
  const list=damage.parts===undefined?[]:damage.parts;
  if(!Array.isArray(list)||list.length>32)reason??='Activity damage part collection malformed or exceeds qualified limit';
  else for(const [index,raw]of list.entries())parts.push({key:'damage.parts.'+index,role:'additional',fact:prepareDamageSource606(raw,reason)});
 }
 reason??=parts.find(part=>part.fact.status==='unavailable')?.fact.reason;
 return {status:reason?'unavailable':'ready',reason,parts};
}
