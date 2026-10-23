import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {moduleRoot,option} from './lib/toolchain.mjs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
// Run prior independent field/schema/operand comparisons sequentially before
// composing their phase-specific facts with actual Item/Actor final dispatch.
await import('./native-scalar-phase-oracle.mjs');
await import('./native-nullable-scalars-oracle.mjs');
await import('./native-equippable-final-oracle.mjs');
const {effectOracle606:e}=await import('./native-effect-oracle.mjs');
const {baseProficiencyOracle606:b}=await import('./native-base-proficiency-oracle.mjs');
const {itemFinalOracle606:i}=await import('./native-item-final-oracle.mjs');
const {formulaEffectsOracle606:f}=await import('./native-formula-effects-oracle.mjs');
const {nativeFormula606:q}=await import('./native-formula-oracle.mjs');
const {activityCommonOracle606:a}=await import('./native-activity-common-oracle.mjs');
const box=b.sandbox,{PhaseActor,PhaseItem}=box.equippableFinal;
const phase=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/scalar-phases.json'))),nullable=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/nullable-scalars.json')));
assert.equal(phase.nativeCommit,nativeCommit);assert.equal(nullable.nativeCommit,nativeCommit);
const rows=[...phase.numberRows.filter(r=>r.phase==='final').map((r,index)=>({family:'number',index,row:r})),...[...phase.formulaRows,...phase.movementRows].map((r,index)=>({family:'formula',index,row:r})),...nullable.numberRows.filter(r=>r.phase==='final').map((r,index)=>({family:'nullable',index,row:r})),...nullable.zeroRows.map((r,index)=>({family:'zero',index,row:r}))];
const types=['tool','equipment','consumable','container','weapon'],states=[{magic:true,attuned:true,equipped:true},{magic:true,attuned:false,equipped:true},{magic:false,attuned:false,equipped:true},{magic:true,attuned:true,equipped:false}],observations=[];
const get=(o,p)=>p.split('.').reduce((v,k)=>v?.[k],o),set=(o,p,v)=>{const keys=p.split('.');let parent=o;for(const k of keys.slice(0,-1))parent=parent[k]??={};parent[keys.at(-1)]=v;};
const prior=box.foundry.documents.ActiveEffect.implementation;
try{for(const [sequence,spec]of rows.entries())for(const state of states){
 const {row,family}=spec,type=types[sequence%types.length],formula=family==='formula'||family==='zero',key='system.'+row.path;
 const before=family==='zero'?0:row.before,nullableField=family==='nullable'||['attributes.ac.flat','attributes.ac.override','attributes.hp.value','attributes.hp.max'].includes(row.path),integer=family==='number'?row.integer:true,min=family==='number'?row.min??undefined:0;
 const actor=Object.assign(new PhaseActor(),{flags:{dnd5e:{}},effects:[],items:[],statuses:new Set(),overrides:{},tokenActiveEffectChanges:{},_completedActiveEffectPhases:new Set(),_prepareSpellcasting(){},getFlag:()=>undefined});
 const model=Object.assign(new i.MathModel(),{parent:actor,isCreature:false,isNPC:false,isGroup:false,prepareEmbeddedData(){},details:{level:5},attributes:{prof:3,attunement:{max:3,value:0},ac:{}},abilities:{},tools:{},traits:{armorProf:{value:new Set()},weaponProf:{value:new Set()}},rolls:{ability:{check:{proficiency:0},tool:{proficiency:0}}}});actor.system=model;set(actor,key,before);
 const item=Object.assign(new PhaseItem(),{id:'ScalarGear000001',type,parent:actor,actor,flags:{},labels:{},scalingIncrease:null,effects:[]}),Cls=box.equippableFinal[type[0].toUpperCase()+type.slice(1)];
 item.system=Object.assign(new Cls(),{parent:item,equipped:state.equipped,attuned:state.attuned,attunement:'required',properties:new Set(state.magic?['mgc']:[]),identified:true,type:{value:type==='weapon'?'simpleM':type==='equipment'?'wondrous':'',baseItem:''},proficient:null,uses:{max:'3',spent:1,recovery:[]},activities:[],range:{value:0,long:0,reach:0,units:'ft'},schema:{has:()=>false}});actor.items=[item];
 const utility=!process.argv.includes('--without-activities')&&type!=='container';if(utility){const initial=new a.box.activityOracle.SchemaField(a.box.activityOracle.BaseActivity.defineSchema()).clean({_id:'ScalarUtility001',type:'utility',name:'Scalar utility',duration:{value:'@item.uses.value',units:'round'},range:{override:true,value:'5',units:'ft'},uses:{max:'@item.uses.value',spent:1,recovery:[]}},a.options);item.system.activities=[Object.assign(new a.box.activityOracle.BaseActivity(),initial,{item,actor,isSpell:false,isRider:false,labels:{}})];}
 const changes=[...(row.prefix!==undefined?[{key,type:'override',value:row.prefix,phase:'final',priority:0}]:[]),{key,type:row.type,value:row.delta,phase:'final',priority:20}];
 item.effects=[Object.assign(new e.NEffect(),{id:'TransferredScalar',type:'base',transfer:true,disabled:false,actor,item,duration:{expired:false},statuses:new Set(),system:{magical:false,applicableType:'Actor',changes}})];
 if(row.currentProf)actor.effects=[Object.assign(new e.NEffect(),{id:'CurrentProficiency',type:'base',transfer:true,disabled:false,actor,duration:{expired:false},statuses:new Set(),system:{magical:false,applicableType:'Actor',changes:[{key:'system.attributes.prof',type:'override',value:row.currentProf,phase:'final',priority:10}]}})];
 box.foundry.documents.ActiveEffect.implementation=class {
  static CHANGE_PHASES={initial:{},final:{}};static _shimChanges(){}
  static applyChange(target,change){if(change.key==='system.attributes.prof'){const field=Object.assign(new e.sandbox.numeric.NumericField(),{nullable:false}),value=field.applyChange(get(target,change.key),target,change);set(target,change.key,value);return {[change.key]:value};}let value;if(formula){const input=get(target,key);value=change.type==='override'?String(change.value):f.field['_applyChange'+change.type[0].toUpperCase()+change.type.slice(1)](input,String(change.value));}
   else{const field=Object.assign(new e.sandbox.numeric.NumericField(),{nullable:nullableField,integer,min});value=field.applyChange(get(target,key),target,change);}set(target,key,value);return {[key]:value};}
 };
 actor.applyActiveEffects('initial');assert.equal(get(actor,key),before);actor.applyActiveEffects('final');
 const active=(type==='consumable'||state.equipped)&&(!state.magic||state.attuned),raw=get(actor,key),actual=formula?(raw?q.NativeMath.safeEval(q.replaceFormulaData(String(raw),{prof:row.currentProf??3})):0):raw,expected=active?(formula?row.expectedCurrent??row.expected:row.expected):before;
 assert.equal(actual,active&&row.negativeZero?-0:expected,JSON.stringify({spec,type,state}));assert.equal(item.system.attunement,state.magic?'required':'');assert.equal(model.attributes.attunement.value,Number(state.magic&&state.attuned));
 if(utility){assert.equal(item.system.uses.value,2);assert.equal(item.system.activities[0].duration.value,2);assert.equal(item.system.activities[0].uses.value,1);assert.equal(item.system.activities[0].range.value,5);}
 observations.push({family,index:spec.index,type,state,utility,path:row.path,expected:{active,before,current:actual,negativeZero:Object.is(actual,-0)}});
}}finally{box.foundry.documents.ActiveEffect.implementation=prior;}
const out=option(process.argv.slice(2),'--write-evidence');if(out)writeFileSync(out,JSON.stringify({nativeCommit,cases:observations,prerequisites:{scalarPhases:sha256(JSON.stringify(phase)),nullableScalars:sha256(JSON.stringify(nullable))},sourceHashes:Object.fromEntries(['module/documents/actor/actor.mjs','module/documents/item.mjs','module/data/item/templates/equippable-item.mjs','module/data/fields/formula-field.mjs'].map(path=>[path,sha256(e.files.get(path))])),limits:['Earlier actual native schema/AC/HP/movement/typed-field oracles execute first. Their independently expected prepared operands remain explicit intermediate inputs to this composition;no claim of full source/DataModel preparation.','Actual Actor initial/final collectors,per-type Item final dispatch,proficiency/labels/attunement/suppression and actual typed field handlers execute. C91 callbacks and explicit routing remain declared;the default profile also executes actual C97 Base utility final with parent3/spent1,child parent-value capacity2/spent1,duration2 and explicit range5. --without-activities repeats the empty-activity composition. Types rotate across the full field/operation inventory;each case covers4 eligibility states.','Numeric/nullable/falsey/formula current fields remain separate from earlier AC/max/speed caches. Current-prof binding is supplied explicitly for the single prior reference case. No new rules,conditions,Item-local enchantments,timed phases,other Activity subtypes or installed/native/operator acceptance.']},null,2)+'\n');
process.stdout.write('S:'+observations.length+' native transferred final scalar/nullable/formula/falsey-field compositions PASS\n');
