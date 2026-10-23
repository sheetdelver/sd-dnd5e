import assert from 'node:assert/strict';
import fixture from '../../tests/fixtures/native-6.0.6/filter-dispositions.json';
import {initialFieldFilter606,ruleFilter606,type RuleFilterRead606} from '../logic/preparation/constant-filters';
import {DnD5eAdapter} from '../logic/adapter';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import {predicateSource} from './fixtures/predicate-scenarios';
const failures:string[]=[];
for(const row of fixture.cases){const input:RuleFilterRead606|null=row.kind==='number'?{key:'value',value:row.operand as number,origin:'schema-default'}:row.kind==='scalar'?{key:'value',kind:'scalar',value:row.operand as string,origin:'configured-roll'}:row.kind==='set'?{key:'value',kind:'set',value:row.operand as string[],sourceValue:row.operand as string[],origin:'schema-initialized-source'}:null;
 for(const negate of [false,true]){const raw={k:'value',o:row.operation,v:row.literal},definition=JSON.stringify(negate?{o:'NOT',v:raw}:raw),actual=ruleFilter606(definition,key=>key==='value'?input:null);
  try{assert.equal(actual.status,row.moduleStatus,row.id);if(actual.status==='ready'){assert.equal(actual.matches,!negate,row.id);assert.equal(actual.phase,row.kind==='scalar'?'configured-roll':'initial');}assert.equal(ruleFilter606(definition,()=>null).status,'unavailable',row.id+'/unknown snapshot');}catch(error){failures.push(String(error));}
 }
}
if(failures.length){process.stderr.write(failures.join('\n')+'\n');throw Error(`${failures.length}/36 predicate dispositions failed`);}
// These native-compatible comparisons are typed and strict:membership does not
// coerce numeric literals;unknown predicates are not hidden by true OR branches.
for(const [o,v,truth]of [['in',['14'],false],['in',[14],true],['contains','4',true],['startswith','1',true],['endswith','5',false]]as const){const result=initialFieldFilter606(JSON.stringify({k:'score',o,v}),key=>key==='score'?{key,value:14,origin:'source'}:null);assert.equal(result.status,'ready');assert.equal(result.status==='ready'&&result.matches,truth);}
const adapter=new DnD5eAdapter();
for(const operation of ['contains','startswith','endswith','in'])for(const score of [14,18]){const source=predicateSource(score,operation);if(operation==='startswith')(source.effects![0]as any).system.conditions=JSON.stringify({k:'abilities.wis.value',o:operation,v:'14'});const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc')?.formula,'1d20+7');assert.equal((actor.derived as any).skills.prc.passive,17);assert.deepEqual(source,before);
 for(const {context}of unavailableContexts()){assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,'1d20+7');}}
for(const operation of ['icontains','istartswith','iendswith','missing']){const source=predicateSource(14,operation),before=structuredClone(source);assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc'),null);assert.deepEqual(source,before);}
const mixed=ruleFilter606(JSON.stringify([{k:'score',v:14},{k:'roll.type',v:'skill'}]),key=>key==='score'?{key,value:14,origin:'source'}:key==='roll.type'?{key,kind:'scalar',value:'skill',origin:'configured-roll'}:null);assert.equal(mixed.status==='ready'&&mixed.phase,'mixed');
process.stdout.write('R:17 comparison/6 operator inventory,36 predicate dispositions,strict literals,phase provenance and8 source/context/recovery profiles PASS\n');
