import fixture from '../../../tests/fixtures/native-6.0.6/final-custom-strings.json';
import {skillSource} from './skill-scenarios';
export const finalCustomCases=fixture.cases;
export function finalCustomSource(row:typeof finalCustomCases[number]){
 const actor=skillSource(),traits:Record<string,unknown>=Object.fromEntries(['dr','di','dv','ci','armorProf','weaponProf','languages'].map(key=>[key,{value:[],custom:''}]));
 traits[row.field.split('.')[0]]={value:[],...structuredClone(row.source)};
 (traits.languages as any).labels={languages:['poisoned prepared-looking label'],ranged:[]};
 (actor.system as any).traits=traits;
 actor.effects=[{_id:'finalCustom',type:'base',system:{changes:[structuredClone(row.change)]}}]as any;
 (actor as any).derived={defenses:{summary:'poison'},training:{summary:'poison'}};
 return actor;
}
