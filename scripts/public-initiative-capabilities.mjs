import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import vm from 'node:vm';
import {coreRoot,option} from './lib/toolchain.mjs';
import {sha256} from './lib/native-release.mjs';
const args=process.argv.slice(2),core=coreRoot(args),require=createRequire(join(core,'package.json')),ts=require('typescript');
const version=JSON.parse(readFileSync(join(core,'package.json'),'utf8')).version;assert.equal(version,'0.19.3');
// Controlled source evidence about the released public hook's consumer, not a
// private runtime import or installed/public combat endpoint acceptance.
const path='src/server/services/combats/CombatInitiativeFormula.ts',source=readFileSync(join(core,path),'utf8');
const ast=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS),node=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='effectiveInitiativeFormula');assert.ok(node);
const javascript=ts.transpileModule(node.getText(ast).replace(/^export /,''),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const sandbox={BaseSystemAdapter:class {getInitiativeFormula(){return '';}}};
vm.runInNewContext(javascript+'\nglobalThis.probe=effectiveInitiativeFormula;',sandbox);
const normal=sandbox.probe({getInitiativeFormula:()=> '1d20+2'},{},null),bounded=sandbox.probe({getInitiativeFormula:()=> '1d20min10+2'},{},null),gated=sandbox.probe({getInitiativeFormula:()=>{throw Error('Use sheet Normal');}},{},null);
assert.equal(normal.rollAvailable,true);assert.equal(normal.advantageAvailable,true);
assert.equal(bounded.rollAvailable,true);assert.equal(bounded.advantageAvailable,true);
assert.equal(gated.source,'module');assert.equal(gated.rollAvailable,false);assert.equal(gated.advantageAvailable,false);assert.equal(gated.formula,'');
const evidence={evidence:'S controlled released Core public initiative-hook consumer; no private runtime imports or installed/public combat endpoint acceptance',coreVersion:version,coreCommit:execFileSync('git',['-C',core,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),source:path,sha256:sha256(source),observations:{normal,bounded,gated},limits:['Base adapter identity stub; GM override branch not evaluated or modified','Existing public string hook cannot declare Normal-only modes; no Core defect/extension justified solely by bounded tied-index differences','Module gates its HUD hook while qualified character-sheet/direct Normal remains available']};
const out=option(args,'--write-evidence');if(out)writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');process.stdout.write('S: public formula-only initiative hook cannot express Normal-only bounds; explicit module gate avoids fallback PASS\n');
