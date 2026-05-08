'use client';

import React from 'react';

interface HpData {
    value?: number;
    max?: number;
    temp?: number;
}

interface Props {
    hp?: HpData;
}

export default function HitPoints({ hp }: Props) {
    const value = hp?.value ?? 0;
    const max = hp?.max ?? 0;
    const temp = hp?.temp ?? 0;

    return (
        <div className="block-card">
            <h2 className="block-heading">Hit Points</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{value}</span>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>/</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{max}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        TEMP: {temp > 0 ? temp : '--'}
                    </div>
                </div>

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
