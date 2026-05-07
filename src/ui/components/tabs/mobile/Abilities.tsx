'use client';

import React from 'react';

/**
 * Abilities tab (mobile view) — composes Abilities, SavingThrows, and
 * PassiveSenses block placeholders into a single scrollable mobile tab.
 *
 * STUB — static placeholder, no data wiring.
 */
export default function Abilities() {
    return (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* STUB: Ability scores placeholder */}
            <div className="block-card">
                <h2 className="block-heading">Ability Scores</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(ab => (
                        <div key={ab} style={{ textAlign: 'center', padding: '12px 4px', border: '1px solid var(--theme-border)', borderRadius: 'var(--block-radius)' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' as const }}>{ab}</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>+0</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>10</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* STUB: Saving Throws placeholder */}
            <div className="block-card">
                <h2 className="block-heading">Saving Throws</h2>
                <div className="stub-placeholder">Saving throw modifiers</div>
            </div>

            {/* STUB: Passive Senses placeholder */}
            <div className="block-card">
                <h2 className="block-heading">Passive Senses</h2>
                <div className="stub-placeholder">Perception, Investigation, Insight</div>
            </div>
        </div>
    );
}
