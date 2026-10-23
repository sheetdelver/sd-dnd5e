import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {effectOracle606} from './native-effect-oracle.mjs';
import {StringField} from './native-traits-oracle.mjs';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
const args=process.argv.slice(2),{files,n,f,sandbox}=effectOracle606,ts=createRequire(join(coreRoot(args),'package.json'))('typescript');
const constructor606=(path,name)=>{const ast=ts.createSourceFile(path,files.get(path),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);const node=ast.statements.find(s=>ts.isClassDeclaration(s)&&s.name?.text===name)?.members.find(ts.isConstructorDeclaration);assert.ok(node);return node.getText(ast);};
const common='module/data/actor/templates/common.mjs',creature='module/data/actor/templates/creature.mjs',mapping='module/data/fields/mapping-field.mjs';
const config=ts.createSourceFile('config',files.get('module/config.mjs'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
for(const name of ['abilities','skills']){const statement=config.statements.find(s=>ts.isExpressionStatement(s)&&ts.isBinaryExpression(s.expression)&&s.expression.left.getText(config)==='DND5E.'+name);assert.ok(statement);vm.runInNewContext(statement.getText(config).replace('DND5E.','CONFIG.DND5E.'),sandbox);}
// Schema shells expose only actual primitive cleaning and collection delegation;
// definitions, initial-key iteration and keyed defaults are pinned native code.
Object.assign(sandbox,{StringField606:StringField,DataField606:Object.getPrototypeOf(StringField)});sandbox.foundry.utils.isEmpty=value=>Object.keys(value).length===0;
vm.runInNewContext(`(()=>{
class SchemaField {
 constructor(fields,options={}){this.fields=fields;this.options=options;}
 getInitialValue(){return this.clean({});}
 clean(source={}){const out={};for(const [key,field]of Object.entries(this.fields))out[key]=field.clean(source[key],{migrate:false,sanitize:false});return out;}
 initialize(value){return value;}
}
class BaseMapping {getInitialValue(){return {};}}
class MappingField extends BaseMapping {
 constructor(element,options={}){super();Object.assign(this,options);this.element=element;}
 ${['getInitialValue','_getInitialValueForKey','initialize'].map(key=>n(mapping,'MappingField',key)).join('\n')}
 clean(value){if(value===undefined)return this.getInitialValue();const result={};for(const [key,raw]of Object.entries(value))result[key]=this.element.clean(raw);return result;}
}
class FormulaField {clean(value){if(value==null)return undefined;return String(value).trim();}}
class D20RollModificationField extends SchemaField {constructor(fields={},options={}){super({...fields},options);}clean(source={}){return {...source,...super.clean(source)};}}
class NumberField extends DataField606 {${['_defaults','_cast','_cleanType','_validateType','#isValidChoice'].map(key=>f('common/data/fields.mjs','NumberField',key)).join('\n')}}
const StringField=StringField606,DamageRollModificationField=SchemaField;
class RollConfigField extends SchemaField {${constructor606('module/data/shared/roll-config-field.mjs','RollConfigField')}}
class ModelBase {static defineSchema(){return {};}static mergeSchema(a,b){return {...a,...b};}}
class CommonSource extends ModelBase {static _systemType='character';${n(common,'CommonTemplate','defineSchema')}${n(common,'CommonTemplate','_initialAbilityValue')}}
class CreatureSource extends CommonSource {${n(creature,'CreatureTemplate','defineSchema')}${n(creature,'CreatureTemplate','_initialSkillValue')}static _spellLevels=[];}
globalThis.sourceOracle={CommonSource,CreatureSource,NumberField};})();`,sandbox);
// Numeric globals are intentionally not source initialized by this schema shell;
// maintained DD-R04 comparisons separately cover their persisted:false defaults.
const schema=sandbox.sourceOracle.CreatureSource.defineSchema(),observations=[];
const expectedSkills={acr:'dex',ani:'wis',arc:'int',ath:'str',dec:'cha',his:'int',ins:'wis',itm:'cha',inv:'int',med:'wis',nat:'int',prc:'wis',prf:'cha',per:'cha',rel:'int',slt:'dex',ste:'dex',sur:'wis'};
assert.deepEqual(Object.fromEntries(Object.entries(sandbox.CONFIG.DND5E.skills).map(([k,v])=>[k,v.ability])),expectedSkills);
for(const shape of ['absent','empty','partial','existing-partial']){
 const source=shape==='absent'?{}:shape==='empty'?{abilities:{},skills:{}}:shape==='partial'?{abilities:{wis:{value:14}},skills:{prc:{ability:'wis',value:1}}}:{abilities:{wis:{}},skills:{prc:{}}},before=structuredClone(source);
 const abilities=schema.abilities.initialize(schema.abilities.clean(source.abilities)),skills=schema.skills.initialize(schema.skills.clean(source.skills));
 assert.equal(Object.keys(abilities).length,8);assert.equal(Object.keys(skills).length,18);
 for(const key of ['str','dex','con','int','wis','cha']){assert.equal(abilities[key].value,key==='wis'&&shape==='partial'?14:10);assert.equal(abilities[key].proficient,0);}
 assert.equal(skills.prc.ability,shape==='existing-partial'?'dex':'wis');assert.equal(skills.prc.value,shape==='partial'?1:0);
 const Model=sandbox.numeric.CreatureTemplate,model=Object.assign(new Model(),{abilities,skills,tools:{},attributes:{prof:3,ac:{}},rolls:{ability:{}},bonuses:{spell:{}},parent:{flags:{dnd5e:{}},conditionRollReduction:0,coverBonus:0,getRollData:()=>({}),getFlag:()=>false,hasConditionEffect:()=>false,_isRemarkableAthlete:()=>false}});
 model.prepareAbilities();const perception=model.prepareSkill('prc',{rollData:{},originalSkills:{}});
 assert.equal(perception.total,shape==='partial'?5:0);assert.equal(perception.passive,shape==='partial'?15:10);
 assert.deepEqual(source,before);observations.push({shape,perception:{ability:perception.ability,total:perception.total,passive:perception.passive},abilities:Object.fromEntries(Object.entries(abilities).map(([key,value])=>[key,{value:value.value,proficient:value.proficient,mod:value.mod}]))});
}
const evidence={nativeCommit,observations,skillAbilities:expectedSkills,sourceHashes:Object.fromEntries([common,creature,mapping,'module/config.mjs','module/data/shared/roll-config-field.mjs'].map(p=>[p,sha256(files.get(p))])),limits:['Actual schema definitions,MappingField initialization/key builders,NumberField/StringField cleaners and native numeric preparation run. Schema collection delegation is a declared test shell,not Foundry DataModel/Document boot.','Native initializes8 ability keys;this batch qualifies the6 standard abilities for current public module controls. Honor/Sanity,custom registries and other optional rules remain outside the qualified profile.','Only absent/empty/valid partial records are admitted. Null/malformed container and explicit null/non-numeric scalar cleaning remain gated by the module;not claimed equivalent source profiles. No writes or native/operator acceptance.']};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');process.stdout.write('S:4 native source/default mapping profiles,6 standard/2 optional abilities,18 keyed skill defaults and prepared arithmetic PASS\n');

export const sourceFields606={NumberField:sandbox.sourceOracle.NumberField};
