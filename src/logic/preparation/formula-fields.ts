import {prepareClassScales606,type ClassScales606} from './class-scales';
import {record} from '../native/6.0.6/source';
import type {RulesContext} from '../rules-context';
import type {NumericEffects} from './numeric-effects';
import {initializeClassFacts606} from './class-initialization';
import {numericAbilityValue,numericConstant} from './numeric';
import {deterministicFormula606,qualifiedFormulaBonus606,type FormulaBindings606} from './deterministic-formula';
export interface FormulaPreparation606 {
    scales:ClassScales606;preparedBindings:Record<string,number>;executionBindings:Record<string,number>;
    receipts:Array<{path:string;source:string;prepared:number;execution?:number}>;
    unavailable:Array<{path:string;reason:string}>;
}
/** Explicit native roll-data subset. Earlier modifiers and Item final operands
 * precede Actor final score changes; fresh execution sees current score fields.
 * No raw .mod/.prof/.level or caller-supplied prepared objects are authoritative. */
export function formulaBindings606(actor:unknown,context:RulesContext,effects:NumericEffects,phase:'prepared'|'execution'='prepared'):Record<string,number>{
    if(context.status!=='supported'||context.profile!=='2024'||effects.reason)return {};
    const result:Record<string,number>={},classes=initializeClassFacts606(actor);
    if(classes.status==='ready'){
        result['details.level']=classes.level;
        const setting=context.settings['dnd5e.proficiencyModifier'];
        if(setting?.status!=='unavailable'&&setting?.value==='bonus')result.prof=classes.proficiency;
    }
    for(const key of ['str','dex','con','int','wis','cha']){
        const numeric=numericAbilityValue(record(record(effects.system.abilities)?.[key])?.value);
        if(!numeric)continue;
        result[`abilities.${key}.mod`]=numeric.mod;
        result[`abilities.${key}.value`]=phase==='execution'?effects.finalNumbers[`system.abilities.${key}.value`]??numeric.score:numeric.score;
    }
    return result;
}
/** Fold qualified FormulaFields once in the detached preparation model.
 * NumberFields and effect deltas retain their separate typed semantics. Source
 * expressions survive in receipts; unknown references never become fabricated0. */
export function prepareFormulaFields606(actor:unknown,context:RulesContext,effects:NumericEffects):NumericEffects {
    const scales=prepareClassScales606(actor,context.status!=='supported'||context.profile!=='2024'?'Class/scale rules context unavailable':effects.reason),prepared={...formulaBindings606(actor,context,effects),...scales.bindings},execution={...formulaBindings606(actor,context,effects,'execution'),...scales.bindings};
    const model:FormulaPreparation606={scales,preparedBindings:prepared,executionBindings:execution,receipts:[],unavailable:[]};
    function fold(path:string,roll=false,root:Record<string,unknown>=effects.system,parts=path.split('.')){
        let parent:Record<string,unknown>|null=root;
        for(const part of parts.slice(0,-1))parent=record(parent?.[part]);
        if(!parent)return;
        const key=parts.at(-1)!,raw=parent[key];
        if(typeof raw!=='string'||numericConstant(raw)!==null)return;
        if(!raw.trim()){if(roll)parent[key]='';return;}
        const value=deterministicFormula606(raw,prepared),current=roll?deterministicFormula606(raw,execution):value;
        if(value===null||current===null||roll&&(!qualifiedFormulaBonus606(value)||!qualifiedFormulaBonus606(current))){
            model.unavailable.push({path,reason:'Formula expression/reference or fractional execution profile unavailable'});return;
        }
        parent[key]=String(value);
        if(roll&&!Object.hasOwn(effects.executionBonuses,'system.'+path))effects.executionBonuses['system.'+path]=current;
        model.receipts.push({path,source:raw,prepared:value,...(roll?{execution:current}:{})});
    }
    for(const key of ['str','dex','con','int','wis','cha'])for(const kind of ['check','save','attack'])fold(`abilities.${key}.${kind}.roll.bonus`,kind!=='attack');
    for(const kind of ['skills','tools'])for(const key of Object.keys(record(effects.system[kind])??{})){
        fold(`${kind}.${key}.roll.bonus`,true);if(kind==='skills')fold(`${kind}.${key}.bonuses.passive`);
    }
    for(const kind of ['check','save','skill','tool']){
        fold(`rolls.ability.${kind}.bonus`,true,effects.globals,[kind,'bonus']);
        const raw=record(record(record(effects.system.rolls)?.ability)?.[kind]);
        if(raw&&model.receipts.some(r=>r.path===`rolls.ability.${kind}.bonus`))raw.bonus=effects.globals[kind].bonus;
    }
    fold('attributes.init.roll.bonus',true);
    for(const key of ['level','overall'])fold('attributes.hp.bonuses.'+key);
    for(const key of ['walk','burrow','climb','fly','jump','swim'])fold('attributes.movement.speeds.'+key);
    fold('attributes.movement.bonus');
    const ac=record(record(effects.system.attributes)?.ac);
    if(Array.isArray(ac?.formulas))ac.formulas.forEach((value,index)=>{const row=record(value);if(row)fold(`attributes.ac.formulas.${index}.formula`,false,row,['formula']);});
    const attacks=record(record(effects.system.rolls)?.attack);
    if(attacks){fold('rolls.attack.bonus');for(const key of ['mwak','rwak','msak','rsak'])fold(`rolls.attack.${key}.bonus`);}
    for(const key of Object.keys(record(record(record(effects.system.traits)?.dm)?.amount)??{}))fold('traits.dm.amount.'+key);
    effects.formulaPreparation=model;
    return effects;
}
export const preparedFormulaBindings606=(effects:NumericEffects|undefined):FormulaBindings606=>effects?.formulaPreparation?.preparedBindings??{};
