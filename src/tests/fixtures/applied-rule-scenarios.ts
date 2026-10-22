import fixture from '../../../tests/fixtures/native-6.0.6/applied-rules.json';
import {skillSource,skillContext} from './skill-scenarios';
export const ruleCases=fixture.cases;
export const ruleContext=skillContext;
export function ruleSource(row:typeof ruleCases[number]){const source=skillSource(),s=source.system as any;s.abilities.wis={value:14};s.abilities.dex={value:14};s.skills.prc={ability:'wis',value:row.coefficient??1,roll:{mode:row.sourceMode??0}};s.tools={thief:{ability:'wis',value:1}};source.effects=[{_id:'Rules',type:'base',system:{changes:structuredClone(row.changes)}}as any];if(row.fieldOverride!==undefined)(source.effects[0]as any).system.changes.push({key:'system.skills.prc.roll.mode',type:'override',value:row.fieldOverride});s.appliedRules={check:{bonus:[{value:99}]}};return source;}
