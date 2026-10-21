import fixture from '../../../tests/fixtures/native-6.0.6/trait-effects.json';
import {skillSource} from './skill-scenarios';
export const traitEffectCases=fixture.cases;
export function traitEffectSource(row:typeof traitEffectCases[number]) {
    const actor=skillSource(),system=actor.system as Record<string,any>;
    system.traits=structuredClone(row.source);system.abilities.dex={value:14,proficient:0};system.tools={thief:{ability:'dex',value:1}};
    actor.effects=[{_id:'traitEffect0001',type:'base',...(row.statuses?{statuses:row.statuses}:{}),system:{changes:structuredClone(row.changes)}}] as any;
    return actor;
}
