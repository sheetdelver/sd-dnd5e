import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {equipmentCases,equipmentSource} from './fixtures/equipment-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of equipmentCases){
    const source=equipmentSource(row),before=structuredClone(source),prepared=adapter.prepareActorData(source,skillContext()),d=prepared.derived as any,e=row.expected;
    if(d.ac!==e.ac||d.skills.ste.total!==e.skill||d.skills.ste.passive!==e.passive||e.ac!==null&&!d.equipmentPreparation){failures.push(row.id);continue;}
    const die=e.mode===1?'2d20kh1':e.mode===-1?'2d20kl1':'1d20',expected=e.skill===null?null:`${die}+${e.skill}`;
    assert.equal(adapter.getRollData(prepared,'skill','ste')?.formula??null,expected,row.id);
    if(e.ac!==null){
        assert.deepEqual(d.equipmentPreparation.warnings,row.warnings??[],row.id);
        assert.equal(adapter.getRollData(prepared,'initiative','initiative')?.formula,`${e.initiativeMode===1?'2d20kh1':e.initiativeMode===-1?'2d20kl1':'1d20'}${e.initiativeTotal!<0?'':'+'}${e.initiativeTotal}`,row.id);
        if(row.selected){assert.equal(adapter.getRollData(prepared,'skill','ste',{tool:'thief'})?.formula,'1d20+5');assert.equal(adapter.getRollData(prepared,'tool','thief',{skill:'ste'})?.formula,'2d20kh1+5');assert.equal(adapter.getRollData(prepared,'skill','ste',{ability:'wis'})?.formula,'2d20kl1+6');}
        for(const [advantage,manualDie] of [['normal','1d20'],['adv','2d20kh1'],['dis','2d20kl1']] as const)assert.equal(adapter.getRollData(prepared,'skill','ste',{advantage,situationalBonus:'2'})?.formula,`${manualDie}+${e.skill}+(2)`);
        const card=adapter.getActorCardData(prepared);assert.equal(card.blocks?.find(stat=>stat.title==='AC')?.value,e.ac);
    }
    for(const {context} of unavailableContexts()){
        const lost=adapter.prepareActorData(source,context);assert.equal(lost.derived.ac,null);assert.equal(adapter.getRollData(lost,'skill','ste'),null);
        assert.equal(adapter.prepareActorData(source,skillContext()).derived.ac,e.ac);
    }
    assert.deepEqual(source,before,row.id);
}
console.log('Equipment source cases failing before:',JSON.stringify(failures));assert.deepEqual(failures,[]);
