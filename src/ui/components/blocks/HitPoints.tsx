'use client';

import React from 'react';

/**
 * HitPoints block — current/max/temp HP display.
 * Includes heal and damage button placeholders.
 * Extracted from the monolithic header so layouts can position independently.
 *
 * STUB — static placeholder, no data wiring.
 */
export default function HitPoints() {
    return (
        <div className="block-card">
            <h2 className="block-heading">Hit Points</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* STUB: Heal button placeholder */}
                <button
                    style={{
                        fontSize: '10px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--prof-full)',
                        color: 'var(--prof-full)',
                        background: 'transparent',
                        cursor: 'pointer',
                    }}
                    disabled
                >
                    HEAL
                </button>

                {/* STUB: HP values */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>30</span>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>/</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>30</span>
                    </div>
                    {/* STUB: Temp HP */}
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>TEMP: --</div>
                </div>

                {/* STUB: Damage button placeholder */}
                <button
                    style={{
                        fontSize: '10px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #e74c3c',
                        color: '#e74c3c',
                        background: 'transparent',
                        cursor: 'pointer',
                    }}
                    disabled
                >
                    DAMAGE
                </button>
            </div>
        </div>
    );
}
