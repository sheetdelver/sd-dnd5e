'use client';

import React from 'react';
import type { ActionRow } from '../../types';
import { useModal } from '../shared/useModal';
import { ATTACK_MODE_OPTIONS } from '../shared/rollOptions';

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
    const { openModal } = useModal();

    const handleClick = (e: React.MouseEvent, row: ActionRow) => {
        if (!onRoll) return;
        if (e.shiftKey) {
            void onRoll('item', row.key);
            return;
        }
        // Attack rolls are gated by category, not by whether `attackBonus` is
        // present — `attackBonus` is computed best-effort but a weapon is
        // still an attack even if we couldn't derive a bonus.
        const isAttack = row.category === 'attack';
        const formula = isAttack
            ? `1d20${row.attackBonus ?? ''}`
            : row.damage;

        // Attack Mode dropdown is filtered to the weapon's valid modes (e.g.
        // a Longbow gets only Two-Handed; a Dagger gets one-handed/off-hand/
        // thrown/thrown-offhand). Only emit the configField when the weapon
        // has at least one valid mode — single-mode rows still show the
        // dropdown for visibility/consistency with the Foundry version.
        const validModes = isAttack && row.attackModes
            ? ATTACK_MODE_OPTIONS.filter(opt => row.attackModes!.includes(opt.value))
            : [];
        const configFields = validModes.length > 0
            ? [{
                key: 'attackMode',
                label: 'Attack Mode',
                initialValue: validModes[0].value,
                options: validModes,
            }]
            : undefined;

        openModal('roll', {
            rollType: 'item',
            rollKey: row.key,
            label: isAttack ? 'Attack Roll' : row.name,
            subtitle: row.name,
            formula,
            configFields,
            onConfirm: (opts: Record<string, unknown>) => onRoll('item', row.key, opts),
        });
    };

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
                            onClick={(e) => handleClick(e, row)}
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
