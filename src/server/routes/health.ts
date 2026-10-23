import {isSdkError,SdkError} from '@sheet-delver/sdk';
import {error,json,type ModuleRouteTable} from '@sheet-delver/sdk/server';
import {record} from '../../logic/native/6.0.6/source';
import {temporaryHpCommands} from '../commands/temporary-hp';
export const healthRoutes:ModuleRouteTable={
 'health/temporary':async req=>{
  if(req.method!=='POST')return error('validation','POST required',405);
  try{
   const body=record(await req.json()),action=body?.action;
   const keys=action==='review'?['action','actorId','amount']:['action','actorId','operationId'];
   if(!body||Object.keys(body).length!==keys.length||Object.keys(body).some(k=>!keys.includes(k))||!['review','execute','status'].includes(String(action))||typeof body.actorId!=='string'||action!=='review'&&typeof body.operationId!=='string')throw new SdkError('validation','Exact temporary HP action and identities required');
   const value=action==='review'?await temporaryHpCommands.review(req,body.actorId,body.amount):action==='execute'?await temporaryHpCommands.execute(req,body.actorId,body.operationId as string):await temporaryHpCommands.status(req,body.actorId,body.operationId as string);
   return json({operation:value});
  }catch(cause){return isSdkError(cause)?error(cause.code,cause.message,cause.status):error('not_ready','Temporary HP operation unavailable; inspect its status before a new edit');}
 }
};
