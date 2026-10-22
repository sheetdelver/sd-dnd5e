import fixture from '../../../tests/fixtures/native-6.0.6/defenses-initiative.json';
import {skillSource,skillWorld,skillContext} from './skill-scenarios';
// C76 adds raw-source missing-key initialization; historical method shells with
// absent DEX remain separate. Native default10 now gives initiative0/score10.
export const defenseCases=fixture.cases.map(row=>row.abilities?.dex===null?{...row,expected:{...row.expected,total:0,mode:0,score:10,rollBonus:0}}:row);
/** Independent test expectation from persisted scope literals, not module output. */
export function defenseRangeSuffix(row:typeof defenseCases[number]):string {
 if(row.expected.fixed)return '';
 const scopes=Object.values(row.bounds??{}) as Array<{min?:unknown;max?:unknown}>;
 const minima=scopes.map(s=>s.min).filter((n):n is number=>typeof n==='number'),maxima=scopes.map(s=>s.max).filter((n):n is number=>typeof n==='number');
 return (minima.length?'min'+Math.max(...minima):'')+(maxima.length?'max'+Math.min(...maxima):'');
}
export function defenseSource(row:typeof defenseCases[number]){
 const actor=skillSource(),system=actor.system as Record<string,any>;
 system.abilities={dex:{value:14,proficient:0},con:{value:14,proficient:0},wis:{value:16,proficient:0},cha:{value:10,proficient:0}};
 for(const [key,value] of Object.entries(row.abilities??{})){if(value===null)delete system.abilities[key];else system.abilities[key].value=value;}
 for(const [key,roll] of Object.entries(row.abilityRolls??{}))system.abilities[key].check={roll:structuredClone(roll)};
 system.attributes.prof=99;system.details={level:99};
 system.attributes.ac=structuredClone(row.ac);system.attributes.init={mod:99,total:99,score:99,prof:{flat:99},...structuredClone(row.init)};system.attributes.quality={value:99};
 system.rolls={ability:{check:{proficiency:99,...structuredClone(row.globalCheck??{})}}};
 for(const [scope,config] of Object.entries(row.bounds??{})){const keys=scope.split('.');let target=system;for(const key of keys.slice(0,-1))target=target[key]??={};Object.assign(target[keys.at(-1)!]??={},config);}
 if(row.equipped)actor.items.push({_id:'armorFixture',type:'equipment',name:'Unqualified armor',system:{equipped:true}} as any);
 const changes=[];
 if(row.globalProficiencyEffect!==undefined)changes.push({key:'system.rolls.ability.check.proficiency',type:'override',value:row.globalProficiencyEffect,phase:'initial'});
 if(row.initiativeEffect)changes.push({key:'system.attributes.init.roll.'+row.initiativeEffect.field,type:row.initiativeEffect.type,value:row.initiativeEffect.value,phase:'initial'});
 if(changes.length)actor.effects=[{_id:'defenseEffect01',disabled:false,type:'base',system:{changes}}];
 return actor;
}
export function defenseContext(row:typeof defenseCases[number]){
 const world=skillWorld(),settings=world.settings as Record<string,any>;
 settings['dnd5e.initiativeScore']={status:'world',value:row.settings?.score??'none'};
 settings['dnd5e.initiativeDexTiebreaker']={status:'world',value:row.settings?.tie??false};
 settings['dnd5e.proficiencyModifier']={status:'world',value:row.settings?.proficiency??'bonus'};
 return skillContext(world);
}
