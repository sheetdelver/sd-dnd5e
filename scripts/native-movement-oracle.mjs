import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';
const args=process.argv.slice(2),repo=option(args,'--native'),foundry=option(args,'--foundry');
if(!repo||!foundry)throw Error('Supply static --native release-6.0.6 and --foundry14.367 references');
const files=readRelease(repo),require=createRequire(join(coreRoot(args),'package.json')),ts=require('typescript');
const release=JSON.parse(readFileSync(join(foundry,'package.json'),'utf8')).release;assert.equal(release.generation,14);assert.equal(release.build,367);
const fieldsSource=readFileSync(join(foundry,'common/data/fields.mjs'),'utf8'),numberSource=readFileSync(join(foundry,'common/primitives/number.mjs'),'utf8');
const numberAst=ts.createSourceFile('number',numberSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),isNumeric=numberAst.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='isNumeric').getText(numberAst).replace(/^export /,'');
function member(source,cls,name){const ast=ts.createSourceFile(cls,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),node=ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===cls)?.members.find(n=>n.name?.getText(ast)===name);if(!node)throw Error('Missing '+cls+'.'+name);return node.getText(ast);}
const n=(path,cls,name)=>member(files.get(path),cls,name),f=(cls,name)=>member(fieldsSource,cls,name);
function declaration(name){const ast=ts.createSourceFile('utils',files.get('module/utils.mjs'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);return ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name).getText(ast).replace(/^export /,'');}
function registry(name){const ast=ts.createSourceFile('config',files.get('module/config.mjs'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);return ast.statements.find(n=>ts.isExpressionStatement(n)&&n.expression.left?.getText(ast)==='DND5E.'+name).expression.right.getText(ast);}
let metric=false;
const sandbox={structuredClone,game:{settings:{get:()=>metric}},CONFIG:{DND5E:{armorSpeedReduction:10,encumbrance:{speedReduction:{heavilyEncumbered:{},encumbered:{},exceedingCarryingCapacity:{}}},conditionTypes:{}}},
    foundry:{utils:{logCompatibilityWarning:()=>{throw Error('Unexpected legacy shim');}}},ConditionData:{hasLevels:()=>false},CreatureTypeField:class {initialize(value){return value;}},
    constant:raw=>{assert.match(String(raw),/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/);return Number(raw);},
    console:{error:()=>{throw Error('Unqualified native expression');}}};
vm.runInNewContext(`Number.isNumeric=${isNumeric};String.prototype.capitalize=function(){return this[0].toUpperCase()+this.slice(1);};
Array.prototype.filterJoin=function(separator){return this.filter(Boolean).join(separator);};Set.prototype.reduce=function(_fn,initial){if(this.size)throw Error('Conditions not qualified');return initial;};
class DataField {static #cleanDefaultTrue=[];constructor(options={}){Object.assign(this,this.constructor._defaults,options);} ${['_defaults','getInitialValue','clean','_validateSpecial','_cleanType','initialize'].map(m=>f('DataField',m)).join('\n')} }
class ScalarString extends DataField {${['_defaults','getInitialValue','_validateSpecial','_cast','clean'].map(m=>f('StringField',m)).join('\n')} }
class NumberField extends DataField {${f('NumberField','_defaults')} }
class LocalDocumentField extends ScalarString {constructor(){super({required:true,blank:false,nullable:true});this.model=Item;this.options={fallback:true};this.idOnly=false;}
${['_cast','_findCollection','initialize'].map(m=>n('module/data/fields/local-document-field.mjs','LocalDocumentField',m)).join('\n')} }
class Item {static metadata={collection:'items'};constructor(id,type,system){this._id=id;this.type=type;this.name='Same label';this.system=system;} }
class EmbeddedBase {prepareEmbeddedData(){}}
class Character extends EmbeddedBase {${n('module/data/actor/character.mjs','CharacterData','prepareEmbeddedData')} }
class AttributesFields {${['prepareRace','prepareMovement'].map(m=>n('module/data/actor/templates/attributes.mjs','AttributesFields',m)).join('\n')} }
class Roll {static create(value){return {isDeterministic:true,evaluateSync:()=>({total:constant(value)})};} }
${['simplifyBonus','_convertSystemUnits','convertLength','defaultUnits'].map(declaration).join('\n')}
CONFIG.DND5E.movementTypes=${registry('movementTypes')};CONFIG.DND5E.senses=${registry('senses')};CONFIG.DND5E.defaultUnits=${registry('defaultUnits')};CONFIG.DND5E.movementUnits=${registry('movementUnits')};
globalThis.native={Item,Character,AttributesFields,LocalDocumentField,ScalarString,NumberField,defaultUnits};`,sandbox);
const {ScalarString,NumberField,defaultUnits}=sandbox.native,scalarOptions=Object.freeze({migrate:false,sanitize:false}),literal=new ScalarString(),special=new ScalarString({required:true});
assert.equal(literal.clean(0,scalarOptions),'0');assert.equal(literal.clean(null,scalarOptions),undefined);assert.equal(literal.clean('',scalarOptions),'');
assert.match(files.get('module/data/shared/movement-field.mjs'),/min: 0, initial: 1, persisted: false/);
assert.match(files.get('module/data/shared/senses-field.mjs'),/nullable: true, integer: true, min: 0, initial: null/);
const keys=['walk','burrow','climb','fly','jump','swim'],senseKeys=['blindsight','darkvision','tremorsense','truesight'];
function movement(raw={},species=false){return {speeds:Object.fromEntries(keys.map(k=>[k,literal.clean(raw?.speeds?.[k],scalarOptions)])),bonus:literal.clean(raw?.bonus,scalarOptions),multiplier:1,hover:raw?.hover??false,special:literal.clean(raw?.special,scalarOptions),units:raw?.units??(species?defaultUnits('length'):null)};}
function senses(raw={},species=false){return {ranges:Object.fromEntries(senseKeys.map(k=>[k,raw?.ranges?.[k]??new NumberField({required:true,initial:null}).getInitialValue({})])),special:special.clean(raw?.special,scalarOptions),units:raw?.units??(species?defaultUnits('length'):null)};}
const fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/movement-senses.json'),'utf8'));assert.equal(fixture.nativeCommit,nativeCommit);
const observations=[];
for(const row of fixture.cases){
    const e=row.expected;if(!e.movement&&!e.senses)continue;
    const {Item,Character,AttributesFields,LocalDocumentField}=sandbox.native;metric=row.metric??false;
    const model=new Character(),items=new Map();
    for(const [index,raw] of [row.species,row.secondSpecies].entries())if(raw){const item=new Item('raceFixture000'+(index+1),'race',{movement:movement(raw.movement,true),senses:senses(raw.senses,true),type:{value:'humanoid'}});items.set(item._id,item);}
    const actor={getEmbeddedCollection:()=>items,statuses:{has:()=>false,reduce:(_fn,initial)=>initial},flags:{dnd5e:{}},hasConditionEffect:()=>false};
    Object.assign(model,{parent:actor,attributes:{movement:movement(typeof row.movement==='object'?row.movement:{}),senses:senses(typeof row.senses==='object'?row.senses:{}),ac:{...(row.armorStrength!==undefined?{equippedArmor:{system:{strength:row.armorStrength}}}:{})}},abilities:row.strength===null?{}:{str:{value:row.strength??10}},isCreature:true});
    model.details={race:new LocalDocumentField().initialize(row.raceRef??null,model)()};
    model._source={attributes:{movement:structuredClone(model.attributes.movement)}};
    // Compare independent domains only: native literal stub must never parse an
    // unqualified expression merely to obtain another domain's default facts.
    model.prepareEmbeddedData();if(row.strengthEffect!==undefined)model.abilities.str.value=row.strengthEffect;
    const observed={id:row.id,reference:typeof model.details.race==='object'?model.details.race?._id??null:model.details.race};
    if(e.movement){try{AttributesFields.prepareMovement.call(model,{});}catch(error){if(e.movement.jump!==null)throw error;assert.match(error.message,/Cannot read properties of undefined/);observed.incompleteMethodDiagnostic='Missing initialized STR throws after independent speed calculation; jump is not qualified';}const m=model.attributes.movement;for(const k of keys)if(k!=='jump'||e.movement.jump!==null)assert.equal(m.speeds[k],e.movement[k],row.id+'/'+k);for(const k of ['max','slowed','hover','units'])assert.equal(m[k],e.movement[k],row.id+'/'+k);if(e.movement.special!==undefined)assert.equal(m.special,e.movement.special);observed.movement={...m,speeds:{...m.speeds}};}
    if(e.senses){const s=model.attributes.senses;for(const k of senseKeys)assert.equal(s.ranges[k],e.senses[k],row.id+'/'+k);assert.equal(s.special,e.senses.special,row.id+'/special');assert.equal(s.units,e.senses.units,row.id+'/units');observed.senses=s;}
    observations.push(observed);
}
const fallbackModel={parent:{getEmbeddedCollection:()=>new Map([['raceFixture0001',new sandbox.native.Item('raceFixture0001','race',{})]])}};
const fallbackDiagnostic=new sandbox.native.LocalDocumentField().initialize('Missing species',fallbackModel)();assert.equal(fallbackDiagnostic,'Missing species');
// C23 source label/reference cases, separate from movement/rule preparation.
assert.match(files.get('module/data/actor/templates/details.mjs'),/race: new LocalDocumentField[\s\S]*?required: true, fallback: true/);
assert.match(f('DocumentIdField','_defaults'),/blank: false,[\s\S]*?nullable: true/);
const speciesFixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/species-identity.json'),'utf8'));
assert.equal(speciesFixture.nativeCommit,nativeCommit);
const speciesObservations=[];
for(const row of speciesFixture.cases.filter(row=>row.expected.status!=='unavailable')){
 const {Item,LocalDocumentField}=sandbox.native,items=new Map();
 for(const [id,name] of [['speciesFirst001',row.sameName?'Shared label':'First species'],['speciesSecond01',row.sameName?'Shared label':'Second species']]){const item=new Item(id,'race',{});item.name=name;items.set(id,item);}
 const model={parent:{getEmbeddedCollection:()=>items}},field=new LocalDocumentField();
 const cleaned=field.clean(row.omitRef?undefined:row.ref,scalarOptions),resolved=field.initialize(cleaned,model)();
 const observed={id:row.id,cleaned,resolvedId:typeof resolved==='object'?resolved?._id??null:null,display:resolved==null?'Species not selected':String(resolved)};
 assert.equal(observed.resolvedId,row.expected.id,row.id);assert.equal(observed.display,row.expected.display,row.id);
 speciesObservations.push(observed);
}
const evidence={speciesObservations,evidence:'S controlled exact source scalar cleaning/local reference/embedded inheritance/movement methods; no native DataModel/Documents/engine or operator acceptance',nativeCommit,foundry:{generation:14,build:367,fieldsSha256:sha256(fieldsSource),numberSha256:sha256(numberSource)},referenceFallbackDiagnostic:{requested:'Missing species',returned:fallbackDiagnostic,substitutedItem:false},scalarInitialization:{numericZero:'0',null:'undefined',blank:''},observations,
    stubs:['Primitive field option-merging constructor; exact scalar clean/default/cast methods with migration/sanitization disabled; no full schema validation','Native Character embedded base no-op, exact-ID Map collection and lightweight Item class; no native Documents','Constant-only simplifyBonus Roll stub; unknown expressions fail; condition-free Set.reduce','Native species raw scalar/defaults explicitly initialized; no Item effects/final phases','Strength effect case starts after separately qualified initial numeric phase16; missing initialized strength produces a separately recorded incomplete-method diagnostic; jump remains unqualified','Independent movement/senses domains compared separately when the other is unavailable'],
    sourceHashes:Object.fromEntries(['module/data/shared/movement-field.mjs','module/data/shared/senses-field.mjs','module/data/fields/local-document-field.mjs','module/data/fields/mapping-field.mjs','module/data/actor/character.mjs','module/data/actor/templates/attributes.mjs','module/data/actor/templates/details.mjs','module/data/item/race.mjs','module/utils.mjs','module/config.mjs'].map(p=>[p,sha256(files.get(p))]))};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');process.stdout.write(`S: ${speciesObservations.length} source species identity and ${observations.filter(o=>o.movement).length} movement / ${observations.filter(o=>o.senses).length} senses initialized comparisons PASS\n`);

// Test-only initialized native method collaborators;never imported by module runtime.
export const movementOracle606={box:sandbox,files,n};
