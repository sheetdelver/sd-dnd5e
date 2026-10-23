import {createHash,randomUUID} from 'node:crypto';
import {SdkError} from '@sheet-delver/sdk';
import type {ModuleServerRequest} from '@sheet-delver/sdk/server';
import {record} from '../../logic/native/6.0.6/source';
import {resolveRulesContext,assertSameRulesContext} from '../../logic/rules-context';
import {prepareHealth606} from '../../logic/preparation/health';
import {CommandJournal,commandJournal,type CommandPlan,type CommandRecord} from './journal';

const validAmount=(value:unknown):value is number=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0&&value<=1_000_000_000;
const validId=(value:unknown):value is string=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(value);
const rawTemp=(actor:unknown)=>record(record(record(record(actor)?.system)?.attributes)?.hp)?.temp;
function sourceHash(source:unknown){
 const json=JSON.stringify(source,(_key,value)=>value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(k=>[k,value[k]])):value);
 if(!json||json.length>8*1024*1024)throw new SdkError('not_ready','Actor source exceeds this edit profile');
 return createHash('sha256').update(json).digest('hex');
}
function intent(plan:Readonly<CommandPlan>){
 const i=record(plan.intent);if(i?.kind!=='set-temporary-hp'||!validAmount(i.before)||!validAmount(i.after)||plan.steps.length!==1||plan.steps[0].kind!=='set-temporary-hp')throw new SdkError('conflict','This operation is not a temporary HP edit');
 return {before:i.before,after:i.after};
}
async function owned(req:ModuleServerRequest,actorId:string){
 if(!validId(actorId))throw new SdkError('validation','Exact Actor identity required');
 const actor=await req.runtime.documents.get('Actor',actorId,{minOwnership:'owner'});
 if(!actor||actor._id!==actorId)throw new SdkError('permission_denied','Current Actor ownership required');return actor;
}
async function current(req:ModuleServerRequest,actorId:string){
 const world=req.runtime.world;if(!world)throw new SdkError('not_ready','World rules unavailable');
 const rules=resolveRulesContext(world.snapshot()),actor=await owned(req,actorId);
 if(rules.status!=='supported'||rules.profile!=='2024')throw new SdkError('out_of_scope','Temporary HP edits require the qualified 2024 D&D 6.0.6 world profile');
 const hp=prepareHealth606(actor,rules).hp;
 world.assertRevision(rules.identity?.contextRevision??-1);assertSameRulesContext(rules,resolveRulesContext(world.snapshot()));
 if(hp.status!=='ready'||hp.temporaryEdit?.status!=='ready'||hp.temporaryEdit.value===null)throw new SdkError('out_of_scope',hp.temporaryEdit?.reason??hp.reason??'Temporary HP editing is unavailable for this character');
 return {actor,rules,before:hp.temporaryEdit.value};
}
/** No client-supplied patch, formula, authority, before-value or operation ID on review. */
export class TemporaryHpCommands{
 constructor(private journal:CommandJournal=commandJournal){}
 async review(req:ModuleServerRequest,actorId:string,after:unknown){
  if(!validAmount(after))throw new SdkError('validation','Temporary HP must be a nonnegative whole number up to 1000000000');
  const c=await current(req,actorId);if(c.before===after)throw new SdkError('validation','Temporary HP already has that value');
  const plan:CommandPlan={intent:{kind:'set-temporary-hp',before:c.before,after},fingerprints:{source:sourceHash(c.actor)},steps:[{id:'temporary-hp',kind:'set-temporary-hp',summary:`Replace temporary HP ${c.before} with ${after}`}]};
  const row=await this.journal.review(req,actorId,randomUUID(),plan);return this.view(req,actorId,row);
 }
 async execute(req:ModuleServerRequest,actorId:string,operationId:string){
  const row=await this.journal.executeReviewed(req,actorId,operationId,plan=>{
   const choice=intent(plan);
   let admitted:ReturnType<typeof resolveRulesContext>|undefined;
   return {revalidate:async()=>{const c=await current(req,actorId);admitted=c.rules;return c.before!==choice.before||sourceHash(c.actor)!==plan.fingerprints.source?'Actor source changed':null;},
    dispatch:async()=>{
     const receipt=await req.runtime.documents.patch('Actor',actorId,{'system.attributes.hp.temp':choice.after});
     if(receipt._id!==actorId)throw new SdkError('not_ready','Exact temporary HP acknowledgement unavailable');
     const received=rawTemp(receipt);return {ids:[`Actor.${actorId}`],details:{temp:validAmount(received)?received:null}};
    },confirm:async(_step,receipt)=>{if(record(receipt.details)?.temp!==choice.after)return false;const c=await current(req,actorId);if(!admitted)return false;assertSameRulesContext(admitted,c.rules);return rawTemp(c.actor)===choice.after&&c.before===choice.after;}};
  });return this.view(req,actorId,row);
 }
 async status(req:ModuleServerRequest,actorId:string,operationId:string){
  const row=await this.journal.inspect(req,actorId,operationId);if(!row)throw new SdkError('not_found','Temporary HP operation not found');return this.view(req,actorId,row);
 }
 private async view(req:ModuleServerRequest,actorId:string,row:CommandRecord){
  const identity=req.runtime.world?.snapshot().identity;
  if(identity?.instanceId!==row.scope.instance||identity.worldId!==row.scope.world)throw new SdkError('conflict','World changed;inspect this operation in its original world');
  const choice=intent(row.plan),actor=await owned(req,actorId),stored=rawTemp(actor);
  const after=req.runtime.world?.snapshot().identity;if(after?.instanceId!==identity.instanceId||after.worldId!==identity.worldId)throw new SdkError('conflict','World changed during operation inspection');
  // A matching stored value is inspection only. It never upgrades an uncertain
  // operation to confirmed or proves absence of concurrent native edits (E02).
  return {operationId:row.scope.operation,actorId,phase:row.phase,...choice,storedTemp:validAmount(stored)?stored:null,
   receiptIds:row.steps.flatMap(step=>step.receipt?.ids??[]),...(row.reason?{reason:row.reason}:{})};
 }
}
export const temporaryHpCommands=new TemporaryHpCommands();
