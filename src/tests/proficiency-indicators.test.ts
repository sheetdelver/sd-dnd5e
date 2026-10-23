import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {proficiencyIndicatorCases,proficiencyIndicatorSource} from './fixtures/proficiency-indicator-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter();
for(const row of proficiencyIndicatorCases){
    const source=proficiencyIndicatorSource(row),before=structuredClone(source),prepared=adapter.prepareActorData(source,skillContext());
    const skill=(prepared.derived as any).skills.prc,ability=(prepared.derived as any).abilities.wis;
    assert.equal(skill.prof,row.prof,row.id);assert.equal(skill.total,row.total,row.id);assert.equal(skill.passive,row.passive,row.id);
    assert.equal(ability.saveProficient,row.saveProficient);assert.equal(ability.save,row.saveTotal);
    const formula=adapter.getRollData(prepared,'skill','prc')?.formula??null;
    assert.equal(formula,row.bounded||row.total===null?null:'1d20+'+row.total);
    if(row.bounded)assert.equal(adapter.getRollData(prepared,'skill','prc',{advantage:'normal'})?.formula,'1d20min10+6');
    for(const {context} of unavailableContexts()){
        const lost=adapter.prepareActorData(source,context);
        assert.equal((lost.derived as any).skills.prc.prof,null);
        assert.equal((lost.derived as any).abilities.wis.saveProficient,null);
        assert.equal((adapter.prepareActorData(source,skillContext()).derived as any).skills.prc.prof,row.prof);
    }
    assert.deepEqual(source,before);
}
console.log('Proficiency indicator operands: independent native arithmetic, poison/context and source preservation PASS');
