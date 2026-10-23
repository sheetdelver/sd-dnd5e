import poisonedFixture from '../../../tests/fixtures/native-6.0.6/poisoned-condition.json';
import fixture from '../../../tests/fixtures/native-6.0.6/petrification.json';
import {conditionCases,conditionSource} from './condition-scenarios';
export const petrificationCases=fixture.profiles;
export function petrificationSource(row:typeof petrificationCases[number]){
    const actor=conditionSource(conditionCases[0]),s=actor.system as any;
    s.traits={ci:{value:structuredClone(row.immunities)},dr:{value:structuredClone(row.drValues),bypasses:structuredClone(row.bypasses)},di:{value:structuredClone(row.diValues)},dv:{value:structuredClone(row.dvValues)}};
    s.attributes.movement={speeds:{walk:'30',fly:'60'},units:'ft'};
    actor.effects=row.documents.map((doc:Record<string,any>,index)=>({_id:'petrification'+index,type:'condition',name:'Not an identity',system:{type:doc.systemType,conditions:doc.guard??'{}',isSuppressed:true,hasLevels:true},statuses:structuredClone(doc.statuses),...(doc.disabled!==undefined?{disabled:doc.disabled}:{})})) as any;
    if(row.ciChange)actor.effects!.push({_id:'ciChange00001',type:'base',system:{changes:[{key:'system.traits.ci.value',type:row.ciChange==='add'?'add':'subtract',value:'petrified'}]}} as any);
    return actor;
}

export const petrificationModeCases=poisonedFixture.modeEffects;
export function petrificationModeSource(row:typeof petrificationModeCases[number]){
    const source=petrificationSource(petrificationCases.find(row=>row.id==='poisoned')!);
    source.effects!.push({_id:'phaseModeEffect',type:'base',system:{changes:[{key:'system.'+row.path,type:row.type,value:row.value}]}} as any);
    return source;
}
