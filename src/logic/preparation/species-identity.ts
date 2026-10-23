import {documentIdentity,record} from '../native/6.0.6/source';
import type {RulesContext} from '../rules-context';

export interface SpeciesReference {kind:'resolved'|'text'|'absent'|'unavailable';item?:Record<string,unknown>;uuid?:string;text?:string;reason?:string}
/** Exact local identity lookup after StringField trimming. A native fallback
 * string is literal source text, never a same-name or first-Item lookup. */
export function resolveSpecies606(actor:unknown,system:Record<string,unknown>=record(record(actor)?.system)??{}):SpeciesReference {
    const source=record(actor)??{},details=system.details===undefined?{}:record(system.details);
    if(source.type!=='character'||typeof source._id!=='string'||!/^[A-Za-z0-9_-]+$/.test(source._id)||source.uuid!==undefined&&source.uuid!==`Actor.${source._id}`)return {kind:'unavailable',reason:'Species identity outside qualified world-character profile'};
    if(source.system!=null&&!record(source.system))return {kind:'unavailable',reason:'Species Actor source mapping malformed'};
    if(!details)return {kind:'unavailable',reason:'Species reference source container malformed'};
    const raw=details.race;
    if(raw!=null&&typeof raw!=='string')return {kind:'unavailable',reason:'Species reference source must be a local ID or literal string'};
    const ref=typeof raw==='string'?raw.trim():'';
    if(!ref)return {kind:'absent'};
    if(!Array.isArray(source.items))return {kind:'unavailable',reason:'Species Item source collection unavailable'};
    const matches=source.items.filter(item=>record(item)?._id===ref);
    if(!matches.length)return {kind:'text',text:ref,reason:'Stored species text has no resolved owned Item; no name substitution'};
    const item=record(matches[0])!,uuid=`Actor.${source._id}.Item.${ref}`;
    if(matches.length!==1||item.type!=='race'||!documentIdentity(uuid)||item.uuid!==undefined&&item.uuid!==uuid)return {kind:'unavailable',reason:'Species canonical owned identity unavailable'};
    return {kind:'resolved',item,uuid};
}
export interface SpeciesIdentity {
    status:'resolved-source'|'source-text'|'absent'|'unavailable'|'legacy-unqualified';
    display:string;name:string|null;id:string|null;uuid:string|null;edition:string|null;
    img:string;description:string;provenance:string;reason?:string;
}
const provenance='release-6.0.6 DetailsFields.race / LocalDocumentField.initialize; owned Item source identity, not Item rules preparation';
const empty=(status:SpeciesIdentity['status'],display:string,reason?:string):SpeciesIdentity=>({status,display,name:null,id:null,uuid:null,edition:null,img:'',description:'',provenance,...(reason?{reason}:{})});
export function prepareSpeciesIdentity606(actor:unknown,context:RulesContext):SpeciesIdentity {
    if(context.status!=='supported'||context.profile!=='2024')return empty('unavailable','Species unavailable',`Species rules context unavailable: ${context.reason??context.profile??'unknown'}`);
    const ref=resolveSpecies606(actor);
    if(ref.kind==='unavailable')return empty('unavailable','Species unavailable',ref.reason);
    if(ref.kind==='absent')return empty('absent','Species not selected','No stored species selection');
    if(ref.kind==='text')return {...empty('source-text',ref.text!,ref.reason),name:ref.text!};
    const item=ref.item!,name=typeof item.name==='string'?item.name.trim():'';
    if(!name)return empty('unavailable','Species unavailable','Stored species Item name unavailable');
    const system=record(item.system),source=record(system?.source),description=record(system?.description)?.value;
    return {...empty('resolved-source',name),name,id:item._id as string,uuid:ref.uuid!,edition:typeof source?.rules==='string'?source.rules:null,
        img:typeof item.img==='string'?item.img:'',description:typeof description==='string'?description:''};
}
export function legacySpeciesIdentity(name:string,id:string,img:string,description:string):SpeciesIdentity {
    return {...empty('legacy-unqualified',name||'Species not selected','Selected legacy first-Item species projection remains unqualified'),name:name||null,id:id||null,img,description,provenance:'Selected legacy compatibility projection'};
}
export function speciesProjection(derived:unknown):SpeciesIdentity {
    const fact=record(record(derived)?.speciesIdentity);
    return fact&&typeof fact.display==='string'&&typeof fact.status==='string'?fact as unknown as SpeciesIdentity:empty('unavailable','Species unavailable','Prepared species identity unavailable');
}
