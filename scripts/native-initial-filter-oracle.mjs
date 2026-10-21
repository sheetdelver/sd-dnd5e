import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';
const args=process.argv.slice(2),repo=option(args,'--native'),foundry=option(args,'--foundry');
if(!repo||!foundry)throw Error('Supply exact native release and static Foundry14.367; no native service');
const files=readRelease(repo),ts=createRequire(join(coreRoot(args),'package.json'))('typescript');
const release=JSON.parse(readFileSync(join(foundry,'package.json'),'utf8')).release;assert.equal(release.generation,14);assert.equal(release.build,367);
const fpaths=['client/documents/actor.mjs','client/documents/active-effect.mjs','common/data/fields.mjs','common/utils/helpers.mjs','common/primitives/number.mjs','common/primitives/set.mjs'];
const ffiles=new Map(fpaths.map(path=>[path,readFileSync(join(foundry,path),'utf8')]));
function member(source,cls,name){const ast=ts.createSourceFile(cls,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);const node=ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===cls)?.members.find(n=>n.name?.getText(ast)===name);if(!node)throw Error('Missing '+cls+'.'+name);return node.getText(ast);}
function declaration(source,name){const ast=ts.createSourceFile(name,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);const node=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);if(!node)throw Error('Missing '+name);return node.getText(ast).replace(/^export /,'');}
function variable(source,name){const ast=ts.createSourceFile(name,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);return ast.statements.find(n=>ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>d.name.getText(ast)===name)).getText(ast);}
const common='module/data/actor/templates/common.mjs',creature='module/data/actor/templates/creature.mjs',character='module/data/actor/character.mjs',model='module/data/abstract/actor-data-model.mjs',effectModel='module/data/abstract/active-effect-data-model.mjs',effectDoc='module/documents/active-effect.mjs',actorDoc='module/documents/actor/actor.mjs';
const n=(path,cls,name)=>member(files.get(path),cls,name),f=(path,cls,name)=>member(ffiles.get(path),cls,name),helpers=ffiles.get('common/utils/helpers.mjs');
assert.match(files.get(common),/required: true, nullable: false, integer: true, min: 0, initial: 10/);
assert.match(files.get(common),/required: true, integer: true, min: 0, max: 1, initial: 0/);
assert.equal([...files.get(creature).matchAll(/proficiency: new NumberField\(\{[\s\S]{0,100}?initial: 0, persisted: false/g)].length,4);
// Creature's unqualified classes/subclasses overlay does not overwrite any
// queried namespace. We compare the base-field projection, not a full rollData.
assert.doesNotMatch(n(creature,'CreatureTemplate','getRollData'),/data\.(abilities|rolls|traits)\s*=/);
for(const method of ['prepareBaseData','prepareEmbeddedData'])assert.doesNotMatch(n(character,'CharacterData',method),/this\.traits/);
assert.doesNotMatch(n('module/data/actor/templates/attributes.mjs','AttributesFields','prepareRace'),/this\.traits/);
assert.match(files.get('module/data/actor/fields/simple-trait-field.mjs'),/initialValue=\[\]/);
assert.match(files.get('module/data/actor/fields/simple-trait-field.mjs'),/value: new SetField\(new StringField\(\)/);
assert.match(files.get(character),/mastery: new SchemaField\(\{\s*value: new SetField\(new StringField\(\)\),\s*bonus: new SetField\(new StringField\(\)\)/);
assert.match(files.get('module/data/actor/templates/traits.mjs'),/bypasses: new SetField\(new StringField\(\)/);
assert.match(files.get('module/data/actor/fields/damage-trait-field.mjs'),/initialBypasses=\[\]/);
assert.match(files.get('module/data/actor/templates/details.mjs'),/level: new NumberField\(\{ integer: true, min: 0, initial: 0, persisted: false/);
assert.match(files.get('module/data/item/class.mjs'),/levels: new NumberField\(\{ required: true, nullable: false, integer: true, min: 0, initial: 1/);
const trace=[],box={trace,structuredClone,game:{settings:{get:()=> 'milestone'}},Item:class {},ConditionData:{hasLevels:()=>{throw Error('Active statuses outside this phase profile');}},CONFIG:{DND5E:{maxLevel:20,movementTypes:{},senses:{}},ActiveEffect:{changeTypes:{add:{},override:{}}}},dnd5e:{settings:{rulesVersion:'modern',proficiencyModifier:'bonus',tokenSizeSync:false}},Hooks:{onError:(_where,error)=>{throw error;}},foundry:{utils:{deepClone:structuredClone,expandObject:()=>({}),mergeObject:(a,b)=>Object.assign(a,b)},documents:{}}};
vm.runInNewContext(`class Color {}
${['typePrototypes','plainObjectPrototype'].map(name=>variable(helpers,name)).join('\n')}
${['isPlainObject','getType','isEmpty','getProperty','equals'].map(name=>declaration(helpers,name)).join('\n')}
function iterateEntries(){throw Error('Object equality outside numeric profile');}
foundry.utils.isPlainObject=isPlainObject;foundry.utils.isEmpty=isEmpty;foundry.utils.getType=getType;
foundry.utils.getProperty=(data,path)=>{const value=getProperty(data,path);trace.push({event:'read',path,value:getType(value)==='Set'?{kind:'Set',members:Array.from(value)}:value});return value;};
Number.prototype.toNearest=${declaration(ffiles.get('common/primitives/number.mjs'),'toNearest').replace('function toNearest','function')};
Number.isNumeric=value=>value!==null&&value!==''&&typeof value!=='boolean'&&Number.isFinite(Number(value));
Math.clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
class DataField {static #cleanDefaultTrue=[];constructor(options={}){Object.assign(this,this.constructor._defaults,options);}
${['_defaults','getInitialValue','clean','_validateSpecial','_cleanType','initialize','applyChange','_castChangeDelta','_applyChangeAdd','_applyChangeOverride','_applyChangeMultiply'].map(name=>f('common/data/fields.mjs','DataField',name)).join('\n')}
_replaceDataRefs(value){if(value.includes('@'))throw Error('No reference deltas in this oracle');return value;}
validate(value){try{if(Array.isArray(value)){for(const element of value)this.element._validateType(element);}else this._validateType(value);}catch(error){return error;}return null;}
}
class NumericField extends DataField {
${['_defaults','_cast','_cleanType','_validateType','#isValidChoice','_castChangeDelta','_applyChangeSubtract','_applyChangeMultiply','_applyChangeUpgrade','_applyChangeDowngrade'].map(name=>f('common/data/fields.mjs','NumberField',name)).join('\n')}
}
class EmbeddedDataField {}
Set.prototype.equals=${declaration(ffiles.get('common/primitives/set.mjs'),'equals')};
Set.prototype.map=${declaration(ffiles.get('common/primitives/set.mjs'),'map')};
class StringField extends DataField {${['_defaults','getInitialValue','_cast','clean','_validateSpecial','_validateType'].map(name=>f('common/data/fields.mjs','StringField',name)).join('\n')} }
class ArrayField extends DataField {constructor(element,options={}){super(options);this.element=element;}
${['_defaults','getInitialValue','initialize','_cast','_cleanType','_cleanElement','_castChangeDelta'].map(name=>f('common/data/fields.mjs','ArrayField',name)).join('\n')} }
class SetField extends ArrayField {${['initialize','_castChangeDelta','_applyChangeAdd','_applyChangeSubtract','_applyChangeUpgrade','_applyChangeDowngrade'].map(name=>f('common/data/fields.mjs','SetField',name)).join('\n')} }
${files.get('module/filter.mjs').replace(/^export /gm,'')}
class FiltersField {${n('module/data/fields/filters-field.mjs','FiltersField','initialize')}}
class ModelBase {prepareBaseData(){}}
class EffectModel extends ModelBase {#conditionSuppressed=null;get isOnActivity(){return false;}
${['prepareBaseData','evaluateCondition','isSuppressed'].map(name=>n(effectModel,'ActiveEffectDataModel',name)).join('\n')}
}
class FEffect {
${['active','isSuppressed','shouldApplyChange','getReplacementData'].map(name=>f('client/documents/active-effect.mjs','ActiveEffect',name)).join('\n')}
static _shimChanges(){} static applyChange(actor,change){return applyNumeric(actor,change);}
}
FEffect.CHANGE_PHASES={initial:{},final:{}};
class NEffect extends FEffect {
${['isSuppressed','applicableType','shouldApplyChange','getReplacementData','#getEffectItemData'].map(name=>n(effectDoc,'ActiveEffect5e',name)).join('\n')}
}
class Scaling {constructor(){throw Error('Item replacement context outside this oracle');}}
${files.get('module/documents/actor/proficiency.mjs').replace('export default class','class')}
class ActorDataModel {
${['prepareEmbeddedData','_prepareScaleValues','getRollData'].map(name=>n(model,'ActorDataModel',name)).join('\n')}
}
class CommonTemplate extends ActorDataModel {
${['#BONUS_FIELD_PATHS','#ABILITY_BONUS_FIELD_PATHS','#SKILL_TOOL_BONUS_FIELD_PATHS','shimBonusData'].map(name=>n(common,'CommonTemplate',name)).join('\n')}
}
class HitDice {constructor(actor){this.actor=actor;}}
const AttributesFields={prepareBaseArmorClass(){},prepareBaseEncumbrance(){}};
const MovementField={_shim(){}},SensesField={_shim(){}};
class CreatureTypeField {initialize(value){return value;}}
function defaultUnits(){return 'ft';}
class CharacterData extends CommonTemplate {
${['prepareBaseData','prepareEmbeddedData'].map(name=>n(character,'CharacterData',name)).join('\n')}
}
class FActor {
${['allApplicableEffects','applyActiveEffects'].map(name=>f('client/documents/actor.mjs','Actor',name)).join('\n')}
}
class NActor extends FActor {
${['allApplicableEffects','applyActiveEffects','getRollData'].map(name=>n(actorDoc,'Actor5e',name)).join('\n')}
}
function field(path){if(path==='traits.armorProf.value')return new SetField(new StringField(),{initial:[]});if(path.startsWith('traits.'))throw Error('Only explicit armorProf Set mutation captured in this phase oracle');return new NumericField(path.includes('.proficiency')?{initial:0}:{required:true,nullable:false,integer:true,min:0,initial:10});}
function applyNumeric(actor,change){const path=change.key.slice(7),parts=path.split('.');let target=actor.system;for(const key of parts.slice(0,-1))target=target[key];const key=parts.at(-1),before=target[key];trace.push({event:'apply',path,before:getType(before)==='Set'?{kind:'Set',members:Array.from(before)}:before});target[key]=field(path).applyChange(before,actor.system,change);return {[change.key]:target[key]};}
foundry.documents.ActiveEffect={implementation:FEffect};
globalThis.native={NumericField,StringField,SetField,FiltersField,EffectModel,NEffect,NActor,CharacterData,field};`,box);
const fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/initial-filters.json'),'utf8'));assert.equal(fixture.nativeCommit,nativeCommit);
const {NumericField,StringField,SetField,FiltersField,EffectModel,NEffect,NActor,CharacterData}=box.native,options={migrate:false,sanitize:false},observations=[];
const source=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/source-before.json'),'utf8'));
const collectionFixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/initial-collection-filters.json'),'utf8'));assert.equal(collectionFixture.nativeCommit,nativeCommit);
const classFixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/initial-class-filters.json'),'utf8'));assert.equal(classFixture.nativeCommit,nativeCommit);
const allCases=[...fixture.cases,...collectionFixture.cases.map(row=>({...row,collection:true})),...classFixture.cases.map(row=>({...row,classBase:true}))];
const get=(object,path)=>path.split('.').reduce((value,key)=>value?.[key],object);
function set(object,path,value){const keys=path.split('.');let parent=object;for(const key of keys.slice(0,-1))parent=parent[key]??={};parent[keys.at(-1)]=value;}
function cleanSet(raw){const element=new StringField(),field=new SetField(element,{initial:[]});return field.initialize(field.clean(structuredClone(raw),options),{});}
for(const row of allCases.filter(row=>!row.workflowUnavailable)){
 const rawSource=structuredClone(source);rawSource.system.abilities.wis.mod=99;rawSource.system.rolls={ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:99}]))};
 if(row.omitProficient)delete rawSource.system.abilities.wis.proficient;
 if(row.collection){rawSource.system.traits=structuredClone(row.extraTraits??{});if(row.raw!=='[absent]')set(rawSource.system.traits,row.path,structuredClone(row.raw));}
 if(row.classBase){const cls=rawSource.items.find(item=>item.type==='class');rawSource.items=[...row.levels.map((levels,index)=>({...structuredClone(cls),_id:'initialClass'+index,name:row.classPoison?'Wrong display class name':cls.name,system:{...structuredClone(cls.system),levels}})),...rawSource.items.filter(item=>item.type!=='class')];rawSource.system.details??={};rawSource.system.details.level=99;rawSource.system.attributes??={};rawSource.system.attributes.prof=99;}
 const sourceBefore=structuredClone(rawSource);
 const actor=new NActor(),system=Object.assign(new CharacterData(),{parent:actor,details:{level:row.classBase?new NumericField({integer:true,min:0,initial:0,persisted:false}).clean(undefined,options):0,xp:{value:0}},attributes:{prof:row.classBase?99:2,movement:{speeds:{}},senses:{ranges:{}}},abilities:{},rolls:{ability:{}},skills:{},tools:{},traits:{},isCreature:true});
 actor.system=system;actor.name=source.name;actor.flags={dnd5e:{}};actor.statuses=new Set();actor._completedActiveEffectPhases=new Set();actor.overrides={};actor.tokenActiveEffectChanges={};
 actor.items=rawSource.items.map(item=>({...structuredClone(item),effects:[],scaleValues:{}}));if(row.classBase)for(const item of actor.items)if(item.type==='class')item.system.levels=new NumericField({required:true,nullable:false,integer:true,min:0,initial:1}).clean(item.system.levels,options);actor.getLevelExp=level=>level*100;actor._prepareSpellcasting=()=>{};
 for(const key of ['str','dex','con','int','wis','cha']){
  const raw=key==='dex'?{value:14,proficient:0}:rawSource.system.abilities[key]??{},save=new NumericField({required:true,integer:true,min:0,max:1,initial:0});
  system.abilities[key]={value:new NumericField({required:true,nullable:false,integer:true,min:0,initial:10}).clean(raw.value,options),proficient:save.clean(raw.proficient,options),bonuses:{},check:{roll:{}},save:{roll:{}}};
 }
 for(const key of ['check','save','skill','tool'])system.rolls.ability[key]={proficiency:new NumericField({initial:0}).clean(undefined,options)};
 if(row.collection){for(const path of collectionFixture.paths)set(system.traits,path,cleanSet(get(rawSource.system.traits,path)));}
 const make=(condition,changes)=>{const effect=Object.assign(new NEffect(),{type:'base',disabled:false,transfer:true,actor,item:null,duration:{expired:false},statuses:new Set()});effect.system=Object.assign(new EffectModel(),{parent:effect,applicableType:'Actor',magical:false,conditions:new FiltersField().initialize(condition??'{}',{}),changes:changes.map(change=>({...change,type:change.type??'add',phase:'initial',priority:change.priority??(change.type==='override'?50:20),conditions:new FiltersField().initialize(change.conditions??'{}',{})}))});return effect;};
 const change={key:row.unknownTarget?'system.unknown.unqualified':'system.abilities.wis.value',type:'add',value:2,...(row.scope==='change'?{conditions:row.conditions}:{})};
 actor.effects=[...(row.priorSet?[make('{}',[{...row.priorSet}])]:[]),...(row.priorWisBonus?[make('{}',[{key:'system.abilities.wis.value',type:'add',value:2}])]:[]),...(row.priorGlobalProf?[make('{}',[{key:'system.rolls.ability.check.proficiency',type:'override',value:2,priority:10}])]:[]),make(row.scope==='change'?'{}':row.conditions,[change])];
 system.prepareBaseData();const initialMembers=row.collection?Array.from(get(system.traits,row.path)):null;if(row.collection)assert.deepEqual(initialMembers,row.expectedInitial,row.id+'/independent initialized Set');
 const before={score:system.abilities.wis.value,saveProficient:system.abilities.wis.proficient,globalCheck:system.rolls.ability.check.proficiency,actorProficiency:system.attributes.prof};assert.deepEqual(before,{score:14,saveProficient:0,globalCheck:0,actorProficiency:row.classBase?row.expectedProficiency:3},row.id+'/schema/base');
 if(row.classBase)assert.equal(system.details.level,row.expectedLevel,row.id+'/base level');
 trace.length=0;actor.applyActiveEffects('initial');
 const after={score:system.abilities.wis.value,globalCheck:system.rolls.ability.check.proficiency};assert.equal(after.score,row.expectedScore,row.id+'/after');assert.equal(after.globalCheck,row.priorGlobalProf?2:0,row.id+'/global');
 const firstApply=trace.findIndex(entry=>entry.event==='apply'),lastRead=trace.findLastIndex(entry=>entry.event==='read');assert.ok(firstApply<0||lastRead<firstApply,row.id+'/all checks before writes');
 if(row.collection)assert.deepEqual(Array.from(get(system.traits,row.path)),row.expectedFinalSet,row.id+'/native final Set after qualified changes');
 assert.deepEqual(rawSource,sourceBefore,row.id+'/source preservation');
 observations.push({id:row.id,...(row.classBase?{classBase:true,classLevels:row.levels,ignoredSource:{level:99,proficiency:99},baseLevel:system.details.level,baseProficiency:system.attributes.prof}:{}),...(row.collection?{collection:true,path:row.path,rawValue:row.raw,initialMembers,finalMembers:Array.from(get(system.traits,row.path))}:{}),rawSourceOperands:{score:rawSource.system.abilities.wis.value,saveProficient:row.omitProficient?'[absent]':rawSource.system.abilities.wis.proficient,ignoredMod:rawSource.system.abilities.wis.mod,discardedGlobalCheck:rawSource.system.rolls.ability.check.proficiency},before,trace:structuredClone(trace),after,expectedSkill:row.expectedSkill,phase:'Explicit schema-initialized qualified fields, native base/embedded and actual initial collection/apply methods; not a full DataModel/Actor lifecycle'});
}
const evidence={nativeCommit,observations,nativeSourceHashes:Object.fromEntries([common,creature,character,model,effectModel,effectDoc,actorDoc,'module/filter.mjs','module/data/actor/templates/traits.mjs','module/data/actor/templates/attributes.mjs','module/data/actor/fields/simple-trait-field.mjs','module/data/actor/fields/damage-trait-field.mjs','module/data/actor/templates/details.mjs','module/data/item/class.mjs','module/documents/actor/proficiency.mjs'].map(path=>[path,sha256(files.get(path))])),foundrySourceHashes:Object.fromEntries([...ffiles].map(([path,text])=>[path,sha256(text)])),stubs:['Primitive NumberField/StringField/ArrayField/SetField initialization/defaults and typed apply/clean methods; validation wrapper, no full DataModel source boot','Collection profile requires explicit trait parent containers; omitted/null values initialize empty Set, trimmed/de-duplicated members precede native has/hasany/hasall/subsetof/empty predicates; no nested predicate/coercion/final/Item snapshot qualification','Character base/embedded/prepareRace and Creature getRollData static source proof do not overwrite queried traits; later prepareResistImmune/label normalization not run before initial checks','Class profile qualifies explicit source levels0..20; missing/coerced/default1 class fields remain module boundaries; DetailsField nonpersisted level initializes0 before actual Character base sum,attributes.prof assignment overwrites poison99; unrelated max-level XP setting stub is milestone','Only explicit 0..30 score/save coefficient and schema-initialized nonpersisted roll proficiency queried; stale raw mod/global99 omitted by schema provenance, not prepared overrides','Exact Character base/embedded methods and Actor getRollData/initial collection methods; unrelated HitDice/AC/encumbrance/movement/senses constructor helpers and XP mapping are stubs, no claimed qualification of those domains here','Exact Common legacy bonus shims do not overwrite queried scalar fields; Creature classes/subclasses overlay is excluded after static source proof it does not overwrite abilities/rolls; those namespaces remain unavailable','Source Items preserve IDs but active effect/scale collections are empty initialized fixtures; no source Item replacement/permission/content behavior qualified','Exact effect suppression/cache, superclass phase gate, Filter checks and numeric field application; clone/overrides wrappers are explicitly limited and not native serialization acceptance','Expected post-effect scores and totals are independently declared; numeric derived arithmetic composes prior C13/C26 qualification, no native dice engine or installed/operator acceptance']};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');
process.stdout.write(`S: ${observations.length} (${observations.filter(row=>row.collection).length} collection/${observations.filter(row=>row.classBase).length} class) source/schema/base/initial-field filter comparisons and native all-checks-before-apply traces PASS\n`);
