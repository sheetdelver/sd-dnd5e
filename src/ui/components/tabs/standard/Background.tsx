'use client';

import React from 'react';

/**
 * Background tab (standard view) — composes Background, Characteristics,
 * and Appearance block placeholders into a single tab panel.
 *
 * STUB — static placeholder, no data wiring.
 */
export default function Background() {
    return (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* STUB: Background section */}
            <div className="block-card">
                <h2 className="block-heading">Background</h2>
                <div className="stub-placeholder">Background details</div>
            </div>

            {/* STUB: Characteristics section */}
            <div className="block-card">
                <h2 className="block-heading">Characteristics</h2>
                <div className="stub-placeholder">Personality, Ideals, Bonds, Flaws</div>
            </div>

            {/* STUB: Appearance section */}
            <div className="block-card">
                <h2 className="block-heading">Appearance</h2>
                <div className="stub-placeholder">Character appearance details</div>
            </div>
        </div>
    );
}
