import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';
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
static _shimChanges(){} static applyChange(actor,change){trace.push(change.key);return {};}
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
class AdvantageModeField {
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
globalThis.numeric={NumericField,CreatureTemplate,CommonTemplate,NativeDispatch,NativeParts,NativeFormula};`,sandbox);
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
 for(const change of changes){
  const options=change.key.startsWith('system.rolls')?{nullable:false,choices:change.key.includes('.save.')?[0,1]:[0,.5,1,2]}:change.key.endsWith('.value')&&!change.key.includes('.abilities.')?{nullable:false,min:0,max:2,step:.5}:{nullable:false,integer:true,min:0,...(change.key.endsWith('.proficient')?{max:1}:{})};
  const field=Object.assign(new NumericField(),options),value=field.applyChange(get(source,change.key),{},change);set(source,change.key,value);applied.push({key:change.key,value});
 }
 const model=Object.assign(Object.create(CreatureTemplate.prototype),source.system);
 model.attributes={prof:3,ac:{cover:0}};model.parent={flags:{dnd5e:{}},conditionRollReduction:0,coverBonus:0,hasConditionEffect:()=>false,_isRemarkableAthlete:()=>false};
 for(const ability of Object.values(model.abilities)){ability.attack={roll:{}};ability.check={roll:{}};ability.save={roll:{}};ability.max=null;}
 model._source=structuredClone(source.system);model.prepareAbilities();model.skills.prc=model.prepareSkill('prc',{rollData:{},originalSkills:{}});model.prepareTools();
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
const evidence={constantObservations,numericObservations,evidence:'S controlled static Foundry14.367 / exact native6.0.6 phase methods; not native Documents/operator acceptance',nativeCommit,foundry:release,observations,priorities,foundrySources:Object.fromEntries([...core].map(([path,source])=>[path,sha256(source)])),stubs:['Explicit initialized effect defaults; no Foundry DataModel initialization','Numeric field clean/validate/initialize wrappers, exact operations/rounding; numeric-literal-only Roll stub; no references/expressions','Exact native derived methods with empty applied rules/flags/conditions and source mode defaults; no Document/runtime' ,'Untimed empty-condition effects only','Empty roll data; hidden/dependent/rider/antimagic absent','Phase-order capture traces changes only; numeric cases separately execute static NumberField operations; no hooks/token-size/spellcasting/Item derivation','Exact skill/tool dispatch and builder capture with numeric initialized model; no dice evaluation or native Document lifecycle','Constant FormulaField casts and add/subtract/override string operations only; no native Roll validation or expression evaluation; expected constant reduction separately verified through public host']};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');process.stdout.write(`S: effect eligibility/phase capture ${observations.length} plus ${numericObservations.length} numeric field/derived and ${constantObservations.length} constant FormulaField constructions PASS\n`);
