import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { coreRoot, moduleRoot, option } from './lib/toolchain.mjs';
import { inventory, readRelease } from './lib/native-release.mjs';

const args = process.argv.slice(2);
const repo = option(args, '--native', process.env.DND5E_NATIVE_ROOT);
if (!repo) throw new Error('Exact oracle required: supply --native PATH (read-only checkout containing release-6.0.6)');
const actual = inventory(readRelease(repo), coreRoot(args));
const output = option(args, '--write-inventory');
if (output) writeFileSync(output, JSON.stringify(actual, null, 2) + '\n');
else assert.deepEqual(actual, JSON.parse(readFileSync(join(moduleRoot, 'tests/fixtures/native-6.0.6/source-inventory.json'), 'utf8')),
    'Native inventory changed; review exact-tag/schema differences before updating evidence');
process.stdout.write(`S: exact 6.0.6 inventory ${output ? 'written' : 'matches'}: ${actual.modernRecords} records, ${Object.keys(actual.formulas).length} candidate expressions; Q00 evaluation remains open\n`);
