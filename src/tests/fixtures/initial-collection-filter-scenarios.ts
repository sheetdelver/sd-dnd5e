import fixture from '../../../tests/fixtures/native-6.0.6/initial-collection-filters.json';
import {filterSource} from './filter-scenarios';
export const initialCollectionFilterCases=fixture.cases;
export function initialCollectionFilterSource(row:typeof initialCollectionFilterCases[number]){
    const actor=filterSource(row),system=actor.system as any,effect=actor.effects![0] as any;
    system.traits=structuredClone(row.extraTraits??{});
    const parts=row.path.split('.');let parent=system.traits;
    for(const part of parts.slice(0,-1))parent=parent[part]??={};
    if(row.raw!=='[absent]')parent[parts.at(-1)!]=structuredClone(row.raw);
    // Prepared-looking source metadata is never a replacement for the schema Set.
    parent.labels=['Poison label'];parent.effectValue=99;
    if(row.missingContainer)delete system.traits[parts[0]];
    if(row.nullContainer)system.traits[parts[0]]=null;
    if(row.missingTraits)delete system.traits;
    if(row.actorFlag)actor.flags={dnd5e:{remarkableAthlete:true}};
    if(row.priorSet)actor.effects!.unshift({_id:'priorSet00001',system:{changes:[row.priorSet]}} as any);
    if(row.itemEffect){actor.effects=[];actor.items.push({_id:'filterItem001',name:'No name inference',type:'tool',system:{equipped:true},effects:[effect]} as any);}
    return actor;
}
export function initialCollectionFilterExpected(row:typeof initialCollectionFilterCases[number]){
    if(row.workflowUnavailable)return undefined;
    return {skill:row.expectedSkill!,tool:row.expectedTool!,check:row.expectedAbility!,save:row.expectedSave!,passive:row.expectedSkill!+10,combined:row.expectedSkill!,combinedTool:row.expectedSkill!,combinedMode:1};
}
