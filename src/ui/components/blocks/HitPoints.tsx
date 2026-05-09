'use client';

import React from 'react';
import { useModal } from '../shared/useModal';
import { useSheet } from '../shared/SheetContext';

interface HpData {
    value?: number;
    max?: number;
    temp?: number;
}

interface Props {
    hp?: HpData;
}

export default function HitPoints({ hp }: Props) {
    const { openModal } = useModal();
    const { onUpdate } = useSheet();

    const value = hp?.value ?? 0;
    const max = hp?.max ?? 0;
    const temp = hp?.temp ?? 0;

    const open = (initialMode: 'heal' | 'damage' | 'temp') => {
        openModal('hp', {
            hp: { value, max, temp },
            initialMode,
            onApply: async (next: { value: number; temp: number }) => {
                if (!onUpdate) return;
                if (next.value !== value) {
                    await onUpdate('system.attributes.hp.value', next.value);
                }
                if (next.temp !== temp) {
                    await onUpdate('system.attributes.hp.temp', next.temp);
                }
            },
        });
    };

    return (
        <div className="block-card">
            <h2 className="block-heading">Hit Points</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    onClick={() => open('heal')}
                    disabled={!onUpdate}
                    style={{
                        fontSize: '10px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--prof-full)',
                        color: 'var(--prof-full)',
                        background: 'transparent',
                        cursor: onUpdate ? 'pointer' : 'default',
                        opacity: onUpdate ? 1 : 0.4,
                    }}
                >
                    HEAL
                </button>

                <button
                    onClick={() => open('temp')}
                    disabled={!onUpdate}
                    style={{
                        flex: 1,
                        textAlign: 'center',
                        background: 'transparent',
                        border: 'none',
                        cursor: onUpdate ? 'pointer' : 'default',
                        padding: 0,
                    }}
                    title={onUpdate ? 'Edit hit points' : undefined}
                >
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{value}</span>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>/</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{max}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        TEMP: {temp > 0 ? temp : '--'}
                    </div>
                </button>

                <button
                    onClick={() => open('damage')}
                    disabled={!onUpdate}
                    style={{
                        fontSize: '10px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #e74c3c',
                        color: '#e74c3c',
                        background: 'transparent',
                        cursor: onUpdate ? 'pointer' : 'default',
                        opacity: onUpdate ? 1 : 0.4,
                    }}
                >
                    DAMAGE
                </button>
            </div>
        </div>
    );
}
