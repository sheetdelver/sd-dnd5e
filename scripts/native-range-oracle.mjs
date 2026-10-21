import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {coreRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';
import {rangeFixture,rangeCases} from './lib/range-expectations.mjs';
const args=process.argv.slice(2),repo=option(args,'--native'),foundry=option(args,'--foundry');if(!repo||!foundry)throw Error('Supply static --native and --foundry references');
const files=readRelease(repo),require=createRequire(join(coreRoot(args),'package.json')),ts=require('typescript'),release=JSON.parse(readFileSync(join(foundry,'package.json'),'utf8')).release;assert.equal(release.generation,14);assert.equal(release.build,367);assert.equal(rangeFixture.nativeCommit,nativeCommit);
const dieSource=readFileSync(join(foundry,'client/dice/terms/die.mjs'),'utf8'),diceSource=readFileSync(join(foundry,'client/dice/terms/dice.mjs'),'utf8');
function member(source,cls,name){const ast=ts.createSourceFile(cls,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),node=ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===cls)?.members.find(n=>n.name?.getText(ast)===name);if(!node)throw Error('Missing '+cls+'.'+name);return node.getText(ast);}
const n=(path,cls,name)=>member(files.get(path),cls,name),get=(obj,path)=>String(path).split('.').reduce((v,k)=>v?.[k],obj);
const sandbox={CONFIG:{Dice:{}},foundry:{utils:{getProperty:get}},AdvantageModeField:{combineFields:()=>({advantage:false,disadvantage:false})},AppliedRules:{collect:()=>{throw Error('Applied rules not qualified');}}};
vm.runInNewContext(`Array.prototype.findSplice=function(predicate){const i=this.findIndex(predicate);if(i>=0)this.splice(i,1);};
class BasicDie {${['expandAdvantage','advantage'].map(m=>n('module/dice/basic-die.mjs','BasicDie',m)).join('\n')} }
class D20Die extends BasicDie {constructor(){super();this.number=1;this.options={};this.modifiers=[];this._evaluated=true;}
${['applyAdvantage','applyRange','applyFlag'].map(m=>n('module/dice/d20-die.mjs','D20Die',m)).join('\n')}
${['minimum','maximum'].map(m=>member(dieSource,'Die',m)).join('\n')}
${member(diceSource,'DiceTerm','total')} }
class D20Roll {${n('module/dice/d20-roll.mjs','D20Roll','ADV_MODE')}
${n('module/dice/d20-roll.mjs','D20Roll','configureModifiers')}
resetFormula(){} }
class RangeFields {${['combineFields','#makeRulesIterator'].map(m=>n('module/data/shared/d20-roll-modification-field.mjs','D20RollModificationField',m)).join('\n')} }
CONFIG.Dice.D20Roll=D20Roll;globalThis.native={D20Die,D20Roll,RangeFields};`,sandbox);
const ranges=[];
for(const row of rangeFixture.ranges){const model=Object.fromEntries(row.scopes.map((value,i)=>['scope'+i,value])),range=sandbox.native.RangeFields.combineFields(model,Object.keys(model));assert.equal(range.minimum,row.minimum??-Infinity);assert.equal(range.maximum,row.maximum??Infinity);ranges.push({id:row.id,minimum:row.minimum,maximum:row.maximum,contributions:row.contributions});}
const observations=[],histograms={};
for(const row of rangeCases()){
    const {D20Die,D20Roll}=sandbox.native,die=new D20Die();
    const roll=new D20Roll();Object.assign(roll,{options:{advantageMode:row.mode,minimum:row.minimum??-Infinity,maximum:row.maximum??Infinity},d20:die,validD20Roll:true});roll.configureModifiers();
    assert.deepEqual(Array.from(die.modifiers),[...(row.mode?[row.mode===1?'adv':'dis']:[]),...(row.minimum===null?[]:[`min${row.minimum}`]),...(row.maximum===null?[]:[`max${row.maximum}`])]);
    die.expandAdvantage();assert.equal(die._number??die.number,row.faces.length);die.results=row.faces.map(result=>({result,active:true}));
    if(row.mode)await die.advantage(row.mode===1?'adv':'dis');
    if(row.minimum!==null)die.minimum('min'+row.minimum);if(row.maximum!==null)die.maximum('max'+row.maximum);
    assert.deepEqual(die.results,row.results,row.id+'/'+row.faces+'/'+row.mode);assert.equal(die.total+5,row.total);
    const histogram=histograms[row.id+'/'+row.mode]??={};histogram[row.total]=(histogram[row.total]??0)+1;
    if(row.mode===0||row.faces[0]===row.faces[1])observations.push({id:row.id,mode:row.mode,faces:row.faces,results:die.results,total:die.total+5});
}
const evidence={evidence:'S exact release d20 configuration/selection + Foundry14.367 min/max/total methods over independently specified raw results; no native DataModel/engine/operator acceptance',nativeCommit,foundry:{generation:14,build:367,dieSha256:sha256(dieSource),diceSha256:sha256(diceSource)},caseCount:rangeCases().length,ranges,observations,histograms,
    stubs:['Constructor/evaluated/raw entropy-result injection; exact methods do not request entropy for this profile','Range-only AdvantageModeField stub; source/manual mode combination separately qualified earlier','Array.findSplice with initially empty modifiers; resetFormula no-op','No rerolls/flags/effects/groups/distinguishable metadata; no extension of plain tied-index equivalence'],sourceHashes:Object.fromEntries(['module/dice/basic-die.mjs','module/dice/d20-die.mjs','module/dice/d20-roll.mjs','module/data/shared/d20-roll-modification-field.mjs'].map(p=>[p,sha256(files.get(p))]))};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');process.stdout.write(`S: ${evidence.caseCount} exact bounded d20 cases / ${Object.keys(histograms).length} distributions PASS\n`);
