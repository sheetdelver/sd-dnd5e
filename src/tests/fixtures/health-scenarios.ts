import fixture from '../../../tests/fixtures/native-6.0.6/health.json';
import type {FoundryItem} from '@sheet-delver/sdk';
import { skillSource } from './skill-scenarios';
export const healthCases=fixture.cases;
export function healthSource(row:typeof healthCases[number]){
    const actor=skillSource(),system=actor.system as Record<string,any>;
    if(row.con!==null)system.abilities.con={value:row.con,proficient:0,mod:99};
    system.details={...system.details,level:99};
    system.attributes.hd={max:99,value:99,bySize:{d100:99}};
    system.attributes.hp={...structuredClone(row.hp),effectiveMax:99,damage:99,pct:99,bloodied:99};
    actor.items=actor.items.filter(item=>item.type!=='class');
    row.classes.forEach((cls,index)=>actor.items.push({_id:`healthClass000${index+1}`,type:'class',name:'Same label is not identity',system:{levels:cls.levels,identifier:cls.identifier,
        hd:{...(cls.die!==null?{denomination:cls.die}:{}),...(cls.spent!==null?{spent:cls.spent}:{}),...(cls.additional!==null?{additional:cls.additional}:{}),max:99,value:99},
        advancement:[{_id:`healthGrant000${index+1}`,type:'HitPoints',configuration:{},value:structuredClone(cls.choices)}]}} as unknown as FoundryItem));
    if('effectCon' in row)actor.effects=[{_id:'healthEffect001',disabled:false,type:'base',system:{changes:[{key:'system.abilities.con.value',type:'add',value:row.effectCon,phase:'initial'}]}}];
    return actor;
}
