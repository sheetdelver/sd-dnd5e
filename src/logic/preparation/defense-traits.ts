import {record} from '../native/6.0.6/source';
import {DAMAGE_LABELS_606,BYPASS_LABELS_606,PHYSICAL_DAMAGE_606,ALL_DAMAGE_LABEL_606} from '../native/6.0.6/defense-identities';
import {CONDITION_STATUS_LABELS_606} from '../native/6.0.6/condition-identities';
import type {RulesContext} from '../rules-context';
import {numericConstant,qualifiedNumericTotal} from './numeric';
import {prepareNumericEffects606,type NumericEffects} from './numeric-effects';
import {initializeTraitSet606} from './trait-fields';
import {normalizeDamageSets606} from './defense-sets';

export const defenseKeys=['dr','di','dv','ci','dm'] as const;
export type DefenseKey=typeof defenseKeys[number];
export const defenseLabels:Readonly<Record<DefenseKey,string>>={dr:'Damage resistances',di:'Damage immunities',dv:'Damage vulnerabilities',ci:'Condition immunities',dm:'Damage adjustments'};
export interface DefenseEntry {key?:string;label:string;bypasses:string[]}
interface ReadyCategory {status:'ready';values:string[];custom:string[];bypasses:string[];amount:Record<string,number>;entries:DefenseEntry[];display:string}
interface UnavailableCategory {status:'unavailable';values:null;custom:null;bypasses:null;amount:null;entries:null;display:'Unavailable';reason:string}
export type DefenseCategory=ReadyCategory|UnavailableCategory;
export interface DefenseFacts {
    status:'ready'|'partial'|'unavailable';provenance:string;reason?:string;categories:Record<DefenseKey,DefenseCategory>;summary:string;
    preparation?:{fields:Record<string,string[]>;provenance:string;nativeResistanceDisplay?:{value:string;condition:'petrified';provenance:string}};
    preparationNote?:string;
}
const provenance='release-6.0.6 SimpleTraitField/DamageTraitField/TraitsFields.prepareResistImmune; qualified condition grants,initial fields,final Sets/custom Strings and constant damage adjustments';
const unavailable=(reason:string):UnavailableCategory=>({status:'unavailable',values:null,custom:null,bypasses:null,amount:null,entries:null,display:'Unavailable',reason});
const physical=new Set<string>(PHYSICAL_DAMAGE_606);
function finish(values:string[],custom:string[],bypasses:string[],amount:Record<string,number>={}):ReadyCategory {
    const entries:DefenseEntry[]=[...values.map(key=>({key,label:key==='ALL'?ALL_DAMAGE_LABEL_606:DAMAGE_LABELS_606[key]??CONDITION_STATUS_LABELS_606[key],bypasses:physical.has(key)?bypasses:[]})),...custom.map(label=>({label,bypasses:[]}))];
    for(const [key,value] of Object.entries(amount))entries.push({key,label:`${DAMAGE_LABELS_606[key]} ${value>=0?'+':''}${value}`,bypasses:physical.has(key)?bypasses:[]});
    return {status:'ready',values,custom,bypasses,amount,entries,display:entries.map(entry=>entry.label+(entry.key==='ALL'&&bypasses.length?` (physical damage bypassed by ${bypasses.map(key=>BYPASS_LABELS_606[key]).join(', ')})`:entry.bypasses.length?` (bypassed by ${entry.bypasses.map(key=>BYPASS_LABELS_606[key]).join(', ')})`:'')).join('; ')||'None'};
}
/** One detached qualified preparation path. Malformed/unknown domains remain
 * unavailable separately; unqualified effect phases gate every affected defense.
 * Native ALL/overlap normalization changes Sets, never the original source. */
