import fixture from '../../../tests/fixtures/native-6.0.6/final-defense-sets.json';
import {skillSource} from './skill-scenarios';
export const finalDefenseCases=fixture.cases;
export function finalDefenseSource(row:typeof finalDefenseCases[number]){
 const actor=skillSource();(actor.system as any).traits=structuredClone(row.source);
 actor.effects=[...(row.petrified?[{_id:'finalDefenseCondition',type:'condition',statuses:['petrified'],system:{type:'petrified'}}]:[]),{_id:'finalDefense',type:'base',system:{changes:[structuredClone(row.change)]}}]as any;
 (actor as any).derived={defenses:{summary:'poison',categories:{dr:{values:['ALL']}}}};
 return actor;
}
