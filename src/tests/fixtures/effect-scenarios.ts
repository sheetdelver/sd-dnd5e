import fixture from '../../../tests/fixtures/native-6.0.6/numeric-effects.json';
import { skillSource } from './skill-scenarios';
export const numericEffectCases=fixture.cases;
export function numericEffectSource(row:typeof numericEffectCases[number]) {
    const actor=skillSource(),system=actor.system as Record<string,any>;
    system.abilities.dex={value:12,proficient:0};
    system.tools={thief:{value:1,ability:'dex',roll:{}}};
    // Prepared-looking source targets are poison, not initialization or effects.
    system.rolls={ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:99}]))};
    for(const [path,value] of Object.entries(row.patches)){
        let target=actor as Record<string,any>;const keys=path.split('.');
        for(const key of keys.slice(0,-1))target=target[key]??={};target[keys.at(-1)!]=value;
    }
    actor.effects=[{_id:'numericEffect001',disabled:false,type:'base',system:{changes:structuredClone(row.changes)}}];
    return actor;
}
