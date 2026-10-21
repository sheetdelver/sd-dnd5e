import assert from 'node:assert/strict';
import { DnD5eAdapter } from '../logic/adapter';
import { bonusEffectCases, bonusEffectSource } from './fixtures/bonus-effect-scenarios';
import { skillContext, unavailableContexts, setSkillRoll } from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of bonusEffectCases){
    const source=bonusEffectSource(row),before=structuredClone(source),prepared=adapter.prepareActorData(source,skillContext()),e=row.expected;
    const formula=adapter.getRollData(prepared,'skill','prc')?.formula??null;
    if(e){
        if(formula!==`1d20+${e.skill}`){failures.push(row.id);continue;}
        const d=prepared.derived as any;
        assert.equal(d.skills.prc.passive,e.passive,row.id);assert.equal(d.tools.thief.total,e.tool,row.id);
        assert.equal(d.abilities.wis.check.total,e.check,row.id);assert.equal(d.abilities.wis.save,e.save,row.id);
        assert.equal(adapter.getRollData(prepared,'skill','prc',{tool:'thief'})?.formula,`2d20kh1+${e.combined}`,row.id);
        assert.equal(adapter.getRollData(prepared,'tool','thief',{skill:'prc',ability:'wis'})?.formula,`2d20kh1+${e.combinedTool}`,row.id);
        const applied=d.effectPreparation.applied.at(-1);assert.equal(applied.formula,row.expectedFormula,row.id);assert.equal(applied.value,row.expectedBonus,row.id);
        for(const {context} of unavailableContexts())assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null,row.id);
        for(const mode of ['normal','adv','dis'])assert.equal(adapter.getRollData(prepared,'skill','prc',{tool:'thief',advantage:mode,situationalBonus:'2'})?.formula,`${mode==='adv'?'2d20kh1':mode==='dis'?'2d20kl1':'1d20'}+${e.combined}+(2)`);
        const malformed=structuredClone(source);(malformed.system as any).rolls.ability.check='bad';assert.equal(adapter.getRollData(adapter.prepareActorData(malformed,skillContext()),'skill','prc'),null,row.id);
        const bounded=structuredClone(source);setSkillRoll(bounded,'skills.prc.roll',{...(bounded.system as any).skills.prc.roll,min:10});const boundPrepared=adapter.prepareActorData(bounded,skillContext());assert.equal(adapter.getRollData(boundPrepared,'skill','prc')?.formula,`1d20min10+${e.skill}`);assert.equal(adapter.getRollData(boundPrepared,'skill','prc',{advantage:'adv'}),null);
    }else assert.equal(formula,null,row.id);
    assert.deepEqual(source,before,row.id);
}
console.log('Constant bonus effect requests failing before:',JSON.stringify(failures));assert.deepEqual(failures,[]);
