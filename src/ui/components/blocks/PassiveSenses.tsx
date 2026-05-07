'use client';

import React from 'react';

/**
 * PassiveSenses block — displays passive perception, investigation, and insight.
 *
 * STUB — static placeholder, no data wiring.
 */

// STUB: Passive sense labels and placeholder values
const SENSES = [
    { label: 'Perception', value: 10 },
    { label: 'Investigation', value: 11 },
    { label: 'Insight', value: 10 },
];

export default function PassiveSenses() {
    return (
        <div className="block-card">
            <h2 className="block-heading">Passive Senses</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '8px' }}>
                {SENSES.map(sense => (
                    <div key={sense.label} style={{ textAlign: 'center' }}>
                        {/* STUB: Value badge */}
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: '2px solid var(--theme-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 4px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            color: 'var(--text-primary)',
                        }}>
                            {sense.value}
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                            {sense.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
