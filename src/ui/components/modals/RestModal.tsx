'use client';

import React, { useState } from 'react';
import BaseModal from '../shared/BaseModal';

/**
 * RestModal — short / long rest configuration, modeled on the Foundry dnd5e
 * rest dialogs.
 *
 * Layout (matches the reference screenshots):
 *   Title (Short Rest | Long Rest) + small type switcher
 *   ┌─ ℹ Info banner ──────────────────────────┐
 *   │ Description of what this rest does       │
 *   └──────────────────────────────────────────┘
 *   REST CONFIGURATION
 *   ┌──────────────────────────────────────────┐
 *   │ New Day                            [   ] │
 *   │ Recover limited use abilities ...        │
 *   └──────────────────────────────────────────┘
 *   HIT POINTS (long rest)        |    HIT DICE (short rest)
 *   ┌──────────────────────────┐  |    ┌────────────────────────────┐
 *   │ Remove Temp HP    [✓]    │  |    │ [d8 (1 available) ▾]  [🎲]│
 *   │ Recover Max HP    [✓]    │  |    │ Auto Spend HD     [   ]   │
 *   └──────────────────────────┘  |    └────────────────────────────┘
 *   [        🛏 REST         ]
 *
 * The modal stays decoupled from the actor — it forwards a result object via
 * `onApply` and the caller handles `onUpdate` writes (HP regen, hit-dice
 * consumption, slot reset). Hit-dice rolling is a follow-up — the dropdown
 * here just collects the user's intent.
 */

type RestType = 'short' | 'long';

const LONG_REST_INFO = 'On a long rest you will recover hit points, hit dice, class resources, limited use item charges, and spell slots.';
const SHORT_REST_INFO = 'On a short rest you may spend remaining Hit Dice and recover item uses.';

export interface RestModalProps {
    initialType?: RestType;
    subtitle?: string;
    /**
     * Available hit dice grouped by denomination, e.g.
     * `{ d8: 3, d10: 0 }`. Used to populate the short-rest dropdown.
     */
    hitDice?: Record<string, number>;
    onApply: (result: {
        type: RestType;
        newDay: boolean;
        // long
        removeTempHp?: boolean;
        recoverMaxHp?: boolean;
        // short
        hitDieDenomination?: string;
        autoSpendHd?: boolean;
    }) => void | Promise<void>;
    onClose: () => void;
}

export default function RestModal({
    initialType = 'long',
    subtitle,
    hitDice,
    onApply,
    onClose,
}: RestModalProps) {
    const [type, setType] = useState<RestType>(initialType);

    // Shared
    const [newDay, setNewDay] = useState(false);

    // Long rest defaults — both checked, matching the screenshot.
    const [removeTempHp, setRemoveTempHp] = useState(true);
    const [recoverMaxHp, setRecoverMaxHp] = useState(true);

    // Short rest
    const denominations = Object.entries(hitDice ?? {})
        .filter(([, count]) => (count ?? 0) > 0);
    const [hitDieDenom, setHitDieDenom] = useState<string>(denominations[0]?.[0] ?? 'd8');
    const [autoSpendHd, setAutoSpendHd] = useState(false);

    const handleApply = async () => {
        if (type === 'long') {
            await onApply({ type, newDay, removeTempHp, recoverMaxHp });
        } else {
            await onApply({
                type,
                newDay,
                hitDieDenomination: hitDieDenom,
                autoSpendHd,
            });
        }
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

            {/* Title with small type switcher */}
            <h2 style={titleStyle}>{type === 'long' ? 'Long Rest' : 'Short Rest'}</h2>
            {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '6px', marginBottom: 'var(--space-md)' }}>
                <TypePill active={type === 'short'} onClick={() => setType('short')}>Short</TypePill>
                <TypePill active={type === 'long'} onClick={() => setType('long')}>Long</TypePill>
            </div>

            {/* Info banner */}
            <InfoBanner>
                {type === 'long' ? LONG_REST_INFO : SHORT_REST_INFO}
            </InfoBanner>

            {/* REST CONFIGURATION */}
            <SectionLabel>Rest Configuration</SectionLabel>
            <SectionBox>
                <ToggleRow
                    label="New Day"
                    description="Recover limited use abilities which recharge at dusk, dawn, or on a new day."
                    value={newDay}
                    onChange={setNewDay}
                />
            </SectionBox>

            {/* Long-rest options */}
            {type === 'long' && (
                <>
                    <SectionLabel>Hit Points</SectionLabel>
                    <SectionBox>
                        <ToggleRow
                            label="Remove Temp HP"
                            value={removeTempHp}
                            onChange={setRemoveTempHp}
                        />
                        <ToggleRow
                            label="Recover Max HP"
                            description="Remove any adjustments to a character's maximum Hit Points."
                            value={recoverMaxHp}
                            onChange={setRecoverMaxHp}
                        />
                    </SectionBox>
                </>
            )}

            {/* Short-rest options */}
            {type === 'short' && (
                <>
                    <SectionLabel>Hit Dice</SectionLabel>
                    <SectionBox>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                            <select
                                value={hitDieDenom}
                                onChange={e => setHitDieDenom(e.target.value)}
                                style={selectStyle}
                            >
                                {denominations.length > 0 ? (
                                    denominations.map(([denom, count]) => (
                                        <option key={denom} value={denom}>
                                            {denom} ({count} available)
                                        </option>
                                    ))
                                ) : (
                                    <option value="d8">d8 (— available)</option>
                                )}
                            </select>
                            <button
                                type="button"
                                aria-label="Roll hit die"
                                style={diceButtonStyle}
                                disabled
                                title="Hit-die rolling — wired in a follow-up"
                            >
                                🎲
                            </button>
                        </div>
                        <ToggleRow
                            label="Auto Spend HD"
                            description="Automatically spend hit dice until they run out or health is full."
                            value={autoSpendHd}
                            onChange={setAutoSpendHd}
                        />
                    </SectionBox>
                </>
            )}

            {/* REST button */}
            <button
                type="button"
                onClick={handleApply}
                style={restButtonStyle}
            >
                <span style={{ fontSize: '14px' }}>🛏</span>
                Rest
            </button>
        </BaseModal>
    );
}

