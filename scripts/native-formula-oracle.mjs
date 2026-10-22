import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';
const args=process.argv.slice(2),files=readRelease(option(args,'--native')),foundry=option(args,'--foundry'),ts=createRequire(join(coreRoot(args),'package.json'))('typescript');
const native=files.get('module/utils.mjs'),rollPath=join(foundry,'client/dice/roll.mjs'),roll=readFileSync(rollPath,'utf8'),grammar=readFileSync(join(foundry,'client/dice/grammar.pegjs'),'utf8');
const ast=(name,text)=>ts.createSourceFile(name,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),ra=ast('Roll',roll),ua=ast('utils',native);
const member=name=>{const node=ra.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Roll').members.find(n=>n.name?.getText(ra)===name);assert.ok(node);return node.getText(ra);};
const fn=name=>ua.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name).getText(ua).replace(/^export /,'');
const get=(o,p)=>p.split('.').reduce((v,k)=>v?.[k],o),set=(o,p,v)=>{const ks=p.split('.');let t=o;for(const k of ks.slice(0,-1))t=t[k]??={};t[ks.at(-1)]=v;};
const nativeMember=(path,cls,name)=>{const a=ast(cls,files.get(path));return a.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===cls).members.find(n=>n.name?.getText(a)===name).getText(a);};
const box={dnd5e:{settings:{proficiencyModifier:'bonus'}},foundry:{utils:{getProperty:get,setProperty:set,getType:value=>typeof value}},_loc:value=>value};
vm.runInNewContext(`Number.isNumeric=value=>typeof value==='number'&&Number.isFinite(value);
const DEPTH=Symbol(),MISSING=Symbol();
${files.get('module/documents/actor/proficiency.mjs').replace('export default class','class')}
class NativeActorModel {${nativeMember('module/data/abstract/actor-data-model.mjs','ActorDataModel','getRollData')}}
class NativeMath {${member('MATH_PROXY')}${member('safeEval')}}
${fn('replaceFormulaData')}
${fn('simplifyBonus')}
${fn('prepareFormulaValue')}
class Roll {constructor(formula,data={}){this.formula=replaceFormulaData(formula,data);this.isDeterministic=true;}evaluateSync(){this.total=NativeMath.safeEval(this.formula);return this;}}
globalThis.nativeFormula={replaceFormulaData,simplifyBonus,prepareFormulaValue,NativeMath,NativeActorModel};`,box);
const fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/deterministic-formulas.json'),'utf8')),data={};for(const [key,value]of Object.entries(fixture.bindings))set(data,key,value);assert.equal(fixture.nativeCommit,nativeCommit);const actorModel=Object.assign(new box.nativeFormula.NativeActorModel(),data,{attributes:{prof:3}}),rollData=actorModel.getRollData({deterministic:true});assert.equal(String(rollData.prof),'3');
assert.match(grammar,/Multiplicative = "\*" \/ "\/" \/ "%"/);assert.match(grammar,/Additive = "\+" \/ "-"/);assert.match(grammar,/FunctionTerm = fn:FunctionName/);assert.match(grammar,/Parenthetical =/);
const observations=[];for(const row of fixture.cases){assert.match(row.formula,/^[a-z@.0-9_\s+*/%(),-]+$/i);const {replaceFormulaData,simplifyBonus,prepareFormulaValue}=box.nativeFormula,expanded=replaceFormulaData(row.formula,rollData);const bonus=simplifyBonus(row.formula,rollData,{strict:true}),item={isEmbedded:false},model={uses:{max:row.formula},parent:item};prepareFormulaValue(model,'uses.max','uses',rollData);assert.equal(bonus,row.expected,row.id);assert.equal(model.uses.max,row.expected,row.id);observations.push({...row,expanded,bonus,capacity:model.uses.max});}
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify({nativeCommit,observations,nativeUtilsSha256:sha256(native),foundryRollSha256:sha256(roll),foundryGrammarSha256:sha256(grammar),fixtureSha256:sha256(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/deterministic-formulas.json'))),limits:['Independent frozen arithmetic/reference results,actual native replacement/simplifyBonus/prepareFormulaValue and Foundry14.367 Math sandbox execute. Test Roll delegates deterministic arithmetic to actual safeEval;full grammar/AST parser and dice execution do not run.','Only arithmetic and explicit numeric bindings;no dice,randomness,proficiency dice,recursive references,scaling,flags/effect replacement or native/operator acceptance. Public numeric-d20 execution remains separately qualified.']},null,2)+'\n');process.stdout.write('S:26 independent deterministic arithmetic/reference bonus/capacity comparisons PASS;declared Roll collaborator,no dice/native acceptance\n');
