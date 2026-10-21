import {record} from '../native/6.0.6/source';
import {initializedSaveProficiency606} from './roll-initialization';
import {initializeTraitSet606} from './trait-fields';
import {trainingSetField606} from './training-fields';
import type {InitialFilterRead} from './constant-filters';
/** Qualified pre-initial scalar/Set projection, not full getRollData, a world cache
 * or current derived values. Only schema-clean values unchanged by the verified
 * base/embedded phase can be read. Optional roll parents must actually exist. */
export function initialFilterData606(actor:unknown):(key:string)=>InitialFilterRead|null {
    const source=record(actor),system=record(source?.system),abilities=record(system?.abilities);
    const actorFlags=record(record(source?.flags)?.dnd5e);
    const common=source?.type!=='character'||!system||Object.values(actorFlags??{}).some(Boolean);
    return key=>{
        if(common)return null;
        const parts=key.split('.');
        if(parts.length===3&&parts[0]==='abilities'&&['str','dex','con','int','wis','cha'].includes(parts[1])){
            const ability=record(abilities?.[parts[1]]);if(!ability)return null;
            if(parts[2]==='value'){
                const value=ability.value;
                return typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=30?{key,value,origin:'source'}:null;
            }
            if(parts[2]==='proficient'){
                const value=initializedSaveProficiency606(ability);
                return value!==null?{key,value,origin:ability.proficient===undefined?'schema-default':'source'}:null;
            }
        }
        if(parts[0]==='traits'){
            const path=parts.slice(1).join('.');
            // Reuse field identity only, not the effect target's known-ID grant
            // vocabulary. Membership may compare an unresolved literal exactly.
            const known=trainingSetField606(path)!==null||/^(?:(?:dr|di|dv|ci)\.value|(?:dr|di|dv|dm)\.bypasses)$/.test(path);
            if(!known)return null;
            let parent=record(system.traits);
            for(const part of parts.slice(1,-1))parent=record(parent?.[part]);
            if(!parent)return null; // Optional/malformed parent initialization not qualified here.
            const raw=parent[parts.at(-1)!];
            if(raw!=null&&(!Array.isArray(raw)||raw.length>256||raw.some(value=>typeof value!=='string'||value.length>256)))return null;
            const value=initializeTraitSet606(raw);if(!value)return null;
            return {key,kind:'set',value,sourceValue:raw===undefined?'[absent]':raw===null?null:[...raw as string[]],origin:raw==null?'schema-default':'schema-initialized-source'};
        }
        if(parts.length===4&&parts[0]==='rolls'&&parts[1]==='ability'&&['check','save','skill','tool'].includes(parts[2])&&parts[3]==='proficiency'){
            // ability is an optional schema parent. C13's arithmetic floor0 is
            // not proof of this path's existence when its parents are absent.
            const group=record(record(record(system.rolls)?.ability)?.[parts[2]]);
            return group?{key,value:0,origin:'nonpersisted-schema-default'}:null;
        }
        return null;
    };
}
