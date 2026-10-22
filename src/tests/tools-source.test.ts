import assert from 'node:assert/strict';
import { DnD5eAdapter } from '../logic/adapter';
import { toolCases, toolSource } from './fixtures/tool-scenarios';
import { skillContext, unavailableContexts, setSkillRoll, skillWorld } from './fixtures/skill-scenarios';
import { preparedRollCheck } from '../ui/components/shared/skillIntent';
import { numericD20Roll } from '../logic/preparation/d20-configuration';
import { TOOL_LABELS_606 } from '../logic/preparation/tools';
const adapter = new DnD5eAdapter();
for (const row of toolCases) {
    const source = toolSource(row), before = structuredClone(source);
    const prepared = adapter.prepareActorData(source, skillContext());
    const check = (prepared.derived.tools as any)?.[row.key];
    assert.equal(check?.total, row.expectedTotal, row.id);
    assert.equal(check.prof, row.expectedMultiplier);
    assert.equal(adapter.getRollData(prepared,'tool',row.key)?.formula, `1d20${row.expectedTotal < 0 ? '' : '+'}${row.expectedTotal}`);
    assert.deepEqual(source,before);
    assert.deepEqual(prepared.system,source.system);
}
const prepare = (source=toolSource(), context=skillContext()) => adapter.prepareActorData(source,context);
const baseline = prepare(), check = (actor:any) => actor.derived.tools.thief;
assert.equal(check(baseline).total,5);
for (const {context} of unavailableContexts()) {
    const source = toolSource(), before=structuredClone(source), unavailable=prepare(source,context);
    assert.equal(check(unavailable).total,null); assert.ok(check(unavailable).unavailableReason);
    assert.equal(preparedRollCheck(unavailable,'tool','thief'),undefined);
    assert.equal(adapter.getRollData(unavailable,'tool','thief'),null);
    assert.equal(check(prepare(source)).total,5); assert.deepEqual(source,before);
}
const poison=toolSource(), system=poison.system as any;
Object.assign(system.tools.thief,{total:99,mod:99,prof:{flat:99},effectValue:2,bonuses:{check:'99',passive:'99'}});
system.rolls={ability:{check:{proficiency:2},tool:{proficiency:2},skill:{proficiency:2},save:{proficiency:2}}};
const original=structuredClone(poison), poisoned=prepare(poison);
assert.equal(check(poisoned).total,5);assert.equal(check(poisoned).prof,1);assert.deepEqual(poison,original);
const scopes=['tools.thief.roll','abilities.dex.check.roll','rolls.ability.check','rolls.ability.tool'];
let modes=0;
for (const a of [-1,0,1]) for (const b of [-1,0,1]) for (const c of [-1,0,1]) for (const d of [-1,0,1]) {
    const source=toolSource(), values=[a,b,c,d];scopes.forEach((scope,i)=>setSkillRoll(source,scope,{mode:values[i]}));
    const prepared=prepare(source), mode=(values.includes(1)?1:0)-(values.includes(-1)?1:0);
    const expected=(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+'+5';
    assert.equal(check(prepared).sourceMode,mode);assert.equal(check(prepared).formula,expected);
    assert.equal(adapter.getRollData(prepared,'tool','thief')?.formula,expected);
    assert.equal(numericD20Roll(preparedRollCheck(prepared,'tool','thief')),expected);
    for (const [advantage,die] of [['normal','1d20'],['adv','2d20kh1'],['dis','2d20kl1']]) {
        assert.equal(adapter.getRollData(prepared,'tool','thief',{advantage,situationalBonus:'-1.5'})?.formula,die+'+5+(-1.5)');
    }
    modes++;
}
for(const scope of scopes) {
    for(const roll of [{},{min:null,max:null},{bonus:2,mode:0}]) {
        const source=toolSource();setSkillRoll(source,scope,roll);assert.ok(adapter.getRollData(prepare(source),'tool','thief'));
    }
    for(const roll of [{min:10},{max:15},{min:12,max:14}]) {
        const source=toolSource();setSkillRoll(source,scope,roll);const bounded=prepare(source);
        assert.equal(adapter.getRollData(bounded,'tool','thief')?.formula,'1d20'+('min' in roll?'min'+roll.min:'')+('max' in roll?'max'+roll.max:'')+'+5');
        assert.equal(adapter.getRollData(bounded,'tool','thief',{advantage:'adv'}),null);
        assert.equal(check(bounded).total,5,'Bounds never become a static bonus');
    }
    for(const roll of [{min:0},{max:'10'},{mode:2},{mode:null},{mode:'1'},{bonus:'1d4'},{bonus:'1+2'}]) {
        const source=toolSource();setSkillRoll(source,scope,roll);
        const unavailable=prepare(source);assert.equal(adapter.getRollData(unavailable,'tool','thief'),null);
        assert.ok(check(unavailable).unavailableReason);
        if ('min' in roll || 'max' in roll) assert.equal(check(unavailable).total,5,'Bounds never become a static bonus');
    }
}
for(const patch of [{ability:'unknown'},{ability:null},{ability:''},{value:-1},{value:3},{value:'1'},{value:null},{roll:[]},{roll:'bad'}]) {
    const source=toolSource();Object.assign((source.system as any).tools.thief,patch);
    assert.equal(adapter.getRollData(prepare(source),'tool','thief'),null,JSON.stringify(patch));
}
for(const value of [null,[],true,'thief']) {
    const source=toolSource();(source.system as any).tools=value;const unavailable=prepare(source);
    assert.equal((unavailable.derived.toolPreparation as any).status,'unavailable');assert.equal(adapter.getRollData(unavailable,'tool','thief'),null);
}
for(const value of [null,[],true,'tool']) {
    const source=toolSource();(source.system as any).tools.thief=value;
    assert.match(check(prepare(source)).unavailableReason,/entry malformed/);
}
const missing=toolSource(); delete (missing.system as any).abilities.dex;
assert.equal(check(prepare(missing)).total,3,'C76 native missing Dexterity initializes10');
for(const key of ['Thieves\' tools','unknown','toString','__proto__']) {
    const source=toolSource();(source.system as any).tools=JSON.parse(JSON.stringify({[key]:{ability:'dex',value:1}}));
    assert.equal(adapter.getRollData(prepare(source),'tool',key),null,'Names and unknown keys never become rule identity');
}
assert.equal(Object.keys(TOOL_LABELS_606).length,40);
for (const options of [{skill:'missing'},{tool:'missing'},{pace:'slow'},{situationalBonus:'1d4'},{situationalBonus:'1+2'},{situationalBonus:'1000000001'}]) {
    assert.equal(adapter.getRollData(baseline,'tool','thief',options),null);
}
assert.equal(adapter.getRollData(baseline,'skill','prc',{tool:'missing'}),null,'Unavailable selected tool cannot fall back');
const legacy=skillWorld();(legacy.settings as any)['dnd5e.rulesVersion']={status:'world',value:'legacy'};
assert.equal(adapter.getRollData(prepare(toolSource(),skillContext(legacy)),'tool','thief'),null);
assert.equal(adapter.getRollData(prepare(toolSource(),skillContext(legacy)),'skill','prc',{tool:'thief'}),null,'Legacy does not add combined checks');
for(const change of [(source:any)=>source.effects=[{disabled:false}],(source:any)=>source.flags={dnd5e:{toolExpertise:true}},(source:any)=>source.items.push({_id:'armor',type:'equipment',system:{equipped:true}})]) {
    const source=toolSource();change(source);const before=structuredClone(source);
    assert.equal(check(prepare(source)).total,null);assert.deepEqual(source,before);
}
const empty=toolSource();delete (empty.system as any).tools;
assert.equal(Object.keys(prepare(empty).derived.tools as Record<string,unknown>).length,0,'No grants inferred from missing source');
console.log(`R:8 independent source-only tools, ${modes} modes, source invariance and unavailable/recovery cases PASS`);

assert.equal(adapter.getRollData(baseline,'tool','thief',{ability:'str'})?.formula,'1d20+3','C76 standard alternate ability initializes10');
