import fixture from '../../../tests/fixtures/native-6.0.6/final-modes.json';
import {conditionCases,conditionSource} from './condition-scenarios';
export const finalModeCases=fixture.profiles;
export function finalModeSource(row:typeof finalModeCases[number]){
    const actor=conditionSource(conditionCases[0]),system=actor.system as any;
    system.attributes.init={ability:'dex',roll:{mode:0,modeCounts:{override:1}}};
    const status=row.context==='poisoned'?['poisoned']:row.context==='incapacity-invisible'?['incapacitated','invisible']:[];
    actor.effects=[{_id:'explicitCondition',type:'condition',system:{type:row.context==='incapacity-invisible'?'incapacitated':'poisoned'},statuses:status},{_id:'finalModeEffect',type:'base',system:{changes:[{key:'system.'+row.path,...row.change}]}}] as any;
    const keys=row.path.split('.');let parent=system;for(const key of keys.slice(0,-1))parent=parent[key]??={};parent[keys.at(-1)!]=row.sourceMode;
    return actor;
}
