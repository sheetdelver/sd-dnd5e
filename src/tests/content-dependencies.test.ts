import assert from 'node:assert/strict';
import { requiredGrantClosure } from '../logic/content/dependencies';

const a = 'Compendium.custom.srd.Item.first', b = 'Compendium.custom.srd.Item.second';
const item = (id: string, grants: unknown[]) => ({ _id: id, name: 'Same label', type: 'feat', system: {
    source: { rules: '2024' }, advancement: { grant: { _id: 'grant', type: 'ItemGrant', configuration: { items: grants } } },
} });
const sources = new Map<string, unknown>([[a, item('first', [{ uuid: b, optional: false }])], [b, item('second', [])]]);
const before = structuredClone([...sources]);
assert.deepEqual(requiredGrantClosure([a], sources).ordered, [b, a]);
assert.deepEqual([...sources], before);
const absent = requiredGrantClosure([a], new Map([[a, sources.get(a)]]));
assert.equal(absent.status, 'unavailable');
assert.deepEqual(absent.diagnostics, [{ uuid: b, reason: 'required-source-unavailable' }]);
sources.set(b, item('second', [{ uuid: a, optional: false }]));
assert.ok(requiredGrantClosure([a], sources).diagnostics.some(d => d.reason === 'cyclic-required-grant'));
sources.set(b, item('second', [{ uuid: 'Compendium.missing.book.Item.optional', optional: true }]));
assert.equal(requiredGrantClosure([a], sources).status, 'ready');
assert.equal(requiredGrantClosure([a], sources, 1).status, 'unavailable');
sources.set(b, item('wrongCopy', []));
assert.equal(requiredGrantClosure([a], sources).status, 'unavailable');
console.log('R/S: exact fixed-grant closure/missing/cycle/source preservation: PASS (bounded schema)');
