import {record} from '../native/6.0.6/source';
import {TRAINING_606} from '../native/6.0.6/training-identities';
import type {RulesContext} from '../rules-context';
import type {NumericEffects} from './numeric-effects';
import type {SkillToolModel} from './skill-tool';
import {initializeTraitSet606} from './trait-fields';

export const trainingKeys=['armor','weapons','tools','languages','mastery'] as const;
export type TrainingKey=typeof trainingKeys[number];
export const trainingLabels:Record<TrainingKey,string>={armor:'Armor',weapons:'Weapons',tools:'Tools',languages:'Languages',mastery:'Mastery source choices'};
type Status='ready'|'partial'|'unavailable';
export interface TrainingEntry {kind:'known'|'custom'|'source-key';label:string;key?:string;coefficient?:number;reference?:string;reason?:string}
export interface TrainingCategory {status:Status;entries:TrainingEntry[];display:string;reason?:string;sourceKeys?:string[]}
export interface LanguageCategory extends TrainingCategory {spoken:string[];unresolved:string[];communication:Array<{key:string;value:number;units:string;label:string}>}
export interface MasteryCategory extends TrainingCategory {weaponKeys:string[];additional:TrainingEntry[]}
export interface TrainingFacts {status:Status;provenance:string;summary:string;reason?:string;categories:{armor:TrainingCategory;weapons:TrainingCategory;tools:TrainingCategory;languages:LanguageCategory;mastery:MasteryCategory}}
const provenance='release-6.0.6 source/default/qualified initial local training; native trait/language presentation, canonical English; no caller content index';
const empty=(reason:string):TrainingCategory=>({status:'unavailable',entries:[],display:'Unavailable',reason});
function finish(entries:TrainingEntry[],reason?:string,sourceKeys?:string[]):TrainingCategory {
    const partial=reason||entries.some(entry=>entry.kind==='source-key');
    return {status:partial?'partial':'ready',entries,display:entries.map(entry=>entry.label+(entry.coefficient===undefined?'':` (${entry.coefficient}× proficiency)`)).join('; ')||(partial?'Unavailable':'None'),...(reason?{reason}:{}),...(sourceKeys?{sourceKeys}:{})};
}
const customLabels=(raw:unknown):string[]|null=>raw==null?[]:typeof raw==='string'?raw.split(';').map(value=>value.trim()).filter(Boolean):null;
const unresolved=(key:string,reference?:string):TrainingEntry=>({kind:'source-key',key,label:`${key} (label unresolved)`,...(reference?{reference}:{}),reason:'Stored source key; no name substitution or caller-authorized base Item label is available'});
const referenceFor=(references:Readonly<Record<string,string>>,key:string)=>Object.hasOwn(references,key)?references[key]:undefined;
type LanguageNode=string|{label:string;selectable?:boolean;children?:Readonly<Record<string,LanguageNode>>};
const languageTree=TRAINING_606.languages as Readonly<Record<string,LanguageNode>>;
function selectableLanguageKeys(tree:Readonly<Record<string,LanguageNode>>,out=new Set<string>()):Set<string>{
    for(const [key,node] of Object.entries(tree)){if(typeof node==='string'||node.selectable!==false)out.add(key);if(typeof node!=='string'&&node.children)selectableLanguageKeys(node.children,out);}return out;
}
const languageKeys=selectableLanguageKeys(languageTree);
const unitTypes:Record<string,string>={ft:'foot',m:'meter',mi:'mile',km:'kilometer'};

/** Independent source/local training, not effective roll proficiency. No class,
 * ability or catalog-name inference. Unknown labels stay explicit source keys. */
