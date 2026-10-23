import {record} from '../native/6.0.6/source';
/** These FormulaFields are initialized before initial effects. AC and the entire
 * encumbrance parent are nonpersisted; raw prepared-looking fields are ignored. */
export function initializeScalarFields606(system:Record<string,unknown>):void {
 const attributes=record(system.attributes);if(!attributes)return;
 const ac=attributes.ac===undefined?{}:record(attributes.ac);if(ac){attributes.ac=ac;delete ac.bonus;delete ac.min;}
 attributes.encumbrance={bonuses:{},multipliers:{encumbered:'1',heavilyEncumbered:'1',maximum:'1',overall:'1'}};
}
export const scalarFormulaPath606=(key:string):boolean=>/^system\.(?:attributes\.(?:ac\.(?:bonus|min)|hp\.bonuses\.(?:level|overall)|movement\.(?:bonus|speeds\.(?:walk|burrow|climb|fly|jump|swim))|encumbrance\.(?:bonuses|multipliers)\.(?:encumbered|heavilyEncumbered|maximum|overall))|abilities\.(?:str|dex|con|int|wis|cha)\.attack\.roll\.bonus|rolls\.(?:attack\.(?:(?:mwak|rwak|msak|rsak)\.)?bonus|damage\.(?:mwak|rwak|msak|rsak)\.bonus)|bonuses\.spell\.dc)$/.test(key);
export function scalarFormulaTarget606(system:Record<string,unknown>,key:string):{object:Record<string,unknown>;field:string;formula:true}|null {
 if(!scalarFormulaPath606(key))return null;const parts=key.split('.').slice(1);let parent=system;
 for(const part of parts.slice(0,-1)){if(parent[part]===undefined)parent[part]={};const child=record(parent[part]);if(!child)return null;parent=child;}
 return {object:parent,field:parts.at(-1)!,formula:true};
}
