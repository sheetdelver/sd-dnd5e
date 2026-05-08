'use client';

import React from 'react';
import type { InventoryRow } from '../../types';

interface Props {
    rows?: InventoryRow[];
    title?: string;
}

export default function Inventory({ rows = [], title = 'Inventory' }: Props) {
    return (
        <div className="block-card">
            <h2 className="block-heading">{title}</h2>
            {rows.length === 0 ? (
                <div className="stub-placeholder">No items to display</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {rows.map((row, i) => (
                        <div
                            key={row.key}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto auto auto',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 4px',
                                borderBottom: i < rows.length - 1 ? '1px solid var(--theme-border)' : 'none',
                                color: 'var(--text-primary)',
                            }}
                        >
                            <span style={{ fontSize: '12px' }}>{row.name}</span>
                            {row.equipped && (
                                <span title="Equipped" style={{ fontSize: '10px', color: 'var(--prof-full)' }}>●</span>
                            )}
                            {row.attuned && (
                                <span title="Attuned" style={{ fontSize: '10px', color: 'var(--theme-primary)' }}>◉</span>
                            )}
                            {typeof row.quantity === 'number' && row.quantity !== 1 && (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                                    ×{row.quantity}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
