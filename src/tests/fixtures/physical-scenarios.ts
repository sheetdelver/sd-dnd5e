import {skillSource,skillContext,skillWorld} from './skill-scenarios';
export function physicalSource(){const actor=skillSource();actor.items=actor.items.filter(item=>item.type==='class');const s=actor.system as any;s.currency={gp:50.9,sp:50};s.traits={...s.traits,size:'med'};s.abilities.str={value:10};
actor.items.push(...[
 {_id:'outer',name:'Pack',type:'container',system:{quantity:99,weight:{value:2,units:'lb'},currency:{cp:50.9},capacity:{count:5}}},
 {_id:'inner',name:'Pouch',type:'container',system:{container:'outer',weight:{value:1,units:'kg'},currency:{gp:50},properties:[],capacity:{weight:{value:20,units:'lb'}}}},
 {_id:'cargo',name:'Cargo',type:'loot',system:{container:'inner',quantity:2,weight:{value:5,units:'lb'}}},
 {_id:'loose',name:'Loose',type:'loot',system:{quantity:3,weight:{value:2,units:'lb'}}},
]as any);return actor;}
export function physicalContext(metric=false,currency=true){const world=skillWorld();(world.settings as any)['dnd5e.metricWeightUnits']={status:'world',value:metric};(world.settings as any)['dnd5e.currencyWeight']={status:'world',value:currency};return skillContext(world);}
