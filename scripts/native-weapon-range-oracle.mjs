import assert from 'node:assert/strict';
import vm from 'node:vm';
import {writeFileSync} from 'node:fs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
import {option} from './lib/toolchain.mjs';
await import('./native-activity-targets-oracle.mjs');
const {activityCommonOracle606:a}=await import('./native-activity-common-oracle.mjs');
const {movementOracle606:m}=await import('./native-movement-oracle.mjs');
const {box,e,options}=a,path='module/data/item/weapon.mjs';
const oldSetting=m.box.game.settings.get,oldDefault=box.defaultUnits;let metric=false;
m.box.game.settings.get=(_,key)=>key==='metricLengthUnits'&&metric;
box.defaultUnits=kind=>m.box.native.defaultUnits(kind);box.convertLength=m.box.convertLength;
assert.equal(typeof box.convertLength,'function');
vm.runInContext(`class PrimitiveInitialization extends DataField {${e.f('common/data/fields.mjs','DataField','initialize')}}
DataField.prototype.initialize=PrimitiveInitialization.prototype.initialize;
class SchemaInitialization extends SchemaField {${e.f('common/data/fields.mjs','SchemaField','initialize')}}
SchemaField.prototype.initialize=SchemaInitialization.prototype.initialize;
class RangeDerivedBase {prepareDerivedData(){}prepareDescriptionData(){}prepareIdentifiable(){}preparePhysicalData(){}prepareMountableData(){}}
class SourceRangeWeapon extends RangeDerivedBase {${['attackType','attackModes','isVersatile','hasRange','prepareDerivedData'].map(key=>e.n(path,'WeaponData',key)).join('\n')}}
globalThis.sourceRangeOracle={SourceRangeWeapon,set:v=>new Set(v)};`,box);
box.CONFIG.DND5E.weaponTypeMap={simpleM:'melee',simpleR:'ranged',martialM:'melee',martialR:'ranged',siege:'ranged'};box.CONFIG.DND5E.weaponTypes={};box.CONFIG.DND5E.weaponIds={};box.CONFIG.DND5E.damageTypes={};box.CONFIG.Item={typeLabels:{weapon:'weapon'}};
box.game={i18n:{getListFormatter:()=>new Intl.ListFormat('en')}};
box.CONFIG.DND5E.attackModes=Object.fromEntries(['oneHanded','twoHanded','offhand','thrown','thrown-offhand','ranged'].map(key=>[key,{label:key}]));
const cases=[
 {id:'melee-clears-stored-range',type:'simpleM',properties:[],source:{value:20,long:60,reach:5},expected:{value:null,long:null,reach:5,activity:5}},
 {id:'martial-clears',type:'martialM',properties:[],source:{value:20,long:60,reach:5},expected:{value:null,long:null,reach:5,activity:5}},
 {id:'null-reach',type:'simpleM',properties:[],source:{value:20,long:60,reach:null},expected:{value:null,long:null,reach:'default5',activity:'default5'}},
 {id:'reach-property',type:'simpleM',properties:['rch'],source:{reach:null},expected:{value:null,long:null,reach:'default10',activity:'default10'}},
 {id:'zero-reach',type:'simpleM',properties:[],source:{value:20,long:60,reach:0},expected:{value:null,long:null,reach:0,activity:null}},
 {id:'missing-reach',type:'simpleM',properties:[],source:{value:20,long:60},expected:{value:null,long:null,reach:'[undefined]',activity:null}},
 {id:'thrown-keeps-range',type:'simpleM',properties:['thr'],source:{value:20,long:60,reach:null},expected:{value:20,long:60,reach:'default5',activity:60}},
 {id:'ranged-clears-reach',type:'simpleR',properties:[],source:{value:20,long:60,reach:5},expected:{value:20,long:60,reach:null,activity:60}},
 {id:'martial-ranged',type:'martialR',properties:[],source:{value:20,long:60,reach:5},expected:{value:20,long:60,reach:null,activity:60}},
 {id:'siege-ranged',type:'siege',properties:[],source:{value:20,long:60,reach:5},expected:{value:20,long:60,reach:null,activity:60}},
 {id:'ranged-missing-value',type:'simpleR',properties:[],source:{long:60,reach:5},expected:{value:'[undefined]',long:60,reach:null,activity:'[undefined]'}},
 {id:'ranged-null-value',type:'simpleR',properties:[],source:{value:null,long:60,reach:5},expected:{value:null,long:60,reach:null,activity:60}},
 {id:'natural-range',type:'natural',properties:[],source:{value:20,long:60,reach:null},expected:{value:20,long:60,reach:'default5',activity:60}},
 {id:'natural-zero',type:'natural',properties:[],source:{value:0,long:60,reach:null},expected:{value:null,long:null,reach:'default5',activity:'default5'}},
 {id:'improvised',type:'improv',properties:[],source:{value:20,long:60,reach:null},expected:{value:null,long:null,reach:'default5',activity:'default5'}},
 {id:'natural-short',type:'natural',properties:[],source:{value:2,long:60,reach:null},expected:{value:2,long:60,reach:'default5',activity:60}},
 {id:'natural-unspecified-reach',type:'natural',properties:[],source:{value:2,long:60},expected:{value:2,long:60,reach:'[undefined]',activity:60}},
 {id:'light-thrown',type:'simpleM',properties:['thr','lgt'],source:{value:20,long:60,reach:null},expected:{value:20,long:60,reach:'default5',activity:60}}
];
const rows=[],composed=[],encode=v=>v===undefined?'[undefined]':v;
try{for(const isMetric of [false,true])for(const row of cases){metric=isMetric;const source=structuredClone(row),schema=box.weaponRangeSchema.defineSchema().range,cleaned=schema.clean(structuredClone(row.source),options),initialized=schema.initialize(cleaned,{},options),model=Object.assign(new box.sourceRangeOracle.SourceRangeWeapon(),{parent:{labels:{}},type:{value:row.type,baseItem:''},properties:box.sourceRangeOracle.set(row.properties),range:initialized,armor:{value:0},damage:{base:{formula:'',types:box.sourceRangeOracle.set([])}}});
 model.prepareDerivedData();const activity=Object.assign(new box.activityOracle.BaseActivity(),new box.activityOracle.SchemaField(box.activityOracle.BaseActivity.defineSchema()).clean({_id:'RangeUtility0001',type:'utility',name:'Range'},options),{item:{system:model},labels:{},actor:null,isSpell:false,isRider:false});model.validProperties=box.sourceRangeOracle.set(['mgc']);model.attunement='';model.identified=true;activity.getRollData=()=>({});activity.prepareFinalData();
 const expected=Object.fromEntries(Object.entries(row.expected).map(([key,value])=>[key,value==='default5'?(isMetric?1.5:5):value==='default10'?(isMetric?3:10):value]));
 const actual={value:encode(model.range.value),long:encode(model.range.long),reach:encode(model.range.reach),activity:encode(activity.range.value)};assert.deepEqual(actual,expected,row.id+'/'+isMetric);assert.equal(model.range.units,isMetric?'m':'ft');assert.deepEqual(row,source);
 const modes=row.id==='light-thrown'?['oneHanded','offhand','thrown','thrown-offhand']:row.id==='thrown-keeps-range'?['oneHanded','thrown']:['natural-range','natural-unspecified-reach'].includes(row.id)||row.id==='natural-short'&&isMetric?['oneHanded','ranged']:['oneHanded'];assert.deepEqual(Array.from(model.attackModes).filter(mode=>mode.value).map(mode=>mode.value),modes,row.id+'/modes');
 rows.push({...row,metric:isMetric,expected:{...expected,units:model.range.units,modes},hasRange:Boolean(model.hasRange)});
}
 const host=a.host,priorBridge=host.foundry.documents.ActiveEffect.implementation;host.foundry.documents.ActiveEffect.implementation=host.equippableFinal.PhaseBridge;
 try{for(const row of rows){metric=row.metric;const {PhaseActor,PhaseItem,Weapon}=host.equippableFinal,actor=Object.assign(new PhaseActor(),{flags:{dnd5e:{}},effects:[],items:[],statuses:new Set(),overrides:{},tokenActiveEffectChanges:{},_completedActiveEffectPhases:new Set(),_prepareSpellcasting(){},getFlag:()=>undefined}),model=Object.assign(new a.i.MathModel(),{parent:actor,isCreature:false,isNPC:false,isGroup:false,prepareEmbeddedData(){},details:{level:5},attributes:{prof:3,attunement:{max:3,value:0},ac:{}},abilities:{},tools:{},traits:{armorProf:{value:new Set()},weaponProf:{value:new Set()}},rolls:{ability:{check:{proficiency:0},tool:{proficiency:0}}}});actor.system=model;
  const schema=box.weaponRangeSchema.defineSchema().range,initial=schema.initialize(schema.clean(structuredClone(row.source),options),{},options),prepared=Object.assign(new box.sourceRangeOracle.SourceRangeWeapon(),{parent:{labels:{}},type:{value:row.type,baseItem:''},properties:box.sourceRangeOracle.set(row.properties),range:initial,armor:{value:0},damage:{base:{formula:'',types:box.sourceRangeOracle.set([])}}});prepared.prepareDerivedData();
  const item=Object.assign(new PhaseItem(),{id:'RangeWeapon00001',type:'weapon',actor,parent:actor,flags:{dnd5e:{}},labels:{},scalingIncrease:null}),system=Object.assign(new Weapon(),{parent:item,type:{value:row.type,baseItem:''},range:structuredClone(prepared.range),equipped:true,attuned:false,attunement:'',properties:box.sourceRangeOracle.set(row.properties),identified:true,proficient:1,uses:{max:'3',spent:1,recovery:[]},activities:[],schema:{has:()=>false}});item.system=system;actor.items=[item];
  const activity=Object.assign(new box.activityOracle.BaseActivity(),new box.activityOracle.SchemaField(box.activityOracle.BaseActivity.defineSchema()).clean({_id:'RangeUtility0001',type:'utility',name:'Range'},options),{item,actor,isSpell:false,isRider:false,labels:{}});system.activities=[activity];const effect=Object.assign(new e.NEffect(),{id:'RangeTransfer',type:'base',transfer:true,disabled:false,actor,item,duration:{expired:false},statuses:new Set(),system:{magical:false,applicableType:'Actor',changes:[{key:'system.attributes.prof',value:1,type:'add',phase:'final',priority:20}]}});item.effects=[effect];actor.applyActiveEffects('initial');actor.applyActiveEffects('final');assert.equal(model.attributes.prof,4);assert.equal(encode(activity.range.value),row.expected.activity);assert.equal(system.uses.value,2);composed.push({case:row.id,metric:row.metric,expected:{proficiency:4,remaining:2,activity:row.expected.activity}});
 }}finally{host.foundry.documents.ActiveEffect.implementation=priorBridge;}
}finally{m.box.game.settings.get=oldSetting;box.defaultUnits=oldDefault;}
const out=option(process.argv.slice(2),'--write-evidence');if(out)writeFileSync(out,JSON.stringify({nativeCommit,cases:rows,composed,sourceHashes:{weapon:sha256(e.files.get(path)),activity:sha256(e.files.get('module/data/activity/base-activity.mjs')),range:sha256(e.files.get('module/data/shared/range-field.mjs'))},limits:['Actual Weapon range schema,primitive/SchemaField clean AND initialize,attackType/hasRange/prepareDerivedData and BaseActivity common final execute. Actual native defaultUnits/convertLength use explicit metric setting/config.','Description/physical/mount/identification hooks and label data are declared collaborators;numeric range effects and source preservation are asserted. Further actual Item/Actor final compositions use the source-derived range and existing C91/C97 class/Actor callback/label seams. No full Item/DataModel/runtime or native/operator acceptance.','Optional numeric initialization preserves undefined;explicit null reach triggers native5ft/1.5m or10ft/3m. Non-ranged weapons clear value/long;scalar Activity absence stays null/undefined,not invented zero. Missing range metadata does not prevent the captured independent final Actor proficiency4.']},null,2)+'\n');
process.stdout.write('S:'+rows.length+' actual source→initialized→Weapon derived→Activity range and'+composed.length+' Item/Actor final compositions PASS\n');
