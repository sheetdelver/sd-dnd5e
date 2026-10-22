import {record} from '../native/6.0.6/source';

/** Standard registry subset at release-6.0.6. Honor/Sanity/custom registries
 * remain outside the supported profile; labels never establish identity. */
export const STANDARD_ABILITIES_606 = ['str','dex','con','int','wis','cha'] as const;
export const SKILL_ABILITIES_606:Readonly<Record<string,string>> = {
    acr:'dex',ani:'wis',arc:'int',ath:'str',dec:'cha',his:'int',
    ins:'wis',itm:'cha',inv:'int',med:'wis',nat:'int',prc:'wis',
    prf:'cha',per:'cha',rel:'int',slt:'dex',ste:'dex',sur:'wis',
};
export interface SourceInitialization606 {
    provenance:string;
    defaults:Array<{path:string;value:number|string;origin:'schema-default'}>;
    ignoredKeys:Record<string,string[]>;
}
/** Detached schema operands, before any effects. Missing mappings/entries are
 * different from existing partial entries: MappingField's keyed skill hook is
 * called only for a missing entry; RollConfig's partial-entry ability is dex.
 * Explicit malformed containers/entries/scalars retain unavailable operands.
 * This is a qualified initializer, not a source migration or full DataModel. */
export function initializeCheckSource606(raw:unknown):{system:Record<string,unknown>;initialization:SourceInitialization606} {
    const system=structuredClone(record(raw)??{});
    const initialization:SourceInitialization606={
        provenance:'release-6.0.6 MappingField / CommonTemplate / CreatureTemplate / RollConfigField source initialization',
        defaults:[],ignoredKeys:{},
    };
    function fill(data:Record<string,unknown>,field:string,value:number|string,path:string) {
        if(data[field]!==undefined)return;
        data[field]=value;
        initialization.defaults.push({path:path+'.'+field,value,origin:'schema-default'});
    }
    for(const [kind,keys]of [['abilities',STANDARD_ABILITIES_606],['skills',Object.keys(SKILL_ABILITIES_606)]]as const){
        const input=system[kind],mapping=input===undefined?{}:record(input);
        initialization.ignoredKeys[kind]=Object.keys(mapping??{}).filter(key=>!keys.includes(key as never));
        system[kind]=Object.fromEntries(keys.map(key=>{
            // A malformed mapping does not become an empty, defaultable one.
            const entry=mapping?.[key],data=mapping?(entry===undefined?{}:record(entry)):null;
            if(!data)return [key,entry??null];
            fill(data,'value',kind==='abilities'?10:0,kind+'.'+key);
            if(kind==='abilities')fill(data,'proficient',0,kind+'.'+key);
            else fill(data,'ability',entry===undefined?SKILL_ABILITIES_606[key]:'dex',kind+'.'+key);
            return [key,data];
        }));
    }
    return {system,initialization};
}
