import {initializeClassFacts606} from './class-initialization';
import {composeFormulaEffect606,checkBonusPath606} from './formula-effects';
import {applyBooleanFlag606} from './flag-effects';
import {prepareFormulaFields606,type FormulaPreparation606} from './formula-fields';
import type {RulesContext} from '../rules-context';
import {initializeCheckSource606,type SourceInitialization606} from './source-initialization';
import {featFinalCustomReason606} from './feat-final-profile';
import {sourceRuleFlags606,type SourceRuleFlags606} from './rule-flags';
import {preparedDefenseSets606} from './defense-sets';
import {customTraitPath606,initializeCustomString606,applyCustomString606,customStringConditionReason606} from './trait-strings';
import {prepareConditions606,currentConditionImmunities606,type ConditionPreparation606} from './conditions';
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
import {checkProficiency606,saveProficiency606,sourceCheckCoefficient606} from './proficiency';
export interface NumericEffects {
    proficiency?:{base:number|null;prepared:number|null;current:number|null};formulaPreparation?:FormulaPreparation606;finalFormulaExpressions?:Record<string,string>;
    sourceInitialization:SourceInitialization606;
    preparedDefenseSets?:Record<string,string[]>;
    finalDefenseSets?:Record<string,string[]>;
    finalTrainingSets?:Record<string,string[]>;
    finalTraitStrings?:Record<string,string>;
    ruleFlags:SourceRuleFlags606;executionFlags?:SourceRuleFlags606;sourceFlags?:SourceRuleFlags606;system:Record<string,unknown>;conditions:ConditionPreparation606;globals:Record<string,Record<string,unknown>>;executionGlobals:Record<string,Record<string,unknown>>;equipment:EquipmentPreparation;
    initialized:Array<{key:string;value:number;origin:'schema-default'}>;plan:EffectPlan;reason?:string;modes:Record<string,EffectModeState>;executionModes:Record<string,EffectModeState>;executionBonuses:Record<string,number>;finalNumbers:Record<string,number>;checkExecutionReason?:string;
    applied:Array<{effectId:string;itemId?:string;key:string;phase:'initial'|'final';before:number|string|string[]|boolean;value:number|string|string[]|boolean;formula?:string;delta?:string[];initializedFrom?:'source'|'default'|'null-cleaned';operandPhase?:'prepared'|'final'}>;
}
/** Qualified initial numeric/defense/training trait fields. This detached initialized operand
 * set is never persisted or passed back as raw source. Global proficiency
 * starts at verified0 despite stale nonpersisted source values (DD-R04).
 * Constant FormulaFields retain their numeric receipts;qualified check bonus
 * expressions compose as text before phase-specific deterministic folding.
 * Qualified final mode changes have a separate
 * execution snapshot, as do final global proficiency NumberFields and qualified
 * constant roll bonuses, persisted numeric fields and literal custom Strings. Earlier
 * prepared proficiency/passive operands never change; other final/Item fields stay gated. */
