import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { coreRoot, typecheckConfig } from './lib/toolchain.mjs';

const core = coreRoot();
const config = typecheckConfig(core);
const temp = mkdtempSync(join(tmpdir(), 'dnd5e-types-'));
try {
    const path = join(temp, 'tsconfig.json');
    writeFileSync(path, JSON.stringify(config, null, 2));
    process.stdout.write(`Explicitly checking ${config.files.length} module source/UI/server/test/hook files\n`);
    const result = spawnSync(process.execPath, [join(core, 'node_modules/typescript/bin/tsc'), '-p', path], { cwd: core, stdio: 'inherit' });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
} finally { rmSync(temp, { recursive: true, force: true }); }
