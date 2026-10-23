import assert from 'node:assert/strict';
import { DnD5eAdapter } from '../logic/adapter';
import { numericEffectCases, numericEffectSource } from './fixtures/effect-scenarios';
import { skillContext, unavailableContexts, setSkillRoll } from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of numericEffectCases){
    const source=numericEffectSource(row),before=structuredClone(source),prepared=adapter.prepareActorData(source,skillContext()),e=row.expected;
    const formula=adapter.getRollData(prepared,'skill','prc')?.formula??null;
    if(e){
        if(formula!==`1d20+${e.skill}`){failures.push(row.id);continue;}
        const d=prepared.derived as any;
        assert.equal(d.skills.prc.passive,e.passive,row.id);assert.equal(d.abilities.wis.score,e.score,row.id);
        assert.equal(d.abilities.wis.check.total,e.check,row.id);assert.equal(d.abilities.wis.save,e.save,row.id);
        assert.equal(d.tools.thief.total,e.tool,row.id);
        assert.equal(adapter.getRollData(prepared,'skill','prc',{tool:'thief'})?.formula,`${e.combinedMode===1?'2d20kh1':'1d20'}+${e.combined}`,row.id);
        for(const {context} of unavailableContexts()){
            const lost=adapter.prepareActorData(source,context);assert.equal(adapter.getRollData(lost,'skill','prc'),null,row.id);
            assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,formula,row.id);
        }
        for(const advantage of ['normal','adv','dis'])assert.equal(adapter.getRollData(prepared,'skill','prc',{tool:'thief',advantage,situationalBonus:'2'})?.formula,`${advantage==='adv'?'2d20kh1':advantage==='dis'?'2d20kl1':'1d20'}+${e.combined}+(2)`);
        const modes=structuredClone(source);setSkillRoll(modes,'skills.prc.roll',{mode:1});setSkillRoll(modes,'rolls.ability.check',{mode:-1});
        assert.equal(adapter.getRollData(adapter.prepareActorData(modes,skillContext()),'skill','prc',{tool:'thief'})?.formula,`1d20+${e.combined}`,row.id);
        setSkillRoll(modes,'skills.prc.roll',{min:10});const boundPrepared=adapter.prepareActorData(modes,skillContext());assert.equal(adapter.getRollData(boundPrepared,'skill','prc'),null,row.id);assert.equal(adapter.getRollData(boundPrepared,'skill','prc',{advantage:'normal'})?.formula,`1d20min10+${e.skill}`,row.id);
        const cleared=structuredClone(source);cleared.effects=[];assert.equal(adapter.getRollData(adapter.prepareActorData(cleared,skillContext()),'skill','prc')?.formula,row.id==='global-positive-automatic'?'1d20+2':'1d20+5',row.id);
    }else{assert.equal(formula,null,row.id);assert.ok((prepared.derived as any).skills.prc.unavailableReason,row.id);}
    assert.deepEqual(source,before,row.id);
}
console.log('Initial numeric effect requests failing before:',JSON.stringify(failures));assert.deepEqual(failures,[]);
