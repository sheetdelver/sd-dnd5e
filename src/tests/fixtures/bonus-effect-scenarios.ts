import fixture from '../../../tests/fixtures/native-6.0.6/constant-bonus-effects.json';
import { numericEffectSource, numericEffectCases } from './effect-scenarios';
export const bonusEffectCases=fixture.cases;
export function bonusEffectSource(row:typeof bonusEffectCases[number]){
    const actor=numericEffectSource(numericEffectCases[0]);
    actor.effects=[{_id:'constantBonus001',disabled:false,type:'base',system:{changes:[{key:row.key,type:row.type,value:row.value,phase:('phase' in row?row.phase:undefined)??'initial'},...('extraChanges' in row?structuredClone(row.extraChanges??[]):[])]}}];
    if(row.before!==null){
        const keys=row.key.split('.');let target=actor as Record<string,any>;
        for(const key of keys.slice(0,-1))target=target[key]??={};target[keys.at(-1)!]=row.before;
    }
    return actor;
}
