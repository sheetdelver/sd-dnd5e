import assert from 'node:assert/strict';
import { DnD5eAdapter } from '../logic/adapter';
import { skillSource, skillContext, setSkillRoll } from './fixtures/skill-scenarios';
import { abilitySource, abilityCases } from './fixtures/ability-scenarios';
const adapter=new DnD5eAdapter(), failures:string[]=[];
for(const kind of ['skill','ability','save']) {
    const key=kind==='skill'?'prc':'wis', total=kind==='ability'?2:5;
    const source=kind==='skill'?skillSource():abilitySource(abilityCases[1]);
    for(const [choice,die] of [['normal','1d20'],['adv','2d20kh1'],['dis','2d20kl1']]) {
        const prepared=adapter.prepareActorData(source,skillContext());
        try { assert.equal(adapter.getRollData(prepared,kind,key,{advantage:choice,situationalBonus:'2'})?.formula,`${die}+${total}+(2)`); }
        catch {failures.push(`${kind}/manual-${choice}`);}
    }
    for(const mode of [-1,1]) {
        const actor=structuredClone(source);
        setSkillRoll(actor,kind==='skill'?'skills.prc.roll':`abilities.wis.${kind==='save'?'save':'check'}.roll`,{mode});
        const before=structuredClone(actor), prepared=adapter.prepareActorData(actor,skillContext());
        try {assert.equal(adapter.getRollData(prepared,kind,key)?.formula,`${mode===1?'2d20kh1':'2d20kl1'}+${total}`);}
        catch {failures.push(`${kind}/source-${mode}`);}
        assert.deepEqual(actor,before);
    }
}
console.log('DD-R05 failed qualified requests:',failures);
assert.deepEqual(failures,[]);
