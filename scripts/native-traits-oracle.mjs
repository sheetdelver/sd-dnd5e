import assert from 'node:assert/strict';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';
import {trainingRegistry} from './lib/native-training-registry.mjs';
const args=process.argv.slice(2),repo=option(args,'--native'),foundry=option(args,'--foundry');
if(!repo||!foundry)throw Error('Supply exact --native release6.0.6 and static --foundry14.367; no service is started');
const files=readRelease(repo),require=createRequire(join(coreRoot(args),'package.json')),ts=require('typescript');
const release=JSON.parse(readFileSync(join(foundry,'package.json'),'utf8')).release;assert.equal(release.generation,14);assert.equal(release.build,367);
const fields=readFileSync(join(foundry,'common/data/fields.mjs'),'utf8');
const helpers=readFileSync(join(foundry,'common/utils/helpers.mjs'),'utf8'),setSource=readFileSync(join(foundry,'common/primitives/set.mjs'),'utf8');
function member(source,cls,name){const ast=ts.createSourceFile(cls,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);const node=ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===cls)?.members.find(n=>n.name?.getText(ast)===name);if(!node)throw Error('Missing '+cls+'.'+name);return node.getText(ast);}
const f=(cls,name)=>member(fields,cls,name),traits='module/data/actor/templates/traits.mjs';
function helper(source,name){const ast=ts.createSourceFile(name,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);const node=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);if(!node)throw Error('Missing function '+name);return node.getText(ast).replace(/^export /,'');}
function variable(source,name){const ast=ts.createSourceFile(name,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);return ast.statements.find(n=>ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>d.name.getText(ast)===name)).getText(ast);}

