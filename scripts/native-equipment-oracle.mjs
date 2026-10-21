import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';
const args=process.argv.slice(2),repo=option(args,'--native'),foundry=option(args,'--foundry');
if(!repo||!foundry)throw Error('Supply --native release-6.0.6 and static --foundry14.367 references');
const files=readRelease(repo),require=createRequire(join(coreRoot(args),'package.json')),ts=require('typescript');
function member(path,cls,name){
    return sourceMember(files.get(path),cls,name);
}
function sourceMember(source,cls,name){
    const ast=ts.createSourceFile(cls,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
    const node=ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===cls)?.members.find(n=>n.name?.getText(ast)===name);
    if(!node)throw Error('Missing '+cls+'.'+name);return node.getText(ast);
}
const foundryRelease=JSON.parse(readFileSync(join(foundry,'package.json'),'utf8')).release;
assert.equal(foundryRelease.generation,14);assert.equal(foundryRelease.build,367);
const fieldsSource=readFileSync(join(foundry,'common/data/fields.mjs'),'utf8');
const field=(cls,name)=>sourceMember(fieldsSource,cls,name),initBox={};
// Exact defaults/getInitialValue methods, with an explicit option-merging
// constructor stub. No DataModel or native preparation runtime is instantiated.
vm.runInNewContext(`class DataField {constructor(options={}){Object.assign(this,this.constructor._defaults,options);}
${field('DataField','_defaults')} ${field('DataField','getInitialValue')} }
class NumberField extends DataField {${field('NumberField','_defaults')} }
class BooleanField extends DataField {${field('BooleanField','_defaults')} }
class StringField extends DataField {${field('StringField','_defaults')} ${field('StringField','getInitialValue')} }
class ArrayField extends DataField {${field('ArrayField','_defaults')} ${field('ArrayField','getInitialValue')} }
globalThis.defaults={armorValue:new NumberField({required:true,integer:true,min:0}).getInitialValue({}),dexCap:new NumberField({required:true,integer:true}).getInitialValue({}),equipped:new BooleanField({required:true}).getInitialValue({}),attuned:new BooleanField().getInitialValue({}),attunement:new StringField({required:true}).getInitialValue({}),properties:new ArrayField().getInitialValue({}),magicalBonus:new StringField().getInitialValue({})};`,initBox);
assert.equal(initBox.defaults.armorValue,null);assert.equal(initBox.defaults.dexCap,null);assert.equal(initBox.defaults.equipped,false);assert.equal(initBox.defaults.attuned,false);assert.equal(initBox.defaults.attunement,'');assert.equal(initBox.defaults.properties.length,0);assert.equal(initBox.defaults.magicalBonus,undefined);
function registry(name){
    const ast=ts.createSourceFile('config',files.get('module/config.mjs'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
    return ast.statements.find(n=>ts.isExpressionStatement(n)&&n.expression.left?.getText(ast)==='DND5E.'+name).expression.right.getText(ast);
}
const common='module/data/actor/templates/common.mjs',creature='module/data/actor/templates/creature.mjs',attributes='module/data/actor/templates/attributes.mjs',equipment='module/data/item/equipment.mjs',equippable='module/data/item/templates/equippable-item.mjs',advantage='module/data/fields/advantage-mode-field.mjs';
const get=(obj,path)=>String(path).split('.').reduce((v,k)=>v?.[k],obj),set=(obj,path,value)=>{const keys=path.split('.');let target=obj;for(const k of keys.slice(0,-1))target=target[k]??={};target[keys.at(-1)]=value;};
const merge=(a,b)=>{for(const [k,v] of Object.entries(b))a[k]=v&&typeof v==='object'&&!Array.isArray(v)?merge(a[k]??{},v):v;return a;};
// Closed arithmetic vocabulary for this independent fixture, not an expression
// evaluator and never populated from module-produced values.
const arithmetic=new Map([['10+2',12],['10+-2',8],['10+2+2',14],['10+2+3',15]]);
for(let base=0;base<=30;base++)for(let dex=-5;dex<=10;dex++)arithmetic.set(`${base}+${dex}`,base+dex);
function constant(raw){const text=String(raw).replace(/\s/g,'');if(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text))return Number(text);if(arithmetic.has(text))return arithmetic.get(text);throw Error('Unknown controlled arithmetic '+text);}
const utils=ts.createSourceFile('utils',files.get('module/utils.mjs'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const simplify=utils.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='simplifyBonus').getText(utils).replace(/^export /,'');
const sandbox={constant,structuredClone,CONFIG:{Item:{typeLabels:{equipment:'Equipment'}},DND5E:{maxAbilityScore:30,defaultAbilities:{initiative:'dex'},abilities:{dex:{type:'physical'},wis:{type:'mental'},con:{type:'physical'}},skillPassive:{base:10,modifier:5},skills:{ste:{ability:'dex'}},tools:{thief:{ability:'dex'}},equipmentTypes:{},armorIds:{},shieldIds:{}}},
    dnd5e:{settings:{rulesVersion:'modern',proficiencyModifier:'bonus'}},_loc:value=>value,
    AppliedRules:{collect:()=>({filterWith:()=>({toFormula:(parts=[])=>parts.join(' + '),toAdvantageCounts:(counts={})=>counts,resolve:()=>({toSmallest:v=>v,toLargest:v=>v})})})},
    console:{error:()=>{throw Error('Unexpected native expression');}},foundry:{utils:{getProperty:get,setProperty:set,deepClone:structuredClone,mergeObject:merge,getType:value=>value&&typeof value==='object'?'Object':typeof value,iterateEntries:Object.entries}},
    replaceFormulaData:(formula,_data,{actor})=>String(formula).replace(/@([a-zA-Z0-9_.]+)/g,(_m,path)=>{const value=get(actor,path);if(typeof value!=='number')throw Error('Missing controlled reference '+path);return String(value);})};
vm.runInNewContext(`Number.isNumeric=value=>value!==null&&value!==''&&typeof value!=='boolean'&&Number.isFinite(Number(value));
class Roll {constructor(value){this.value=value;this.isDeterministic=true;}evaluateSync(){return {total:constant(this.value)};}static create(v){return new Roll(v);}}
${files.get('module/documents/actor/proficiency.mjs').replace('export default class','class')}
${simplify}
class CommonTemplate {${['prepareAbilities','calculateAbilityCheckProficiency','calculateToolProficiency','calculateSkillToolProficiency'].map(m=>member(common,'CommonTemplate',m)).join('\n')} static shimAbilityData(){} }
class CreatureTemplate extends CommonTemplate {${['prepareSkill','prepareTools'].map(m=>member(creature,'CreatureTemplate',m)).join('\n')} }
class AttributesFields {${member(attributes,'AttributesFields','prepareArmorClass')} }
class AdvantageModeField {${['combineFields','getCounts','resolveMode','setMode','_applyChangeAdd','_applyChangeSubtract','_applyChangeOverride','_applyChangeUpgrade','_applyChangeDowngrade'].map(m=>member(advantage,'AdvantageModeField',m)).join('\n')} }
class BaseItem {prepareBaseData(){} prepareDerivedData(){}}
class Equipment extends BaseItem {${['prepareBaseData','prepareDerivedData','isArmor','proficiencyMultiplier'].map(m=>member(equipment,'EquipmentData',m)).join('\n')}
${member(equippable,'EquippableItemTemplate','magicAvailable')}
${member('module/data/item/templates/item-description.mjs','ItemDescriptionTemplate','validProperties')}
prepareDescriptionData(){} prepareIdentifiable(){} preparePhysicalData(){} prepareMountableData(){} }
CONFIG.DND5E.armorClasses=${registry('armorClasses')};CONFIG.DND5E.armorTypes=${registry('armorTypes')};CONFIG.DND5E.armorProficienciesMap=${registry('armorProficienciesMap')};CONFIG.DND5E.validProperties=${registry('validProperties')};
globalThis.native={CreatureTemplate,AttributesFields,AdvantageModeField,Equipment};`,sandbox);
assert.match(member(equipment,'EquipmentData','defineSchema'),/dex: new NumberField\(\{ required: true, integer: true,/);
assert.match(member(equipment,'EquipmentData','defineSchema'),/magicalBonus: new FormulaField\(\{ deterministic: true/);
assert.match(member(equippable,'EquippableItemTemplate','defineSchema'),/equipped: new BooleanField\(\{required: true/);
const fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/equipment.json'),'utf8'));assert.equal(fixture.nativeCommit,nativeCommit);
const observations=[];
for(const row of fixture.cases.filter(row=>row.expected.ac!==null)){
    const {CreatureTemplate,AttributesFields,AdvantageModeField,Equipment}=sandbox.native,e=row.expected;
    const actor={flags:{dnd5e:{}},conditionRollReduction:0,_isRemarkableAthlete:()=>false,hasConditionEffect:()=>false,getRollData:()=>({}),_preparationWarnings:[],coverBonus:0,itemTypes:{equipment:[]}};
    const model=Object.assign(Object.create(CreatureTemplate.prototype),{parent:actor,abilities:{dex:{value:row.abilities?.dex??14},wis:{value:16},con:{value:14}},skills:{ste:{ability:'dex',value:1,roll:{mode:row.skillMode??0},bonuses:{passive:''}}},tools:{thief:{ability:'dex',value:1,roll:{mode:0}}},attributes:{prof:3,ac:{armor:10,base:-Infinity,bonus:'',calc:'',calcs:vm.runInNewContext('new Set()'),cover:0,flat:0,formulas:structuredClone(row.actorAc?.formulas??[]),min:'',override:row.actorAc?.override??null,shield:0}},rolls:{ability:Object.fromEntries(['check','save','skill','tool'].map(k=>[k,{proficiency:0,mode:k==='check'?row.globalMode??0:0}]))},isNPC:false});
    for(const key of row.actorAc?.calcs??['unarmored','armored'])model.attributes.ac.calcs.add(key);
    actor.system=model;
    for(const abl of Object.values(model.abilities))Object.assign(abl,{proficient:0,max:null,attack:{roll:{}},check:{roll:{mode:0}},save:{roll:{}}});
    model._source=structuredClone({abilities:model.abilities,skills:model.skills,tools:model.tools,rolls:model.rolls});
    const field=new AdvantageModeField();field.applyChange=(value,target,change)=>field['_applyChange'+change.type[0].toUpperCase()+change.type.slice(1)](value,change.value,target,change);
    model.schema={getField:()=>field};
    if(row.modeEffect)field.applyChange(0,model,{key:'skills.ste.roll.mode',...row.modeEffect});
    const items=[];
    for(const [index,raw] of row.equipment.entries()){
        const item={id:'equipment'+index,name:raw.name??'Synthetic',type:'equipment',getRollData:()=>({}),actor};
        const system=Object.assign(Object.create(Equipment.prototype),{parent:item,_source:{armor:{value:raw.armor?.value}},armor:{value:raw.armor?.value??null,magicalBonus:raw.magicalBonus??'',dex:raw.armor?.dex??null},type:{value:raw.type,baseItem:''},properties:vm.runInNewContext('new Set()'),equipped:raw.equipped??true,attunement:raw.attunement??'',attuned:raw.attuned??false,proficient:null});
        for(const prop of raw.properties??[])system.properties.add(prop);
        item.system=system;system.prepareBaseData();system.prepareDerivedData();items.push({id:item.id,value:system.armor.value,base:system.armor.base,magicAvailable:system.magicAvailable});actor.itemTypes.equipment.push(item);
    }
    model.prepareAbilities();model.skills.ste=model.prepareSkill('ste',{originalSkills:{}});model.prepareTools();
    assert.equal(model.skills.ste.total,e.skill,row.id+'/skill');assert.equal(model.skills.ste.passive,e.passive,row.id+'/passive');
    AttributesFields.prepareArmorClass.call(model,{});assert.equal(model.attributes.ac.value,e.ac,row.id+'/armor');
    const scopes=['abilities.dex.check.roll.mode','rolls.ability.check.mode','rolls.ability.skill.mode','skills.ste.roll.mode'];
    const result=AdvantageModeField.combineFields(model,scopes),mode=Number(result.advantage)-Number(result.disadvantage);assert.equal(mode,e.mode,row.id+'/fresh mode');
    const observed={id:row.id,items,ac:model.attributes.ac.value,base:model.attributes.ac.base,calculation:model.attributes.ac.calc,armorId:model.attributes.ac.equippedArmor?.id??null,shieldId:model.attributes.ac.equippedShield?.id??null,skill:model.skills.ste.total,passive:model.skills.ste.passive,freshMode:mode,warnings:actor._preparationWarnings.map(w=>w.message)};
    assert.equal(observed.warnings.length,row.warnings?.length??0,row.id+'/warnings');
    if(row.selected){const combined=AdvantageModeField.combineFields(model,scopes,{advantages:{count:1}}),tool=AdvantageModeField.combineFields(model,['abilities.dex.check.roll.mode','rolls.ability.check.mode','rolls.ability.tool.mode','tools.thief.roll.mode'],{advantages:{count:1}});observed.combinedSkillMode=Number(combined.advantage)-Number(combined.disadvantage);observed.combinedToolMode=Number(tool.advantage)-Number(tool.disadvantage);assert.equal(observed.combinedSkillMode,row.selected.skillMode);assert.equal(observed.combinedToolMode,row.selected.toolMode);const prof=CreatureTemplate.calculateSkillToolProficiency(actor,'wis',{skill:'ste'});observed.alternateTotal=model.abilities.wis.mod+prof.flat;assert.equal(observed.alternateTotal,row.selected.alternateTotal);}
    observations.push(observed);
}
const evidence={fieldDefaults:{...initBox.defaults,magicalBonus:'undefined'},foundry:{generation:14,build:367,fieldsSha256:sha256(fieldsSource)},evidence:'S exact release Item base/derived and Actor skill-before-armor methods; explicit defaults/empty rules and no native DataModels/engine/operator acceptance',nativeCommit,observations,unavailable:fixture.cases.filter(c=>c.expected.ac===null).map(c=>c.id),stubs:['Exact Foundry defaults/getInitialValue with option-merging constructor stub; schema validation/model boot absent','No-op Item description/identity/price/mount phases; exact property/magic getters','Closed independently defined integer armor-expression vocabulary only; unknown arithmetic fails','Empty conditions/flags/applied rules, prof3 initialized; no Item effects or final phases','Mode setMode invokes exact field operations through schema dispatcher; selected scopes/counts already qualified in C11/C15'],sourceHashes:Object.fromEntries([equipment,equippable,attributes,common,creature,advantage,'module/data/item/templates/item-description.mjs','module/config.mjs'].map(p=>[p,sha256(files.get(p))]))};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');process.stdout.write(`S: ${observations.length} initialized Item/Actor armor-phase cases PASS\n`);
