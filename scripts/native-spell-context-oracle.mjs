import assert from 'node:assert/strict';
import vm from 'node:vm';
import {writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {coreRoot,option} from './lib/toolchain.mjs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
const {activityCommonOracle606:a}=await import('./native-activity-common-oracle.mjs');
const {box,e,options}=a,ts=createRequire(join(coreRoot(),'package.json'))('typescript');
const actorPath='module/documents/actor/actor.mjs',itemPath='module/documents/item.mjs',spellPath='module/data/item/spell.mjs',fieldPath='module/data/item/fields/spellcasting-field.mjs',activityPath='module/data/activity/base-activity.mjs';
const ast=ts.createSourceFile(fieldPath,e.files.get(fieldPath),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),ctor=ast.statements.find(ts.isClassDeclaration).members.find(ts.isConstructorDeclaration).getText(ast);
// Only the source fields under test are cleaned. Native StringField/SchemaField
// and SpellcastingField constructor execute; unrelated Spell schema constructors
// are declaration seams,not a full DataModel initialization claim.
vm.runInContext(`class SpellcastingSource extends SchemaField {${ctor}}
class CastingActor {${['classes','spellcastingClasses','spellcastingAbility'].map(m=>e.n(actorPath,'Actor5e',m)).join('\n')}}
class CastingItem {${['class','subclass','spellcasting'].map(m=>e.n(itemPath,'Item5e',m)).join('\n')}}
class CastingSpell {${['availableAbilities','classIdentifier'].map(m=>e.n(spellPath,'SpellData',m)).join('\n')}}
class CastingActivity {${['ability','spellcastingAbility','getRollData'].map(m=>e.n(activityPath,'BaseActivityData',m)).join('\n')}prepareFinalData(){}}
{const Roll={create:()=>({formula:'0'})},simplifyRollFormula=v=>v;
class CastingAttack extends CastingActivity {${['ability','availableAbilities','prepareFinalData'].map(m=>e.n('module/data/activity/attack-data.mjs','BaseAttackActivityData',m)).join('\n')}
prepareDamageLabel(){}getAttackData(){return {data:{},parts:['0']};}}
globalThis.castingAttackSelection=CastingAttack;}
Object.defineProperty(Set.prototype,'first',{value:function(){return this.values().next().value;},configurable:true});
foundry.utils.deepClone=structuredClone;
globalThis.spellContextOracle={CastingActor,CastingItem,CastingSpell,CastingActivity,CastingAttack:globalThis.castingAttackSelection,set:v=>new Set(v),cleanClass:v=>new SpellcastingSource().clean(v,${JSON.stringify(options)}),cleanAbility:v=>new StringField().clean(v,${JSON.stringify(options)}),cleanSource:v=>new StringField({allowType:true}).clean(v,${JSON.stringify(options)})};`,box);
const c=box.spellContextOracle,base={str:10,dex:14,con:12,int:18,wis:14,cha:16};
box.CONFIG.DND5E.abilities=Object.fromEntries(Object.keys(base).map(k=>[k,{}]));
const cls=(id,ability,progression='full',more={})=>({id,type:'class',identifier:id,system:{levels:1,spellcasting:{ability,progression}},...more});
const sub={id:'SubClass00000001',type:'subclass',identifier:'scholar',system:{classIdentifier:'wizard',spellcasting:{progression:'third',ability:'cha'}}};
const grant={id:'GrantFeat0000001',type:'feat',identifier:'grant',flags:{advancementRoot:'WizardClass00001extra'},system:{}};
const wizard=cls('WizardClass00001','int','full',{identifier:'wizard'});
const cases=[
 {id:'world-default',items:[],attribute:'wis',spell:{},expected:{available:['wis'],activity:'wis',classIdentifier:'',mod:2}},
 {id:'blank-world',items:[],attribute:'',spell:{},expected:{available:[],activity:'',classIdentifier:'',mod:0}},
 {id:'explicit',items:[],attribute:'wis',spell:{ability:'cha'},expected:{available:['cha'],activity:'cha',classIdentifier:'',mod:3}},
 {id:'linked-class',items:[wizard],attribute:'wis',spell:{sourceItem:'class:wizard'},expected:{available:['int'],activity:'int',classIdentifier:'wizard',mod:4}},
 {id:'untyped-class',items:[wizard],attribute:'wis',spell:{sourceItem:'wizard'},expected:{available:['int'],activity:'int',classIdentifier:'wizard',mod:4}},
 {id:'linked-subclass',items:[wizard,sub],attribute:'wis',spell:{sourceItem:'subclass:scholar'},expected:{available:['cha'],activity:'cha',classIdentifier:'wizard',mod:3}},
 {id:'class-effective-subclass',items:[wizard,sub],attribute:'wis',spell:{sourceItem:'wizard'},expected:{available:['cha'],activity:'cha',classIdentifier:'wizard',mod:3}},
 {id:'grant-root',items:[wizard,grant],attribute:'wis',spell:{sourceItem:'feat:grant'},expected:{available:['int'],activity:'int',classIdentifier:'wizard',mod:4}},
 {id:'unresolved-source',items:[wizard],attribute:'wis',spell:{sourceItem:'missing'},expected:{available:['wis'],activity:'wis',classIdentifier:'',mod:2}},
 {id:'strongest-activity',items:[wizard,cls('cleric','wis')],attribute:'',spell:{},expected:{available:[],activity:'int',classIdentifier:'',mod:4}},
 {id:'blank-class-ability',items:[cls('wizard','')],attribute:'wis',spell:{sourceItem:'wizard'},expected:{available:[],activity:'wis',classIdentifier:'wizard',mod:2}},
 {id:'missing-class-ability',items:[cls('wizard',undefined)],attribute:'wis',spell:{sourceItem:'wizard'},expected:{available:['wis'],activity:'wis',classIdentifier:'wizard',mod:2}},
 {id:'subclass-activity-distinction',items:[wizard,sub],attribute:'',spell:{},expected:{available:[],activity:'int',classIdentifier:'',mod:4}},
 {id:'same-mod-first-class',items:[cls('alpha','wis'),cls('beta','dex')],attribute:'',spell:{},expected:{available:[],activity:'wis',classIdentifier:'',mod:2}},
 {id:'same-mod-reversed',items:[cls('beta','dex'),cls('alpha','wis')],attribute:'',spell:{},expected:{available:[],activity:'dex',classIdentifier:'',mod:2}},
 {id:'duplicate-class-last-value',items:[cls('wizard','wis'),cls('wizard','cha')],attribute:'',spell:{},expected:{available:[],activity:'cha',classIdentifier:'',mod:3}}
];
// Keep all fixture source JSON serializable;the duplicate case differs only in
// native Object.fromEntries selection,not an exotic progression operand.
cases.at(-1).items[1].system.spellcasting.progression='full';cases.at(-1).items[1].id='DuplicateClass01';
const rows=[],attacks=[];
const {nativeFormula606:q}=await import('./native-formula-oracle.mjs');
const host=a.i.sandbox;
for(const input of cases){
 const source=structuredClone(input),actor=Object.assign(new c.CastingActor(),{_lazy:{},system:{attributes:{spellcasting:input.attribute},abilities:Object.fromEntries(Object.entries(base).map(([k,v])=>[k,{mod:Math.floor((v-10)/2)}]))}});
 const items=input.items.map(raw=>{const item=Object.assign(new c.CastingItem(),{id:raw.id,type:raw.type,identifier:raw.identifier,isEmbedded:true,actor,parent:actor,flags:raw.flags??{},getFlag:(scope,key)=>raw.flags?.[key]}),system=structuredClone(raw.system);if(['class','subclass'].includes(raw.type))system.spellcasting=c.cleanClass(structuredClone(raw.system.spellcasting));item.system=system;return item;});
 items.get=id=>items.find(i=>i.id===id);actor.items=items;actor.itemTypes={class:items.filter(i=>i.type==='class')};actor.identifiedItems={get:key=>{const [type,identifier]=key.includes(':')?key.split(':'):[null,key];return c.set(items.filter(i=>(!type||i.type===type)&&i.identifier===identifier));}};
 const spell=Object.assign(new c.CastingSpell(),{parent:{actor},ability:c.cleanAbility(input.spell.ability),sourceItem:c.cleanSource(input.spell.sourceItem)}),item={system:spell,flags:{},getRollData:()=>({})},activity=Object.assign(new c.CastingActivity(),{item,actor,isSpell:true});
 const actual={available:Array.from(spell.availableAbilities),activity:activity.ability,classIdentifier:spell.classIdentifier,mod:activity.getRollData().mod};
 assert.deepEqual(actual,input.expected,input.id);assert.deepEqual(input,source,input.id);rows.push({...source,expected:actual});
 for(const selection of ['', 'spellcasting','dex','none'])for(const ranged of [false,true]){
  const expectedAbility=(selection==='none'?null:selection==='spellcasting'?actual.activity:selection||actual.available[0]||null)||null;
  const final=Object.assign(new c.CastingAttack(),{item:{...item,type:'spell'},actor,isSpell:true,attack:{ability:selection,abilities:c.set([]),type:{value:ranged?'ranged':'melee',classification:'spell'}},damage:{includeBase:false},labels:{}});final.prepareFinalData();const selected=final.ability;assert.equal(selected,expectedAbility,input.id+'/'+selection);
  const mod=selected?Math.floor((base[selected]-10)/2):0,scope=ranged?'rsak':'msak',actionBonus=ranged?4:3;
  const system={attributes:{prof:3},abilities:Object.fromEntries(Object.entries(base).map(([key,value])=>[key,{mod:Math.floor((value-10)/2),attack:{roll:{bonus:'1'}}}])),rolls:{attack:{bonus:'2',[scope]:{bonus:String(actionBonus)}}}},attackActor={system,items:{get:()=>undefined},getRollData:()=>({prof:3}),addConditionRollReduction:()=>{}},attackItem={type:'spell',system:{prof:{term:'3'}},magicAvailable:false},attack=Object.assign(new host.itemFinalOracle.AttackReference(),{actor:attackActor,item:attackItem,attack:{ability:selection,flat:false,bonus:'5',type:{value:ranged?'ranged':'melee',classification:'spell'}},getRollData:()=>({prof:3,mod,roll:{ability:selected}})}),built=attack.getAttackData(),total=q.NativeMath.safeEval(q.replaceFormulaData(built.parts.join('+'),built.data));
  const expected=3+mod+(selected?1:0)+2+actionBonus+5;assert.equal(total,expected,input.id+'/'+selection+'/'+scope);attacks.push({case:input.id,selection,ranged,expected:{ability:selected,total}});
 }
}
const out=option(process.argv.slice(2),'--write-evidence');if(out)writeFileSync(out,JSON.stringify({nativeCommit,cases:rows,attacks,scores:base,sourceHashes:Object.fromEntries([actorPath,itemPath,spellPath,fieldPath,activityPath,'module/data/activity/attack-data.mjs'].map(p=>[p,sha256(e.files.get(p))])),limits:['Actual Actor class/caster/ability,Item class/subclass/effective spellcasting,Spell availableAbilities/classIdentifier and BaseActivity ability/getRollData methods execute. Actual native primitive and SpellcastingField source defaults execute. Actor ability mods are independently supplied initialized values,not source preparation parity.','Actual Attack final ability-Set/availableAbilities/ability execute with no-base-damage input and declared common/damage-label/neutral label-constructor seams. Actual getAttackData,D20 scope combination and BasicRoll.constructParts then execute separately with that native selected ability. Numeric local/global/action/activity bonuses are1/2/3-or4/5;proficiency is3. No ammo/effects/proficiency dice or full final composition claim.','Identity collections,explicit identifiers,Set.first and Item getRollData are declared collaborators. No name-based matching,spellcasting-slot/preparation-limit calculation,casting eligibility,Activity execution,full DataModel/runtime or native/operator acceptance.']},null,2)+'\n');
process.stdout.write('S:'+rows.length+' native class/subclass/grant/Actor/Spell/Activity contexts and'+attacks.length+' actual numeric spell attack constructions PASS\n');
