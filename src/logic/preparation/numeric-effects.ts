import {prepareConditions606,type ConditionPreparation606} from './conditions';
import { initializedModeState, applyEffectMode, resolvedEffectMode, type EffectModeState } from './mode-effects';
import { record } from '../native/6.0.6/source';
import { planEffects606, type EffectPlan, type EffectChange } from './effects';
import { initializedAbilityRolls606,initializedSaveProficiency606 } from './roll-initialization';
import { numericConstant, qualifiedNumericTotal } from './numeric';
import { SKILL_LABELS, TOOL_LABELS_606 } from './check-identities';
import {prepareEquipment606,type EquipmentPreparation} from './equipment';
import {DAMAGE_LABELS_606,BYPASS_LABELS_606} from '../native/6.0.6/defense-identities';
import {CONDITION_STATUS_LABELS_606} from '../native/6.0.6/condition-identities';
import {initializeTraitSet606,applyTraitSet606} from './trait-fields';
import {trainingSetField606} from './training-fields';
export interface NumericEffects {
    system:Record<string,unknown>;conditions:ConditionPreparation606;globals:Record<string,Record<string,unknown>>;executionGlobals:Record<string,Record<string,unknown>>;equipment:EquipmentPreparation;
    initialized:Array<{key:string;value:number;origin:'schema-default'}>;plan:EffectPlan;reason?:string;modes:Record<string,EffectModeState>;executionModes:Record<string,EffectModeState>;checkExecutionReason?:string;
    applied:Array<{effectId:string;key:string;phase:'initial'|'final';before:number|string[];value:number|string[];formula?:string;delta?:string[];initializedFrom?:'source'|'default'|'null-cleaned'}>;
}
/** Qualified initial numeric/defense/training trait fields. This detached initialized operand
 * set is never persisted or passed back as raw source. Global proficiency
 * starts at verified0 despite stale nonpersisted source values (DD-R04).
 * Only constant FormulaField add/subtract/override is reduced by operation,
 * without parsing arbitrary expressions. Qualified final mode changes have a separate
 * execution snapshot, as do final global proficiency NumberFields. Earlier
 * prepared proficiency/passive operands never change; other final/Item fields stay gated. */
