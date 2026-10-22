import {halflingExecutionReason606} from './rule-flags';
import {configureRules606,ruleSnapshot606,ruleScopes606} from './applied-rules';
import {preparedFormulaBindings606} from './formula-fields';
import {executionFormulaContext606} from './formula-fields';
import {record} from '../native/6.0.6/source';
import type {RulesContext} from '../rules-context';
import {numericFact,numericCharacterProfile,type NumericFact} from './character-profile';
import {numericAbilityValue,numericConstant,qualifiedNumericTotal} from './numeric';
import {prepareNumericEffects606,type NumericEffects} from './numeric-effects';
import {initializedModeState,resolvedEffectMode,applyEffectMode} from './mode-effects';
import {sourceD20Mode,prepareD20Configuration,numericD20Roll,numericScopeBonus,preparedBonusNote,type PreparedNumericD20} from './d20-configuration';
export interface ArmorClassFact extends NumericFact {calculation?:string;formula?:string;base?:number;armorId?:string;shieldId?:string;warnings?:string[]}
export interface InitiativeFact extends NumericFact {ability:string;score:number|null;fixed?:boolean;tiebreaker?:number;roll?:NumericFact;preparationNote?:string}
const acProvenance='release-6.0.6 AttributesFields.armorClass / prepareArmorClass / CONFIG.armorClasses';
const initProvenance='release-6.0.6 prepareInitiative / Actor.getInitiativeRollConfig / getInitiativeRoll';
const makeAc=(value:number|null,reason?:string):ArmorClassFact=>({...numericFact(value,reason),provenance:acProvenance});
/** Canonical configuration IDs/expressions, not item/display-name inference.
 * Exact registry shape/order is checked by the independent source oracle. */
