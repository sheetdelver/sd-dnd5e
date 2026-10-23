import {halflingExecutionReason606,type SourceRuleFlags606} from './rule-flags';
import {configureRules606,ruleSnapshot606,ruleScopes606,type RuleSnapshot606} from './applied-rules';
import {proficiencyDiceTerm606} from './proficiency-term';
import {executionFormulaContext606} from './formula-fields';
import {checkProficiency606,sourceCheckCoefficient606} from './proficiency';
import { numericAbilityValue } from './numeric';
import type { EffectModeState } from './mode-effects';
import { prepareNumericEffects606, type NumericEffects } from './numeric-effects';
import { record } from '../native/6.0.6/source';
import type { RulesContext } from '../rules-context';
import { characterFacts606,numericCharacterProfile, numericConstant, qualifiedNumericTotal } from './character-profile';
import { SKILL_LABELS, TOOL_LABELS_606 } from './check-identities';
import { sourceD20Mode, prepareD20Configuration, numericD20Roll,numericScopeBonus,preparedBonusNote, type PreparedNumericD20 } from './d20-configuration';

export type SkillToolKind = 'skill' | 'tool';
interface Entry { ability:string; prof:number|null; label:string; roll:unknown; reason?:string; primaryReason?:string; passiveBonus?:number|null }
interface Ability { score:number|null;mod:number|null; roll:unknown; reason?:string }
/** Detached, revision-owned operands from source + verified initialization.
 * Initial qualified field effects are separate from raw source. No source
 * references, unqualified prepared totals or browser world cache. */
