import { SdkError, type SystemAdapter } from '@sheet-delver/sdk';
import info from '../../../info.json';
import { itemSummary, itemDetail } from '../../logic/content/projection';
import { documentIdentity, record } from '../../logic/native/6.0.6/source';
import { assertSameRulesContext, resolveRulesContext, type RulesContext } from '../../logic/rules-context';

export type CallerContentRuntime = Parameters<NonNullable<SystemAdapter['getSystemDataForUser']>>[0];
const declared = new Set(info.compendiumPacks.packs.filter(pack => pack.type === 'Item' && pack.hydrate).map(pack => pack.id));
function begin(runtime: CallerContentRuntime) {
    if (!runtime.access || !runtime.world) throw new SdkError('not_ready', 'Caller content access and world context are required');
    const context = resolveRulesContext(runtime.world.snapshot());
    if (context.status !== 'supported') throw new SdkError('out_of_scope', 'Content requires D&D 6.0.6 / Foundry 14.367+ and an available rule profile');
    const setting = context.settings['dnd5e.packSourceConfiguration'];
    if (!setting || setting.status === 'unavailable') throw new SdkError('not_ready', 'Native content source policy is unavailable');
    return { context, policy: record(setting.value)! };
}
function revalidate(runtime: CallerContentRuntime, reviewed: RulesContext) {
    if (!runtime.world) throw new SdkError('not_ready', 'World context is unavailable');
    try {
        runtime.world.assertRevision(reviewed.identity!.contextRevision);
        assertSameRulesContext(reviewed, resolveRulesContext(runtime.world.snapshot()));
    } catch { throw new SdkError('conflict', 'World context changed; reload content'); }
}
function allowed(runtime: CallerContentRuntime, packId: string) {
    return runtime.access?.canReadPack(packId) === true && runtime.access.packs().some(pack => pack.id === packId && pack.type === 'Item');
}
export async function callerCatalog(runtime: CallerContentRuntime, options: { page?: number; pageSize?: number; packId?: string } = {}) {
    const page = options.page ?? 1, pageSize = options.pageSize ?? 50;
    if (!Number.isSafeInteger(page) || page < 1 || page > 10000 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new SdkError('validation', 'Invalid content page');
    const { context, policy } = begin(runtime);
    const selected = options.packId;
    if (selected && !allowed(runtime, selected)) throw new SdkError('permission_denied', 'Content source unavailable');
    const packs = runtime.access!.packs().filter(pack => pack.type === 'Item' && allowed(runtime, pack.id)).map(pack => ({
        id: pack.id, label: pack.label, type: pack.type,
        availability: policy[pack.id] === false ? 'excluded-by-native-policy' : declared.has(pack.id) ? 'declared' : 'external-dependency-E01',
    }));
    const readable = new Set(packs.filter(pack => pack.availability === 'declared' && (!selected || pack.id === selected)).map(pack => pack.id));
    // Public reader is static declared scope. No fallback reads, privileged adapter
    // cache, guessed pack IDs, persistent index or second world lifecycle.
    const raw = readable.size ? await runtime.compendium.findAll('Item') : [];
    revalidate(runtime, context);
    const unavailable: Array<{ uuid: string; reason: string }> = [];
    const counts = new Map<string, number>();
    for (const row of raw) if (typeof row.uuid === 'string') counts.set(row.uuid, (counts.get(row.uuid) ?? 0) + 1);
    const items = raw.flatMap(row => {
        const uuid = typeof row.uuid === 'string' ? row.uuid : '';
        const identity = documentIdentity(uuid);
        if (identity?.kind !== 'catalog' || !identity.packId || !readable.has(identity.packId) || !allowed(runtime, identity.packId)) return [];
        if (counts.get(uuid)! > 1) {
            if (!unavailable.some(entry => entry.uuid === uuid)) unavailable.push({ uuid, reason: 'duplicate-source-identity' });
            return [];
        }
        try {
            const summary = itemSummary(row, uuid);
            return [{ ...summary, defaultSelected: summary.edition === '2024' }];
        } catch {
            unavailable.push({ uuid, reason: 'invalid-content-source' });
            return []; // Invalid identities are never repaired by name or array position.
        }
    }).sort((a, b) => a.uuid.localeCompare(b.uuid, 'en'));
    // World Items need detail-level permission; parent/list visibility is not enough.
    const world = selected ? { rows: [], total: 0 } : await runtime.documents.list('Item', { page, pageSize }, { minOwnership: 'observer' });
    const worldItems = world.rows.flatMap(row => {
        if (typeof row._id !== 'string') return [];
        try { return [itemSummary(row, `Item.${row._id}`)]; } catch { return []; }
    });
    revalidate(runtime, context);
    return {
        context: { identity: context.identity, profile: context.profile },
        packs: packs.filter(pack => allowed(runtime, pack.id)),
        catalog: { rows: items.filter(row => allowed(runtime, documentIdentity(row.uuid)!.packId!)).slice((page - 1) * pageSize, page * pageSize),
            total: items.filter(row => allowed(runtime, documentIdentity(row.uuid)!.packId!)).length, page, pageSize,
            unavailable: unavailable.filter(row => allowed(runtime, documentIdentity(row.uuid)!.packId!)) },
        world: { rows: worldItems, total: world.total, page, pageSize },
        limitations: ['E01: optional undeclared packs cannot be read through the current public contract', 'Metadata only; native descriptions and creation choices are not implemented'],
    };
}
export async function callerItemDetail(runtime: CallerContentRuntime, uuid: string) {
    const identity = documentIdentity(uuid);
    if (!identity) throw new SdkError('validation', 'Canonical Item UUID required');
    const { context, policy } = begin(runtime);
    if (identity.kind === 'catalog') {
        if (!allowed(runtime, identity.packId!)) throw new SdkError('permission_denied', 'Content source unavailable');
        if (policy[identity.packId!] === false) throw new SdkError('out_of_scope', 'Source excluded by native policy');
        if (!declared.has(identity.packId!)) throw new SdkError('out_of_scope', 'E01: dynamic authorized full reads unavailable');
    }
    const row = identity.kind === 'catalog' ? await runtime.compendium.getById('Item', uuid)
        : identity.kind === 'world' ? await runtime.documents.get('Item', identity.id, { minOwnership: 'observer' })
            : await runtime.documents.fetchByUuid(uuid, { minOwnership: 'observer' });
    revalidate(runtime, context);
    if (identity.kind === 'catalog' && !allowed(runtime, identity.packId!)) throw new SdkError('permission_denied', 'Content source unavailable');
    if (!row) throw new SdkError('not_found', 'Item unavailable');
    // Reject mismatched receipts; a same-name row from another pack/copy is never a substitute.
    if (row._id !== identity.id || identity.kind === 'catalog' && row.uuid !== uuid
        || typeof row.uuid === 'string' && row.uuid !== uuid) throw new SdkError('conflict', 'Content identity changed; reload');
    return { context: { identity: context.identity, profile: context.profile }, item: itemDetail(row, uuid) };
}
