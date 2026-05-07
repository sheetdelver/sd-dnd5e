'use client';

import React from 'react';

/**
 * Characteristics block — personality traits, ideals, bonds, and flaws.
 *
 * STUB — static placeholder, no data wiring.
 */

// STUB: Characteristic fields
const FIELDS = ['Personality Traits', 'Ideals', 'Bonds', 'Flaws'];

export default function Characteristics() {
    return (
        <div className="block-card">
            <h2 className="block-heading">Characteristics</h2>
            {FIELDS.map(field => (
                <div key={field} style={{ marginBottom: '8px' }}>
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
                    {/* STUB: Empty characteristic text */}
                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                        padding: '4px 0',
                        borderBottom: '1px solid var(--theme-border)',
                    }}>
                        —
                    </div>
                </div>
            ))}
        </div>
    );
}
