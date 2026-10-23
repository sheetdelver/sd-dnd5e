import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';
import {CustomStringField606,CustomTraits606,customSheet606} from './native-custom-traits-oracle.mjs';
const args=process.argv.slice(2),repo=option(args,'--native'),foundry=option(args,'--foundry');
if(!repo||!foundry)throw new Error('Supply static --native and --foundry source references; no service is started');
const files=readRelease(repo),release=JSON.parse(readFileSync(join(foundry,'package.json'),'utf8')).release;
assert.equal(release.generation,14);assert.equal(release.build,367);
const require=createRequire(join(coreRoot(args),'package.json')),ts=require('typescript');
const paths=['client/documents/actor.mjs','client/documents/active-effect.mjs','common/data/active-effect.mjs','common/data/fields.mjs','common/constants.mjs','common/primitives/number.mjs'];
const core=new Map(paths.map(path=>[path,readFileSync(join(foundry,path),'utf8')]));
function member(text,name,method){const ast=ts.createSourceFile(name,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);const cls=ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===name);const m=cls?.members.find(n=>(ts.isMethodDeclaration(n)||ts.isGetAccessor(n))&&n.name?.getText(ast)===method);if(!m)throw new Error('Missing '+name+'.'+method);return m.getText(ast);}
const f=(path,name,method)=>member(core.get(path),name,method),n=(path,name,method)=>member(files.get(path),name,method);
const trace=[];const get=(obj,path)=>typeof path==='string'?path.split('.').reduce((v,k)=>v?.[k],obj):undefined;
const sandbox={trace,Function,Item:class {},dnd5e:{settings:{tokenSizeSync:false}},Hooks:{onError:(_name,error)=>{throw error;}},
foundry:{documents:{},utils:{deepClone:structuredClone,isPlainObject:value=>!!value&&Object.getPrototypeOf(value)===Object.prototype,expandObject:()=>({}),mergeObject:(a,b)=>Object.assign(a,b),getProperty:get}}};
vm.runInNewContext(`
class FEffect {${['active','isSuppressed','shouldApplyChange'].map(m=>f('client/documents/active-effect.mjs','ActiveEffect',m)).join('\n')}
getReplacementData(){return {};}
static _shimChanges(){} static applyChange(actor,change){trace.push(change.key);if(actor.customReceipts)return applyCustom(actor,change);return {};}
}
FEffect.CHANGE_PHASES={initial:{},final:{}};
class NEffect extends FEffect {${n('module/documents/active-effect.mjs','ActiveEffect5e','isSuppressed')}
${n('module/documents/active-effect.mjs','ActiveEffect5e','applicableType')} }
class NItem {${n('module/documents/item.mjs','Item5e','areEffectsSuppressed')}
get isHidden(){return false;} }
class FActor {${['allApplicableEffects','applyActiveEffects'].map(m=>f('client/documents/actor.mjs','Actor',m)).join('\n')}
getRollData(){return {};}}
class NActor extends FActor {${['allApplicableEffects','applyActiveEffects'].map(m=>n('module/documents/actor/actor.mjs','Actor5e',m)).join('\n')} }
globalThis.classes={NActor,NEffect,NItem};foundry.documents.ActiveEffect={implementation:FEffect};`,sandbox);
const {NActor,NEffect,NItem}=sandbox.classes;
// C22 source/default cases stay separate from initialized phase traces below.
// Verify template ownership, initialize only these primitive fields, then invoke
// the pinned getter. No Item DataModel or Document runtime is instantiated.
const itemFixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/item-effect-eligibility.json'),'utf8'));
assert.equal(itemFixture.nativeCommit,nativeCommit);
const equippableTypes=['consumable','container','equipment','tool','weapon'];
const otherTypes=['background','class','facility','feat','loot','race','spell','subclass'];
for(const type of [...equippableTypes,...otherTypes])assert.equal(/import EquippableItemTemplate/.test(files.get('module/data/item/'+type+'.mjs')),equippableTypes.includes(type),type);
const template=files.get('module/data/item/templates/equippable-item.mjs');
assert.match(template,/equipped: new BooleanField\(\{required: true/);
assert.match(template,/attuned: new BooleanField\(/);
assert.match(template,/attunement: new StringField\(\{required: true/);
assert.match(template,/if \( \(source.equipped === null\) \|\| \(source.equipped === undefined\) \) source.equipped = false/);
assert.match(files.get('module/data/item/fields/item-type-field.mjs'),/initial: options.value \?\? ""/);
const initBox={};
vm.runInNewContext(`class DataField {constructor(options={}){Object.assign(this,this.constructor._defaults,options);}
static #cleanDefaultTrue=[];
${['_defaults','getInitialValue','clean','_validateSpecial','_cleanType'].map(m=>f('common/data/fields.mjs','DataField',m)).join('\n')} }
class BooleanField extends DataField {${['_defaults','_cast'].map(m=>f('common/data/fields.mjs','BooleanField',m)).join('\n')} }
class StringField extends DataField {${['_defaults','getInitialValue','clean','_cast','_validateSpecial'].map(m=>f('common/data/fields.mjs','StringField',m)).join('\n')} }
globalThis.fields={BooleanField,StringField};`,initBox);
const itemEligibilityObservations=[];
for(const row of itemFixture.cases.filter(row=>!row.reason)){
 const data=structuredClone(row.system),system={};
 if(equippableTypes.includes(row.type)){
  const {BooleanField,StringField}=initBox.fields;
  for(const key of ['equipped','attuned'])system[key]=new BooleanField().clean(data[key],{migrate:false,sanitize:false},{cleanOptions:true});
  system.attunement=new StringField({required:true}).clean(data.attunement,{migrate:false,sanitize:false},{cleanOptions:true});
  if(row.type==='consumable')system.type={value:new StringField({required:true,initial:''}).clean(data.type?.value,{migrate:false,sanitize:false},{cleanOptions:true})};
 }
 const item=Object.assign(new NItem(),{type:row.type,system,parent:{system:{isGroup:false}}});
 assert.equal(!item.areEffectsSuppressed,row.applied,row.id);
 itemEligibilityObservations.push({id:row.id,initialized:system,suppressed:item.areEffectsSuppressed});
}
const fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/effect-phases.json'),'utf8'));assert.equal(fixture.nativeCommit,nativeCommit);
const priorities={custom:0,multiply:10,add:20,subtract:20,downgrade:30,upgrade:40,override:50};
for(const [key,value] of Object.entries(priorities))assert.match(core.get('common/constants.mjs'),new RegExp('\\b'+key+': '+value+'\\b'));
assert.match(core.get('common/data/active-effect.mjs'),/initial: "initial"/);assert.match(core.get('common/data/active-effect.mjs'),/initial: "add"/);
const observations=[];
for(const row of fixture.cases.filter(row=>['no-op-actor','disabled-unknown','unequipped-transfer','actor-initial-final','stable-priorities'].includes(row.id))){
 trace.length=0;
 const actor=new NActor();actor.system={isCreature:false,prepareEmbeddedData:()=>trace.push('embedded')};actor.statuses=new Set();actor._completedActiveEffectPhases=new Set();actor.overrides={};actor.tokenActiveEffectChanges={};actor._prepareSpellcasting=()=>trace.push('spellcasting');
 const make=(data,item)=>{const effect=new NEffect();effect.type=data.type??'base';effect.disabled=data.disabled??false;effect.transfer=data.transfer??true;effect.actor=actor;effect.item=item;effect.duration={expired:false};effect.statuses=new Set(data.statuses??[]);effect.system={magical:false,applicableType:'Actor',changes:(data.system?.changes??[]).map(change=>({...change,type:change.type??'add',phase:change.phase??'initial',priority:change.priority??priorities[change.type??'add']}))};return effect;};
 actor.effects=row.effects.map(data=>make(data));actor.items=row.items.map(data=>{const item=new NItem();Object.assign(item,{type:data.type,system:structuredClone(data.system),parent:actor,prepareFinalAttributes:()=>trace.push('item-final')});item.effects=data.effects.map(effect=>make(effect,item));return item;});
 actor.applyActiveEffects('initial');const initial=trace.splice(0);actor.applyActiveEffects('final');const final=trace.splice(0);
 assert.deepEqual(initial,['embedded',...(row.expected.initial??[])]);assert.deepEqual(final,[...row.items.map(()=> 'item-final'),'spellcasting',...(row.expected.final??[])]);
 observations.push({id:row.id,initial,final});
}

// Numeric initial fields are compared with static field operations followed by
// exact native derived methods. No module calculation supplies the oracle.
const numericFixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/numeric-effects.json'),'utf8'));
const numberSource=core.get('common/primitives/number.mjs');
const numberAst=ts.createSourceFile('number.mjs',numberSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const nearest=numberAst.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text==='toNearest').getText(numberAst).replace(/^export /,'');
const utils=ts.createSourceFile('utils.mjs',files.get('module/utils.mjs'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const simplify=utils.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text==='simplifyBonus').getText(utils).replace(/^export /,'');
const common='module/data/actor/templates/common.mjs',creature='module/data/actor/templates/creature.mjs';
const warnings=[];
Object.assign(sandbox,{equals:Object.is,console:{warn:message=>warnings.push(message),error:()=>{throw Error('Unqualified formula');}},
 dnd5e:{settings:{proficiencyModifier:'bonus',rulesVersion:'modern'}},
 CONFIG:{DND5E:{maxAbilityScore:30,abilities:{wis:{type:'mental'},dex:{type:'physical'}},skillPassive:{base:10,modifier:5}}},
 AppliedRules:{collect:()=>({filterWith:()=>({toFormula:(parts=[])=>parts.join(' + '),toAdvantageCounts:(counts={})=>counts,resolve:()=>({toSmallest:value=>value,toLargest:value=>value})})})}});
sandbox.foundry.dice={Roll:{create:raw=>({evaluateSync:()=>{assert.match(raw,/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/);return {total:Number(raw)};}})}};
sandbox.foundry.utils.getType=value=>value&&typeof value==='object'?'Object':typeof value;
vm.runInNewContext(`
Number.prototype.toNearest=${nearest.replace('function toNearest','function')};
Number.isNumeric=value=>value!==null&&value!==''&&typeof value!=='boolean'&&Number.isFinite(Number(value));
class Field {
${['applyChange','_castChangeDelta','_applyChangeAdd','_applyChangeOverride'].map(m=>f('common/data/fields.mjs','DataField',m)).join('\n')}
_replaceDataRefs(value){return value;} clean(value){return this._cleanType(value);}
validate(value){try{this._validateType(value);}catch(error){return error;}return null;}
initialize(value){return value;}
}
class NumericField extends Field {
${['_cast','_cleanType','_validateType','#isValidChoice','_castChangeDelta','_applyChangeSubtract','_applyChangeMultiply','_applyChangeUpgrade','_applyChangeDowngrade'].map(m=>f('common/data/fields.mjs','NumberField',m)).join('\n')}
}
class NativeFormula extends Field {
${f('common/data/fields.mjs','StringField','_cast')}
${['_castChangeDelta','_applyChangeAdd','_applyChangeSubtract'].map(m=>n('module/data/fields/formula-field.mjs','FormulaField',m)).join('\n')}
}
${files.get('module/documents/actor/proficiency.mjs').replace('export default class','class')}
${simplify}
class CommonTemplate {
${['prepareAbilities','calculateAbilityCheckProficiency','calculateToolProficiency','calculateSkillToolProficiency'].map(m=>n(common,'CommonTemplate',m)).join('\n')}
static shimAbilityData(){} }
class CreatureTemplate extends CommonTemplate {
${['prepareSkill','prepareTools'].map(m=>n(creature,'CreatureTemplate',m)).join('\n')} }
class AdvantageModeField extends NumericField {
${['_applyChangeAdd','_applyChangeSubtract','_applyChangeMultiply','_applyChangeOverride','_applyChangeUpgrade','_applyChangeDowngrade'].map(m=>n('module/data/fields/advantage-mode-field.mjs','AdvantageModeField',m)).join('\n')}
${['combineFields','getCounts','resolveMode'].map(m=>n('module/data/fields/advantage-mode-field.mjs','AdvantageModeField',m)).join('\n')} }
class D20RollModificationField {
${['combineFields','#makeRulesIterator'].map(m=>n('module/data/shared/d20-roll-modification-field.mjs','D20RollModificationField',m)).join('\n')}
}
class NativeParts {
${['constructParts','mergeOptions'].map(m=>n('module/dice/basic-roll.mjs','BasicRoll',m)).join('\n')}
}
class NativeDispatch {
${['#rollSkillTool','_buildSkillToolConfig'].map(m=>n('module/documents/actor/actor.mjs','Actor5e',m)).join('\n')}
run(...args){return this.#rollSkillTool(...args);}
}
globalThis.numeric={NumericField,CreatureTemplate,CommonTemplate,NativeDispatch,NativeParts,NativeFormula,AdvantageModeField};`,sandbox);
const {NumericField,CreatureTemplate,CommonTemplate,NativeDispatch,NativeParts}=sandbox.numeric,numericObservations=[];
sandbox.foundry.utils.setProperty=(obj,path,value)=>{const keys=path.split('.');let cursor=obj;for(const key of keys.slice(0,-1))cursor=cursor[key]??={};cursor[keys.at(-1)]=value;};
sandbox.foundry.utils.getType=value=>value&&typeof value==='object'?'Object':typeof value;
sandbox.dnd5e.dataModels={actor:{CommonTemplate}};sandbox.TravelField={getTravelPaceMode:()=>({advantage:false,disadvantage:false})};sandbox.SkillToolRollConfigurationDialog=class {};
sandbox._loc=value=>value;sandbox.Trait={keyLabel:key=>key};sandbox.ChatMessage={getSpeaker:()=>({})};
sandbox.CONFIG.DND5E.skills={prc:{ability:'wis',label:'Perception'}};sandbox.CONFIG.DND5E.tools={thief:{ability:'dex'}};sandbox.CONFIG.DND5E.vehicleTypes={};
let builtCapture;
sandbox.CONFIG.Dice={D20Roll:{constructParts:NativeParts.constructParts,mergeOptions:NativeParts.mergeOptions,mergeConfigs:(a,b={})=>Object.assign(a,b),build:async(process,dialog)=>{const config={options:{advantage:process.advantage,disadvantage:process.disadvantage}};dialog.options.buildConfig(process,config,undefined,0);builtCapture={process,config};return [];}}};
const set=(obj,path,value)=>{const parts=path.split('.');let cursor=obj;for(const key of parts.slice(0,-1))cursor=cursor[key]??={};cursor[parts.at(-1)]=value;};
// Explicit schema options; exact declarations are checked in native-checks and
// here. These stubs do not instantiate the full Foundry DataModel.
assert.match(files.get(common),/integer: true, min: 0, initial: 10/);
assert.match(files.get(creature),/min: 0, max: 2, step: 0.5, initial: 0/);
for(const row of numericFixture.cases.filter(row=>row.expected&&row.id!=='bonus-field')){
 const source={system:{abilities:{wis:{value:14,proficient:0},dex:{value:12,proficient:0}},skills:{prc:{ability:'wis',value:1,roll:{},bonuses:{passive:''}}},tools:{thief:{ability:'dex',value:1,roll:{}}},rolls:{ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:0}]))}}};
 for(const [path,value] of Object.entries(row.patches))set(source,path,value);
 const changes=row.changes.map((change,order)=>({...change,priority:priorities[change.type],order})).sort((a,b)=>a.priority-b.priority||a.order-b.order),applied=[];
 function applyNumericPhase(phase){for(const change of changes.filter(change=>(change.phase??'initial')===phase)){
  const options=change.key.startsWith('system.rolls')?{nullable:false,choices:change.key.includes('.save.')?[0,1]:[0,.5,1,2]}:change.key.endsWith('.value')&&!change.key.includes('.abilities.')?{nullable:false,min:0,max:2,step:.5}:{nullable:false,integer:true,min:0,...(change.key.endsWith('.proficient')?{max:1}:{})};
  const field=Object.assign(new NumericField(),options),value=field.applyChange(get(source,change.key),{},change);set(source,change.key,value);applied.push({key:change.key,value,phase});
 }}
 applyNumericPhase('initial');
 const model=Object.assign(Object.create(CreatureTemplate.prototype),source.system);
 model.attributes={prof:3,ac:{cover:0}};model.parent={flags:{dnd5e:{}},conditionRollReduction:0,coverBonus:0,hasConditionEffect:()=>false,_isRemarkableAthlete:()=>false};
 for(const ability of Object.values(model.abilities)){ability.attack={roll:{}};ability.check={roll:{}};ability.save={roll:{}};ability.max=null;}
 model._source=structuredClone(source.system);model.prepareAbilities();model.skills.prc=model.prepareSkill('prc',{rollData:{},originalSkills:{}});model.prepareTools();applyNumericPhase('final');
 const e=row.expected,observed={skill:model.skills.prc.total,passive:model.skills.prc.passive,tool:model.tools.thief.total,check:model.abilities.wis.check.value,save:model.abilities.wis.save.value,score:model.abilities.wis.value,skillProficiency:model.skills.prc.prof.multiplier,toolProficiency:model.tools.thief.prof.multiplier};
 for(const [key,value] of Object.entries(observed))assert.equal(value,e[key],row.id+'/'+key);
 const prof=CommonTemplate.calculateSkillToolProficiency({system:model},'wis',{skill:'prc',tool:'thief'});
 observed.combined=model.abilities.wis.mod+prof.flat;observed.combinedMode=Number(model.skills.prc.prof.hasProficiency&&model.tools.thief.prof.hasProficiency);
 assert.equal(observed.combined,e.combined,row.id);assert.equal(observed.combinedMode,e.combinedMode,row.id);
 const actor=Object.assign(new NativeDispatch(),{system:model,flags:{dnd5e:{}},getFlag:()=>undefined,getRollData:()=>({roll:{}}),addConditionRollReduction:()=>{}}),builds=[];
 for(const kind of ['skill','tool']){
  await actor.run(kind,{skill:'prc',tool:'thief',ability:'wis'});
  const {process,config}=builtCapture;
  assert.equal(Number(process.advantage)-Number(process.disadvantage),e.combinedMode,row.id+'/dispatch');
  assert.equal(config.data.mod+Number(config.data.prof??0),e.combined,row.id+'/build');
  builds.push({kind,parts:Array.from(config.parts),data:config.data,mode:Number(process.advantage)-Number(process.disadvantage)});
 }
 numericObservations.push({id:row.id,applied,observed,builds});
}
assert.equal(warnings.length,0);

const bonusFixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/constant-bonus-effects.json'),'utf8')),constantObservations=[];
for(const row of bonusFixture.cases.filter(row=>row.expected)){
 const field=new sandbox.numeric.NativeFormula();let formula=row.before??undefined;
 const changes=[row,...(row.extraChanges??[])].map((change,order)=>({...change,order})).sort((a,b)=>(priorities[a.type]-priorities[b.type])||a.order-b.order);
 for(const change of changes){const delta=field._castChangeDelta(change.value);formula=field['_applyChange'+change.type[0].toUpperCase()+change.type.slice(1)](formula,delta);}
 assert.equal(formula,row.expectedFormula,row.id);
 constantObservations.push({id:row.id,formula,independentExpectedNumeric:row.expectedBonus});
}

const modeFixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/effect-modes.json'),'utf8')),modeObservations=[];
for(const row of modeFixture.cases.filter(row=>row.expected)){
 const model=Object.assign(Object.create(CreatureTemplate.prototype),{abilities:{wis:{value:14,proficient:0},dex:{value:12,proficient:0}},skills:{prc:{value:1,ability:'wis',roll:{mode:0},bonuses:{passive:''}}},tools:{thief:{value:1,ability:'dex',roll:{mode:0}}},attributes:{prof:3,ac:{cover:0}},rolls:{ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:0,mode:0}]))}});
 for(const ability of Object.values(model.abilities)){ability.attack={roll:{}};ability.check={roll:{mode:0}};ability.save={roll:{mode:0}};ability.max=null;}
 const actor=Object.assign(new NativeDispatch(),{system:model,flags:{dnd5e:{}},getFlag:()=>undefined,getRollData:()=>({roll:{}}),addConditionRollReduction:()=>{},conditionRollReduction:0,coverBonus:0,hasConditionEffect:()=>false,_isRemarkableAthlete:()=>false});
 for(const [path,value] of Object.entries(row.sourceModes))set(actor,path,value);
 const raw=structuredClone({system:{abilities:model.abilities,skills:model.skills,tools:model.tools,rolls:model.rolls}});actor._source=raw;model._source=raw.system;model.parent=actor;
 function applyPhase(phase){for(const change of row.changes.filter(change=>(change.phase??'initial')===phase).map((change,order)=>({...change,order})).sort((a,b)=>priorities[a.type]-priorities[b.type]||a.order-b.order)){
  const field=Object.assign(new sandbox.numeric.AdvantageModeField(),{nullable:false,choices:[-1,0,1]});set(actor,change.key,field.applyChange(get(actor,change.key),actor,change));
 }}
 applyPhase('initial');model.prepareAbilities();model.skills.prc=model.prepareSkill('prc',{rollData:{},originalSkills:{}});model.prepareTools();applyPhase('final');
 const modes=[];for(const config of [{skill:'prc'},{skill:'prc',tool:'thief'},{tool:'thief'},{primary:'tool',skill:'prc',tool:'thief',ability:'wis'}]){
  await actor.run(config.primary??(config.skill?'skill':'tool'),config);modes.push(Number(builtCapture.process.advantage)-Number(builtCapture.process.disadvantage));
 }
 const abilityMode=sandbox.numeric.AdvantageModeField.combineFields(model,['abilities.wis.check.roll.mode','rolls.ability.check.mode']);
 const saveMode=sandbox.numeric.AdvantageModeField.combineFields(model,['abilities.wis.save.roll.mode','rolls.ability.save.mode']);
 const observed={mode:modes[0],passive:model.skills.prc.passive,combinedMode:modes[1],toolMode:modes[2],abilityMode:Number(abilityMode.advantage)-Number(abilityMode.disadvantage),combinedToolMode:modes[3],saveMode:Number(saveMode.advantage)-Number(saveMode.disadvantage)};
 assert.deepEqual(observed,row.expected,row.id);modeObservations.push({id:row.id,observed});
}

