import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {moduleRoot,option} from './lib/toolchain.mjs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
// Existing independent field/initialization/cache/rule expectations run first.
const {SetField,StringField,cleanSet}=await import('./native-traits-oracle.mjs');
const {CustomStringField606}=await import('./native-custom-traits-oracle.mjs');
await import('./native-flag-effects-oracle.mjs');
const {activityCommonOracle606:a}=await import('./native-activity-common-oracle.mjs');
const {baseProficiencyOracle606:b}=await import('./native-base-proficiency-oracle.mjs');
const {effectOracle606:e}=await import('./native-effect-oracle.mjs');
const box=b.sandbox,{PhaseActor,PhaseItem}=box.equippableFinal;
const read=name=>JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/'+name+'.json')));
const training=read('final-training-sets'),defense=read('final-defense-sets'),custom=read('final-custom-strings'),flags=read('flag-effects');
for(const f of [training,defense,custom,flags])assert.equal(f.nativeCommit,nativeCommit);
const specs=[...training.cases.map((row,index)=>({family:'training',index,row})),...defense.cases.filter(row=>!row.petrified).map((row,index)=>({family:'defense',index,row})),...custom.cases.map((row,index)=>({family:'custom',index,row})),...flags.cases.filter(row=>row.phase==='final').map((row,index)=>({family:'flag',index,row}))];
const types=['tool','equipment','consumable','container','weapon'],states=[{magic:true,attuned:true,equipped:true},{magic:true,attuned:false,equipped:true},{magic:false,attuned:false,equipped:true},{magic:true,attuned:true,equipped:false}],cases=[];
const get=(o,p)=>p.split('.').reduce((v,k)=>v?.[k],o),set=(o,p,v)=>{const keys=p.split('.');let parent=o;for(const k of keys.slice(0,-1))parent=parent[k]??={};parent[keys.at(-1)]=v;},encode=v=>v instanceof Set||v&&typeof v.has==='function'?Array.from(v):v;
const prior=box.foundry.documents.ActiveEffect.implementation;
try{for(const [sequence,spec]of specs.entries())for(const state of states){
 const {row,family}=spec,type=types[sequence%types.length],flag=family==='flag',change=flag?{key:'flags.dnd5e.'+row.key,type:row.type,value:row.raw,phase:'final'}:row.change,key=change.key;
 const before=family==='training'?row.expectedBefore[key.slice('system.traits.'.length)]:family==='defense'?get(row.expectedBefore,row.field):family==='custom'?row.expectedBefore:row.sourceValue==='absent'?false:row.sourceValue;
 const after=family==='training'?row.expectedAfter[key.slice('system.traits.'.length)]:family==='defense'?get(row.expectedAfter,row.field):family==='custom'?row.expectedAfter:row.current;
 const actor=Object.assign(new PhaseActor(),{flags:{dnd5e:flag&&row.sourceValue!=='absent'?{[row.key]:row.sourceValue}:{}},effects:[],items:[],statuses:new Set(),overrides:{},tokenActiveEffectChanges:{},_completedActiveEffectPhases:new Set(),_prepareSpellcasting(){},getFlag(scope,key){return this.flags[scope]?.[key];}}),traits=Object.fromEntries(['dr','di','dv','ci','armorProf','weaponProf','languages'].map(k=>[k,{value:cleanSet([]),custom:''}]));traits.weaponProf.mastery={value:cleanSet([]),bonus:cleanSet([])};
 const model=Object.assign(new a.i.MathModel(),{parent:actor,isCreature:false,isNPC:false,isGroup:false,prepareEmbeddedData(){},details:{level:5},attributes:{prof:3,attunement:{max:3,value:0},ac:{}},abilities:{},tools:{},traits,rolls:{ability:{check:{proficiency:0},tool:{proficiency:0}}}});actor.system=model;
 if(!flag)set(actor,key,family==='custom'?before:cleanSet(before));
 const item=Object.assign(new PhaseItem(),{id:'FieldGear0000001',type,parent:actor,actor,flags:{},labels:{},scalingIncrease:null,effects:[]}),Cls=box.equippableFinal[type[0].toUpperCase()+type.slice(1)];
 item.system=Object.assign(new Cls(),{parent:item,equipped:state.equipped,attuned:state.attuned,attunement:'required',properties:new Set(state.magic?['mgc']:[]),identified:true,type:{value:type==='weapon'?'simpleM':type==='equipment'?'wondrous':'',baseItem:''},proficient:null,uses:{max:'3',spent:1,recovery:[]},activities:[],range:{value:0,long:0,reach:0,units:'ft'},schema:{has:()=>false}});actor.items=[item];
 const utility=!process.argv.includes('--without-activities')&&type!=='container';if(utility){const initial=new a.box.activityOracle.SchemaField(a.box.activityOracle.BaseActivity.defineSchema()).clean({_id:'FieldUtility0001',type:'utility',duration:{value:'@item.uses.value',units:'round'},range:{override:true,value:'5',units:'ft'}},a.options);item.system.activities=[Object.assign(new a.box.activityOracle.BaseActivity(),initial,{item,actor,isSpell:false,isRider:false,labels:{}})];}
 const Effect=flag?box.flagEffectOracle.FlagEffect:e.NEffect;
 item.effects=[Object.assign(new Effect(),{id:'TransferredField',type:'base',transfer:true,disabled:false,actor,item,duration:{expired:false},statuses:new Set(),system:{magical:false,applicableType:'Actor',changes:[{...change,priority:20}]}})];
 box.foundry.documents.ActiveEffect.implementation=class {
  static CHANGE_PHASES={initial:{},final:{}};static _shimChanges(){}
  static applyChange(target,change){if(flag)return box.flagEffectOracle.FlagBridge.applyChange(target,change);const field=family==='custom'?new CustomStringField606({required:true}):new SetField(new StringField(),{initial:[]}),value=field.applyChange(get(target,key),target,change);set(target,key,value);return {[key]:value};}
 };
 actor.applyActiveEffects('initial');assert.deepEqual(encode(flag?actor.getFlag('dnd5e',row.key)??false:get(actor,key)),before);actor.applyActiveEffects('final');
 const active=(type==='consumable'||state.equipped)&&(!state.magic||state.attuned),current=encode(flag?actor.getFlag('dnd5e',row.key)??false:get(actor,key));assert.deepEqual(current,active?after:before,JSON.stringify({spec,type,state}));
 if(utility){assert.equal(item.system.uses.value,2);assert.equal(item.system.activities[0].duration.value,2);assert.equal(item.system.activities[0].range.value,5);}
 cases.push({family,index:spec.index,type,state,utility,key,expected:{active,before,current}});
}}finally{box.foundry.documents.ActiveEffect.implementation=prior;}
const out=option(process.argv.slice(2),'--write-evidence');if(out)writeFileSync(out,JSON.stringify({nativeCommit,cases,sourceHashes:Object.fromEntries(['module/documents/actor/actor.mjs','module/documents/item.mjs','module/documents/active-effect.mjs','module/data/actor/templates/traits.mjs','module/config.mjs'].map(path=>[path,sha256(e.files.get(path))])),limits:['Existing actual native field/schema/initialization/cache/flag-rule oracles execute first. This composition supplies those independent earlier field operands explicitly,not raw prepared-looking source.','Actual Item/Actor final dispatch,attunement/suppression and actual Set/String/_prepareFlagChange/Boolean handlers execute with existing C91/C97 constructor/label/Actor callbacks and explicit schema routing. Utility parent counter2,duration2,range5 precede final changes. Types rotate across all5 equippables with4 eligibility states.','Only condition-free Actor-target final transferred traits/flags are qualified. Petrified/mixed conditions,Item-local enchantments,other Activity subtypes,finite durations,broader expressions and native/operator acceptance remain outside. Separate source regressions verify rule consumers/earlier caches;this is not full native DataModel preparation.']},null,2)+'\n');
process.stdout.write('S:'+cases.length+' native transferred final Set/custom String/Boolean flag compositions PASS\n');
