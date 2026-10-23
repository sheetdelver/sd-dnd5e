import fixture from '../../../tests/fixtures/native-6.0.6/final-numbers.json';
import {skillSource} from './skill-scenarios';
export const finalNumberCases=fixture.profiles;
export function finalNumberSource(row:typeof finalNumberCases[number]){
    const actor=skillSource(),s=actor.system as any;
    s.abilities={str:{value:10,proficient:0,mod:99},wis:{value:14,proficient:row.saveValue,mod:99},dex:{value:14,proficient:0,mod:99}};
    s.skills.prc={ability:'wis',value:row.skillValue,roll:{},bonuses:{passive:''},total:99,prof:99,effectValue:99,passive:99};
    s.tools={thief:{ability:'dex',value:row.toolValue,roll:{},total:99,prof:99,effectValue:99}};
    s.attributes.prof=99;s.attributes.init={ability:'dex',roll:{},mod:99,prof:99,total:99,score:99};
    s.rolls={ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:99}]))};
    actor.effects=[{_id:'initialNumberProficiency',type:'base',system:{changes:Object.entries(row.initial).map(([key,value])=>({key:`system.rolls.ability.${key}.proficiency`,value,type:'override',phase:'initial'}))}},{_id:'finalNumber',type:'base',system:{changes:[{key:'system.'+row.path,...row.change}]}}]as any;
    return actor;
}