export function prepareTraining606(actor:unknown,context:RulesContext,effects:NumericEffects,checks:SkillToolModel):TrainingFacts {
    const source=record(actor)??{},system=effects.system,traits=system.traits==null?{}:record(system.traits);
    let common:string|undefined;
    if(context.status!=='supported'||context.profile!=='2024')common=`Training rules context unavailable: ${context.reason??context.profile??'unknown'}`;
    else if(source.type!=='character'||typeof source._id!=='string'||!/^[A-Za-z0-9_-]+$/.test(source._id)||source.uuid!==undefined&&source.uuid!==`Actor.${source._id}`)common='Training outside qualified world-character profile';
    else if(!Array.isArray(source.items)||source.system!=null&&!record(source.system)||!traits)common='Training source mapping/collection malformed';
    common??=effects.reason;
    if(Object.values(record(record(source.flags)?.dnd5e)??{}).some(Boolean))common??='Training flags/transformation preparation unavailable';
    if(source.statuses!==undefined&&(!Array.isArray(source.statuses)||source.statuses.length))common??='Training condition preparation unavailable';
    function simple(key:'armor'|'weapons'):TrainingCategory {
        if(common)return empty(common);
        const raw=traits![key==='armor'?'armorProf':'weaponProf'],data=raw==null?{}:record(raw);
        if(!data)return empty(`${trainingLabels[key]} source mapping malformed`);
        const values=initializeTraitSet606(data.value),custom=customLabels(data.custom);
        if(!values||!custom)return empty(`${trainingLabels[key]} source value/custom malformed`);
        const labels:Readonly<Record<string,string>>=key==='armor'?TRAINING_606.armor:TRAINING_606.weapons;
        const refs:Readonly<Record<string,string>>=key==='armor'?TRAINING_606.armorReferences:TRAINING_606.weaponReferences;
        return finish([...values.map(value=>Object.hasOwn(labels,value)?{kind:'known' as const,key:value,label:labels[value]}:unresolved(value,referenceFor(refs,value))),...custom.map(label=>({kind:'custom' as const,label}))],values.some(value=>!Object.hasOwn(labels,value))?'Some training labels require caller-authorized source resolution':undefined,values);
    }
    function tools():TrainingCategory {
        if(common)return empty(common);
        if(system.tools!=null&&!record(system.tools))return empty('Tool training source mapping malformed');
        const entries:TrainingEntry[]=[],reasons:string[]=[];
        for(const [key,entry] of Object.entries(checks.tools)){
            if(entry.prof===null){reasons.push('Tool training coefficient unavailable');continue;}
            if(entry.prof===0)continue;
            entries.push(entry.reason?{...unresolved(key),coefficient:entry.prof}:{kind:'known',key,label:entry.label,coefficient:entry.prof});
        }
        if(reasons.length&&!entries.length)return empty(reasons[0]);
        return finish(entries,reasons.length?reasons.join('; '):entries.some(entry=>entry.kind==='source-key')?'Some tool training identities are unresolved':undefined);
    }
    function languages():LanguageCategory {
        const no=(reason:string):LanguageCategory=>({...empty(reason),spoken:[],unresolved:[],communication:[]});
        if(common)return no(common);
        const raw=traits!.languages,data=raw==null?{}:record(raw);if(!data)return no('Language source mapping malformed');
        const values=initializeTraitSet606(data.value),custom=customLabels(data.custom);if(!values||!custom)return no('Language source value/custom malformed');
        const chosen=new Set(values),spoken:string[]=[];
        const process=(key:string,node:LanguageNode,group?:{label:string;children:string[]})=>{
            const label=typeof node==='string'?node:node.label;
            if(chosen.has(key))(group?.children??spoken).push(label);
            else if(typeof node!=='string'&&node.children&&node.selectable!==false){
                const top=!group;group??={label,children:[]};for(const [child,value] of Object.entries(node.children))process(child,value,group);
                if(top&&group.children.length)spoken.push(`${label} (${new Intl.ListFormat('en',{type:'unit'}).format(group.children)})`);
            }else if(typeof node!=='string'&&node.children)for(const [child,value] of Object.entries(node.children))process(child,value);
        };
        if(chosen.has('ALL'))spoken.push(TRAINING_606.allLanguages);
        else for(const [key,node] of Object.entries(languageTree)){
            if(typeof node!=='string'&&node.children)for(const [child,value] of Object.entries(node.children))process(child,value);
            else process(key,node);
        }
        spoken.push(...custom);
        const unknown=values.filter(value=>value!=='ALL'&&!languageKeys.has(value)),reasons:string[]=[];
        if(unknown.length)reasons.push('Stored language keys are unresolved or nonselectable; no grant inferred');
        const communications:Array<{key:string;value:number;units:string;label:string}>=[];
        const rawCommunication=data.communication,communication=rawCommunication==null?{}:record(rawCommunication);
        if(!communication)reasons.push('Communication range mapping malformed');
        else for(const [key,rawRange] of Object.entries(communication)){
            const range=rawRange==null?{}:record(rawRange),value=range?.value;
            if(!range){reasons.push('Communication range source mapping malformed');continue;}
            if(value===undefined||value===null||value===0)continue;
            if(!Object.hasOwn(TRAINING_606.communication,key)||!range||typeof value!=='number'||!Number.isFinite(value)||value<0||value>1_000_000_000){reasons.push('Communication type/range requires qualification');continue;}
            const metric=context.settings['dnd5e.metricLengthUnits'];
            const units=range.units??(metric&&metric.status!=='unavailable'&&typeof metric.value==='boolean'?(metric.value?'m':'ft'):null);
            if(typeof units!=='string'||!Object.hasOwn(unitTypes,units)){reasons.push('Communication units/default unavailable');continue;}
            const title=(TRAINING_606.communication as Readonly<Record<string,{label:string}>>)[key].label;
            communications.push({key,value,units,label:`${title} ${new Intl.NumberFormat('en',{style:'unit',unit:unitTypes[units],unitDisplay:'short'}).format(value)}`});
        }
        const entries:TrainingEntry[]=[...spoken.map(label=>({kind:'known' as const,label})),...unknown.map(value=>unresolved(value)),...communications.map(entry=>({kind:'known' as const,key:entry.key,label:entry.label}))];
        return {...finish(entries,reasons.length?reasons.join('; '):undefined,values),spoken,unresolved:unknown,communication:communications};
    }
    function mastery():MasteryCategory {
        const no=(reason:string):MasteryCategory=>({...empty(reason),weaponKeys:[],additional:[]});
        if(common)return no(common);
        const weapon=traits!.weaponProf==null?{}:record(traits!.weaponProf),raw=weapon?.mastery,data=raw==null?{}:record(raw);
        if(!weapon||!data)return no('Mastery source mapping malformed');
        const values=initializeTraitSet606(data.value),bonus=initializeTraitSet606(data.bonus);if(!values||!bonus)return no('Mastery source choices malformed');
        const refs=TRAINING_606.weaponReferences as Readonly<Record<string,string>>,labels=TRAINING_606.mastery as Readonly<Record<string,{label:string}>>;
        const additional=bonus.map(value=>Object.hasOwn(labels,value)?{kind:'known' as const,key:value,label:labels[value].label}:unresolved(value));
        const entries=[...values.map(value=>unresolved(value,referenceFor(refs,value))),...additional.map(entry=>({...entry,label:`Additional option: ${entry.label} (requires a mastered weapon with a base mastery)`}))];
        return {...finish(entries,values.length?'Mastered weapon source labels require caller-authorized resolution':additional.some(entry=>entry.kind==='source-key')?'Mastery property identities unresolved':undefined,values),weaponKeys:values,additional};
    }
    const categories={armor:simple('armor'),weapons:simple('weapons'),tools:tools(),languages:languages(),mastery:mastery()};
    const all=Object.values(categories),status:Status=all.every(category=>category.status==='ready')?'ready':all.every(category=>category.status==='unavailable')?'unavailable':'partial';
    const parts=trainingKeys.filter(key=>categories[key].entries.length).map(key=>`${trainingLabels[key]}: ${categories[key].display}`);
    const summary=status==='unavailable'?'—':parts.join(' • ')+(status==='partial'?`${parts.length?' • ':''}Some training unavailable or unresolved`:'')||'None';
    return {status,provenance,categories,summary,...(all.some(category=>category.reason)?{reason:all.flatMap(category=>category.reason?[category.reason]:[]).join('; ')}:{})};
}
export function trainingProjection(derived:unknown):TrainingFacts {
    const fact=record(record(derived)?.training);if(fact&&record(fact.categories)&&typeof fact.summary==='string')return fact as unknown as TrainingFacts;
    const reason='Prepared training unavailable';return {status:'unavailable',provenance,summary:'—',reason,categories:{armor:empty(reason),weapons:empty(reason),tools:empty(reason),languages:{...empty(reason),spoken:[],unresolved:[],communication:[]},mastery:{...empty(reason),weaponKeys:[],additional:[]}}};
}