// C71: actual native/base Actor collection, suppression, priority and INITIAL
// dispatch. Primitive source/default initialization and field dispatch are
// declared collaborators, not full Item/Actor DataModel boot.
const itemCustomFixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/item-initial-custom-strings.json'),'utf8'));
assert.equal(itemCustomFixture.nativeCommit,nativeCommit);
vm.runInNewContext(`class BaseEffectModel {${n('module/data/abstract/active-effect-data-model.mjs','ActiveEffectDataModel','applicableType')}}
globalThis.BaseEffectModel=BaseEffectModel;`,sandbox);
sandbox.applyCustom=(actor,change)=>{
 const field=new CustomStringField606({required:true}),before=get(actor,change.key),value=field.applyChange(before,actor,change);
 const parts=change.key.split('.');let target=actor;for(const key of parts.slice(0,-1))target=target[key];target[parts.at(-1)]=value;
 actor.customReceipts.push({phase:change.phase,before,value});
 actor.customIdentities.push({effectId:change.effect.id,...(change.effect.item?{itemId:change.effect.item.id}:{})});return {[change.key]:value};
};
const itemCustomObservations=[];
for(const row of itemCustomFixture.cases){
 const preserved=structuredClone(row),actor=new NActor(),field=new CustomStringField606({required:true}),key=row.field.split('.')[0];
 actor.system={isCreature:false,isGroup:false,traits:Object.fromEntries(['dr','di','dv','ci','armorProf','weaponProf','languages'].map(key=>[key,{value:new Set(),custom:''}])),prepareEmbeddedData:()=>trace.push('embedded')};
 actor.system.traits[key]={value:new Set(row.source.value??[]),custom:field.initialize(field.clean(row.source.custom,{migrate:false,sanitize:false}),{})};
 actor.statuses=new Set();actor._completedActiveEffectPhases=new Set();actor.overrides={};actor.tokenActiveEffectChanges={};actor.customReceipts=[];actor.customIdentities=[];
 const make=(data,item)=>{
  const effect=Object.assign(new NEffect(),{id:data._id,type:data.type??'base',disabled:data.disabled??false,transfer:data.transfer??true,actor,item,duration:{expired:false},statuses:new Set()});
  effect.system=Object.assign(new sandbox.BaseEffectModel(),{changes:data.system.changes.map(change=>({...change,type:change.type??'add',phase:change.phase??'initial',priority:change.priority??priorities[change.type??'add']}))});
  return effect;
 };
 actor.effects=row.actorChanges.length?[make({_id:'actorCustom',system:{changes:row.actorChanges}})]:[];
 actor.items=row.items.map(data=>{
  const system={};if(equippableTypes.includes(data.type)){
   for(const key of ['equipped','attuned'])system[key]=new initBox.fields.BooleanField().clean(data.system[key],{migrate:false,sanitize:false},{cleanOptions:true});
   system.attunement=new initBox.fields.StringField({required:true}).clean(data.system.attunement,{migrate:false,sanitize:false},{cleanOptions:true});
   if(data.type==='consumable')system.type={value:new initBox.fields.StringField({required:true,initial:''}).clean(data.system.type?.value,{migrate:false,sanitize:false},{cleanOptions:true})};
  }
  const item=Object.assign(new NItem(),{id:data._id,type:data.type,system,parent:actor});item.effects=data.effects.map(data=>make(data,item));return item;
 });
 trace.length=0;assert.equal(actor.system.traits[key].custom,row.expectedInitialized,row.id+'/initialized');
 actor.applyActiveEffects('initial');
 assert.deepEqual(actor.customReceipts,row.expectedReceipts,row.id+'/actual dispatched primitive operations');
 assert.deepEqual(actor.customIdentities,row.expectedIdentities,row.id+'/stable Actor/Item order and identities');
 assert.equal(actor.system.traits[key].custom,row.expectedPreparedCustom,row.id+'/prepared');
 CustomTraits606.prepareLanguages.call(actor.system);
 assert.deepEqual(Array.from(actor.system.traits.languages.labels.languages),key==='languages'?row.expectedPreparedLabels:[],row.id+'/language cache');
 const sheet=customSheet606(actor.system,()=>false),displayKey=key==='armorProf'?'armor':key==='weaponProf'?'weapon':key;
 assert.deepEqual(Array.from(sheet[displayKey]??[],entry=>entry.label),row.expectedCurrentLabels,row.id+'/sheet');
 assert.deepEqual(row,preserved,row.id+'/raw source preserved');
 itemCustomObservations.push({id:row.id,receipts:actor.customReceipts,identities:actor.customIdentities,current:actor.system.traits[key].custom,languages:Array.from(actor.system.traits.languages.labels.languages),trace:trace.splice(0)});
}

