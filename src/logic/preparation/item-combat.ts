import {configureRules606,ruleSnapshot606} from './applied-rules';
import {numericScopeBonus} from './d20-configuration';
import type {FormulaBindings606} from './deterministic-formula';
import {prepareItemProficiency606,itemProficiencyBindings606,type ItemProficiency606} from './item-proficiency';
import {deterministicFormula606} from './deterministic-formula';
import {preparedFormulaBindings606} from './formula-fields';
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
export interface AttackFacts {ability:string|null;proficiency:number;total:number;display:string;formula:string}
export function weaponModes606(raw:unknown,reason?:string,enhancedDualWielding=false):ItemFact<string[]> {
 const item=record(raw),s=record(item?.system)??{},type=record(s.type),key=type?.value??'simpleM',properties=initializeTraitSet606(s.properties),range=record(s.range)??{};
 if(item?.type!=='weapon')return {...yes<string[]>([]),status:'not-applicable'};
 if(reason||!properties||typeof key!=='string'||!['simpleM','simpleR','martialM','martialR','siege','natural','improv'].includes(key))return no(reason??'Weapon type/properties unavailable');
 const prop=new Set(properties),attackType=types[key],modes:string[]=[],versatile=prop.has('ver'),light=prop.has('lgt')||enhancedDualWielding&&attackType==='melee'&&!prop.has('two');
 if(!(prop.has('thr')&&attackType==='ranged')){if(versatile||!prop.has('two'))modes.push('oneHanded');if(versatile||prop.has('two'))modes.push('twoHanded');}
 if(light)modes.push('offhand');
 if(prop.has('thr')){modes.push('thrown');if(light)modes.push('thrown-offhand');}
 else if(!attackType){if([range.value,range.reach].some(value=>value!=null&&(typeof value!=='number'||!Number.isFinite(value))))return no('Weapon range source malformed');if((range.value as number??0)>(range.reach as number??0))modes.push('ranged');}
 return yes(modes);
}
/** Read-only attack numbers; execution/consumption belongs to M4. Source
 * total/toHit/prof/attack.abilities cannot replace the qualified calculation. */
