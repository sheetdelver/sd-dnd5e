import fixture from '../../../tests/fixtures/native-6.0.6/transferred-final.json';
import {equippableFinalCases,equippableFinalSource,equippableFinalContext} from './equippable-final-scenarios';
export const transferredFinalCases=fixture.cases,transferredFinalContext=equippableFinalContext;
export function transferredFinalSource(row:typeof fixture.cases[number]){
 const base=equippableFinalCases.find(r=>r.type===row.type&&r.phase==='final'&&Boolean(r.source.properties.length)===row.state.magic&&r.source.attunement==='required'&&r.source.attuned===row.state.attuned&&r.source.equipped===row.state.equipped)!;
 const source=equippableFinalSource(base),s=source.system as any;s.skills.prc={ability:'wis',value:row.coefficient,roll:{bonus:'',mode:0},bonuses:{}};s.tools={thief:{ability:'wis',value:1,roll:{bonus:'',mode:0}}};
 const gear=source.items.at(-1)! as any;(gear.effects![0]as any).system.changes=[{key:row.key,type:row.operation,value:row.value,phase:'final'}];return source;
}
