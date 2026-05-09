'use client';

import React, { useMemo, useState } from 'react';
import BaseModal from '../shared/BaseModal';

/**
 * RollModal — pre-flight dialog for any roll, modeled on the Foundry dnd5e
 * `RollConfigurationDialog`.
 *
 * Layout:
 *   Title           ×
 *   Subtitle (character or item)
 *   1d20 + 2 + @bonus              Formula     ← live-updates with bonus + config
 *   [Situational Bonus? input]
 *   ── CONFIGURATION ──
 *   ┌────────────────────────────┐
 *   │ <configFields rows>        │  e.g. Abilities | Attack Mode | Roll Mode
 *   │ Roll Mode  [Public ▾]      │
 *   └────────────────────────────┘
 *   [ADVANTAGE] [NORMAL] [DISADVANTAGE]
 *
 * The three buttons each *submit* the roll with their corresponding mode.
 * Shift-click at the trigger site bypasses this modal entirely (quick-roll).
 */

type Advantage = 'normal' | 'adv' | 'dis';
type RollMode = 'publicroll' | 'gmroll' | 'blindroll' | 'selfroll';

const ROLL_MODE_OPTIONS: { value: RollMode; label: string }[] = [
    { value: 'publicroll', label: 'Public Roll' },
    { value: 'gmroll',     label: 'Private GM Roll' },
    { value: 'blindroll',  label: 'Blind GM Roll' },
    { value: 'selfroll',   label: 'Self Roll' },
];

/** A single configurable dropdown row inside the CONFIGURATION section. */
export interface ConfigField {
    key: string;
    label: string;
    initialValue: string;
    options: { value: string; label: string }[];
}

/**
 * Live formula context — passed to `computeFormula` whenever the user changes
 * a configField or types in the situational bonus input. Includes every
 * configField's current value plus the situational bonus string.
 */
export interface FormulaContext extends Record<string, string> {
    situationalBonus: string;
}

export interface RollModalProps {
    rollType: string;
    rollKey: string;
    /** Primary heading (e.g. "Dexterity (Acrobatics) Check", "Attack Roll"). */
    label?: string;
    /** Smaller line under the title (character name, item name). */
    subtitle?: string;
    /**
     * Initial formula to display. When `computeFormula` is omitted, the modal
     * just appends ` + <situationalBonus>` to this string. When provided,
     * `computeFormula` takes over and replaces the displayed formula on every
     * state change.
     */
    formula?: string;
    /**
     * Optional reactive formula function. Receives the live config values +
     * situational bonus and returns the formula string to display. Use this
     * for cases where the formula depends on a config dropdown (e.g. skill
     * checks where switching the ability re-derives the total).
     */
    computeFormula?: (ctx: FormulaContext) => string;
    /** Placeholder text for the situational bonus input. */
    bonusPlaceholder?: string;
    /** Roll-type-specific dropdowns (e.g. Abilities, Attack Mode). */
    configFields?: ConfigField[];
    /**
     * Called when one of the advantage buttons is clicked. Options carry
     * advantage, rollMode, situationalBonus, and any custom configField values.
     */
    onConfirm: (options: Record<string, unknown>) => void | Promise<void>;
    onClose: () => void;
}

