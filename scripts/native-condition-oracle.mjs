import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';
const args=process.argv.slice(2),repo=option(args,'--native'),foundry=option(args,'--foundry');
if(!repo||!foundry)throw Error('Supply exact --native6.0.6 and static --foundry14.367; no service is started');
const files=readRelease(repo),ts=createRequire(join(coreRoot(args),'package.json'))('typescript');
const release=JSON.parse(readFileSync(join(foundry,'package.json'),'utf8')).release;assert.equal(release.generation,14);assert.equal(release.build,367);
const paths=['client/documents/actor.mjs','client/documents/active-effect.mjs','common/data/fields.mjs','common/primitives/number.mjs','common/primitives/set.mjs','common/data/active-effect.mjs','common/documents/active-effect.mjs'];
const ffiles=new Map(paths.map(path=>[path,readFileSync(join(foundry,path),'utf8')]));
function member(text,cls,name){const getter=name.startsWith('get:'),key=getter?name.slice(4):name;const ast=ts.createSourceFile(cls,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),node=ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===cls)?.members.find(n=>n.name?.getText(ast)===key&&(!getter||ts.isGetAccessor(n)));if(!node)throw Error('Missing '+cls+'.'+name);return node.getText(ast);}
function fn(text,name){const ast=ts.createSourceFile(name,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),node=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);if(!node)throw Error('Missing '+name);return node.getText(ast).replace(/^export /,'');}
const n=(path,cls,name)=>member(files.get(path),cls,name),f=(path,cls,name)=>member(ffiles.get(path),cls,name);
const actorPath='module/documents/actor/actor.mjs',effectPath='module/documents/active-effect.mjs',effectModel='module/data/abstract/active-effect-data-model.mjs',conditionPath='module/data/active-effect/condition.mjs',common='module/data/actor/templates/common.mjs',creature='module/data/actor/templates/creature.mjs',modePath='module/data/fields/advantage-mode-field.mjs';
assert.match(files.get(conditionPath),/level: new NumberField\(\{ nullable: true, integer: true, initial: null, min: 1/);
assert.match(files.get(conditionPath),/type: new StringField\(\{ required: true, blank: false/);
assert.match(ffiles.get('common/documents/active-effect.mjs'),/statuses: new fields\.SetField\(new fields\.StringField\(\{required: true, blank: false/);
const fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/poisoned-condition.json'),'utf8'));assert.equal(fixture.nativeCommit,nativeCommit);
const ast=ts.createSourceFile('config',files.get('module/config.mjs'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
function registry(name){return ast.statements.find(node=>ts.isExpressionStatement(node)&&node.expression.left?.getText(ast)==='DND5E.'+name).expression.right.getText(ast);}
const get=(obj,path)=>typeof path==='string'?path.split('.').reduce((value,key)=>value?.[key],obj):undefined,set=(obj,path,value)=>{const keys=path.split('.');let target=obj;for(const key of keys.slice(0,-1))target=target[key]??={};target[keys.at(-1)]=value;};
const merge=(target,input)=>{for(const [key,value]of Object.entries(input)){if(value&&typeof value==='object'&&!Array.isArray(value)&&!(value instanceof Set))target[key]=merge(target[key]??{},value);else target[key]=value;}return target;};
let settings={};const trace=[],box={trace,structuredClone,game:{settings:{get:(_system,key)=>settings[key]},user:{isGM:false}},equals:Object.is,_loc:value=>value,Trait:{keyLabel:key=>key},TravelField:{getTravelPaceMode:()=>({advantage:false,disadvantage:false})},SkillToolRollConfigurationDialog:class{},ChatMessage:{getSpeaker:()=>({})},Item:class{},Hooks:{callAll:()=>{},onError:(_where,error)=>{throw error;}},dnd5e:{settings:{rulesVersion:'modern',proficiencyModifier:'bonus',tokenSizeSync:false}},foundry:{documents:{},utils:{getProperty:get,setProperty:set,deepClone:structuredClone,mergeObject:merge,expandObject:()=>({}),isPlainObject:value=>!!value&&Object.getPrototypeOf(value)===Object.prototype,getType:value=>value&&typeof value==='object'?'Object':typeof value}},AppliedRules:{collect:()=>({filterWith:()=>({toFormula:(parts=[])=>parts.join(' + '),toAdvantageCounts:(counts={})=>counts,resolve:()=>({toSmallest:value=>value,toLargest:value=>value})})})},CONFIG:{DND5E:{defaultAbilities:{initiative:'dex'},maxAbilityScore:30,skillPassive:{base:10,modifier:5},abilities:{str:{value:10,proficient:0,max:null,attack:{roll:{}},check:{roll:{mode:0}},save:{roll:{mode:0}}},wis:{type:'mental'},dex:{type:'physical'}}}}};
vm.runInNewContext(`
Set.prototype.some=${fn(ffiles.get('common/primitives/set.mjs'),'some')};
Set.prototype.reduce=${fn(ffiles.get('common/primitives/set.mjs'),'reduce')};
Number.prototype.toNearest=${fn(ffiles.get('common/primitives/number.mjs'),'toNearest').replace('function toNearest','function')};
Number.isNumeric=value=>value!==null&&value!==''&&typeof value!=='boolean'&&Number.isFinite(Number(value));
Math.clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
CONFIG.DND5E.conditionTypes=${registry('conditionTypes')};CONFIG.DND5E.conditionEffects=${registry('conditionEffects')};
class EmbeddedDataField {}
const isPlainObject=foundry.utils.isPlainObject;
class SourceField {static #cleanDefaultTrue=[];constructor(options={}){Object.assign(this,this.constructor._defaults,options);}
${['_defaults','getInitialValue','clean','_validateSpecial','_cleanType','initialize'].map(name=>f('common/data/fields.mjs','DataField',name)).join('\n')}
}
class SourceNumber extends SourceField {${['_defaults','_cast','_cleanType'].map(name=>f('common/data/fields.mjs','NumberField',name)).join('\n')} }
class SourceBoolean extends SourceField {${['_defaults','_cast'].map(name=>f('common/data/fields.mjs','BooleanField',name)).join('\n')} }
class SourceString extends SourceField {${['_defaults','getInitialValue','_cast','clean','_validateSpecial'].map(name=>f('common/data/fields.mjs','StringField',name)).join('\n')} }
class SourceArray extends SourceField {constructor(element,options={}){super(options);this.element=element;}
${['_defaults','getInitialValue','_cast','_cleanType','_cleanElement','initialize'].map(name=>f('common/data/fields.mjs','ArrayField',name)).join('\n')} }
class SourceSet extends SourceArray {${f('common/data/fields.mjs','SetField','initialize')} }
function initializeSource(raw){const options=Object.freeze({migrate:false,sanitize:false});const statusField=new SourceSet(new SourceString({required:true,blank:false}));return {disabled:new SourceBoolean().clean(raw.disabled,options),statuses:statusField.initialize(statusField.clean(structuredClone(raw.statuses),options),{}),type:new SourceString({required:true,blank:false}).clean(raw.type,options),level:new SourceNumber({nullable:true,integer:true,initial:null,min:1}).clean(raw.level,options)};}
class Field {
${['applyChange','_castChangeDelta','_applyChangeAdd','_applyChangeOverride'].map(name=>f('common/data/fields.mjs','DataField',name)).join('\n')}
_replaceDataRefs(value){return value;}clean(value){return this._cleanType(value);}validate(value){try{this._validateType(value);}catch(error){return error;}return null;}initialize(value){return value;}
}
class NumericField extends Field {${['_cast','_cleanType','_validateType','#isValidChoice','_castChangeDelta','_applyChangeSubtract','_applyChangeMultiply','_applyChangeUpgrade','_applyChangeDowngrade'].map(name=>f('common/data/fields.mjs','NumberField',name)).join('\n')} }
class AdvantageModeField extends NumericField {
${['_applyChangeAdd','_applyChangeSubtract','_applyChangeMultiply','_applyChangeOverride','_applyChangeUpgrade','_applyChangeDowngrade','combineFields','getCounts','resolveMode','setMode'].map(name=>n(modePath,'AdvantageModeField',name)).join('\n')}
}
${files.get('module/documents/actor/proficiency.mjs').replace('export default class','class')}
${fn(files.get('module/utils.mjs'),'simplifyBonus')}
class CommonTemplate {${['prepareAbilities','calculateAbilityCheckProficiency','calculateToolProficiency','calculateSkillToolProficiency'].map(name=>n(common,'CommonTemplate',name)).join('\n')}static shimAbilityData(){} }
class CreatureTemplate extends CommonTemplate {${['prepareSkill','prepareTools'].map(name=>n(creature,'CreatureTemplate',name)).join('\n')} }
class ModelBase {prepareBaseData(){}prepareDerivedData(){}}
class EffectModel extends ModelBase {#conditionSuppressed=null;get isOnActivity(){return false;}
${['prepareBaseData','evaluateCondition','isSuppressed'].map(name=>n(effectModel,'ActiveEffectDataModel',name)).join('\n')}
}
class ConditionData extends EffectModel {${['hasLevels','get:hasLevels','maxLevel','isSuppressed','prepareDerivedData','getIconByLevel'].map((name,index)=>index===0?n(conditionPath,'ConditionData','hasLevels').replace(/^get /,''):n(conditionPath,'ConditionData',name)).join('\n')} }
class FEffect {${['active','isSuppressed','shouldApplyChange','getReplacementData'].map(name=>f('client/documents/active-effect.mjs','ActiveEffect',name)).join('\n')}
static _shimChanges(){}static applyChange(actor,change){trace.push({event:'ci-change',change:change.value,statusesBefore:Array.from(actor.statuses),immunitiesBefore:Array.from(actor.system.traits.ci.value)});actor.system.traits.ci.value=change.value==='add'?new Set(['poisoned']):new Set();return {};}}
FEffect.CHANGE_PHASES={initial:{},final:{}};
class NEffect extends FEffect {${['isSuppressed','applicableType'].map(name=>n(effectPath,'ActiveEffect5e',name)).join('\n')} }
class FActor {${['allApplicableEffects','applyActiveEffects','_clearData'].map(name=>f('client/documents/actor.mjs','Actor',name)).join('\n')} }
class D20RollModificationField {${['combineFields','#makeRulesIterator'].map(name=>n('module/data/shared/d20-roll-modification-field.mjs','D20RollModificationField',name)).join('\n')} }
class D20Dialog {${n('module/applications/dice/d20-configuration-dialog.mjs','D20RollConfigurationDialog','_finalizeConfig')} }
class AttributesFields {${n('module/data/actor/templates/attributes.mjs','AttributesFields','prepareInitiative')} }
class NativeParts {${['constructParts','mergeOptions'].map(name=>n('module/dice/basic-roll.mjs','BasicRoll',name)).join('\n')} }
class NActor extends FActor {${['#rollSkillTool','_buildSkillToolConfig','getInitiativeRollConfig','allApplicableEffects','applyActiveEffects','hasConditionEffect','conditionRollReductions','conditionRollReduction'].map(name=>n(actorPath,'Actor5e',name)).join('\n')}
getRollData(){return {...this.system,roll:{}};}_prepareSpellcasting(){}getFlag(){return undefined;}addConditionRollReduction(){}run(...args){return this.#rollSkillTool(...args);} }
class TraitsFields {${n('module/data/actor/templates/traits.mjs','TraitsField','prepareResistImmune')} }
dnd5e.dataModels={actor:{CommonTemplate}};
CONFIG.DND5E.skills={prc:{ability:'wis',label:'Perception'}};CONFIG.DND5E.tools={thief:{ability:'dex'}};CONFIG.DND5E.vehicleTypes={};
CONFIG.Dice={D20Roll:{ADV_MODE:{NORMAL:0,ADVANTAGE:1,DISADVANTAGE:-1},constructParts:NativeParts.constructParts,mergeOptions:NativeParts.mergeOptions,mergeConfigs:(a,b={})=>Object.assign(a,b),build:async(process,dialog)=>{const config={options:{advantage:process.advantage,disadvantage:process.disadvantage}};dialog.options.buildConfig(process,config,undefined,0);globalThis.builtCapture={process,config};return [];}}};
foundry.documents.ActiveEffect={implementation:FEffect};foundry.documents.Actor=FActor;
function make(profile,modes=[0,0,0,0]){
 trace.length=0;
 const actor=new NActor(),model=Object.assign(new CreatureTemplate(),{parent:actor,attributes:{init:{ability:'dex',roll:{mode:profile.initMode??0}},prof:Proficiency.calculateMod(5),ac:{cover:0}},abilities:{str:{value:10,proficient:0,max:null,attack:{roll:{}},check:{roll:{mode:0}},save:{roll:{mode:0}}},wis:{value:14,proficient:0,max:null,attack:{roll:{}},check:{roll:{mode:modes[0]}},save:{roll:{mode:0}}},dex:{value:14,proficient:0,max:null,attack:{roll:{}},check:{roll:{mode:0}},save:{roll:{mode:0}}}},skills:{prc:{value:profile.skillValue??1,ability:'wis',roll:{mode:modes[1]},bonuses:{passive:''}}},tools:{thief:{value:profile.toolValue??1,ability:'dex',roll:{mode:0}}},rolls:{ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{mode:key==='check'?modes[2]:key==='skill'?modes[3]:0,proficiency:0}]))},traits:{ci:{value:new Set(profile.immunities)},dr:{value:new Set(),bypasses:new Set()},di:{value:new Set()},dv:{value:new Set()}},conditions:{},prepareEmbeddedData(){}});
 model._source=structuredClone({attributes:{init:model.attributes.init},abilities:model.abilities,skills:model.skills,tools:model.tools,rolls:model.rolls});
 model.schema={getField:()=>Object.assign(new AdvantageModeField(),{nullable:false,choices:[-1,0,1]})};
 if(profile.modeEffect){const e=profile.modeEffect,field=model.schema.getField(e.path);foundry.utils.setProperty(model,e.path,field.applyChange(foundry.utils.getProperty(model,e.path),model,{key:e.path,type:e.type,value:e.value}));}
 Object.assign(actor,{system:model,items:[],effects:[],statuses:new Set(['stale-input']),_completedActiveEffectPhases:new Set(),_lazy:{},flags:{dnd5e:{}},coverBonus:0,_isRemarkableAthlete:()=>false});actor._clearData();
 for(let index=0;index<(profile.duplicate?2:1);index++){
  const initialized=initializeSource({disabled:profile.disabled,statuses:profile.statuses,type:profile.systemType??'poisoned',level:profile.level});
  const effect=Object.assign(new NEffect(),{type:'condition',name:profile.name??'Poisoned',actor,parent:actor,item:null,disabled:initialized.disabled,statuses:initialized.statuses,duration:{expired:false}});
  effect.system=Object.assign(new ConditionData(),{parent:effect,type:initialized.type,level:initialized.level,changes:[],applicableType:'Actor',magical:false,conditions:{check:()=>profile.guard!=='{"o":"OR","v":[]}'}});
  effect.system.prepareBaseData();effect.system.prepareDerivedData();actor.effects.push(effect);
 }
 if(profile.ciChange){const effect=Object.assign(new NEffect(),{type:'base',actor,item:null,disabled:false,statuses:new Set(),duration:{expired:false}});effect.system={applicableType:'Actor',changes:[{key:'system.traits.ci.value',type:'add',phase:'initial',value:profile.ciChange,priority:20}],evaluateCondition(){}};actor.effects.push(effect);}
 actor.applyActiveEffects('initial');const initialStatuses=Array.from(actor.statuses);
 TraitsFields.prepareResistImmune.call(model);
 model.prepareAbilities();model.skills.prc=model.prepareSkill('prc',{rollData:{},originalSkills:{}});model.prepareTools();
 const skillMode=AdvantageModeField.combineFields(model,['abilities.wis.check.roll.mode','skills.prc.roll.mode','rolls.ability.check.mode','rolls.ability.skill.mode']).mode;
 globalThis.lastActor=actor;
 return {phaseTrace:structuredClone(trace),documentActiveAfterInitial:actor.effects[0].active,effectivePoisoned:actor.hasConditionEffect('abilityCheckDisadvantage'),initialStatuses,statuses:Array.from(actor.statuses),skill:model.skills.prc.total,passive:model.skills.prc.passive,check:model.abilities.wis.check.value,save:model.abilities.wis.save.value,tool:model.tools.thief.total,mode:skillMode,abilityMode:AdvantageModeField.combineFields(model,['abilities.wis.check.roll.mode','rolls.ability.check.mode']).mode,saveMode:AdvantageModeField.combineFields(model,['abilities.wis.save.roll.mode','rolls.ability.save.mode']).mode,toolMode:AdvantageModeField.combineFields(model,['abilities.dex.check.roll.mode','tools.thief.roll.mode','rolls.ability.check.mode','rolls.ability.tool.mode']).mode,level:actor.effects[0].system.level,conditionRollReduction:actor.conditionRollReduction};
}
globalThis.capture=make;globalThis.initializeSource=initializeSource;globalThis.D20Dialog=D20Dialog;globalThis.AttributesFields=AttributesFields;`,box);
const schemaObservations=[];for(const raw of [{type:'poisoned'},{type:'poisoned',disabled:null,statuses:null,level:null},{type:' poisoned ',disabled:false,statuses:[' poisoned ','poisoned'],level:99}]){const before=structuredClone(raw),value=box.initializeSource(raw);assert.equal(value.disabled,false);assert.equal(value.type,'poisoned');assert.deepEqual(Array.from(value.statuses),raw.statuses?['poisoned']:[]);assert.equal(value.level,raw.level??null);assert.deepEqual(raw,before);schemaObservations.push({raw,initialized:{...value,statuses:Array.from(value.statuses)}});}
const observations=[];let buildCount=0;
async function builds(expectedMode,expectedCombinedMode){
 const result=[];for(const [kind,config,expected] of [['skill',{skill:'prc'},expectedMode],['tool',{tool:'thief'},box.lastActor.hasConditionEffect('abilityCheckDisadvantage')?-1:0],['skill',{skill:'prc',tool:'thief',ability:'wis'},expectedCombinedMode],['tool',{tool:'thief',skill:'prc',ability:'wis'},expectedCombinedMode]]){
  await box.lastActor.run(kind,config);const {process,config:built}=box.builtCapture;
  const mode=Number(process.advantage)-Number(process.disadvantage);assert.equal(mode,expected,JSON.stringify(config));assert.equal(built.data.mod+Number(built.data.prof??0),5);
  result.push({kind,selection:config,mode,total:built.data.mod+Number(built.data.prof??0),parts:Array.from(built.parts)});buildCount++;
 }return result;
}
for(const row of fixture.profiles){const value=box.capture(row);assert.equal(value.effectivePoisoned,row.effectivePoisoned,row.id+'/effective status distinct from Document.active');assert.deepEqual(Array.from(value.statuses),row.expectedStatuses,row.id+'/statuses');if(row.expectedInitialStatuses)assert.deepEqual(Array.from(value.initialStatuses),row.expectedInitialStatuses,row.id+'/before CI normalization');for(const [key,expected]of [['skill',row.expectedSkill],['passive',row.expectedPassive],['check',row.expectedCheck],['save',row.expectedSave],['tool',row.expectedTool],['mode',row.expectedMode],['level',row.expectedLevel],['saveMode',0],['conditionRollReduction',0]])assert.equal(value[key],expected,row.id+'/'+key);observations.push({id:row.id,observed:value,builds:await builds(row.expectedMode,row.expectedCombinedMode),scope:row.ciChange?'Declared synthetic CI change executor; native status aggregation/suppression/query/normalization only':'Initialized condition/Actor model shell; native condition/status/query/mode/passive methods'});}
for(const row of fixture.sourceModes){const value=box.capture(fixture.profiles[0],row.modes);assert.equal(value.mode,row.expectedMode);assert.equal(value.passive,row.expectedPassive);
 // Tool scopes include global check but not the primary skill/ability scopes.
 const toolAdv=row.modes[2]===1,toolDis=true,toolMode=Number(toolAdv)-Number(toolDis);
 const result=[];for(const [kind,config,expected] of [['skill',{skill:'prc'},row.expectedMode],['tool',{tool:'thief'},toolMode],['skill',{skill:'prc',tool:'thief',ability:'wis'},row.expectedCombinedMode],['tool',{tool:'thief',skill:'prc',ability:'wis'},row.expectedCombinedMode]]){
  await box.lastActor.run(kind,config);const {process,config:built}=box.builtCapture;const mode=Number(process.advantage)-Number(process.disadvantage);assert.equal(mode,expected,JSON.stringify(row.modes)+'/'+kind);assert.equal(built.data.mod+Number(built.data.prof??0),5);result.push({kind,selection:config,mode,total:5});buildCount++;
 }observations.push({sourceModes:row.modes,observed:value,builds:result});}

const alternateBuilds=[];
for(const row of fixture.sourceModes){box.capture(fixture.profiles[0],row.modes);for(const ability of ['str','dex'])for(const kind of ['skill','tool']){
 const config={ability,[kind]:kind==='skill'?'prc':'thief'};await box.lastActor.run(kind,config);const {process,config:built}=box.builtCapture;
 const expectedMode=Number((kind==='skill'?row.modes.slice(1):[row.modes[2]]).includes(1))-1,total=ability==='str'?3:5;
 const mode=Number(process.advantage)-Number(process.disadvantage);assert.equal(mode,expectedMode,JSON.stringify(row.modes)+'/'+kind+'/'+ability);assert.equal(built.data.mod+Number(built.data.prof??0),total);
 alternateBuilds.push({modes:row.modes,kind,ability,mode,total});
}}
const proficiencyBuilds=[];
for(const row of fixture.proficiencyCases){const value=box.capture({...fixture.profiles[0],skillValue:row.skill,toolValue:row.tool});assert.equal(value.skill,row.expectedSkill);assert.equal(value.tool,row.expectedTool);assert.equal(value.passive,5+row.expectedSkill);
 for(const kind of ['skill','tool']){await box.lastActor.run(kind,{skill:'prc',tool:'thief',ability:'wis'});const {process,config:built}=box.builtCapture;const mode=Number(process.advantage)-Number(process.disadvantage);assert.equal(mode,row.expectedMode);assert.equal(built.data.mod+Number(built.data.prof??0),row.expectedCombined);proficiencyBuilds.push({...row,kind,mode,total:row.expectedCombined});}
}
const effectBuilds=[];
for(const row of fixture.modeEffects){const value=box.capture({...fixture.profiles[0],modeEffect:row});assert.equal(value.mode,row.mode,row.id);assert.equal(value.passive,15+row.mode*5,row.id);assert.equal(value.toolMode,row.toolMode,row.id);
 for(const kind of ['skill','tool']){await box.lastActor.run(kind,{skill:'prc',tool:'thief',ability:'wis'});const {process}=box.builtCapture;const mode=Number(process.advantage)-Number(process.disadvantage);assert.equal(mode,row.combinedMode,row.id);effectBuilds.push({id:row.id,kind,mode,passive:value.passive});}
}
const manual=[];
for(const sourceMode of [-1,0,1])for(const [action,expected]of [['normal',0],['advantage',1],['disadvantage',-1]]){const dialog=new box.D20Dialog(),config={rolls:[{options:{advantageMode:sourceMode}}]};dialog._finalizeConfig(config,action);assert.equal(config.rolls[0].options.advantageMode,expected);manual.push({sourceMode,action,mode:expected});}
const initiatives=[];
for(const row of fixture.initiativeCases){box.capture({...fixture.profiles[0],initMode:row.initMode});const actor=box.lastActor;settings={initiativeScore:row.scoreMode,initiativeDexTiebreaker:row.tie};box.AttributesFields.prepareInitiative.call(actor.system,{});const init=actor.system.attributes.init;assert.equal(init.total,row.total,row.id);assert.equal(init.score,row.score,row.id);const config=actor.getInitiativeRollConfig(),fixed=config.options.fixed!==undefined,mode=fixed?0:Number(config.options.advantage)-Number(config.options.disadvantage);assert.equal(fixed,row.fixed);assert.equal(mode,row.mode,row.id);const total=fixed?config.options.fixed:config.data.mod+Number(config.data.prof??0)+Array.from(config.parts).filter(part=>/^[0-9.]+$/.test(part)).reduce((a,b)=>a+Number(b),0);assert.equal(total,row.rollBonus,row.id);initiatives.push({id:row.id,total:init.total,score:init.score,rollBonus:total,mode,fixed,parts:Array.from(config.parts)});}

const evidence={nativeCommit,schemaObservations,observations,buildCount,alternateBuilds,proficiencyBuilds,effectBuilds,manual,initiatives,nativeSourceHashes:Object.fromEntries([conditionPath,effectModel,effectPath,actorPath,common,creature,modePath,'module/config.mjs','module/documents/actor/proficiency.mjs','module/data/actor/templates/traits.mjs','module/data/shared/d20-roll-modification-field.mjs','module/dice/basic-roll.mjs','module/data/actor/templates/attributes.mjs','module/applications/dice/d20-configuration-dialog.mjs'].map(path=>[path,sha256(files.get(path))])),foundrySourceHashes:Object.fromEntries([...ffiles].map(([path,value])=>[path,sha256(value)])),limits:['Controlled initialized model phase qualification,not module implementation,full DataModel/native runtime/operator acceptance','Exact primitive Boolean/String/Number/Array/Set cleaning/initialization on copies; source definitions statically verified,not full DataModel validation/migration/source lifecycle','Class/proficiency and ability score fixtures are independently initialized inputs; no class grant/content resolution','Model base preparation hooks,Item/replacementData and callback constant guard are declared stubs; no arbitrary/dependent Filter qualification in this harness','No custom AppliedRules/flags,travelpace,Item/clock/origin behavior; numeric constants only,unrelated attack/AC/savecover fields explicit','CI add/remove executor is synthetic; native initial aggregation,suppression,normalization/query timing is observed,not full native field update or write acceptance','372 actual native skill/tool/combined default builds compared; D20Roll.build callback/parts serializer stubbed,not evaluated dice. D20Dialog action finalization,324 alternate-ability builds,50fractional/expertise combined builds,14mode-effect builds and4initiative configurations compared separately; no native dice engine/installed acceptance']};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');process.stdout.write('S: '+observations.length+' controlled poisoned status/mode/passive captures PASS; 3 primitive source/default and '+buildCount+' default roll builds; '+alternateBuilds.length+' alternate, '+proficiencyBuilds.length+' proficiency, '+effectBuilds.length+' effect, '+manual.length+' manual and '+initiatives.length+' initiative comparisons PASS\n');