export interface SkillToolModel {
    currentProficiency?:number|null;currentProficiencyReason?:string;executionFlags?:SourceRuleFlags606;currentValues?:Record<string,number>;rules:RuleSnapshot606;preparedFormulaBindings:Record<string,number>;proficiencyMode:'bonus'|'dice';formulaContext:ReturnType<typeof executionFormulaContext606>;
    halflingLucky?:boolean;reliableTalent?:boolean;jackOfAllTrades:boolean;toolExpertise?:boolean;observantFeat?:boolean;reason?:string; proficiency:number|null;rollReduction:number;modeStates:Record<string,EffectModeState>;executionModeStates:Record<string,EffectModeState>;
    abilities:Record<string,Ability>; skills:Record<string,Entry>; tools:Record<string,Entry>;
    proficiencies:Record<'check'|'skill'|'tool',number>;
    executionProficiencies:Record<'check'|'skill'|'tool',number>;
    executionBonuses:Record<string,number>;
    globals:Record<'check'|'skill'|'tool',unknown>;
}
export interface ConfiguredCheck extends PreparedNumericD20 {label:string; prof:number|null; automaticAdvantage?:boolean;passiveMode?:-1|0|1}
export function skillToolRoll(model:SkillToolModel,kind:SkillToolKind,key:string,options:Record<string,unknown>={}):string|null {
    if (!record(options)) return null;
    return numericD20Roll(configureSkillToolCheck(model,kind,key,options),{advantage:options.advantage,situationalBonus:options.situationalBonus});
}
const abilityKeys = ['str','dex','con','int','wis','cha'];
// Keep only persisted roll operands; modeCounts and proficiency targets are not
// source overrides (DD-R04). Null/absent roll defaults are handled separately.
function rollInput(value:unknown):unknown {
    if (value == null) return null;
    const data=record(value);
    return data ? Object.fromEntries(['bonus','mode','min','max'].filter(key=>data[key]!==undefined).map(key=>[key,structuredClone(data[key])])) : false;
}
export function prepareSkillToolModel606(actor:unknown, context:RulesContext,effects:NumericEffects=prepareNumericEffects606(actor,context)):SkillToolModel {
    const system=effects.system, profile=numericCharacterProfile(actor,context,effects,true,true);
    let reason=(profile.status==='ready'?undefined:profile.reason)??effects.checkExecutionReason;
    const rawGlobals=effects.globals,sourceGlobals=record(record(system.rolls)?.ability)??{};
    if ([system.rolls,record(system.rolls)?.ability].some(value=>value!=null&&!record(value))) reason ??= 'Roll source container malformed';
    const abilities=Object.fromEntries(abilityKeys.map(key=>{
        const raw=record(record(system.abilities)?.[key]), check=raw?.check, numeric=numericAbilityValue(raw?.value);
        return [key,{score:numeric?.score??null,mod:numeric?.mod??null,
            roll:rollInput(record(check)?.roll),...(check!=null&&!record(check)?{reason:'Ability check source container malformed'}:{})}];
    }));
    function entries(kind:SkillToolKind):Record<string,Entry> {
        const raw=record(system[kind+'s']) ?? {}, labels=kind==='skill'?SKILL_LABELS:TOOL_LABELS_606;
        return Object.fromEntries(Object.entries(raw).map(([key,value])=>{
            const data=record(value), multiplier=data?.value===undefined&&kind==='tool'?0:data?.value;
            const ability=data?.ability===undefined&&kind==='tool'?'int':typeof data?.ability==='string'?data.ability:'';
            const prof=sourceCheckCoefficient606(multiplier),valid=prof!==null;
            const error=!data?`${kind==='skill'?'Skill':'Tool'} source entry malformed`:!Object.hasOwn(labels,key)?`${kind} identity outside qualified native configuration`:!valid?`${kind==='skill'?'Skill':'Tool'} proficiency source unavailable`:undefined;
            const rawPassive=numericConstant(record(data?.bonuses)?.passive),passiveBonus=rawPassive===null?null:rawPassive+(effects.ruleFlags.observantFeat&&['prc','inv'].includes(key)?5:0);
            return [key,{ability,prof,label:Object.hasOwn(labels,key)?labels[key]:key,roll:rollInput(data?.roll),
                ...(error?{reason:error}:{}),...(kind==='skill'?{passiveBonus,...(record(data?.bonuses)?.check||passiveBonus===null?{primaryReason:'Skill formula requires Q00 qualification'}:{})}:{})}];
        }));
    }
    const current=characterFacts606(actor,context,effects).proficiency;
    const executionModeStates=structuredClone(effects.executionModes);
    return {currentProficiency:current.value,currentProficiencyReason:current.reason,executionFlags:{...(effects.executionFlags??effects.ruleFlags)},currentValues:{...effects.finalNumbers},rules:ruleSnapshot606(effects.plan),preparedFormulaBindings:{...effects.formulaPreparation?.preparedBindings},proficiencyMode:profile.status==='ready'?profile.proficiencyMode:'bonus',formulaContext:executionFormulaContext606(effects),halflingLucky:effects.ruleFlags.halflingLucky,reliableTalent:effects.ruleFlags.reliableTalent,jackOfAllTrades:effects.ruleFlags.jackOfAllTrades,toolExpertise:effects.ruleFlags.toolExpertise,observantFeat:effects.ruleFlags.observantFeat,reason,rollReduction:effects.conditions.rollReduction,modeStates:structuredClone(effects.modes),executionModeStates,executionBonuses:structuredClone(effects.executionBonuses),proficiencies:{check:effects.globals.check.proficiency as number,skill:effects.globals.skill.proficiency as number,tool:effects.globals.tool.proficiency as number},executionProficiencies:{check:effects.executionGlobals.check.proficiency as number,skill:effects.executionGlobals.skill.proficiency as number,tool:effects.executionGlobals.tool.proficiency as number},proficiency:profile.status==='ready'?profile.proficiency:null,abilities,skills:entries('skill'),tools:entries('tool'),
        globals:Object.fromEntries(['check','skill','tool'].map(key=>[key,sourceGlobals[key]!=null&&!record(sourceGlobals[key])?false:rollInput(rawGlobals[key])])) as SkillToolModel['globals']};
}
/** Native fresh #rollSkillTool + _buildSkillToolConfig source-only profile.
 * Only primary local/global type scopes contribute. Secondary supplies its
 * qualified proficiency and positive-prof advantage, never bonuses/modes.
 * Each module selection configures a new request, not an in-place native form. */
