'use client';

import React from 'react';
import { useSheet } from '../shared/SheetContext';

interface Props {
    active?: boolean;
}

export default function HeroicInspiration({ active = false }: Props) {
    const { onUpdate } = useSheet();
    const canToggle = Boolean(onUpdate);

    const handleToggle = () => {
        if (!onUpdate) return;
        onUpdate('system.attributes.inspiration', !active).catch(() => {});
    };

    return (
        <button
            type="button"
            className="block-card"
            onClick={handleToggle}
            disabled={!canToggle}
            style={{
                textAlign: 'center',
                cursor: canToggle ? 'pointer' : 'default',
                background: 'var(--surface-card)',
            }}
            title={canToggle ? (active ? 'Spend Heroic Inspiration' : 'Grant Heroic Inspiration') : undefined}
        >
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
        </button>
    );
}
