'use client';

import React from 'react';
import type { FeatureRow, FeatureSource } from '../../types';

/**
 * Features block — list of feature rows. When the rows span multiple sources
 * (class / subclass / feat / background), the block segments them with
 * source-labeled section headers. Single-source slices render flat.
 *
 * Note: species-typed rows render through the dedicated `Traits` block;
 * `tabs/standard/Features.tsx` swaps that in when the SPECIES_TRAITS filter
 * is active.
 */

interface Props {
    rows?: FeatureRow[];
    title?: string;
}

const SOURCE_ORDER: FeatureSource[] = ['class', 'subclass', 'species', 'feat', 'background'];

const SOURCE_LABEL: Record<FeatureSource, string> = {
    class: 'Class Features',
    subclass: 'Subclass Features',
    species: 'Species Traits',
    feat: 'Feats',
    background: 'Background Features',
};

const SOURCE_BADGE: Record<FeatureSource, string> = {
    class: 'Class',
    subclass: 'Subclass',
    species: 'Species',
    feat: 'Feat',
    background: 'Background',
};

export default function Features({ rows = [], title = 'Features' }: Props) {
    if (rows.length === 0) {
        return (
            <div className="block-card">
                <h2 className="block-heading">{title}</h2>
                <div className="stub-placeholder">No features to display</div>
            </div>
        );
    }

    const groups = new Map<FeatureSource, FeatureRow[]>();
    for (const row of rows) {
        const list = groups.get(row.source) ?? [];
        list.push(row);
        groups.set(row.source, list);
    }
    const orderedSources = SOURCE_ORDER.filter(s => groups.has(s));
    const showHeaders = orderedSources.length > 1;

    return (
        <div className="block-card">
            <h2 className="block-heading">{title}</h2>
            {orderedSources.map(source => (
                <div key={source} style={{ marginBottom: '12px' }}>
                    {showHeaders && (
                        <div style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: 'var(--theme-primary)',
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.08em',
                            marginBottom: '6px',
                            paddingBottom: '4px',
                            borderBottom: '1px solid var(--theme-border)',
                        }}>
                            {SOURCE_LABEL[source]}
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {groups.get(source)!.map(row => (
                            <div key={row.key} style={{
                                paddingBottom: '6px',
                                borderBottom: '1px solid var(--theme-border)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {row.name}
                                    </span>
                                    <span style={{
                                        fontSize: '9px',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase' as const,
                                        letterSpacing: '0.05em',
                                    }}>
                                        {row.sourceLabel ?? SOURCE_BADGE[row.source]}
                                    </span>
                                </div>
                                {row.description && (
                                    <div style={{
                                        fontSize: '11px',
                                        color: 'var(--text-secondary)',
                                        marginTop: '2px',
                                        lineHeight: 1.4,
                                    }}>
                                        {row.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
