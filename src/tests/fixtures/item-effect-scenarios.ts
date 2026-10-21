import fixture from '../../../tests/fixtures/native-6.0.6/item-effect-eligibility.json';
import { skillSource } from './skill-scenarios';
export const itemEffectCases=fixture.cases;
export function itemEffectSource(row:typeof itemEffectCases[number]) {
    const source=skillSource(),system=source.system as Record<string,any>;
    system.abilities.dex={value:14,proficient:0};
    system.tools={thief:{ability:'dex',value:1}};
    source.items.push({_id:'eligibilityItem1',name:'Synthetic eligibility Item',type:row.type,
        system:structuredClone(row.system),...(row.flags?{flags:structuredClone(row.flags)}:{}),
        effects:[{_id:'eligibilityEffect',type:'base',transfer:true,system:row.effect??{changes:[{key:'system.abilities.wis.value',type:'add',value:'4'}]}}]} as any);
    return source;
}
export function itemEffectExpected(row:typeof itemEffectCases[number]) {
    if(row.reason)return undefined;
    const delta=row.applied?2:0;
    return {score:14+delta*2,skill:5+delta,passive:15+delta,check:2+delta,save:2+delta,tool:5,combined:5+delta,combinedTool:5+delta,combinedMode:1};
}