export function prepareNumericEffects606(actor:unknown,context?:RulesContext):NumericEffects {
    const source=record(actor)??{},initializedSource=initializeCheckSource606(source.system),system=initializedSource.system,sourceInitialization=initializedSource.initialization,plan=planEffects606(actor);
    if(system.attributes===undefined)system.attributes={};
    const classes=initializeClassFacts606(actor),base=classes.status==='ready'?classes.proficiency:null,proficiency={base,prepared:base,current:base},attributes=record(system.attributes);
    if(attributes)attributes.prof=base;
    const globals=initializedAbilityRolls606(actor),applied:NumericEffects['applied']=[];
    const initialized:NumericEffects['initialized']=sourceInitialization.defaults.filter(entry=>entry.path.endsWith('.proficient')).map(entry=>({key:'system.'+entry.path,value:entry.value as number,origin:'schema-default'}));
    for(const key of ['str','dex','con','int','wis','cha']){
        const ability=record(record(system.abilities)?.[key]);
        if(ability&&ability.proficient===undefined){
            const value=initializedSaveProficiency606(ability);
            if(value!==null){ability.proficient=value;initialized.push({key:`system.abilities.${key}.proficient`,value,origin:'schema-default'});}
        }
    }
    const sourceFlags=sourceRuleFlags606(actor),ruleFlags={...sourceFlags};
    let reason=plan.reason??ruleFlags.reason;
    const formulas:Record<string,string>={},modes:Record<string,EffectModeState>={};
    const origins:Record<string,'source'|'default'|'null-cleaned'>={};
    const customConditionReason=customStringConditionReason606(actor,plan.conditions??[],[...plan.initial,...plan.final]);
    function target(change:Pick<EffectChange,'key'>):{object:Record<string,unknown>;field:string;integer?:boolean;min?:number;max?:number;step?:number;choices?:number[];formula?:boolean;mode?:boolean;set?:boolean;string?:boolean;valid?:(value:string)=>boolean}|null {
        const keys=change.key.split('.');if(keys[0]!=='system')return null;
        if(change.key==='system.attributes.prof'&&attributes)return {object:attributes,field:'prof'};
        if(keys[1]==='traits'){
            const key=keys[2],field=keys[3];
            const training=trainingSetField606(keys.slice(2).join('.'));
            const set=Boolean(training)||keys.length===4&&(['dr','di','dv','ci'].includes(key)&&field==='value'||['dr','di','dv','dm'].includes(key)&&field==='bypasses');
            const amount=key==='dm'&&keys.length===5&&field==='amount'&&Object.hasOwn(DAMAGE_LABELS_606,keys[4]);
            const string=customTraitPath606(change.key);
            if(!set&&!amount&&!string)return null;
            let container=system;
            for(const part of keys.slice(1,-1)){
                if(container[part]==null)container[part]={};
                const child=record(container[part]);if(!child)return null;container=child;
            }
            const name=keys.at(-1)!;
            if(string){origins[change.key]??=container[name]===undefined?'default':'source';return {object:container,field:name,string:true};}
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
        if(change.type.startsWith('dnd5e.'))continue;
        if(change.key.startsWith('flags.')){const result=applyBooleanFlag606(ruleFlags,change);if('reason'in result)reason??=result.reason;else applied.push({effectId:change.effectId,...(typeof change.itemId==='string'?{itemId:change.itemId}:{}),key:change.key,phase:'initial',...result});continue;}
        const field=target(change),raw=change.value;
        if(field?.string){
            // C71 qualifies identified, eligible transferred Items in the
            // condition-free INITIAL phase only. Item final preparation and
            // Item/condition composition remain separate qualifications.
            const itemReason=change.itemId===null||change.itemId===''?'Initial custom String owned Item identity unavailable':change.itemId!==undefined&&plan.conditions?.length?'Item custom String condition composition requires qualification':undefined;
            if(itemReason||customConditionReason){reason??=itemReason??customConditionReason;continue;}
            const before=initializeCustomString606(field.object[field.field]),value=before===null?null:applyCustomString606(before,change.type,raw);
            if(value===null){reason??=`Initial custom String source/delta/operation requires qualification: ${change.key}`;continue;}
            field.object[field.field]=value;
            applied.push({effectId:change.effectId,...(typeof change.itemId==='string'?{itemId:change.itemId}:{}),key:change.key,phase:'initial',before:before!,value,initializedFrom:origins[change.key]});continue;
        }
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
        if(field?.formula&&checkBonusPath606(change.key)&&(typeof before!=='number'||delta===null||!['add','subtract','override'].includes(change.type))){
            const expression=composeFormulaEffect606(operand,raw,change.type);
            if(expression===null){reason??=`FormulaField expression/source/operation requires qualification: ${change.key}`;continue;}
            field.object[field.field]=expression;formulas[change.key]=expression;
            applied.push({effectId:change.effectId,key:change.key,phase:'initial',before:typeof operand==='number'?operand:String(operand??''),value:expression,formula:expression});continue;
        }
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
    proficiency.prepared=typeof attributes?.prof==='number'?attributes.prof:null;proficiency.current=proficiency.prepared;
    // Native Diamond Soul assigns save proficiency during ability preparation,
    // after initial effects and before cached saves/final fields.
    if(ruleFlags.diamondSoul)for(const key of ['str','dex','con','int','wis','cha']){const ability=record(record(system.abilities)?.[key]);if(ability)ability.proficient=1;}
    // Common.prepareAbilities mutates condition counts after initial effects and
    // before skill/tool passives. Keep this provenance separate from initial writes.
    let conditions=prepareConditions606(actor,system,plan.conditions??[],reason,plan.baseStatuses??[]);
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
    // Modern Remarkable Athlete adds Athletics advantage,not legacy half prof.
    if(ruleFlags.remarkableAthlete){
        const key='system.skills.ath.roll.mode',field=target({key});
        const state=field?modes[key]??initializedModeState(field.object[field.field]):null;
        if(!field||!state||applyEffectMode(state,'add',1)===null)reason??='Remarkable Athlete skill mode preparation unavailable';
        else {field.object[field.field]=resolvedEffectMode(state);modes[key]=state;}
    }
    // Native passives and initiative scores precede armor/initiative/final modes.
    // Keep their earlier count state separate; never move a final effect to initial.
    const executionFlags={...ruleFlags},executionModes=structuredClone(modes),executionGlobals=structuredClone(globals),executionBonuses:Record<string,number>={},finalNumbers:Record<string,number>={},equipment=prepareEquipment606(actor);
    const finalFormulaExpressions:Record<string,string>={};
    let checkExecutionReason:string|undefined;
    let preparedDefenseSets:Record<string,string[]>|undefined,finalDefenseSets:Record<string,string[]>|undefined;
    const finalTrainingSets:Record<string,string[]>={};
    const finalTraitStrings:Record<string,string>={};
    const changedDefenseSets=new Set<string>();
    function addExecutionMode(key:string,delta:number){
        const field=target({key});
        if(!field?.mode)return false;
        const state=executionModes[key]??initializedModeState(field.object[field.field]);
        if(!state||applyEffectMode(state,'add',delta)===null)return false;
        executionModes[key]=state;return true;
    }
    if(equipment.armor?.stealthDisadvantage&&Object.hasOwn(record(system.skills)??{},'ste')&&!addExecutionMode('system.skills.ste.roll.mode',-1))checkExecutionReason='Equipped armor Stealth mode source malformed';
    for(const modifier of conditions.modes)if(modifier.phase==='initiative')addExecutionMode(modifier.path,modifier.mode);
    if(ruleFlags.remarkableAthlete&&!addExecutionMode('system.attributes.init.roll.mode',1))checkExecutionReason??='Remarkable Athlete initiative mode preparation unavailable';
    for(const change of plan.final){
        if(change.type.startsWith('dnd5e.'))continue;
        if(change.key.startsWith('flags.')){const itemReason=change.itemId!==undefined?featFinalCustomReason606(actor,change.itemId,Boolean(plan.conditions?.length)):undefined;if(itemReason){reason??=itemReason;continue;}const result=applyBooleanFlag606(executionFlags,change);if('reason'in result)reason??=result.reason;else applied.push({effectId:change.effectId,...(typeof change.itemId==='string'?{itemId:change.itemId}:{}),key:change.key,phase:'final',...result});continue;}
        const field=target(change),raw=change.value,delta=(typeof raw==='number'||typeof raw==='string'&&raw.trim()!=='')?numericConstant(raw):null;
        if(change.itemId!==undefined){
            const itemReason=field?.string?featFinalCustomReason606(actor,change.itemId,Boolean(plan.conditions?.length)):'Transferred Item final phase requires qualification';
            if(itemReason){reason??=itemReason;continue;}
        }
        if(field?.string){
            if(conditions.status!=='ready'||customConditionReason){reason??=customConditionReason??'Final custom String condition preparation unavailable';continue;}
            const previous=Object.hasOwn(finalTraitStrings,change.key),before=previous?finalTraitStrings[change.key]:initializeCustomString606(field.object[field.field]);
            const value=before===null?null:applyCustomString606(before,change.type,raw);
            if(value===null){reason??=`Final custom String source/delta/operation requires qualification: ${change.key}`;continue;}
            finalTraitStrings[change.key]=value;
            applied.push({effectId:change.effectId,...(typeof change.itemId==='string'?{itemId:change.itemId}:{}),key:change.key,phase:'final',before:before!,value,operandPhase:previous?'final':'prepared',initializedFrom:origins[change.key]});continue;
        }
        const training=change.key.startsWith('system.traits.')?trainingSetField606(change.key.slice('system.traits.'.length)):null;
        if(training&&field?.set){
            const previous=Object.hasOwn(finalTrainingSets,change.key),before=previous?finalTrainingSets[change.key]:initializeTraitSet606(field.object[field.field]);
            const result=before?applyTraitSet606(before,change.type,raw,training):null;
            if(!before||!result){reason??=`Final training Set operation/source/value requires qualification: ${change.key}`;continue;}
            finalTrainingSets[change.key]=result.value;
            applied.push({effectId:change.effectId,key:change.key,phase:'final',operandPhase:previous?'final':'prepared',before:[...before],value:[...result.value],delta:result.delta,initializedFrom:origins[change.key]});
            continue;
        }
        if(/^system\.traits\.(?:(?:dr|di|dv|ci)\.value|(?:dr|di|dv|dm)\.bypasses)$/.test(change.key)&&field?.set&&field.valid){
            const conditional=conditions.sources.length>0||conditions.actorStatuses.length>0;
            const ciOnly=change.key==='system.traits.ci.value'&&conditions.sources.length===1&&conditions.sources.every(source=>['poisoned','exhaustion'].includes(source.type)&&source.condition.matches)&&!plan.initial.some(change=>change.key==='system.traits.ci.value');
            // C63 qualifies one explicitly serialized petrified status. Do not
            // infer incapacitation/presets, replay grants, or admit mixed queries.
            const petrified=conditions.sources.length===1&&conditions.sources.every(source=>source.type==='petrified'&&source.condition.matches&&source.statuses.length===1&&source.statuses[0]==='petrified')
                &&conditions.actorStatuses.length===1&&conditions.actorStatuses[0]==='petrified'&&conditions.traitGrant?.status==='ready'
                &&!plan.initial.some(change=>/^system\.traits\.(dr|di|dv|ci|dm)\./.test(change.key));
            if(conditions.status!=='ready'||conditional&&!ciOnly&&!petrified){reason??='Final defense Sets with this condition preparation require qualification';continue;}
            if(!finalDefenseSets){const snapshot=preparedDefenseSets606(system);if(snapshot.reason){reason??=snapshot.reason;continue;}preparedDefenseSets=snapshot.fields;finalDefenseSets=structuredClone(snapshot.fields);}
            const before=finalDefenseSets[change.key],result=applyTraitSet606(before,change.type,raw,field.valid);
            if(!result){reason??=`Final defense Set operation/value requires qualification: ${change.key}`;continue;}
            if(conditional&&change.key==='system.traits.ci.value'&&[...before,...result.delta,...result.value].some(value=>!(petrified?['poisoned','diseased','stunned']:['poisoned','exhaustion']).includes(value.trim()))){reason??='Final CI with these condition/immunity identities requires qualification';continue;}
            finalDefenseSets[change.key]=result.value;
            applied.push({effectId:change.effectId,key:change.key,phase:'final',operandPhase:changedDefenseSets.has(change.key)?'final':'prepared',before:[...before],value:[...result.value],delta:result.delta});
            changedDefenseSets.add(change.key);continue;
        }
        if(change.key==='system.attributes.prof'&&field){
            const before=proficiency.current,value=typeof before==='number'&&delta!==null?applyNumericFieldChange(before,delta,change.type,field):null;
            if(value===null){reason??='Final Actor proficiency effect delta/operation requires qualification';continue;}
            proficiency.current=value;applied.push({effectId:change.effectId,key:change.key,phase:'final',before:before!,value});continue;
        }
        const number=/^system\.(?:abilities\.(?:str|dex|con|int|wis|cha)\.(?:value|proficient)|(?:skills|tools)\.[^.]+\.value)$/.test(change.key);
        if(number&&field&&!field.formula&&!field.mode&&!field.set){
            const rawAbilityRolls=record(record(system.rolls)?.ability);
            if(ruleFlags.reason||[system.rolls,record(system.rolls)?.ability,...['check','save','skill','tool'].map(key=>rawAbilityRolls?.[key])].some(value=>value!=null&&!record(value))){reason??='Final prepared numeric operands require flag/roll-container qualification';continue;}
            const previous=Object.hasOwn(finalNumbers,change.key),keys=change.key.split('.');
            let before:unknown=previous?finalNumbers[change.key]:field.object[field.field];
            if(!previous&&keys[1]==='abilities'&&keys[3]==='proficient')before=saveProficiency606(before,globals.save.proficiency);
            if(!previous&&['skills','tools'].includes(keys[1]))before=checkProficiency606(sourceCheckCoefficient606(before),undefined,[keys[1]==='skills'?'skill':'tool'],{check:globals.check.proficiency,skill:globals.skill.proficiency,tool:globals.tool.proficiency},ruleFlags.jackOfAllTrades,ruleFlags.toolExpertise);
            if(typeof before==='number'&&(field.integer&&!Number.isInteger(before)||field.min!==undefined&&before<field.min||field.max!==undefined&&before>field.max))before=null;
            const value=typeof before==='number'&&Number.isFinite(before)&&delta!==null&&Math.abs(delta)<=1_000_000_000?applyNumericFieldChange(before,delta,change.type,field):null;
            if(value===null){reason??=`Final prepared numeric operation/source/value requires qualification: ${change.key}`;continue;}
            finalNumbers[change.key]=value;applied.push({effectId:change.effectId,key:change.key,phase:'final',operandPhase:previous?'final':'prepared',before:before as number,value});continue;
        }
        const bonus=/^system\.(?:rolls\.ability\.(?:check|save|skill|tool)\.bonus|abilities\.(?:str|dex|con|int|wis|cha)\.(?:check|save)\.roll\.bonus|(?:skills|tools)\.[^.]+\.roll\.bonus|attributes\.init\.roll\.bonus|skills\.[^.]+\.bonuses\.passive)$/.test(change.key);
        if(bonus&&field?.formula){
            const original=field.object[field.field];
            if(Object.hasOwn(finalFormulaExpressions,change.key)||numericConstant(original)===null||delta===null||!['add','subtract','override'].includes(change.type)){
                const before=finalFormulaExpressions[change.key]??formulas[change.key]??original,expression=composeFormulaEffect606(before,raw,change.type);
                if(expression===null){reason??=`Final FormulaField expression/source/operation requires qualification: ${change.key}`;continue;}
                finalFormulaExpressions[change.key]=expression;formulas[change.key]=expression;
                applied.push({effectId:change.effectId,key:change.key,phase:'final',before:typeof before==='number'?before:String(before??''),value:expression,formula:expression});continue;
            }
            const operand=field.object[field.field],before=executionBonuses[change.key]??numericConstant(operand);
            const value=before!==null&&operand!==null&&delta!==null&&qualifiedNumericTotal(delta)&&['add','subtract','override'].includes(change.type)?applyNumericFieldChange(before,delta,change.type,field):null;
            if(value===null||!qualifiedNumericTotal(value)){reason??=`Final constant bonus operation/source/value requires qualification: ${change.key}`;continue;}
            const previous=formulas[change.key]??(operand===undefined?'':String(operand).trim()),deltaText=String(raw).trim();
            const formula=change.type==='override'?deltaText:change.type==='subtract'?(previous?`${previous} - (${deltaText})`:`-(${deltaText})`):previous?`${previous} ${deltaText.startsWith('-')?'-':'+'} ${deltaText.replace(/^[+-]/,'').trim()}`:deltaText;
            executionBonuses[change.key]=value;formulas[change.key]=formula;
            applied.push({effectId:change.effectId,key:change.key,phase:'final',before:before!,value,formula});continue;
        }
        const proficiencyTarget=/^system\.rolls\.ability\.(check|save|skill|tool)\.proficiency$/.exec(change.key);
        if(proficiencyTarget&&field?.choices){
            const target=executionGlobals[proficiencyTarget[1]],before=target.proficiency;
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
    if(finalDefenseSets)conditions=currentConditionImmunities606(conditions,finalDefenseSets['system.traits.ci.value']);
    if(reason&&!conditions.reason){conditions.status='unavailable';conditions.reason=reason;}
    const result:NumericEffects={proficiency,finalFormulaExpressions,sourceInitialization,sourceFlags,ruleFlags,executionFlags,system,conditions,globals,executionGlobals,plan,applied,modes,executionModes,executionBonuses,finalNumbers,preparedDefenseSets,finalDefenseSets,finalTrainingSets,finalTraitStrings,checkExecutionReason,initialized,equipment,...(reason?{reason}:{})};
    return context?prepareFormulaFields606(actor,context,result):result;
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
