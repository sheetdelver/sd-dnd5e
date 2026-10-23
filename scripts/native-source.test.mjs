import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { moduleRoot } from './lib/toolchain.mjs';
import { readRelease, sha256, settingInventory } from './lib/native-release.mjs';

const fixtures = join(moduleRoot, 'tests/fixtures/native-6.0.6');
test('versioned fixture provenance pins separate source/expected/inventory bytes', () => {
    const index = JSON.parse(readFileSync(join(fixtures, 'index.json'), 'utf8'));
    assert.equal(index.evidenceClass, 'S');
    assert.equal(index.native.observedBuild, null);
    for (const [file, hash] of Object.entries(index.files)) assert.equal(sha256(readFileSync(join(fixtures, file))), hash, file);
    const expected = JSON.parse(readFileSync(join(fixtures, 'expected.json'), 'utf8'));
    assert.equal(expected.nativePrepared, null);
    assert.equal(expected.skill.total, 5);
});
test('oracle runner fails on missing oracle and wrong tag instead of reporting parity', () => {
    const result = spawnSync(process.execPath, [join(moduleRoot, 'scripts/native-source.mjs')], { env: { ...process.env, DND5E_NATIVE_ROOT: '' }, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Exact oracle required/);
    const repo = mkdtempSync(join(tmpdir(), 'dnd5e-wrong-oracle-'));
    try {
        execFileSync('git', ['init', '-q', repo]);
        execFileSync('git', ['-C', repo, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--allow-empty', '-qm', 'wrong oracle']);
        execFileSync('git', ['-C', repo, 'tag', 'release-6.0.6']);
        assert.throws(() => readRelease(repo), /Wrong native oracle/);
    } finally { rmSync(repo, { recursive: true, force: true }); }
});
test('native registration extraction parses defaults without executing source', () => {
    const require = createRequire(join(process.cwd(), 'package.json'));
    const ts = require('typescript');
    const result = settingInventory('throw new Error("must not execute"); game.settings.register("dnd5e", "rulesVersion", { scope: "world", type: String, default: "modern", choices: { modern: "label", legacy: "label" } });', ts);
    assert.deepEqual(result['dnd5e.rulesVersion'], { scope: 'world', type: 'String', default: 'modern', choices: ['modern', 'legacy'] });
});
