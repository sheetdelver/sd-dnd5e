import { record } from '../native/6.0.6/source';
import { planEffects606, type EffectPlan, type EffectChange } from './effects';
import { initializedAbilityRolls606 } from './roll-initialization';
import { numericConstant } from './numeric';
import { SKILL_LABELS, TOOL_LABELS_606 } from './check-identities';
export interface NumericEffects {
    system:Record<string,unknown>;globals:Record<string,Record<string,unknown>>;
    plan:EffectPlan;reason?:string;
    applied:Array<{effectId:string;key:string;phase:'initial';before:number;value:number}>;
}
/** Qualified initial numeric fields only. This detached initialized operand
 * set is never persisted or passed back as raw source. Global proficiency
 * starts at verified0 despite stale nonpersisted source values (DD-R04).
 * FormulaField, final changes, custom hooks and Item phases remain unavailable. */
export function prepareNumericEffects606(actor:unknown):NumericEffects {
    const source=record(actor)??{},system=structuredClone(record(source.system)??{}),plan=planEffects606(actor);
    const globals=initializedAbilityRolls606(actor),applied:NumericEffects['applied']=[];
    let reason=plan.reason;
    if(plan.final.length)reason??='Final effect field/phase preparation unavailable';
    function target(change:EffectChange):{object:Record<string,unknown>;field:string;integer?:boolean;min?:number;max?:number;step?:number;choices?:number[]}|null {
        const keys=change.key.split('.');if(keys[0]!=='system')return null;
        if(keys[1]==='rolls'&&keys[2]==='ability'&&keys.length===5&&keys[4]==='proficiency'&&Object.hasOwn(globals,keys[3])){
            if([system.rolls,record(system.rolls)?.ability,record(record(system.rolls)?.ability)?.[keys[3]]].some(value=>value!=null&&!record(value)))return null;
            return {object:globals[keys[3]],field:'proficiency',choices:keys[3]==='save'?[0,1]:[0,.5,1,2]};
        }
        if(keys[1]==='abilities'&&keys.length===4&&['str','dex','con','int','wis','cha'].includes(keys[2])&&['value','proficient'].includes(keys[3])){
            const ability=record(record(system.abilities)?.[keys[2]]);if(!ability)return null;
            if(keys[3]==='proficient'&&ability.proficient===undefined)ability.proficient=0;
            return {object:ability,field:keys[3],integer:true,min:0,...(keys[3]==='proficient'?{max:1}:{})};
        }
        const labels=keys[1]==='skills'?SKILL_LABELS:keys[1]==='tools'?TOOL_LABELS_606:null;
        if(labels&&keys.length===4&&keys[3]==='value'&&Object.hasOwn(labels,keys[2])){
            const entry=record(record(system[keys[1]])?.[keys[2]]);if(!entry)return null;
            if(keys[1]==='tools'&&entry.value===undefined)entry.value=0;
            return {object:entry,field:'value',min:0,max:2,step:.5};
        }
        return null;
    }
    for(const change of plan.initial){
        const field=target(change),raw=change.value;
        const delta=(typeof raw==='number'||typeof raw==='string'&&raw.trim()!=='')?numericConstant(raw):null;
        const before=field?.object[field.field];
        if(!field||typeof before!=='number'||!Number.isFinite(before)||delta===null||Math.abs(delta)>1_000_000_000){reason??=`Initial numeric effect target/value requires qualification: ${change.key}`;continue;}
        if(field.integer&&!Number.isInteger(before)||field.min!==undefined&&before<field.min||field.max!==undefined&&before>field.max||field.step!==undefined&&(before-(field.min??0))%field.step!==0){
            reason??=`Effect source initialization requires qualification: ${change.key}`;continue;
        }
        let value:number;
        switch(change.type){
            case 'add':value=before+delta;break;
            case 'subtract':value=before-delta;break;
            case 'multiply':value=before*delta;break;
            case 'override':value=delta;break;
            case 'upgrade':value=Math.max(before,delta);break;
            case 'downgrade':value=Math.min(before,delta);break;
            default:reason??=`Effect operation requires qualification: ${change.type}`;continue;
        }
        // Exact NumberField cleaning in this finite non-null profile.
        if(field.integer)value=Math.round(value);
        if(field.min!==undefined)value=Math.max(value,field.min);
        if(field.step!==undefined)value=Math.round((value-(field.min??0))/field.step)*field.step+(field.min??0);
        if(field.max!==undefined)value=Math.min(value,field.max);
        if(!Number.isFinite(value)||Math.abs(value)>1_000_000_000||field.choices&&!field.choices.includes(value)){
            reason??=`Effect result outside qualified numeric field choices: ${change.key}`;continue;
        }
        field.object[field.field]=value;applied.push({effectId:change.effectId,key:change.key,phase:'initial',before,value});
    }
    return {system,globals,plan,applied,...(reason?{reason}:{})};
}
