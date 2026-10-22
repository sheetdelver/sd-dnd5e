import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {skillContext,skillSource,unavailableContexts} from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter();
// Independent native MappingField expectations: missing keyed entries use the
// key initializer; an existing partial skill uses RollConfig's dex default.
for(const shape of ['absent','empty','partial','existing-partial']as const){
 const source=skillSource(),s=source.system as any;
 if(shape==='absent'){delete s.abilities;delete s.skills;}
 if(shape==='empty'){s.abilities={};s.skills={};}
 if(shape==='partial'){s.abilities={wis:{value:14}};s.skills={prc:{ability:'wis',value:1}};}
 if(shape==='existing-partial'){s.abilities={wis:{}};s.skills={prc:{}};}
 const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any;
 assert.equal(Object.keys(d.abilities).length,6,shape);assert.equal(Object.keys(d.skillChecks).length,18,shape);
 for(const key of ['str','dex','con','int','wis','cha'])assert.equal(d.abilities[key].score,key==='wis'&&shape==='partial'?14:10,shape+'/'+key);
 assert.equal(d.skillChecks.prc.ability,shape==='existing-partial'?'dex':'wis');
 assert.equal(d.skillChecks.prc.total,shape==='partial'?5:0);assert.equal(d.skillChecks.prc.passive,shape==='partial'?15:10);
 assert.equal(adapter.getRollData(actor,'skill','acr')?.formula,'1d20+0');
 assert.equal(adapter.getRollData(actor,'skill','prc',{ability:'str'})?.formula,shape==='partial'?'1d20+3':'1d20+0');
 assert.equal(adapter.getRollData(actor,'save','dex')?.formula,'1d20+0');assert.deepEqual(source,before);
 assert.ok(d.effectPreparation.sourceInitialization.defaults.some((r:any)=>r.path==='abilities.dex.value'&&r.value===10));
 for(const {context}of unavailableContexts()){const lost=adapter.prepareActorData(source,context);assert.equal(adapter.getRollData(lost,'skill','acr'),null);assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','acr')?.formula,'1d20+0');}
}
for(const value of [null,'10',true,{},-1]){const source=skillSource();(source.system as any).abilities.dex={value};const actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'save','dex'),null);assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,'1d20+5');}
{const source=skillSource(),s=source.system as any;delete s.abilities;delete s.skills;s.tools={thief:{value:1,ability:'dex'}};source.effects=[{_id:'initialDefault',system:{changes:[{key:'system.abilities.dex.value',type:'add',value:2}]}}as any];const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'tool','thief')?.formula,'1d20+4');assert.equal(adapter.getRollData(actor,'skill','acr')?.formula,'1d20+1');assert.deepEqual(source,before);}
{const source=skillSource();(source.system as any).skills={prc:{ability:'wis',value:1,total:99,prof:{multiplier:99}},unknown:{ability:'wis',value:2}};const actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','unknown'),null);assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,'1d20+5');}
process.stdout.write('R: sparse native ability/skill defaults,partial-entry distinction,initial effects,poison,malformed/context recovery and source preservation PASS\n');
