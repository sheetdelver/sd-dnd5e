import fixture from '../../../tests/fixtures/native-6.0.6/exhaustion-condition.json';
import {conditionCases,conditionSource} from './condition-scenarios';
export interface ExhaustionCase {id:string;profile:Record<string,any>;modes?:number[];expected:{reduction:number;level:number|null;statuses:string[];mode:number;toolMode:number;checkMode:number;combinedSkillMode:number;combinedToolMode:number;passive:number}}
const normalize=(modes:number[])=>Number(modes.includes(1))-Number(modes.includes(-1));
export const exhaustionCases:ExhaustionCase[]=[
    ...fixture.profiles.map(profile=>({id:profile.id,profile,expected:{reduction:profile.expectedReduction,level:profile.expectedLevel,statuses:profile.expectedStatuses,mode:profile.expectedMode??0,toolMode:profile.expectedMode??0,checkMode:profile.expectedMode??0,combinedSkillMode:profile.expectedCombinedMode??1,combinedToolMode:profile.expectedCombinedMode??1,passive:15+profile.expectedReduction+5*(profile.expectedMode??0)}})),
    ...fixture.sourceModes.map((row,index)=>({id:'source-mode-'+index,profile:{systemType:'exhaustion',level:2,statuses:['exhaustion'],immunities:[]},modes:row.modes,expected:{reduction:-4,level:2,statuses:['exhaustion'],mode:row.expectedSkillMode,toolMode:row.expectedToolMode,checkMode:normalize([row.modes[0],row.modes[2]]),combinedSkillMode:row.expectedCombinedSkillMode,combinedToolMode:row.expectedCombinedToolMode,passive:row.expectedPassive}})),
];
/** Native initialization,derived level/map,initial status collection and final CI
 * have independent fixture expectations. Never use module output as input. */
export function exhaustionSource(row:ExhaustionCase) {
    const source=conditionSource(conditionCases[0]),p=row.profile,s=source.system as any;
    s.traits.ci.value=structuredClone(p.immunities);s.attributes.movement={speeds:{walk:'30',fly:'60'},bonus:'0',units:'ft'};
    source.effects=(p.documents??[p]).map((doc:Record<string,any>,index:number)=>{
        const input={...p,...doc},effect:any={_id:'conditionSrc'+String(index+1).padStart(3,'0'),type:'condition',name:'Not an identity',system:{type:input.systemType,conditions:input.guard??'{}',isSuppressed:true,hasLevels:false}};
        for(const field of ['disabled','statuses'])if(input[field]!==undefined)effect[field]=structuredClone(input[field]);
        if(input.level!==undefined)effect.system.level=input.level;
        return effect;
    });
    if(p.ciChange)source.effects!.push({_id:'ciChange00001',type:'base',system:{changes:[{key:'system.traits.ci.value',type:p.ciChange==='add'?'add':'subtract',value:'exhaustion'}]}} as any);
    const modes=row.modes??[0,0,0,0];s.abilities.wis.check.roll.mode=modes[0];s.skills.prc.roll.mode=modes[1];s.rolls.ability.check.mode=modes[2];s.rolls.ability.skill.mode=modes[3];
    return source;
}
