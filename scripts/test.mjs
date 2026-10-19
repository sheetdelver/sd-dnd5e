import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { coreRoot, moduleRoot, walk } from './lib/toolchain.mjs';

const core = coreRoot();
const suites = walk(join(moduleRoot, 'scripts'), name => name.endsWith('.test.mjs'));
const regressions = walk(join(moduleRoot, 'src/tests'), name => /\.test\.tsx?$/.test(name));
if (!suites.length || !regressions.length) throw new Error('Required test collection is empty');
function run(args) {
    const result = spawnSync(process.execPath, args, { cwd: core, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
}
run(['--test', ...suites]);
for (const path of regressions) run([join(core, 'node_modules/tsx/dist/cli.mjs'), '--tsconfig', join(core, 'tsconfig.json'), path]);
process.stdout.write(`R: ${suites.length} tooling suites and ${regressions.length} module suites passed (no native acceptance claimed)\n`);
