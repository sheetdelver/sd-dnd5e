import fixture from '../../../tests/fixtures/native-6.0.6/condition-custom-strings.json';
import {skillSource} from './skill-scenarios';
export const conditionCustomCases=fixture.cases;
export function conditionCustomSource(row:typeof conditionCustomCases[number]){
 const actor=skillSource(),system=actor.system as Record<string,any>;
 system.traits=Object.fromEntries(['dr','di','dv','ci','armorProf','weaponProf','languages'].map(key=>[key,{value:[],custom:''}]));
 system.traits[row.field.split('.')[0]]={value:[],...structuredClone(row.source)};
 system.traits.languages.labels={languages:['prepared-looking poison'],ranged:[]};
 system.abilities.dex={value:14,proficient:0};system.tools={thief:{value:1,ability:'dex'}};system.skills.prc.roll={mode:row.sourceMode};
 actor.effects=[{_id:'customCondition',type:'condition',statuses:[row.condition.type],system:{type:row.condition.type,level:row.condition.level}},{_id:'conditionCustom',type:'base',system:{changes:structuredClone(row.changes)}}]as any;
 return actor;
}
