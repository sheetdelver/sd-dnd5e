import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { coreRoot, moduleRoot, walk } from './lib/toolchain.mjs';
import {selectRegressions} from './lib/test-selection.mjs';

const core = coreRoot();
const suites = walk(join(moduleRoot, 'scripts'), name => name.endsWith('.test.mjs'));
const regressions = walk(join(moduleRoot, 'src/tests'), name => /\.test\.tsx?$/.test(name));
const selection=selectRegressions(moduleRoot,regressions,process.argv.slice(2));
if (!suites.length || !regressions.length) throw new Error('Required test collection is empty');
if(process.argv.includes('--list')){process.stdout.write(JSON.stringify({...selection,tests:selection.paths},null,2)+'\n');process.exit(0);}
function run(args) {
    const result = spawnSync(process.execPath, args, { cwd: core, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
}
if(selection.tooling)run(['--test', ...suites]);
for (const path of selection.tests) run([join(core, 'node_modules/tsx/dist/cli.mjs'), '--tsconfig', join(core, 'tsconfig.json'), path]);
process.stdout.write(`R (${selection.layer}): ${selection.tooling?suites.length:0} tooling suites and ${selection.tests.length} module suites passed (no native acceptance claimed)\n`);
