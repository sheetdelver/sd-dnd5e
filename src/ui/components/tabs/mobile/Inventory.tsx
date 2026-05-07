'use client';

import React from 'react';

/**
 * Inventory tab (mobile view) — equipment and possessions
 * rendered in a single scrollable mobile view.
 *
 * STUB — static placeholder, no data wiring.
 */
export default function Inventory() {
    return (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="block-card">
                <h2 className="block-heading">Inventory</h2>
                <div className="stub-placeholder">No items to display</div>
            </div>
        </div>
    );
}
