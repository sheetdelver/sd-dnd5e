import fixture from '../../../tests/fixtures/native-6.0.6/final-bonuses.json';
import {skillSource} from './skill-scenarios';
export const finalBonusCases=fixture.profiles;
export function finalBonusSource(row:typeof finalBonusCases[number]){
    const actor=skillSource(),s=actor.system as any;
    s.abilities={str:{value:10,proficient:0},wis:{value:14,proficient:0},dex:{value:14,proficient:0}};
    s.skills.prc={ability:'wis',value:1,roll:{},bonuses:{passive:''},total:99,prof:99,effectValue:99,passive:99};
    s.tools={thief:{ability:'dex',value:1,roll:{},total:99,prof:99,effectValue:99}};
    s.attributes.init={ability:'dex',roll:{},total:99,score:99,mod:99,prof:99};
    s.rolls={ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:99}]))};
    if('before'in row){const keys=row.path.split('.');let target=s;for(const key of keys.slice(0,-1))target=target[key]??={};target[keys.at(-1)!]=row.before;}
    actor.effects=[{_id:'finalBonus',type:'base',system:{changes:[{key:'system.'+row.path,...row.change}]}}]as any;
    return actor;
}
