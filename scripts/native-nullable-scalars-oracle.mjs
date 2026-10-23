import assert from 'node:assert/strict';
import vm from 'node:vm';
import {writeFileSync} from 'node:fs';
import {option} from './lib/toolchain.mjs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
const {effectOracle606:e}=await import('./native-effect-oracle.mjs');
const {healthOracle606:h}=await import('./native-health-oracle.mjs');
const {equipmentOracle606:a}=await import('./native-equipment-oracle.mjs');
const {formulaEffectsOracle606:f}=await import('./native-formula-effects-oracle.mjs');
const {nativeFormula606:q}=await import('./native-formula-oracle.mjs');
const field=(c,m)=>e.f('common/data/fields.mjs',c,m),box={Numeric:e.sandbox.numeric.NumericField,isPlainObject:v=>!!v&&typeof v==='object'&&!Array.isArray(v),DataFieldOperator:class{},ForcedReplacement:class{},OPERATOR_IDENTIFIER:Symbol(),expandObjectInPlace:v=>{assert.ok(Object.keys(v).every(k=>!k.includes('.')));}};
// Actual primitive/schema defaults and cleaning. Constructors/entries are
// declared collaborators; no DataModel,Document,transport or runtime boot.
vm.runInNewContext(`class DataField {constructor(options={}){Object.assign(this,this.constructor._defaults,options);}static #cleanDefaultTrue=[];
${['_defaults','getInitialValue','clean','_validateSpecial','_cast','_cleanType'].map(m=>field('DataField',m)).join('\n')}}
class NumberField extends DataField {${['_defaults','_cast','_cleanType'].map(m=>field('NumberField',m)).join('\n')}}
class SchemaField extends DataField {constructor(fields,options={}){super(options);this.fields=fields;}entries(){return Object.entries(this.fields);}
${['_defaults','getInitialValue','_cast','_cleanType','#cleanKeys','expandObject','reconstructOperator'].map(m=>field('SchemaField',m)).join('\n')}}
class Placeholder extends DataField {constructor(...args){super(args.at(-1));}}
const StringField=Placeholder,SetField=Placeholder,FormulaField=Placeholder,ACFormulasField=Placeholder;
class Attributes {${['armorClass','hitPoints'].map(m=>e.n('module/data/actor/templates/attributes.mjs','AttributesFields',m)).join('\n')}}
globalThis.schema={Attributes,SchemaField,NumberField};`,box);
const options=Object.freeze({migrate:false,sanitize:false,expand:false,prune:true,persisted:true}),defaults=[],rows=[];
const specs=[['attributes.ac.flat','ac','flat'],['attributes.ac.override','ac','override'],['attributes.hp.value','hp','value'],['attributes.hp.max','hp','max']];
const arithmetic=(v,d,t)=>t==='add'?v+d:t==='subtract'?v-d:t==='multiply'?v*d:t==='override'?d:t==='upgrade'?Math.max(v,d):Math.min(v,d);
function schemaFor(group){const all=group==='ac'?box.schema.Attributes.armorClass:box.schema.Attributes.hitPoints;return new box.schema.SchemaField(Object.fromEntries(Object.entries(all).filter(([,v])=>v instanceof box.schema.NumberField)));}
for(const input of ['missing-parent','missing-leaf','null'])for(const group of ['ac','hp']){
 const fields=schemaFor(group),raw=input==='missing-parent'?undefined:input==='null'?Object.fromEntries(specs.filter(s=>s[1]===group).map(s=>[s[2],null])):{},clean=fields.clean(raw,options);
 for(const [path,g,key]of specs.filter(s=>s[1]===group)){assert.equal(clean[key],null,path+'/'+input);defaults.push({path,input,expected:null});}
 if(group==='hp'){assert.equal(clean.temp,0);assert.equal(clean.tempmax,0);}
}
for(const [path,group,key]of specs)for(const source of ['missing-parent','missing-leaf','null'])for(const phase of ['initial','final'])for(const type of ['add','subtract','multiply','override','upgrade','downgrade'])for(const delta of [2,-2,2.5,-.5,0]){
 const schema=schemaFor(group),raw=source==='missing-parent'?undefined:source==='null'?{[key]:null}:{},initialized=schema.clean(raw,options),field=schema.fields[key];assert.equal(initialized[key],null);
 let before=null;
 if(phase==='final'&&group==='hp'){
  const {HpModel,ClassData,HpAdvancement,HealthActor}=h.health,actor=new HealthActor();Object.assign(actor,{_lazy:{},flags:{dnd5e:{}},conditionRollReduction:0,coverBonus:0,hasConditionEffect:()=>false,_isRemarkableAthlete:()=>false});
  const item={id:'NullableClass',identifier:'fighter',isOriginalClass:true,getRollData:()=>({})},data=Object.assign(new ClassData(),{parent:item,levels:5,hd:{denomination:'d10',spent:0,additional:''}});item.system=data;data.prepareFinalData();const advancement=Object.assign(new HpAdvancement(),{item,value:{1:'max',2:'avg',3:'avg',4:'avg',5:'avg'}});item.advancement={byType:{HitPoints:[advancement]}};actor.itemTypes={class:[item]};
  const model=Object.assign(new HpModel(),{parent:actor,details:{level:5},attributes:{hp:{...initialized,bonuses:{}},prof:3,ac:{cover:0}},abilities:{con:{value:14,proficient:0,max:null,attack:{roll:{}},check:{roll:{}},save:{roll:{}}}},rolls:{ability:{check:{proficiency:0},save:{proficiency:0}}}});model.prepareAbilities();model.prepareHealth();before=model.attributes.hp[key];assert.equal(before,key==='max'?44:0);
 }else if(phase==='final'){
  const model={parent:{itemTypes:{equipment:[]},coverBonus:0,_preparationWarnings:[]},abilities:{dex:{mod:2}},attributes:{ac:{armor:10,base:-Infinity,bonus:'',min:'',calcs:vm.runInNewContext('new Set(["unarmored","armored"])'),flat:initialized.flat,override:initialized.override,cover:0,shield:0,formulas:[]}}};model.parent.system=model;a.sandbox.native.AttributesFields.prepareArmorClass.call(model,{});before=model.attributes.ac[key];assert.equal(before,key==='flat'?0:null);assert.equal(model.attributes.ac.value,12);
 }
 const nativeField=Object.assign(new e.sandbox.numeric.NumericField(),{nullable:field.nullable,integer:field.integer,min:field.min}),actual=nativeField.applyChange(before,{}, {key:'system.'+path,type,value:String(delta)}),unchangedNull=before===null&&(type==='upgrade'&&delta<=0||type==='downgrade'&&delta>=0),expected=unchangedNull?null:Math.max(0,Math.round(arithmetic(before===null?0:before,delta,type)));
 assert.equal(actual,expected,JSON.stringify({path,source,phase,type,delta,before}));rows.push({path,source,phase,type,delta,before,expected,negativeZero:Object.is(actual,-0)});
}
// A prepared numeric zero is falsey to native FormulaField handlers. Positive
// numeric multiply/max/min remains the existing explicit unsupported profile.
const zeroRows=[];
for(const path of ['attributes.ac.bonus','attributes.ac.min','attributes.movement.speeds.burrow'])for(const type of ['add','subtract','multiply','override','upgrade','downgrade'])for(const delta of ['2','-2']){
 const expression=type==='override'?delta:f.field['_applyChange'+type[0].toUpperCase()+type.slice(1)](0,delta),actual=expression?q.NativeMath.safeEval(q.replaceFormulaData(String(expression),{})):0,expected=type==='multiply'?0:type==='subtract'?-Number(delta):Number(delta);
 assert.equal(actual,expected);zeroRows.push({path,type,delta,expression,expected});
}
f.terms.set('0',1); // Explicit one-term shape;not a new parser.
for(const path of ['attributes.ac.bonus','attributes.ac.min','attributes.movement.speeds.burrow'])for(const prefix of ['0','2'])for(const type of ['add','subtract','multiply','override','upgrade','downgrade']){
 const expression=type==='override'?'2':f.field['_applyChange'+type[0].toUpperCase()+type.slice(1)](prefix,'2'),actual=q.NativeMath.safeEval(q.replaceFormulaData(expression,{})),expected=arithmetic(Number(prefix),2,type);assert.equal(actual,expected);zeroRows.push({path,prefix,type,delta:'2',expression,expected});
}
const out=option(process.argv.slice(2),'--write-evidence');if(out)writeFileSync(out,JSON.stringify({nativeCommit,defaults,numberRows:rows,zeroRows,sourceHashes:{attributes:sha256(e.files.get('module/data/actor/templates/attributes.mjs')),fields:sha256(e.core.get('common/data/fields.mjs'))},limits:['Actual released schema getters and Foundry14.367 primitive/SchemaField cleaning; constructor/entries and unrelated field classes are declared collaborators. No full DataModel boot.','Actual native HP/AC methods establish final operands; NumberField applyChange uses already declared validation/literal Roll seam. Initial and final source phases remain distinct.','Falsey prepared zero FormulaField captures only;positive numeric multiply/max/min still gated. Fixed deltas only;no broader numeric reference/effect lifecycle or installed/operator acceptance.']},null,2)+'\n');
process.stdout.write(`S:${defaults.length} schema defaults/${rows.length} nullable scalar phases/${zeroRows.length} falsey prepared FormulaField operations PASS\n`);
