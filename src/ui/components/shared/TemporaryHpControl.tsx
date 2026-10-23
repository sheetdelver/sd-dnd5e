'use client';
import React,{useContext} from 'react';
import {SDKContext} from '@sheet-delver/sdk/react';
import {useSheet} from './SheetContext';
import {useModal} from './useModal';
import {unavailableTitle} from './PreparationDiagnostics';
export function healthEditSignature(actor:Record<string,any>|null){
 if(!actor)return '';const {derived,...source}=actor;
 return JSON.stringify({source,identity:derived?.lifecycle?.identity,profile:derived?.lifecycle?.profile,edit:derived?.hp?.temporaryEdit});
}
export function healthRecoveryKey(actor:Record<string,any>|null,userId?:string){
 const identity=actor?.derived?.lifecycle?.identity;
 return identity?.instanceId&&identity.worldId&&userId&&actor?JSON.stringify(['dnd5e-temp-hp-v1',identity.instanceId,identity.worldId,userId,actor._id]):null;
}
export function rememberedHealthOperation(key:string|null){try{return key?localStorage.getItem(key):null;}catch{return null;}}
export default function TemporaryHpControl(){
 const sdk=useContext(SDKContext),{actor,isOwner}=useSheet(),{openModal}=useModal();
 const edit=actor?.derived?.hp?.temporaryEdit,key=healthRecoveryKey(actor,sdk?.currentUser?.id),pending=rememberedHealthOperation(key);
 const connected=Boolean(sdk?.isConnected&&sdk.currentUser&&sdk.moduleId==='dnd5e'&&key);
 const ready=connected&&isOwner&&edit?.status==='ready';
 // Inspection of a prior operation does not require qualified effective rules.
 // Keep it reachable across a profile loss; a fresh edit still needs preparation.
 if(actor?.derived?.lifecycle?.profile!=='2024'&&!pending)return null;
 const reason=!connected?'Connect to this world to edit temporary HP.':!isOwner?'Current Actor ownership required.':edit?.reason??unavailableTitle(actor?.derived?.hp?.reason)??'Temporary HP editing unavailable for this profile.';
 return <button type="button" disabled={!isOwner||!connected||!ready&&!pending} title={ready?undefined:reason} style={{fontSize:'11px',maxWidth:'100%',whiteSpace:'normal'}}
  onClick={()=>openModal('temporary-hp',{signature:healthEditSignature(actor),recoveryKey:key,operationId:pending})}>{pending?'Recover temp HP edit':'Edit temp HP'}</button>;
}
