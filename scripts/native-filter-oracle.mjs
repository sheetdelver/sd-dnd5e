import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';
const args=process.argv.slice(2),repo=option(args,'--native'),foundry=option(args,'--foundry');
if(!repo||!foundry)throw Error('Supply pinned --native and static --foundry14.367; no service is started');
const files=readRelease(repo),ts=createRequire(join(coreRoot(args),'package.json'))('typescript');
const release=JSON.parse(readFileSync(join(foundry,'package.json'),'utf8')).release;assert.equal(release.generation,14);assert.equal(release.build,367);
const helpers=readFileSync(join(foundry,'common/utils/helpers.mjs'),'utf8');
function member(source,cls,name){const ast=ts.createSourceFile(cls,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);const node=ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===cls)?.members.find(n=>n.name?.getText(ast)===name);if(!node)throw Error('Missing '+cls+'.'+name);return node.getText(ast);}
function declaration(source,name){const ast=ts.createSourceFile(name,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);const node=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);if(!node)throw Error('Missing '+name);return node.getText(ast).replace(/^export /,'');}
function variable(source,name){const ast=ts.createSourceFile(name,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);return ast.statements.find(n=>ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>d.name.getText(ast)===name)).getText(ast);}
const filterPath='module/filter.mjs',fieldPath='module/data/fields/filters-field.mjs',modelPath='module/data/abstract/active-effect-data-model.mjs',documentPath='module/documents/active-effect.mjs';
assert.match(member(files.get(fieldPath),'FiltersField','_defaults'),/initial: "\{\}"/);
let propertyReads=0;
const box={foundry:{utils:{getProperty(){propertyReads++;throw Error('Snapshot-dependent read outside this profile');}}},CONFIG:{ActiveEffect:{changeTypes:{add:{skipConditions:false}}}},console:{error:error=>{throw error;}}};
vm.runInNewContext(`class Color {}
${['typePrototypes','plainObjectPrototype'].map(name=>variable(helpers,name)).join('\n')}
${['isPlainObject','getType','isEmpty'].map(name=>declaration(helpers,name)).join('\n')}
foundry.utils.isEmpty=isEmpty;
${files.get(filterPath).replace(/^export /gm,'')}
class FiltersField {${member(files.get(fieldPath),'FiltersField','initialize')}}
class ModelBase {prepareBaseData(){}}
class NativeEffectModel extends ModelBase {#conditionSuppressed=null;get isOnActivity(){return false;}
${['prepareBaseData','evaluateCondition','isSuppressed'].map(name=>member(files.get(modelPath),'ActiveEffectDataModel',name)).join('\n')}
}
class DocumentBase {shouldApplyChange(){return true;}}
class NativeEffectDocument extends DocumentBase {get isSuppressed(){return this.system.isSuppressed;}
${member(files.get(documentPath),'ActiveEffect5e','shouldApplyChange')}
}
globalThis.native={Filter,FiltersField,NativeEffectModel,NativeEffectDocument};`,box);
const fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/constant-filters.json'),'utf8'));assert.equal(fixture.nativeCommit,nativeCommit);
const {Filter,FiltersField,NativeEffectModel,NativeEffectDocument}=box.native,observations=[];
function effect(filter){const system=new NativeEffectModel();let replacements=0;system.conditions=filter;system.parent={target:{getRollData:()=>({})},getReplacementData:data=>{replacements++;return data;}};return {system,replacements:()=>replacements};}
for(const row of fixture.cases.filter(row=>row.truth!==undefined)){
 const raw=row.conditions??'{}',initialized=new FiltersField().initialize(raw,{});assert.ok(initialized,row.id);
 assert.equal(initialized.check({}),row.truth,row.id+'/empty snapshot');assert.equal(initialized.check({abilities:{wis:{value:99}},statuses:{poisoned:1}}),row.truth,row.id+'/different snapshot');
 const current=effect(row.scope==='change'?new FiltersField().initialize('{}',{}):initialized),document=Object.assign(new NativeEffectDocument(),{system:current.system});
 const change={type:'add',conditions:row.scope==='change'?initialized:new FiltersField().initialize('{}',{})};
 const accepted=document.shouldApplyChange(change,{replacementData:{phase:'initial'}});assert.equal(accepted,row.truth,row.id+'/native shouldApplyChange');
 document.shouldApplyChange({type:'add',conditions:row.scope==='change'?initialized:new FiltersField().initialize('{}',{})},{replacementData:{phase:'final'}});assert.equal(current.replacements(),1,row.id+'/effect first-evaluation cache');
 observations.push({id:row.id,definition:raw,truth:row.truth,shouldApplyChange:accepted,effectReplacementCalls:current.replacements(),workflow:row.workflowUnavailable?'Module boundary; only filter truth compared':'Qualified guard only, initialized eligibility/snapshots are explicit stubs'});
}
assert.equal(propertyReads,0,'No supported definition reads any snapshot path');
// Separately demonstrate the native cached-effect/fresh-change distinction. This
// callback is a cache probe, not qualification of any data-dependent Filter.
const cache=effect({check:data=>data.phase==='final'});
cache.system.evaluateCondition({phase:'initial'});assert.equal(cache.system.isSuppressed,true);
cache.system.evaluateCondition({phase:'final'});assert.equal(cache.system.isSuppressed,true);
cache.system.prepareBaseData();cache.system.evaluateCondition({phase:'final'});assert.equal(cache.system.isSuppressed,undefined);assert.equal(cache.replacements(),2);
const fresh=effect(new FiltersField().initialize('{}',{})),document=Object.assign(new NativeEffectDocument(),{system:fresh.system});
const change={type:'add',conditions:{check:data=>data.phase==='final'}};
assert.equal(document.shouldApplyChange(change,{replacementData:{phase:'initial'}}),false);
assert.equal(document.shouldApplyChange(change,{replacementData:{phase:'final'}}),true);
const evidence={nativeCommit,foundry:{generation:14,build:367,helpersSha256:sha256(helpers)},observations,propertyReads,effectCacheProbe:{initial:false,finalBeforeReset:false,finalAfterReset:true,replacementCalls:2},changeProbe:{initial:false,final:true},sourceHashes:Object.fromEntries([filterPath,fieldPath,modelPath,documentPath,'module/documents/actor/actor.mjs'].map(path=>[path,sha256(files.get(path))])),stubs:['Exact Filter functions, FiltersField.initialize/default schema assertion, effect evaluateCondition/cache reset and document shouldApplyChange methods only','Primitive field initialization receives persisted JSON strings/default{} explicitly; no DataModel source cleaning/validation boot','Property reads throw; supported trees must be snapshot-invariant even with changed snapshots; data-dependent/unknown/malformed branches not qualified','Document superclass eligibility returns true, no replacement-source Item and changeTypes.add skipConditions=false; module eligibility/phase tests remain separate','Replacement-data adapter is identity; no claim that raw source/current derived values equal native initial/final getRollData','Cache/fresh-change callback probes establish method lifetime only, not data-dependent filters, statuses/rider lifecycle, clocks, native engine or operator acceptance']};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');
process.stdout.write(`S: ${observations.length} pinned snapshot-invariant filter guards, zero property reads and separate cache/change probes PASS\n`);
