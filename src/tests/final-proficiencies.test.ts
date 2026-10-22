import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {finalProficiencyCases,finalProficiencySource} from './fixtures/final-proficiency-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import {preparedRollFormula,rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
const formula=(mode:number,total:number)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+'+'+total;
for(const row of finalProficiencyCases){
    const source=finalProficiencySource(row),before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any,e=row.expected;
    assert.deepEqual(source,before,row.id);
    if(adapter.getRollData(actor,'skill','prc')?.formula!==formula(e.mode,e.skill)){failures.push(row.id);continue;}
    assert.equal(d.skillChecks.prc.passive,e.passive,row.id+'/earlier passive');assert.equal(d.skillChecks.prc.preparedTotal,e.preparedSkill);assert.equal(d.skillChecks.prc.preparedProf,e.preparedSkillProf);assert.equal(d.tools.thief.preparedTotal,e.preparedTool);assert.equal(d.tools.thief.preparedProf,e.preparedToolProf);
    assert.equal(d.skills.prc.total,e.skill);assert.equal(d.skills.prc.prof,e.skillProf);assert.equal(d.tools.thief.total,e.tool);assert.equal(d.tools.thief.prof,e.toolProf);
    assert.equal(d.abilities.wis.check.total,e.check);assert.equal(d.abilities.wis.save,e.save);
    for(const [kind,key,options,total,mode]of [['skill','prc',{},e.skill,e.mode],['tool','thief',{},e.tool,e.mode],['skill','prc',{tool:'thief'},e.combined,e.combinedMode],['tool','thief',{skill:'prc',ability:'wis'},e.combined,e.combinedMode],['ability','wis',{},e.check,e.mode],['save','wis',{},e.save,0]]as const){
        assert.equal(adapter.getRollData(actor,kind,key,options)?.formula,formula(mode,total),row.id+'/'+kind);assert.equal(preparedRollFormula(actor,kind,key,options),formula(mode,total));
        for(const [advantage,manual]of [['normal',0],['adv',1],['dis',-1]]as const)assert.equal(adapter.getRollData(actor,kind,key,{...options,advantage,situationalBonus:'-2'})?.formula,formula(manual,total)+'+(-2)');
    }
    for(const {context}of unavailableContexts()){assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,formula(e.mode,e.skill));}
    const clean=structuredClone(source);delete (clean.system as any).skills.prc.prof;delete (clean.system as any).skills.prc.effectValue;for(const scope of Object.values((clean.system as any).rolls.ability)as any[])delete scope.proficiency;
    assert.equal(adapter.getRollData(adapter.prepareActorData(clean,skillContext()),'skill','prc')?.formula,formula(e.mode,e.skill));
    const changed=structuredClone(source);(changed.effects![1]as any)._id='newFinalIdentity';assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(adapter.prepareActorData(changed,skillContext()),'skill'));
    assert.deepEqual(source,before);
}
console.log('Final proficiency failing-before count:',failures.length,'of',finalProficiencyCases.length,'first:',failures.slice(0,3));assert.deepEqual(failures,[]);

for(const patch of [{value:null},{value:''},{value:true},{value:[]},{value:{}},{value:'@abilities.wis.mod'},{value:'1d4'},{value:1.5,type:'override'},{value:-1,type:'override'},{type:'custom'},{key:'system.rolls.ability.save.proficiency',value:.5,type:'override'},{key:'system.skills.prc.value'},{key:'system.abilities.wis.value'},{conditions:'{"k":"abilities.wis.value","v":14}'}]){
    const source=finalProficiencySource(finalProficiencyCases[0]);Object.assign((source.effects![1]as any).system.changes[0],patch);const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc'),null,JSON.stringify(patch));assert.deepEqual(source,before);assert.equal((actor.derived as any).conditions.status,'unavailable');
}
for(const itemId of ['finalItem',undefined]){const source=finalProficiencySource(finalProficiencyCases[0]);source.items.push({_id:itemId,type:'tool',system:{equipped:true},effects:[source.effects!.pop()]}as any);assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'tool','thief'),null);}
// Plan priority/source order applies across multiple final proficiency changes.
{const source=finalProficiencySource(finalProficiencyCases[0]);(source.effects![1]as any).system.changes=[{key:'system.rolls.ability.check.proficiency',type:'override',value:.5,phase:'final',priority:1},{key:'system.rolls.ability.check.proficiency',type:'add',value:.5,phase:'final',priority:2},{key:'system.rolls.ability.check.proficiency',type:'multiply',value:2,phase:'final',priority:3}];const actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,'1d20+8');assert.equal((actor.derived as any).skills.prc.passive,12);assert.deepEqual((actor.derived as any).effectPreparation.applied.filter((x:any)=>x.phase==='final').map((x:any)=>[x.before,x.value]),[[0,.5],[.5,1],[1,2]]);}
// Normal-only bounds affect execution,never the earlier passive or static total.
{const row=finalProficiencyCases.find(x=>x.expected.skill!==x.expected.preparedSkill)!,source=finalProficiencySource(row);(source.system as any).skills.prc.roll.min=10;const actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc',{advantage:'normal'})?.formula,'1d20min10+'+row.expected.skill);assert.equal(adapter.getRollData(actor,'skill','prc',{advantage:'adv'}),null);assert.equal((actor.derived as any).skills.prc.passive,row.expected.passive);}

for(const [type,value,prof]of [['add','0.5',.5],['subtract','-0.5',.5],['multiply','2',0],['override',' 1 ',1],['upgrade','2',2],['downgrade','0',0]]as const){const source=finalProficiencySource(finalProficiencyCases[0]);Object.assign((source.effects![1]as any).system.changes[0],{type,value});const actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc',{tool:'thief'})?.formula,'1d20+'+(2+Math.floor(3*prof)));assert.equal((actor.derived as any).skills.prc.passive,12);}
{const source=finalProficiencySource(finalProficiencyCases[0]);(source.effects![1]as any).system.changes.push({key:'system.skills.prc.roll.mode',type:'add',value:1,phase:'final'});const actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,'2d20kh1+5');assert.equal((actor.derived as any).skills.prc.passive,12);assert.equal(adapter.getRollData(actor,'skill','prc',{tool:'thief',ability:'str'})?.formula,'2d20kh1+3');}
