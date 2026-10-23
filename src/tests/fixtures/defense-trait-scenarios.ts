import fixture from '../../../tests/fixtures/native-6.0.6/defense-traits.json';
import {skillSource} from './skill-scenarios';
// C90 qualifies the initialized Actor attributes.prof reference. Preserve the
// earlier refusal capture and supplement only its named current expectation.
export const defenseTraitCases=fixture.cases.map(row=>row.id==='damage-reference-gated'?{...row,expected:{...row.expected,dm:{amount:{fire:3},bypasses:[]}}}:row);
export function defenseTraitSource(row:typeof defenseTraitCases[number]) {
    const actor=skillSource();(actor.system as any).traits=structuredClone(row.traits);
    if(row.invalidClass)(actor.items[0].system as any).levels='unknown';
    if(row.unknownArmor)actor.items.push({_id:'unknownArmor001',name:'Unknown armor',type:'equipment',system:{equipped:true}} as any);
    if(row.effect==='numeric')actor.effects=[{_id:'defenseEffect01',system:{changes:[{key:'system.abilities.wis.value',type:'add',value:'4'}]}}];
    if(row.effect?.includes('condition'))actor.effects=[{_id:'defenseEffect01',disabled:row.effect==='disabled-condition',statuses:['petrified'],type:'base',system:{changes:[]}}];
    if(row.effect==='trait-change'||row.effect==='final-change')actor.effects=[{_id:'defenseEffect01',system:{changes:[{key:row.effect==='trait-change'?'system.traits.dr.value':'system.abilities.wis.value',phase:row.effect==='final-change'?'final':'initial',type:'add',value:'4'}]}}];
    if(row.poison)(actor as any).derived={defenses:{summary:'Immune to everything'}};
    return actor;
}
