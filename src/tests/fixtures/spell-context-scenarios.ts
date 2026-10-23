import fixture from '../../../tests/fixtures/native-6.0.6/spell-context.json';
import {skillSource,skillContext} from './skill-scenarios';
export const spellContextCases=fixture.cases,spellAttackCases=fixture.attacks,spellContextContext=skillContext;
export function spellContextSource(row:typeof spellContextCases[number],selection='',ranged=false){
 const source=skillSource(),s=source.system as any;
 const classes=row.items.filter(item=>item.type==='class');
 source.items=row.items.map(item=>({_id:item.id,type:item.type,name:item.identifier,flags:{dnd5e:(item as any).flags??{}},system:{...structuredClone(item.system),identifier:item.identifier,...(item.type==='class'?{levels:classes.length===1?5:item===classes[0]?2:3}:{})}})) as any;
 if(!classes.length)source.items.push({_id:'MundaneClass0001',type:'class',name:'Mundane',system:{identifier:'mundane',levels:5}}as any);
 s.attributes.spellcasting=row.attribute;
 s.abilities=Object.fromEntries(Object.entries(fixture.scores).map(([key,value])=>[key,{value,attack:{roll:{bonus:'1'}}}]));
 s.rolls={attack:{bonus:'2',msak:{bonus:'3'},rsak:{bonus:'4'}}};
 source.items.push({_id:'SpellProbe000001',type:'spell',name:'Context spell',system:{identifier:'context-spell',level:1,school:'abj',...structuredClone(row.spell),activities:{AttackProbe00001:{_id:'AttackProbe00001',type:'attack',attack:{ability:selection,bonus:'5',type:{value:ranged?'ranged':'melee',classification:'spell'}}}}}}as any);
 return source;
}
