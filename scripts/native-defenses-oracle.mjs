import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';
const args=process.argv.slice(2),repo=option(args,'--native');if(!repo)throw Error('Supply --native pinned source reference');
const files=readRelease(repo),require=createRequire(join(coreRoot(args),'package.json')),ts=require('typescript');
function member(path,cls,name){const ast=ts.createSourceFile(path,files.get(path),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),node=ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===cls)?.members.find(n=>n.name?.getText(ast)===name);if(!node)throw Error('Missing '+cls+'.'+name);return node.getText(ast);}
const attributes='module/data/actor/templates/attributes.mjs',common='module/data/actor/templates/common.mjs',advantage='module/data/fields/advantage-mode-field.mjs';
const configAst=ts.createSourceFile('config.mjs',files.get('module/config.mjs'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),armorConfig=configAst.statements.find(n=>ts.isExpressionStatement(n)&&n.expression.left?.getText(configAst)==='DND5E.armorClasses').expression.right.getText(configAst);
const utils=ts.createSourceFile('utils.mjs',files.get('module/utils.mjs'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),simplify=utils.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='simplifyBonus').getText(utils).replace(/^export /,'');
const get=(obj,path)=>typeof path==='string'?path.split('.').reduce((v,k)=>v?.[k],obj):undefined;
const merge=(target,input)=>{for(const [k,v] of Object.entries(input)){if(v&&typeof v==='object'&&!Array.isArray(v))target[k]=merge(target[k]??{},v);else target[k]=v;}return target;};
// Independently specified constant expression results; no module output/parser
// supplies the oracle and unknown expressions fail instead of evaluating code.
const arithmetic=new Map([['10+2',12],['10+-2',8],['13+2',15],['10+2+3',15],['10+2+2',14],['10+2+4',16],['10+2+0',12],['2+3',5],['2+1+3',6],['1+2+3',6],['1+2+3',6]]);
function constant(value){const text=String(value).replace(/\s/g,'');if(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text))return Number(text);if(arithmetic.has(text))return arithmetic.get(text);throw Error('Unknown controlled expression '+text);}
let currentSettings={};const sandbox={CONFIG:{DND5E:{defaultAbilities:{initiative:'dex'},maxAbilityScore:30,skillPassive:{base:10,modifier:5},abilities:Object.fromEntries(['str','dex','con','int','wis','cha'].map(id=>[id,{type:['str','dex','con'].includes(id)?'physical':'mental'}])),armorTypes:{light:{},medium:{},heavy:{},shield:{}}}},dnd5e:{settings:{rulesVersion:'modern',proficiencyModifier:'bonus'}},game:{settings:{get:(_scope,key)=>currentSettings[key]},user:{isGM:true}},Hooks:{callAll:()=>{}},_loc:value=>value,AppliedRules:{collect:()=>({filterWith:()=>({toFormula:(parts=[])=>parts.join(' + '),toAdvantageCounts:(counts={})=>counts,resolve:()=>({toSmallest:value=>value,toLargest:value=>value})})})},console:{error:()=>{throw Error('Unexpected native expression');}},foundry:{utils:{getProperty:get,iterateEntries:value=>Object.entries(value),mergeObject:merge,getType:value=>value&&typeof value==='object'?'Object':typeof value,setProperty:(obj,path,value)=>{const keys=path.split('.');let target=obj;for(const k of keys.slice(0,-1))target=target[k]??={};target[keys.at(-1)]=value;}}},constant,
replaceFormulaData:(formula,_data,{actor})=>String(formula).replace(/@([a-zA-Z0-9_.]+)/g,(_match,path)=>{const value=get(actor,path);if(typeof value!=='number')throw Error('Missing controlled reference '+path);return String(value);})};
vm.runInNewContext(`Number.isNumeric=value=>value!==null&&value!==''&&typeof value!=='boolean'&&Number.isFinite(Number(value));
class Roll {constructor(value){this.value=value;this.isDeterministic=true;}evaluateSync(){return {total:constant(this.value)};}static create(value){return new Roll(value);}}
${files.get('module/documents/actor/proficiency.mjs').replace('export default class','class')}
${simplify}
class CommonTemplate {${['prepareAbilities','calculateAbilityCheckProficiency'].map(m=>member(common,'CommonTemplate',m)).join('\n')}
static shimAbilityData(){} }
class AttributesFields {${['prepareArmorClass','prepareInitiative','_migrateArmorClass','_migrateInitiative'].map(m=>member(attributes,'AttributesFields',m)).join('\n')} }
class AdvantageModeField {${['combineFields','getCounts','resolveMode'].map(m=>member(advantage,'AdvantageModeField',m)).join('\n')} }
class D20RollModificationField {${['combineFields','#makeRulesIterator'].map(m=>member('module/data/shared/d20-roll-modification-field.mjs','D20RollModificationField',m)).join('\n')} }
class NativeParts {${['constructParts','mergeOptions'].map(m=>member('module/dice/basic-roll.mjs','BasicRoll',m)).join('\n')} }
class NativeActor {${['getInitiativeRollConfig','getInitiativeRoll'].map(m=>member('module/documents/actor/actor.mjs','Actor5e',m)).join('\n')} }
class D20Constructor extends NativeParts {constructor(formula){super();this.nativeClass='D20Roll';this.formula=formula;}}class BasicConstructor {constructor(formula){this.nativeClass='BasicRoll';this.formula=formula;}}
CONFIG.DND5E.armorClasses=${armorConfig};CONFIG.Dice={D20Roll:D20Constructor,BasicRoll:BasicConstructor};globalThis.native={CommonTemplate,AttributesFields,NativeActor};`,sandbox);
const fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/defenses-initiative.json'),'utf8')),observations=[],migrations=[];assert.equal(fixture.nativeCommit,nativeCommit);
const schema=member(attributes,'AttributesFields','armorClass');
const armorAst=ts.createSourceFile('armor.mjs',`class Armor {${schema}}`,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),armorGetter=armorAst.statements[0].members[0],armorFields=armorGetter.body.statements.find(n=>ts.isReturnStatement(n)).expression.properties;
for(const key of ['armor','base','bonus','calc','cover','formula','min','shield'])assert.match(armorFields.find(n=>n.name?.getText(armorAst)===key).initializer.getText(armorAst),/persisted: false/);
assert.match(schema,/initial: \["unarmored", "armored"\]/);
for(const row of fixture.cases){
 const {CommonTemplate,AttributesFields,NativeActor}=sandbox.native,e=row.expected,actor=Object.assign(new NativeActor(),{flags:{dnd5e:{}},itemTypes:{equipment:[]},_preparationWarnings:[],coverBonus:0,conditionRollReduction:0,_isRemarkableAthlete:()=>false,hasConditionEffect:()=>false,getRollData:()=>({roll:{}}),addConditionRollReduction:()=>{}});
 const abilities={dex:{value:14},con:{value:14},wis:{value:16},cha:{value:10}};
 for(const [key,value] of Object.entries(row.abilities??{})){if(value===null)delete abilities[key];else abilities[key].value=value;}
 for(const [key,data] of Object.entries(abilities))Object.assign(data,{proficient:0,max:null,attack:{roll:{}},check:{roll:{...row.abilityRolls?.[key]}},save:{roll:{}}});
 const ac={armor:10,base:-Infinity,bonus:'',calc:'',calcs:vm.runInNewContext('new Set()',{}),cover:0,flat:row.ac.flat??0,formulas:structuredClone(row.ac.formulas??[]),min:'',override:row.ac.override??null,shield:0};for(const key of row.ac.calcs??['unarmored','armored'])ac.calcs.add(key);
 const init={ability:row.init.ability??'',roll:{mode:0,...structuredClone(row.init.roll??{})}},model=Object.assign(Object.create(CommonTemplate.prototype),{parent:actor,abilities,attributes:{ac,init,prof:3},rolls:{ability:{check:{proficiency:0,...structuredClone(row.globalCheck??{})}}},isNPC:false});actor.system=model;
 for(const [path,value] of Object.entries(row.bounds??{})){const keys=path.split('.');let target=model;for(const key of keys)target=target[key]??={};Object.assign(target,value);}
 model._source=structuredClone({abilities:model.abilities,attributes:{init},rolls:model.rolls});
 if(row.globalProficiencyEffect!==undefined)model.rolls.ability.check.proficiency=row.globalProficiencyEffect;
 if(row.nativeInitBonus!==undefined)init.roll.bonus='2 + 3';
 if(row.nativeInitMode!==undefined){init.roll.mode=1;init.roll.modeCounts={override:null,advantages:{count:1,suppressed:false},disadvantages:{count:0,suppressed:false}};}
 sandbox.dnd5e.settings.proficiencyModifier=row.settings?.proficiency??'bonus';currentSettings={initiativeDexTiebreaker:row.settings?.tie??false,initiativeScore:row.settings?.score??'none'};
 model.prepareAbilities();const observed={id:row.id};
 if(e.ac!==null&&!row.equipped){AttributesFields.prepareArmorClass.call(model,{});assert.equal(ac.value,e.ac,row.id+'/AC');if(row.calculation)assert.equal(ac.calc,row.calculation);observed.armor={value:ac.value,base:ac.base,calculation:ac.calc};}
 if(e.total!==null){
  AttributesFields.prepareInitiative.call(model,{});assert.equal(init.total,e.total,row.id+'/initiative');assert.equal(init.score,e.score,row.id+'/score');
  const cfg=actor.getInitiativeRollConfig(),fixed=cfg.options.fixed!==undefined,parts=Array.from(cfg.parts),bonus=cfg.data.ruleBonus?constant(cfg.data.ruleBonus):0;
  const total=fixed?cfg.options.fixed:cfg.data.mod+Number(cfg.data.prof??0)+bonus+parts.filter(p=>/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(p)).reduce((sum,p)=>sum+Number(p),0);
  const mode=fixed?0:Number(cfg.options.advantage)-Number(cfg.options.disadvantage);
  if(!row.executionUnavailable){assert.equal(total,e.rollBonus,row.id+'/roll');assert.equal(mode,e.mode,row.id+'/mode');assert.equal(fixed,e.fixed,row.id+'/fixed');}
  const construction=actor.getInitiativeRoll();assert.equal(construction.nativeClass,fixed?'BasicRoll':'D20Roll');
  observed.initiative={nativeClass:construction.nativeClass,nativeFormula:construction.formula,disposition:row.executionUnavailable?'unqualified-intermediate-diagnostic':'qualified-initialized-model',total:init.total,score:init.score,parts,data:cfg.data,rollBonus:total,mode,fixed,minimum:Number.isFinite(cfg.options.minimum)?cfg.options.minimum:'unbounded',maximum:Number.isFinite(cfg.options.maximum)?cfg.options.maximum:'unbounded'};
 }
 if(row.id.startsWith('legacy-')){const source={ac:structuredClone(row.ac),init:structuredClone(row.init)};AttributesFields._migrateArmorClass(source);AttributesFields._migrateInitiative(source);migrations.push({id:row.id,after:source});}
 observations.push(observed);
}
const evidence={evidence:'S controlled exact native initialization/AC/initiative methods; not native DataModels/Documents/engine acceptance',nativeCommit,observations,migrations,armorClasses:JSON.parse(JSON.stringify(sandbox.CONFIG.DND5E.armorClasses)),stubs:['Explicit initialized defaults/nonpersisted fields; legacy aliases separately captured, not qualified','Property binding/registry iteration; independently specified constant arithmetic lookup only; unknown formulas fail','No equipped Item interpretation; explicit override case with equipped source remains outside method capture','No conditions/flags/applied rules/cover/travel; character only; numeric initialized proficiency and modes','Initial init bonus/mode and global proficiency cases start after separately qualified effect operations','Native initiative config captured without dice; fixed scores versus d20 execution kept distinct'],sourceHashes:Object.fromEntries([attributes,common,advantage,'module/documents/actor/actor.mjs','module/config.mjs','module/data/actor/fields/ac-formulas-field.mjs','module/settings.mjs'].map(path=>[path,sha256(files.get(path))]))};const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');process.stdout.write(`S: ${observations.filter(o=>o.armor).length} AC / ${observations.filter(o=>o.initiative).length} initiative cases and ${migrations.length} separate legacy migrations PASS\n`);
