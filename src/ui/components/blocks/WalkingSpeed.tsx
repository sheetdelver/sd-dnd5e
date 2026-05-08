'use client';

import React from 'react';

interface Props {
    walk?: number;
}

export default function WalkingSpeed({ walk = 30 }: Props) {
    return (
        <div className="block-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {walk}
                <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>ft.</span>
            </div>
            <div className="block-heading" style={{ marginBottom: 0 }}>Walking Speed</div>
        </div>
    );
}
