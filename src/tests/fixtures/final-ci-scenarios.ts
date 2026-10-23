import fixture from '../../../tests/fixtures/native-6.0.6/final-ci-conditions.json';
import {skillSource} from './skill-scenarios';
export const finalCiCases=fixture.cases;
export function finalCiSource(row:typeof finalCiCases[number]){
 const actor=skillSource(),s=actor.system as any;
 s.abilities={str:{value:10,proficient:0},wis:{value:14,proficient:0,mod:99},dex:{value:14,proficient:0,mod:99}};
 s.skills.prc={ability:'wis',value:1,roll:{},bonuses:{passive:''},prof:99,total:99,passive:99};s.tools={thief:{ability:'dex',value:1,roll:{},prof:99,total:99}};
 s.attributes.prof=99;s.attributes.exhaustion=0;s.attributes.init={ability:'dex',roll:{},total:99,score:99};
 s.conditions={exhaustion:99,poisoned:99};s.traits={ci:{value:structuredClone(row.profile.immunities)}};
 s.rolls={ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:99}]))};
 actor.effects=[{_id:'ciCondition',type:'condition',statuses:structuredClone(row.profile.statuses),system:{type:row.profile.systemType,...('level'in row.profile?{level:row.profile.level}:{})}},{_id:'finalCI',type:'base',system:{changes:[structuredClone(row.change)]}}]as any;
 return actor;
}
