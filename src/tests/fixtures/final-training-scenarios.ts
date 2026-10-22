import fixture from '../../../tests/fixtures/native-6.0.6/final-training-sets.json';
import {skillSource} from './skill-scenarios';
export const finalTrainingCases=fixture.cases;
export function finalTrainingSource(row:typeof finalTrainingCases[number]){
 const actor=skillSource(),s=actor.system as any;s.traits=structuredClone(row.source);
 s.traits.languages.labels={languages:['poison'],ranged:['poison']};
 actor.effects=[{_id:'finalTraining',type:'base',system:{changes:[structuredClone(row.change)]}}]as any;
 (actor as any).derived={training:{summary:'poison'}};
 return actor;
}
