import assert from 'node:assert/strict';
import type {ModuleServerRequest} from '@sheet-delver/sdk/server';
import {healthCases,healthSource} from './health-scenarios';
import {skillWorld} from './skill-scenarios';
/** Synthetic SDK runtime, not native transport acceptance. */
export function temporaryHpRuntime(){
 let actor=healthSource(healthCases[0]);actor.effects=[];let world=skillWorld(),owns=true,fail:''|'lost'|'empty'|'mismatch'|'readback'|'journal'='';
 let writes=0;const patches:unknown[]=[],store=new Map<string,any>();
 const req={getAccessContext:()=>({moduleId:'dnd5e',userId:'owner',role:2,isGM:false}),runtime:{moduleId:'dnd5e',
  world:{snapshot:()=>structuredClone(world),assertRevision:(revision:number)=>{assert.equal(revision,world.identity.contextRevision);}},
  documents:{get:async(type:string,id:string,opts:any)=>{assert.equal(type,'Actor');assert.equal(opts.minOwnership,'owner');return owns&&id===actor._id?structuredClone(actor):null;},
   patch:async(type:string,id:string,patch:any)=>{assert.equal(type,'Actor');assert.equal(id,actor._id);assert.deepEqual(Object.keys(patch),['system.attributes.hp.temp']);assert.ok(owns);writes++;patches.push(structuredClone(patch));(actor.system as any).attributes.hp.temp=patch['system.attributes.hp.temp'];
    if(fail==='lost')throw Error('Lost acknowledgement');if(fail==='empty')return {};const receipt=structuredClone(actor);
    if(fail==='mismatch')(receipt.system as any).attributes.hp.temp=999;if(fail==='readback')(actor.system as any).attributes.hp.temp=999;
    return receipt;
   }},dataStore:{get:async(key:string)=>structuredClone(store.get(key)??null),set:async(key:string,value:any)=>{if(fail==='journal'&&writes)throw Error('Journal failure');store.set(key,structuredClone(value));}}
 }}as unknown as ModuleServerRequest;
 return {req,store,patches,actor:()=>actor,world:()=>world,writes:()=>writes,owner:(value:boolean)=>{owns=value;},fault:(value:typeof fail)=>{fail=value;},reset:()=>{actor=healthSource(healthCases[0]);actor.effects=[];world=skillWorld();}};
}