export function itemAttack606(actor:unknown,item:unknown,activity:unknown,context:RulesContext,effects:NumericEffects,preparedProficiency?:ItemProficiency606,preparedItemBindings?:FormulaBindings606):ItemFact<AttackFacts> {
 const raw=record(item)??{},s=record(raw.system)??{},a=record(activity)??{},attack=a.attack===undefined?{}:record(a.attack);
 if(!attack)return no('Attack source mapping malformed');
 if(context.status!=='supported'||context.profile!=='2024')return no('Attack rules context unavailable');
 if(effects.reason)return no(effects.reason);
 const itemProficiency=preparedProficiency??prepareItemProficiency606(actor,item,context,effects);
 const bindings:Record<string,number>={...(preparedItemBindings??{...preparedFormulaBindings606(effects),...itemProficiencyBindings606(itemProficiency)}),...effects.formulaPreparation?.executionBindings};
 const setting=context.settings['dnd5e.proficiencyModifier'];if(setting?.status!=='unavailable'&&setting?.value==='dice')delete bindings.prof;
 if(attack.flat!==undefined&&typeof attack.flat!=='boolean')return no('Flat attack source malformed');
 if(attack.flat){const bonus=deterministicFormula606(attack.bonus,bindings);return bonus===null?no('Flat attack bonus reference requires qualification'):yes({ability:null,proficiency:0,total:bonus,display:(bonus<0?'':'+')+bonus,formula:String(bonus)});}
 const profile=numericCharacterProfile(actor,context,effects);if(profile.status!=='ready')return no(profile.reason);
 const attackType=record(attack.type)??{},weaponType=record(s.type)??{},typeKey=weaponType.value??'simpleM',properties=initializeTraitSet606(s.properties);
 if(!properties)return no('Item properties source malformed');
 if(attackType.classification==='spell'||attack.ability==='spellcasting')return no('Spell attack requires qualified casting capability preparation');
 if(!['weapon','feat'].includes(String(raw.type)))return no('Item attack construction requires qualification for this Item type');
 let choices:string[];
 if(attack.ability==='none')choices=[];
 else if(typeof attack.ability==='string'&&attack.ability)choices=[attack.ability];
 else if(attack.ability!=null&&attack.ability!=='')return no('Attack ability source malformed');
 else if(raw.type==='weapon')choices=properties.includes('fin')||typeKey==='natural'?['str','dex']:types[String(typeKey)]?[types[String(typeKey)]==='melee'?'str':'dex']:[];
 else if(['melee','ranged'].includes(String(attackType.value)))choices=[attackType.value==='ranged'?'dex':'str'];
 else return no('Attack ability/type requires explicit qualified source');
 const abilities=record(effects.system.abilities)??{};let ability:string|null=null,mod=0;
 if(attack.ability!=='none'&&!choices.length)return no('Attack ability requires explicit supported source');
 for(const key of choices){if(!['str','dex','con','int','wis','cha'].includes(key))return no('Unsupported attack ability');const value=numericAbilityValue(record(abilities[key])?.value);if(!value)return no('Attack ability score unavailable');if(ability===null||value.mod>mod){ability=key;mod=value.mod;}}
 if(itemProficiency.status!=='ready'||itemProficiency.multiplier===null)return no(itemProficiency.reason??'Item attack proficiency unavailable');
 const coefficient=itemProficiency.multiplier;
 // Attack construction always supplies Item prof.term,including string0.
 // Actor/Item resource preparation keeps Actor-base prof instead. Earlier
 // Item proficiency and current Actor reference values must remain distinct.
 bindings.prof=itemProficiency.flat!;bindings.mod=mod;
 const bonus=deterministicFormula606(attack.bonus,bindings);if(bonus===null)return no('Attack bonus expression/reference requires qualification');
 const actionType=(attackType.value==='ranged'||!attackType.value&&types[String(typeKey)]==='ranged'?'r':'m')+'wak';
 const globals=record(record(effects.system.rolls)?.attack)??{},scopes=[{path:`abilities.${ability??''}.attack.roll`,value:record(record(abilities[ability??''])?.attack)?.roll},{path:'rolls.attack',value:globals},{path:`rolls.attack.${actionType}`,value:globals[actionType]}],bonuses:number[]=[];
 const expressions=Object.fromEntries((effects.formulaPreparation?.receipts??[]).map(row=>['system.'+row.path,row.source]));
 for(const scope of scopes){const raw=record(scope.value)?.bonus;if(typeof raw==='string'&&numericConstant(raw)===null&&!expressions['system.'+scope.path+'.bonus'])expressions['system.'+scope.path+'.bonus']=raw;}
 for(const scope of scopes){if(scope.value!=null&&!record(scope.value))return no('Attack roll scope malformed');const value=numericScopeBonus(scope,{}, {bindings,expressions});if(value===null)return no('Attack scope bonus expression/reference requires qualification');bonuses.push(value);}
 const attunement=s.attunement??'',attuned=s.attuned??false;
 if(typeof attunement!=='string'||typeof attuned!=='boolean')return no('Item magic eligibility source malformed');
 const magic=raw.type==='weapon'&&properties.includes('mgc')&&(attuned||attunement!=='required')?deterministicFormula606(s.magicalBonus,preparedFormulaBindings606(effects)):0;
 if(magic===null)return no('Magical bonus expression requires formula qualification');
 const rules=configureRules606(ruleSnapshot606(effects.plan),'attack',{ability,type:'attack'},bindings,'execution',{...bindings,...effects.formulaPreparation?.executionBindings});if(rules.reason)return no(rules.reason);
 const total=rules.bonus+mod+coefficient*profile.proficiency+bonus+magic+bonuses.reduce((a,b)=>a+b,0)+effects.conditions.rollReduction;
 if(!Number.isFinite(total)||Math.abs(total)>1e9)return no('Attack total outside qualified numeric bounds');
 return yes({ability,proficiency:coefficient,total,display:(total<0?'':'+')+total,formula:String(total)});
}