export function prepareDefenseTraits606(actor:unknown,context:RulesContext,effects:NumericEffects=prepareNumericEffects606(actor)):DefenseFacts {
    const source=record(actor)??{},system=effects.system,raw=system.traits;
    let common:string|undefined;
    if(context.status!=='supported'||context.profile!=='2024')common=`Defense rules context unavailable: ${context.reason??context.profile??'unknown'}`;
    else if(source.type!=='character'||typeof source._id!=='string'||!/^[A-Za-z0-9_-]+$/.test(source._id)||source.uuid!==undefined&&source.uuid!==`Actor.${source._id}`)common='Defenses outside qualified world-character profile';
    else if(!Array.isArray(source.items)||source.system!=null&&!record(source.system))common='Defense source collection/mapping unavailable';
    common??=effects.reason;
    common ??= effects.ruleFlags.reason;
    if(source.statuses!==undefined&&(!Array.isArray(source.statuses)||source.statuses.length))common??='Defense condition preparation unavailable';
    const traits=raw==null?{}:record(raw);
    if(!traits)common??='Defense trait source mapping malformed';
    const categories={} as Record<DefenseKey,DefenseCategory>;
    for(const key of defenseKeys){
        if(common){categories[key]=unavailable(common);continue;}
        const rawEntry=traits![key],entry=rawEntry==null?{}:record(rawEntry);
        if(!entry){categories[key]=unavailable(`${defenseLabels[key]} source mapping malformed`);continue;}
        // SimpleTraitField (ci) has no persisted bypasses field.
        const bypasses=key==='ci'?[]:initializeTraitSet606(effects.finalDefenseSets?.[`system.traits.${key}.bypasses`]??entry.bypasses);
        if(!bypasses||bypasses.some(value=>!Object.hasOwn(BYPASS_LABELS_606,value))){categories[key]=unavailable(`${defenseLabels[key]} bypass source malformed or outside qualified registry`);continue;}
        if(key==='dm'){
            const rawAmount=entry.amount,amount=rawAmount==null?{}:record(rawAmount),prepared:Record<string,number>={};
            if(!amount){categories[key]=unavailable('Damage adjustment mapping malformed');continue;}
            let reason:string|undefined;
            for(const [type,rawValue] of Object.entries(amount)){
                const value=numericConstant(typeof rawValue==='string'?rawValue.trim():rawValue);
                if(!Object.hasOwn(DAMAGE_LABELS_606,type)||value===null||!qualifiedNumericTotal(value)||Math.abs(value)>1_000_000_000)reason??='Damage adjustment type/expression requires qualification';
                else if(value!==0)prepared[type]=value;
            }
            categories[key]=reason?unavailable(reason):finish([],[],bypasses,prepared);continue;
        }
        const values=initializeTraitSet606(effects.finalDefenseSets?.[`system.traits.${key}.value`]??entry.value),custom=effects.finalTraitStrings?.[`system.traits.${key}.custom`]??entry.custom??'';
        if(!values||typeof custom!=='string'){categories[key]=unavailable(`${defenseLabels[key]} source value/custom malformed`);continue;}
        const labels=key==='ci'?CONDITION_STATUS_LABELS_606:DAMAGE_LABELS_606;
        if(values.some(value=>!Object.hasOwn(labels,value)&&!(key!=='ci'&&value==='ALL'))){categories[key]=unavailable(`${defenseLabels[key]} value outside qualified registry`);continue;}
        categories[key]=finish(values,custom.split(';').map(value=>value.trim()).filter(Boolean),bypasses);
    }
    // A final snapshot already starts from the normalized earlier Sets. Repeating
    // normalization here would erase qualified final changes (C57).
    if(!effects.finalDefenseSets){
        const values=(key:'dr'|'di'|'dv')=>{const category=categories[key];return category.status==='ready'?category.values:null;};
        const normalized=normalizeDamageSets606({dr:values('dr'),di:values('di'),dv:values('dv')});
        for(const key of ['dr','di','dv']as const){const category=categories[key];if(category.status!=='ready')continue;categories[key]=normalized[key]===null?unavailable('Resistance normalization requires available damage immunities'):finish(normalized[key]!,category.custom,category.bypasses);}
    }
    const unavailableKeys=defenseKeys.filter(key=>categories[key].status==='unavailable'),known=defenseKeys.filter(key=>categories[key].status==='ready');
    const status=unavailableKeys.length===0?'ready':known.length?'partial':'unavailable';
    const summaryParts=known.filter(key=>categories[key].entries?.length).map(key=>`${defenseLabels[key]}: ${categories[key].display}`);
    const summary=status==='unavailable'?'—':summaryParts.join(' • ')+(unavailableKeys.length?`${summaryParts.length?' • ':''}Some defenses unavailable`:'')||'None';
    const petrified=effects.conditions.statuses.includes('petrified');
    const preparation=status==='ready'&&effects.preparedDefenseSets?{
        fields:effects.preparedDefenseSets,provenance:'release-6.0.6 TraitsFields.prepareResistImmune before final effects',
        ...(petrified?{nativeResistanceDisplay:{value:ALL_DAMAGE_LABEL_606,condition:'petrified' as const,provenance:'release-6.0.6 BaseActorSheet._prepareTraits petrification display override; not current damage membership'}}:{})
    }:undefined;
    const changed=preparation&&Object.keys(preparation.fields).some(key=>JSON.stringify(preparation.fields[key])!==JSON.stringify(effects.finalDefenseSets?.[key]));
    return {status,provenance,categories,summary,...(preparation?{preparation}:{}),...(petrified&&changed?{preparationNote:'Petrification granted defenses earlier. The values shown include later changes.'}:{}),...(unavailableKeys.length?{reason:unavailableKeys.map(key=>(categories[key] as UnavailableCategory).reason).join('; ')}:{})};
}
export function defensesProjection(derived:unknown):DefenseFacts {
    const fact=record(record(derived)?.defenses);
    if(fact&&record(fact.categories)&&typeof fact.summary==='string')return fact as unknown as DefenseFacts;
    return {status:'unavailable',provenance,reason:'Prepared defenses unavailable',summary:'—',categories:Object.fromEntries(defenseKeys.map(key=>[key,unavailable('Prepared defenses unavailable')])) as Record<DefenseKey,DefenseCategory>};
}
