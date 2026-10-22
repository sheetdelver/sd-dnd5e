import fixture from '../../../tests/fixtures/native-6.0.6/initial-filters.json';
import {filterSource} from './filter-scenarios';
export const initialFilterCases=fixture.cases;
export function initialFilterSource(row:typeof initialFilterCases[number]){
    const actor=filterSource(row),system=actor.system as any,effect=actor.effects![0] as any;
    if(row.score==='missing')delete system.abilities.wis.value;else if(row.score!==undefined)system.abilities.wis.value=row.score;
    if(row.omitProficient)delete system.abilities.wis.proficient;
    system.abilities.wis.mod=99;system.rolls={ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:99}]))};
    if(row.priorWisBonus)actor.effects!.unshift({_id:'earlierWis001',system:{changes:[{key:'system.abilities.wis.value',type:'add',value:2}]}} as any);
    if(row.priorGlobalProf)actor.effects!.unshift({_id:'earlierProf01',system:{changes:[{key:'system.rolls.ability.check.proficiency',type:'override',value:2,priority:10}]}} as any);
    if(row.missingGlobal)delete system.rolls;
    if(row.nullGlobal)system.rolls.ability.check=null;
    if(row.noChanges)effect.system.changes=[];
    if(row.actorFlag)actor.flags={dnd5e:{remarkableAthlete:true}};
    if(row.itemEffect){actor.effects=[];actor.items.push({_id:'filterItem001',name:'No name inference',type:'tool',system:{equipped:true},effects:[effect]} as any);}
    return actor;
}
export function initialFilterExpected(row:typeof initialFilterCases[number]){
    if(row.id==='missing-score')return {skill:3,tool:5,check:0,save:0,passive:13,combined:3,combinedTool:3,combinedMode:1}; // C76 initialized10, exact14 filter false.
    if(row.workflowUnavailable)return undefined;
    return {skill:row.expectedSkill!,tool:row.expectedTool!,check:row.expectedAbility!,save:row.expectedSave!,passive:row.expectedSkill!+10,combined:row.expectedSkill!,combinedTool:row.expectedSkill!,combinedMode:1};
}
