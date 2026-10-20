'use client';

import React, { useMemo, useState } from 'react';
import RollModalFrame, { ConfigRow, AdvantageButton, inputStyle, selectStyle } from './RollModalFrame';

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
    /** Shared prepared-rule compiler; null disables unsupported choices. */
    resolveFormula?: (options: Record<string, unknown>) => string | null;
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
    resolveFormula,
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
        if (resolveFormula) return resolveFormula({ ...configValues, ...(bonus.trim() ? { situationalBonus: bonus.trim() } : {}) });
        if (computeFormula) return computeFormula(ctx);
        const base = formula ?? '1d20';
        const trimmed = bonus.trim();
        return trimmed ? `${base} + ${trimmed}` : base;
    }, [formula, computeFormula, resolveFormula, configValues, bonus]);

    const submit = async (advantage: Advantage) => {
        const trimmed = bonus.trim();
        const options: Record<string, unknown> = {
            rollMode,
            advantage,
            ...configValues,
        };
        if (trimmed) options.situationalBonus = trimmed;
        if (resolveFormula && !resolveFormula(options)) return;
        await onConfirm(options);
        onClose();
    };

    return (
        <RollModalFrame title={label ?? 'Roll'} subtitle={subtitle} onClose={onClose}>
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
                    {displayedFormula ?? 'Unavailable: use a numeric situational bonus'}
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
                aria-label="Situational bonus"
                aria-invalid={displayedFormula === null}
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
                <AdvantageButton disabled={displayedFormula === null} onClick={() => submit('adv')}>Advantage</AdvantageButton>
                <AdvantageButton disabled={displayedFormula === null} onClick={() => submit('normal')} primary>Normal</AdvantageButton>
                <AdvantageButton disabled={displayedFormula === null} onClick={() => submit('dis')}>Disadvantage</AdvantageButton>
            </div>
        </RollModalFrame>
    );
}
