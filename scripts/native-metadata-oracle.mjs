import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {coreRoot,option} from './lib/toolchain.mjs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
import {nativeSymbols606} from './lib/native-symbols.mjs';
const args=process.argv.slice(2),foundry=option(args,'--foundry'),n=nativeSymbols606(coreRoot(args),option(args,'--native'));
const effect='module/documents/active-effect.mjs',item='module/documents/item.mjs',coreEffect=readFileSync(join(foundry,'client/documents/active-effect.mjs'),'utf8');
assert.match(n.native(item,'Item5e','_initializeSource'),/flags.dnd5e.persistSourceMigration/);
const lookups=[],get=(o,path)=>path.split('.').reduce((v,k)=>v?.[k],o),set=(o,path,value)=>{const p=path.split('.');let at=o;for(const k of p.slice(0,-1))at=at[k]??={};at[p.at(-1)]=value;};
const box={Item:class{},CONFIG:{statusEffects:[]},foundry:{abstract:{DataModel:class{}},utils:{setProperty:set}},dnd5e:{registry:{dependents:{get:()=>[]}}},fromUuidSync:uuid=>{lookups.push(uuid);assert.equal(uuid,undefined);return null;}};
vm.runInNewContext(`class SourceBase {_initializeSource(data){return data;}}
class CoreEffect extends SourceBase {${['active','isSuppressed','isTemporary'].map(k=>n.member(coreEffect,'ActiveEffect',k)).join('\n')}}
class NativeEffect extends CoreEffect {${['_initializeSource','dependentOrigin','isSuppressed','isTemporary','getDependents'].map(k=>n.native(effect,'ActiveEffect5e',k)).join('\n')}
 get isConcealed(){return false;}getFlag(scope,key){return this.flags[scope]?.[key];}}
class NativeItem {${n.native(item,'Item5e','dependentOrigin')}}
globalThis.model={NativeEffect,NativeItem};`,box);
const migration=new box.model.NativeEffect()._initializeSource({_id:'Migrated',type:'base',flags:{dnd5e:{type:'enchantment'}}});assert.equal(migration.type,'enchantment');assert.equal(migration.flags.dnd5e.persistSourceMigration,true);
const cases=[];
for(const flags of [{},{persistSourceMigration:true},{dependents:[]},{persistSourceMigration:true,dependents:[]}]){
 const document=Object.assign(new box.model.NativeEffect(),{parent:{},flags:{dnd5e:structuredClone(flags)},system:{magical:false},disabled:false,duration:{value:Infinity,expiry:null,expired:false}});
 assert.equal(document.active,true);assert.equal(document.isTemporary,false);assert.equal(document.dependentOrigin,null);assert.equal(document.getDependents().length,0);
 const owned=Object.assign(new box.model.NativeItem(),{flags:{dnd5e:structuredClone(flags)}});assert.equal(owned.dependentOrigin,null);cases.push({flags,active:true,temporary:false,dependency:null});
}
const temporary=Object.assign(new box.model.NativeEffect(),{flags:{dnd5e:{isTemporary:true}},duration:{value:Infinity,expiry:null}});assert.equal(temporary.isTemporary,true);
const dependency=Object.assign(new box.model.NativeEffect(),{parent:new box.Item(),flags:{dnd5e:{dependentOn:'ParentEffect'}},item:{areEffectsSuppressed:false,effects:new Map([['ParentEffect',{active:false}]])},system:{magical:false},disabled:false,duration:{expired:false}});assert.equal(dependency.isSuppressed,true);
assert.ok(lookups.every(v=>v===undefined),'Metadata does not request another document');
const evidence={nativeCommit,cases,controls:{migrationProducesMarker:true,temporaryFlagRemainsMechanical:true,inactiveIncomingDependencySuppresses:true},hashes:Object.fromEntries([...n.sources].map(([path,source])=>[path,sha256(source)])),limits:['Actual pinned migration/applicability/temporary/dependency getters and Foundry14.367 base getters,with explicit initialized permanent duration,unconcealed owner and empty dependent registry/UUID seam. No full DataModel/native/operator acceptance.','Only known bookkeeping and empty outgoing lists are qualified. Nonempty relationships,spell-level semantics,temporary and unknown mechanics remain separately restricted. No source flags are removed.']};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');process.stdout.write('Pinned native bookkeeping/applicability controls PASS;no unrelated oracle matrices executed\n');
