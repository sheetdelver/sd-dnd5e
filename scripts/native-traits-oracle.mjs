import assert from 'node:assert/strict';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';
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
const loc=key=>{const value=lookup(english,key);assert.equal(typeof value,'string',key);return value;};
const damage=registry('damageTypes'),conditions=registry('conditionTypes'),properties=registry('itemProperties');
const actualRegistry={nativeCommit,damage:Object.fromEntries(Object.entries(damage).map(([k,v])=>[k,loc(v.label)])),conditions:Object.fromEntries(Object.entries(conditions).map(([k,v])=>[k,loc(v.name)])),bypasses:Object.fromEntries(['ada','mgc','sil'].map(k=>[k,loc(properties[k].label)])),physical:Object.keys(damage).filter(k=>damage[k].isPhysical),allDamage:loc('DND5E.DAMAGE.All')};
assert.deepEqual(actualRegistry,JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/defense-registries.json'),'utf8')));
assert.match(files.get('module/data/actor/fields/simple-trait-field.mjs'),/initialValue=\[\]/);
assert.match(files.get('module/data/actor/fields/simple-trait-field.mjs'),/custom: new StringField\(\{ required: true/);
assert.match(files.get('module/data/actor/fields/damage-trait-field.mjs'),/initialBypasses=\[\]/);
assert.match(files.get(traits),/ci: new SimpleTraitField/);
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
class TraitsFields {${member(files.get(traits),'TraitsField','prepareResistImmune')} }
${declaration('splitSemicolons')}
${declaration('simplifyBonus')}
Number.isNumeric=value=>value!==null&&value!==''&&typeof value!=='boolean'&&Number.isFinite(Number(value));

class NativeSheet {static MODES={PLAY:'play'};
${member(files.get('module/applications/actor/api/base-actor-sheet.mjs'),'BaseActorSheet','_prepareTraits')}
}
globalThis.native={StringField,SetField,SchemaField,TraitsFields,NativeSheet,NativeFormula,splitSemicolons,simplifyBonus};`,box);
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
const evidence={effectObservations,rawArrayDiagnostic:{sourceValue:['fire','cold'],nativeValue:rawArrayDiagnostic,module:'Explicitly unavailable; never interpreted as JSON array string'},nativeCommit,foundry:{generation:14,build:367,fieldsSha256:sha256(fields),helpersSha256:sha256(helpers),setPrimitivesSha256:sha256(setSource)},registry:actualRegistry,observations,
 sourceHashes:Object.fromEntries([traits,'module/data/actor/fields/simple-trait-field.mjs','module/data/actor/fields/damage-trait-field.mjs','module/data/fields/formula-field.mjs','module/config.mjs','module/utils.mjs','module/applications/actor/api/base-actor-sheet.mjs'].map(path=>[path,sha256(files.get(path))])),englishSha256:sha256(englishText),
 stubs:['C25 exact DataField.applyChange and field delta/operation/cleaning methods, native equality and Set.map/equals; validation wrapper checks known primitive strings only; references/object equality throw outside profile; no full DataModel validation','Primitive option-merging constructors; exact String clean/default and Array/Set initialization, source arrays cleaned elementwise; no DataModel or validation boot','Schema default container clean delegates only verified child defaults; Schema key/migration/validation logic not emulated','Condition-free Actor stub: empty statuses and hasConditionEffect=false; initial/final/Item effects not executed here','Partial cases compare independent ready domains only, initializing unavailable domains empty; unknown immunity also gates resistance in module','C24 simplifyBonus numeric-literal fast path; C25 two independently declared constant-expression totals in a closed Roll stub, not a native engine or module evaluator','Exact native trait presentation in edit mode with fixed subset trait registry, empty communication/masteries, key-label lookup stub from independently captured English registry, deepClone identity read-only stub, exact native Set.map/equals, en-US number formatter; physical bypasses compared separately','Native English registry capture at exact commit; no game locale/runtime or installed sheet/operator acceptance']};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');
process.stdout.write(`S: ${observations.length} defense source/default captures (${observations.filter(o=>o.complete).length} complete, remainder independent domains) and ${effectObservations.length} ordered initial trait-effect cases and pinned registries PASS\n`);
