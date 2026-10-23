import {unavailableContexts} from './fixtures/skill-scenarios';
import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {readFlagCases,readFlagSource,readFlagContext} from './fixtures/read-rule-flag-scenarios';
const adapter=new DnD5eAdapter();
for(const row of readFlagCases){const source=readFlagSource(row),before=structuredClone(source),actor=adapter.prepareActorData(source,readFlagContext()),d=actor.derived as any,e=row.expected;
 assert.equal(d.skills.prc.total,e.skill,row.id);assert.equal(d.skills.prc.prof,e.skillProf,row.id);
 assert.equal(d.skills.prc.passive,e.passive,row.id);assert.equal(d.tools.thief.total,e.tool,row.id);assert.equal(d.tools.thief.prof,e.toolProf,row.id);
 assert.equal(d.skills.ath.total,e.ath,row.id);assert.equal(d.skills.ath.passive,e.athPassive,row.id);
 assert.equal(d.abilities.wis.save,e.save,row.id);assert.equal(d.abilities.wis.check.total,e.ability,row.id);assert.equal(d.initiativeFacts.value,e.initiative,row.id);assert.equal(d.initiativeFacts.score,e.initiativeScore,row.id);
 assert.equal(adapter.getRollData(actor,'skill','prc',{tool:'thief'})?.formula,(e.skillProf>0&&e.toolProf>0?'2d20kh1':'1d20')+'+'+e.combined,row.id);
 assert.equal(d.skills.inv.passive,12+Math.floor(3*Math.max(row.targets.check,row.targets.skill))+(row.flags.observantFeat?5:0));
 assert.equal(d.skills.ins.passive,12+Math.floor(3*Math.max(row.targets.check,row.targets.skill)));
 assert.deepEqual(source,before);
}
process.stdout.write('R:320 independent source Boolean read-rule profiles PASS\n');

for(const flag of ['diamondSoul','toolExpertise','observantFeat','remarkableAthlete'])for(const value of [1,'true',{},[]]){const source=readFlagSource(readFlagCases[0]);(source.flags as any).dnd5e[flag]=value;assert.equal(adapter.getRollData(adapter.prepareActorData(source,readFlagContext()),'skill','prc'),null);}
{const row=readFlagCases.find(row=>Object.values(row.flags).every(Boolean)&&row.coefficient===1&&Object.values(row.targets).every(v=>v===0))!,source=readFlagSource(row);(source.system as any).skills.ath.roll={mode:-1,min:10};const before=structuredClone(source),actor=adapter.prepareActorData(source,readFlagContext()),d=actor.derived as any;assert.equal(d.skills.ath.passive,12);assert.equal(adapter.getRollData(actor,'skill','ath')?.formula,'1d20min10+2');assert.equal(adapter.getRollData(actor,'skill','ath',{advantage:'adv'}),null);assert.equal(adapter.getRollData(actor,'skill','ath',{ability:'wis',advantage:'normal'})?.formula,'1d20min10+2');assert.equal(adapter.getRollData(actor,'initiative','initiative')?.formula,'2d20kh1+2');assert.deepEqual(source,before);}
for(const targets of [{check:1,tool:0,skill:0},{check:0,tool:1,skill:0}]){const row=readFlagCases.find(row=>row.flags.toolExpertise&&row.coefficient===0&&Object.keys(targets).every(key=>row.targets[key as keyof typeof targets]===targets[key as keyof typeof targets]))!,source=readFlagSource(row);source.items.push({_id:'FlagTool',name:'No name grants',type:'tool',system:{type:{baseItem:'thief'},uses:{max:'@item.prof.flat'}}}as any);const item=(adapter.prepareActorData(source,readFlagContext()).derived as any).ownedItems.items.FlagTool;assert.equal(item.proficiency.flat,targets.tool?6:3);assert.equal(item.uses.max,targets.tool?6:3);}

for(const row of readFlagCases.filter(row=>row.coefficient===1&&Object.values(row.targets).every(v=>v===0))){const source=readFlagSource(row),before=structuredClone(source);for(const {context}of unavailableContexts()){assert.equal(adapter.getRollData(adapter.prepareActorData(source,context),'skill','prc'),null);assert.equal(adapter.getRollData(adapter.prepareActorData(source,readFlagContext()),'skill','prc')?.formula,'1d20+'+row.expected.skill);}assert.deepEqual(source,before);}