const evidence={itemCustomSourceHashes:Object.fromEntries(['module/documents/actor/actor.mjs','module/documents/active-effect.mjs','module/documents/item.mjs','module/data/abstract/active-effect-data-model.mjs'].map(path=>[path,sha256(files.get(path))])),itemCustomObservations,itemCustomFixtureSha256:sha256(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/item-initial-custom-strings.json'))),itemCustomLimits:['Actual native/base Actor initial collector and dispatcher, native effect and Item suppression getters, inherited phase matcher, actual primitive String and language/sheet methods. applyChange schema-field routing is a test collaborator. No full DataModel/Document boot.','No Item prepareFinalAttributes or final phase invoked; no conditions, filters, dependency/rider/antimagic, time, Item effects or native dice/operator acceptance. Existing C12/C22 matrices remain separately preserved.'],itemEligibilityObservations,itemSchemaHashes:Object.fromEntries([...equippableTypes,...otherTypes].map(type=>{const path="module/data/item/"+type+".mjs";return [path,sha256(files.get(path))];})),modeObservations,constantObservations,numericObservations,evidence:'S controlled static Foundry14.367 / exact native6.0.6 phase methods; not native Documents/operator acceptance',nativeCommit,foundry:release,observations,priorities,foundrySources:Object.fromEntries([...core].map(([path,source])=>[path,sha256(source)])),stubs:['C22 exact primitive clean/defaults and Item suppression getter; all13 Item template ownerships checked; hidden=false, parent group=false, no Item DataModel/Document/hooks or malformed coercion qualification','Explicit initialized effect defaults; no Foundry DataModel initialization','Numeric field clean/validate/initialize wrappers, exact operations/rounding; numeric-literal-only Roll stub; no references/expressions','Exact native derived methods with empty applied rules/flags/conditions and source mode defaults; no Document/runtime' ,'Untimed empty-condition effects only','Empty roll data; hidden/dependent/rider/antimagic absent','Phase-order capture traces changes only; numeric cases separately execute static NumberField operations; no hooks/token-size/spellcasting/Item derivation','Exact skill/tool dispatch and builder capture with numeric initialized model; no dice evaluation or native Document lifecycle','Constant FormulaField casts and add/subtract/override string operations only; no native Roll validation or expression evaluation; expected constant reduction separately verified through public host']};
const out=process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)?option(args,'--write-evidence'):undefined;if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');process.stdout.write(`S: ${itemCustomObservations.length} transferred Item initial custom field/eligibility/order/cache cases and ${itemEligibilityObservations.length} source/default Item eligibility and effect eligibility/phase capture ${observations.length} plus ${numericObservations.length} numeric field/derived and ${constantObservations.length} constant FormulaField constructions and ${modeObservations.length} effect-mode/passive cases PASS\n`);

// Test-only initialized method collaborators; never imported by module runtime.
export const effectOracle606={NActor,NEffect,NItem,sandbox,initBox,files,core,n,f,trace,priorities};
