import fixture from '../../../tests/fixtures/native-6.0.6/movement-senses.json';
import {skillSource,skillContext,skillWorld} from './skill-scenarios';
export const movementCases=fixture.cases;
export function movementSource(row:typeof movementCases[number]){
    const actor=skillSource(),system=actor.system as Record<string,any>;
    system.abilities.str={value:row.strength===undefined?10:row.strength,proficient:0,mod:99};
    if(row.strength===null)delete system.abilities.str;
    if(row.movement!==undefined)system.attributes.movement=structuredClone(row.movement);
    if(row.senses!==undefined)system.attributes.senses=structuredClone(row.senses);
    system.details={race:row.raceRef??null};
    for(const [index,species] of [row.species,row.secondSpecies].entries())if(species)actor.items.push({_id:'raceFixture000'+(index+1),type:'race',name:'Same label',system:{...structuredClone(species),source:{rules:'2024',book:'Synthetic'},unknownExtension:{keep:true}},_stats:{compendiumSource:'Compendium.example.species.Item.sameSource'}} as any);
    if(row.armorStrength!==undefined)actor.items.push({_id:'movementArmor001',type:'equipment',name:'Not a calculation',system:{type:{value:'heavy'},equipped:true,armor:{value:18,dex:null},strength:row.armorStrength}} as any);
    if(row.invalidClass)(actor.items[0].system as any).levels='invalid';
    if(row.strengthEffect!==undefined)actor.effects=[{_id:'strengthEffect001',type:'base',system:{changes:[{key:'system.abilities.str.value',value:row.strengthEffect,type:'override',phase:'initial'}]}}];
    return actor;
}
export function movementContext(row:typeof movementCases[number]){
    const world=skillWorld();(world.settings as Record<string,unknown>)['dnd5e.metricLengthUnits']=row.unavailableUnits?{status:'unavailable',reason:'fixture'}:{status:'world',value:row.metric??false};return skillContext(world);
}
