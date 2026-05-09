'use client';

import React from 'react';
import type { InventoryRow, InventoryCategory } from '../../types';
import { useModal } from '../shared/useModal';
import { useSheet } from '../shared/SheetContext';

/**
 * Inventory block — list of inventory rows. When the rows span multiple
 * categories, the block segments them with category-labeled section headers
 * (Spells block pattern). When the tab passes a single-category slice, the
 * single header is suppressed for a cleaner flat layout.
 */

interface Props {
    rows?: InventoryRow[];
    title?: string;
}

const CATEGORY_ORDER: InventoryCategory[] = [
    'weapon', 'equipment', 'consumable', 'tool', 'loot', 'container', 'backpack', 'other',
];

const CATEGORY_LABEL: Record<InventoryCategory, string> = {
    weapon: 'Weapons',
    equipment: 'Equipment',
    consumable: 'Consumables',
    tool: 'Tools',
    loot: 'Loot',
    container: 'Containers',
    backpack: 'Backpack',
    other: 'Other',
};

export default function Inventory({ rows = [], title = 'Inventory' }: Props) {
    const { openModal } = useModal();
    const { actor } = useSheet();

    const handleRowClick = (row: InventoryRow) => {
        const item = (actor?.items ?? []).find((i: { _id: string }) => i._id === row.key);
        if (!item) return;
        openModal('item', { item });
    };

    if (rows.length === 0) {
        return (
            <div className="block-card">
                <h2 className="block-heading">{title}</h2>
                <div className="stub-placeholder">No items to display</div>
            </div>
        );
    }

    // Group by category, preserving the canonical order.
    const groups = new Map<InventoryCategory, InventoryRow[]>();
    for (const row of rows) {
        const list = groups.get(row.category) ?? [];
        list.push(row);
        groups.set(row.category, list);
    }
    const orderedCategories = CATEGORY_ORDER.filter(c => groups.has(c));
    const showHeaders = orderedCategories.length > 1;

    return (
        <div className="block-card">
            <h2 className="block-heading">{title}</h2>
            {orderedCategories.map(category => (
                <div key={category} style={{ marginBottom: '12px' }}>
                    {showHeaders && (
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
                            {CATEGORY_LABEL[category]}
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {groups.get(category)!.map((row, i, arr) => (
                            <button
                                key={row.key}
                                type="button"
                                onClick={() => handleRowClick(row)}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto auto auto',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 4px',
                                    borderBottom: i < arr.length - 1 ? '1px solid var(--theme-border)' : 'none',
                                    color: 'var(--text-primary)',
                                    background: 'transparent',
                                    border: 'none',
                                    textAlign: 'left' as const,
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
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
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