const armorCalculations=[
    {id:'natural',formula:'@attributes.ac.flat',abilities:[],base:0},
    {id:'armored',formula:'@attributes.ac.armor + @attributes.ac.clamped.dex',abilities:['dex'],base:0,armored:true},
    {id:'unarmored',formula:'10 + @abilities.dex.mod',abilities:['dex'],base:10,armored:false},
    {id:'mage',formula:'13 + @abilities.dex.mod',abilities:['dex'],base:13,armored:false},
    {id:'draconic',formula:'13 + @abilities.dex.mod',abilities:['dex'],base:13,armored:false},
    {id:'unarmoredMonk',formula:'10 + @abilities.dex.mod + @abilities.wis.mod',abilities:['dex','wis'],base:10,armored:false,shielded:false},
    {id:'unarmoredBarb',formula:'10 + @abilities.dex.mod + @abilities.con.mod',abilities:['dex','con'],base:10,armored:false},
    {id:'unarmoredBard',formula:'10 + @abilities.dex.mod + @abilities.cha.mod',abilities:['dex','cha'],base:10,armored:false},
];
function basicReason(actor:unknown,context:RulesContext,effects:NumericEffects):string|undefined {
    const source=record(actor)??{},system=effects.system,attributes=record(system.attributes)??{};
    if(context.status!=='supported'||context.profile!=='2024')return `Character rules context unavailable: ${context.reason??context.profile??'unknown'}`;
    if(source.type!=='character')return 'Character stat profile unavailable';
    if(effects.reason)return effects.reason;
    if(effects.ruleFlags.reason)return effects.ruleFlags.reason;
    if(attributes.exhaustion!==undefined&&attributes.exhaustion!==0||Array.isArray(source.statuses)&&source.statuses.length)return 'Condition stat preparation unavailable';
    return undefined;
}
export function prepareArmorClass606(actor:unknown,context:RulesContext,effects:NumericEffects=prepareNumericEffects606(actor,context)):ArmorClassFact {
    const reason=basicReason(actor,context,effects);if(reason)return makeAc(null,reason);
    const source=record(actor)??{},attributes=record(effects.system.attributes),raw=attributes?.ac,data=record(raw)??{};
    if(raw!=null&&!record(raw))return makeAc(null,'Armor class source mapping malformed');
    // These are read by native pre-initialization migration. They cannot be
    // silently ignored as current fields or trusted as prepared totals.
    if(data.value!==undefined||data.calc)return makeAc(null,'Legacy armor class source migration requires qualification');
    const override=data.override;
    if(override!=null){
        if(typeof override!=='number'||!Number.isInteger(override)||override<0||override>1_000_000_000)return makeAc(null,'Armor class override source malformed');
        return {...makeAc(override),calculation:'override',formula:'@attributes.ac.override'};
    }
    const equipment=effects.equipment;
    if(equipment.reason)return makeAc(null,equipment.reason);
    const armor=equipment.armor,shield=equipment.shield;
    const flat=data.flat==null?0:data.flat,calcs=data.calcs===undefined?['unarmored','armored']:data.calcs,formulas=data.formulas===undefined?[]:data.formulas;
    if(typeof flat!=='number'||!Number.isInteger(flat)||flat<0||flat>1_000_000_000||!Array.isArray(calcs)||calcs.some(id=>typeof id!=='string'||!armorCalculations.some(c=>c.id===id))||!Array.isArray(formulas))return makeAc(null,'Armor calculation source outside qualified profile');
    let base=-Infinity,calculation='natural',formula='@attributes.ac.flat';
    for(const config of armorCalculations){
        if(!calcs.includes(config.id)||'armored' in config&&config.armored!==!!armor||'shielded' in config&&config.shielded!==!!shield)continue;
        const mods=config.abilities.map(key=>numericAbilityValue(record(record(effects.system.abilities)?.[key])?.value)?.mod);
        if(mods.some(value=>value===undefined))return makeAc(null,`Ability source unavailable for armor calculation: ${config.id}`);
        const value=config.id==='natural'?flat:config.id==='armored'?armor!.value+(armor?.type==='heavy'?0:Math.min(mods[0]!,armor!.dex??Infinity)):config.base+(mods as number[]).reduce((n,v)=>n+v,0);
        if(value>base){base=value;calculation=config.id;formula=config.formula;}
    }
    for(const raw of formulas){
        const config=record(raw);if(!config)return makeAc(null,'Custom armor formula source malformed');
        if([config.armored,config.shielded].some(value=>value!=null&&typeof value!=='boolean'))return makeAc(null,'Custom armor eligibility source malformed');
        if(typeof config.armored==='boolean'&&config.armored!==!!armor||typeof config.shielded==='boolean'&&config.shielded!==!!shield)continue;
        if(config.formula===undefined||config.formula===null||config.formula==='')continue;
        const value=numericConstant(config.formula);if(value===null)return makeAc(null,'Custom armor expression requires Q00 qualification');
        if(value>base){base=value;calculation='custom';formula=String(config.formula);}
    }
    if(!Number.isFinite(base))base=flat;
    const value=Math.max(0,base+(shield?.value??0));
    return qualifiedNumericTotal(value)&&Math.abs(value)<=1_000_000_000?{...makeAc(value),base,calculation,formula,armorId:armor?.id,shieldId:shield?.id,warnings:equipment.warnings}:makeAc(null,'Armor result outside qualified numeric range');
}
export function prepareInitiative606(actor:unknown,context:RulesContext,effects:NumericEffects=prepareNumericEffects606(actor,context)):{fact:InitiativeFact;check:PreparedNumericD20} {
    const profile=numericCharacterProfile(actor,context,effects,effects.ruleFlags.initiativeAlert),system=effects.system,raw=record(system.attributes)?.init,data=record(raw)??{},ability=data.ability===undefined||data.ability===''?'dex':data.ability;
    const key=typeof ability==='string'?ability:'',abl=record(record(system.abilities)?.[key]),numeric=numericAbilityValue(abl?.value),roll=record(data.roll)??{},global=effects.globals.check;
    let reason=profile.status==='ready'?undefined:profile.reason;
    if(raw!=null&&!record(raw)||data.roll!=null&&!record(data.roll))reason??='Initiative source mapping malformed';
    if(data.value||data.bonus!==undefined)reason??='Legacy initiative source migration requires qualification';
    if(!['str','dex','con','int','wis','cha'].includes(key)||!numeric)reason??='Initiative ability source unavailable';
    const localMode=structuredClone(effects.modes['system.attributes.init.roll.mode']??initializedModeState(roll.mode));
    if(localMode)for(const modifier of effects.conditions.modes)if(modifier.phase==='initiative'&&modifier.path==='system.attributes.init.roll.mode')applyEffectMode(localMode,'add',modifier.mode);
    if(localMode&&effects.ruleFlags.remarkableAthlete)applyEffectMode(localMode,'add',1);
    if(!localMode)reason??='Initiative source mode malformed';
    const rawGlobal=record(record(record(record(actor)?.system)?.rolls)?.ability)?.check;
    const scopes=[{path:`abilities.${key}.check.roll`,value:record(abl?.check)?.roll},{path:'attributes.init.roll',value:data.roll},{path:'rolls.ability.check',value:rawGlobal!=null&&!record(rawGlobal)?false:global}].map(scope=>({...scope,effectMode:effects.executionModes['system.'+scope.path+'.mode']}));
    const ruleRoll={ability:key,proficient:effects.ruleFlags.initiativeAlert,type:'initiative'},snapshot=ruleSnapshot606(effects.plan),rules=configureRules606(snapshot,'check',ruleRoll,executionFormulaContext606(effects).bindings),preparedRules=configureRules606(snapshot,'check',ruleRoll,preparedFormulaBindings606(effects),'prepared');
    reason??=rules.reason??preparedRules.reason;
    const mode=sourceD20Mode([ruleScopes606(rules),...scopes]),bonuses=scopes.map(scope=>numericConstant(record(scope.value)?.bonus));
    reason??=mode.reason;
    if(bonuses.some(value=>value===null))reason??='Initiative bonus expression requires Q00 qualification';
    const proficiency=profile.status==='ready'&&effects.ruleFlags.initiativeAlert?profile.proficiency:0;
    const total=!reason&&numeric?preparedRules.bonus+numeric.mod+proficiency+(bonuses as number[]).reduce((n,v)=>n+v,0)+effects.conditions.rollReduction:null;
    if(total!==null&&!qualifiedNumericTotal(total))reason??='Initiative result outside qualified numeric representation';
    const score=total!==null&&!reason&&localMode?10+total+5*resolvedEffectMode(localMode):null;
    const fact:InitiativeFact={...numericFact(reason?null:total,reason),provenance:initProvenance,ability:key,score};
    if(fact.value!==null)fact.display=`${fact.value<0?'':'+'}${fact.value}`;
    let executionReason=reason;
    const executionBonuses=scopes.map(scope=>numericScopeBonus(scope,effects.executionBonuses,executionFormulaContext606(effects)));
    if(executionBonuses.some(value=>value===null))executionReason??='Initiative current bonus expression requires Q00 qualification';
    const executionTotal=!executionReason&&numeric?rules.bonus+numeric.mod+proficiency+(executionBonuses as number[]).reduce((n,v)=>n+v,0)+effects.conditions.rollReduction:null;
    const scoreSetting=context.settings['dnd5e.initiativeScore'],tie=context.settings['dnd5e.initiativeDexTiebreaker'];
    if(!scoreSetting||scoreSetting.status==='unavailable'||!['none','npcs','all'].includes(String(scoreSetting.value)))executionReason??='Initiative score setting unavailable';
    const fixed=scoreSetting?.status!=='unavailable'&&scoreSetting?.value==='all';
    if(!fixed)executionReason??=halflingExecutionReason606(effects.ruleFlags);
    if(!fixed&&(!tie||tie.status==='unavailable'||typeof tie.value!=='boolean'))executionReason??='Initiative tiebreaker setting unavailable';
    const currentScore=numeric?effects.finalNumbers[`system.abilities.${key}.value`]??numeric.score:null;
    const tiebreaker=!fixed&&tie?.status!=='unavailable'&&tie?.value===true&&currentScore!==null?currentScore/100:0;
    const bonus=fixed?score:executionTotal===null?null:executionTotal+tiebreaker;
    if(bonus!==null&&!qualifiedNumericTotal(bonus))executionReason??='Initiative roll result outside qualified numeric representation';
    fact.fixed=fixed;fact.tiebreaker=tiebreaker;
    const preparationNote=fixed?undefined:preparedBonusNote(total,executionTotal);
    if(preparationNote){fact.preparationNote=preparationNote;fact.roll={...numericFact(executionTotal),provenance:initProvenance};fact.roll.display=`${executionTotal!<0?'':'+'}${executionTotal}`;}
    const configuration=bonus!==null&&mode.mode!==undefined?prepareD20Configuration((fixed?score:executionTotal)!,fixed?0:mode.mode,[ruleScopes606(rules),...scopes],tiebreaker,!fixed):{formula:null};
    return {fact,check:{ability:key,total:fixed?score:executionTotal,preparedTotal:fixed?score:total,preparationNote,...(tiebreaker?{trailingBonus:tiebreaker}:{}),sourceMode:fixed?0:mode.mode,fixed,...configuration,...(executionReason?{formula:null,unavailableReason:executionReason}:{})}};
}
export function initiativeRoll(check:PreparedNumericD20|undefined,options:Record<string,unknown>={}):string|null {
    if(!record(options)||Object.keys(options).some(key=>!['advantage','situationalBonus','rollMode','speaker'].includes(key)))return null;
    return numericD20Roll(check,options);
}
export function armorClassProjection(derived:Record<string,any>):ArmorClassFact {return derived.armorClass??makeAc(null,'Armor class preparation unavailable');}
export function initiativeProjection(derived:Record<string,any>):InitiativeFact {return derived.initiativeFacts??{...numericFact(null,'Initiative preparation unavailable'),provenance:initProvenance,ability:'',score:null};}
