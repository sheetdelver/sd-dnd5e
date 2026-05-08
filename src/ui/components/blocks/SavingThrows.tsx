'use client';

import React from 'react';

const SAVE_ORDER = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
const SAVE_LABEL: Record<string, string> = {
    str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA',
};

interface AbilityData {
    score: number;
    mod: number;
    save: number;
    saveProficient: boolean;
}

interface Props {
    abilities?: Record<string, AbilityData>;
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

export default function SavingThrows({ abilities, onRoll }: Props) {
    return (
        <div className="block-card">
            <h2 className="block-heading">Saving Throws</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                {SAVE_ORDER.map(key => {
                    const ab = abilities?.[key];
                    const save = ab?.save ?? 0;
                    const proficient = ab?.saveProficient ?? false;
                    const formatted = save >= 0 ? `+${save}` : `${save}`;
                    return (
                        <button
                            key={key}
                            onClick={() => onRoll?.('save', key)}
                            disabled={!ab}
                            style={{
                                textAlign: 'center',
                                padding: '8px 4px',
                                borderRadius: 'var(--block-radius)',
                                border: '1px solid var(--theme-border)',
                                background: 'transparent',
                                cursor: ab ? 'pointer' : 'default',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => {
                                if (ab) e.currentTarget.style.background = 'var(--surface-elevated)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <div style={{
                                fontSize: '9px',
                                color: proficient ? 'var(--prof-full)' : 'var(--text-muted)',
                            }}>
                                {proficient ? '●' : '○'}
                            </div>
                            <div style={{
                                fontSize: '10px',
                                color: 'var(--text-secondary)',
                                textTransform: 'uppercase' as const,
                                letterSpacing: '0.05em',
                            }}>
                                {SAVE_LABEL[key]}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                {formatted}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
