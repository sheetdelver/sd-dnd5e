import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {initialFilterCases,initialFilterSource,initialFilterExpected} from './fixtures/initial-filter-scenarios';
import {skillContext,skillWorld,unavailableContexts} from './fixtures/skill-scenarios';
import {rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of initialFilterCases){
    const source=initialFilterSource(row),before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),expected=initialFilterExpected(row),formula=adapter.getRollData(actor,'skill','prc')?.formula??null;
    assert.deepEqual(source,before,row.id);
    if(expected){
        if(formula!==`1d20+${expected.skill}`||(adapter.getRollData(actor,'save','wis')?.formula??null)!==`1d20+${expected.save}`){failures.push(row.id);continue;}
        assert.equal((actor.derived as any).skills.prc.passive,expected.passive);
        const card=adapter.getActorCardData(actor);assert.equal(card.blocks?.find(block=>block.title==='Level')?.value,5);assert.equal(card.blocks?.find(block=>block.title==='Prof')?.value,'+3');
        if(row.omitProficient)assert.ok((actor.derived as any).effectPreparation.initialized.some((entry:any)=>entry.key==='system.abilities.wis.proficient'&&entry.value===0&&entry.origin==='schema-default'));
        assert.equal(adapter.getRollData(actor,'ability','wis')?.formula,`1d20+${expected.check}`);
        assert.equal(adapter.getRollData(actor,'save','wis')?.formula,`1d20+${expected.save}`,row.id);
        assert.equal(adapter.getRollData(actor,'tool','thief')?.formula,`1d20+${expected.tool}`);
        assert.equal(adapter.getRollData(actor,'skill','prc',{tool:'thief',advantage:'dis',situationalBonus:'2'})?.formula,`2d20kl1+${expected.combined}+(2)`);
        for(const {context} of unavailableContexts()){
            assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);
            assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,formula);
        }
        const poisoned=structuredClone(source);(poisoned.system as any).abilities.wis.mod=-99;
        if(!row.missingGlobal&&!row.nullGlobal)for(const value of Object.values((poisoned.system as any).rolls.ability) as any[])value.proficiency=-99;
        assert.equal(adapter.getRollData(adapter.prepareActorData(poisoned,skillContext()),'skill','prc')?.formula,formula,'Nonpersisted/prepared-looking source remains nonauthoritative');
        const changed=structuredClone(source),effect=changed.effects!.at(-1) as any;
        if(row.scope==='change')effect.system.changes[0].conditions+=' ';else effect.system.conditions+=' ';
        assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(adapter.prepareActorData(changed,skillContext()),'skill'),'Equal-result definition edits retire stale intent');
    }else assert.equal(formula,null,row.id);
    assert.deepEqual(source,before,row.id);
}
console.log('Initial snapshot filter requests failing-before:',JSON.stringify(failures));assert.deepEqual(failures,[]);

const world=skillWorld();(world.settings as any)['dnd5e.rulesVersion']={status:'world',value:'legacy'};
const legacySource=initialFilterSource(initialFilterCases[0]),without=structuredClone(legacySource);without.effects=[];
assert.deepEqual(adapter.getRollData(adapter.prepareActorData(legacySource,skillContext(world)),'skill','prc'),adapter.getRollData(adapter.prepareActorData(without,skillContext(world)),'skill','prc'),'Selected documented legacy behavior is unchanged, not newly qualified');
