import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { typecheckConfig, option } from './lib/toolchain.mjs';
import {selectRegressions} from './lib/test-selection.mjs';
import {readFileSync} from 'node:fs';

test('explicit typing includes nested UI, server, migrations and tests despite host exclusions', () => {
    const root = mkdtempSync(join(tmpdir(), 'dnd5e-type-fixture-'));
    try {
        const expected = ['src/ui/Sheet.tsx', 'src/server/routes/command.ts', 'src/tests/rules.test.ts', 'module/logic.ts', 'migrations/6.0.6/hooks.ts', 'tests/browser/interaction.tsx'];
        for (const path of expected) {
            mkdirSync(join(root, path, '..'), { recursive: true });
            writeFileSync(join(root, path), '');
        }
        const config = typecheckConfig('/read-only-core', root);
        assert.deepEqual(new Set(config.files), new Set(expected.map(path => join(root, path))));
        assert.deepEqual(config.include, []);
        assert.deepEqual(config.exclude, []);
        assert.equal(config.compilerOptions.incremental, false);
        assert.equal(config.compilerOptions.noEmit, true);
        assert.equal(config.extends, '/read-only-core/tsconfig.json');
    } finally { rmSync(root, { recursive: true, force: true }); }
});
test('a missing required oracle/toolchain argument fails rather than silently skipping', () => {
    assert.throws(() => option(['--native'], '--native'), /requires a value/);
});
test('smoke/affected/deep selection is explicit; CI tooling has only one invocation',()=>{
 const root='/module',all=['player-workflow','effect-metadata','presentation','skill-review','rules-context','command-journal','health'].map(n=>join(root,'src/tests',n+'.test.ts'));
 assert.equal(selectRegressions(root,all,[]).tooling,true);
 assert.equal(selectRegressions(root,all,['--smoke']).tests.length,6);
 assert.deepEqual(selectRegressions(root,all,['--test','src/tests/health.test.ts']).tests,[all.at(-1)]);
 assert.throws(()=>selectRegressions(root,all,['--test','../foreign.test.ts']),/not a maintained/);
 assert.throws(()=>selectRegressions(root,all,['--test']),/requires/);
 assert.throws(()=>selectRegressions(root,all,['--smoke','--test','src/tests/health.test.ts']),/Choose/);
 const workflow=readFileSync(new URL('../.github/workflows/ci-dnd5e.yaml',import.meta.url),'utf8');
 assert.doesNotMatch(workflow,/node --test .*scripts\/\*\.test\.mjs/);assert.equal((workflow.match(/scripts\/test\.mjs/g)??[]).length,1);
});
