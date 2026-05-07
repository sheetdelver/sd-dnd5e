'use client';

import React from 'react';

/**
 * Abilities block — displays the 6 ability scores in a single horizontal row.
 * Each card shows: ability label, modifier, and base score.
 * Styled with dark background and themed border colors.
 *
 * Used in the StandardView ability strip alongside stat chips.
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
}

export default function Abilities({ abilities, onRoll }: Props) {
    if (!abilities) return null;

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 'var(--space-sm)',
        }}>
            {ABILITY_ORDER.map(key => {
                const ab = abilities[key];
                if (!ab) return null;
                const mod = ab.mod;
                return (
                    <button
                        key={key}
                        onClick={() => onRoll?.('ability', key)}
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
