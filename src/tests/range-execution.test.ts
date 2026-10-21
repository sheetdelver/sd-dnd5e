import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {normalRangeCases,rangeSource} from './fixtures/range-scenarios';
import {skillContext,skillWorld,unavailableContexts} from './fixtures/skill-scenarios';
import {preparedRollFormula,preparedRollAvailable,preparedRollReviewable,rollIntentSignature} from '../ui/components/shared/skillIntent';
import {numericD20Roll} from '../logic/preparation/d20-configuration';
const adapter=new DnD5eAdapter(),failures:string[]=[];
assert.equal(numericD20Roll({ability:'wis',total:5,formula:null,range:{minimum:10},defaultUnavailableReason:'Untrusted missing readiness'},{advantage:'normal'}),null);
for(const row of normalRangeCases){
    const source=rangeSource(row),before=structuredClone(source),prepared=adapter.prepareActorData(source,skillContext());
    if(adapter.getRollData(prepared,row.kind,row.key)?.formula!==row.formula){failures.push(row.id);continue;}
    assert.equal(preparedRollFormula(prepared,row.kind,row.key),row.formula);assert.equal(preparedRollAvailable(prepared,row.kind,row.key),true);
    if(row.kind==='initiative')assert.throws(()=>adapter.getInitiativeFormula(prepared),/character sheet using Normal/,'Formula-only HUD contract cannot advertise Normal-only bounds');
    for(const advantage of ['adv','dis'])assert.equal(adapter.getRollData(prepared,row.kind,row.key,{advantage}),null,'Bounded selection stays unqualified');
    assert.equal(adapter.getRollData(prepared,row.kind,row.key,{advantage:'normal',situationalBonus:'-1.5'})?.formula,row.formula+'+(-1.5)');
    for(const options of [{minimum:1},{maximum:20},{flags:{}},{range:{minimum:1}},{advantage:'bad'}])assert.equal(adapter.getRollData(prepared,row.kind,row.key,options),null,'Unknown requests never override or discard current source bounds');
    for(const mode of [-1,1] as const){
        const configured=adapter.prepareActorData(rangeSource(row,mode),skillContext());assert.equal(adapter.getRollData(configured,row.kind,row.key),null);assert.equal(preparedRollAvailable(configured,row.kind,row.key),false);
        assert.equal(preparedRollReviewable(configured,row.kind,row.key),true,'A qualified explicit mode can be reviewed without default fallback');
        assert.equal(adapter.getRollData(configured,row.kind,row.key,{advantage:'normal'})?.formula,row.formula,'Explicit Normal replaces only execution mode');
    }
    if(row.kind==='skill'){assert.equal((prepared.derived.skills as any).prc.total,5);assert.equal((prepared.derived.skills as any).prc.passive,15);}
    const malformed=rangeSource(row);let target=malformed.system as any;for(const key of row.scope.split('.'))target=target[key];target[row.field]=0;
    const unavailable=adapter.prepareActorData(malformed,skillContext());assert.equal(adapter.getRollData(unavailable,row.kind,row.key,{advantage:'normal'}),null);assert.equal(preparedRollReviewable(unavailable,row.kind,row.key),false);
    for(const {context} of unavailableContexts()){
        const lost=adapter.prepareActorData(source,context);assert.equal(adapter.getRollData(lost,row.kind,row.key,{advantage:'normal'}),null);assert.equal(preparedRollFormula(lost,row.kind,row.key,{advantage:'normal'}),null);
        assert.equal((adapter.prepareActorData(source,skillContext()).derived.lifecycle as any).status,'supported');
    }
    const changed=rangeSource({...row,field:row.field==='min'?'max':'min'});assert.notEqual(rollIntentSignature(prepared,row.kind),rollIntentSignature(adapter.prepareActorData(changed,skillContext()),row.kind));
    assert.deepEqual(source,before,row.id);
}
console.log('Normal bounded source cases failing before:',JSON.stringify(failures));assert.deepEqual(failures,[]);
const legacy=skillWorld();(legacy.settings as Record<string,unknown>)['dnd5e.rulesVersion']={status:'world',value:'legacy'};
const legacyBound=adapter.prepareActorData(rangeSource(normalRangeCases[0]),skillContext(legacy));
assert.equal(adapter.getRollData(legacyBound,'skill','prc',{advantage:'normal'}),null);assert.equal(preparedRollReviewable(legacyBound,'skill','prc'),false,'Legacy range support is not widened by modern mode alternatives');
