'use client';

import React from 'react';
import type { FeatureRow } from '../../types';

/**
 * Traits block — species/racial trait list.
 *
 * Renders the same `FeatureRow` shape as `Features` but tuned for the
 * species-only case: no per-row source badge (every row is species), and
 * a fixed "Species Traits" heading. Used by `tabs/standard/Features.tsx`
 * when the SPECIES_TRAITS filter is active (filter→block swap pattern).
 */

interface Props {
    rows?: FeatureRow[];
    title?: string;
}

export default function Traits({ rows = [], title = 'Species Traits' }: Props) {
    if (rows.length === 0) {
        return (
            <div className="block-card">
                <h2 className="block-heading">{title}</h2>
                <div className="stub-placeholder">No species traits to display</div>
            </div>
        );
    }

    return (
        <div className="block-card">
            <h2 className="block-heading">{title}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {rows.map(row => (
                    <div key={row.key} style={{
                        paddingBottom: '6px',
                        borderBottom: '1px solid var(--theme-border)',
                    }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {row.name}
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
    );
}
