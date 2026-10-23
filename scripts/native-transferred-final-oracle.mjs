import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
import {option} from './lib/toolchain.mjs';
await import('./native-equippable-final-oracle.mjs');
const {effectOracle606:e}=await import('./native-effect-oracle.mjs');
const {baseProficiencyOracle606:b}=await import('./native-base-proficiency-oracle.mjs');
const {itemFinalOracle606:i}=await import('./native-item-final-oracle.mjs');
const {nativeFormula606:q}=await import('./native-formula-oracle.mjs');
const box=b.sandbox,{NEffect}=e,{PhaseActor,PhaseItem}=box.equippableFinal,Model=i.MathModel;
const get=(o,path)=>path.split('.').reduce((v,k)=>v?.[k],o);
const set=(o,path,v)=>{const keys=path.split('.');let parent=o;for(const key of keys.slice(0,-1))parent=parent[key]??={};parent[keys.at(-1)]=v;};
const specs=[
 ['score','system.abilities.wis.value','override',16],
 ['skill-value','system.skills.prc.value','override',2],
 ['tool-value','system.tools.thief.value','override',2],
 ['global-prof','system.rolls.ability.check.proficiency','override',2],
 ['global-skill-prof','system.rolls.ability.skill.proficiency','override',2],
 ['skill-bonus','system.skills.prc.roll.bonus','add','2'],
 ['ability-bonus','system.abilities.wis.check.roll.bonus','add','2'],
 ['global-bonus','system.rolls.ability.check.bonus','add','2'],
 ['skill-mode','system.skills.prc.roll.mode','add',1],
 ['global-mode','system.rolls.ability.check.mode','add',-1],
 ['tool-bonus','system.tools.thief.roll.bonus','add','2'],
 ['tool-mode','system.tools.thief.roll.mode','add',1],
 ['global-tool-prof','system.rolls.ability.tool.proficiency','override',2],
 ['global-skill-bonus','system.rolls.ability.skill.bonus','add','2'],
 ['global-skill-mode','system.rolls.ability.skill.mode','add',1],
 ['global-tool-bonus','system.rolls.ability.tool.bonus','add','2'],
 ['global-tool-mode','system.rolls.ability.tool.mode','add',-1],
 ['ability-mode','system.abilities.wis.check.roll.mode','add',1]
];
const states=[{magic:true,attuned:true,equipped:true},{magic:true,attuned:false,equipped:true},{magic:false,attuned:false,equipped:true},{magic:true,attuned:true,equipped:false}],rows=[];
const prior=box.foundry.documents.ActiveEffect.implementation,priorBuild=box.CONFIG.Dice.D20Roll.build;
const formulaField=new box.numeric.NativeFormula();
class Bridge {
 static CHANGE_PHASES={initial:{},final:{}};
 static _shimChanges(){}
 static applyChange(actor,change){
  let field;
  if(change.key.endsWith('.mode'))field=Object.assign(new box.numeric.AdvantageModeField(),{nullable:false,choices:[-1,0,1]});
  else if(change.key.endsWith('.bonus')){
   const value=formulaField._applyChangeAdd(get(actor,change.key)??'',String(change.value));
   set(actor,change.key,value);return {[change.key]:value};
  }else field=Object.assign(new box.numeric.NumericField(),change.key.endsWith('.proficiency')?{nullable:false,choices:[0,.5,1,2]}:change.key.endsWith('.value')&&!change.key.includes('.abilities.')?{nullable:false,min:0,max:2,step:.5}:{nullable:false,integer:true,min:0});
  const value=field.applyChange(get(actor,change.key),actor,change);set(actor,change.key,value);return {[change.key]:value};
 }
}
box.foundry.documents.ActiveEffect.implementation=Bridge;let captured;
box.CONFIG.Dice.D20Roll.build=async(process,dialog)=>{const config={options:{advantage:process.advantage,disadvantage:process.disadvantage}};dialog.options.buildConfig(process,config,undefined,0);captured={process,config};return [];};
try {
 for(const type of ['tool','equipment','consumable','container','weapon'])for(const state of states)for(const coefficient of [0,.5,1,2])for(const [id,key,operation,value]of specs){
  const actor=Object.assign(new PhaseActor(),{flags:{dnd5e:{}},effects:[],items:[],statuses:new Set(),overrides:{},tokenActiveEffectChanges:{},_completedActiveEffectPhases:new Set(),_prepareSpellcasting(){},_preparationWarnings:[],conditionRollReduction:0,coverBonus:0,hasConditionEffect:()=>false,_isRemarkableAthlete:()=>false,getFlag:()=>undefined});
  const model=Object.assign(new Model(),{parent:actor,isCreature:false,isNPC:false,isGroup:false,prepareEmbeddedData(){},details:{level:5},attributes:{prof:3,attunement:{max:3,value:0},ac:{cover:0}},abilities:{wis:{value:14,proficient:0,max:null,attack:{roll:{}},check:{roll:{bonus:'',mode:0}},save:{roll:{}}}},skills:{prc:{ability:'wis',value:coefficient,roll:{bonus:'',mode:0},bonuses:{passive:''}}},tools:{thief:{ability:'wis',value:1,roll:{bonus:'',mode:0}}},traits:{armorProf:{value:new Set()},weaponProf:{value:new Set()}},rolls:{ability:Object.fromEntries(['check','save','skill','tool'].map(k=>[k,{proficiency:0,bonus:'',mode:0}]))}});
  model.abilities.dex={value:10,proficient:0,max:null,attack:{roll:{}},check:{roll:{bonus:'',mode:0}},save:{roll:{}}};actor.system=model;model._source={skills:{prc:{value:coefficient}},tools:{thief:{value:1}}};
  const item=Object.assign(new PhaseItem(),{id:'FinalGear',type,parent:actor,actor,flags:{},labels:{},scalingIncrease:null,effects:[]}),cls=box.equippableFinal[type[0].toUpperCase()+type.slice(1)];
  const system=Object.assign(new cls(),{parent:item,equipped:state.equipped,attuned:state.attuned,attunement:'required',properties:new Set(state.magic?['mgc']:[]),type:{value:type==='weapon'?'simpleM':type==='equipment'?'wondrous':'',baseItem:''},proficient:null,uses:{max:'',spent:0,recovery:[]},activities:[],range:{value:0,long:0,reach:0,units:'ft'},schema:{has:()=>false}});
  item.system=system;actor.items=[item];
  const effect=Object.assign(new NEffect(),{id:'Transferred',type:'base',transfer:true,disabled:false,actor,item,duration:{expired:false},statuses:new Set(),system:{magical:false,applicableType:'Actor',changes:[{key,value,type:operation,phase:'final',priority:operation==='override'?50:20}]}});
  item.effects=[effect];actor.applyActiveEffects('initial');model.prepareAbilities({rollData:actor.getRollData({deterministic:true})});model.skills.prc=model.prepareSkill('prc',{rollData:actor.getRollData({deterministic:true}),originalSkills:{}});model.prepareTools({rollData:actor.getRollData({deterministic:true})});
  const earlier=2+Math.floor(3*coefficient);assert.equal(model.skills.prc.total,earlier);assert.equal(model.skills.prc.passive,10+earlier);actor.applyActiveEffects('final');
  const active=(type==='consumable'||state.equipped)&&(!state.magic||state.attuned);
  const skill=active&&['global-prof','global-skill-prof'].includes(id)?8:earlier+Number(active&&['skill-bonus','ability-bonus','global-bonus','global-skill-bonus'].includes(id))*2;
  const tool=active&&['global-prof','global-tool-prof'].includes(id)?8:5+Number(active&&['tool-bonus','ability-bonus','global-bonus','global-tool-bonus'].includes(id))*2;
  const mode=active?(['skill-mode','global-skill-mode','ability-mode'].includes(id)?1:id==='global-mode'?-1:0):0;
  const dispatch=Object.assign(new box.numeric.NativeDispatch(),{system:model,flags:actor.flags,getFlag:()=>undefined,getRollData:options=>actor.getRollData(options),addConditionRollReduction:()=>{}});
  await dispatch.run('skill',{skill:'prc'});
  const observed=q.NativeMath.safeEval(q.replaceFormulaData(captured.config.parts.join(' + '),captured.config.data)),capturedMode=Number(captured.process.advantage)-Number(captured.process.disadvantage);
  assert.equal(observed,skill,id);assert.equal(capturedMode,mode,id);
  await dispatch.run('tool',{tool:'thief'});const observedTool=q.NativeMath.safeEval(q.replaceFormulaData(captured.config.parts.join(' + '),captured.config.data)),toolMode=Number(captured.process.advantage)-Number(captured.process.disadvantage);assert.equal(observedTool,tool,id+'/tool');assert.equal(toolMode,active?['tool-mode','ability-mode'].includes(id)?1:['global-mode','global-tool-mode'].includes(id)?-1:0:0,id+'/toolMode');
  assert.equal(model.skills.prc.effectValue,coefficient);assert.equal(model.tools.thief.effectValue,1);

  const combinedBase=2+Math.floor(3*(active&&['global-prof','global-skill-prof','global-tool-prof'].includes(id)?2:Math.max(coefficient,1))),combinedSkill=combinedBase+Number(active&&['skill-bonus','ability-bonus','global-bonus','global-skill-bonus'].includes(id))*2,combinedTool=combinedBase+Number(active&&['tool-bonus','ability-bonus','global-bonus','global-tool-bonus'].includes(id))*2,combineMode=source=>coefficient>0?(source===-1?0:1):source,combinedSkillMode=combineMode(mode),combinedToolMode=combineMode(toolMode);
  for(const [kind,total,wantedMode]of [['skill',combinedSkill,combinedSkillMode],['tool',combinedTool,combinedToolMode]]){await dispatch.run(kind,{skill:'prc',tool:'thief'});const actual=q.NativeMath.safeEval(q.replaceFormulaData(captured.config.parts.join(' + '),captured.config.data));assert.equal(actual,total,id+'/combined/'+kind);assert.equal(Number(captured.process.advantage)-Number(captured.process.disadvantage),wantedMode,id+'/combinedMode/'+kind);}
  const alternateSkill=combinedBase-2+Number(active&&['skill-bonus','global-bonus','global-skill-bonus'].includes(id))*2,alternateTool=combinedBase-2+Number(active&&['tool-bonus','global-bonus','global-tool-bonus'].includes(id))*2,alternateSkillMode=combineMode(active?['skill-mode','global-skill-mode'].includes(id)?1:id==='global-mode'?-1:0:0),alternateToolMode=combineMode(active?id==='tool-mode'?1:['global-mode','global-tool-mode'].includes(id)?-1:0:0);
  for(const [kind,total,wantedMode]of [['skill',alternateSkill,alternateSkillMode],['tool',alternateTool,alternateToolMode]]){await dispatch.run(kind,{skill:'prc',tool:'thief',ability:'dex'});assert.equal(q.NativeMath.safeEval(q.replaceFormulaData(captured.config.parts.join(' + '),captured.config.data)),total,id+'/alternate/'+kind);assert.equal(Number(captured.process.advantage)-Number(captured.process.disadvantage),wantedMode,id+'/alternateMode/'+kind);}
  rows.push({type,state,coefficient,id,key,operation,value,expected:{active,skill,tool,alternateSkill,alternateTool,alternateSkillMode,alternateToolMode,combinedSkill,combinedTool,combinedSkillMode,combinedToolMode,passive:earlier+10,skillValue:active&&id==='skill-value'?2:coefficient,toolValue:active&&id==='tool-value'?2:1,score:active&&id==='score'?16:14,skillMode:mode,toolMode:active?['tool-mode','ability-mode'].includes(id)?1:['global-mode','global-tool-mode'].includes(id)?-1:0:0}});
 }
}finally{box.foundry.documents.ActiveEffect.implementation=prior;box.CONFIG.Dice.D20Roll.build=priorBuild;}
const out=option(process.argv.slice(2),'--write-evidence');
if(out)writeFileSync(out,JSON.stringify({nativeCommit,profile:'no-activity-equippable-transferred-final-typed-check-fields',cases:rows,sourceHashes:Object.fromEntries(['module/documents/actor/actor.mjs','module/documents/active-effect.mjs','module/documents/item.mjs','module/data/actor/templates/common.mjs','module/data/actor/templates/creature.mjs','module/data/item/templates/equippable-item.mjs','module/data/item/templates/activities.mjs'].map(p=>[p,sha256(e.files.get(p))])),limits:['Actual Actor initial/final collector,Item final hooks/suppression,typed numeric/mode/FormulaField operations,Common ability/skill/tool preparation and fresh native skill builder. Explicit initialized model/defaults,empty Item activities/counters and C91 collaborators.','Schema routing is declared. No general validation/DataModel boot,activity final lifecycle,conditions/time,Item effects,spellcasting callback or native/operator acceptance.','Independent expected arithmetic is frozen before module admission. Raw source fixtures use persisted fields and actual effect source,not injected global proficiency intermediates.']},null,2)+'\n');
process.stdout.write('S:'+rows.length+' native transferred final typed check-field/Item phase/eligibility comparisons PASS\n');
