import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {trainingCases,trainingSource,trainingContext} from './fixtures/training-scenarios';
import {unavailableContexts,skillWorld,skillContext} from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of trainingCases){
    const source=trainingSource(row),before=structuredClone(source),prepared=adapter.prepareActorData(source,trainingContext(row));
    const facts=(prepared.derived as any).training,e=row.expected;
    assert.deepEqual(source,before,row.id);
    if(!facts){failures.push(row.id);continue;}
    assert.equal(adapter.getActorCardData(prepared).blocks?.find((stat:any)=>stat.title==='Training')?.value,facts.summary,row.id+'/card projection');
    // C60 admits this unchanged C27 final-field input; its source-only native
    // capture remains separate from the later final-effect comparisons.
    if(row.id==='unqualified-effect'){
        assert.equal(facts.status,'ready');assert.deepEqual(facts.categories.armor.sourceKeys,['lgt','hvy']);
        assert.equal(adapter.getRollData(prepared,'skill','prc')?.formula,'1d20+5');
        continue;
    }
    if(e.allUnavailable){assert.equal(facts.status,'unavailable');continue;}
    for(const [kind,expected] of [['armor',e.armor],['weapons',e.weapons]] as const){
        const category=facts.categories[kind];
        if(kind==='armor'&&e.armorUnavailable){assert.equal(category.status,'unavailable');continue;}
        assert.deepEqual(category.entries.filter((entry:any)=>entry.kind!=='source-key').map((entry:any)=>entry.label),expected,row.id+'/'+kind);
        assert.deepEqual(category.entries.filter((entry:any)=>entry.kind==='source-key').map((entry:any)=>entry.key),kind==='armor'?e.armorUnresolved??[]:e.weaponsUnresolved??[]);
    }
    for(const kind of ['armor','weapons'])for(const entry of facts.categories[kind].entries)if(entry.reference)assert.match(entry.reference,/^Compendium\./);
    if(e.toolsUnavailable)assert.equal(facts.categories.tools.status,'unavailable');
    else assert.deepEqual(facts.categories.tools.entries.filter((entry:any)=>entry.kind!=='source-key').map((entry:any)=>[entry.key,entry.coefficient]),e.tools,row.id+'/tools');
    assert.deepEqual(facts.categories.tools.entries?.filter((entry:any)=>entry.kind==='source-key').map((entry:any)=>entry.key)??[],e.toolsUnresolved??[]);
    assert.deepEqual(facts.categories.languages.spoken,e.languages,row.id+'/languages');
    assert.deepEqual(facts.categories.languages.communication.map((entry:any)=>[entry.key,entry.value,entry.units]),e.communication??[],row.id+'/communication');
    assert.deepEqual(facts.categories.languages.unresolved,e.unresolvedLanguages??[]);
    if(e.languagePartial)assert.equal(facts.categories.languages.status,'partial');
    assert.deepEqual(facts.categories.mastery.weaponKeys,e.mastered,row.id+'/mastery weapons');
    assert.deepEqual(facts.categories.mastery.additional.map((entry:any)=>entry.label),e.bonus,row.id+'/mastery bonus');
    for(const {context} of unavailableContexts()){
        assert.equal((adapter.prepareActorData(source,context).derived as any).training.status,'unavailable');
        assert.deepEqual((adapter.prepareActorData(source,trainingContext(row)).derived as any).training,facts);
    }
    assert.deepEqual(source,before,row.id);
}
console.log('Source training preparation cases failing-before:',JSON.stringify(failures));assert.deepEqual(failures,[]);

const legacy=skillWorld();(legacy.settings as any)['dnd5e.rulesVersion']={status:'world',value:'legacy'};
assert.equal((adapter.prepareActorData(trainingSource(trainingCases[0]),skillContext(legacy)).derived as any).training.status,'unavailable');
