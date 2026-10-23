import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {conditionCustomCases,conditionCustomSource} from './fixtures/condition-custom-scenarios';
import {skillContext,unavailableContexts} from './fixtures/skill-scenarios';
import {preparedRollFormula,rollIntentSignature} from '../ui/components/shared/skillIntent';
const adapter=new DnD5eAdapter(),failures:string[]=[];
const formula=(mode:number,total:number)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+(total<0?'':'+')+total;
for(const row of conditionCustomCases){
 const source=conditionCustomSource(row),before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),d=actor.derived as any,e=row.expected,key=row.field.split('.')[0];
 assert.deepEqual(source,before);
 if(adapter.getRollData(actor,'skill','prc')?.formula!==formula(e.skillMode,e.skill)){failures.push(row.id);continue;}
 if(['dr','di','dv','ci'].includes(key))assert.deepEqual(d.defenses.categories[key].custom,row.expectedCurrentLabels);else assert.deepEqual(d.training.categories[key==='armorProf'?'armor':key==='weaponProf'?'weapons':'languages'].entries.map((entry:any)=>entry.label),row.expectedCurrentLabels);
 assert.deepEqual(d.training.categories.languages.preparedSpoken,key==='languages'?row.expectedPreparedLabels:[]);assert.deepEqual(d.training.categories.languages.spoken,key==='languages'?row.expectedCurrentLabels:[]);assert.deepEqual(d.defenses.categories.ci.values,[]);
 assert.deepEqual(d.conditions.actorStatuses,e.statuses);assert.deepEqual(d.conditions.statuses,e.statuses);assert.deepEqual(d.conditions.levels,e.levels);assert.equal(d.conditions.rollReduction,e.reduction);assert.equal(d.skills.prc.passive,e.passive);assert.equal(d.initiativeFacts.value,e.initiative);assert.equal(d.initiativeFacts.score,e.score);
 assert.deepEqual(d.effectPreparation.applied.filter((entry:any)=>entry.effectId==='conditionCustom').map(({phase,before,value}:any)=>({phase,before,value})),row.expectedReceipts);
 for(const [kind,key,options,total,mode]of [['skill','prc',{},e.skill,e.skillMode],['tool','thief',{},e.skill,e.toolMode],['skill','prc',{tool:'thief'},e.skill,e.combinedSkillMode],['tool','thief',{skill:'prc',ability:'wis'},e.skill,e.combinedToolMode],['ability','wis',{},e.checkSave,e.abilityMode],['save','wis',{},e.checkSave,0],['initiative','initiative',{},e.initiative,e.initiativeMode]]as const){assert.equal(adapter.getRollData(actor,kind,key,options)?.formula,formula(mode,total),row.id+'/'+kind);assert.equal(preparedRollFormula(actor,kind,key,options),formula(mode,total));for(const [advantage,manual]of [['normal',0],['adv',1],['dis',-1]]as const)assert.equal(adapter.getRollData(actor,kind,key,{...options,advantage,situationalBonus:'2.5'})?.formula,formula(manual,total)+'+(2.5)');}
 const fixed=skillContext();(fixed.world!.settings as any)['dnd5e.initiativeScore']={status:'world',value:'all'};assert.equal(adapter.getRollData(adapter.prepareActorData(source,fixed),'initiative','initiative')?.formula,String(e.score));
 const bounded=structuredClone(source);(bounded.system as any).skills.prc.roll.min=10;const b=adapter.prepareActorData(bounded,skillContext());assert.ok(adapter.getRollData(b,'skill','prc',{advantage:'normal'}));assert.equal(adapter.getRollData(b,'skill','prc',{advantage:'adv'}),null);assert.equal(adapter.getRollData(b,'skill','prc',{advantage:'dis'}),null);assert.equal((b.derived as any).skills.prc.passive,e.passive);
 for(const {context}of unavailableContexts()){assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,formula(e.skillMode,e.skill));}
 const poisoned=structuredClone(source);(poisoned.system as any).rolls={ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:99}]))};(poisoned.system as any).conditions={poisoned:99,exhaustion:99};const preserved=structuredClone(poisoned),again=adapter.prepareActorData(poisoned,skillContext());assert.deepEqual((again.derived as any).training,d.training);assert.deepEqual((again.derived as any).conditions,d.conditions);assert.equal(adapter.getRollData(again,'skill','prc')?.formula,formula(e.skillMode,e.skill));assert.deepEqual(poisoned,preserved);
 const changed=structuredClone(source);(changed.effects![1]as any).system.changes[0].value='Different current text';assert.notEqual(rollIntentSignature(actor,'skill'),rollIntentSignature(adapter.prepareActorData(changed,skillContext()),'skill'));assert.deepEqual(source,before);
}
console.log('Condition/custom String failing-before:',failures.length,'of',conditionCustomCases.length,failures.slice(0,4));assert.deepEqual(failures,[]);

for(const scope of ['duplicate','petrified','missing-status','false-guard','immune','initial-ci','final-ci','level-default','level-seven','raw-status']){
 const source=conditionCustomSource(conditionCustomCases[0]),condition=source.effects![0]as any;
 if(scope==='duplicate')source.effects!.push({...structuredClone(condition),_id:'duplicate'});
 if(scope==='petrified'){condition.statuses=['petrified'];condition.system.type='petrified';}
 if(scope==='missing-status')delete condition.statuses;
 if(scope==='false-guard')condition.system.conditions='{"o":"OR","v":[]}';
 if(scope==='immune')(source.system as any).traits.ci.value=['poisoned'];
 if(scope==='initial-ci'||scope==='final-ci')source.effects!.push({_id:'ci',type:'base',system:{changes:[{key:'system.traits.ci.value',type:'add',value:'["poisoned"]',phase:scope==='initial-ci'?'initial':'final'}]}}as any);
 if(scope==='level-default'||scope==='level-seven'){condition.system.type='exhaustion';condition.statuses=['exhaustion'];condition.system.level=scope==='level-seven'?7:null;}
 if(scope==='raw-status')(source as any).statuses=['poisoned'];
 const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext());assert.equal(adapter.getRollData(actor,'skill','prc'),null,scope);assert.deepEqual(source,before);
}

{const first=adapter.prepareActorData(conditionCustomSource(conditionCustomCases.find(row=>row.id==='poisoned-None/0/languages.custom/both')!),skillContext()),changed=adapter.prepareActorData(conditionCustomSource(conditionCustomCases.find(row=>row.id==='exhaustion-2/0/languages.custom/both')!),skillContext());assert.notEqual(rollIntentSignature(first,'skill'),rollIntentSignature(changed,'skill'));assert.equal(adapter.getRollData(changed,'skill','prc')?.formula,'1d20+1');}
