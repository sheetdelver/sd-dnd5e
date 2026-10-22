import fixture from '../../../tests/fixtures/native-6.0.6/read-rule-flags.json';
import {skillSource,skillContext} from './skill-scenarios';
export const readFlagCases=fixture.cases;
export const readFlagContext=skillContext;
export function readFlagSource(row:typeof readFlagCases[number]){
 const source=skillSource(),s=source.system as any;source.flags={dnd5e:{...row.flags}};
 s.abilities=Object.fromEntries(['str','wis','dex','int'].map(key=>[key,{value:14,mod:99,proficient:0,save:{value:99}}]));
 s.skills={prc:{ability:'wis',value:row.coefficient},ath:{ability:'str',value:0},inv:{ability:'int',value:0},ins:{ability:'wis',value:0}};
 s.tools={thief:{ability:'wis',value:row.coefficient,prof:99,total:99,effectValue:99}};
 s.rolls={ability:{check:{proficiency:99},skill:{proficiency:99},tool:{proficiency:99},save:{proficiency:99}}};
 source.effects=[{_id:'InitialTargets',type:'base',system:{changes:Object.entries(row.targets).map(([key,value])=>({key:'system.rolls.ability.'+key+'.proficiency',type:'override',value}))}}as any];return source;
}
