import fixture from '../../../tests/fixtures/native-6.0.6/training.json';
import {skillSource,skillContext,skillWorld} from './skill-scenarios';
export const trainingCases=fixture.cases;
export function trainingSource(row:typeof trainingCases[number]) {
    const actor=skillSource(),system=actor.system as Record<string,any>;
    system.traits=structuredClone(row.traits);system.tools=structuredClone(row.tools??{});system.abilities.dex={value:14,proficient:0};
    system.rolls={ability:Object.fromEntries(['check','skill','save','tool'].map(key=>[key,{proficiency:99}]))};
    if(row.invalidClass)(actor.items[0].system as any).levels='unknown';
    if(row.unknownArmor)actor.items.push({_id:'unknownArmor001',type:'equipment',name:'Unknown armor',system:{equipped:true}} as any);
    if(row.effect==='global-prof'||row.effect==='local-tool')actor.effects=[{_id:'trainingEffect1',system:{changes:[{key:row.effect==='global-prof'?'system.rolls.ability.check.proficiency':'system.tools.thief.value',type:'override',value:row.effect==='global-prof'?2:1}]}}];
    if(row.effect==='condition')actor.effects=[{_id:'trainingEffect1',statuses:['poisoned'],system:{changes:[]}}];
    if(row.effect==='unqualified')actor.effects=[{_id:'trainingEffect1',system:{changes:[{key:'system.traits.armorProf.value',type:'add',value:'hvy',phase:'final'}]}}];
    if(row.poison)(actor as any).derived={proficiencies:{armor:['ALL'],languages:['ALL']}};
    return actor;
}
export function trainingContext(row:typeof trainingCases[number]) {
    const world=skillWorld();(world.settings as Record<string,unknown>)['dnd5e.metricLengthUnits']=row.missingMetric?{status:'unavailable',reason:'not-ready'}:{status:'world',value:row.metric??false};
    return skillContext(world);
}
