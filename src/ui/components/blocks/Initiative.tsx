'use client';

import React from 'react';

interface Props {
    value?: number;
}

export default function Initiative({ value = 0 }: Props) {
    const formatted = value >= 0 ? `+${value}` : `${value}`;
    return (
        <div className="block-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {formatted}
            </div>
            <div className="block-heading" style={{ marginBottom: 0 }}>Initiative</div>
        </div>
    );
}
