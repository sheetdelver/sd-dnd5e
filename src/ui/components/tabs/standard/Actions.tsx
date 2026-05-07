'use client';

import React from 'react';

/**
 * Actions tab (standard view) — actions content with sub-filter bar.
 * Displays attacks, actions, bonus actions, reactions, and other entries.
 * Saving throws are NOT rendered here — they live in blocks/SavingThrows
 * (left sidebar in the standard view layout).
 *
 * STUB — static placeholder with sub-filter buttons, no data wiring.
 * TODO: Accept items and categorize by action type.
 */

// Action sub-filter categories matching the reference image
const ACTION_FILTERS = ['ALL', 'ATTACK', 'ACTION', 'BONUS ACTION', 'REACTION', 'OTHER', 'LIMITED USE'];

export default function Actions() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {/* Sub-filter bar */}
            <div style={{
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap',
            }}>
                {ACTION_FILTERS.map((filter, i) => (
                    <button
                        key={filter}
                        style={{
                            padding: '4px 10px',
                            fontSize: '10px',
                            fontWeight: 600,
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.03em',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            border: i === 0
                                ? '1px solid var(--theme-primary)'
                                : '1px solid var(--text-muted)',
                            background: i === 0
                                ? 'var(--theme-primary)'
                                : 'transparent',
                            color: i === 0
                                ? 'var(--text-on-accent)'
                                : 'var(--text-secondary)',
                        }}
                        disabled={i !== 0}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* STUB: Actions content placeholder */}
            <div className="stub-placeholder" style={{ minHeight: '200px' }}>
                No actions to display
            </div>
        </div>
    );
}
