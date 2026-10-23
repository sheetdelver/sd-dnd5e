import fixture from '../../../tests/fixtures/native-6.0.6/condition-modes.json';
import incapacityFixture from '../../../tests/fixtures/native-6.0.6/incapacity-conditions.json';
import {conditionCases,conditionSource} from './condition-scenarios';
export interface FamilyExpected {statuses:string[];dexSave:number;init:number;score:number;walk:number;fly:number;skillMode:number;wisSave:number;passive:number;combinedMode:number}
export interface FamilyCase {id:string;profile:Record<string,any>;modes:number[];effect?:Record<string,any>;expected:FamilyExpected}
const modes0=[0,0,0,0];
function expected(value:Record<string,any>,modes:number[],effect?:Record<string,any>):FamilyExpected {
    const skillMode=effect?.path==='rolls.ability.check.mode'?effect.value:modes[3],wisSave=effect?.path==='rolls.ability.save.mode'?effect.value:modes[2];
    return {statuses:value.statuses,dexSave:value.save,init:value.init,score:value.score,walk:value.walk,fly:value.fly,skillMode,wisSave,passive:15+5*skillMode,combinedMode:skillMode===-1?0:1};
}
export const familyCases:FamilyCase[]=[
    ...incapacityFixture.profiles.map(profile=>({id:profile.id,profile,modes:modes0,expected:expected(profile.expected,modes0)})),
    ...incapacityFixture.modeCases.map((row,index)=>{const profile=incapacityFixture.profiles.find(profile=>profile.id===row.profile)!;return {id:'modes-incapacity-'+index,profile,modes:row.modes,expected:expected(row.expected,row.modes)};}),
    ...fixture.profiles.map(profile=>({id:profile.id,profile,modes:modes0,expected:expected(profile.expected,modes0)})),
    ...fixture.modeCases.map((row,index)=>{const profile=fixture.profiles.find(profile=>profile.id===row.profile)!;return {id:'modes-'+index,profile,modes:row.modes,expected:expected({...profile.expected,...row.expected},row.modes)};}),
    ...fixture.effectCases.map(row=>{const profile=fixture.profiles.find(profile=>profile.id===row.base)!;return {id:row.id,profile,modes:modes0,effect:row.effect,expected:expected(row.expected,modes0,row.effect)};}),
];
export function familySource(row:FamilyCase){
    const actor=conditionSource(conditionCases[0]),p=row.profile,s=actor.system as any;
    s.traits.ci.value=structuredClone(p.immunities);s.attributes.movement={speeds:{walk:'30',fly:'60'},units:'ft'};
    s.attributes.init={ability:'dex',roll:{mode:row.modes[0],modeCounts:{override:1}}};s.abilities.dex.save={roll:{mode:row.modes[1],modeCounts:{override:1}}};s.rolls.ability.save.mode=row.modes[2];s.rolls.ability.check.mode=row.modes[3];
    const effect:any={_id:'conditionFamily1',type:'condition',name:'Not an identity',system:{type:p.systemType,conditions:p.guard??'{}',isSuppressed:true,hasLevels:true}};
    if(p.statuses!==undefined)effect.statuses=structuredClone(p.statuses);if(p.disabled!==undefined)effect.disabled=p.disabled;
    actor.effects=[effect];
    if(p.ciChange)actor.effects.push({_id:'ciChange00001',type:'base',system:{changes:[{key:'system.traits.ci.value',type:p.ciChange==='add'?'add':'subtract',value:p.systemType}]}} as any);
    if(row.effect)actor.effects.push({_id:'modeEffect001',type:'base',system:{changes:[{key:'system.'+row.effect.path,type:row.effect.type,value:row.effect.value}]}} as any);
    return actor;
}
