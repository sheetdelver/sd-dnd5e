import {record} from '../native/6.0.6/source';
import {DAMAGE_LABELS_606,BYPASS_LABELS_606} from '../native/6.0.6/defense-identities';
import {CONDITION_STATUS_LABELS_606} from '../native/6.0.6/condition-identities';
import {initializeTraitSet606} from './trait-fields';
type DamageSets=Record<'dr'|'di'|'dv',string[]|null>;
/** Traits.prepareResistImmune normalization runs once before final changes.
 * A missing immunity domain cannot authorize an unnormalized resistance. */
export function normalizeDamageSets606(input:DamageSets):DamageSets {
    const sets=structuredClone(input);
    if(sets.di===null)sets.dr=null;
    for(const key of ['dr','di','dv']as const){
        if(sets[key]?.includes('ALL')){
            sets[key]=['ALL'];
            if(key==='di'&&sets.dr!==null)sets.dr=[];
        }else if(key==='di'&&sets[key]!==null&&sets.dr!==null)sets.dr=sets.dr.filter(value=>!sets.di!.includes(value));
    }
    return sets;
}
/** Qualified initialized defense Set operands after earlier trait grants. Detached
 * from source and from other earlier prepared domains. No presentation rules. */
export function preparedDefenseSets606(system:Record<string,unknown>):{fields:Record<string,string[]>;reason?:string} {
    const fields:Record<string,string[]>={},raw=system.traits,traits=raw==null?{}:record(raw);
    if(!traits)return {fields,reason:'Final defense Set source mapping malformed'};
    for(const key of ['dr','di','dv','ci','dm']){
        const rawEntry=traits[key],entry=rawEntry==null?{}:record(rawEntry);
        if(!entry)return {fields,reason:`Final defense Set source mapping malformed: ${key}`};
        for(const field of key==='ci'?['value']:key==='dm'?['bypasses']:['value','bypasses']){
            const values=initializeTraitSet606(entry[field]);
            const valid=(value:string)=>field==='bypasses'?Object.hasOwn(BYPASS_LABELS_606,value):key==='ci'?Object.hasOwn(CONDITION_STATUS_LABELS_606,value):value==='ALL'||Object.hasOwn(DAMAGE_LABELS_606,value);
            if(!values||values.some(value=>!valid(value)))return {fields,reason:`Final defense Set operands outside qualified registry: ${key}.${field}`};
            fields[`system.traits.${key}.${field}`]=values;
        }
    }
    const normalized=normalizeDamageSets606(Object.fromEntries(['dr','di','dv'].map(key=>[key,fields[`system.traits.${key}.value`]]))as DamageSets);
    for(const key of ['dr','di','dv']as const)fields[`system.traits.${key}.value`]=normalized[key]!;
    return {fields};
}
