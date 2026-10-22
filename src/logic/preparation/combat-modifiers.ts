import {record} from '../native/6.0.6/source';
import type {RulesContext} from '../rules-context';
import {characterFacts606,numericFact,type NumericFact} from './character-profile';
import {numericAbilityValue} from './numeric';
import type {NumericEffects} from './numeric-effects';
import {deterministicFormula606,formulaUnavailableReason606} from './deterministic-formula';
import {preparedFormulaBindings606} from './formula-fields';
export interface AbilityCombat606 {attack:NumericFact;dc:NumericFact;modifier:NumericFact}
export interface CombatModifiers606 {
 abilities:Record<string,AbilityCombat606>;
 spell:AbilityCombat606&{ability:string|null;provenance:string};
 damage:Record<string,{bonus:NumericFact;expression:string|null;appliesTo:'first-part-only';provenance:string}>;
 provenance:string;
}
const provenance='release-6.0.6 CommonTemplate.prepareAbilities / AttributesFields.prepareSpellcastingAbility / BaseActivityData._processDamagePart;prepared read dependencies';
const fact=(value:number|null,reason?:string):NumericFact=>({...numericFact(value,reason),provenance});
/** Actor prepared defaults are not per-spell eligibility or execution formulas.
 * Native attack preparation always includes flat base prof,even in dice mode;
 * runtime activity construction remains separate. Raw dc/attack.value/spell maps
 * never replace persisted bonus fields or verified earlier phase operands. */
export function prepareCombatModifiers606(actor:unknown,context:RulesContext,effects:NumericEffects):CombatModifiers606 {
 const source=record(actor),s=effects.system,facts=characterFacts606(actor,context,effects),bindings=preparedFormulaBindings606(effects),base=facts.proficiency.value;
 let reason=context.status!=='supported'||context.profile!=='2024'||source?.type!=='character'?'Combat modifier rules context unavailable':effects.reason??facts.proficiency.reason;
 if(base===null)reason??='Prepared base proficiency unavailable';
 const abilities:Record<string,AbilityCombat606>=Object.create(null),attacks=record(record(s.rolls)?.attack),bonuses=s.bonuses===undefined?{}:record(s.bonuses),spellBonus=bonuses?.spell===undefined?{}:record(bonuses?.spell);
 const globalsReason=s.rolls!=null&&!record(s.rolls)||record(s.rolls)?.attack!=null&&!attacks?'Attack bonus scope source malformed':undefined;
 const dcReason=!bonuses||!spellBonus?'Spell DC bonus scope source malformed':undefined;
 const global=deterministicFormula606(attacks?.bonus,bindings),dc=deterministicFormula606(spellBonus?.dc,bindings);
 for(const key of ['str','dex','con','int','wis','cha']){
  const data=record(record(s.abilities)?.[key]),numeric=numericAbilityValue(data?.value),attack=data?.attack===undefined?{}:record(data.attack),roll=attack?.roll===undefined?{}:record(attack?.roll),local=deterministicFormula606(roll?.bonus,bindings);
  const common=reason??(!numeric?'Prepared ability modifier unavailable':undefined);
  const attackReason=common??globalsReason??(!attack||!roll?'Ability attack scope malformed':local===null||global===null?'Attack bonus formula/reference requires qualification':undefined);
  const saveReason=common??dcReason??(dc===null?formulaUnavailableReason606(spellBonus?.dc,bindings):undefined);
  abilities[key]={modifier:fact(common?null:numeric!.mod,common),attack:fact(attackReason?null:numeric!.mod+base!+local!+global!+effects.conditions.rollReduction,attackReason),dc:fact(saveReason?null:8+numeric!.mod+base!+dc!,saveReason)};
 }
 const rawAttributes=record(record(source?.system)?.attributes),rawAbility=rawAttributes?.spellcasting===undefined?'':rawAttributes.spellcasting;
 const selected=typeof rawAbility==='string'?rawAbility.trim():null,selectionReason=reason??(selected===null||selected!==''&&!Object.hasOwn(abilities,selected)?'Selected spellcasting ability source unavailable':undefined);
 const spell:CombatModifiers606['spell']=selectionReason?{ability:null,modifier:fact(null,selectionReason),attack:fact(null,selectionReason),dc:fact(null,selectionReason),provenance}:selected?{ability:selected,...abilities[selected],provenance}:{ability:null,modifier:fact(0),attack:fact(base),dc:fact(8+base!),provenance};
 const damage:CombatModifiers606['damage']=Object.create(null),rawDamage=record(record(s.rolls)?.damage);
 for(const key of ['mwak','rwak','msak','rsak']){const scope=rawDamage?.[key]===undefined?{}:record(rawDamage[key]),raw=scope?.bonus,value=deterministicFormula606(raw,bindings),why=reason??(s.rolls!=null&&!record(s.rolls)||record(s.rolls)?.damage!=null&&!rawDamage||!scope?'Damage bonus scope source malformed':value===null?formulaUnavailableReason606(raw,bindings):undefined);damage[key]={bonus:fact(why?null:value,why),expression:raw==null?null:typeof raw==='string'||typeof raw==='number'?String(raw):null,appliesTo:'first-part-only',provenance};}
 return {abilities,spell,damage,provenance};
}
