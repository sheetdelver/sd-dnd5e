'use client';

import React from 'react';

interface Props {
    value?: number;
}

export default function ArmorClass({ value = 10 }: Props) {
    return (
        <div className="block-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{value}</div>
            <div className="block-heading" style={{ marginBottom: 0 }}>Armor Class</div>
        </div>
    );
}
