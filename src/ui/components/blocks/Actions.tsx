'use client';

import React from 'react';
import type { ActionRow } from '../../types';

interface Props {
    rows?: ActionRow[];
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
    /** Optional override for the block heading (e.g. "Attacks", "Bonus Actions"). */
    title?: string;
}

const CATEGORY_LABEL: Record<string, string> = {
    attack: 'Attack',
    action: 'Action',
    bonus: 'Bonus',
    reaction: 'Reaction',
    other: 'Other',
    limited: 'Limited',
};

export default function Actions({ rows = [], onRoll, title = 'Actions' }: Props) {
    return (
        <div className="block-card">
            <h2 className="block-heading">{title}</h2>
            {rows.length === 0 ? (
                <div className="stub-placeholder">No actions to display</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {rows.map((row, i) => (
                        <button
                            key={row.key}
                            onClick={() => onRoll?.('item', row.key)}
                            disabled={!onRoll}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto auto auto',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 4px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: i < rows.length - 1 ? '1px solid var(--theme-border)' : 'none',
                                textAlign: 'left',
                                cursor: onRoll ? 'pointer' : 'default',
                                color: 'var(--text-primary)',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { if (onRoll) e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 600 }}>{row.name}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                                    {CATEGORY_LABEL[row.category] ?? row.category}
                                    {row.range && ` · ${row.range}`}
                                </div>
                            </div>
                            {row.attackBonus && (
                                <span style={{ fontSize: '12px', fontVariantNumeric: 'tabular-nums', color: 'var(--theme-primary)' }}>
                                    {row.attackBonus}
                                </span>
                            )}
                            {row.damage && (
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    {row.damage}
                                </span>
                            )}
                            {row.save && (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {row.save}
                                </span>
                            )}
                            {row.uses && (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {row.uses.value}/{row.uses.max}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
