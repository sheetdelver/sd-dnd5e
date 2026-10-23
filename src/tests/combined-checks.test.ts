import assert from 'node:assert/strict';
import { DnD5eAdapter } from '../logic/adapter';
import { combinedCases, combinedSource, combinedOptions } from './fixtures/combined-scenarios';
import { skillContext, unavailableContexts, setSkillRoll } from './fixtures/skill-scenarios';
import { configuredRollCheck, preparedRollFormula, rollIntentSignature } from '../ui/components/shared/skillIntent';
const adapter = new DnD5eAdapter(), failures: string[] = [];
for (const row of combinedCases) {
    const source=combinedSource(row), before=structuredClone(source), actor=adapter.prepareActorData(source,skillContext());
    const expected=(row.expectedMode===1?'2d20kh1':row.expectedMode===-1?'2d20kl1':'1d20')+'+'+row.expectedTotal;
    if(adapter.getRollData(actor,row.kind,row.kind==='skill'?'prc':'thief',combinedOptions(row))?.formula!==expected) failures.push(row.id);
    const kind=row.kind as 'skill'|'tool',key=kind==='skill'?'prc':'thief',options=combinedOptions(row);
    const check=configuredRollCheck(actor,kind,key,options) as any;
    assert.equal(check.total,row.expectedTotal);assert.equal(check.prof,row.expectedProficiency);assert.equal(check.sourceMode,row.expectedMode);
    assert.equal(preparedRollFormula(actor,kind,key,options),expected);
    for(const [advantage,die] of [['normal','1d20'],['adv','2d20kh1'],['dis','2d20kl1']]) {
        const chosen={...options,advantage,situationalBonus:'-1.5'},formula=die+'+'+row.expectedTotal+'+(-1.5)';
        assert.equal(adapter.getRollData(actor,kind,key,chosen)?.formula,formula);
        assert.equal(preparedRollFormula(actor,kind,key,chosen),formula);
    }
    assert.deepEqual(source,before);
}
console.log('Selected requests failing independent expectations:',JSON.stringify(failures));
assert.deepEqual(failures,[]);
const source=combinedSource(combinedCases[8]),prepare=(input=source,context=skillContext())=>adapter.prepareActorData(input,context);
const baseline=prepare();
for(const kind of ['skill','tool'] as const) {
    const key=kind==='skill'?'prc':'thief',other=kind==='skill'?'tool':'skill',value=kind==='skill'?'thief':'prc';
    for(const bad of [null,3,[],{},true,'missing','Thieves\' tools','toString']) assert.equal(adapter.getRollData(baseline,kind,key,{[other]:bad}),null);
    for(const bad of [null,[],1,'missing','spellcasting']) assert.equal(adapter.getRollData(baseline,kind,key,{ability:bad}),null);
    for(const malformed of [null,[],false])assert.equal(adapter.getRollData(baseline,kind,key,malformed as any),null);
    for(const options of [{minimum:10},{flags:{}},{bonus:'2'}, {[kind]:'missing'},{pace:'slow'},{situationalBonus:'1d4'},{situationalBonus:'1+2'}]) assert.equal(adapter.getRollData(baseline,kind,key,options),null);
    const def=adapter.getRollData(baseline,kind,key)?.formula;
    assert.equal(adapter.getRollData(baseline,kind,key,{[other]:'',ability:''})?.formula,def,'Explicit clearing restores default');
    const signature=rollIntentSignature(baseline,kind);
    for(const {context} of unavailableContexts()) {
        const unavailable=prepare(source,context);
        assert.equal(adapter.getRollData(unavailable,kind,key,{[other]:value,ability:'dex'}),null);
        assert.notEqual(rollIntentSignature(unavailable,kind),signature);
        assert.equal(adapter.getRollData(prepare(),kind,key)?.formula,def);
    }
    const poisoned=structuredClone(source),system=poisoned.system as any;
    for(const entry of [system.skills.prc,system.tools.thief]) Object.assign(entry,{effectValue:99,prof:{flat:99,multiplier:99},total:999,mod:99});
    system.tools.thief.bonuses={check:'999'};
    for(const scope of ['check','skill','tool'])system.rolls.ability[scope].proficiency=99;
    const before=structuredClone(poisoned),choices={[other]:value,ability:'dex'};
    assert.equal(adapter.getRollData(prepare(poisoned),kind,key,choices)?.formula,adapter.getRollData(baseline,kind,key,choices)?.formula);assert.deepEqual(poisoned,before);
    const secondary=structuredClone(source),entry=(secondary.system as any)[other+'s'][value];
    entry.roll={bonus:'1d4',mode:'malformed',min:10};entry.ability='unqualified';
    (secondary.system as any).rolls.ability[other]={bonus:'1d4',mode:'malformed',min:10,proficiency:99};
    if(other==='skill')entry.bonuses={passive:'1d4',check:'1d4'};
    assert.equal(adapter.getRollData(prepare(secondary),kind,key,choices)?.formula,adapter.getRollData(baseline,kind,key,choices)?.formula,'Secondary contributes prof, not its ability/bonus/mode/range');
    for(const invalid of ['absent','proficiency']) {
        const changed=structuredClone(source);
        if(invalid==='absent')delete (changed.system as any)[other+'s'][value];else (changed.system as any)[other+'s'][value].value='1';
        if(invalid==='absent'&&other==='skill')assert.equal(adapter.getRollData(prepare(changed),kind,key,choices)?.formula,'2d20kh1+10','Missing standard skill initializes proficiency0;secondary grants no automatic advantage');else assert.equal(adapter.getRollData(prepare(changed),kind,key,choices),null);
        assert.notEqual(rollIntentSignature(prepare(changed),kind),signature);
    }
    for(const field of ['min','max']) {
        const changed=structuredClone(source);setSkillRoll(changed,`abilities.dex.check.roll`,{[field]:10});
        assert.equal(adapter.getRollData(prepare(changed),kind,key,choices),null,'Selected ability bounds remain unavailable');
    }
}
let modeCases=0;
for(const kind of ['skill','tool'] as const)for(const toolValue of [0,.5])for(const a of [-1,0,1])for(const b of [-1,0,1])for(const c of [-1,0,1])for(const d of [-1,0,1]) {
    const actor=structuredClone(source),system=actor.system as any;system.tools.thief.value=toolValue;
    const modes=[a,b,c,d],paths=[`${kind}s.${kind==='skill'?'prc':'thief'}.roll`,'abilities.wis.check.roll','rolls.ability.check',`rolls.ability.${kind}`];
    paths.forEach((path,i)=>{let obj=system;for(const part of path.split('.'))obj=obj[part];obj.mode=modes[i];});
    const mode=((toolValue>0||modes.includes(1))?1:0)-(modes.includes(-1)?1:0),total=kind==='skill'?15:17;
    const formula=(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+'+'+total;
    assert.equal(adapter.getRollData(prepare(actor),kind,kind==='skill'?'prc':'thief',{ability:'wis',...(kind==='skill'?{tool:'thief'}:{skill:'prc'})})?.formula,formula);modeCases++;
}
console.log(`R:38 independent builds/114 manual bonuses/${modeCases} combined mode cases, choices/source/poison/context gates PASS`);
