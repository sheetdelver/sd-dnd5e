'use client';
import React,{useContext,useEffect,useId,useRef,useState} from 'react';
import {SDKContext} from '@sheet-delver/sdk/react';
import BaseModal from '../shared/BaseModal';
import {useSheet} from '../shared/SheetContext';
import {healthEditSignature,healthRecoveryKey} from '../shared/TemporaryHpControl';
interface Outcome{operationId:string;actorId:string;phase:string;before:number;after:number;storedTemp:number|null;reason?:string;receiptIds:string[]}
export interface TemporaryHpModalProps{signature:string;recoveryKey:string;operationId?:string|null;onClose:()=>void}
export default function TemporaryHpModal({signature,recoveryKey,operationId,onClose}:TemporaryHpModalProps){
 const sdk=useContext(SDKContext),{actor,isOwner}=useSheet(),id=useId(),actorId=actor?._id as string;
 const [amount,setAmount]=useState(String(actor?.derived?.hp?.temporaryEdit?.value??'')),[row,setRow]=useState<Outcome>(),[pending,setPending]=useState(operationId??''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[submitted,setSubmitted]=useState(Boolean(operationId)),[retired,setRetired]=useState(false);
 const live=useRef(true),inFlight=useRef(false),current=useRef({actorId,signature:healthEditSignature(actor),isOwner,sdk,key:healthRecoveryKey(actor,sdk?.currentUser?.id)});current.current={actorId,signature:healthEditSignature(actor),isOwner,sdk,key:healthRecoveryKey(actor,sdk?.currentUser?.id)};
 useEffect(()=>{live.current=true;return()=>{live.current=false;};},[]);
 const changed=current.current.signature!==signature||current.current.key!==recoveryKey||!isOwner||!sdk?.isConnected;
 useEffect(()=>{if(changed)setRetired(true);},[changed]);
 const usable=()=>live.current&&current.current.actorId===actorId&&current.current.isOwner&&current.current.sdk?.isConnected&&current.current.key===recoveryKey;
 const amountValid=/^\d+$/.test(amount)&&Number.isSafeInteger(Number(amount))&&Number(amount)<=1_000_000_000;
 async function request(action:'review'|'execute'|'status'){
  if(inFlight.current||!usable()||action!=='status'&&(current.current.signature!==signature||changed||retired)||action==='execute'&&(submitted||row?.phase!=='reviewed'))return;
  if(action==='review'&&!amountValid)return;
  inFlight.current=true;setBusy(true);setError('');if(action==='execute')setSubmitted(true);
  try{
   const response=await sdk!.fetchWithAuth('/api/modules/dnd5e/health/temporary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,actorId,...(action==='review'?{amount:Number(amount)}:{operationId:pending})})});
   const payload=await response.json();if(!response.ok)throw Error(payload.error??'Request unavailable');
   const outcome=payload.operation as Outcome;
   if(outcome.actorId!==actorId||typeof outcome.operationId!=='string'||action!=='review'&&outcome.operationId!==pending)throw Error('Operation identity unavailable');
   if(!usable())return;
   // Persist only a caller/world/Actor-scoped recovery identity, not Actor data.
   if(action==='review'){localStorage.setItem(recoveryKey,outcome.operationId);if(localStorage.getItem(recoveryKey)!==outcome.operationId)throw Error('Recovery storage unavailable; no execution requested');}
   if(!usable())return;setPending(outcome.operationId);setRow(outcome);
   if(action!=='review'){
    try{sdk!.documents.invalidate('Actor',actorId);await sdk!.documents.refresh('Actor',actorId);}catch{if(live.current)setError('Operation status was received, but the sheet refresh failed. Reconnect and check status to refresh the visible value.');}
   }
  }catch(cause){if(live.current)setError((action==='execute'?'The outcome is unknown. Check status before any new edit. ':action==='review'?'Review failed; no execution requested. ':'Status unavailable; reconnect and inspect before a new edit. ')+(cause instanceof Error?cause.message:'Request failed'));}
  finally{inFlight.current=false;if(live.current)setBusy(false);}
 }
 const canReview=!changed&&!retired&&actor?.derived?.hp?.temporaryEdit?.status==='ready'&&!pending;
 return <BaseModal open onClose={onClose} title="Temporary hit points" labelledBy={id}><div className="dnd5e-health-edit">
  <p>Manually replace temporary HP. This edit can lower or clear it; it does not grant or stack temporary HP.</p>
  <p>Current effective temporary HP: {actor?.derived?.hp?.temp??'—'}.</p>
  {(changed||retired)&&(!row||row.phase==='reviewed'&&!submitted)?<p role="status">This review has retired because the character, access or connection changed. Inspect status, then open a fresh edit.</p>:null}
  {!pending&&<label>New temporary HP <input aria-label="New temporary HP" inputMode="numeric" value={amount} onChange={e=>setAmount(e.target.value)} disabled={!canReview||busy}/></label>}
  {!pending&&<button type="button" disabled={!canReview||!amountValid||busy} onClick={()=>void request('review')}>Review change</button>}
  {row&&<div role="status">
   <p>Reviewed change: {row.before} → {row.after} temporary HP.</p>
   <p>{row.phase==='confirmed'?'Confirmed: acknowledged and read back.':row.phase==='rejected-zero-write'?'No write was dispatched. Start a fresh review.':row.phase==='reviewed'?'Review saved; no write dispatched.':'Outcome requires inspection. This operation will not be replayed.'}</p>
   <p>Latest stored temporary HP: {row.storedTemp??'—'}.</p>
   {row.reason&&<p>{row.reason}</p>}
  </div>}
  {pending&&row?.phase==='reviewed'&&!submitted&&<button type="button" disabled={busy||changed||retired} onClick={()=>void request('execute')}>Confirm replacement</button>}
  {pending&&(submitted||row?.phase!=='reviewed'||changed||retired)&&<button type="button" disabled={busy||!sdk?.isConnected||!isOwner} onClick={()=>void request('status')}>Check status</button>}
  {pending&&row&&row.phase!=='executing'&&(row.phase!=='reviewed'||submitted)&&<button type="button" disabled={busy} onClick={()=>{
   // A new intent is explicit and requires another review; never retry the old
   // amount. The current sheet/source must be inspected, then modal reopened.
   try{localStorage.removeItem(recoveryKey);}catch{setError('Recovery storage unavailable');return;}onClose();
  }}>Finish inspection</button>}
  {error&&<p role="alert">{error}</p>}
  <p>Checking status retires an unexecuted review. Other Foundry edits may change this value;inspect an uncertain result before a new edit.</p>
 </div></BaseModal>;
}
