import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {planEffects606} from '../logic/preparation/effects';
import {itemEffectCases,itemEffectSource,itemEffectExpected} from './fixtures/item-effect-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import {rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of itemEffectCases){
    const source=itemEffectSource(row),before=structuredClone(source),expected=itemEffectExpected(row);
    const plan=planEffects606(source),prepared=adapter.prepareActorData(source,skillContext());
    const formula=adapter.getRollData(prepared,'skill','prc')?.formula??null;
    if(formula!==(expected?`1d20+${expected.skill}`:null)||Boolean(plan.reason)!==Boolean(row.reason))failures.push(row.id);
    assert.deepEqual(source,before,row.id);
    if(!expected){if(plan.reason)assert.equal(plan.reason,row.reason,row.id);continue;}
    if(formula!==`1d20+${expected.skill}`)continue;
    assert.equal((prepared.derived as any).skills.prc.passive,expected.passive,row.id);
    assert.equal(plan.decisions.at(-1)?.status,row.applied?'eligible':'item-suppressed',row.id);
    for(const [mode,die] of [['normal','1d20'],['adv','2d20kh1'],['dis','2d20kl1']]){
        assert.equal(adapter.getRollData(prepared,'skill','prc',{advantage:mode,situationalBonus:'2'})?.formula,`${die}+${expected.skill}+(2)`,row.id);
    }
    assert.equal(adapter.getRollData(prepared,'skill','prc',{tool:'thief'})?.formula,`2d20kh1+${expected.combined}`);
    assert.equal(adapter.getRollData(prepared,'tool','thief',{skill:'prc',ability:'wis'})?.formula,`2d20kh1+${expected.combinedTool}`);
    for(const {context} of unavailableContexts()){
        assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);
        assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,formula);
    }
    // Initialized global proficiency is never sourced from a prepared-looking field.
    const poison=structuredClone(source);(poison.system as any).rolls={ability:{check:{proficiency:99},skill:{proficiency:99}}};
    assert.equal(adapter.getRollData(adapter.prepareActorData(poison,skillContext()),'skill','prc')?.formula,formula);
    assert.deepEqual(source,before,row.id);
}
console.log('Item source/default eligibility failing cases:',JSON.stringify(failures));
assert.deepEqual(failures,[]);
const omitted=adapter.prepareActorData(itemEffectSource(itemEffectCases.find(row=>row.id==='tool-required-attuned-omitted')!),skillContext());
const explicit=adapter.prepareActorData(itemEffectSource(itemEffectCases.find(row=>row.id==='tool-required-attuned-false')!),skillContext());
assert.equal(adapter.getRollData(omitted,'skill','prc')?.formula,adapter.getRollData(explicit,'skill','prc')?.formula);
assert.notEqual(rollIntentSignature(omitted,'skill'),rollIntentSignature(explicit,'skill'),'Source/default provenance retires intent even with equal totals/revisions');
assert.equal(planEffects606(itemEffectSource(itemEffectCases.find(row=>row.id==='tool-required-attuned-omitted')!)).decisions.at(-1)?.eligibility?.origins?.attuned,'default');
