import fixture from '../../../tests/fixtures/native-6.0.6/source-flags.json';
import {skillSource} from './skill-scenarios';
export const sourceFlagCases=fixture.profiles;
export function sourceFlagSource(row:typeof sourceFlagCases[number]){
    const actor=skillSource(),s=actor.system as any;
    actor.flags={dnd5e:structuredClone(row.flags)};
    actor.items=actor.items.filter(item=>item.type!=='class');
    actor.items.push({_id:'flagClass',type:'class',name:'No inferred grants',system:{levels:row.level}} as any);
    s.abilities={wis:{value:14,proficient:0,mod:99},dex:{value:14,proficient:0,mod:99}};
    s.skills.prc={ability:'wis',value:row.skillValue,roll:{},bonuses:{passive:''},prof:99,effectValue:99,total:99,passive:99};
    s.tools={thief:{ability:'dex',value:row.toolValue,roll:{},prof:99,effectValue:99,total:99}};
    s.attributes.prof=99;s.attributes.init={ability:'dex',roll:{},prof:99,total:99,score:99};
    s.rolls={ability:Object.fromEntries(['check','skill','tool','save'].map(key=>[key,{proficiency:99,...(key==='check'?{mode:row.sourceMode}:{})}]))};
    actor.effects=[{_id:'flagInitialTargets',type:'base',system:{changes:Object.entries(row.initial).map(([key,value])=>({key:`system.rolls.ability.${key}.proficiency`,value,type:'override',phase:'initial'}))}}] as any;
    return actor;
}
export const sourceFlagFormula=(mode:number,total:number)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+(total<0?'':'+')+total;
