import {record} from '../native/6.0.6/source';
import {DAMAGE_LABELS_606,BYPASS_LABELS_606} from '../native/6.0.6/defense-identities';
import {initializeTraitSet606} from './trait-fields';
export interface ConditionTraitGrant606 {status:'ready'|'unavailable';reason?:string;before?:{dr:string[];di:string[];ci:string[];bypasses:string[]};granted?:{dr:string[];di:string[];ci:string[];clearBypasses:true}}
/** Native petrification grants occur after current-CI status deletion. Damage
 * normalization remains owned by the shared defense preparer. Detached system only. */
export function applyPetrificationGrants606(system:Record<string,unknown>):ConditionTraitGrant606 {
    const raw=system.traits,traits=raw==null?{}:record(raw);
    const dr=traits?.dr==null?{}:record(traits.dr),di=traits?.di==null?{}:record(traits.di),ci=traits?.ci==null?{}:record(traits.ci);
    const drValues=dr&&initializeTraitSet606(dr.value),diValues=di&&initializeTraitSet606(di.value),ciValues=ci&&initializeTraitSet606(ci.value),bypasses=dr&&initializeTraitSet606(dr.bypasses);
    if(!traits||!dr||!di||!ci||!drValues||!diValues||!ciValues||!bypasses||[...drValues,...diValues].some(id=>id!=='ALL'&&!Object.hasOwn(DAMAGE_LABELS_606,id))||bypasses.some(id=>!Object.hasOwn(BYPASS_LABELS_606,id)))return {status:'unavailable',reason:'Petrification defense operands outside qualified trait profile'};
    const before={dr:drValues,di:diValues,ci:ciValues,bypasses},add=(values:string[],id:string)=>Array.from(new Set([...values,id]));
    system.traits={...traits,dr:{...dr,value:add(drValues,'ALL'),bypasses:[]},di:{...di,value:add(diValues,'poison')},ci:{...ci,value:add(add(ciValues,'poisoned'),'diseased')}};
    return {status:'ready',before,granted:{dr:['ALL'],di:['poison'],ci:['poisoned','diseased'],clearBypasses:true}};
}
