import assert from 'node:assert/strict';
import vm from 'node:vm';
import {writeFileSync} from 'node:fs';
import {formulaRollOracle606} from './native-formula-roll-context-oracle.mjs';
import {nativeFormula606} from './native-formula-oracle.mjs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
import {option} from './lib/toolchain.mjs';
const {MathModel,MathActor,sandbox,files,n}=formulaRollOracle606,args=process.argv.slice(2),attributes='module/data/actor/templates/attributes.mjs',activity='module/data/activity/base-activity.mjs',old=sandbox.dnd5e.settings.proficiencyModifier;
vm.runInNewContext(`class ModifierAttributes {${n(attributes,'AttributesFields','prepareSpellcastingAbility')}}
class DamageDependency {${n(activity,'BaseActivityData','_processDamagePart')} ${n(activity,'BaseActivityData','getActionType')}}
globalThis.modifierOracle={ModifierAttributes,DamageDependency};`,sandbox);
const rows=[];
try{for(const mode of ['bonus','dice'])for(const score of [0,8,10,14,18,30])for(const base of [1,3,6]){sandbox.dnd5e.settings.proficiencyModifier=mode;
 const actor=Object.assign(new MathActor(),{flags:{dnd5e:{}},statuses:new Set(),conditionRollReduction:0,coverBonus:0,hasConditionEffect:()=>false,_isRemarkableAthlete:()=>false,addConditionRollReduction:()=>{},getFlag:()=>undefined});
 const model=Object.assign(new MathModel(),{parent:actor,attributes:{prof:base,ac:{},spellcasting:'wis'},details:{level:5},abilities:{wis:{value:score,proficient:0,max:null,attack:{roll:{bonus:'2'}},check:{roll:{}},save:{roll:{}}}},rolls:{attack:{bonus:'1'},ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:0}]))},bonuses:{spell:{dc:'2'}}});actor.system=model;model._source={};model.prepareAbilities({rollData:actor.getRollData({deterministic:true})});sandbox.modifierOracle.ModifierAttributes.prepareSpellcastingAbility.call(model);
 const mod=Math.floor((score-10)/2),attack=mod+base+3,dc=10+mod+base;assert.equal(model.abilities.wis.attack.value,attack);assert.equal(model.abilities.wis.dc,dc);assert.equal(model.attributes.spell.attack,attack);assert.equal(model.attributes.spell.dc,dc);assert.equal(model.attributes.spell.mod,mod);
 model.attributes.spellcasting='';sandbox.modifierOracle.ModifierAttributes.prepareSpellcastingAbility.call(model);assert.equal(model.attributes.spell.attack,base);assert.equal(model.attributes.spell.dc,8+base);assert.equal(model.attributes.spell.mod,0);rows.push({mode,score,base,attack,dc,mod,fallback:{attack:base,dc:8+base,mod:0}});
}}finally{sandbox.dnd5e.settings.proficiencyModifier=old;}
const damage=[];for(const actionType of ['mwak','rwak','msak','rsak'])for(const attackMode of ['','thrown'])for(const index of [0,1]){
 const actor={system:{rolls:{damage:Object.fromEntries(['mwak','rwak','msak','rsak'].map((key,i)=>[key,{bonus:String(i+1)}]))}}},item={system:{damage:{bonus:'3'}},getFlag:()=>undefined};
 const d=Object.assign(new sandbox.modifierOracle.DamageDependency(),{actor,item,actionType}),part={scaledFormula:()=> '6',types:Object.assign(new Set(['fire']),{first:()=> 'fire'})},result=d._processDamagePart(part,{attackMode},{prof:3,roll:{}},index),key=actionType==='mwak'&&attackMode?'rwak':actionType,bonus=['mwak','rwak','msak','rsak'].indexOf(key)+1;
 assert.deepEqual(Array.from(result.parts),index===0?['6',String(bonus),'3']:['6']);assert.equal(nativeFormula606.NativeMath.safeEval(result.parts.join('+')),index===0?9+bonus:6);damage.push({actionType,attackMode,index,parts:result.parts,expectedTotal:index===0?9+bonus:6});
}
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify({nativeCommit,rows,damage,sourceHashes:Object.fromEntries([attributes,activity,'module/data/actor/templates/common.mjs','module/data/actor/templates/creature.mjs'].map(path=>[path,sha256(files.get(path))])),limits:['108 initialized CommonTemplate.prepareAbilities/AttributesFields.prepareSpellcastingAbility profiles;empty AppliedRules and declared numeric Roll collaborators. No full source DataModel/dice/native runtime/operator acceptance.','16 actual BaseActivity._processDamagePart constructions distinguish first part versus later parts and thrown weapon scope. Damage base formula is a declared literal6 collaborator;no damage/scaling/critical engine qualification.','Actor attribute spell defaults do not establish per-spell class ability/casting eligibility;those require current source identity/capability qualification.']},null,2)+'\n');process.stdout.write('S:108 native prepared attack/DC/default profiles and16 damage-scope/part configurations PASS\n');

export const modifierOracle606={sandbox,files,n,modifiers:sandbox.modifierOracle};
