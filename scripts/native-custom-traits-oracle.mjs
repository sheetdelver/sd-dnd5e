import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {StringField,nativeTraitEvidence606} from './native-traits-oracle.mjs';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';

const args=process.argv.slice(2),repo=option(args,'--native'),foundry=option(args,'--foundry');
if(!repo||!foundry)throw Error('Supply pinned --native and static --foundry; no service is started');
const files=readRelease(repo),ts=createRequire(join(coreRoot(args),'package.json'))('typescript');
const fields=readFileSync(join(foundry,'common/data/fields.mjs'),'utf8');
function ast(text){return ts.createSourceFile('native',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);}
function member(text,cls,key){const tree=ast(text),node=tree.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===cls)?.members.find(n=>n.name?.getText(tree)===key);if(!node)throw Error('Missing '+cls+'.'+key);return node.getText(tree);}
const traitsPath='module/data/actor/templates/traits.mjs',sheetPath='module/applications/actor/api/base-actor-sheet.mjs';
assert.match(files.get('module/data/actor/fields/simple-trait-field.mjs'),/custom: new StringField\(\{ required: true,/);
// Exact registry entries qualify the armor/weapon paths. Unrelated registries are
// deliberately absent: every value Set in this custom-text profile is empty.
const config=ast(files.get('module/config.mjs')),registry=config.statements.find(n=>ts.isExpressionStatement(n)&&n.expression.left?.getText(config)==='DND5E.traits').expression.right;
const configs=registry.properties.filter(n=>['dr','di','dv','ci','armor','weapon','languages'].includes(n.name?.getText(config))).map(n=>n.getText(config)).join(',');
const utils=ast(files.get('module/utils.mjs')),split=utils.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='splitSemicolons');
const scope={StringField};
vm.runInNewContext(`
class FinalCustomField extends StringField {
${['_applyChangeAdd','_applyChangeUpgrade','_applyChangeDowngrade'].map(key=>member(fields,'DataField',key)).join('\n')}
${member(fields,'StringField','_applyChangeSubtract')}
}
const CONFIG={DND5E:{traits:{${configs}},languages:{},communicationTypes:{}}};
const foundry={utils:{deepClone:value=>value,getProperty:(value,path)=>path.split('.').reduce((v,key)=>v?.[key],value)}};
${split.getText(utils).replace(/^export /,'')}
// These
// fail-closed collaborators may not contribute an invented label or formula.
function _loc(){throw Error('Localization outside custom-text profile');}
function formatLength(){throw Error('Range outside custom-text profile');}
const Trait={keyLabel(){throw Error('Registry key outside custom-text profile');}};
class NativeTraits {${member(files.get(traitsPath),'TraitsField','prepareLanguages')}}
class NativeSheet {static MODES={PLAY:'play'};${member(files.get(sheetPath),'BaseActorSheet','_prepareTraits')}}
globalThis.native={FinalCustomField,NativeTraits,NativeSheet,splitSemicolons};`,scope);
const native=scope.native,fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/final-custom-strings.json'),'utf8'));
assert.equal(fixture.nativeCommit,nativeCommit);
const observations=[];
for(const row of fixture.cases){
 const source=structuredClone(row.source),preserved=structuredClone(source),field=new native.FinalCustomField({required:true});
 const before=field.initialize(field.clean(source.custom,{migrate:false,sanitize:false}),{});
 assert.equal(before,row.expectedBefore,row.id+'/source/default initialization');
 const model=vm.runInNewContext(`({traits:Object.fromEntries(['dr','di','dv','ci','armorProf','weaponProf','languages'].map(key=>[key,{value:new Set(),custom:''}]))})`,scope);
 const key=row.field.split('.')[0];model.traits[key].custom=before;
 model.traits.languages.labels={languages:['poisoned prepared-looking label'],ranged:[]};
 native.NativeTraits.prepareLanguages.call(model);
 const earlierLanguages=Array.from(model.traits.languages.labels.languages);
 assert.deepEqual(earlierLanguages,key==='languages'?row.expectedPreparedLabels:[],row.id+'/earlier language cache');
 const after=field.applyChange(before,model,row.change);model.traits[key].custom=after;
 assert.equal(after,row.expectedAfter,row.id+'/final String field');
 assert.deepEqual(Array.from(model.traits.languages.labels.languages),earlierLanguages,row.id+'/cache not replayed');
 const sheet=Object.assign(new native.NativeSheet(),{actor:{system:model},document:{hasConditionEffect:()=>false},_mode:'edit'}),display=sheet._prepareTraits({});
 const displayKey=key==='armorProf'?'armor':key==='weaponProf'?'weapon':key;
 assert.deepEqual(Array.from(display[displayKey]??[],entry=>entry.label),key==='languages'?row.expectedPreparedLabels:row.expectedCurrentLabels,row.id+'/actual sheet');
 // A separate formatting shell qualifies current labels; it does not claim
 // that the actual Actor repeats its earlier language-preparation phase.
 const formatting={traits:{languages:{...model.traits.languages,labels:undefined}}};
 native.NativeTraits.prepareLanguages.call(formatting);
 assert.deepEqual(Array.from(formatting.traits.languages.labels.languages),key==='languages'?row.expectedCurrentLabels:[],row.id+'/current formatting shell');
 assert.deepEqual(source,preserved,row.id+'/source preservation');
 observations.push({id:row.id,before,after,earlierLanguages,sheetLabels:Array.from(display[displayKey]??[],entry=>entry.label),currentFormatting:Array.from(formatting.traits.languages.labels.languages)});
}
const evidence={nativeCommit,fixture,observations,foundry:nativeTraitEvidence606.foundry,primitiveOracleSha256:sha256(readFileSync(new URL('./native-traits-oracle.mjs',import.meta.url),'utf8')),
 sourceHashes:Object.fromEntries([traitsPath,sheetPath,'module/data/actor/fields/simple-trait-field.mjs','module/data/actor/fields/damage-trait-field.mjs','module/config.mjs','module/utils.mjs'].map(path=>[path,sha256(files.get(path))])),
 limits:['Source strings and verified missing default only; null/coercions,references,expressions and initial String effects not qualified.',
 'Actual primitive field methods on initialized shells; declared primitive constructors/validation wrapper inherited from maintained trait oracle,not full DataModel source boot.',
 'Actual sheet on empty canonical value Sets and exact selected trait config entries; no localization/content lookup required. Identity deepClone is read-only. Nonempty keys/ranges,conditions,Item phases and full dispatcher are outside this profile.',
 'Language cache prepared once before final changes,with poisoned labels overwritten by actual method. Current labels use a separate formatting shell,not Actor phase replay.',
 'No module implementation/dice/installed/native/operator acceptance. Runtime custom String effects remain gated pending integration.']};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');
process.stdout.write('S: '+observations.length+' final custom String source/default/field/cache/sheet/current-format cases PASS\n');
