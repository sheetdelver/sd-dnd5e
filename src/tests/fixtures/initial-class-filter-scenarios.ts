import fixture from '../../../tests/fixtures/native-6.0.6/initial-class-filters.json';
import {filterSource} from './filter-scenarios';
export const initialClassFilterCases=fixture.cases;
export function initialClassFilterSource(row:typeof initialClassFilterCases[number]){
    const actor=filterSource(row),system=actor.system as any,effect=actor.effects![0] as any;
    const original=actor.items.find(item=>item.type==='class')!;
    actor.items=[...row.levels.map((levels,index)=>({...structuredClone(original),_id:'initialClass'+index,name:row.classPoison?'Wrong display class name':original.name,system:{...structuredClone(original.system),levels}})),...actor.items.filter(item=>item.type!=='class')];
    system.details??={};system.details.level=99;system.attributes??={};system.attributes.prof=99;
    if(row.omitLevel)delete (actor.items[0].system as any).levels;
    if(row.missingItems)(actor as any).items=undefined;
    if(row.actorFlag)actor.flags={dnd5e:{originalActor:'not-resolved'}};
    if(row.itemEffect){actor.effects=[];actor.items.push({_id:'filterItem001',name:'No name inference',type:'tool',system:{equipped:true},effects:[effect]} as any);}
    return actor;
}
export function initialClassFilterExpected(row:typeof initialClassFilterCases[number]){
    if(row.workflowUnavailable)return undefined;
    return {skill:row.expectedSkill!,tool:row.expectedTool!,check:row.expectedAbility!,save:row.expectedSave!,passive:row.expectedSkill!+10,combined:row.expectedSkill!,combinedTool:row.expectedSkill!,combinedMode:1};
}
