'use client';

import React from 'react';

/**
 * Actions tab (mobile view) — actions, attacks, bonus actions, reactions
 * rendered in a single scrollable mobile view.
 *
 * STUB — static placeholder, no data wiring.
 */
export default function Actions() {
    return (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="block-card">
                <h2 className="block-heading">Actions</h2>
                <div className="stub-placeholder">No actions to display</div>
            </div>
        </div>
    );
}
