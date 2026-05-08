'use client';

import React from 'react';

interface Props {
    active?: boolean;
}

export default function HeroicInspiration({ active = false }: Props) {
    return (
        <div className="block-card" style={{ textAlign: 'center' }}>
            <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '2px solid var(--theme-border)',
                margin: '0 auto 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: active ? 'var(--theme-primary)' : 'var(--text-muted)',
                fontSize: '14px',
                background: active ? 'var(--theme-glow)' : 'transparent',
            }}>
                {active ? '★' : '○'}
            </div>
            <div className="block-heading" style={{ marginBottom: 0 }}>Heroic Inspiration</div>
        </div>
    );
}
