'use client';

import React from 'react';

/**
 * Features tab (mobile view) — class features, species traits, feats
 * rendered in a single scrollable mobile view.
 *
 * STUB — static placeholder, no data wiring.
 */
export default function Features() {
    return (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="block-card">
                <h2 className="block-heading">Features & Traits</h2>
                <div className="stub-placeholder">No features to display</div>
            </div>
        </div>
    );
}
