'use client';

import React from 'react';

/**
 * ProficiencyBonus block — single value display for proficiency bonus.
 *
 * STUB — static placeholder, no data wiring.
 */
export default function ProficiencyBonus() {
    return (
        <div className="block-card" style={{ textAlign: 'center' }}>
            {/* STUB: Proficiency bonus value */}
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>+2</div>
            <div className="block-heading" style={{ marginBottom: 0 }}>Proficiency Bonus</div>
        </div>
    );
}
