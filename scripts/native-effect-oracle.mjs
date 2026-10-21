import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {coreRoot,moduleRoot,option} from './lib/toolchain.mjs';
import {readRelease,nativeCommit,sha256} from './lib/native-release.mjs';
const args=process.argv.slice(2),repo=option(args,'--native'),foundry=option(args,'--foundry');
if(!repo||!foundry)throw new Error('Supply static --native and --foundry source references; no service is started');
const files=readRelease(repo),release=JSON.parse(readFileSync(join(foundry,'package.json'),'utf8')).release;
assert.equal(release.generation,14);assert.equal(release.build,367);
const require=createRequire(join(coreRoot(args),'package.json')),ts=require('typescript');
const paths=['client/documents/actor.mjs','client/documents/active-effect.mjs','common/data/active-effect.mjs','common/data/fields.mjs','common/constants.mjs'];
const core=new Map(paths.map(path=>[path,readFileSync(join(foundry,path),'utf8')]));
function member(text,name,method){const ast=ts.createSourceFile(name,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);const cls=ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===name);const m=cls?.members.find(n=>(ts.isMethodDeclaration(n)||ts.isGetAccessor(n))&&n.name?.getText(ast)===method);if(!m)throw new Error('Missing '+name+'.'+method);return m.getText(ast);}
const f=(path,name,method)=>member(core.get(path),name,method),n=(path,name,method)=>member(files.get(path),name,method);
const trace=[];const get=(obj,path)=>path.split('.').reduce((v,k)=>v?.[k],obj);
const sandbox={trace,Function,Item:class {},dnd5e:{settings:{tokenSizeSync:false}},Hooks:{onError:(_name,error)=>{throw error;}},
foundry:{documents:{},utils:{deepClone:structuredClone,isPlainObject:value=>!!value&&Object.getPrototypeOf(value)===Object.prototype,expandObject:()=>({}),mergeObject:(a,b)=>Object.assign(a,b),getProperty:get}}};
vm.runInNewContext(`
class FEffect {${['active','isSuppressed','shouldApplyChange'].map(m=>f('client/documents/active-effect.mjs','ActiveEffect',m)).join('\n')}
getReplacementData(){return {};}
static _shimChanges(){} static applyChange(actor,change){trace.push(change.key);return {};}
}
FEffect.CHANGE_PHASES={initial:{},final:{}};
class NEffect extends FEffect {${n('module/documents/active-effect.mjs','ActiveEffect5e','isSuppressed')}
${n('module/documents/active-effect.mjs','ActiveEffect5e','applicableType')} }
class NItem {${n('module/documents/item.mjs','Item5e','areEffectsSuppressed')}
get isHidden(){return false;} }
class FActor {${['allApplicableEffects','applyActiveEffects'].map(m=>f('client/documents/actor.mjs','Actor',m)).join('\n')}
getRollData(){return {};}}
class NActor extends FActor {${['allApplicableEffects','applyActiveEffects'].map(m=>n('module/documents/actor/actor.mjs','Actor5e',m)).join('\n')} }
globalThis.classes={NActor,NEffect,NItem};foundry.documents.ActiveEffect={implementation:FEffect};`,sandbox);
const {NActor,NEffect,NItem}=sandbox.classes;
const fixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/effect-phases.json'),'utf8'));assert.equal(fixture.nativeCommit,nativeCommit);
const priorities={custom:0,multiply:10,add:20,subtract:20,downgrade:30,upgrade:40,override:50};
for(const [key,value] of Object.entries(priorities))assert.match(core.get('common/constants.mjs'),new RegExp('\\b'+key+': '+value+'\\b'));
assert.match(core.get('common/data/active-effect.mjs'),/initial: "initial"/);assert.match(core.get('common/data/active-effect.mjs'),/initial: "add"/);
const observations=[];
for(const row of fixture.cases.filter(row=>['no-op-actor','disabled-unknown','unequipped-transfer','actor-initial-final','stable-priorities'].includes(row.id))){
 trace.length=0;
 const actor=new NActor();actor.system={isCreature:false,prepareEmbeddedData:()=>trace.push('embedded')};actor.statuses=new Set();actor._completedActiveEffectPhases=new Set();actor.overrides={};actor.tokenActiveEffectChanges={};actor._prepareSpellcasting=()=>trace.push('spellcasting');
 const make=(data,item)=>{const effect=new NEffect();effect.type=data.type??'base';effect.disabled=data.disabled??false;effect.transfer=data.transfer??true;effect.actor=actor;effect.item=item;effect.duration={expired:false};effect.statuses=new Set(data.statuses??[]);effect.system={magical:false,applicableType:'Actor',changes:(data.system?.changes??[]).map(change=>({...change,type:change.type??'add',phase:change.phase??'initial',priority:change.priority??priorities[change.type??'add']}))};return effect;};
 actor.effects=row.effects.map(data=>make(data));actor.items=row.items.map(data=>{const item=new NItem();Object.assign(item,{type:data.type,system:structuredClone(data.system),parent:actor,prepareFinalAttributes:()=>trace.push('item-final')});item.effects=data.effects.map(effect=>make(effect,item));return item;});
 actor.applyActiveEffects('initial');const initial=trace.splice(0);actor.applyActiveEffects('final');const final=trace.splice(0);
 assert.deepEqual(initial,['embedded',...(row.expected.initial??[])]);assert.deepEqual(final,[...row.items.map(()=> 'item-final'),'spellcasting',...(row.expected.final??[])]);
 observations.push({id:row.id,initial,final});
}
const evidence={evidence:'S controlled static Foundry14.367 / exact native6.0.6 phase methods; not native Documents/operator acceptance',nativeCommit,foundry:release,observations,priorities,foundrySources:Object.fromEntries([...core].map(([path,source])=>[path,sha256(source)])),stubs:['Explicit initialized effect defaults; no Foundry DataModel initialization','Untimed empty-condition effects only','Empty roll data; hidden/dependent/rider/antimagic absent','Change application captures order only, no field arithmetic; no hooks/token-size/spellcasting/Item derivation']};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');process.stdout.write(`S: effect eligibility/phase capture ${observations.length} PASS\n`);
