import {record} from '../native/6.0.6/source';

export const proficiencyBonus606=(level:number)=>Math.floor((level+7)/4);
export interface ClassSource606 {index:number;id:string|null;levels:number}
export type ClassInitialization606={status:'ready';level:number;proficiency:number;classes:ClassSource606[]}|{status:'unavailable';reason:string};
/** Qualified explicit class source -> native base facts. Context, effect outcomes
 * and caller projections remain separate. Persisted levels are not inferred from
 * names, old details.level/attributes.prof or nonpersisted class metadata. */
export function initializeClassFacts606(actor:unknown):ClassInitialization606 {
    const source=record(actor),items=source?.items;
    if(source?.type!=='character')return {status:'unavailable',reason:'Character rule profile unavailable'};
    if(!Array.isArray(items))return {status:'unavailable',reason:'Class source collection unavailable'};
    let level=0;const classes:ClassSource606[]=[];
    for(const [index,value] of items.entries()){
        const item=record(value);if(item?.type!=='class')continue;
        const levels=record(item.system)?.levels;
        if(typeof levels!=='number'||!Number.isInteger(levels)||levels<0||levels>20)return {status:'unavailable',reason:'Class level source unavailable'};
        level+=levels;classes.push({index,id:typeof item._id==='string'?item._id:null,levels});
    }
    if(level>20)return {status:'unavailable',reason:'Class levels above 20 unsupported'};
    return {status:'ready',level,proficiency:proficiencyBonus606(level),classes};
}
