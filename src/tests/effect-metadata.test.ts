import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {healthCases,healthSource} from './fixtures/health-scenarios';
import {skillContext} from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter();
function source(flags:Record<string,unknown>,item=false,condition=false){
 const actor=healthSource(healthCases[0]);actor.effects=[];
 const effect:any={_id:'MetadataEffect',name:'Migrated focus',type:condition?'condition':'base',flags:{dnd5e:structuredClone(flags)},system:condition?{type:'poisoned'}:{changes:[{key:'system.abilities.wis.value',type:'add',value:2,phase:'initial'}]},...(condition?{statuses:['poisoned']}:{})};
 if(item)actor.items.push({_id:'MetadataFeature',name:'Migrated feature',type:'feat',system:{},flags:{dnd5e:structuredClone(flags)},effects:[effect]}as any);else actor.effects=[effect];return actor;
}
for(const flags of [{},{persistSourceMigration:true},{dependents:[]},{persistSourceMigration:true,dependents:[]}])for(const item of [false,true]){
 const raw=source(flags,item),before=structuredClone(raw),actor=adapter.prepareActorData(raw,skillContext()),d=actor.derived as any;
 assert.equal(d.effectPreparation.reason,undefined,JSON.stringify({flags,item}));assert.equal(d.level,1);assert.equal(d.hp.value,7);assert.equal(d.hp.effectiveMax,10);
 assert.equal(Object.values(d.abilities).filter((v:any)=>v.check.formula).length,6);assert.equal(Object.values(d.skills).filter((v:any)=>v.formula).length,18);
 assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,'1d20+5');assert.deepEqual(raw,before);
}
{const raw=source({persistSourceMigration:true,dependents:[]},false,true),before=structuredClone(raw),actor=adapter.prepareActorData(raw,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,'2d20kl1+4');assert.deepEqual(raw,before);}
for(const flags of [{dependentOn:'OtherEffect'},{dependents:[{uuid:'Actor.other.ActiveEffect.link'}]},{isTemporary:true},{spellLevel:1},{futureMechanic:true},{persistSourceMigration:'yes'},{dependents:{}}]){
 const raw=source(flags),before=structuredClone(raw);assert.equal(adapter.getRollData(adapter.prepareActorData(raw,skillContext()),'skill','prc'),null,JSON.stringify(flags));assert.deepEqual(raw,before);
}
process.stdout.write('Metadata-bearing characters retain supported checks/level/HP;actual dependencies,temporary and unknown mechanics stay restricted PASS\n');
