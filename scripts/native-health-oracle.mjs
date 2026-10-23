import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';
const args=process.argv.slice(2),repo=option(args,'--native');if(!repo)throw Error('Supply --native exact source reference');
const files=readRelease(repo),require=createRequire(join(coreRoot(args),'package.json')),ts=require('typescript');
function method(path,cls,name){const ast=ts.createSourceFile(path,files.get(path),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),c=ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===cls),m=c?.members.find(n=>n.name?.getText(ast)===name);if(!m)throw Error('Missing '+cls+'.'+name);return m.getText(ast);}
const attributePath='module/data/actor/templates/attributes.mjs',advPath='module/documents/advancement/hit-points.mjs',common='module/data/actor/templates/common.mjs',character='module/data/actor/character.mjs',classPath='module/data/item/class.mjs';
assert.match(files.get(character),/this.attributes.hd = new HitDice\(this.parent\)/);
const derived=method(character,'CharacterData','prepareDerivedData');const hpStart=derived.indexOf('const hpOptions = {}');assert.ok(hpStart>0);const hpBranch=derived.slice(hpStart,derived.lastIndexOf('}'));
assert.match(hpBranch,/this.attributes.hp.max === null/);assert.match(hpBranch,/HitPoints\?\.\[0\]/);
assert.match(files.get(classPath),/initial: "d6"/);assert.match(files.get(classPath),/spent: new NumberField\(\{ required: true, nullable: false, integer: true, initial: 0, min: 0/);
assert.match(files.get(character),/max: new NumberField\(\{\s*nullable: true, integer: true, min: 0, initial: null/);
const simplifyAst=ts.createSourceFile('utils.mjs',files.get('module/utils.mjs'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),simplify=simplifyAst.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='simplifyBonus').getText(simplifyAst).replace(/^export /,'');
const sandbox={evaluateHealthFormula:value=>{if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(String(value)))throw Error('Nonliteral oracle input');return Number(value);},CONFIG:{DND5E:{defaultAbilities:{hitPoints:'con'},maxAbilityScore:30,abilities:{con:{type:'physical'}}}},dnd5e:{settings:{rulesVersion:'modern',proficiencyModifier:'bonus'}},SpellcastingField:{prepareData:()=>{}},AppliedRules:{collect:()=>({filterWith:()=>({toFormula:()=>''})})},_loc:v=>v,console:{error:()=>{throw Error('Unqualified native formula');}}};
vm.runInNewContext(`Number.isNumeric=value=>value!==null&&value!==''&&typeof value!=='boolean'&&Number.isFinite(Number(value));
Math.clamp=(v,min,max)=>Math.max(min,Math.min(max,v));Set.prototype.reduce=function(fn,initial){return Array.from(this).reduce(fn,initial);};
class Roll { constructor(value){this.value=value;this.isDeterministic=true;} evaluateSync(){return {total:evaluateHealthFormula(this.value)};} static create(value){return new Roll(value);} }
${files.get('module/documents/actor/proficiency.mjs').replace('export default class','class')}
${simplify}
class CommonTemplate {
${['prepareAbilities','calculateAbilityCheckProficiency'].map(name=>method(common,'CommonTemplate',name)).join('\n')}
static shimAbilityData(){} }
class AttributesFields {${method(attributePath,'AttributesFields','prepareHitPoints')}}
class HpModel extends CommonTemplate {prepareHealth(rollData={}){${hpBranch}}}
class ClassData {${method(classPath,'ClassData','prepareFinalData')}}
class HpAdvancement {${['valueForLevel','getAdjustedTotal','hitDie','hitDieValue'].map(name=>method(advPath,'HitPointsAdvancement',name)).join('\n')} }
`,sandbox);
// Static and instance methods share a name: retain the exact static declaration
// separately, since the AST member lookup above returns the first instance.
const advAst=ts.createSourceFile(advPath,files.get(advPath),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),advClass=advAst.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='HitPointsAdvancement'),staticValue=advClass.members.find(n=>n.name?.getText(advAst)==='valueForLevel'&&n.modifiers?.some(m=>m.kind===ts.SyntaxKind.StaticKeyword)).getText(advAst);
vm.runInNewContext(`Object.defineProperty(HpAdvancement,'valueForLevel',{value:(${staticValue.replace(/^static valueForLevel/,'function')})});
${files.get('module/documents/actor/hit-dice.mjs').replace('export default class','class')}
class HealthActor {${method('module/documents/actor/actor.mjs','Actor5e','classes')}}
globalThis.health={HpModel,ClassData,HpAdvancement,HitDice,HealthActor};`,sandbox);
const fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/health.json'),'utf8')),observations=[];assert.equal(fixture.nativeCommit,nativeCommit);
for(const row of fixture.cases.filter(row=>row.expected)){
 const {HpModel,ClassData,HpAdvancement,HitDice,HealthActor}=sandbox.health,actor=new HealthActor();actor._lazy={};actor.flags={dnd5e:{}};actor.conditionRollReduction=0;actor.coverBonus=0;actor.hasConditionEffect=()=>false;actor._isRemarkableAthlete=()=>false;
 actor.itemTypes={class:row.classes.map((source,index)=>{
  const item={id:'healthClass000'+(index+1),identifier:source.identifier,isOriginalClass:false,getRollData:()=>({})},data=Object.assign(new ClassData(),{parent:item,levels:source.levels,hd:{denomination:source.die??'d6',spent:source.spent??0,additional:source.additional??''}});item.system=data;
  data.prepareFinalData();const advancement=Object.assign(new HpAdvancement(),{item,value:structuredClone(source.choices)});item.advancement={byType:{HitPoints:[advancement]}};return item;
 })};
 const model=Object.assign(new HpModel(),{parent:actor,details:{level:row.classes.reduce((n,c)=>n+c.levels,0)},attributes:{hp:{value:null,max:null,temp:0,tempmax:0,bonuses:{},...structuredClone(row.hp)},prof:3,ac:{cover:0}},abilities:row.con===null?{}:{con:{value:row.initializedCon??row.con,proficient:0,max:null,attack:{roll:{}},check:{roll:{}},save:{roll:{}}}},rolls:{ability:{check:{proficiency:0},save:{proficiency:0}}}});
 model.prepareAbilities();model.prepareHealth();const hd=new HitDice(actor),hp=model.attributes.hp;
 const observed={max:hp.max,effectiveMax:hp.effectiveMax,value:hp.value,temp:hp.temp,hdMax:hd.max,hdValue:hd.value,bySize:JSON.parse(JSON.stringify(hd.bySize))};assert.deepEqual(observed,row.expected,row.id);observations.push({id:row.id,observed});
}
const evidence={evidence:'S exact release methods with explicit initialization and HP branch extraction; no native Document/runtime/operator acceptance',nativeCommit,observations,sourceHashes:Object.fromEntries([attributePath,advPath,common,character,classPath,'module/documents/actor/hit-dice.mjs'].map(path=>[path,sha256(files.get(path))])),stubs:['Character HP branch retained verbatim from prepareDerivedData; unrelated preparation omitted','Explicit source/default schema initialization; native DataModels not constructed','Literal-only Roll for class HD additional; unknown expressions fail','Class SpellcastingField preparation is a no-op; no effects/conditions/flags','Prepared CON uses exact prepareAbilities with empty AppliedRules and numeric-literal bonuses','Native Set.reduce and Math.clamp compatibility helpers; actor classes keyed by persisted identifier','Effect-CON case starts at explicitly specified16 after separately qualified initial numeric effect; not a full effect pipeline capture']};const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');process.stdout.write(`S: ${observations.length} source/default HP/HD cases PASS (no native runtime acceptance)\n`);

export const healthOracle606={sandbox,files,method,health:sandbox.health};
