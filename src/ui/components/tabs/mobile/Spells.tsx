'use client';

import React from 'react';

/**
 * Spells tab (mobile view) — spell list organized by level
 * rendered in a single scrollable mobile view.
 *
 * STUB — static placeholder, no data wiring.
 */
export default function Spells() {
    return (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="block-card">
                <h2 className="block-heading">Spells</h2>
                <div className="stub-placeholder">No spells to display</div>
            </div>
        </div>
    );
}
