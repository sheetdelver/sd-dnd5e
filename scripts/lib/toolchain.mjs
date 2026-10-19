import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';

export const moduleRoot = fileURLToPath(new URL('../../', import.meta.url));
export function option(args, name, fallback) {
    const index = args.indexOf(name);
    if (index < 0) return fallback;
    if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${name} requires a value`);
    return resolve(args[index + 1]);
}
export function coreRoot(args = process.argv.slice(2)) {
    const root = option(args, '--core', process.env.DND5E_CORE_ROOT || resolve(moduleRoot, '../../../..'));
    for (const path of ['tsconfig.json', 'node_modules/typescript/bin/tsc', 'node_modules/tsx/dist/cli.mjs']) {
        if (!existsSync(join(root, path))) throw new Error(`Missing Core toolchain ${join(root, path)}; supply --core PATH`);
    }
    return root;
}
export function walk(root, predicate) {
    if (!existsSync(root)) return [];
    return readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))
        .flatMap(entry => entry.isDirectory() ? walk(join(root, entry.name), predicate)
            : entry.isFile() && predicate(entry.name) ? [join(root, entry.name)] : []);
}
export function moduleTypeFiles(root = moduleRoot) {
    return ['src', 'module', 'migrations', 'tests/browser'].flatMap(dir => walk(join(root, dir), name => /\.(?:ts|tsx|mts)$/.test(name)));
}
export function typecheckConfig(core, root = moduleRoot) {
    const files = moduleTypeFiles(root);
    if (!files.length) throw new Error('No module TypeScript files found');
    return {
        extends: join(core, 'tsconfig.json'),
        compilerOptions: { noEmit: true, incremental: false, typeRoots: [join(core, 'node_modules/@types')] },
        files, include: [], exclude: [],
    };
}
export function json(path) { return JSON.parse(readFileSync(path, 'utf8')); }
