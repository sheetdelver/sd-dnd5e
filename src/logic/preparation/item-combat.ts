import {record} from '../native/6.0.6/source';
import type {NumericEffects} from './numeric-effects';
import type {RulesContext} from '../rules-context';
import {numericCharacterProfile} from './character-profile';
import {numericAbilityValue,numericConstant} from './numeric';
import {initializeTraitSet606} from './trait-fields';
import type {ItemFact} from './item-facts';
const provenance='release-6.0.6 WeaponData.attackModes/availableAbilities/proficiencyMultiplier; AttackData.getAttackData';
const no=<T>(reason:string):ItemFact<T>=>({status:'unavailable',value:null,reason,origin:'prepared',provenance});
const yes=<T>(value:T):ItemFact<T>=>({status:'ready',value,origin:'prepared',provenance});
const types:Record<string,'melee'|'ranged'>={simpleM:'melee',simpleR:'ranged',martialM:'melee',martialR:'ranged',siege:'ranged'};
const categories:Record<string,string>={simpleM:'sim',simpleR:'sim',martialM:'mar',martialR:'mar'};
export interface AttackFacts {ability:string|null;proficiency:number;total:number;display:string;formula:string}
export function weaponModes606(raw:unknown,reason?:string):ItemFact<string[]> {
 const item=record(raw),s=record(item?.system)??{},type=record(s.type),key=type?.value??'simpleM',properties=initializeTraitSet606(s.properties),range=record(s.range)??{};
 if(item?.type!=='weapon')return {...yes<string[]>([]),status:'not-applicable'};
 if(reason||!properties||typeof key!=='string'||!['simpleM','simpleR','martialM','martialR','siege','natural','improv'].includes(key))return no(reason??'Weapon type/properties unavailable');
 const prop=new Set(properties),attackType=types[key],modes:string[]=[],versatile=prop.has('ver');
 if(!(prop.has('thr')&&attackType==='ranged')){if(versatile||!prop.has('two'))modes.push('oneHanded');if(versatile||prop.has('two'))modes.push('twoHanded');}
 if(prop.has('lgt'))modes.push('offhand');
 if(prop.has('thr')){modes.push('thrown');if(prop.has('lgt'))modes.push('thrown-offhand');}
 else if(!attackType){if([range.value,range.reach].some(value=>value!=null&&(typeof value!=='number'||!Number.isFinite(value))))return no('Weapon range source malformed');if((range.value as number??0)>(range.reach as number??0))modes.push('ranged');}
 return yes(modes);
}
/** Read-only attack numbers; execution/consumption belongs to M4. Source
 * total/toHit/prof/attack.abilities cannot replace the qualified calculation. */
export function itemAttack606(actor:unknown,item:unknown,activity:unknown,context:RulesContext,effects:NumericEffects):ItemFact<AttackFacts> {
 const raw=record(item)??{},s=record(raw.system)??{},a=record(activity)??{},attack=a.attack===undefined?{}:record(a.attack);
 if(!attack)return no('Attack source mapping malformed');
 if(context.status!=='supported'||context.profile!=='2024')return no('Attack rules context unavailable');
 if(effects.reason)return no(effects.reason);
 const bonus=numericConstant(attack.bonus);if(bonus===null)return no('Attack bonus expression requires formula qualification');
 if(attack.flat!==undefined&&typeof attack.flat!=='boolean')return no('Flat attack source malformed');
 if(attack.flat)return yes({ability:null,proficiency:0,total:bonus,display:(bonus<0?'':'+')+bonus,formula:String(bonus)});
 const profile=numericCharacterProfile(actor,context,effects);if(profile.status!=='ready')return no(profile.reason);
 const attackType=record(attack.type)??{},weaponType=record(s.type)??{},typeKey=weaponType.value??'simpleM',properties=initializeTraitSet606(s.properties);
 if(!properties)return no('Item properties source malformed');
 if(attackType.classification==='spell'||attack.ability==='spellcasting')return no('Spell attack requires qualified casting capability preparation');
 let choices:string[];
 if(attack.ability==='none')choices=[];
 else if(typeof attack.ability==='string'&&attack.ability)choices=[attack.ability];
 else if(attack.ability!=null&&attack.ability!=='')return no('Attack ability source malformed');
 else if(raw.type==='weapon')choices=properties.includes('fin')||typeKey==='natural'?['str','dex']:types[String(typeKey)]?[types[String(typeKey)]==='melee'?'str':'dex']:[];
 else choices=[attackType.value==='ranged'?'dex':'str'];
 const abilities=record(effects.system.abilities)??{};let ability:string|null=null,mod=0;
 if(attack.ability!=='none'&&!choices.length)return no('Attack ability requires explicit supported source');
 for(const key of choices){if(!['str','dex','con','int','wis','cha'].includes(key))return no('Unsupported attack ability');const value=numericAbilityValue(record(abilities[key])?.value);if(!value)return no('Attack ability score unavailable');if(ability===null||value.mod>mod){ability=key;mod=value.mod;}}
 let coefficient:number;
 if(raw.type==='feat')coefficient=1;
 else if(raw.type==='weapon'){
  const prof=s.proficient;if(prof!=null&&typeof prof!=='boolean'&&prof!==0&&prof!==1)return no('Weapon persisted proficiency source malformed');
  if(prof!=null)coefficient=Number(prof);
  else{const training=initializeTraitSet606(record(record(effects.system.traits)?.weaponProf)?.value);if(!training)return no('Weapon training source unavailable');coefficient=Number(typeKey==='natural'||training.includes(categories[String(typeKey)])||typeof weaponType.baseItem==='string'&&training.includes(weaponType.baseItem));}
 }else return no('Item attack proficiency requires qualification for this Item type');
 const actionType=(attackType.value==='ranged'||!attackType.value&&types[String(typeKey)]==='ranged'?'r':'m')+'wak';
 const globals=record(record(effects.system.rolls)?.attack)??{},scopes=[record(record(abilities[ability??''])?.attack)?.roll,globals,globals[actionType]],bonuses:number[]=[];
 for(const rawScope of scopes){if(rawScope!=null&&!record(rawScope))return no('Attack roll scope malformed');const value=numericConstant(record(rawScope)?.bonus);if(value===null)return no('Attack scope bonus expression requires formula qualification');bonuses.push(value);}
 const attunement=s.attunement??'',attuned=s.attuned??false;
 if(typeof attunement!=='string'||typeof attuned!=='boolean')return no('Item magic eligibility source malformed');
 const magic=raw.type==='weapon'&&properties.includes('mgc')&&(attuned||attunement!=='required')?numericConstant(s.magicalBonus):0;
 if(magic===null)return no('Magical bonus expression requires formula qualification');
 const total=mod+coefficient*profile.proficiency+bonus+magic+bonuses.reduce((a,b)=>a+b,0)+effects.conditions.rollReduction;
 if(!Number.isFinite(total)||Math.abs(total)>1e9)return no('Attack total outside qualified numeric bounds');
 return yes({ability,proficiency:coefficient,total,display:(total<0?'':'+')+total,formula:String(total)});
}
