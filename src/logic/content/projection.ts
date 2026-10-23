import { decodeItem606, record } from '../native/6.0.6/source';

/** Allowlist only. Never spread source/system/flags into caller-visible content. */
export function itemSummary(input: unknown, uuid: string) {
    const decoded = decodeItem606(input, uuid);
    const system = record(decoded.source.system) ?? {};
    const unidentified = system.identified === false;
    const hidden = record(system.unidentified);
    const source = record(system.source);
    return {
        uuid: decoded.identity.uuid, id: decoded.identity.id, kind: decoded.identity.kind,
        name: unidentified ? typeof hidden?.name === 'string' && hidden.name ? hidden.name : 'Unidentified item'
            : typeof decoded.source.name === 'string' ? decoded.source.name : '',
        type: decoded.source.type,
        identified: !unidentified,
        edition: unidentified ? 'unknown' : decoded.edition,
        provenance: unidentified ? null : {
            compendiumSource: decoded.provenance.compendiumSource, sourceId: decoded.provenance.sourceId,
            book: typeof source?.book === 'string' ? source.book : null,
            license: typeof source?.license === 'string' ? source.license : null,
            revision: typeof source?.revision === 'number' && Number.isFinite(source.revision) ? source.revision : null,
        },
        diagnostics: unidentified ? [{ code: 'unidentified', path: 'system.identified' }] : decoded.diagnostics,
    };
}
export function itemDetail(input: unknown, uuid: string) {
    const summary = itemSummary(input, uuid);
    const decoded = decodeItem606(input, uuid);
    const entries = (collection: Readonly<Record<string, Record<string, unknown>>>) => Object.entries(collection).map(([id, entry]) => ({ id, type: entry.type }));
    return {
        ...summary,
        activities: summary.identified ? entries(decoded.activities) : [],
        advancements: summary.identified ? entries(decoded.advancements) : [],
        // No description bytes until the caller-aware native enricher/secret
        // policy has executable qualification (M7/Q03). This is metadata only.
        description: { status: 'unavailable', reason: summary.identified ? 'native-description-qualification-open' : 'unidentified' },
    };
}
