import {record,decodeCollection,advancementTypes,ownedItemUuid} from '../native/6.0.6/source';
import {initializeClassFacts606} from './class-initialization';
export interface ScaleEntry606 {itemId:string;itemUuid:string;itemIdentifier:string|null;advancementId:string;identifier:string|null;classId:string|null;level:number|null;status:'ready'|'unavailable'|'excluded';value:number|null;reason?:string}
export interface ClassScales606 {bindings:Record<string,number>;entries:ScaleEntry606[];diagnostics:string[];provenance:string}
const identifier=(raw:unknown):string|null=>typeof raw==='string'&&/^[a-z][a-z0-9-]*$/.test(raw.trim())?raw.trim():null;
/** Numeric source-only class/subclass dependency preparation. Persisted exact
 * identifiers supply namespaces;names,raw system.scale and item.scaleValues
 * never supply replacements. Unsupported records yield no binding. */
export function prepareClassScales606(actor:unknown,gate?:string):ClassScales606 {
    const source=record(actor),items=Array.isArray(source?.items)?source.items.map(record):[],base=initializeClassFacts606(actor);
    const out:ClassScales606={bindings:{},entries:[],diagnostics:[],provenance:'release-6.0.6 class schema / ScaleValueAdvancement.valueForLevel / Item.scaleValues / ActorDataModel._prepareScaleValues'};
    const identities=new Map<string,number>(),ids=new Map<string,number>();
    for(const item of items){const key=identifier(record(item?.system)?.identifier);if(key)identities.set(key,(identities.get(key)??0)+1);if(typeof item?._id==='string')ids.set(item._id,(ids.get(item._id)??0)+1);}
    gate??=typeof source?._id!=='string'||!/^[A-Za-z0-9_-]+$/.test(source._id)||source.uuid!==undefined&&source.uuid!==`Actor.${source._id}`?'Scale world Actor identity unavailable':undefined;
    if(gate||base.status!=='ready'){out.diagnostics.push(gate??(base.status==='unavailable'?base.reason:'Class preparation unavailable'));return out;}
    const classLevel=(item:Record<string,unknown>|null)=>base.classes.find(row=>row.id===item?._id)?.levels??null;
    const originalClass=record(record(source?.system)?.details)?.originalClass;
    for(const item of items){
        if(!item||!['class','subclass'].includes(String(item.type)))continue;
        const s=record(item.system)??{},id=item._id,key=identifier(s.identifier);
        const validId=typeof id==='string'&&/^[A-Za-z0-9_-]+$/.test(id)&&ids.get(id)===1;
        let reason=validId?undefined:'Scale owned Item identity unavailable or duplicated';
        if(!key||identities.get(key)!==1)reason??='Persisted class/scale Item identifier unavailable or duplicated';
        const parentKey=identifier(s.classIdentifier),matches=items.filter(i=>i?.type==='class'&&identifier(record(i.system)?.identifier)===parentKey);
        const parent=item.type==='class'?item:parentKey&&matches.length===1?matches[0]:null;
        const level=classLevel(parent);
        if(!parent||level===null)reason??='Subclass parent class identity/level unavailable or ambiguous';
        if(Object.values(record(record(item.flags)?.dnd5e)??{}).some(Boolean))reason??='Scale grant/root or Item flag dependency requires qualification';
        if(item.type==='class'&&!reason)out.bindings[`classes.${key}.levels`]=level!;
        const diagnostics:Array<{code:string;path:string}>=[];
        const advances=decodeCollection(structuredClone(s.advancement??[]),'advancement',advancementTypes,diagnostics);
        if(diagnostics.length){out.diagnostics.push(`${String(id)}: advancement source identity/schema malformed`);continue;}
        const scales=Object.values(advances).filter(a=>a.type==='ScaleValue'),scaleIds=scales.map(a=>identifier(record(a.configuration)?.identifier));
        for(const advancement of scales){
            const configuration=record(advancement.configuration),sid=identifier(configuration?.identifier),scale=record(configuration?.scale);
            let invalid=reason;if(typeof advancement._id!=='string'||!advancement._id)invalid??='Scale advancement identity unavailable';
            if(!sid||scaleIds.filter(v=>v===sid).length!==1)invalid??='Persisted scale identifier unavailable or duplicated';
            if(configuration?.type!=='number'||!scale)invalid??='Scale type/source outside numeric profile';
            if(advancement.classRestriction!==undefined&&typeof advancement.classRestriction!=='string')invalid??='Scale class restriction source malformed';
            const original=item.type==='class'&&originalClass?item._id===originalClass:null;
            const excluded=advancement.classRestriction==='primary'&&!original||advancement.classRestriction==='secondary'&&!!original;
            let value:unknown;
            if(!invalid&&!excluded)for(const [threshold,raw]of Object.entries(scale!).reverse()){
                if(!/^(?:0|[1-9]|1\d|20)$/.test(threshold)||!record(raw)){invalid='Scale level/value source malformed or outside character levels';break;}
                if(Number(threshold)>level!)continue;
                value??=record(raw)!.value;
            }
            if(!invalid&&!excluded&&(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>1e9))invalid='Numeric scale has no qualified value at this class level';
            const entry:ScaleEntry606={itemId:String(id),itemUuid:validId?ownedItemUuid(source?._id as string,id as string):'',itemIdentifier:key,advancementId:typeof advancement._id==='string'?advancement._id:'',identifier:sid,classId:typeof parent?._id==='string'?parent._id:null,level,status:invalid?'unavailable':excluded?'excluded':'ready',value:invalid||excluded?null:value as number,...(invalid?{reason:invalid}:{})};
            out.entries.push(entry);
            if(invalid)out.diagnostics.push(`${String(id)}:${String(sid)}: ${invalid}`);
            else if(!excluded)out.bindings[`scale.${key}.${sid}`]=value as number;
        }
    }
    return out;
}
