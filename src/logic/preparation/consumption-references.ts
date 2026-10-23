import {record,documentIdentity,ownedItemUuid} from '../native/6.0.6/source';
export interface ConsumptionReference606 {
 index:number;type:string;sourceTarget:string|null;preparedTarget:string|null;valueSource:string;
 status:'owned'|'self'|'missing'|'unavailable'|'not-applicable';itemId?:string;reason?:string;
}
export interface ConsumptionPreparation606 {status:'ready'|'unavailable';reason?:string;targets:ConsumptionReference606[];provenance:string}
const provenance='release-6.0.6 ItemDataModel.prepareBaseData / IdentifiedItemsMap / SourcedItemsMap / BaseActivityData._remapConsumptionTarget';
const bad=(reason:string):ConsumptionPreparation606=>({status:'unavailable',reason,targets:[],provenance});
/** Only caller-visible owned source participates. No pack lookup,display-name
 * fallback,world cache or mutation. Unknown identity context is a reference
 * limitation;native missing-target warnings do not abort independent Actor rules. */
export function prepareConsumptionReferences606(raw:unknown,actor:unknown,item:unknown):ConsumptionPreparation606 {
 const data=raw===undefined?{}:record(raw);if(!data)return bad('Consumption source mapping malformed');
 const list=data.targets===undefined?[]:data.targets;if(!Array.isArray(list)||list.length>256)return bad('Consumption target collection malformed or exceeds qualified limit');
 const sources=record(actor)?.items,parent=record(item),items=Array.isArray(sources)?sources.map(record):null,ids=new Set<string>();
 let identityReason:string|undefined;
 if(!items)identityReason='Owned consumption source collection unavailable';
 else for(const source of items){const id=source?._id;if(typeof id!=='string'||!id||ids.has(id)){identityReason='Owned consumption identities missing or duplicated';break;}ids.add(id);try{const uuid=ownedItemUuid(record(actor)?._id as string,id);if(source?.uuid!==undefined&&source.uuid!==uuid)identityReason='Consumption Item UUID does not match this Actor ownership';}catch{identityReason='Consumption Actor/Item canonical identity unavailable';}if(identityReason)break;}
 const targets:ConsumptionReference606[]=[];
 for(const [index,input]of list.entries()){
  const row=record(input);if(!row)return bad('Consumption target source malformed');
  const type=row.type===undefined?'activityUses':typeof row.type==='string'?row.type.trim():null,target=row.target==null?null:typeof row.target==='string'?row.target.trim():undefined,value=row.value==null?'1':typeof row.value==='string'?row.value.trim():typeof row.value==='number'&&Number.isFinite(row.value)?String(row.value):null;
  if(!type||type.length>128||target===undefined||target!==null&&target.length>512||value===null||value.length>1024)return bad('Consumption type/target/value source outside qualified profile');
  if(row.scaling!==undefined&&!record(row.scaling))return bad('Consumption scaling source malformed');
  const result:ConsumptionReference606={index,type,sourceTarget:target,preparedTarget:target,valueSource:value,status:'not-applicable'};
  if(!['itemUses','material'].includes(type)){targets.push(result);continue;}
  if(!target){if(identityReason||typeof parent?._id!=='string'||!ids.has(parent._id))targets.push({...result,status:'unavailable',preparedTarget:null,reason:identityReason??'Consumption parent Item identity unavailable'});else targets.push({...result,status:'self',itemId:parent._id});continue;}
  if(identityReason){targets.push({...result,status:'unavailable',preparedTarget:null,reason:identityReason});continue;}
  const direct=items!.find(source=>source!._id===target);if(direct){targets.push({...result,status:'owned',itemId:target});continue;}
  const uuid=documentIdentity(target);let match:Record<string,unknown>|undefined,reason:string|undefined;
  if(uuid?.kind==='catalog')reason='Compendium consumption canonical identity is not qualified for this rules profile';
  else if(uuid){
   for(const source of items!){const stats=source!._stats===undefined?{}:record(source!._stats),flags=record(source!.flags),systemFlags=record(flags?.dnd5e),origin=stats?.compendiumSource??systemFlags?.sourceId;
    if(!stats){reason='Consumption source provenance malformed';break;}if(origin==null)continue;
    if(typeof origin!=='string'||!documentIdentity(origin)){reason='Consumption source provenance requires canonical identity qualification';break;}
    if(origin===target){match=source!;break;}
   }
  }else if(target.includes('.')||target.startsWith(':'))reason='Consumption target identity syntax requires qualification';
  else {
   const parts=target.split(':');if(parts.length>2||parts.some(part=>!part)){reason='Consumption identifier syntax requires qualification';}
   else {const [kind,key]=parts.length===2?parts:[null,parts[0]];for(const source of items!){if(kind&&source!.type!==kind)continue;const identifier=record(source!.system)?.identifier;
     if(typeof identifier!=='string'||!/^[a-z0-9][a-z0-9-]*$/.test(identifier)){reason='Consumption identifier index requires explicit persisted identifiers';break;}
     if(identifier===key){match=source!;break;}
   }}
  }
  if(reason)targets.push({...result,status:'unavailable',preparedTarget:null,reason});
  else if(match)targets.push({...result,status:'owned',preparedTarget:match._id as string,itemId:match._id as string});
  else targets.push({...result,status:'missing',reason:'Referenced consumption Item is not owned by this Actor'});
 }
 return {status:'ready',targets,provenance};
}
