import {record} from '../native/6.0.6/source';
/** These FormulaFields are initialized before initial effects. AC and the entire
 * encumbrance parent are nonpersisted; raw prepared-looking fields are ignored. */
export function initializeScalarFields606(system:Record<string,unknown>):Record<string,'source'|'default'> {
 const origins:Record<string,'source'|'default'>={},attributes=record(system.attributes);if(!attributes)return origins;
 const ac=attributes.ac===undefined?{}:record(attributes.ac);if(ac){attributes.ac=ac;delete ac.bonus;delete ac.min;ac.cover=0;}
 const hp=attributes.hp===undefined?{}:record(attributes.hp);if(hp)attributes.hp=hp;
 for(const [group,data,defaults]of [['ac',ac,{flat:null,override:null}],['hp',hp,{value:null,max:null,temp:0,tempmax:0}]]as const){if(!data)continue;for(const [key,value]of Object.entries(defaults)){origins[`system.attributes.${group}.${key}`]=data[key]===undefined?'default':'source';if(data[key]===undefined)data[key]=value;}}
 attributes.encumbrance={bonuses:{},multipliers:{encumbered:'1',heavilyEncumbered:'1',maximum:'1',overall:'1'}};
 return origins;
}
export const scalarFormulaPath606=(key:string):boolean=>/^system\.(?:attributes\.(?:ac\.(?:bonus|min)|hp\.bonuses\.(?:level|overall)|movement\.(?:bonus|speeds\.(?:walk|burrow|climb|fly|jump|swim))|encumbrance\.(?:bonuses|multipliers)\.(?:encumbered|heavilyEncumbered|maximum|overall))|abilities\.(?:str|dex|con|int|wis|cha)\.attack\.roll\.bonus|rolls\.(?:attack\.(?:(?:mwak|rwak|msak|rsak)\.)?bonus|damage\.(?:mwak|rwak|msak|rsak)\.bonus)|bonuses\.spell\.dc)$/.test(key);
export function scalarFormulaTarget606(system:Record<string,unknown>,key:string):{object:Record<string,unknown>;field:string;formula:true}|null {
 if(!scalarFormulaPath606(key))return null;const parts=key.split('.').slice(1);let parent=system;
 for(const part of parts.slice(0,-1)){if(parent[part]===undefined)parent[part]={};const child=record(parent[part]);if(!child)return null;parent=child;}
 return {object:parent,field:parts.at(-1)!,formula:true};
}

export const scalarNumberPath606=(key:string):boolean=>/^system\.attributes\.(?:ac\.(?:flat|override|cover)|hp\.(?:value|max|temp|tempmax)|movement\.multiplier|senses\.ranges\.(?:blindsight|darkvision|tremorsense|truesight))$/.test(key);
export function scalarNumberTarget606(system:Record<string,unknown>,key:string):{object:Record<string,unknown>;field:string;integer:boolean;min?:number;nullable:boolean}|null {
 if(!scalarNumberPath606(key))return null;const parts=key.split('.').slice(1);let parent=system;
 for(const part of parts.slice(0,-1)){if(parent[part]===undefined)parent[part]={};const child=record(parent[part]);if(!child)return null;parent=child;}
 const name=parts.at(-1)!;if(parent[name]===undefined){const defaults:Record<string,number|null>={flat:null,override:null,cover:0,value:null,max:null,temp:0,tempmax:0,multiplier:1};parent[name]=Object.hasOwn(defaults,name)?defaults[name]:0;}
 return {object:parent,field:name,integer:name!=='multiplier',nullable:/^system\.attributes\.(ac\.(flat|override)|hp\.(value|max))$/.test(key),...(name==='tempmax'?{}:{min:0})};
}
