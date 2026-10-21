import {record} from '../native/6.0.6/source';
import {initializedSaveProficiency606} from './roll-initialization';
import type {InitialFilterRead} from './constant-filters';
/** Qualified pre-initial scalar projection, not full getRollData, a world cache
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
        if(parts.length===4&&parts[0]==='rolls'&&parts[1]==='ability'&&['check','save','skill','tool'].includes(parts[2])&&parts[3]==='proficiency'){
            // ability is an optional schema parent. C13's arithmetic floor0 is
            // not proof of this path's existence when its parents are absent.
            const group=record(record(record(system.rolls)?.ability)?.[parts[2]]);
            return group?{key,value:0,origin:'nonpersisted-schema-default'}:null;
        }
        return null;
    };
}
