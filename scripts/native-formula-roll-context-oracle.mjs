import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {effectOracle606} from './native-effect-oracle.mjs';
import {nativeFormula606} from './native-formula-oracle.mjs';
import {moduleRoot,option} from './lib/toolchain.mjs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
const {sandbox,files,n}=effectOracle606,args=process.argv.slice(2);
sandbox.nativeFormula606=nativeFormula606;
vm.runInNewContext(`class MathModel extends numeric.CreatureTemplate {${n('module/data/abstract/actor-data-model.mjs','ActorDataModel','getRollData')}}
class MathActor extends numeric.NativeDispatch {${['getRollData','#rollD20Test'].map(key=>n('module/documents/actor/actor.mjs','Actor5e',key)).join('\n')}runD20(...args){return this.#rollD20Test(...args);}}
globalThis.formulaContext={MathModel,MathActor};`,sandbox);
const {MathModel,MathActor}=sandbox.formulaContext,rows=[];
const previous=sandbox.dnd5e.settings.proficiencyModifier;sandbox.dnd5e.settings.proficiencyModifier='bonus';
try{for(const [coefficient,preparedTotal,currentTotal,target=0,level=5,base=3]of [[0,8,8],[.5,9,7],[1,11,11],[2,14,17],[1,14,17,2],[.5,4,3,0,0,1],[.5,22,19,0,20,6],[2,31,37,0,20,6]]){
 const actor=Object.assign(new MathActor(),{flags:{dnd5e:{}},statuses:new Set(),conditionRollReduction:0,coverBonus:0,hasConditionEffect:()=>false,_isRemarkableAthlete:()=>false,addConditionRollReduction:()=>{},getFlag:()=>undefined});
 const model=Object.assign(new MathModel(),{parent:actor,attributes:{prof:base,ac:{}},details:{level},abilities:{wis:{value:14,proficient:0,max:null,attack:{roll:{}},check:{roll:{bonus:'max(1, @abilities.wis.mod)'}},save:{roll:{}}},dex:{value:18,proficient:0,max:null,attack:{roll:{}},check:{roll:{}},save:{roll:{}}}},skills:{prc:{ability:'wis',value:coefficient,roll:{bonus:'floor(@details.level / 2)'},bonuses:{passive:'ceil(@prof/2)'}}},tools:{thief:{ability:'dex',value:1,roll:{bonus:'2*(3-1)'}}},rolls:{ability:{check:{proficiency:target,bonus:'@prof - 1'},skill:{proficiency:0},tool:{proficiency:0},save:{proficiency:0}}},bonuses:{spell:{}}});actor.system=model;model._source=structuredClone({skills:model.skills,tools:model.tools});
 const oldRoll=sandbox.Roll;sandbox.Roll=class{constructor(formula,data={}){this.formula=nativeFormula606.replaceFormulaData(formula,data);this.isDeterministic=true;}evaluateSync(){return {total:nativeFormula606.NativeMath.safeEval(this.formula)};}};
 const rollData=actor.getRollData({deterministic:true});model.prepareAbilities({rollData});model.skills.prc=model.prepareSkill('prc',{rollData,originalSkills:{}});model.prepareTools({rollData});sandbox.Roll=oldRoll;
 assert.equal(model.skills.prc.total,preparedTotal);assert.equal(model.skills.prc.passive,preparedTotal+10+Math.ceil(base/2));
 const config={};actor._buildSkillToolConfig('skill',actor,{ability:'wis',skill:'prc'},config);
 const expanded=nativeFormula606.replaceFormulaData(config.parts.join(' + '),config.data),observed=nativeFormula606.NativeMath.safeEval(expanded);assert.equal(observed,currentTotal);
 if(target===2){const build=sandbox.CONFIG.Dice.D20Roll.build;let capture;sandbox.CONFIG.Dice.D20Roll.build=async config=>{capture=config.rolls[0];return [];};try{await actor.runD20('check',{ability:'wis'},{},{});}finally{sandbox.CONFIG.Dice.D20Roll.build=build;}const expression=nativeFormula606.replaceFormulaData(capture.parts.join(' + '),capture.data);assert.equal(nativeFormula606.NativeMath.safeEval(expression),15);rows.push({abilityGlobalTarget:2,prepared:model.abilities.wis.check.value,current:15,expression});}
 const combo={};actor._buildSkillToolConfig('tool',actor,{ability:'dex',tool:'thief',skill:'prc'},combo);const comboExpression=nativeFormula606.replaceFormulaData(combo.parts.join(' + '),combo.data),comboExpected=(4+Math.floor(base*Math.max(coefficient,1,target))+(Math.floor(base*Math.max(coefficient,1,target))-1)+4);assert.equal(nativeFormula606.NativeMath.safeEval(comboExpression),comboExpected);rows.push({selectedTool:true,coefficient,target,total:comboExpected,expanded:comboExpression});
 rows.push({level,base,coefficient,target,preparedTotal,currentTotal,passive:model.skills.prc.passive,parts:config.parts,profData:String(config.data.prof),ruleBonus:config.data.ruleBonus,expanded});
}}
finally{sandbox.dnd5e.settings.proficiencyModifier=previous;}
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify({nativeCommit,rows,sourceHashes:Object.fromEntries(['module/documents/actor/actor.mjs','module/dice/basic-roll.mjs','module/documents/actor/proficiency.mjs','module/data/actor/templates/creature.mjs','module/utils.mjs'].map(path=>[path,sha256(files.get(path))])),limits:['Actual native ability/skill/tool preparation,Actor/ActorModel roll data,_buildSkillToolConfig,BasicRoll.constructParts and recursive replacement execute on initialized numeric models/empty-rule shells. No dice or full source model/runtime boot.','Native constructParts overwrites root data.prof when the selected check has proficiency;otherwise the Actor base prof object remains. Earlier deterministic preparation uses the Actor base proficiency. Independent expected totals are declared before module correction.']},null,2)+'\n');process.stdout.write('S:8 numeric profiles plus8 selected tools/1 ability native @prof preparation/fresh-construction contexts PASS\n');

export const formulaRollOracle606={MathModel,MathActor,sandbox,files,n};
