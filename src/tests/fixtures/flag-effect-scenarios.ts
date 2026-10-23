import fixture from '../../../tests/fixtures/native-6.0.6/flag-effects.json';
import {skillSource,skillContext} from './skill-scenarios';
export const flagEffectCases=fixture.cases;
export const flagEffectContext=skillContext;
export function flagEffectSource(row:typeof fixture.cases[number]){const source=skillSource(),s=source.system as any;source.flags={dnd5e:row.sourceValue==='absent'?{}:{[row.key]:row.sourceValue}};s.abilities={wis:{value:14,proficient:0},str:{value:14,proficient:0},dex:{value:14,proficient:0}};s.skills.prc={ability:'wis',value:0};s.skills.ath={ability:'str',value:0};s.tools={thief:{ability:'wis',value:1}};s.attributes.init={ability:'dex',roll:{}};source.effects=[{_id:'FlagEffect',type:'base',system:{changes:[{key:'flags.dnd5e.'+row.key,value:row.raw,type:row.type,phase:row.phase}]}}as any];return source;}
