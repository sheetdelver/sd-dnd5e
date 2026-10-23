import assert from 'node:assert/strict';
import {initializeClassFacts606} from '../logic/preparation/class-initialization';
import {initialFilterData606} from '../logic/preparation/initial-filter-data';
import {DnD5eAdapter} from '../logic/adapter';
import {initialClassFilterCases as cases,initialClassFilterSource as sourceFor,initialClassFilterExpected as expectedFor} from './fixtures/initial-class-filter-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import {rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of cases){
    const source=sourceFor(row),before=structuredClone(source);
    if(row.inputOnly){assert.equal(initialFilterData606(source)(row.path),null,'Missing items is outside SDK FoundryActor contract; helper only');continue;}
    const actor=adapter.prepareActorData(source,skillContext()),expected=expectedFor(row);
    const formula=adapter.getRollData(actor,'skill','prc')?.formula??null;assert.deepEqual(source,before,row.id);
    if(!expected){assert.equal(formula,null,row.id);continue;}
    if(formula!==`1d20+${expected.skill}`){failures.push(row.id);continue;}
    const read=initialFilterData606(source)(row.path);assert.ok(read&&read.origin==='class-base-preparation');
    if(read&&read.origin==='class-base-preparation')assert.deepEqual(read.classSources.map(entry=>entry.id),source.items.filter(item=>item.type==='class').map(item=>item._id));
    const facts=(actor.derived as any).characterFacts;assert.equal(facts.level.value,row.expectedLevel,row.id);assert.equal(facts.proficiency.value,row.expectedProficiency,row.id);
    const card=adapter.getActorCardData(actor);assert.equal(card.blocks?.find(block=>block.title==='Level')?.value,row.expectedLevel);assert.equal(card.blocks?.find(block=>block.title==='Prof')?.value,'+'+row.expectedProficiency);
    assert.equal((actor.derived as any).skills.prc.passive,expected.passive);
    assert.equal(adapter.getRollData(actor,'ability','wis')?.formula,`1d20+${expected.check}`);
    assert.equal(adapter.getRollData(actor,'save','wis')?.formula,`1d20+${expected.save}`);
    assert.equal(adapter.getRollData(actor,'tool','thief')?.formula,`1d20+${expected.tool}`);
    assert.equal(adapter.getRollData(actor,'skill','prc',{tool:'thief',advantage:'dis',situationalBonus:'2'})?.formula,`2d20kl1+${expected.combined}+(2)`);
    const poison=structuredClone(source);(poison.system as any).details.level=-99;(poison.system as any).attributes.prof=-99;
    assert.equal(adapter.getRollData(adapter.prepareActorData(poison,skillContext()),'skill','prc')?.formula,formula);
    if(row.levels.length){const identity=structuredClone(source);identity.items[0]._id='differentClassID';const same=adapter.prepareActorData(identity,skillContext());assert.equal(adapter.getRollData(same,'skill','prc')?.formula,formula);assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(same,'skill'));}
    for(const {context} of unavailableContexts()){
        assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);
        assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,formula);
    }
    assert.deepEqual(source,before,row.id);
}
console.log('Initial class filter requests failing-before:',JSON.stringify(failures));assert.deepEqual(failures,[]);

for(const type of ['npc','vehicle',''])assert.equal(initializeClassFacts606({type,items:[]}).status,'unavailable');
