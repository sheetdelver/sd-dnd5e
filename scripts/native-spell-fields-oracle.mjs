import assert from 'node:assert/strict';
import vm from 'node:vm';
import {writeFileSync} from 'node:fs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
import {option} from './lib/toolchain.mjs';
const {activityCommonOracle606:a}=await import('./native-activity-common-oracle.mjs');
const {nativeFormula606:q}=await import('./native-formula-oracle.mjs');
const {box,e,options}=a,spellPath='module/data/item/spell.mjs',savePath='module/data/activity/save-data.mjs';
box.spellFieldsSimplify=q.simplifyBonus;
vm.runInContext(`{
Object.defineProperty(Set.prototype,'reduce',{value:function(callback,initial){return Array.from(this).reduce(callback,initial);},configurable:true});
Object.defineProperty(Set.prototype,'first',{value:function(){return this.values().next().value;},configurable:true});
class SetField extends EmptyField {}
class SpellBase {static defineSchema(){return {};}static mergeSchema(a,b){return {...a,...b};}prepareDerivedData(){}prepareDescriptionData(){}}
class NativeSpellFields extends SpellBase {
${['defineSchema','availableAbilities','classIdentifier','countsPrepared','prepareDerivedData','prepareFinalData'].map(m=>e.n(spellPath,'SpellData',m)).join('\n')}
${e.n('module/data/item/templates/activities.mjs','ActivitiesTemplate','prepareFinalActivityData')}
}
class SaveBase extends BaseActivity {prepareData(){}prepareFinalData(){}prepareDamageLabel(){}}
const simplifyBonus=globalThis.spellFieldsSimplify;
class NativeSaveFields extends SaveBase {
${['ability','prepareData','prepareFinalData','getRollData'].map(m=>e.n(savePath,'BaseSaveActivityData',m)).join('\n')}
get spellcastingAbility(){return 'wis';}}
globalThis.spellFieldsOracle={NativeSpellFields,NativeSaveFields,cleanFields:raw=>{
 const schema=NativeSpellFields.defineSchema();return Object.fromEntries(['activation','duration','range','target'].map(key=>[key,schema[key].clean(structuredClone(raw[key]),${JSON.stringify(options)})]));
},makeSet:v=>new Set(v)};
}`,box);
// Numeric formula replacement/simplification is the existing qualified native
// helper and deterministic Roll collaborator,not another evaluator.
assert.equal(typeof box.spellFieldsSimplify,'function');
box.CONFIG.DND5E.spellLevels={1:'1'};box.CONFIG.DND5E.spellSchools={};box.CONFIG.DND5E.itemProperties={};box.CONFIG.DND5E.spellcasting={};box.CONFIG.DND5E.abilities=Object.fromEntries(['str','dex','con','int','wis','cha'].map(k=>[k,{label:k}]));
box.game={i18n:{getListFormatter:()=>new Intl.ListFormat('en',{style:'narrow'})}};
const f=box.spellFieldsOracle,parent={activation:{type:'bonus'},duration:{units:'minute',value:'@prof + 1'},range:{units:'ft',value:'@abilities.wis.mod * 10'},target:{affects:{type:'creature',count:'2'}}};
const commonCases=[
 {id:'defaults',parent:{},activity:{},expected:{parent:{activation:'action',duration:null,range:null,count:null},activity:{activation:'action',duration:null,range:null,count:null}}},
 {id:'inherit',parent,activity:{},expected:{parent:{activation:'bonus',duration:4,range:20,count:2},activity:{activation:'bonus',duration:4,range:20,count:2}}},
 {id:'child-source-does-not-override',parent,activity:{activation:{type:'minute',value:9},duration:{units:'round',value:'99'},range:{units:'ft',value:'99'},target:{affects:{type:'object',count:'99'}}},expected:{parent:{activation:'bonus',duration:4,range:20,count:2},activity:{activation:'bonus',duration:4,range:20,count:2}}},
 {id:'all-overrides',parent,activity:{activation:{override:true,type:'minute',value:2},duration:{override:true,units:'round',value:'@mod+1'},range:{override:true,units:'ft',value:'45'},target:{override:true,affects:{type:'object',count:'3'}}},expected:{parent:{activation:'bonus',duration:4,range:20,count:2},activity:{activation:'minute',duration:3,range:45,count:3}}},
 {id:'zero',parent:{activation:{type:'action'},duration:{units:'minute',value:0},range:{units:'ft',value:0},target:{affects:{type:'creature',count:0}}},activity:{},expected:{parent:{activation:'action',duration:0,range:0,count:0},activity:{activation:'action',duration:0,range:0,count:0}}},
 {id:'counter-after-parent',parent:{duration:{units:'minute',value:'@item.uses.value'}},activity:{duration:{override:true,units:'minute',value:'@item.uses.value + @mod'}},expected:{parent:{activation:'action',duration:2,range:null,count:null},activity:{activation:'action',duration:4,range:null,count:null}}}
];
const common=[];
for(const row of commonCases){const preserved=structuredClone(row),actor={system:{abilities:{wis:{mod:2}}},spellcastingAbility:'wis',identifiedItems:{get:()=>undefined},spellcastingClasses:{},_preparationWarnings:[]},document={actor,labels:{},_stats:{},uuid:'Actor.Fields.Item.Spell',flags:{}},model=Object.assign(new f.NativeSpellFields(),f.cleanFields(row.parent),{parent:document,ability:'wis',sourceItem:'',level:1,school:'',method:'',properties:f.makeSet(['concentration']),validProperties:f.makeSet([]),uses:{max:'3',spent:1,recovery:[]},activities:[]});document.system=model;
 document.getRollData=()=>({prof:3,abilities:{wis:{mod:2}},item:{...model}});
 const initialized=new box.activityOracle.SchemaField(box.activityOracle.BaseActivity.defineSchema()).clean({_id:'SpellUtility0001',type:'utility',name:'Utility',...structuredClone(row.activity)},options),activity=Object.assign(new box.activityOracle.BaseActivity(),initialized,{item:document,actor,isSpell:true,isRider:false,labels:{},spellcastingAbility:'wis'});model.activities=[activity];
 model.prepareDerivedData();model.prepareFinalData();assert.equal(model.properties.has('mgc'),true);assert.equal(model.duration.concentration,true);assert.equal(model.uses.value,2);assert.equal(activity.visibility.requireMagic,true);assert.equal(activity.visibility.requireAttunement,false);assert.equal(activity.visibility.requireIdentification,false);
 const read=v=>({activation:v.activation.type,duration:v.duration.value??null,range:v.range.value??null,count:v.target.affects.count??null});assert.deepEqual(read(model),row.expected.parent,row.id+'/parent');assert.deepEqual(read(activity),row.expected.activity,row.id+'/child');assert.deepEqual(row,preserved);common.push(row);
}
const saves=[];
for(const isSpell of [false,true])for(const calculation of ['initial','','spellcasting','wis','dex'])for(const formula of [undefined,'0','13','@prof + 10','@mod + 10'])for(const targets of [[],['dex'],['str','dex']]){
 const flat=calculation===''||calculation==='initial'&&!isSpell,ability=flat?targets[0]??null:calculation==='initial'||calculation==='spellcasting'?'wis':calculation,mod=ability==='wis'?2:ability==='str'?-1:0,expected=flat?(formula===undefined?0:formula==='@prof + 10'?13:formula==='@mod + 10'?mod+10:Number(formula)):ability==='wis'?15:13;
 const save=Object.assign(new f.NativeSaveFields(),{isSpell,save:{ability:f.makeSet(targets),dc:{calculation,formula,bonus:undefined}},item:{flags:{},getRollData:()=>({prof:3})},actor:{system:{attributes:{prof:3},abilities:{wis:{dc:15,mod:2},dex:{dc:13,mod:0},str:{dc:12,mod:-1}}}},labels:{}});save.prepareData();assert.equal(save.ability,ability);save.prepareFinalData();assert.equal(save.save.dc.value,expected);saves.push({isSpell,calculation,formula:formula??null,targets,expected,ability});
}
const noAbility=Object.assign(new f.NativeSaveFields(),{isSpell:true,save:{ability:f.makeSet([]),dc:{calculation:'spellcasting'}},item:{flags:{},getRollData:()=>({prof:3})},actor:{system:{attributes:{prof:3},abilities:{}}},labels:{}});Object.defineProperty(noAbility,'spellcastingAbility',{value:''});noAbility.prepareFinalData();assert.equal(noAbility.save.dc.value,11);saves.push({isSpell:true,calculation:'spellcasting',formula:null,targets:[],expected:11,ability:'',noCaster:true});
const out=option(process.argv.slice(2),'--write-evidence');if(out)writeFileSync(out,JSON.stringify({nativeCommit,common,saves,sourceHashes:Object.fromEntries([spellPath,savePath,'module/data/activity/base-activity.mjs','module/data/item/templates/activities.mjs'].map(p=>[p,sha256(e.files.get(p))])),limits:['Actual Spell schema shared field constructors/cleaning,derived mgc/concentration and final/Activity-template hooks,BaseActivity common final execute. No-op description/base model,labels/valid component properties,explicit caster and deterministic Item roll data are declared collaborators. No full source DataModel/runtime or class preparation-count lifecycle.','Actual Save prepareData/calculation normalization,ability/final DC methods execute with common/damage-label and roll-data seams and earlier prepared native ability DC values15/13. No save roll,target application or damage execution.','Source/save DC bonus/value are nonpersisted and are not source overrides. Prepared effects on these fields remain separately unqualified.']},null,2)+'\n');
process.stdout.write('S:'+common.length+' actual Spell/common inheritance/override/counter profiles and'+saves.length+' native save DC phase profiles PASS\n');
