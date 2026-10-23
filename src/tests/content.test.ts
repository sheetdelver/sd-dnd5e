import assert from 'node:assert/strict';
import { SdkError, type ModuleWorldSnapshot, type WorldSettingResult } from '@sheet-delver/sdk';
import type { ModuleServerRequest } from '@sheet-delver/sdk/server';
import { callerCatalog, callerItemDetail, type CallerContentRuntime } from '../server/content/catalog';
import { contentRoutes } from '../server/routes/content';
import { DnD5eAdapter } from '../logic/adapter';
import info from '../../info.json';

type MutableWorld = { identity: { -readonly [K in keyof ModuleWorldSnapshot['identity']]: ModuleWorldSnapshot['identity'][K] }; settings: Record<string, WorldSettingResult> };
function world(): MutableWorld {
    return { identity: { instanceId: 'offline', worldId: 'fixture', systemId: 'dnd5e', systemVersion: '6.0.6', foundryGeneration: 14,
        foundryBuild: '367', runtimeEpoch: 1, contextRevision: 7 }, settings: Object.fromEntries(info.worldSettings.map(row => [row.key,
            { status: 'world', value: row.key === 'dnd5e.calendarConfig' ? { enabled: false, dailyRecovery: '' } : structuredClone(row.default?.value) }])) };
}
const item = (id: string, pack: string, rules = '2024') => ({ _id: id, uuid: `Compendium.${pack}.Item.${id}`, name: 'Same name', type: 'spell',
    system: { source: { rules, book: 'Synthetic', license: 'synthetic' }, description: { value: 'SECRET HTML', chat: 'SECRET CHAT' }, activities: {} },
    flags: { secret: 'SECRET FLAGS' }, ownership: { default: 0, secretUser: 3 } });
const modern = item('firstCopy', 'dnd5e.spells24'), legacy = item('secondCopy', 'dnd5e.spells24', '2014');
const denied = item('deniedCopy', 'secret.book'), dynamic = item('optionalCopy', 'unfamiliar.homebrew');
let snapshot = world(), revoked = false, reads = 0;
const runtime: CallerContentRuntime = {
    world: { snapshot: () => snapshot, settings: { get: key => snapshot.settings[key] }, assertRevision: revision => {
        if (revision !== snapshot.identity.contextRevision) throw new SdkError('conflict', 'stale');
    } },
    access: { canReadPack: id => !revoked && ['dnd5e.spells24', 'unfamiliar.homebrew'].includes(id),
        packs: () => [{ id: 'dnd5e.spells24', label: 'SRD', type: 'Item' }, { id: 'unfamiliar.homebrew', label: 'Custom', type: 'Item' }] },
    compendium: { findAll: async () => { reads++; return [modern, legacy, denied, dynamic]; },
        findOne: async () => null, getById: async (_type, uuid) => { reads++; return [modern, legacy, denied, dynamic].find(row => row.uuid === uuid) ?? null; } },
    documents: { list: async (_type, _query, opts) => { assert.equal(opts?.minOwnership, 'observer'); return { rows: [], total: 0 }; },
        get: async (_type, id, opts) => { assert.equal(opts?.minOwnership, 'observer'); return { ...modern, _id: id, uuid: `Item.${id}` }; },
        fetchByUuid: async (uuid, opts) => { assert.equal(opts?.minOwnership, 'observer'); return { ...modern, _id: uuid.split('.').at(-1), uuid,
            _stats: { compendiumSource: 'Compendium.removed.book.Item.oldCopy' } }; } },
};
const catalog = await callerCatalog(runtime);
assert.deepEqual(catalog.catalog.rows.map(row => row.id), ['firstCopy', 'secondCopy']);
assert.deepEqual(catalog.catalog.rows.map(row => row.edition), ['2024', '2014']);
assert.equal(catalog.packs.find(pack => pack.id === 'unfamiliar.homebrew')?.availability, 'external-dependency-E01');
assert.doesNotMatch(JSON.stringify(catalog), /SECRET|deniedCopy|secretUser|secret.book|optionalCopy/);
const detail = await callerItemDetail(runtime, modern.uuid);
assert.equal(detail.item.uuid, modern.uuid);
assert.equal(detail.item.description.status, 'unavailable');
assert.doesNotMatch(JSON.stringify(detail), /SECRET|ownership|secretUser/);
const before = reads;
await assert.rejects(callerItemDetail(runtime, dynamic.uuid), /E01/);
await assert.rejects(callerItemDetail(runtime, denied.uuid), /unavailable/);
assert.equal(reads, before);
await assert.rejects(callerItemDetail(runtime, 'Same name'), /Canonical Item UUID/);
await assert.rejects(callerCatalog(runtime, { pageSize: 101 }), /Invalid content page/);
snapshot.settings['dnd5e.packSourceConfiguration'] = { status: 'world', value: { 'dnd5e.spells24': false } };
assert.equal((await callerCatalog(runtime)).catalog.rows.length, 0);
await assert.rejects(callerItemDetail(runtime, modern.uuid), /excluded/);
const owned = await callerItemDetail(runtime, 'Actor.fixtureActor.Item.ownedCopy');
assert.equal(owned.item.uuid, 'Actor.fixtureActor.Item.ownedCopy');
assert.equal(owned.item.provenance?.compendiumSource, 'Compendium.removed.book.Item.oldCopy');
snapshot = world();
const previousFind = runtime.compendium.findAll;
runtime.compendium.findAll = async () => [modern, { ...modern, name: 'Conflicting row' }];
const duplicate = await callerCatalog(runtime);
assert.equal(duplicate.catalog.rows.length, 0);
assert.deepEqual(duplicate.catalog.unavailable, [{ uuid: modern.uuid, reason: 'duplicate-source-identity' }]);
runtime.compendium.findAll = async () => [{ ...modern, _id: 'wrongCopy' }];
assert.deepEqual((await callerCatalog(runtime)).catalog.unavailable, [{ uuid: modern.uuid, reason: 'invalid-content-source' }]);
runtime.compendium.findAll = async () => { snapshot = { ...snapshot, identity: { ...snapshot.identity, contextRevision: 8 } }; return [modern]; };
await assert.rejects(callerCatalog(runtime), /changed/);
snapshot = world();
runtime.compendium.findAll = async () => { revoked = true; return [modern]; };
assert.equal((await callerCatalog(runtime)).catalog.rows.length, 0);
revoked = false; runtime.compendium.findAll = previousFind;
snapshot.identity.systemVersion = '5.3.3';
await assert.rejects(callerCatalog(runtime), /requires D&D 6.0.6/);
snapshot = world();
assert.equal((await new DnD5eAdapter().getSystemDataForUser(runtime) as typeof catalog).catalog.total, 2);
await assert.rejects(callerCatalog({ ...runtime, access: undefined }), /Caller content access/);
for (const role of ['limited', 'none']) {
    const restricted = { ...runtime, documents: { ...runtime.documents,
        list: async () => ({ rows: [], total: 0 }), get: async () => { throw new SdkError('permission_denied', role); } } };
    await assert.rejects(callerItemDetail(restricted, 'Item.restricted'), new RegExp(role));
}
const req = { method: 'POST', url: '/api/modules/dnd5e/content', runtime } as ModuleServerRequest;
const response = await contentRoutes.content(req, { params: Promise.resolve({ systemId: 'dnd5e', route: ['content'] }) }) as { status: number };
assert.equal(response.status, 405);
console.log('R: caller-bound content identity/policy/privacy/stale response contracts: PASS (mock host, not I/N)');
