import assert from 'node:assert/strict';
import vm from 'node:vm';
import {writeFileSync} from 'node:fs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
import {option} from './lib/toolchain.mjs';
const {activityCommonOracle606:a}=await import('./native-activity-common-oracle.mjs');
const {box,e,options}=a,path='module/data/shared/damage-field.mjs';
for(const [file,cls,key]of [['attack','BaseAttackActivityData','parts'],['save','BaseSaveActivityData','parts'],['damage','BaseDamageActivityData','parts'],['heal','BaseHealActivityData','healing']])assert.match(e.n('module/data/activity/'+file+'-data.mjs',cls,'defineSchema'),new RegExp(key+': new '+(key==='parts'?'ArrayField\\(new DamageField\\(\\)\\)':'DamageField\\(\\)')));
vm.runInContext(`{
class SetField extends EmptyField {}class Scaling {}
class DamageSource {${['defineSchema','formula','_automaticFormula','_manualFormula','scaledFormula'].map(m=>e.n(path,'DamageData',m)).join('\n')}}
DamageSource.prototype.toObject=function(){return {number:this.number,denomination:this.denomination,bonus:this.bonus,custom:{...this.custom},types:new Set(this.types),modifiers:new Set(this.modifiers),scaling:{...this.scaling}};};
DamageSource.prototype.clone=function(){return Object.assign(new DamageSource(),this.toObject());};
class WeaponOffer {${e.n('module/data/item/weapon.mjs','WeaponData','offersBaseDamage')}}
class PlacementBase {prepareFinalData(){}}
const Roll={create:()=>({formula:'0'})},simplifyRollFormula=v=>v;
class PlacementAttack extends PlacementBase {${e.n('module/data/activity/attack-data.mjs','BaseAttackActivityData','prepareFinalData')}
getRollData(){return {};}prepareDamageLabel(){}getAttackData(){return {parts:['0'],data:{}};}}
globalThis.damageSourceOracle={DamageSource,set:v=>new Set(v),clean:raw=>{
 const schema=DamageSource.defineSchema(),result={};
 for(const key of ['number','denomination','bonus','custom','scaling'])result[key]=schema[key].clean(structuredClone(raw[key]),${JSON.stringify(options)});
 result.types=new Set((raw.types??[]).map(v=>new StringField().clean(v,${JSON.stringify(options)})));result.modifiers=new Set((raw.modifiers??[]).map(v=>new StringField().clean(v,${JSON.stringify(options)})));return result;
},WeaponOffer,PlacementAttack};}`,box);
box.CONFIG.DND5E.abilities=Object.fromEntries(['str','dex','con','int','wis','cha'].map(k=>[k,{}]));
const cases=[
 {id:'absent',source:{},formula:''},
 {id:'count-null',source:{number:null,denomination:8},formula:''},
 {id:'count-absent',source:{denomination:8,bonus:'2'},formula:'2'},
 {id:'count-zero',source:{number:0,denomination:8},formula:''},
 {id:'denomination-zero',source:{number:1,denomination:0,bonus:3},formula:'3'},
 {id:'automatic',source:{number:1,denomination:8,types:['piercing']},formula:'1d8'},
 {id:'automatic-bonus',source:{number:2,denomination:6,bonus:'@mod + 2',types:['fire','fire','cold']},formula:'2d6 + @mod + 2'},
 {id:'numeric-source',source:{number:'2',denomination:'6',bonus:0},formula:'2d6 + 0'},
 {id:'bonus-zero',source:{bonus:0},formula:'0'},
 {id:'bonus-only',source:{bonus:'@prof'},formula:'@prof'},
 {id:'manual',source:{number:99,denomination:99,custom:{enabled:true,formula:'2d6 + @mod'}},formula:'2d6 + @mod'},
 {id:'manual-empty',source:{number:1,denomination:8,custom:{enabled:true}},formula:''},
 {id:'manual-zero',source:{custom:{enabled:true,formula:0}},formula:'0'},
 {id:'automatic-modifiers',source:{number:1,denomination:8,modifiers:['min2','r1']},formula:'1d8min2r1'},
 {id:'manual-first-die',source:{custom:{enabled:true,formula:'1d6 + 1d4'},modifiers:['min2']},formula:'1d6min2 + 1d4'},
 {id:'manual-scalar',source:{custom:{enabled:true,formula:'3'},modifiers:['min2']},formula:'3'},
 {id:'disabled-manual',source:{number:1,denomination:8,custom:{enabled:false,formula:'99d100'}},formula:'1d8'},
 {id:'zero-step-scaling',source:{number:1,denomination:8,scaling:{mode:'whole',number:2,formula:'1d4'}},formula:'1d8'},
 {id:'half-zero-scaling',source:{number:1,denomination:8,scaling:{mode:'half',number:2,formula:'1d4'}},formula:'1d8'}
 ,{id:'trimmed',source:{number:' 2 ',denomination:'6',bonus:' 2 ',types:[' fire ','fire'],modifiers:[' min2 ','min2']},formula:'2d6min2 + 2'}
 ,{id:'blank-bonus',source:{number:1,denomination:8,bonus:'   '},formula:'1d8'}
];
const observations=[],placements=[];
for(const row of cases){const before=structuredClone(row),initialized=box.damageSourceOracle.clean(structuredClone(row.source)),part=Object.assign(new box.damageSourceOracle.DamageSource(),initialized);
 assert.equal(part.formula,row.formula,row.id);assert.equal(part.scaledFormula(0),row.formula,row.id+'/zero scaling');assert.deepEqual(row,before);
 const encode=value=>value===undefined?'[undefined]':value;
 observations.push({...row,initialized:{number:encode(part.number),denomination:encode(part.denomination),bonus:encode(part.bonus),custom:{enabled:encode(part.custom.enabled),formula:encode(part.custom.formula)},types:Array.from(part.types),modifiers:Array.from(part.modifiers),scaling:{mode:encode(part.scaling.mode),number:encode(part.scaling.number),formula:encode(part.scaling.formula)}}});
 for(const includeBase of [false,true]){
  const system=Object.assign(new box.damageSourceOracle.WeaponOffer(),{damage:{base:part}}),additional=Object.assign(new box.damageSourceOracle.DamageSource(),box.damageSourceOracle.clean({number:1,denomination:4})),activity=Object.assign(new box.damageSourceOracle.PlacementAttack(),{item:{system},damage:{includeBase,parts:[additional]},attack:{ability:'none',abilities:box.damageSourceOracle.set([])},labels:{}});activity.prepareFinalData();
  const expected=includeBase&&row.formula?[{role:'base',formula:row.formula},{role:'additional',formula:'1d4'}]:[{role:'additional',formula:'1d4'}],actual=activity.damage.parts.map(part=>({role:part.base?'base':'additional',formula:part.formula}));assert.deepEqual(actual,expected,row.id+'/'+includeBase);placements.push({case:row.id,includeBase,expected});
 }
}
const out=option(process.argv.slice(2),'--write-evidence');if(out)writeFileSync(out,JSON.stringify({nativeCommit,cases:observations,placements,sourceHashes:{damage:sha256(e.files.get(path)),attack:sha256(e.files.get('module/data/activity/attack-data.mjs')),weapon:sha256(e.files.get('module/data/item/weapon.mjs'))},limits:['Actual DamageData schema,Foundry primitive/SchemaField cleaning,formula/_automaticFormula/_manualFormula/scaledFormula(0) execute. Set containers/string cleaning use the already qualified string-Set source profile as a declared collaborator. No DataModel constructor/runtime boot.','Actual Attack final includeBase/omit-empty insertion and Weapon offersBaseDamage execute separately with clone/toObject,common/roll-data/damage-label/neutral-label constructor seams. This does not qualify full Activity final preparation or damage execution.','Only base formula construction and zero scaling are compared. References remain symbolic;no dice evaluation,Actor/current damage totals,automatic cantrip/upcast scaling,mod/weapon/ammo/critical/rule bonuses or damage application is qualified.','Source nonpersisted formula/base/scaledFormula fields do not replace the native getter;modifiers/custom/scaling are persisted metadata and must be preserved rather than silently discarded.']},null,2)+'\n');
process.stdout.write('S:'+observations.length+' actual native DamageData source/default/base formula/zero-scaling and'+placements.length+' Attack base-source placement profiles PASS\n');
