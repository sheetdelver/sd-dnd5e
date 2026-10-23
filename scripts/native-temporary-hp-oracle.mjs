import assert from 'node:assert/strict';
import vm from 'node:vm';
import {writeFileSync} from 'node:fs';
import {coreRoot,option} from './lib/toolchain.mjs';
import {nativeSymbols606} from './lib/native-symbols.mjs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
const args=process.argv.slice(2),n=nativeSymbols606(coreRoot(args),option(args,'--native'));
const schema=n.native('module/data/actor/templates/attributes.mjs','AttributesFields','hitPoints'),apply=n.native('module/documents/actor/actor.mjs','Actor5e','applyTempHP');
class Field{constructor(options){this.options=options;}}
const box={NumberField:Field};vm.runInNewContext(`class Schema {${schema}}class Actor{${apply}};globalThis.test={Schema,Actor};`,box);
const field=JSON.parse(JSON.stringify(box.test.Schema.hitPoints.temp.options));assert.equal(field.initial,0);assert.equal(field.integer,true);assert.equal(field.min,0);assert.notEqual(field.persisted,false);
const updates=[],actor=Object.assign(new box.test.Actor(),{system:{attributes:{hp:{temp:3}}},update:async patch=>{updates.push(JSON.parse(JSON.stringify(patch)));return actor;}});
await actor.applyTempHP(8);assert.deepEqual(updates,[{'system.attributes.hp.temp':8}]);await actor.applyTempHP(2);assert.equal(updates.length,1);
const evidence={nativeCommit,schema:field,grantControls:{aboveCurrent:8,dispatches:1,lowerThanCurrent:2,additionalDispatches:0},hashes:Object.fromEntries([...n.sources].map(([path,text])=>[path,sha256(text)])),limits:['Pinned schema getter and applyTempHP method with an explicit update-recording seam;not DataModel/native/operator acceptance.','The module operation is manual replacement of the persisted field,including clearing. It deliberately does not claim native applyTempHP grant semantics,damage,healing,concentration or activity consumption. Effect-dependent temp HP is gated.']};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');process.stdout.write('Pinned temporary HP persisted schema and independent grant/replacement distinction PASS\n');
