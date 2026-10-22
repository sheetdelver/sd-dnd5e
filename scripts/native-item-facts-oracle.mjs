import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import {effectOracle606} from './native-effect-oracle.mjs';
import {StringField} from './native-traits-oracle.mjs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
const {files,n,sandbox}=effectOracle606,args=process.argv.slice(2),foundry=option(args,'--foundry'),ts=createRequire(join(coreRoot(args),'package.json'))('typescript');
const method=(text,name)=>{const ast=ts.createSourceFile('native',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);const node=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);assert.ok(node,name);return node.getText(ast).replace(/^export /,'');};
const math=readFileSync(join(foundry,'common/primitives/math.mjs'),'utf8'),sets=readFileSync(join(foundry,'common/primitives/set.mjs'),'utf8');
const usePath='module/data/shared/uses-field.mjs',weaponPath='module/data/item/weapon.mjs',attackPath='module/data/activity/attack-data.mjs';
Object.assign(sandbox,{game:{i18n:{getListFormatter:()=>new Intl.ListFormat('en',{style:'narrow'})}},_loc:key=>key,formatNumber:value=>String(value),formatRange:(a,b)=>a+'–'+b,prepareFormulaValue:undefined,replaceFormulaData:value=>{assert.match(String(value),/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/);return value;},Roll:class{constructor(formula){assert.match(String(formula),/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/);this.total=Number(formula);}evaluateSync(){return this;}}});
sandbox.CONFIG.DND5E.limitedUsePeriods=Object.fromEntries(['lr','sr','day','dawn','dusk','initiative','turnStart','turnEnd','turn'].map(key=>[key,{label:key,abbreviation:key,...(key.startsWith('turn')?{type:'combat'}:key==='initiative'?{type:'special'}:{})}]));
sandbox.CONFIG.DND5E.defaultAbilities={meleeAttack:'str',rangedAttack:'dex'};sandbox.CONFIG.DND5E.weaponTypeMap={simpleM:'melee',simpleR:'ranged',martialM:'melee',martialR:'ranged',siege:'ranged'};sandbox.CONFIG.DND5E.weaponProficienciesMap={simpleM:'sim',simpleR:'sim',martialM:'mar',martialR:'mar'};sandbox.CONFIG.DND5E.attackModes=Object.fromEntries(['oneHanded','twoHanded','offhand','thrown','thrown-offhand','ranged'].map(key=>[key,{label:key}]));
vm.runInNewContext(`
Math.clamp=${method(math,'clamp')};Set.prototype.first=${method(sets,'first')};Set.prototype.reduce=${method(sets,'reduce')};
${method(files.get('module/utils.mjs'),'prepareFormulaValue')}
class UsesField {${['prepareData','getStatblockLabel','rechargeOptions'].map(key=>n(usePath,'UsesField',key)).join('\n')}static rollRecharge(){throw Error('Recovery not executed');}}
Array.fromRange=(n,start=0)=>Array.from({length:n},(_,i)=>i+start);
class ContainerSource {${n('module/data/item/container.mjs','ContainerData','#migrateQuantity')} static initialize(source){this.#migrateQuantity(source);return source;}}
class ResourceModel {${n('module/data/item/templates/activities.mjs','ActivitiesTemplate','hasLimitedUses')}}
class Weapon {${['attackModes','attackType','availableAbilities','_typeAbilityMod','isVersatile','proficiencyMultiplier'].map(key=>n(weaponPath,'WeaponData',key)).join('\n')}
${n('module/data/item/templates/equippable-item.mjs','EquippableItemTemplate','magicAvailable')}
}
class Attack {${['ability','availableAbilities','actionType','getAttackData'].map(key=>n(attackPath,'BaseAttackActivityData',key)).join('\n')}
${n('module/data/activity/base-activity.mjs','BaseActivityData','getActionType')}
getRollData(){const ability=this.ability;return {mod:ability?this.actor.system.abilities[ability].mod:0,roll:{ability}};}}
globalThis.itemFactsOracle={ContainerSource,UsesField,ResourceModel,Weapon,Attack,makeSet:value=>new Set(value)};`,sandbox);
const {UsesField,ResourceModel,Weapon,Attack,makeSet}=sandbox.itemFactsOracle,fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/item-resources.json'),'utf8'));
assert.equal(fixture.nativeCommit,nativeCommit);
const containerInitialization=[];for(const quantity of [undefined,null,0,1,2,'2',{}]){const source=quantity===undefined?{}:{quantity},copy=structuredClone(source);const initialized=sandbox.itemFactsOracle.ContainerSource.initialize(copy);assert.equal(initialized.quantity,1);containerInitialization.push({source,quantity:initialized.quantity});}
const observations=[];
for(const row of fixture.cases){const before=structuredClone(row),sourceMax=new StringField().clean(row.source.max,{migrate:false,sanitize:false});const model=Object.assign(new ResourceModel(),{uses:{max:sourceMax,spent:row.source.spent,recovery:(row.source.recovery??[]).map(r=>({period:r.period??'lr',type:r.type??'recoverAll',formula:r.formula}))},_source:{uses:{max:sourceMax}},parent:{}}),labels={};
 UsesField.prepareData.call(model,{},labels);const e=row.expected;
 assert.equal(Number(model.uses.max??0),e.max,row.id);assert.equal(model.uses.value,e.remaining,row.id);assert.equal(model.hasLimitedUses,e.limited,row.id);assert.equal(model.uses.spent,e.spent,row.id);
 if(e.period){assert.equal(model.uses.recovery[0].period,e.period);assert.equal(model.uses.recovery[0].type,'recoverAll');assert.equal(model.uses.recovery[0].formula,e.period==='recharge'?'6':undefined);}
 assert.deepEqual(row,before);observations.push({id:row.id,max:model.uses.max??null,remaining:model.uses.value,limited:model.hasLimitedUses,recovery:model.uses.recovery,labels});
}
sandbox.CONFIG.Dice.BasicRoll={constructParts:sandbox.numeric.NativeParts.constructParts};
const attacks=[];
for(const [id,proficient,properties,training,expected,ability]of [['explicit-zero',0,['fin','lgt','thr','mgc'],['mar'],6,'dex'],['explicit-one',1,['fin','lgt','thr','mgc'],[],9,'dex'],['trained',null,['fin','lgt','thr','mgc'],['mar'],9,'dex'],['base-item',null,['fin','lgt','thr','mgc'],['rapier'],9,'dex'],['untrained',null,['fin','lgt','thr','mgc'],[],6,'dex'],['melee',0,['mgc'],[],5,'str']]){
 const actor={system:{isNPC:false,attributes:{prof:3},abilities:{str:{mod:3,attack:{roll:{}}},dex:{mod:4,attack:{roll:{}}}},traits:{weaponProf:{value:makeSet(training)}},rolls:{attack:{}}},getFlag:()=>undefined,items:{get:()=>undefined},addConditionRollReduction:()=>{}};
 const weapon=Object.assign(new Weapon(),{parent:{actor},type:{value:'martialM',baseItem:'rapier'},properties:makeSet(properties),range:{value:null,reach:5},proficient,attunement:'',attuned:false,magicalBonus:1,validProperties:makeSet(['mgc'])});
 weapon.prof={term:weapon.proficiencyMultiplier*3};
 const activity=Object.assign(new Attack(),{actor,item:{type:'weapon',system:weapon},attack:{ability:'',abilities:makeSet(Array.from(weapon.availableAbilities)),type:{value:'melee',classification:'weapon'},bonus:'1',flat:false}});
 const result=activity.getAttackData(),total=result.parts.reduce((sum,part)=>{const value=part.startsWith('@')?sandbox.foundry.utils.getProperty(result.data,part.slice(1)):part;assert.match(String(value),/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/);return sum+Number(value);},0);
 assert.equal(activity.ability,ability,id);assert.equal(total,expected,id);const modes=Array.from(weapon.attackModes).filter(m=>m.value).map(m=>m.value);assert.deepEqual(modes,properties.includes('lgt')?['oneHanded','offhand','thrown','thrown-offhand']:['oneHanded']);attacks.push({id,total,ability,proficiency:weapon.proficiencyMultiplier,modes,parts:Array.from(result.parts),data:result.data});
}
const paths=[usePath,weaponPath,attackPath,'module/data/item/container.mjs','module/data/item/templates/physical-item.mjs','module/data/item/templates/activities.mjs','module/data/activity/base-activity.mjs','module/data/item/templates/equippable-item.mjs'];
const evidence={nativeCommit,containerInitialization,resourceCases:observations.length,observations,attacks,sourceHashes:Object.fromEntries(paths.map(path=>[path,sha256(files.get(path))])),fixtureSha256:sha256(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/item-resources.json'))),limits:['Actual UsesField/hasLimitedUses/StringField and static Foundry clamp execute on initialized scalar/collection shells. Numeric-literal-only Roll collaborator is explicit;no dice engine or expression support follows.','Actual native weapon proficiency/modes/abilities,AttackData.getAttackData and existing native D20 scope/BasicRoll construction execute on prepared modifier3/4/proficiency3 shells;initial source schema/defaults are separate. No complete Item/Actor/activity lifecycle or action execution/native acceptance.','Recovery is read preparation only;localized labels are test key values/Intl formatter,not localization parity. No recharge/rest/consumption writes.']};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');process.stdout.write('S: '+observations.length+' Item resource/default/recovery and '+attacks.length+' independent attack/mode/proficiency cases PASS\n');
