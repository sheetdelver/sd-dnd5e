'use client';

import React from 'react';
import type { SpellRow } from '../../types';
import { SPELL_FILTERS } from '../shared/filters';
import { useModal } from '../shared/useModal';

interface Props {
    rows?: SpellRow[];
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
    title?: string;
}

// SPELL_FILTERS layout: ['ALL', 'CANTRIP', '1ST', '2ND', ..., '9TH', 'CONCETRATION', 'RITUAL']
// Index 1 = CANTRIP (level 0), index 2 = '1ST' (level 1), etc. So filter index = level + 1.
const levelLabel = (level: number): string => SPELL_FILTERS[level + 1] ?? `Level ${level}`;

export default function Spells({ rows = [], onRoll, title }: Props) {
    const { openModal } = useModal();

    const handleClick = (e: React.MouseEvent, row: SpellRow) => {
        if (!onRoll) return;
        if (e.shiftKey) {
            void onRoll('item', row.key);
            return;
        }
        openModal('roll', {
            rollType: 'item',
            rollKey: row.key,
            label: 'Spell Roll',
            subtitle: row.name,
            onConfirm: (opts: Record<string, unknown>) => onRoll('item', row.key, opts),
        });
    };

    if (rows.length === 0) {
        return (
            <div className="block-card">
                <h2 className="block-heading">{title ?? 'Spells'}</h2>
                <div className="stub-placeholder">No spells to display</div>
            </div>
        );
    }

    // Group spells by level
    const byLevel = new Map<number, SpellRow[]>();
    for (const row of rows) {
        const arr = byLevel.get(row.level) ?? [];
        arr.push(row);
        byLevel.set(row.level, arr);
    }
    const levels = Array.from(byLevel.keys()).sort((a, b) => a - b);

    return (
        <div className="block-card">
            <h2 className="block-heading">{title ?? 'Spells'}</h2>
            {levels.map(level => (
                <div key={level} style={{ marginBottom: '12px' }}>
                    <div style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: 'var(--theme-primary)',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.08em',
                        marginBottom: '4px',
                        paddingBottom: '4px',
                        borderBottom: '1px solid var(--theme-border)',
                    }}>
                        {levelLabel(level)}
                    </div>
                    {byLevel.get(level)!.map(row => (
                        <button
                            key={row.key}
                            onClick={(e) => handleClick(e, row)}
                            disabled={!onRoll}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '6px 4px',
                                background: 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                cursor: onRoll ? 'pointer' : 'default',
                                color: 'var(--text-primary)',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { if (onRoll) e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <span style={{ flex: 1, fontSize: '12px' }}>{row.name}</span>
                            {row.concentration && (
                                <span title="Concentration" style={{ fontSize: '10px', color: 'var(--theme-primary)' }}>C</span>
                            )}
                            {row.ritual && (
                                <span title="Ritual" style={{ fontSize: '10px', color: 'var(--theme-primary)' }}>R</span>
                            )}
                            {row.school && (
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize' as const }}>
                                    {row.school}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
}
