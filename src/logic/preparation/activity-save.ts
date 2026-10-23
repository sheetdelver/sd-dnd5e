import {record} from '../native/6.0.6/source';
import {initializeTraitSet606} from './trait-fields';
import {deterministicFormula606,type FormulaBindings606} from './deterministic-formula';
import type {SpellContext606} from './spell-context';
import type {CombatModifiers606} from './combat-modifiers';
import type {ItemFact} from './item-facts';
export interface ActivitySave606 {dc:number;ability:string|null;targets:string[];calculation:string;modifier:number}
const provenance='release-6.0.6 BaseSaveActivityData schema/prepareData/ability/prepareFinalData;earlier prepared ability DC';
const no=(reason:string):ItemFact<ActivitySave606>=>({status:'unavailable',value:null,reason,origin:'prepared',provenance});
/** Prepare a DC,not a saving throw or permission to apply it to another Actor.
 * dc.bonus/value are nonpersisted;legitimate prepared effects need their own
 * qualified phase and cannot be simulated by injecting raw source fields. */
export function prepareActivitySave606(activity:unknown,isSpell:boolean,casting:SpellContext606|undefined,combat:CombatModifiers606,bindings:FormulaBindings606,gate?:string):ItemFact<ActivitySave606>{
 if(gate)return no(gate);
 const raw=record(activity),save=raw?.save===undefined?{}:record(raw.save),dc=save?.dc===undefined?{}:record(save.dc),targets=initializeTraitSet606(save?.ability),abilities=['str','dex','con','int','wis','cha'];
 if(!raw||!save||!dc||!targets||targets.some(value=>!abilities.includes(value)))return no('Activity save source mapping/ability Set unavailable');
 const value=dc.calculation===undefined?'initial':dc.calculation,calculation=value==='initial'?(isSpell?'spellcasting':''):value;
 if(typeof calculation!=='string'||!['','spellcasting',...abilities].includes(calculation))return no('Activity save DC calculation unavailable');
 const ability=calculation==='spellcasting'?casting?.activityAbility??null:abilities.includes(calculation)?calculation:targets[0]??null;
 if(calculation==='spellcasting'&&casting?.status!=='ready')return no(casting?.reason??'Activity spellcasting ability unavailable');
 const mod=ability?combat.abilities[ability]?.modifier.value:0;
 if(mod==null)return no(combat.abilities[ability??'']?.modifier.reason??'Activity save ability modifier unavailable');
 let result:number|null;
 if(calculation){const fact=ability?combat.abilities[ability]?.dc:combat.spell.ability===null?combat.spell.dc:undefined;result=fact?.value??null;if(result===null)return no(fact?.reason??'Activity save prepared ability DC unavailable');}
 else result=deterministicFormula606(dc.formula,{...bindings,mod});
 if(result===null)return no('Activity save DC expression/reference requires qualification');
 return {status:'ready',value:{dc:result,ability,targets,calculation,modifier:mod},origin:'prepared',provenance};
}
