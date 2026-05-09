'use client';

import React, { useState } from 'react';
import BaseModal from '../shared/BaseModal';

/**
 * HPModal — heal / damage / temp HP editor.
 *
 * Triggered from the HEAL / DAMAGE buttons in `blocks/HitPoints.tsx`. Applies
 * the requested change to a copy of the current HP state and forwards the
 * result via `onApply`. The HitPoints block (or another caller) is then
 * responsible for the actual `onUpdate` writes — this modal stays decoupled
 * from the actor.
 *
 * D&D 5e rules:
 *   - Damage applies to temp HP first, overflow to value (floor at 0).
 *   - Heal increases value up to max. Temp HP is unaffected.
 *   - Setting temp HP replaces the existing temp value (5e: temp HP doesn't stack).
 */

type Mode = 'heal' | 'damage' | 'temp';

const MODES: { id: Mode; label: string; color: string }[] = [
    { id: 'heal',   label: 'Heal',   color: 'var(--prof-full)' },
    { id: 'damage', label: 'Damage', color: '#e74c3c' },
    { id: 'temp',   label: 'Temp HP', color: 'var(--theme-primary)' },
];

export interface HPState {
    value: number;
    max: number;
    temp: number;
}

export interface HPModalProps {
    hp: HPState;
    /** Optional initial mode; defaults to heal. */
    initialMode?: Mode;
    /** Caller writes both `system.attributes.hp.value` and `.temp` from this payload. */
    onApply: (next: { value: number; temp: number }) => void | Promise<void>;
    onClose: () => void;
}

export default function HPModal({ hp, initialMode = 'heal', onApply, onClose }: HPModalProps) {
    const [mode, setMode] = useState<Mode>(initialMode);
    const [amount, setAmount] = useState<string>('');

    const numAmount = Math.max(0, Math.floor(Number(amount) || 0));

    const computeNext = (): { value: number; temp: number } => {
        if (mode === 'heal') {
            return { value: Math.min(hp.value + numAmount, hp.max), temp: hp.temp };
        }
        if (mode === 'damage') {
            const tempAfter = Math.max(0, hp.temp - numAmount);
            const overflow = Math.max(0, numAmount - hp.temp);
            return { value: Math.max(0, hp.value - overflow), temp: tempAfter };
        }
        // temp: replace existing temp HP (D&D 5e: temp HP doesn't stack)
        return { value: hp.value, temp: numAmount };
    };

    const preview = computeNext();

    const handleApply = async () => {
        if (numAmount <= 0) {
            onClose();
            return;
        }
        await onApply(preview);
        onClose();
    };

    return (
        <BaseModal open onClose={onClose} title="Hit Points" maxWidth={360}>
            {/* Current HP summary */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                padding: 'var(--space-md) 0',
                borderBottom: '1px solid var(--theme-border)',
                marginBottom: 'var(--space-md)',
            }}>
                <Stat label="Current" value={`${hp.value}`} />
                <Stat label="Max" value={`${hp.max}`} />
                <Stat label="Temp" value={hp.temp > 0 ? `${hp.temp}` : '—'} />
            </div>

            {/* Mode tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: 'var(--space-md)' }}>
                {MODES.map(m => (
                    <button
                        key={m.id}
                        type="button"
                        onClick={() => setMode(m.id)}
                        style={{
                            padding: '8px 6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.05em',
                            background: mode === m.id ? m.color : 'var(--surface-elevated)',
                            color: mode === m.id ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                            border: `1px solid ${mode === m.id ? m.color : 'var(--theme-border)'}`,
                            borderRadius: 'var(--block-radius)',
                            cursor: 'pointer',
                            transition: 'all 0.1s',
                        }}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Numeric input */}
            <input
                type="number"
                inputMode="numeric"
                min={0}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                placeholder="0"
                style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '20px',
                    fontWeight: 700,
                    textAlign: 'center',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--theme-border)',
                    borderRadius: 'var(--block-radius)',
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                    marginBottom: 'var(--space-md)',
                }}
            />

            {/* Preview line */}
            {numAmount > 0 && (
                <div style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    marginBottom: 'var(--space-md)',
                }}>
                    After: {preview.value}/{hp.max} {preview.temp > 0 ? `(+${preview.temp} temp)` : ''}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} style={cancelButtonStyle}>
                    Cancel
                </button>
                <button type="button" onClick={handleApply} style={confirmButtonStyle} disabled={numAmount <= 0}>
                    Apply
                </button>
            </div>
        </BaseModal>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{
                fontSize: '9px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
            }}>
                {label}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {value}
            </div>
        </div>
    );
}

const cancelButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--theme-border)',
    borderRadius: 'var(--block-radius)',
    cursor: 'pointer',
};

const confirmButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    background: 'var(--theme-primary)',
    color: 'var(--text-on-accent)',
    border: '1px solid var(--theme-primary)',
    borderRadius: 'var(--block-radius)',
    cursor: 'pointer',
};