export default function RollModal({
    label,
    subtitle,
    formula,
    computeFormula,
    bonusPlaceholder = 'Situational Bonus?',
    configFields = [],
    onConfirm,
    onClose,
}: RollModalProps) {
    const [rollMode, setRollMode] = useState<RollMode>('publicroll');
    const [bonus, setBonus] = useState<string>('');
    const [configValues, setConfigValues] = useState<Record<string, string>>(() =>
        Object.fromEntries(configFields.map(f => [f.key, f.initialValue]))
    );

    // Live formula recompute. If the call site passed `computeFormula`, use it
    // (skill ability swap, attack-mode-aware formulas, etc.). Otherwise, just
    // append the situational bonus to the static base formula so the user can
    // see what they typed flowing into the roll.
    const displayedFormula = useMemo(() => {
        const ctx: FormulaContext = { ...configValues, situationalBonus: bonus };
        if (computeFormula) return computeFormula(ctx);
        const base = formula ?? '1d20';
        const trimmed = bonus.trim();
        return trimmed ? `${base} + ${trimmed}` : base;
    }, [formula, computeFormula, configValues, bonus]);

    const submit = async (advantage: Advantage) => {
        const trimmed = bonus.trim();
        const options: Record<string, unknown> = {
            rollMode,
            advantage,
            ...configValues,
        };
        if (trimmed) options.situationalBonus = trimmed;
        await onConfirm(options);
        onClose();
    };

    return (
        <BaseModal open onClose={onClose} maxWidth={420}>
            {/* Close button */}
            <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                style={closeButtonStyle}
            >
                ×
            </button>

            {/* Title + subtitle */}
            <h2 style={titleStyle}>{label ?? 'Roll'}</h2>
            {subtitle && <div style={subtitleStyle}>{subtitle}</div>}

            {/* Formula row — live updates with bonus + config */}
            <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 'var(--space-sm)',
                marginTop: 'var(--space-md)',
                marginBottom: 'var(--space-sm)',
            }}>
                <span style={{
                    fontSize: '15px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                }}>
                    {displayedFormula}
                </span>
                <span style={{
                    fontSize: '11px',
                    fontStyle: 'italic',
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                }}>
                    Formula
                </span>
            </div>

            {/* Situational bonus input */}
            <input
                type="text"
                value={bonus}
                onChange={e => setBonus(e.target.value)}
                placeholder={bonusPlaceholder}
                style={inputStyle}
            />

            {/* CONFIGURATION header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                margin: 'var(--space-md) 0 var(--space-xs)',
            }}>
                <span style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.1em',
                    flexShrink: 0,
                }}>
                    Configuration
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--theme-border)', opacity: 0.5 }} />
            </div>

            <div style={{
                padding: 'var(--space-sm) var(--space-md)',
                border: '1px solid var(--theme-border)',
                borderRadius: 'var(--block-radius)',
                background: 'var(--surface-elevated)',
                marginBottom: 'var(--space-md)',
            }}>
                {configFields.map(field => (
                    <ConfigRow key={field.key} label={field.label}>
                        <select
                            value={configValues[field.key]}
                            onChange={e => setConfigValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                            style={selectStyle}
                        >
                            {field.options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </ConfigRow>
                ))}
                <ConfigRow label="Roll Mode">
                    <select
                        value={rollMode}
                        onChange={e => setRollMode(e.target.value as RollMode)}
                        style={selectStyle}
                    >
                        {ROLL_MODE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </ConfigRow>
            </div>

            {/* Advantage / Normal / Disadvantage — each submits the roll */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)' }}>
                <AdvantageButton onClick={() => submit('adv')}>Advantage</AdvantageButton>
                <AdvantageButton onClick={() => submit('normal')} primary>Normal</AdvantageButton>
                <AdvantageButton onClick={() => submit('dis')}>Disadvantage</AdvantageButton>
            </div>
        </BaseModal>
    );
}

function ConfigRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.6fr',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            padding: '4px 0',
        }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {label}
            </span>
            {children}
        </div>
    );
}

function AdvantageButton({ onClick, primary, children }: {
    onClick: () => void;
    primary?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: '10px 4px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                background: primary ? 'var(--theme-glow)' : 'var(--surface-elevated)',
                color: primary ? 'var(--theme-primary)' : 'var(--text-primary)',
                border: primary ? '1px solid var(--theme-primary)' : '1px solid var(--theme-border)',
                borderRadius: 'var(--block-radius)',
                cursor: 'pointer',
                transition: 'all 0.1s',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 0 8px var(--theme-glow)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {children}
        </button>
    );
}

const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '28px',
    height: '28px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '20px',
    lineHeight: 1,
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
};

const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    textAlign: 'center',
    margin: '4px 0 4px',
    paddingRight: '24px',
    paddingLeft: '24px',
};

const subtitleStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginBottom: '4px',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '13px',
    background: 'var(--surface-elevated)',
    border: '1px solid var(--theme-border)',
    borderRadius: 'var(--block-radius)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px 8px',
    fontSize: '12px',
    background: 'var(--surface-card)',
    border: '1px solid var(--theme-border)',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    boxSizing: 'border-box',
};
