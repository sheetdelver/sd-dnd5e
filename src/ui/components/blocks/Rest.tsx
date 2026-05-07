'use client';

import React from 'react';

/**
 * Rest block — Short Rest and Long Rest button placeholders.
 *
 * STUB — static placeholder, no data wiring.
 */
export default function Rest() {
    return (
        <div className="block-card">
            <div style={{ display: 'flex', gap: '8px' }}>
                {/* STUB: Short Rest button */}
                <button
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: 'var(--block-radius)',
                        border: '1px solid var(--theme-border)',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                    }}
                    disabled
                >
                    ☾ Short Rest
                </button>
                {/* STUB: Long Rest button */}
                <button
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: 'var(--block-radius)',
                        border: '1px solid var(--theme-border)',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                    }}
                    disabled
                >
                    ◯ Long Rest
                </button>
            </div>
        </div>
    );
}
