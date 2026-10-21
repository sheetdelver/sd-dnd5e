import { record } from '../native/6.0.6/source';
import type { RulesContext } from '../rules-context';
import { numericD20Roll } from './d20-configuration';
import { prepareSkillToolModel606, configureSkillToolCheck, type SkillToolModel } from './skill-tool';
export interface PreparedSkill {
    ability:string; prof:number|null; total:number|null; passive:number|null;
    formula:string|null; sourceMode?:-1|0|1;passiveMode?:-1|0|1; unavailableReason?:string;
}
export function numericSkillRoll(skill:PreparedSkill|undefined,options:Record<string,unknown>={}):string|null {return numericD20Roll(skill,options);}
export function unavailableSkillChecks(actor:unknown,reason:string):Record<string,PreparedSkill> {
    return Object.fromEntries(Object.entries(record(record(record(actor)?.system)?.skills)??{}).map(([key,value])=>[key,{
        ability:typeof record(value)?.ability==='string'?record(value)!.ability as string:'',prof:null,total:null,passive:null,formula:null,unavailableReason:reason,
    }]));
}
/** Default independent projection of the same configurable source-only path. */
export function prepareNumericSkills606(actor:unknown,context:RulesContext,model=prepareSkillToolModel606(actor,context)):Record<string,PreparedSkill> {
    return Object.fromEntries(Object.entries(model.skills).map(([key,entry])=>{
        const check=configureSkillToolCheck(model,'skill',key);
        const passive=check.total!==null&&check.passiveMode!==undefined&&typeof entry.passiveBonus==='number'?10+check.total+entry.passiveBonus+5*check.passiveMode:null;
        return [key,{...check,passive}];
    }));
}
