import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {effectOracle606} from './native-effect-oracle.mjs';
import {CustomStringField606,CustomTraits606,customSheet606} from './native-custom-traits-oracle.mjs';
import {StringField} from './native-traits-oracle.mjs';
import {moduleRoot,option,coreRoot} from './lib/toolchain.mjs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
import {createRequire} from 'node:module';
const {NActor,NEffect,NItem,sandbox,files,core,n,trace,priorities}=effectOracle606;
const args=process.argv.slice(2),ts=createRequire(join(coreRoot(args),'package.json'))('typescript');
const feat='module/data/item/feat.mjs',item='module/documents/item.mjs',activities='module/data/item/templates/activities.mjs',uses='module/data/shared/uses-field.mjs';
const ast=ts.createSourceFile('utils',files.get('module/utils.mjs'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const prepareFormula=ast.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text==='prepareFormulaValue').getText(ast).replace(/^export /,'');
// Schema declarations and primitive missing/blank String defaults are explicit.
assert.match(files.get(activities),/activities: new ActivitiesField\(\)/);assert.match(files.get(activities),/uses: new UsesField\(\)/);
assert.match(files.get(uses),/spent: new NumberField\(\{ initial: 0, min: 0, integer: true \}\)/);
assert.match(files.get(uses),/max: new FormulaField\(\{ deterministic: true \}\)/);assert.match(files.get(uses),/recovery: new ArrayField\(/);
assert.match(files.get('module/data/fields/formula-field.mjs'),/extends foundry.data.fields.StringField/);
assert.equal(new StringField().clean(undefined,{migrate:false,sanitize:false}),undefined);
assert.equal(new StringField().clean('',{migrate:false,sanitize:false}),'');
Object.assign(sandbox,{NItem,phaseTrace:[],game:{i18n:{getListFormatter:()=>({format:values=>{assert.equal(values.length,0);return '';}})}},
 replaceFormulaData:()=>{throw Error('No formula may execute in empty-uses profile');},Roll:class{constructor(){throw Error('No native dice/formula evaluation in empty-uses profile');}}});
vm.runInNewContext(`
${prepareFormula}
class UsesField {
${['prepareData','getStatblockLabel'].map(key=>n(uses,'UsesField',key)).join('\n')}
static rollRecharge(){throw Error('Recovery execution outside qualification');}
}
class EmptyFeat {
${['hasProficiency','proficiencyMultiplier','prepareFinalData'].map(key=>n(feat,'FeatData',key)).join('\n')}
${n(activities,'ActivitiesTemplate','prepareFinalActivityData')}
}
class FinalItem extends NItem {
${['_prepareProficiency','prepareFinalAttributes','_prepareLabels'].map(key=>n(item,'Item5e',key)).join('\n')}
getRollData(options){if(options.deterministic!==true)throw Error('Unexpected roll context');phaseTrace.push('item-roll-data');trace.push('item-roll-data');return {};}
}
globalThis.finalClasses={EmptyFeat,FinalItem};`,sandbox);
const fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/feat-final-custom-strings.json'),'utf8'));
assert.equal(fixture.nativeCommit,nativeCommit);
const observations=[];
for(const row of fixture.cases){
 const preserved=structuredClone(row),key=row.field.split('.')[0],field=new CustomStringField606({required:true}),actor=new NActor();
 actor.system={isCreature:false,isGroup:false,attributes:{prof:3},traits:Object.fromEntries(['dr','di','dv','ci','armorProf','weaponProf','languages'].map(key=>[key,{value:new Set(),custom:''}])),prepareEmbeddedData:()=>trace.push('embedded')};
 actor.system.traits[key]={value:new Set(row.source.value??[]),custom:field.initialize(field.clean(row.source.custom,{migrate:false,sanitize:false}),{})};
 actor.statuses=new Set();actor.effects=[];actor._completedActiveEffectPhases=new Set();actor.overrides={};actor.tokenActiveEffectChanges={};actor.customReceipts=[];actor.customIdentities=[];actor._prepareSpellcasting=()=>trace.push('spellcasting');
 const owned=Object.assign(new sandbox.finalClasses.FinalItem(),{id:'finalFeat',type:'feat',actor,parent:actor,labels:{}});
 owned.system=Object.assign(new sandbox.finalClasses.EmptyFeat(),{parent:owned,activities:[],uses:{spent:0,max:new StringField().clean(row.itemSystem.uses?.max,{migrate:false,sanitize:false}),recovery:[]}});
 const effect=Object.assign(new NEffect(),{id:'featText',type:'base',disabled:false,transfer:true,actor,item:owned,duration:{expired:false},statuses:new Set(),system:{applicableType:'Actor',changes:[{...row.change,priority:priorities[row.change.type]}]}});
 owned.effects=[effect];actor.items=[owned];trace.length=0;sandbox.phaseTrace.length=0;
 actor.applyActiveEffects('initial');CustomTraits606.prepareLanguages.call(actor.system);
 const earlier=Array.from(actor.system.traits.languages.labels.languages);
 assert.deepEqual(earlier,key==='languages'?row.expectedPreparedLabels:[],row.id+'/earlier cache');
 actor.applyActiveEffects('final');
 const e=row.expectedItem;assert.equal(owned.system.prof.flat,e.proficiency);assert.equal(owned.system.prof.multiplier,e.multiplier);assert.equal(owned.system.uses.value,e.usesValue);assert.equal(owned.system.uses.label,e.usesLabel);assert.equal(owned.labels.recovery,e.recoveryLabel);
 for(const [field,expected]of [['activations',e.activationLabels],['attacks',e.attackLabels],['damages',e.damageLabels]])assert.deepEqual(Array.from(owned.labels[field]),expected);
 assert.deepEqual(Array.from(sandbox.phaseTrace),['item-roll-data']);assert.equal(typeof owned.system.uses.rollRecharge,'function');
 assert.deepEqual(trace,['embedded','item-roll-data','spellcasting',row.change.key],row.id+'/initial then actual Item final then Actor change');
 assert.deepEqual(actor.customReceipts,[{phase:'final',before:row.expectedBefore,value:row.expectedAfter}],row.id+'/primitive field');assert.deepEqual(actor.customIdentities,[{effectId:'featText',itemId:'finalFeat'}]);
 const display=customSheet606(actor.system,()=>false),displayKey=key==='armorProf'?'armor':key==='weaponProf'?'weapon':key;
 assert.deepEqual(Array.from(display[displayKey]??[],entry=>entry.label),key==='languages'?row.expectedPreparedLabels:row.expectedCurrentLabels,row.id+'/native sheet');
 assert.deepEqual(Array.from(actor.system.traits.languages.labels.languages),earlier,row.id+'/cache not replayed');
 const current={traits:{languages:{...actor.system.traits.languages,labels:undefined}}};CustomTraits606.prepareLanguages.call(current);assert.deepEqual(Array.from(current.traits.languages.labels.languages),key==='languages'?row.expectedCurrentLabels:[]);
 assert.deepEqual(row,preserved);
 observations.push({id:row.id,receipts:actor.customReceipts,identities:actor.customIdentities,item:{proficiency:owned.system.prof.flat,multiplier:owned.system.prof.multiplier,usesValue:owned.system.uses.value,usesLabel:owned.system.uses.label,recoveryLabel:owned.labels.recovery},earlier,current:actor.system.traits[key].custom,trace:trace.splice(0)});
}
const sourcePaths=[feat,item,activities,uses,'module/data/fields/activities-field.mjs','module/data/fields/formula-field.mjs','module/utils.mjs','module/documents/actor/proficiency.mjs','module/documents/actor/actor.mjs'];
const evidence={nativeCommit,cases:observations.length,observations,sourceHashes:Object.fromEntries(sourcePaths.map(path=>[path,sha256(files.get(path))])),foundryHashes:Object.fromEntries([...core].map(([path,source])=>[path,sha256(source)])),fixtureSha256:sha256(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/feat-final-custom-strings.json'))),limits:['Actual native/base Actor initial/final dispatch, native Item.prepareFinalAttributes/_prepareProficiency/_prepareLabels, feat getters/final preparation, Activities.prepareFinalActivityData, UsesField.prepareData/getStatblockLabel and primitive String/language/sheet methods.','Only empty activities and empty-capacity/recovery uses. Explicit verified spent0/default FormulaField missing/blank String initialization and empty collection shells; not full source DataModel/ActivitiesField boot. No effect/Item grants, Item target changes, activities, recharge/rest/use execution or arbitrary source schema coercion.','Item.getRollData deterministic call returns empty declared data; actual Uses.prepareData calls actual prepareFormulaValue but its absent/blank max returns before replacement/evaluation. Roll/replacement collaborators throw if called; no formula/dice equivalence claimed.','Actor spellcasting is a trace collaborator and other Item preparation is absent; this qualifies only this literal-field/empty-feat composition, not full Actor/Item preparation or native/operator acceptance. Runtime remains gated pending integration/source/consumer checks.']};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');
process.stdout.write('S: '+observations.length+' empty-feat actual final preparation/transferred custom text/cache cases PASS\n');
