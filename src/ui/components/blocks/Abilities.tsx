'use client';

import React from 'react';
import { useModal } from '../shared/useModal';
import { useSheet } from '../shared/SheetContext';
import { ABILITY_FULL_NAME } from '../shared/abilityNames';

/**
 * Convention for `components/blocks/*`:
 *   Blocks are atomic, individual widgets (one block = one self-contained
 *   piece of UI). They accept props from a parent and stay reusable across
 *   StandardView (placed directly in the layout) and mobile tabs (composed
 *   together inside `tabs/mobile/*`). Blocks should NOT compose other blocks.
 *
 * Abilities block — 6 ability score cards. Default 6 columns; pass `columns={3}`
 * for a 3×2 mobile grid.
 */

// Ability order and label mapping
const ABILITY_ORDER = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
const ABILITY_LABEL: Record<string, string> = {
    str: 'STRENGTH',
    dex: 'DEXTERITY',
    con: 'CONSTITUTION',
    int: 'INTELLIGENCE',
    wis: 'WISDOM',
    cha: 'CHARISMA',
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
    /** Number of columns in the grid. Default 6 (single row). Pass 3 for mobile. */
    columns?: number;
}

export default function Abilities({ abilities, onRoll, columns = 6 }: Props) {
    const { openModal } = useModal();
    const { actor } = useSheet();
    if (!abilities) return null;

    const handleClick = (e: React.MouseEvent, key: string) => {
        if (!onRoll) return;
        if (e.shiftKey) {
            void onRoll('ability', key);
            return;
        }
        const mod = abilities[key].mod;
        const formula = `1d20${mod >= 0 ? '+' : ''}${mod}`;
        openModal('roll', {
            rollType: 'ability',
            rollKey: key,
            label: `${ABILITY_FULL_NAME[key] ?? key} Check`,
            subtitle: actor?.name,
            formula,
            onConfirm: (opts: Record<string, unknown>) => onRoll('ability', key, opts),
        });
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 'var(--space-sm)',
        }}>
            {ABILITY_ORDER.map(key => {
                const ab = abilities[key];
                if (!ab) return null;
                const mod = ab.mod;
                return (
                    <button
                        key={key}
                        onClick={(e) => handleClick(e, key)}
                        style={{
                            background: 'var(--surface-card)',
                            border: 'var(--block-border-width) solid var(--theme-border)',
                            borderRadius: 'var(--block-radius)',
                            padding: '12px 8px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'box-shadow 0.2s, border-color 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.boxShadow = '0 0 12px var(--theme-glow)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {/* Ability label */}
                        <div style={{
                            fontSize: '9px',
                            color: 'var(--theme-primary)',
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.08em',
                            fontWeight: 600,
                            marginBottom: '4px',
                        }}>
                            {ABILITY_LABEL[key]}
                        </div>
                        {/* Modifier */}
                        <div style={{
                            fontSize: '22px',
                            fontWeight: 'bold',
                            color: 'var(--text-primary)',
                            lineHeight: 1,
                            marginBottom: '4px',
                        }}>
                            {mod >= 0 ? `+${mod}` : mod}
                        </div>
                        {/* Base score */}
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                        }}>
                            {ab.score}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
