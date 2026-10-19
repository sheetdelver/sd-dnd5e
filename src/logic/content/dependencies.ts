import { decodeItem606, documentIdentity, record } from '../native/6.0.6/source';

/** Fixed ItemGrant closure only. Choice pools, descriptions and provenance are
 * not required grants. Later selected choices become explicit additional roots.
 * `sources` must already be caller-authorized current source, never a GM cache.
 */
export function requiredGrantClosure(roots: readonly string[], sources: ReadonlyMap<string, unknown>, limit = 1000) {
    const ordered: string[] = [], active = new Set<string>(), complete = new Set<string>();
    const diagnostics: Array<{ uuid: string; reason: string; path?: string }> = [];
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) throw new Error('Invalid closure limit');
    function visit(uuid: string, depth: number) {
        if (complete.has(uuid)) return;
        if (active.has(uuid)) { diagnostics.push({ uuid, reason: 'cyclic-required-grant' }); return; }
        if (complete.size + active.size >= limit || depth > 50) { diagnostics.push({ uuid, reason: 'dependency-limit' }); return; }
        if (!documentIdentity(uuid)) { diagnostics.push({ uuid, reason: 'invalid-canonical-identity' }); return; }
        const source = sources.get(uuid);
        if (!source) { diagnostics.push({ uuid, reason: 'required-source-unavailable' }); return; }
        let decoded: ReturnType<typeof decodeItem606>;
        try { decoded = decodeItem606(source, uuid); }
        catch { diagnostics.push({ uuid, reason: 'invalid-content-source' }); return; }
        active.add(uuid);
        for (const diagnostic of decoded.diagnostics.filter(d => d.path.startsWith('system.advancement'))) {
            diagnostics.push({ uuid, reason: diagnostic.code, path: diagnostic.path });
        }
        for (const [id, advancement] of Object.entries(decoded.advancements)) {
            if (advancement.type !== 'ItemGrant') continue;
            const configuration = record(advancement.configuration);
            if (!Array.isArray(configuration?.items)) {
                diagnostics.push({ uuid, reason: 'invalid-grant-items', path: `system.advancement.${id}` }); continue;
            }
            for (const candidate of configuration.items) {
                const grant = record(candidate);
                if (grant?.optional === true) continue;
                if (typeof grant?.uuid !== 'string') diagnostics.push({ uuid, reason: 'invalid-grant-reference', path: `system.advancement.${id}` });
                else visit(grant.uuid, depth + 1);
            }
        }
        active.delete(uuid); complete.add(uuid); ordered.push(uuid);
    }
    for (const root of roots) visit(root, 0);
    return { status: diagnostics.length ? 'unavailable' as const : 'ready' as const, scope: 'fixed-item-grants' as const, ordered, diagnostics };
}
