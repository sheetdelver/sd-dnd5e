import fixture from '../../../tests/fixtures/native-6.0.6/effect-modes.json';
import { numericEffectSource, numericEffectCases } from './effect-scenarios';
export const modeEffectCases=fixture.cases;
export function modeEffectSource(row:typeof modeEffectCases[number]){
    const actor=numericEffectSource(numericEffectCases[0]);
    for(const [path,value] of Object.entries(row.sourceModes)){
        const keys=path.split('.');let target=actor as Record<string,any>;
        for(const key of keys.slice(0,-1))target=target[key]??={};target[keys.at(-1)!]=value;
        target.modeCounts={override:-1,advantages:{count:99,suppressed:true},disadvantages:{count:99,suppressed:true}};
    }
    actor.effects=[{_id:'modeEffect00001',disabled:false,type:'base',system:{changes:structuredClone(row.changes)}}];
    return actor;
}
