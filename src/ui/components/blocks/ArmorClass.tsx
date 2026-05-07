'use client';

import React from 'react';

/**
 * ArmorClass block — AC value display.
 *
 * STUB — static placeholder, no data wiring.
 * TODO: Add source breakdown (e.g. "Chain Mail + Shield")
 */
export default function ArmorClass() {
    return (
        <div className="block-card" style={{ textAlign: 'center' }}>
            {/* STUB: AC value */}
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>17</div>
            <div className="block-heading" style={{ marginBottom: 0 }}>Armor Class</div>
        </div>
    );
}
