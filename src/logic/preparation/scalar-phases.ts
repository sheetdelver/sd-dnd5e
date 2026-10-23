import type {RulesContext} from '../rules-context';
import {record} from '../native/6.0.6/source';
import type {NumericEffects} from './numeric-effects';
import {prepareFormulaFields606} from './formula-fields';
import {prepareMovement606} from './movement';
import {prepareHealth606} from './health';
import {deterministicFormula606} from './deterministic-formula';
/** Uses existing preparation functions on one detached earlier-phase snapshot.
 * No alternate arithmetic or UI reconstruction. Final field effects never
 * trigger another HP/armor/movement derivation. */
export function preparedScalarOperands606(actor:unknown,context:RulesContext,effects:NumericEffects,paths:string[]):{values:Record<string,unknown>;reason?:string} {
 const earlier=prepareFormulaFields606(actor,context,structuredClone(effects)),values:Record<string,unknown>={};let reason=earlier.reason;
 for(const path of paths){const parts=path.split('.').slice(1);let value:unknown=earlier.system;for(const key of parts)value=record(value)?.[key];values[path]=value;}
 if(paths.some(path=>/^system\.attributes\.hp\.(value|max|temp|tempmax)$/.test(path))){const {hp}=prepareHealth606(actor,context,earlier);reason??=hp.reason;for(const key of ['value','max','temp','tempmax'])values['system.attributes.hp.'+key]=hp[key as keyof typeof hp];}
 if(paths.some(path=>path.startsWith('system.attributes.movement.speeds.'))){const {movement}=prepareMovement606(actor,context,earlier);reason??=movement.reason;for(const [key,value]of Object.entries(movement.speeds))values['system.attributes.movement.speeds.'+key]=value;}
 for(const key of ['bonus','min'])if(paths.includes('system.attributes.ac.'+key)){const ac=record(record(earlier.system.attributes)?.ac),value=deterministicFormula606(ac?.[key],earlier.formulaPreparation?.preparedBindings);values['system.attributes.ac.'+key]=value;if(value===null)reason??='Prepared armor FormulaField operand unavailable';}
 if(paths.includes('system.attributes.ac.flat'))values['system.attributes.ac.flat']||=0;
 return {values,reason};
}
