import fixture from '../../../tests/fixtures/native-6.0.6/item-initial-custom-strings.json';
import {skillSource} from './skill-scenarios';
export const itemCustomCases=fixture.cases;
export function itemCustomSource(row:typeof itemCustomCases[number]){
 const actor=skillSource(),system=actor.system as Record<string,any>;
 system.abilities.dex={value:14,proficient:0};system.tools={thief:{ability:'dex',value:1}};
 system.traits=Object.fromEntries(['dr','di','dv','ci','armorProf','weaponProf','languages'].map(key=>[key,{value:[],custom:''}]));
 system.traits[row.field.split('.')[0]]={value:[],...structuredClone(row.source)};
 system.traits.languages.labels={languages:['poisoned prepared-looking label'],ranged:[]};
 actor.effects=row.actorChanges.length?[{_id:'actorCustom',type:'base',system:{changes:structuredClone(row.actorChanges)}}]as any:[];
 actor.items.push(...structuredClone(row.items).map(item=>({...item,name:'Synthetic Item',uuid:`Actor.${actor._id}.Item.${item._id}`}))as any);
 return actor;
}
