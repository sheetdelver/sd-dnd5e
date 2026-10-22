import {equipmentCases,equipmentSource} from './fixtures/equipment-scenarios';
import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {finalModeCases,finalModeSource} from './fixtures/final-mode-scenarios';
import {skillContext,skillWorld,unavailableContexts} from './fixtures/skill-scenarios';
import {rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
const formula=(mode:number,total:number)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+'+'+total;
for(const row of finalModeCases){const source=finalModeSource(row),before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any,e=row.expected;
    assert.deepEqual(source,before,row.id);
    if(adapter.getRollData(actor,'skill','prc')?.formula!==formula(e.skill,5)){failures.push(row.id);continue;}
    assert.equal(d.skills.prc.passive,e.passive,row.id+'/pre-final passive');assert.equal(d.initiativeFacts.score,e.score,row.id+'/pre-final score');
    for(const [kind,key,selection,mode,total]of [['skill','prc',{},e.skill,5],['tool','thief',{},e.tool,5],['skill','prc',{tool:'thief'},e.combinedSkill,5],['tool','thief',{skill:'prc',ability:'wis'},e.combinedTool,5],['ability','wis',{},e.wisCheck,2],['ability','dex',{},e.dexCheck,2],['save','wis',{},e.wisSave,2],['save','dex',{},e.dexSave,2],['initiative','initiative',{},e.initiative,2]]as const){
        assert.equal(adapter.getRollData(actor,kind,key,selection)?.formula,formula(mode,total),row.id+'/'+kind);for(const [advantage,manual]of [['normal',0],['adv',1],['dis',-1]]as const)assert.equal(adapter.getRollData(actor,kind,key,{...selection,advantage,situationalBonus:'2'})?.formula,formula(manual,total)+'+(2)');
    }
    const world=skillWorld();(world.settings as any)['dnd5e.initiativeScore']={status:'world',value:'all'};assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext(world)),'initiative','initiative')?.formula,String(e.score));
    const bounded=structuredClone(source);(bounded.system as any).skills.prc.roll.min=10;const b=adapter.prepareActorData(bounded,skillContext());assert.equal(adapter.getRollData(b,'skill','prc',{advantage:'normal'})?.formula,'1d20min10+5');assert.equal(adapter.getRollData(b,'skill','prc',{advantage:'adv'}),null);assert.equal((b.derived as any).skills.prc.passive,e.passive);
    const changed=structuredClone(source);(changed.effects![1] as any)._id='differentFinalEffect';assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(adapter.prepareActorData(changed,skillContext()),'skill'));
    for(const {context}of unavailableContexts()){assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,formula(e.skill,5));}
    assert.deepEqual(source,before,row.id);
}
console.log('Final mode workflows failing-before:',JSON.stringify(failures));assert.deepEqual(failures,[]);

for(const patch of [{key:'system.skills.prc.total'},{key:'system.abilities.wis.max'},{key:'system.rolls.ability.check.proficiencyDice'},{key:'system.skills.missing.roll.mode'},{key:'system.tools.missing.roll.mode'},{type:'custom'},{value:undefined},{value:null},{value:''},{value:true},{value:2},{value:'@abilities.wis.mod'},{value:'1d4'},{type:'upgrade',value:-1},{type:'downgrade',value:1},{conditions:'{"k":"abilities.wis.value","v":14}'}]){
    const source=finalModeSource(finalModeCases[0]);Object.assign((source.effects![1]as any).system.changes[0],patch);const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc'),null,JSON.stringify(patch));assert.equal((actor.derived as any).conditions.status,'unavailable');assert.deepEqual(source,before);const clean=adapter.prepareActorData(finalModeSource(finalModeCases[0]),skillContext());assert.equal(adapter.getRollData(clean,'skill','prc')?.formula,'1d20+5');
}
for(const field of ['system.skills.prc.roll.modeCounts','system.attributes.init.roll.modeCounts','system.abilities.wis.check.roll.modeCounts']){const source=finalModeSource(finalModeCases[0]),clean=structuredClone(source),path=field.split('.');let parent:any=clean;for(const key of path.slice(0,-1))parent=parent[key];delete parent[path.at(-1)!];assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,adapter.getRollData(adapter.prepareActorData(clean,skillContext()),'skill','prc')?.formula);}

for(const [type,value,mode,combined]of [['add',1,0,0],['subtract',-1,0,1],['override',1,1,1],['upgrade',0,0,1]]as const){const source=equipmentSource(equipmentCases.find(row=>row.id==='stealth-disadvantage-after-passive')!);source.effects=[{_id:'finalStealthMode',type:'base',system:{changes:[{key:'system.skills.ste.roll.mode',type,value,phase:'final'}]}}] as any;const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext());assert.equal((actor.derived as any).skills.ste.passive,15);assert.equal(adapter.getRollData(actor,'skill','ste')?.formula,formula(mode,5));assert.equal(adapter.getRollData(actor,'skill','ste',{tool:'thief'})?.formula,formula(combined,5));assert.deepEqual(source,before);}

for(const itemId of ['finalModeItem',undefined]){const source=finalModeSource(finalModeCases[0]),effect=source.effects!.pop();source.items.push({_id:itemId,type:'tool',system:{equipped:true},effects:[effect]}as any);const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc'),null);assert.match((actor.derived as any).effectPreparation.reason,/Transferred Item final/);assert.deepEqual(source,before);}
