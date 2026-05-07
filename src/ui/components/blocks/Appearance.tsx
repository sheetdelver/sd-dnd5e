'use client';

import React from 'react';

/**
 * Appearance block — character appearance details.
 * Height, weight, eyes, hair, skin, age, etc.
 *
 * STUB — static placeholder, no data wiring.
 */

// STUB: Appearance fields
const FIELDS = ['Height', 'Weight', 'Eyes', 'Hair', 'Skin', 'Age'];

export default function Appearance() {
    return (
        <div className="block-card">
            <h2 className="block-heading">Appearance</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {FIELDS.map(field => (
                    <div key={field}>
                        <div style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.05em',
                            marginBottom: '2px',
                        }}>
                            {field}
                        </div>
                        {/* STUB: Empty value */}
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            —
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
