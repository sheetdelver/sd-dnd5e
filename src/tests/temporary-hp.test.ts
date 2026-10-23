import assert from 'node:assert/strict';
import {TemporaryHpCommands} from '../server/commands/temporary-hp';
import {CommandJournal} from '../server/commands/journal';
import {temporaryHpRuntime} from './fixtures/temporary-hp-runtime';
import {DnD5eAdapter} from '../logic/adapter';
import {skillContext} from './fixtures/skill-scenarios';
import {healthRoutes} from '../server/routes/health';

{
 const f=temporaryHpRuntime(),c=new TemporaryHpCommands(new CommandJournal()),before=structuredClone(f.actor());
 const review=await c.review(f.req,f.actor()._id,8);assert.equal(review.phase,'reviewed');assert.equal(review.before,3);assert.equal(review.after,8);assert.equal(f.writes(),0);assert.deepEqual(f.actor(),before);
 const result=await c.execute(f.req,f.actor()._id,review.operationId);assert.equal(result.phase,'confirmed');assert.equal(result.storedTemp,8);assert.deepEqual(result.receiptIds,[`Actor.${f.actor()._id}`]);assert.equal(f.writes(),1);
 assert.equal((await c.execute(f.req,f.actor()._id,review.operationId)).phase,'confirmed');assert.equal(f.writes(),1);
 const expected=structuredClone(before);(expected.system as any).attributes.hp.temp=8;assert.deepEqual(f.actor(),expected);
 const clear=await c.review(f.req,f.actor()._id,0);assert.equal((await c.execute(f.req,f.actor()._id,clear.operationId)).storedTemp,0);
}
for(const change of ['source','context','permission','effect','unsupported']as const){
 const f=temporaryHpRuntime(),c=new TemporaryHpCommands(new CommandJournal()),r=await c.review(f.req,f.actor()._id,8);
 if(change==='source')f.actor().name='Changed source';if(change==='context')(f.world().identity as any).contextRevision++;
 if(change==='unsupported')(f.world().identity as any).systemVersion='6.0.7';
 if(change==='effect')f.actor().effects=[{_id:'SameValue',type:'base',system:{changes:[{key:'system.attributes.hp.temp',type:'override',value:3,phase:'initial'}]}}];
 if(change==='permission'){
  f.owner(false);await assert.rejects(c.execute(f.req,f.actor()._id,r.operationId),/ownership/);await assert.rejects(c.status(f.req,f.actor()._id,r.operationId),/ownership/);f.owner(true);
 }
 const retired=await c.execute(f.req,f.actor()._id,r.operationId);assert.equal(retired.phase,'rejected-zero-write',change);assert.equal(f.writes(),0);
 f.reset();const fresh=await c.review(f.req,f.actor()._id,8);assert.equal((await c.execute(f.req,f.actor()._id,fresh.operationId)).phase,'confirmed');
}
for(const fault of ['lost','empty','mismatch','readback','journal']as const){
 const f=temporaryHpRuntime(),c=new TemporaryHpCommands(new CommandJournal()),r=await c.review(f.req,f.actor()._id,8);f.fault(fault);
 const result=await c.execute(f.req,f.actor()._id,r.operationId);assert.equal(result.phase,'uncertain',fault);assert.equal(f.writes(),1);assert.equal(result.receiptIds.length,['lost','empty'].includes(fault)?0:1,'Retain exact acknowledged identity even when value/confirmation/storage fails');f.fault('');
 assert.equal((await c.execute(f.req,f.actor()._id,r.operationId)).phase,'uncertain');assert.equal(f.writes(),1);
 const restart=new TemporaryHpCommands(new CommandJournal());assert.equal((await restart.status(f.req,f.actor()._id,r.operationId)).phase,'uncertain');assert.equal(f.writes(),1);
}
{
 const f=temporaryHpRuntime(),c=new TemporaryHpCommands(new CommandJournal());
 const r=await c.review(f.req,f.actor()._id,8),patch=f.req.runtime.documents.patch;
 let release!:()=>void,arrived!:()=>void;const waiting=new Promise<void>(resolve=>{release=resolve;}),ready=new Promise<void>(resolve=>{arrived=resolve;});
 f.req.runtime.documents.patch=async(...args)=>{arrived();await waiting;return patch(...args);};
 const execution=c.execute(f.req,f.actor()._id,r.operationId);await ready;let inspected=false;const inspection=c.status(f.req,f.actor()._id,r.operationId).then(value=>{inspected=true;return value;});await Promise.resolve();assert.equal(inspected,false,'Inspection waits for admitted execution to finish/fence');release();assert.equal((await execution).phase,'confirmed');assert.equal((await inspection).phase,'confirmed');assert.equal(f.writes(),1);
}
{
 const f=temporaryHpRuntime(),c=new TemporaryHpCommands(new CommandJournal());
 const r=await c.review(f.req,f.actor()._id,8);assert.equal((await c.status(f.req,f.actor()._id,r.operationId)).phase,'rejected-zero-write');assert.equal((await c.execute(f.req,f.actor()._id,r.operationId)).phase,'rejected-zero-write');assert.equal(f.writes(),0,'A delayed execute cannot resurrect an inspected review');
}
{
 const f=temporaryHpRuntime(),c=new TemporaryHpCommands(new CommandJournal());
 delete (f.actor().system as any).attributes.hp.temp;
 const raw=structuredClone(f.actor()),r=await c.review(f.req,f.actor()._id,8);assert.equal(r.before,0,'Verified606 initialization is distinct from persisted source');assert.equal(r.storedTemp,null);assert.deepEqual(f.actor(),raw);
 (f.world().identity as any).systemVersion='6.0.7';assert.equal((await c.status(f.req,f.actor()._id,r.operationId)).storedTemp,null,'Inspection must not invent a missing stored field on an unqualified version');assert.equal(f.writes(),0);
}
{
 const f=temporaryHpRuntime(),c=new TemporaryHpCommands(new CommandJournal());
 for(const amount of [-1,1.5,NaN,Infinity,'8',null,1_000_000_001])await assert.rejects(c.review(f.req,f.actor()._id,amount),/whole number/);
 const r=await c.review(f.req,f.actor()._id,8);const restart=new TemporaryHpCommands(new CommandJournal());assert.equal((await restart.execute(f.req,f.actor()._id,r.operationId)).phase,'rejected-zero-write');assert.equal(f.writes(),0);
 const source=f.actor(),before=structuredClone(source),a=new DnD5eAdapter();assert.deepEqual((a.prepareActorData(source,skillContext()).derived.hp as any).temporaryEdit,{status:'ready',value:3});assert.deepEqual(source,before);
 source.effects=[{_id:'TempEffect',type:'base',system:{changes:[{key:'system.attributes.hp.temp',type:'override',value:3,phase:'initial'}]}}];assert.equal((a.prepareActorData(source,skillContext()).derived.hp as any).temporaryEdit.status,'unavailable');
 const req={...f.req,method:'POST',json:async<T>()=>({action:'review',actorId:source._id,amount:9,access:{isGM:true}}as T)};const response:any=await healthRoutes['health/temporary'](req,{params:Promise.resolve({systemId:'dnd5e',route:['health','temporary']})});assert.equal(response.status,400);assert.equal(f.writes(),0);
}
process.stdout.write('Temporary HP review/write/readback, exact-field preservation, stale/owner/context retirement and uncertain recovery PASS (synthetic SDK)\n');
