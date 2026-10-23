import fixture from '../../../tests/fixtures/native-6.0.6/final-proficiencies.json';
import {skillSource} from './skill-scenarios';
export const finalProficiencyCases=fixture.profiles;
export function finalProficiencySource(row:typeof finalProficiencyCases[number]){
    const actor=skillSource(),system=actor.system as any;
    system.abilities.str={value:10,proficient:0};system.abilities.wis={value:14,proficient:0};system.abilities.dex={value:14,proficient:0};
    system.skills.prc={ability:'wis',value:row.skillValue,prof:99,effectValue:99,total:99,passive:99,roll:{}};
    system.tools={thief:{ability:'dex',value:row.toolValue,prof:99,effectValue:99,total:99,roll:{}}};
    system.rolls={ability:Object.fromEntries(['check','save','skill','tool'].map(scope=>[scope,{proficiency:99,mode:scope==='check'?row.sourceMode:0}]))};
    actor.effects=[{_id:'initialProficiencies',type:'base',system:{changes:Object.entries(row.initial).map(([scope,value])=>({key:`system.rolls.ability.${scope}.proficiency`,type:'override',value,phase:'initial'}))}},{_id:'finalProficiency',type:'base',system:{changes:[{key:`system.rolls.ability.${row.scope}.proficiency`,...row.change}]}}]as any;
    return actor;
}
