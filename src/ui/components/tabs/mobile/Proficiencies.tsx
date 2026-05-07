'use client';

import React from 'react';

/**
 * Proficiencies tab (mobile view) — proficiencies and training
 * rendered in a single scrollable mobile view.
 *
 * STUB — static placeholder, no data wiring.
 */
export default function Proficiencies() {
    return (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="block-card">
                <h2 className="block-heading">Proficiencies & Training</h2>
                <div className="stub-placeholder">Proficiency details</div>
            </div>
        </div>
    );
}
