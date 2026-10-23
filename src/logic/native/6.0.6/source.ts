/** Detached schema decoding, specified by release-6.0.6; never a native Document. */
export type JsonRecord = Record<string, unknown>;
export const record = (value: unknown): JsonRecord | null => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
export const activityTypes = ['attack', 'cast', 'check', 'damage', 'enchant', 'forward', 'heal', 'order', 'save', 'summon', 'teleport', 'transform', 'utility'] as const;
export const advancementTypes = ['AbilityScoreImprovement', 'HitPoints', 'ItemChoice', 'ItemGrant', 'ModifyItem', 'ScaleValue', 'Size', 'Subclass', 'Trait'] as const;
export interface SourceDiagnostic { code: string; path: string }
export type Edition = '2014' | '2024' | 'unknown';
export function deepFreeze<T>(value: T): Readonly<T> {
    if (value && typeof value === 'object') {
        for (const child of Object.values(value)) deepFreeze(child);
        Object.freeze(value);
    }
    return value;
}
export function documentIdentity(uuid: string): { uuid: string; id: string; kind: 'catalog' | 'world' | 'owned'; packId?: string; actorUuid?: string } | null {
    const part = '[A-Za-z0-9_-]+';
    const pack = uuid.match(new RegExp(`^Compendium\\.(${part}\\.${part})\\.Item\\.(${part})$`));
    if (pack) return { uuid, id: pack[2], kind: 'catalog', packId: pack[1] };
    const world = uuid.match(new RegExp(`^Item\\.(${part})$`));
    if (world) return { uuid, id: world[1], kind: 'world' };
    const owned = uuid.match(new RegExp(`^(Actor\\.${part})\\.Item\\.(${part})$`));
    return owned ? { uuid, id: owned[2], kind: 'owned', actorUuid: owned[1] } : null;
}
export function ownedItemUuid(actorId: string, itemId: string): string {
    const uuid = `Actor.${actorId}.Item.${itemId}`;
    if (!documentIdentity(uuid)) throw new Error('Invalid owned Item identity');
    return uuid;
}

// Native migrateAdvancement accepts arrays. Unlike its reduce, reject collisions
// rather than silently losing a grant; keep the original source unchanged.
export function decodeCollection(input: unknown, path: string, known: readonly string[], diagnostics: SourceDiagnostic[]): Readonly<Record<string, JsonRecord>> {
    const result: Record<string, JsonRecord> = Object.create(null);
    if (input === undefined) return Object.freeze(result);
    const object = record(input);
    if (!Array.isArray(input) && !object) {
        diagnostics.push({ code: 'invalid-collection', path });
        return Object.freeze(result);
    }
    for (const [key, value] of Object.entries(Array.isArray(input) ? input : object!)) {
        const row = record(value);
        const id = row?._id;
        if (!row || typeof id !== 'string' || !/^[A-Za-z0-9_-]+$/.test(id) || (!Array.isArray(input) && key !== id)) {
            diagnostics.push({ code: 'invalid-embedded-identity', path: `${path}.${key}` });
            continue;
        }
        if (Object.hasOwn(result, id)) { diagnostics.push({ code: 'duplicate-embedded-identity', path: `${path}.${id}` }); continue; }
        result[id] = row;
        if (typeof row.type !== 'string' || !known.includes(row.type)) diagnostics.push({ code: 'unsupported-type', path: `${path}.${id}.type` });
    }
    return deepFreeze(result);
}
export function decodeItem606(input: unknown, uuid: string) {
    const identity = documentIdentity(uuid);
    const raw = record(input);
    if (!identity || !raw || raw._id !== identity.id || typeof raw.type !== 'string') throw new Error('Invalid Item identity/source');
    const source = structuredClone(raw);
    const system = record(source.system) ?? {};
    const sourceData = record(system.source);
    const diagnostics: SourceDiagnostic[] = [];
    const edition: Edition = sourceData?.rules === '2014' || sourceData?.rules === '2024' ? sourceData.rules : 'unknown';
    if (edition === 'unknown') diagnostics.push({ code: 'unknown-edition', path: 'system.source.rules' });
    const stats = record(source._stats), flags = record(record(source.flags)?.dnd5e);
    const canonical = (value: unknown) => typeof value === 'string' && documentIdentity(value) ? value : null;
    const compendiumSource = canonical(stats?.compendiumSource);
    const sourceId = canonical(flags?.sourceId);
    const advancements = decodeCollection(system.advancement, 'system.advancement', advancementTypes, diagnostics);
    const activities = decodeCollection(system.activities, 'system.activities', activityTypes, diagnostics);
    return deepFreeze({ identity, source, edition, provenance: { compendiumSource, sourceId,
        // Native prepareDescriptionData prefers sourceId, then _stats. These do
        // not replace the owned identity or authorize fetching either document.
        descriptionSourceUuid: sourceId ?? compendiumSource ?? uuid,
        advancementOrigin: typeof flags?.advancementOrigin === 'string' ? flags.advancementOrigin : null,
        advancementRoot: typeof flags?.advancementRoot === 'string' ? flags.advancementRoot : null },
        advancements, activities, diagnostics });
}

export function decodeActor606(input: unknown) {
    const raw = record(input);
    if (!raw || typeof raw._id !== 'string' || !/^[A-Za-z0-9_-]+$/.test(raw._id) || typeof raw.type !== 'string') throw new Error('Invalid Actor identity/source');
    const source = structuredClone(raw);
    const uuid = `Actor.${raw._id}`;
    const diagnostics: SourceDiagnostic[] = [];
    const items: Record<string, ReturnType<typeof decodeItem606>> = Object.create(null);
    if (source.items !== undefined && !Array.isArray(source.items)) diagnostics.push({ code: 'invalid-collection', path: 'items' });
    for (const [index, value] of (Array.isArray(source.items) ? source.items : []).entries()) {
        const item = record(value);
        if (!item || typeof item._id !== 'string' || Object.hasOwn(items, item._id)) {
            diagnostics.push({ code: 'invalid-or-duplicate-item-identity', path: `items.${index}` }); continue;
        }
        try { items[item._id] = decodeItem606(value, ownedItemUuid(raw._id, item._id)); }
        catch { diagnostics.push({ code: 'invalid-item-source', path: `items.${index}` }); }
    }
    const capability = raw.type === 'character' ? 'character-target' as const : raw.type === 'npc' ? 'linked-npc-target-read-only' as const : 'read-only-unsupported-automation' as const;
    return deepFreeze({ uuid, source, items, capability, diagnostics });
}