/* ------- Subcomponents ------- */

function TypePill({ active, onClick, children }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            style={{
                padding: '2px 12px',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                background: active ? 'var(--theme-primary)' : 'transparent',
                color: active ? 'var(--text-on-accent)' : 'var(--text-muted)',
                border: active ? '1px solid var(--theme-primary)' : '1px solid var(--theme-border)',
                borderRadius: '999px',
                cursor: 'pointer',
            }}
        >
            {children}
        </button>
    );
}

function InfoBanner({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            padding: 'var(--space-sm) var(--space-md)',
            background: 'var(--theme-glow)',
            border: '1px solid var(--theme-border)',
            borderRadius: 'var(--block-radius)',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            lineHeight: 1.5,
            marginBottom: 'var(--space-md)',
        }}>
            <span style={{
                flexShrink: 0,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'var(--theme-primary)',
                color: 'var(--text-on-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
            }}>
                i
            </span>
            <span>{children}</span>
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            fontSize: '9px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.1em',
            marginBottom: '4px',
        }}>
            {children}
        </div>
    );
}

function SectionBox({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            padding: 'var(--space-sm) var(--space-md)',
            border: '1px solid var(--theme-border)',
            borderRadius: 'var(--block-radius)',
            background: 'var(--surface-elevated)',
            marginBottom: 'var(--space-md)',
        }}>
            {children}
        </div>
    );
}

function ToggleRow({ label, description, value, onChange }: {
    label: string;
    description?: string;
    value: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 'var(--space-sm)',
            alignItems: 'center',
            padding: '6px 0',
            cursor: 'pointer',
        }}>
            <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {label}
                </div>
                {description && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                        {description}
                    </div>
                )}
            </div>
            <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                border: '1px solid var(--theme-border)',
                background: value ? 'var(--theme-primary)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-on-accent)',
                fontSize: '13px',
                fontWeight: 700,
                flexShrink: 0,
            }}>
                {value ? '✓' : ''}
            </div>
            <input
                type="checkbox"
                checked={value}
                onChange={e => onChange(e.target.checked)}
                style={{ display: 'none' }}
            />
        </label>
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
};

const selectStyle: React.CSSProperties = {
    flex: 1,
    padding: '6px 10px',
    fontSize: '12px',
    background: 'var(--surface-card)',
    border: '1px solid var(--theme-border)',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    boxSizing: 'border-box',
};

const diceButtonStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    background: 'var(--surface-card)',
    border: '1px solid var(--theme-border)',
    borderRadius: '4px',
    color: 'var(--theme-primary)',
    fontSize: '14px',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const restButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    background: 'var(--theme-primary)',
    color: 'var(--text-on-accent)',
    border: '1px solid var(--theme-primary)',
    borderRadius: 'var(--block-radius)',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
};
