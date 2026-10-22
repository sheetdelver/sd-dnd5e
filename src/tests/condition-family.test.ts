import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {familyCases,familySource} from './fixtures/condition-family-scenarios';
import {skillContext,skillWorld,unavailableContexts} from './fixtures/skill-scenarios';
import {rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
const formula=(mode:number,total:number)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+(total<0?'':'+')+total;
for(const row of familyCases){
    const source=familySource(row),before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any,e=row.expected;
    assert.deepEqual(source,before,row.id);
    if(adapter.getRollData(actor,'save','dex')?.formula!==formula(e.dexSave,2)||!d.conditions.rules){failures.push(row.id);continue;}
    assert.deepEqual(d.conditions.statuses,e.statuses,row.id);assert.equal(d.movement.speeds.walk,e.walk,row.id);assert.equal(d.movement.speeds.fly,e.fly,row.id);assert.equal(d.movement.speeds.jump,5);assert.equal(d.initiativeFacts.score,e.score,row.id);assert.equal(d.skills.prc.passive,e.passive,row.id);
    for(const [kind,key,total,mode]of [['save','dex',2,e.dexSave],['save','wis',2,e.wisSave],['ability','wis',2,e.skillMode],['skill','prc',5,e.skillMode],['tool','thief',5,e.skillMode],['initiative','initiative',2,e.init]] as const){assert.equal(adapter.getRollData(actor,kind,key)?.formula,formula(mode,total),row.id+'/'+kind);for(const [advantage,mode]of [['normal',0],['adv',1],['dis',-1]] as const)assert.equal(adapter.getRollData(actor,kind,key,{advantage,situationalBonus:'2'})?.formula,formula(mode,total)+'+(2)',row.id+'/manual');}
    for(const kind of ['skill','tool'] as const){const key=kind==='skill'?'prc':'thief',selection=kind==='skill'?{tool:'thief'}:{skill:'prc'};assert.equal(adapter.getRollData(actor,kind,key,{...selection,ability:'wis'})?.formula,formula(e.combinedMode,5));assert.equal(adapter.getRollData(actor,kind,key,{ability:'str'})?.formula,formula(e.skillMode,3));}
    const world=skillWorld();(world.settings as any)['dnd5e.initiativeScore']={status:'world',value:'all'};assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext(world)),'initiative','initiative')?.formula,String(e.score),row.id+'/fixed');
    const clean=structuredClone(source);(clean.system as any).conditions={};delete (clean.system as any).attributes.init.roll.modeCounts;delete (clean.system as any).abilities.dex.save.roll.modeCounts;for(const kind of ['check','save','skill','tool'])(clean.system as any).rolls.ability[kind].proficiency=0;const preparedClean=adapter.prepareActorData(clean,skillContext());assert.equal(adapter.getRollData(preparedClean,'save','dex')?.formula,formula(e.dexSave,2),row.id+'/poison invariance');assert.equal(adapter.getRollData(preparedClean,'initiative','initiative')?.formula,formula(e.init,2));
    const bounded=structuredClone(source);(bounded.system as any).abilities.dex.save.roll.min=10;const b=adapter.prepareActorData(bounded,skillContext());assert.equal(adapter.getRollData(b,'save','dex',{advantage:'normal'})?.formula,'1d20min10+2');assert.equal(adapter.getRollData(b,'save','dex',{advantage:'adv'}),null);
    const changed=structuredClone(source);(changed.effects![0] as any)._id='differentCondition';assert.notEqual(rollIntentSignature(actor,'save'),rollIntentSignature(adapter.prepareActorData(changed,skillContext()),'save'),row.id+'/source retirement');
    for(const {context}of unavailableContexts()){assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'save','dex'),null);assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'save','dex')?.formula,formula(e.dexSave,2));}
    assert.deepEqual(source,before,row.id);
}
console.log('Condition family workflows failing-before:',JSON.stringify(failures));assert.deepEqual(failures,[]);

for(const edit of [(s:any)=>{s.effects[0].statuses=['petrified'];},(s:any)=>{s.effects[0].system.rider={statuses:['prone']};},(s:any)=>{s.effects[0].system.conditions='{"k":"abilities.wis.value","v":14}';},(s:any)=>{s.effects[0].duration={value:10,units:'seconds'};},(s:any)=>{s.flags={dnd5e:{originalActor:'unknown'}};}]){const source=familySource(familyCases[0]);edit(source);const edited=structuredClone(source),actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'save','dex'),null);assert.deepEqual(source,edited);}
const missingDex=familySource(familyCases.find(row=>row.id==='dodging')!);delete (missingDex.system as any).abilities.dex;const sparse=adapter.prepareActorData(missingDex,skillContext());assert.equal(adapter.getRollData(sparse,'save','dex')?.formula,'2d20kh1+0','C76 schema Dexterity10 with Dodge source mode');assert.equal(adapter.getRollData(sparse,'skill','prc')?.formula,'1d20+5');
const badInit=familySource(familyCases.find(row=>row.id==='invisible')!);(badInit.system as any).attributes.init.roll.mode='bad';const partial=adapter.prepareActorData(badInit,skillContext());assert.equal(adapter.getRollData(partial,'initiative','initiative'),null);assert.equal(adapter.getRollData(partial,'skill','prc')?.formula,'1d20+5');assert.equal(adapter.getActorCardData(partial).blocks?.find(block=>block.title==='Level')?.value,5);
for(const id of ['dodging','dead']){const source=familySource(familyCases[0]);(source.system as any).traits.ci.value=[id];const actor=adapter.prepareActorData(source,skillContext());assert.equal((actor.derived as any).defenses.categories.ci.status,'ready');assert.ok((actor.derived as any).defenses.categories.ci.values.includes(id));}

for(const [id,statuses,value]of [['incapacitated',['incapacitated','surprised'],-1],['invisible',['invisible','invisible'],1]] as const){const template=familyCases.find(row=>row.id===id)!,row={...template,profile:{...template.profile,statuses:[...statuses]},effect:{path:'attributes.init.roll.mode',type:'subtract',value}};const actor=adapter.prepareActorData(familySource(row),skillContext());assert.equal((actor.derived as any).initiativeFacts.score,12);assert.equal(adapter.getRollData(actor,'initiative','initiative')?.formula,'1d20+2');}

// Newly admitted source envelopes retain malformed/dependent/rider/phase gates.
for(const type of ['stunned','unconscious']){
    const row=familyCases.find(row=>row.id===type+'-incapacity')!;
    for(const edit of [(s:any)=>{s.effects[0].statuses=[type==='stunned'?'unconscious':'stunned'];},(s:any)=>{s.effects[0].statuses=[5];},(s:any)=>{s.effects[0].system.rider={statuses:['prone']};},(s:any)=>{s.effects[0].system.changes=[{key:'system.abilities.wis.value',value:2,type:'add'}];},(s:any)=>{s.effects[0].system.conditions='{"k":"abilities.wis.value","v":14}';},(s:any)=>{s.effects[0].duration={value:10,units:'seconds'};},(s:any)=>{s.flags={dnd5e:{originalActor:'unknown'}};}]){
        const source=familySource(row);edit(source);const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext());
        assert.equal(adapter.getRollData(actor,'initiative','initiative'),null,type+'/unsupported source');assert.deepEqual(source,before);
        const recovered=adapter.prepareActorData(familySource(row),skillContext());assert.equal(adapter.getRollData(recovered,'initiative','initiative')?.formula,'2d20kl1+2');
    }
}
