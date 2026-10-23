import fixture from '../../../tests/fixtures/native-6.0.6/feat-final-custom-strings.json';
import {finalCustomSource} from './final-custom-scenarios';
export const featCustomCases=fixture.cases;
export function featCustomSource(row:typeof featCustomCases[number]){
 const actor=finalCustomSource(row);
 (actor.system as any).abilities.dex={value:14,proficient:0};(actor.system as any).tools={thief:{ability:'dex',value:1}};
 actor.items.push({_id:'finalFeat',uuid:`Actor.${actor._id}.Item.finalFeat`,name:'Synthetic empty feat',type:'feat',system:structuredClone(row.itemSystem),effects:actor.effects}as any);
 actor.effects=[];
 return actor;
}
