import {toolSource} from './tool-scenarios';
import {setSkillRoll} from './skill-scenarios';
import type {PreparedRollKind} from '../../ui/components/shared/skillIntent';
export const rangeScopes:ReadonlyArray<{kind:PreparedRollKind;key:string;total:number;scope:string}>=([
    ['skill','prc',5,['skills.prc.roll','abilities.wis.check.roll','rolls.ability.check','rolls.ability.skill']],
    ['tool','thief',5,['tools.thief.roll','abilities.dex.check.roll','rolls.ability.check','rolls.ability.tool']],
    ['ability','wis',2,['abilities.wis.check.roll','rolls.ability.check']],
    ['save','wis',2,['abilities.wis.save.roll','rolls.ability.save']],
    ['initiative','initiative',2,['attributes.init.roll','abilities.dex.check.roll','rolls.ability.check']],
] as const).flatMap(([kind,key,total,scopes])=>scopes.map(scope=>({kind,key,total,scope})));
export const normalRangeCases=rangeScopes.flatMap(row=>(['min','max'] as const).map(field=>({...row,field,id:`${row.kind}:${row.scope}:${field}`,formula:`1d20${field}10+${row.total}`})));
export function rangeSource(row:typeof normalRangeCases[number],mode:-1|0|1=0){
    const actor=toolSource();(actor.system as any).abilities.dex.proficient=0;setSkillRoll(actor,row.scope,{[row.field]:10,mode});return actor;
}
