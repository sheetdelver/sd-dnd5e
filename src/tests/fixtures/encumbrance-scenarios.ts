import {skillSource,skillContext,skillWorld} from './skill-scenarios';
export const encumbranceStatusSets=[[],['encumbered'],['heavilyEncumbered'],['exceedingCarryingCapacity'],['exceedingCarryingCapacity','heavilyEncumbered','encumbered']];
export function encumbranceSource(statuses:string[]=['heavilyEncumbered'],enabled=true,units='ft'){
 const source=skillSource(),s=source.system as any;s.abilities={str:{value:10},dex:{value:14},con:{value:10},int:{value:10},wis:{value:14},cha:{value:10}};s.skills={prc:{ability:'wis',value:1},ath:{ability:'str',value:0}};s.tools={thief:{ability:'dex',value:1}};s.attributes.movement={units,speeds:{walk:units==='ft'?'40':'12',fly:units==='ft'?'40':'12',swim:'0',climb:'0',burrow:'0',jump:'0'},bonus:'0'};
 source.effects=[{_id:'Encumbrance',type:'base',disabled:!enabled,statuses,system:{changes:[]}}as any];return source;
}
export function encumbranceContext(value='variant'){const world=skillWorld();(world.settings as any)['dnd5e.encumbrance']={status:'world',value};return skillContext(world);}