export function prepareNumericEffects606(actor:unknown):NumericEffects {
    const source=record(actor)??{},system=structuredClone(record(source.system)??{}),plan=planEffects606(actor);
    const globals=initializedAbilityRolls606(actor),applied:NumericEffects['applied']=[];
    const initialized:NumericEffects['initialized']=[];
    for(const key of ['str','dex','con','int','wis','cha']){
        const ability=record(record(system.abilities)?.[key]);
        if(ability&&ability.proficient===undefined){
            const value=initializedSaveProficiency606(ability);
            if(value!==null){ability.proficient=value;initialized.push({key:`system.abilities.${key}.proficient`,value,origin:'schema-default'});}
        }
    }
    let reason=plan.reason;
    const formulas:Record<string,string>={},modes:Record<string,EffectModeState>={};
    const origins:Record<string,'source'|'default'|'null-cleaned'>={};
    function target(change:Pick<EffectChange,'key'>):{object:Record<string,unknown>;field:string;integer?:boolean;min?:number;max?:number;step?:number;choices?:number[];formula?:boolean;mode?:boolean;set?:boolean;valid?:(value:string)=>boolean}|null {
        const keys=change.key.split('.');if(keys[0]!=='system')return null;
        if(keys[1]==='traits'){
            const key=keys[2],field=keys[3];
            const training=trainingSetField606(keys.slice(2).join('.'));
            const set=Boolean(training)||keys.length===4&&(['dr','di','dv','ci'].includes(key)&&field==='value'||['dr','di','dv','dm'].includes(key)&&field==='bypasses');
            const amount=key==='dm'&&keys.length===5&&field==='amount'&&Object.hasOwn(DAMAGE_LABELS_606,keys[4]);
            if(!set&&!amount)return null;
            let container=system;
            for(const part of keys.slice(1,-1)){
                if(container[part]==null)container[part]={};
                const child=record(container[part]);if(!child)return null;container=child;
            }
            const name=keys.at(-1)!;
            if(set){
                const value=container[name];origins[change.key]??=value===undefined?'default':value===null?'null-cleaned':'source';
                const labels=field==='bypasses'?BYPASS_LABELS_606:key==='ci'?CONDITION_STATUS_LABELS_606:DAMAGE_LABELS_606;
                return {object:container,field:name,set:true,valid:training??(value=>Object.hasOwn(labels,value)||field==='value'&&key!=='ci'&&value==='ALL')};
            }
            // FormulaField scalar source cleaning, distinct from a prepared
            // expression reduction. Null/missing initializes undefined.
            const value=container[name];
            if(value==null)container[name]=undefined;
            else if(typeof value==='string')container[name]=value.trim();
            return {object:container,field:name,formula:true};
        }
        // D20 roll bonus FormulaFields and skill passive bonuses have separate
        // operation semantics. Never send their text to a module evaluator.
        function rollBonus(container:Record<string,unknown>,path:string[]):Record<string,unknown>|null {
            let target=container;
            for(const key of path){
                if(target[key]===undefined||key==='roll'&&target[key]===null)target[key]={};
                const child=record(target[key]);if(!child)return null;target=child;
            }
            return target;
        }
        let bonus:Record<string,unknown>|null=null;
        if(keys[1]==='rolls'&&keys[2]==='ability'&&keys.length===5&&['bonus','mode'].includes(keys[4])&&Object.hasOwn(globals,keys[3])){
            if([system.rolls,record(system.rolls)?.ability,record(record(system.rolls)?.ability)?.[keys[3]]].some(value=>value!=null&&!record(value)))return null;
            bonus=globals[keys[3]];
        }else if(keys[1]==='abilities'&&keys.length===6&&['str','dex','con','int','wis','cha'].includes(keys[2])&&['check','save'].includes(keys[3])&&keys[4]==='roll'&&['bonus','mode'].includes(keys[5])){
            const ability=record(record(system.abilities)?.[keys[2]]);if(ability)bonus=rollBonus(ability,[keys[3],'roll']);
        }else if(['skills','tools'].includes(keys[1])&&keys.length===5&&keys[3]==='roll'&&['bonus','mode'].includes(keys[4])&&Object.hasOwn(keys[1]==='skills'?SKILL_LABELS:TOOL_LABELS_606,keys[2])){
            const entry=record(record(system[keys[1]])?.[keys[2]]);if(entry)bonus=rollBonus(entry,['roll']);
        }else if(keys[1]==='skills'&&keys.length===5&&keys[3]==='bonuses'&&keys[4]==='passive'&&Object.hasOwn(SKILL_LABELS,keys[2])){
            const entry=record(record(system.skills)?.[keys[2]]);if(entry){const bonuses=rollBonus(entry,['bonuses']);if(bonuses)return {object:bonuses,field:'passive',formula:true};}
        }
        if(keys[1]==='attributes'&&keys[2]==='init'&&keys.length===5&&keys[3]==='roll'&&['bonus','mode'].includes(keys[4]))bonus=rollBonus(system,['attributes','init','roll']);
        if(bonus)return keys.at(-1)==='mode'?{object:bonus,field:'mode',mode:true}:{object:bonus,field:'bonus',formula:true};
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
        if(field?.set){
            const before=initializeTraitSet606(field.object[field.field]);
            const appliedSet=before&&field.valid?applyTraitSet606(before,change.type,raw,field.valid):null;
            if(!before||!appliedSet){reason??=`Initial trait effect source/delta/operation requires qualification: ${change.key}`;continue;}
            field.object[field.field]=appliedSet.value;
            applied.push({effectId:change.effectId,key:change.key,phase:'initial',before,value:appliedSet.value,delta:appliedSet.delta,initializedFrom:origins[change.key]});
            continue;
        }
        const delta=(typeof raw==='number'||typeof raw==='string'&&raw.trim()!=='')?numericConstant(raw):null;
        const operand=field?.object[field.field],before=field?.formula?numericConstant(operand):field?.mode&&operand===undefined?0:operand;
        if(!field||typeof before!=='number'||!Number.isFinite(before)||delta===null||Math.abs(delta)>1_000_000_000){reason??=`Initial numeric effect target/value requires qualification: ${change.key}`;continue;}
        if(field.mode){
            const state=modes[change.key]??initializedModeState(operand);
            const value=state?applyEffectMode(state,change.type,delta):null;
            if(!state||value===null){reason??=`Effect mode operation/source requires qualification: ${change.key}`;continue;}
            modes[change.key]=state;field.object[field.field]=value;
            applied.push({effectId:change.effectId,key:change.key,phase:'initial',before,value});continue;
        }
        let formula:string|undefined;
        if(field.formula){
            if(operand===null||!qualifiedNumericTotal(delta)||!['add','subtract','override'].includes(change.type)){
                reason??=`Constant FormulaField operation/source requires qualification: ${change.key}`;continue;
            }
            const previous=formulas[change.key]??(operand===undefined?'':String(operand).trim()),deltaText=String(raw).trim();
            formula=change.type==='override'?deltaText:change.type==='subtract'?(previous?`${previous} - (${deltaText})`:`-(${deltaText})`):previous?`${previous} ${deltaText.startsWith('-')?'-':'+'} ${deltaText.replace(/^[+-]/,'').trim()}`:deltaText;
        }
        if(field.integer&&!Number.isInteger(before)||field.min!==undefined&&before<field.min||field.max!==undefined&&before>field.max||field.step!==undefined&&(before-(field.min??0))%field.step!==0){
            reason??=`Effect source initialization requires qualification: ${change.key}`;continue;
        }
        const value=applyNumericFieldChange(before,delta,change.type,field);
        if(value===null){reason??=`Effect operation/result outside qualified numeric field choices: ${change.key}`;continue;}
        field.object[field.field]=value;if(formula!==undefined)formulas[change.key]=formula;
        applied.push({effectId:change.effectId,key:change.key,phase:'initial',before,value,...(formula!==undefined?{formula}:{})});
    }
    // Common.prepareAbilities mutates condition counts after initial effects and
    // before skill/tool passives. Keep this provenance separate from initial writes.
    const conditions=prepareConditions606(actor,system,plan.conditions??[],reason);
    reason??=conditions.reason;
    for(const modifier of conditions.modes){
        if(modifier.phase!=='abilities')continue;
        const keys=modifier.path.split('.');let parent=system;
        for(const key of keys.slice(1,-1)){if(parent[key]===undefined)parent[key]={};const value=record(parent[key]);if(!value){reason??='Condition ability mode container malformed';break;}parent=value;}
        if(reason)break;
        const field=keys.at(-1)!,state=modes[modifier.path]??initializedModeState(parent[field]);
        if(!state){reason??='Condition ability mode source malformed';break;}
        const value=applyEffectMode(state,'add',modifier.mode);if(value===null){reason??='Condition mode preparation unavailable';break;}
        parent[field]=value;modes[modifier.path]=state;
    }
    // Native passives and initiative scores precede armor/initiative/final modes.
    // Keep their earlier count state separate; never move a final effect to initial.
    const executionModes=structuredClone(modes),executionGlobals=structuredClone(globals),equipment=prepareEquipment606(actor);
    let checkExecutionReason:string|undefined;
    function addExecutionMode(key:string,delta:number){
        const field=target({key});
        if(!field?.mode)return false;
        const state=executionModes[key]??initializedModeState(field.object[field.field]);
        if(!state||applyEffectMode(state,'add',delta)===null)return false;
        executionModes[key]=state;return true;
    }
    if(equipment.armor?.stealthDisadvantage&&Object.hasOwn(record(system.skills)??{},'ste')&&!addExecutionMode('system.skills.ste.roll.mode',-1))checkExecutionReason='Equipped armor Stealth mode source malformed';
    for(const modifier of conditions.modes)if(modifier.phase==='initiative')addExecutionMode(modifier.path,modifier.mode);
    for(const change of plan.final){
        if(change.itemId!==undefined){reason??='Transferred Item final phase requires qualification';continue;}
        const field=target(change),raw=change.value,delta=(typeof raw==='number'||typeof raw==='string'&&raw.trim()!=='')?numericConstant(raw):null;
        const proficiency=/^system\.rolls\.ability\.(check|save|skill|tool)\.proficiency$/.exec(change.key);
        if(proficiency&&field?.choices){
            const target=executionGlobals[proficiency[1]],before=target.proficiency;
            const value=typeof before==='number'&&delta!==null&&Math.abs(delta)<=1_000_000_000?applyNumericFieldChange(before,delta,change.type,field):null;
            if(value===null){reason??=`Final proficiency operation/value requires qualification: ${change.key}`;continue;}
            target.proficiency=value;applied.push({effectId:change.effectId,key:change.key,phase:'final',before:before as number,value});continue;
        }
        if(!field?.mode||delta===null||![-1,0,1].includes(delta)){
            reason??=`Final mode field/value requires qualification: ${change.key}`;continue;
        }
        const state=executionModes[change.key]??initializedModeState(field.object[field.field]);
        const before=state?resolvedEffectMode(state):null,value=state?applyEffectMode(state,change.type,delta):null;
        if(!state||before===null||value===null){reason??=`Final mode operation/source requires qualification: ${change.key}`;continue;}
        executionModes[change.key]=state;
        applied.push({effectId:change.effectId,key:change.key,phase:'final',before,value});
    }
    if(reason&&!conditions.reason){conditions.status='unavailable';conditions.reason=reason;}
    return {system,conditions,globals,executionGlobals,plan,applied,modes,executionModes,checkExecutionReason,initialized,equipment,...(reason?{reason}:{})};
}

/** Shared finite NumberField operations; schema choices and cleaning are qualified
 * separately from source initialization and native preparation timing. */
function applyNumericFieldChange(before:number,delta:number,type:string,field:{integer?:boolean;min?:number;max?:number;step?:number;choices?:number[]}):number|null {
    let value:number;
    switch(type){
        case 'add':value=before+delta;break;
        case 'subtract':value=before-delta;break;
        case 'multiply':value=before*delta;break;
        case 'override':value=delta;break;
        case 'upgrade':value=Math.max(before,delta);break;
        case 'downgrade':value=Math.min(before,delta);break;
        default:return null;
    }
    if(field.integer)value=Math.round(value);
    if(field.min!==undefined)value=Math.max(value,field.min);
    if(field.step!==undefined)value=Math.round((value-(field.min??0))/field.step)*field.step+(field.min??0);
    if(field.max!==undefined)value=Math.min(value,field.max);
    return Number.isFinite(value)&&Math.abs(value)<=1_000_000_000&&(!field.choices||field.choices.includes(value))?value:null;
}
