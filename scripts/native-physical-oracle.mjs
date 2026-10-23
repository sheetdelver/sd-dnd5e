import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {effectOracle606} from './native-effect-oracle.mjs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
import {moduleRoot,option} from './lib/toolchain.mjs';
const {files,n,sandbox}=effectOracle606,args=process.argv.slice(2),p='module/data/item/templates/physical-item.mjs',c='module/data/item/container.mjs',a='module/data/actor/templates/attributes.mjs',u='module/utils.mjs';
// Function extraction is read-only exact-release text. Only these explicit helpers
// and initialized embedded collection/model shells execute;no native runtime boot.
function fn(name){const text=files.get(u),start=text.indexOf((name.startsWith('_')?'function ':'export function ')+name+'(');assert.ok(start>=0);let end=text.indexOf('\n}',start)+2;return text.slice(start,end).replace(/^export /,'');}
const old={CONFIG:sandbox.CONFIG,game:sandbox.game,simplifyBonus:sandbox.simplifyBonus};
const config=JSON.parse(JSON.stringify(sandbox.CONFIG)),configText=files.get('module/config.mjs');
for(const key of ['weightUnits','encumbrance','actorSizes','currencies']){const start=configText.indexOf('DND5E.'+key+' = {');assert.ok(start>=0);const code=configText.slice(start,configText.indexOf('\n};',start)+3);vm.runInNewContext(code,{DND5E:config.DND5E});}
assert.match(files.get('module/settings.mjs'),/none: [^\n]+\n\s+normal: [^\n]+\n\s+variant:/);
const sizes=['tiny','sm','med','lg','huge','grg'];assert.deepEqual(Object.keys(config.DND5E.actorSizes),sizes);config.DND5E.actorSizes.orderedKeys=sizes;
let metric=false,currency=true;Object.assign(sandbox,{CONFIG:config,game:{settings:{get:(_,key)=>key==='metricWeightUnits'?metric:key==='currencyWeight'?currency:undefined}},simplifyBonus:raw=>Number(raw??0),_loc:key=>key});
const numberSource=readFileSync(join(option(args,'--foundry'),'common/primitives/number.mjs'),'utf8'),numberStart=numberSource.indexOf('export function toNearest('),numberCode=numberSource.slice(numberStart,numberSource.indexOf('\n}',numberStart)+2).replace(/^export /,'');
vm.runInNewContext(`${numberCode}\n${fn('roundCurrency')}\n${fn('convertWeight')}\n${fn('_convertSystemUnits')}
Number.prototype.toNearest=toNearest;Math.clamp=(v,a,b)=>Math.min(Math.max(v,a),b);
class Collection extends Map {reduce(f,initial){return [...this.values()].reduce(f,initial);}filter(f){return [...this.values()].filter(f);}}
foundry.utils.Collection=Collection;
class Physical {${n(p,'PhysicalItemTemplate','totalWeight')} ${n(p,'PhysicalItemTemplate','totalWeightIn')}}
class Container extends Physical {${['contents','allContainedItems','contentsCount','contentsWeight','totalWeight','computeCapacity'].map(key=>n(c,'ContainerData',key)).join('\n')}
${n('module/data/shared/currency.mjs','CurrencyTemplate','currencyWeight')}
#allContainedItems(){throw Error('compendium path not qualified');}#contentsWeight(){throw Error('compendium path not qualified');}}
class Currency {${n('module/data/shared/currency.mjs','CurrencyTemplate','prepareCurrency')}}
class Attributes {${n(a,'AttributesFields','prepareEncumbrance')}}
globalThis.physicalOracle={Physical,Container,Collection,Currency,Attributes,convertWeight};`,sandbox);
const {Physical,Container,Collection,Currency,Attributes,convertWeight}=sandbox.physicalOracle,rows=[];
for(const [id,metricMode,currencyMode,weightless,expected]of [['imperial',false,true,false,26],['no-coins',false,false,false,20.5],['metric',true,true,false,9.7],['weightless',false,true,true,13.5]]){metric=metricMode;currency=currencyMode;const actor={type:'character',flags:{dnd5e:{}},items:new Collection()},source=[['outer','container',null,1,2,'lb',50],['inner','container','outer',1,1,'kg',50],['cargo','loot','inner',2,5,'lb',0],['loose','loot',null,3,2,'lb',0]];
for(const [id,type,parent,quantity,value,units,coins]of source){const item={id,type,actor,isEmbedded:true},model=Object.assign(new(type==='container'?Container:Physical)(),{parent:item,container:parent,quantity,weight:{value,units},currency:{cp:coins},properties:new Set(id==='inner'&&weightless?['weightlessContents']:[]),capacity:{count:id==='outer'?5:0,weight:{value:20,units:'lb'}}});item.system=model;actor.items.set(id,item);Object.defineProperty(item,'container',{get:()=>actor.items.get(parent)});}
const system={parent:actor,attributes:{encumbrance:{bonuses:{},multipliers:{overall:'1',encumbered:'1',heavilyEncumbered:'1',maximum:'1'}}},abilities:{str:{value:10}},traits:{size:'med'},currency:{pp:0,gp:50.9,ep:0,sp:50,cp:0}};Currency.prototype.prepareCurrency.call(system);Attributes.prepareEncumbrance.call(system,{});assert.equal(system.attributes.encumbrance.value,expected,id);assert.equal(system.attributes.encumbrance.thresholds.maximum,metric?75:150);
const outer=actor.items.get('outer').system,inner=actor.items.get('inner').system;const capacities=[await outer.computeCapacity(),await inner.computeCapacity()];assert.equal(capacities[0].value,3);assert.equal(capacities[1].value,metric?4.5:currency?5:4);if(id==='imperial'){assert.equal(outer.totalWeight,18);assert.equal(inner.totalWeight,6);}
rows.push({id,actorWeight:system.attributes.encumbrance.value,outerWeight:outer.totalWeight,innerWeight:inner.totalWeight,capacities,thresholds:system.attributes.encumbrance.thresholds});}
const conversions=[];for(const from of ['lb','kg','tn','Mg'])for(const to of ['lb','kg','tn','Mg']){const expected=7*({lb:1,kg:2.5,tn:2000,Mg:2500}[from])/({lb:1,kg:2.5,tn:2000,Mg:2500}[to]);assert.equal(convertWeight(7,from,to),expected);conversions.push({from,to,value:expected});}
const thresholds=[];for(const [index,size]of sizes.entries())for(const powerfulBuild of [false,true]){const model={parent:{type:'character',flags:{dnd5e:{powerfulBuild}},items:new Collection()},traits:{size},abilities:{str:{value:10}},attributes:{encumbrance:{bonuses:{},multipliers:{overall:1,encumbered:1,heavilyEncumbered:1,maximum:1}}}};metric=false;currency=false;Attributes.prepareEncumbrance.call(model,{});const expected=150*[.5,1,1,2,4,8][Math.min(index+Number(powerfulBuild),5)];assert.equal(model.attributes.encumbrance.max,expected);thresholds.push({size,powerfulBuild,max:expected});}
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify({nativeCommit,rows,conversions,thresholds,foundryNumberSha256:sha256(numberSource),sourceHashes:Object.fromEntries([p,c,a,u,'module/data/shared/currency.mjs','module/config.mjs'].map(path=>[path,sha256(files.get(path))])),limits:['Actual native getters/capacity/encumbrance/currency methods on declared initialized embedded collection shells. Unit/size config constants are separately pinned-source assertions,not full DataModel/runtime acceptance.','Container currencyWeight is added in the container weight units as native implements,even when those differ from global metric setting. Capacity numeric weight uses contentsWeight in Item weight units while label comes from capacity units. These behaviors are preserved,not silently repaired.','No compendium transport,visibility/caller authority,auto status writes or native/operator acceptance.']},null,2)+'\n');Object.assign(sandbox,old);process.stdout.write('S:4 independent nested/coin/metric/weightless profiles/12 size thresholds and16 native conversions PASS\n');

export const physicalOracle606={sandbox,files,n,config,physical:sandbox.physicalOracle};