export function configureSkillToolCheck(model:SkillToolModel,kind:SkillToolKind,key:string,options:Record<string,unknown>={},phase:'prepared'|'execution'='execution'):ConfiguredCheck {
    if (!record(options)||typeof key!=='string') return {ability:'',label:'Check',prof:null,total:null,formula:null,unavailableReason:'Check options or identity malformed'};
    const entries=model[kind+'s' as 'skills'|'tools'];
    const primary=Object.hasOwn(entries,key)?entries[key]:undefined;
    let reason=model.reason ?? primary?.reason ?? primary?.primaryReason;
    if(!model.executionFlags)reason??='Current flag preparation unavailable;current preparation required';
    if(!model.formulaContext)reason??='Formula execution context unavailable;current preparation required';
    const unknown=Object.keys(options).find(key=>!['skill','tool','ability','advantage','situationalBonus','rollMode','speaker'].includes(key));
    if (unknown) reason ??= `Check option requires qualification: ${unknown}`;
    const other=kind==='skill'?'tool':'skill', selected=options[other];
    if (!primary) reason ??= `Selected ${kind} source unavailable`;
    if (options[kind]!==undefined&&options[kind]!==key) reason ??= `Primary ${kind} identity mismatch`;
    if (options.pace!==undefined) reason ??= 'Travel pace requires qualification';
    let secondary:Entry|undefined;
    if (selected!==undefined&&selected!=='') {
        if (typeof selected!=='string'||!Object.hasOwn(model[other+'s' as 'skills'|'tools'],selected)) reason ??= `Selected ${other} source unavailable`;
        else { secondary=model[other+'s' as 'skills'|'tools'][selected]; reason ??= secondary.reason; }
    }
    const ability=options.ability===undefined||options.ability===''?primary?.ability:options.ability;
    const abilityId=typeof ability==='string'?ability:'', data=model.abilities[abilityId];
    if (!abilityKeys.includes(abilityId)||!data||data.score===null||data.mod===null) reason ??= 'Ability source score unavailable';
    reason ??= data?.reason;
    const scopes=[{path:`${kind}s.${key}.roll`,value:primary?.roll},{path:`abilities.${abilityId}.check.roll`,value:data?.roll},
        {path:'rolls.ability.check',value:model.globals.check},{path:`rolls.ability.${kind}`,value:model.globals[kind]}];
    const targets=phase==='prepared'?model.proficiencies:model.executionProficiencies;
    // Native #rollSkillTool checks the earlier prepared prof objects for automatic
    // advantage. Its fresh builder independently reads current global targets.
    const independentProf=(entry:Entry|undefined,type:SkillToolKind)=>checkProficiency606(entry?.prof,undefined,[type],model.proficiencies,model.jackOfAllTrades,model.toolExpertise);
    const primaryPrepared=independentProf(primary,kind),secondaryPrepared=secondary?independentProf(secondary,other):null;
    const automaticAdvantage=!!secondary&&primaryPrepared!==null&&secondaryPrepared!==null&&primaryPrepared>0&&secondaryPrepared>0;
    const qualifiedScopes=scopes.map(scope=>({...scope,effectMode:model.modeStates['system.'+scope.path+'.mode']}));
    const executionScopes=scopes.map(scope=>({...scope,effectMode:model.executionModeStates['system.'+scope.path+'.mode']}));
    const selectedTypes:SkillToolKind[]=secondary?[kind,other]:[kind];
    const prof=checkProficiency606(primary?.prof,secondary?.prof,selectedTypes,targets,phase==='execution'?model.executionFlags?.jackOfAllTrades:model.jackOfAllTrades,phase==='execution'?model.executionFlags?.toolExpertise:model.toolExpertise);
    const baseProficiency=phase==='execution'?model.currentProficiency:model.proficiency;
    if(baseProficiency==null)reason??=model.currentProficiencyReason??'Current Actor proficiency preparation unavailable';
    const formulaContext={expressions:model.formulaContext?.expressions??{},bindings:{...model.formulaContext?.bindings}};
    if(model.proficiencyMode==='dice')delete formulaContext.bindings.prof;
    else if(prof!==null&&baseProficiency!=null)formulaContext.bindings.prof=prof>0?Math.floor(baseProficiency*prof):baseProficiency;
    else delete formulaContext.bindings.prof;
    const ruleRoll={ability:abilityId,proficient:(prof??0)>=1,type:kind,[kind]:key};
    const rules=configureRules606(model.rules,'check',ruleRoll,phase==='prepared'?model.preparedFormulaBindings:formulaContext.bindings,phase,phase==='prepared'?model.preparedFormulaBindings:model.formulaContext?.bindings??{});
    const passiveRules=configureRules606(model.rules,'check',{...ruleRoll,proficient:(primaryPrepared??0)>=1},model.preparedFormulaBindings,'prepared');
    const primaryCurrent=model.currentValues?model.currentValues[`system.${kind}s.${key}.value`]??primaryPrepared:null;
    if(model.executionFlags?.reliableTalent&&phase==='execution'&&primaryCurrent===null)reason??='Current primary value preparation unavailable for Reliable Talent';
    const talentScope={path:'reliable-talent',value:{min:phase==='execution'&&model.executionFlags?.reliableTalent&&primaryCurrent!==null&&primaryCurrent>=1?10:undefined}};
    const ruleScope=ruleScopes606(rules),mode=sourceD20Mode([ruleScope,...executionScopes.slice(1),executionScopes[0]],automaticAdvantage);
    const passive=sourceD20Mode([ruleScopes606(passiveRules),qualifiedScopes[1],qualifiedScopes[0],...qualifiedScopes.slice(2)],false,'passive');
    reason??=rules.reason??passiveRules.reason??mode.reason??passive.reason;
    const bonuses=scopes.map(scope=>numericScopeBonus(scope,phase==='execution'?model.executionBonuses:{},phase==='execution'?formulaContext:undefined));
    if (bonuses.some(value=>value===null)) reason ??= `${kind==='skill'?'Skill':'Tool'} formula requires Q00 qualification`;
    const base={ability:abilityId,label:primary?.label??key,automaticAdvantage};
    if (reason||!primary||primary.prof===null||baseProficiency==null||mode.mode===undefined||data?.score==null||data.mod===null) return {...base,prof:null,total:null,formula:null,unavailableReason:reason??'Check preparation unavailable'};

    if(prof===null)return {...base,prof:null,total:null,formula:null,unavailableReason:'Check proficiency operands unavailable'};
    const flat=Math.floor(baseProficiency*prof),proficiencyTerm=model.proficiencyMode==='dice'&&prof>0?proficiencyDiceTerm606(baseProficiency,prof)??undefined:undefined;
    const total=rules.bonus+data.mod+(model.proficiencyMode==='dice'?0:flat)+(bonuses as number[]).reduce((a,b)=>a+b,0)+model.rollReduction;
    if (!qualifiedNumericTotal(total)) return {...base,prof,total:null,formula:null,unavailableReason:'Numeric result outside qualified roll representation'};
    return {...base,prof,total,preparedPassiveBase:total+(model.proficiencyMode==='dice'?flat:0),proficiencyMode:model.proficiencyMode,...(proficiencyTerm?{proficiencyTerm}:{}),sourceMode:mode.mode,passiveMode:passive.mode,...prepareD20Configuration(total,mode.mode,[ruleScope,talentScope,...scopes],0,true,proficiencyTerm),...(phase==='execution'&&halflingExecutionReason606(model.executionFlags??{})?{formula:null,unavailableReason:halflingExecutionReason606(model.executionFlags??{})}:{})};
}

/** Default independent projection retains the native earlier snapshot alongside
 * the current execution bonus. Both use this compiler; UI only renders the note. */
export function projectSkillToolCheck(model:SkillToolModel,kind:SkillToolKind,key:string){
    const current=configureSkillToolCheck(model,kind,key),prepared=configureSkillToolCheck(model,kind,key,{},'prepared');
    const preparationNote=preparedBonusNote(prepared.total,current.total,prepared.prof,current.prof);
    return {...current,passiveMode:prepared.passiveMode,preparedPassiveBase:prepared.preparedPassiveBase,preparedTotal:prepared.total,preparedProf:prepared.prof,...(preparationNote?{preparationNote}:{})};
}
