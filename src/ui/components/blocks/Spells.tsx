'use client';

import React from 'react';

/**
 * Spells block — generic spell list for a given spell level.
 * Displays header with slot pip placeholders and a spell list.
 *
 * STUB — static placeholder, no data wiring.
 * TODO: Accept level and slots props for slot pip rendering.
 */
export default function Spells() {
    return (
        <div className="block-card">
            <h2 className="block-heading">Spells</h2>
            {/* STUB: Slot pips placeholder */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Slots: ○ ○ ○</span>
            </div>
            {/* STUB: Empty spell list */}
            <div className="stub-placeholder">
                No spells to display
            </div>
        </div>
    );
}
