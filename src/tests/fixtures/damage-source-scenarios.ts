import fixture from '../../../tests/fixtures/native-6.0.6/damage-source.json';
import {skillSource,skillContext} from './skill-scenarios';
export const damageSourceCases=fixture.cases,damagePlacementCases=fixture.placements,damageSourceContext=skillContext;
export function damageSourceActor(row:typeof damageSourceCases[number],includeBase=true){
 const source=skillSource();source.items=source.items.filter(i=>i.type==='class');source.effects=[];
 source.items.push({_id:'SourceWeapon0001',name:'Source blade',type:'weapon',system:{type:{value:'simpleM'},proficient:1,damage:{base:structuredClone(row.source)},activities:{SourceAttack0001:{_id:'SourceAttack0001',type:'attack',attack:{ability:'str',type:{value:'melee',classification:'weapon'}},damage:{includeBase,parts:[{number:1,denomination:4,base:true,formula:'99d99'}]}}}}}as any);return source;
}
export function inlineDamageSourceActor(row:typeof damageSourceCases[number],kind:'damage'|'save'|'heal'){
 const source=damageSourceActor(row,false),item=source.items.at(-1)!,system=item.system as any,activity=system.activities.SourceAttack0001;item.type='spell';delete system.damage;activity.type=kind;
 if(kind==='heal')activity.healing=structuredClone(row.source);else activity.damage={parts:[structuredClone(row.source)]};return source;
}
