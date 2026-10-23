import fixture from '../../../tests/fixtures/native-6.0.6/training-effects.json';
import {skillSource} from './skill-scenarios';
export const trainingEffectCases=fixture.cases;
export function trainingEffectSource(row:typeof trainingEffectCases[number]) {
    const actor=skillSource(),system=actor.system as Record<string,any>;
    system.traits=structuredClone(row.source);system.abilities.dex={value:14,proficient:0};system.tools={thief:{value:1,ability:'dex'}};
    actor.effects=[{_id:'trainingSet001',type:'base',system:{changes:structuredClone(row.changes)}}] as any;
    return actor;
}
