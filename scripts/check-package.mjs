import { mkdtempSync, mkdirSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { coreRoot, moduleRoot } from './lib/toolchain.mjs';

const core = coreRoot();
const root = mkdtempSync(join(tmpdir(), 'dnd5e-package-'));
const data = join(root, 'data');
mkdirSync(join(data, 'local/modules'), { recursive: true });
symlinkSync(moduleRoot, join(data, 'local/modules/dnd5e'), 'dir');
// The host's managed aliases and module tsconfig resolve relative to this isolated root.
for (const name of ['src', 'node_modules', '.managed']) symlinkSync(join(core, name), join(root, name), 'dir');
process.stdout.write(`Isolated artifacts retained at ${root}\n`);
for (const script of ['check-module.ts', 'package-module.ts']) {
    const result = spawnSync(process.execPath, [join(core, 'node_modules/tsx/dist/cli.mjs'),
        join(core, 'src/scripts/tools/modules', script), 'dnd5e', '--data-dir', data], {
        cwd: core, stdio: 'inherit', env: { ...process.env, SHEET_DELVER_DATA: data },
    });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
}