const configAst=ts.createSourceFile('config',files.get('module/config.mjs'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const registry=name=>vm.runInNewContext('('+configAst.statements.find(n=>ts.isExpressionStatement(n)&&n.expression.left?.getText(configAst)==='DND5E.'+name).expression.right.getText(configAst)+')',{Color:class{}});
const englishText=execFileSync('git',['-C',repo,'show',nativeCommit+':lang/en.json'],{encoding:'utf8',maxBuffer:10000000}),english=JSON.parse(englishText);
function lookup(obj,key){if(!obj||typeof obj!=='object')return;if(Object.hasOwn(obj,key))return obj[key];for(const prefix of Object.keys(obj).sort((a,b)=>b.length-a.length))if(key.startsWith(prefix+'.')){const value=lookup(obj[prefix],key.slice(prefix.length+1));if(value!==undefined)return value;}}
const trainingConfig=trainingRegistry(files,english,ts);assert.deepEqual(JSON.parse(JSON.stringify(trainingConfig)),JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/training-registries.json'),'utf8')));
const loc=key=>{const value=lookup(english,key);assert.equal(typeof value,'string',key);return value;};
const damage=registry('damageTypes'),conditions=registry('conditionTypes'),properties=registry('itemProperties');
const actualRegistry={nativeCommit,damage:Object.fromEntries(Object.entries(damage).map(([k,v])=>[k,loc(v.label)])),conditions:Object.fromEntries(Object.entries(conditions).map(([k,v])=>[k,loc(v.name)])),bypasses:Object.fromEntries(['ada','mgc','sil'].map(k=>[k,loc(properties[k].label)])),physical:Object.keys(damage).filter(k=>damage[k].isPhysical),allDamage:loc('DND5E.DAMAGE.All')};
assert.deepEqual(actualRegistry,JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/defense-registries.json'),'utf8')));
assert.match(files.get('module/data/actor/fields/simple-trait-field.mjs'),/initialValue=\[\]/);
assert.match(files.get('module/data/actor/fields/simple-trait-field.mjs'),/custom: new StringField\(\{ required: true/);
assert.match(files.get('module/data/actor/fields/damage-trait-field.mjs'),/initialBypasses=\[\]/);
assert.match(files.get(traits),/ci: new SimpleTraitField/);
const characterSchema=files.get('module/data/actor/character.mjs');
assert.match(characterSchema,/mastery: new SchemaField\(\{\s*value: new SetField\(new StringField\(\)\),\s*bonus: new SetField\(new StringField\(\)\)/);
assert.match(characterSchema,/armorProf: new SimpleTraitField/);
assert.match(files.get(traits),/communication: new MappingField/);
assert.match(files.get(traits),/units: new StringField\(\{ initial: \(\) => defaultUnits\("length"\) \}\)/);

const utilsAst=ts.createSourceFile('utils',files.get('module/utils.mjs'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const declaration=name=>utilsAst.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name).getText(utilsAst).replace(/^export /,'');
const get=(obj,path)=>path.split('.').reduce((v,k)=>v?.[k],obj);
const box={foundry:{utils:{deepClone:value=>value,getProperty:get}},CONFIG:{DND5E:{traits:Object.fromEntries(['dr','di','dv','ci','dm'].map(k=>[k,{}])),damageTypes:damage,itemProperties:properties,communicationTypes:{}}},
 Trait:{keyLabel:(key,{trait})=>key==='ALL'?loc('DND5E.DAMAGE.All'):(trait==='ci'?actualRegistry.conditions:actualRegistry.damage)[key]},
 _loc:(key,args={})=>loc(key).replace(/\{(\w+)\}/g,(_m,name)=>(typeof args[name]==='string'?lookup(english,args[name])??args[name]:args[name])??'{'+name+'}'),formatNumber:(value,options)=>new Intl.NumberFormat('en-US',options).format(value)};
vm.runInNewContext(`class Color {}
${variable(helpers,'typePrototypes')}
${variable(helpers,'plainObjectPrototype')}
${['isPlainObject','getType','equals'].map(name=>helper(helpers,name)).join('\n')}
function iterateEntries(){throw Error('Object equality outside qualified String/Set field profile');}
Set.prototype.equals=${helper(setSource,'equals')};
Set.prototype.map=${helper(setSource,'map')};
class EmbeddedDataField {}
class DataField {static #cleanDefaultTrue=[];constructor(options={}){Object.assign(this,this.constructor._defaults,options);}
${['_defaults','getInitialValue','clean','_validateSpecial','_cleanType','initialize','applyChange','_castChangeDelta','_applyChangeOverride','_applyChangeMultiply'].map(m=>f('DataField',m)).join('\n')}
_replaceDataRefs(value){if(value.includes('@'))throw Error('References outside qualified profile');return value;}
validate(value){try{if(Array.isArray(value)){for(const element of value)this.element._validateType(element);}else this._validateType(value);}catch(error){return error;}return null;} }
class StringField extends DataField {${['_defaults','getInitialValue','_cast','clean','_validateSpecial','_validateType'].map(m=>f('StringField',m)).join('\n')} }
class ArrayField extends DataField {constructor(element,options={}){super(options);this.element=element;}
${['_defaults','getInitialValue','initialize','_cast','_cleanType','_cleanElement','_castChangeDelta'].map(m=>f('ArrayField',m)).join('\n')} }
class SetField extends ArrayField {${['initialize','_castChangeDelta','_applyChangeAdd','_applyChangeSubtract','_applyChangeUpgrade','_applyChangeDowngrade'].map(m=>f('SetField',m)).join('\n')} }
class NativeFormula extends StringField {${['_castChangeDelta','_applyChangeAdd','_applyChangeSubtract'].map(m=>member(files.get('module/data/fields/formula-field.mjs'),'FormulaField',m)).join('\n')} }

class SchemaField extends DataField {constructor(fields){super();this.fields=fields;}
${['_defaults','getInitialValue'].map(m=>f('SchemaField',m)).join('\n')}
_cleanType(){return Object.fromEntries(Object.entries(this.fields).map(([key,field])=>[key,field.clean(undefined,{migrate:false,sanitize:false},{cleanOptions:true})]));} }
class TraitsFields {${['prepareResistImmune','prepareLanguages'].map(name=>member(files.get(traits),'TraitsField',name)).join('\n')} }
${files.get('module/documents/actor/proficiency.mjs').replace('export default class','class')}
class ToolTemplate {${['calculateAbilityCheckProficiency','calculateToolProficiency','calculateSkillToolProficiency'].map(name=>member(files.get('module/data/actor/templates/common.mjs'),'CommonTemplate',name)).join('\n')}
${member(files.get('module/data/actor/templates/creature.mjs'),'CreatureTemplate','prepareTools')} }
class NativeWeapon {${member(files.get('module/data/item/weapon.mjs'),'WeaponData','masteryOptions')} }
${helper(files.get('module/documents/actor/trait.mjs'),'_innerLabel')}
${helper(files.get('module/documents/actor/trait.mjs'),'keyLabel')}
function getBaseItem(){return undefined;}

${declaration('splitSemicolons')}
${declaration('simplifyBonus')}
Number.isNumeric=value=>value!==null&&value!==''&&typeof value!=='boolean'&&Number.isFinite(Number(value));

class NativeSheet {static MODES={PLAY:'play'};
${member(files.get('module/applications/actor/api/base-actor-sheet.mjs'),'BaseActorSheet','_prepareTraits')}
}
globalThis.native={StringField,SetField,SchemaField,TraitsFields,NativeSheet,NativeFormula,ToolTemplate,NativeWeapon,keyLabel,splitSemicolons,simplifyBonus};`,box);
const {StringField,SetField,SchemaField,TraitsFields,NativeSheet,splitSemicolons,simplifyBonus}=box.native,options=Object.freeze({migrate:false,sanitize:false});
function cleanSet(value){const element=new StringField(),field=new SetField(element,{initial:[]});const values=value==null?field.getInitialValue({}):value.map(v=>element.clean(v,options));return field.initialize(values,{});}
const blankTrait=new SchemaField({value:new SetField(new StringField(),{initial:[]}),custom:new StringField({required:true})}).getInitialValue({});
assert.equal(blankTrait.custom,'');assert.equal(blankTrait.value.length,0);
const fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/defense-traits.json'),'utf8'));assert.equal(fixture.nativeCommit,nativeCommit);
const observations=[];
for(const row of fixture.cases.filter(row=>Object.values(row.expected).some(Boolean))){
 const traitsModel={};for(const key of ['dr','di','dv','ci']){const raw=row.expected[key]?(row.traits[key]??{}):{};
  traitsModel[key]={value:cleanSet(raw.value),custom:new StringField({required:true}).clean(raw.custom,options),...(key!=='ci'?{bypasses:cleanSet(raw.bypasses)}:{})};}
 const model={traits:traitsModel,parent:{statuses:new Set(),hasConditionEffect:()=>false}};
 TraitsFields.prepareResistImmune.call(model);
 const observed={id:row.id,phase:'Condition-free explicitly initialized fields; other unavailable domains omitted',complete:Object.values(row.expected).every(Boolean),categories:{}};
 for(const key of ['dr','di','dv','ci']){const e=row.expected[key];if(!e)continue;const native=model.traits[key];const result={values:Array.from(native.value),custom:Array.from(splitSemicolons(native.custom)),bypasses:key==='ci'?[]:Array.from(native.bypasses)};assert.deepEqual(result,e,row.id+'/'+key);observed.categories[key]=result;}
 if(row.expected.dm){const raw=row.traits.dm??{},amount={};for(const [key,value] of Object.entries(raw.amount??{})){const initialized=new StringField().clean(value,options);const total=simplifyBonus(initialized);if(total)amount[key]=total;}
  const result={amount,bypasses:Array.from(cleanSet(raw.bypasses))};assert.deepEqual(result,row.expected.dm,row.id+'/dm');observed.categories.dm=result;}
 model.traits.dm={amount:row.expected.dm?Object.fromEntries(Object.entries(row.traits.dm?.amount??{}).map(([k,v])=>[k,new StringField().clean(v,options)])):{},bypasses:cleanSet(row.expected.dm?row.traits.dm?.bypasses:[])};
 const sheet=Object.assign(new NativeSheet(),{actor:{system:model,getRollData:()=>({})},document:{hasConditionEffect:()=>false},_mode:'edit'});
 const display=sheet._prepareTraits({}),bypassObservations=[];
 for(const key of ['dr','di','dv','ci'])if(row.expected[key])for(const entry of display[key]??[]){const count=entry.key&&actualRegistry.physical.includes(entry.key)?row.expected[key].bypasses.length:0;assert.equal(entry.icons?.length??0,count,row.id+'/'+key+'/physical bypass');bypassObservations.push({category:key,key:entry.key??null,label:entry.label,icons:Array.from(entry.icons??[],icon=>({...icon}))});}
 for(const [index,entry] of (display.dm??[]).entries()){const type=Object.keys(row.expected.dm.amount)[index];assert.equal(entry.icons.length,actualRegistry.physical.includes(type)?row.expected.dm.bypasses.length:0,row.id+'/dm/physical bypass');bypassObservations.push({category:'dm',key:type,label:entry.label,icons:Array.from(entry.icons??[],icon=>({...icon}))});}
 observed.presentation=bypassObservations;observations.push(observed);
}
// C25 initialized field effects: native strings/Sets remain separate from module
// reduced operands. This fixed table is not populated from module calculations.
const arithmetic={"1 + 2.5":3.5,"3 - (1.5)":1.5};
box.Roll=class {constructor(raw){this.raw=raw;this.isDeterministic=Object.hasOwn(arithmetic,raw);}evaluateSync(){assert.ok(Object.hasOwn(arithmetic,this.raw));return {total:arithmetic[this.raw]};}};
const effectFixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/trait-effects.json'),'utf8'));assert.equal(effectFixture.nativeCommit,nativeCommit);
const setAt=(obj,path,value)=>{const parts=path.split('.');let target=obj;for(const key of parts.slice(0,-1))target=target[key]??={};target[parts.at(-1)]=value;};
const priorities={custom:0,multiply:10,add:20,subtract:20,downgrade:30,upgrade:40,override:50},effectObservations=[];
for(const row of effectFixture.cases.filter(row=>row.expectedOperands)){
 const traitsModel={};for(const key of ['dr','di','dv','ci']){const raw=row.source[key]??{};traitsModel[key]={value:cleanSet(raw.value),custom:new StringField({required:true}).clean(raw.custom,options),...(key!=='ci'?{bypasses:cleanSet(raw.bypasses)}:{})};}
 traitsModel.dm={amount:Object.fromEntries(Object.entries(row.source.dm?.amount??{}).map(([key,value])=>[key,new StringField().clean(value,options)])),bypasses:cleanSet(row.source.dm?.bypasses)};
 const model={traits:traitsModel,parent:{statuses:new Set(),hasConditionEffect:()=>false}},applied=[];
 for(const change of row.changes.map((c,order)=>({...c,order})).sort((a,b)=>(a.priority??priorities[a.type])-(b.priority??priorities[b.type])||a.order-b.order)){
  const path=change.key.slice('system.'.length),before=get(model,path),isSet=!path.includes('.amount.');
  const field=isSet?new SetField(new StringField(),{initial:[]}):new box.native.NativeFormula();
  const value=field.applyChange(before,model,change);setAt(model,path,value);
  applied.push({key:change.key,before:isSet?Array.from(before):before??null,nativeValue:isSet?Array.from(value):value});
 }
 for(const [path,expected] of Object.entries(row.expectedOperands)){const value=get(model,'traits.'+path);if(Array.isArray(expected))assert.deepEqual(Array.from(value),expected,row.id+'/'+path);else if(typeof expected==='number')assert.equal(simplifyBonus(value),expected,row.id+'/'+path);else assert.equal(value,expected,row.id+'/'+path);}
 if(row.expectedFormula)assert.equal(applied.at(-1).nativeValue,row.expectedFormula,row.id+'/native formula');
 if(row.expectedApplied)assert.deepEqual(applied.map(entry=>entry.nativeValue),row.expectedApplied,row.id+'/order');
 TraitsFields.prepareResistImmune.call(model);
 for(const [key,expected] of Object.entries(row.expectedDefense??{}))assert.deepEqual(Array.from(model.traits[key].value),expected,row.id+'/derived');
 effectObservations.push({id:row.id,applied,afterDerived:Object.fromEntries(['dr','di','dv','ci'].map(key=>[key,Array.from(model.traits[key].value)]))});
}
const rawArrayDiagnosticField=new SetField(new StringField(),{initial:[]}),rawArrayDiagnostic=Array.from(rawArrayDiagnosticField.applyChange(cleanSet([]),{},{type:'add',value:['fire','cold']}));assert.deepEqual(rawArrayDiagnostic,['fire,cold']);
// C27 source training / native language presentation. Registry capture executes
// exact pre-localization (primitive label-sort calls preserve insertion order).
box.CONFIG.DND5E.languages=trainingConfig.languages;box.CONFIG.DND5E.communicationTypes=trainingConfig.communication;
box.CONFIG.DND5E.armorProficiencies=trainingConfig.armor;box.CONFIG.DND5E.weaponProficiencies=trainingConfig.weapons;box.CONFIG.DND5E.weaponMasteries=trainingConfig.mastery;
box.CONFIG.DND5E.armorIds=trainingConfig.armorReferences;box.CONFIG.DND5E.weaponIds=trainingConfig.weaponReferences;
box.CONFIG.DND5E.traits={armor:{actorKeyPath:'system.traits.armorProf',configKey:'armorProficiencies',labels:{localization:'DND5E.TRAIT.Armor'},subtypes:{ids:['armorIds']}},weapon:{actorKeyPath:'system.traits.weaponProf',configKey:'weaponProficiencies',labels:{localization:'DND5E.TRAIT.Weapon'},subtypes:{ids:['weaponIds']}}};
box.Trait.keyLabel=box.native.keyLabel;box.foundry.utils.getType=value=>value&&typeof value==='object'?'Object':typeof value;
box.AppliedRules={collect:()=>({filterWith:()=>({toFormula:()=>''})})};
box.game={i18n:{lang:'en',getListFormatter:options=>new Intl.ListFormat('en',options)}};box.dnd5e={settings:{rulesVersion:'modern',proficiencyModifier:'bonus'}};
// Format-only unit adapter; exact integer ranges/units are separately captured.
box.formatLength=(value,units)=>new Intl.NumberFormat('en',{style:'unit',unit:({ft:'foot',m:'meter',mi:'mile',km:'kilometer'})[units],unitDisplay:'short'}).format(value);
const trainingFixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/training.json'),'utf8'));assert.equal(trainingFixture.nativeCommit,nativeCommit);
const trainingObservations=[];
for(const row of trainingFixture.cases.filter(row=>!row.expected.allUnavailable)){
 const model={traits:{}};for(const [key,sourceKey] of [['armor','armorProf'],['weapons','weaponProf']]){
  const raw=key==='armor'&&row.expected.armorUnavailable?{}:row.traits[sourceKey]??{};
  model.traits[sourceKey]={value:cleanSet(raw.value),custom:new StringField({required:true}).clean(raw.custom,options)};
 }
 const rawLanguages=row.traits.languages??{},communication={};
 // Partial range cases compare the independent spoken domain only, never guess
 // a missing metric default or silently coerce malformed persisted input.
 if(!row.expected.languagePartial)for(const [key,raw] of Object.entries(rawLanguages.communication??{}))communication[key]={value:raw.value??null,units:raw.units??(row.metric?'m':'ft')};
 model.traits.languages={value:cleanSet(rawLanguages.value),custom:new StringField({required:true}).clean(rawLanguages.custom,options),communication};
 TraitsFields.prepareLanguages.call(model);const labels=Array.from(model.traits.languages.labels.languages);assert.deepEqual(labels,row.expected.languages,row.id+'/spoken');
 const observed={id:row.id,spoken:labels,communicationCompared:!row.expected.languagePartial,ranged:Array.from(model.traits.languages.labels.ranged),training:{}};
 if(!row.expected.languagePartial){const expected=(row.expected.communication??[]).map(([key,value,unit])=>trainingConfig.communication[key].label+' '+box.formatLength(value,unit));assert.deepEqual(observed.ranged,expected,row.id+'/range');}
 const sheet=Object.assign(new NativeSheet(),{actor:{system:model,getRollData:()=>({})},document:{hasConditionEffect:()=>false},_mode:'edit'}),display=sheet._prepareTraits({});
 for(const [key,trait] of [['armor','armor'],['weapons','weapon']]){
  if(key==='armor'&&row.expected.armorUnavailable)continue;
  const expected=[...row.expected[key],...(row.expected[key+'Unresolved']??[])];const actual=Array.from(display[trait]??[],entry=>entry.label);if(row.id==='prototype-keys-stay-literal'&&key==='weapons'){assert.equal(typeof actual[0],'function');assert.equal(actual[1],'__proto__');observed.nativePrototypeDiagnostic=actual.map(value=>typeof value==='function'?'[inherited function; module preserves unresolved source key]':value);}else assert.deepEqual(actual,expected,row.id+'/'+key);observed.training[key]=actual.map(value=>typeof value==='function'?'[function]':value);
 }
 const rawMastery=row.traits.weaponProf?.mastery??{},weapon=Object.assign(new box.native.NativeWeapon(),{parent:{actor:{system:{traits:{weaponProf:{mastery:{value:cleanSet(rawMastery.value),bonus:cleanSet(rawMastery.bonus)}}}}}},type:{baseItem:'longsword'},mastery:'sap'});
 const opts=weapon.masteryOptions;observed.masteryExample=opts?Array.from(opts,entry=>({value:entry.value,label:entry.label,rule:entry.rule??false})):null;
 if(row.id==='mastery-source-metadata')assert.deepEqual(observed.masteryExample.map(entry=>entry.value),['sap','vex']);
 if(row.id==='mastery-bonus-conditional')assert.equal(opts,null);
 if(!row.expected.toolsUnavailable){
  const toolModel=Object.assign(Object.create(box.native.ToolTemplate.prototype),{attributes:{prof:3},abilities:{int:{mod:0,check:{roll:{}}},dex:{mod:2,check:{roll:{}}}},tools:{},rolls:{ability:{check:{proficiency:row.effect==='global-prof'?2:0},tool:{proficiency:0}}},parent:{flags:{dnd5e:{}},conditionRollReduction:0,getRollData:()=>({})}});
  for(const [key,raw] of Object.entries(row.tools??{}))toolModel.tools[key]={ability:raw.ability??'int',value:row.effect==='local-tool'?1:raw.value??0,roll:{}};
  toolModel.prepareTools();observed.localTools=Object.entries(toolModel.tools).map(([key,data])=>({key,local:data.effectValue,preparedValue:data.value,effective:data.prof.multiplier}));
  assert.deepEqual(observed.localTools.filter(entry=>entry.local>0&&!row.expected.toolsUnresolved?.includes(entry.key)).map(entry=>[entry.key,entry.local]),row.expected.tools,row.id+'/local training');
  if(row.id==='global-roll-prof-is-not-training')assert.deepEqual(observed.localTools,[{key:'thief',local:0,preparedValue:2,effective:2}]);
 }
 trainingObservations.push(observed);
}
// C28 target qualification reuses the exact typed-field methods, but independent
// expected operands are declared before module support, never read from its output.
const trainingEffectFixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/training-effects.json'),'utf8'));
assert.equal(trainingEffectFixture.nativeCommit,nativeCommit);
const trainingEffectObservations=[];
for(const row of trainingEffectFixture.cases.filter(row=>row.expectedOperands)){
 const model={traits:structuredClone(row.source)},applied=[];
 const changes=row.changes.map((change,order)=>({...change,order})).sort((a,b)=>(a.priority??priorities[a.type])-(b.priority??priorities[b.type])||a.order-b.order);
 for(const change of changes){const path=change.key.slice('system.'.length),raw=get(model,path),field=new SetField(new StringField(),{initial:[]}),before=cleanSet(raw),value=field.applyChange(before,model,change);setAt(model,path,value);applied.push({key:change.key,before:Array.from(before),delta:change.value,value:Array.from(value)});}
 for(const [path,expected] of Object.entries(row.expectedOperands))assert.deepEqual(Array.from(get(model,'traits.'+path)),expected,row.id+'/'+path);
 if(row.expectedApplied)assert.deepEqual(applied.map(entry=>entry.value),row.expectedApplied,row.id+'/ordered');
 let spoken; if(row.spoken){const language=model.traits.languages??={};if(typeof language.value?.has!=='function')language.value=cleanSet(language.value);language.custom=new StringField({required:true}).clean(language.custom,options);language.communication={};TraitsFields.prepareLanguages.call(model);spoken=Array.from(language.labels.languages);assert.deepEqual(spoken,row.spoken,row.id+'/spoken');}
 trainingEffectObservations.push({id:row.id,applied,...(spoken?{spoken}:{})});
}
const finalTrainingFixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/final-training-sets.json'),'utf8')),finalTrainingObservations=[];
assert.equal(finalTrainingFixture.nativeCommit,nativeCommit);
for(const row of finalTrainingFixture.cases){
 const model={traits:structuredClone(row.source)};
 for(const path of Object.keys(row.expectedBefore))setAt(model,'traits.'+path,cleanSet(get(model,'traits.'+path)));
 model.traits.armorProf.custom='';model.traits.weaponProf.custom='';model.traits.languages.custom='';model.traits.languages.communication={};
 model.traits.languages.labels={languages:['poison'],ranged:['poison']};
 TraitsFields.prepareLanguages.call(model);assert.deepEqual(Array.from(model.traits.languages.labels.languages),row.expectedSpokenBeforeAndAfter,row.id+'/earlier languages');
 const field=new SetField(new StringField(),{initial:[]}),path=row.change.key.slice('system.'.length),before=get(model,path),after=field.applyChange(before,model,row.change);setAt(model,path,after);
 for(const [path,e]of Object.entries(row.expectedAfter))assert.deepEqual(Array.from(get(model,'traits.'+path)),e,row.id+'/'+path);
 assert.deepEqual(Array.from(model.traits.languages.labels.languages),row.expectedSpokenBeforeAndAfter,row.id+'/earlier cached labels');
 const sheet=Object.assign(new NativeSheet(),{actor:{system:model,getRollData:()=>({})},document:{hasConditionEffect:()=>false},_mode:'edit'}),display=sheet._prepareTraits({});
 assert.deepEqual(Array.from(display.armor??[],entry=>entry.key),row.expectedArmorKeys,row.id+'/current armor');assert.deepEqual(Array.from(display.weapon??[],entry=>entry.key),row.expectedWeaponKeys,row.id+'/current weapons/mastery');assert.deepEqual(Array.from(display.languages??[],entry=>entry.label),row.expectedSpokenBeforeAndAfter,row.id+'/sheet earlier language labels');
 const weapon=Object.assign(new box.native.NativeWeapon(),{parent:{actor:{system:model}},type:{baseItem:'longsword'},mastery:'sap'}),opts=weapon.masteryOptions;
 assert.deepEqual(opts?Array.from(opts,entry=>entry.value):null,row.expectedLongswordSapOptions,row.id+'/fresh conditional mastery options');
 if(opts)assert.equal(opts[0].rule,opts.length>1);
 const callerFormat={traits:{languages:{value:cleanSet(row.expectedAfter['languages.value']),custom:'',communication:{}}}};TraitsFields.prepareLanguages.call(callerFormat);assert.deepEqual(Array.from(callerFormat.traits.languages.labels.languages),row.expectedCallerSpoken,row.id+'/separate caller-format shell,not actual phase replay');
 finalTrainingObservations.push({id:row.id,current:Object.fromEntries(Object.keys(row.expectedAfter).map(path=>[path,Array.from(get(model,'traits.'+path))])),callerFormattedFromSeparateShell:Array.from(callerFormat.traits.languages.labels.languages),earlierSpoken:Array.from(model.traits.languages.labels.languages),display:JSON.parse(JSON.stringify(display)),masteryOptions:opts?Array.from(opts,entry=>entry.value):null});
}
box.CONFIG.DND5E.traits=Object.fromEntries(['dr','di','dv','ci','dm'].map(k=>[k,{}]));box.Trait.keyLabel=(key,{trait})=>key==='ALL'?actualRegistry.allDamage:(trait==='ci'?actualRegistry.conditions:actualRegistry.damage)[key];
const finalDefenseFixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/final-defense-sets.json'),'utf8')),finalDefenseObservations=[];
assert.equal(finalDefenseFixture.nativeCommit,nativeCommit);
for(const row of finalDefenseFixture.cases){
 const model={traits:{},parent:{statuses:new Set(),hasConditionEffect:()=>row.petrified}};
 for(const key of ['dr','di','dv','ci']){const raw=row.source[key]??{};model.traits[key]={value:cleanSet(raw.value),custom:'',...(key!=='ci'?{bypasses:cleanSet(raw.bypasses)}:{})};}
 model.traits.dm={amount:structuredClone(row.source.dm?.amount??{}),bypasses:cleanSet(row.source.dm?.bypasses)};
 TraitsFields.prepareResistImmune.call(model);
 const snapshot=()=>Object.fromEntries(Object.entries(model.traits).map(([key,v])=>[key,key==='dm'?{amount:structuredClone(v.amount),bypasses:Array.from(v.bypasses)}:{value:Array.from(v.value),...(key!=='ci'?{bypasses:Array.from(v.bypasses)}:{})}]));
 assert.deepEqual(snapshot(),row.expectedBefore,row.id+'/prepared before');
 const path='traits.'+row.field,field=new SetField(new StringField(),{initial:[]}),before=get(model,path),value=field.applyChange(before,model,row.change);setAt(model,path,value);
 assert.deepEqual(snapshot(),row.expectedAfter,row.id+'/after final,no normalization replay');
 const sheet=Object.assign(new NativeSheet(),{actor:{system:model,getRollData:()=>({})},document:{hasConditionEffect:()=>row.petrified},_mode:'edit'}),display=sheet._prepareTraits({});
 if(row.petrified)assert.deepEqual(Array.from(display.dr,entry=>entry.label),[actualRegistry.allDamage]);
 else for(const key of ['dr','di','dv','ci'])assert.deepEqual(Array.from(display[key]??[],entry=>entry.key),row.expectedAfter[key].value,row.id+'/fresh native sheet values');
 if(row.id.startsWith('physical/'))for(const key of ['dr','di','dv','dm'])assert.deepEqual(Array.from(display[key][0].icons,icon=>icon.icon),row.expectedAfter[key].bypasses,row.id+'/'+key+'/physical bypass icons');
 finalDefenseObservations.push({id:row.id,before:row.expectedBefore,after:snapshot(),display:JSON.parse(JSON.stringify(display)),petrifiedOverride:row.petrified});
}
const evidence={finalTrainingFixture,finalTrainingObservations,finalDefenseFixture,finalDefenseObservations,trainingEffectObservations,trainingRegistry:trainingConfig,trainingObservations,effectObservations,rawArrayDiagnostic:{sourceValue:['fire','cold'],nativeValue:rawArrayDiagnostic,module:'Explicitly unavailable; never interpreted as JSON array string'},nativeCommit,foundry:{generation:14,build:367,fieldsSha256:sha256(fields),helpersSha256:sha256(helpers),setPrimitivesSha256:sha256(setSource)},registry:actualRegistry,observations,
 sourceHashes:Object.fromEntries([traits,'module/data/actor/character.mjs','module/data/actor/templates/common.mjs','module/data/actor/templates/creature.mjs','module/documents/actor/trait.mjs','module/documents/actor/proficiency.mjs','module/data/item/weapon.mjs','module/data/actor/fields/simple-trait-field.mjs','module/data/actor/fields/damage-trait-field.mjs','module/data/fields/formula-field.mjs','module/config.mjs','module/utils.mjs','module/applications/actor/api/base-actor-sheet.mjs'].map(path=>[path,sha256(files.get(path))])),englishSha256:sha256(englishText),
 stubs:['C59 initialized training Sets then actual prepareLanguages,final SetField operations,native sheet and conditional masteryOptions getter. Model label poison overwritten by actual preparation,not full source DataModel stripping. Languages cache stays earlier;mastery getter uses current keys/bonus on explicit longsword/sap shell,not Item actions or inferred grants. Native key-label/content absence/locale helpers retain C27 stubs','C57 actual Traits preparation then final SetField operations then native sheet on initialized copies;four literal sources include separately stubbed petrification predicate,not condition/source boot. No normalization replay after final. Fixed defense-only registry/key-label helper restored after training registry. Earlier C24-C28 captures retain their own phase stubs. No new DataModel/native dice/write acceptance','C28 exact initial Set methods on explicitly initialized persisted training targets followed by native languages; no custom String, unknown-key, coercion, filtered/final or full DataModel claim','C27 exact prepareLanguages, trait keyLabel and sheet presentation; canonical English, base Item index deliberately unavailable, fixed subset trait config, independent unit-format adapter; partial range cases compare spoken domain only','C27 absent AppliedRules collection is empty, no filtered bonus/effect semantics claimed; prototype-key native inherited-function lookup is recorded as diagnostic, never a usable label',
 'C27 local Tool.value is captured as effectValue by exact prepareTools; prepared value becomes effective multiplier; globals/local override cases start after C13-qualified initial operations, not raw nonpersisted source overrides','C27 masteryOptions getter is only a conditional example (longsword/sap), not module Item/activity execution','C25 exact DataField.applyChange and field delta/operation/cleaning methods, native equality and Set.map/equals; validation wrapper checks known primitive strings only; references/object equality throw outside profile; no full DataModel validation','Primitive option-merging constructors; exact String clean/default and Array/Set initialization, source arrays cleaned elementwise; no DataModel or validation boot','Schema default container clean delegates only verified child defaults; Schema key/migration/validation logic not emulated','Condition-free Actor stub: empty statuses and hasConditionEffect=false; initial/final/Item effects not executed here','Partial cases compare independent ready domains only, initializing unavailable domains empty; unknown immunity also gates resistance in module','C24 simplifyBonus numeric-literal fast path; C25 two independently declared constant-expression totals in a closed Roll stub, not a native engine or module evaluator','Exact native trait presentation in edit mode with fixed subset trait registry, empty communication/masteries, key-label lookup stub from independently captured English registry, deepClone identity read-only stub, exact native Set.map/equals, en-US number formatter; physical bypasses compared separately','Native English registry capture at exact commit; no game locale/runtime or installed sheet/operator acceptance']};
// Imported by the condition oracle for the same actual primitive field constructors.
// Only the directly invoked command writes its own evidence artifact.
const out=process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)?option(args,'--write-evidence'):undefined;if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');
process.stdout.write(`S: ${observations.length} defense source/default captures (${observations.filter(o=>o.complete).length} complete, remainder independent domains) and ${trainingEffectObservations.length} initial training Sets and ${trainingObservations.length} source training/language and ${effectObservations.length} ordered initial trait-effect cases and pinned registries PASS\n`);

process.stdout.write('S: '+finalDefenseObservations.length+' final defense Set phase/presentation cases PASS\n');

process.stdout.write('S: '+finalTrainingObservations.length+' final training Set/current fields/earlier labels/sheet/fresh mastery configurations PASS\n');

export {SetField,StringField,cleanSet,NativeSheet,evidence as nativeTraitEvidence606};
