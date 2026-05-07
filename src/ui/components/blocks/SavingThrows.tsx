'use client';

import React from 'react';

/**
 * SavingThrows block — displays saving throw modifiers for all six abilities.
 * Renders a 3×2 grid with proficiency indicators.
 *
 * STUB — static placeholder, no data wiring.
 */

// STUB: Saving throw ability labels
const SAVE_LABELS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export default function SavingThrows() {
    return (
        <div className="block-card">
            <h2 className="block-heading">Saving Throws</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                {SAVE_LABELS.map(label => (
                    <div
                        key={label}
                        style={{
                            textAlign: 'center',
                            padding: '8px 4px',
                            borderRadius: 'var(--block-radius)',
                            border: '1px solid var(--theme-border)',
                        }}
                    >
                        {/* STUB: Proficiency dot placeholder */}
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>○</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                            {label}
                        </div>
                        {/* STUB: Modifier placeholder */}
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>+0</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
