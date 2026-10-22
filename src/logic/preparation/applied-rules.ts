import type {EffectChange,EffectPlan} from './effects';
import type {FormulaBindings606} from './deterministic-formula';
import {deterministicFormula606,qualifiedFormulaBonus606} from './deterministic-formula';
import {ruleFilter606} from './constant-filters';
import {initializedModeState,type EffectModeState} from './mode-effects';
export interface RuleRoll606 {ability:string|null;proficient?:boolean;type:string;skill?:string;tool?:string}
export interface RuleSnapshot606 {prepared:EffectChange[];execution:EffectChange[]}
export const ruleSnapshot606=(plan:EffectPlan):RuleSnapshot606=>({prepared:plan.initial.filter(c=>c.type.startsWith('dnd5e.')),execution:[...plan.initial,...plan.final].filter(c=>c.type.startsWith('dnd5e.'))});
export interface RuleConfiguration606 {bonus:number;mode:EffectModeState;minimum?:number;maximum?:number;reason?:string;receipts:Array<{effectId:string;itemId?:string|null;key:string;type:string;value:unknown;matches:boolean}>}
/** One conditional rule interpretation for earlier static preparation and fresh
 * construction. Collection is d20 first,then category,in registration order;
 * initial and final registrations are distinct. No source-appliedRules cache. */
export function configureRules606(snapshot:RuleSnapshot606|undefined,category:'check'|'save'|'attack'|'damage'|'healing',roll:RuleRoll606,bindings:FormulaBindings606,phase:'prepared'|'execution'='execution',ruleBindings:FormulaBindings606=bindings):RuleConfiguration606 {
 const result:RuleConfiguration606={bonus:0,mode:initializedModeState(0)!,receipts:[]},rows=snapshot?.[phase];
 if(!rows){result.reason='Applied rule preparation unavailable;current preparation required';return result;}
 for(const key of [...(['check','save','attack'].includes(category)?['d20']:[]),category])for(const row of rows.filter(row=>row.key===key)){
  if(phase==='prepared'&&['dnd5e.minimum','dnd5e.maximum'].includes(row.type))continue;
  const check=(raw:unknown)=>ruleFilter606(raw,path=>{
   if(path.startsWith('roll.')&&['ability','proficient','type','skill','tool'].includes(path.slice(5)))return {key:path,kind:'scalar',value:roll[path.slice(5)as keyof RuleRoll606],origin:'configured-roll'};
   if(path==='prof')return null; // Native root is a Proficiency object,not a scalar filter field.
   const value=Object.hasOwn(ruleBindings,path)?ruleBindings[path]:undefined;return typeof value==='number'?{key:path,value,origin:'source'}:null;
  });
  const effect=check(row.effectCondition),condition=check(row.ruleCondition);
  if(effect.status==='unavailable'||condition.status==='unavailable'){result.reason??='Applied rule condition snapshot/property requires qualification';continue;}
  const matches=effect.matches&&condition.matches;result.receipts.push({effectId:row.effectId,itemId:row.itemId,key,type:row.type,value:row.value,matches});if(!matches)continue;
  if(row.type==='dnd5e.advantage'){
   const value=String(row.value??'');switch(value){case'':break;case'1':case'+1':result.mode.advantages.count++;break;case'-1':result.mode.disadvantages.count++;break;case'=1':case'=+1':result.mode.override=1;break;case'=-1':result.mode.override=-1;break;case'>=0':result.mode.disadvantages.suppressed=true;break;case'<=0':result.mode.advantages.suppressed=true;break;default:result.reason??='Applied advantage rule value requires qualification';}continue;
  }
  const value=deterministicFormula606(row.value,row.type==='dnd5e.bonus'?bindings:ruleBindings);if(value===null||!qualifiedFormulaBonus606(value)){result.reason??='Applied rule expression/reference requires qualification';continue;}
  if(row.type==='dnd5e.bonus')result.bonus+=value;
  else if(!value)continue; // Native resolve removes falsy numeric results.
  else if(!Number.isInteger(value)||value<1||value>20)result.reason??='Applied die bound outside qualified range';
  else if(row.type==='dnd5e.minimum')result.minimum=Math.max(result.minimum??-Infinity,value);
  else if(row.type==='dnd5e.maximum')result.maximum=Math.min(result.maximum??Infinity,value);
  else result.reason??='Applied rule type requires qualification';
 }
 if(!qualifiedFormulaBonus606(result.bonus))result.reason??='Applied rule total outside qualified numeric representation';
 return result;
}
export function ruleScopes606(rules:RuleConfiguration606){return {path:'applied-rules',value:{min:rules.minimum,max:rules.maximum},effectMode:rules.mode};}
