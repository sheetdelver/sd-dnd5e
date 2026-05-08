'use client';

import React from 'react';
import { resolveImage } from '@sheet-delver/sdk';
import { useModal } from '../shared/useModal';
import { useSheetSetting } from '../shared/useSheetSetting';

/**
 * MobileHeader — compact header for the mobile character sheet view.
 * Dark background with class-colored accents.
 *
 * Layout (matching D&D Beyond mobile reference):
 * ┌──────────────────────────────────────────────────┐
 * │ [Portrait] Name  MANAGE  ⚙  HIT POINTS: 30/30  │
 * │            Race · Class · Lvl   HEROIC INSPIRATION │
 * ├──────────────────────────────────────────────────┤
 * │ PROF +2 | WALK 30ft. | INIT -1 | AC 17 | DEF/COND │
 * ├──────────────────────────────────────────────────┤
 * │ CAMPAIGN: Phandelver a…                      ▶  │
 * └──────────────────────────────────────────────────┘
 */

interface Props {
    actor: Record<string, any>;
    derived: Record<string, any>;
    foundryUrl?: string;
}

export default function MobileHeader({ actor, derived, foundryUrl }: Props) {
    const imgSrc = resolveImage(actor.img ?? '', foundryUrl);
    const subtitle = [derived.race, derived.classes].filter(Boolean).join(' · ');
    const level = derived.level ?? 0;
    const hp = derived.hp ?? { value: 0, max: 0 };
    const profBonus = derived.profBonus ?? 2;
    const walk = derived.speed?.walk ?? 30;
    const initiative = derived.initiative ?? 0;
    const ac = derived.ac ?? 10;
    const inspiration = derived.inspiration ?? false;
    const profFmt = profBonus >= 0 ? `+${profBonus}` : `${profBonus}`;
    const initFmt = initiative >= 0 ? `+${initiative}` : `${initiative}`;
    const { openModal } = useModal();
    const [theme, setTheme] = useSheetSetting<string>('theme', 'paladin');

    return (
        <header style={{ background: 'var(--surface-header)' }}>
            {/* ---- Row 1: Portrait + Identity + HP ---- */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px 8px',
                borderBottom: '1px solid var(--theme-border)',
            }}>
                {/* Portrait */}
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid var(--theme-border)',
                    background: 'var(--surface-elevated)',
                    flexShrink: 0,
                    boxShadow: '0 0 6px var(--theme-glow)',
                }}>
                    <img
                        src={imgSrc}
                        alt={actor.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>

                {/* Name + Subtitle */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h1 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            margin: 0,
                            fontFamily: 'var(--font-heading)',
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap' as const,
                        }}>
                            {actor.name}
                        </h1>
                        {/* THEME button — opens ThemeModal */}
                        <button
                            type="button"
                            onClick={() => openModal('theme', { current: theme, onSelect: setTheme })}
                            style={{
                                fontSize: '8px',
                                padding: '1px 6px',
                                border: '1px solid var(--theme-border)',
                                borderRadius: '3px',
                                background: 'transparent',
                                color: 'var(--theme-primary)',
                                textTransform: 'uppercase' as const,
                                letterSpacing: '0.05em',
                                flexShrink: 0,
                                cursor: 'pointer',
                                fontWeight: 600,
                            }}
                        >
                            THEME
                        </button>
                    </div>
                    <p style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        margin: '2px 0 0',
                    }}>
                        {subtitle}
                        {level > 0 && <span style={{ marginLeft: '4px' }}>Level {level}</span>}
                    </p>
                </div>

                {/* STUB: Settings icon */}
                <div style={{
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    flexShrink: 0,
                }}>
                    ⚙
                </div>

                {/* Hit Points compact display */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    flexShrink: 0,
                }}>
                    <span style={{
                        fontSize: '8px',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                    }}>
                        HIT POINTS
                    </span>
                    <span style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)',
                        lineHeight: 1.1,
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {hp.value}<span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '14px' }}>/</span>{hp.max}
                    </span>
                    <span style={{
                        fontSize: '8px',
                        color: inspiration ? 'var(--theme-primary)' : 'var(--text-muted)',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                    }}>
                        {inspiration ? '★ HEROIC INSPIRATION' : 'NO INSPIRATION'}
                    </span>
                </div>
            </div>

            {/* ---- Row 2: Stat chips — Prof, Speed, Init, AC + Defenses/Conditions ---- */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                borderBottom: '1px solid var(--theme-border)',
                overflowX: 'auto',
            }}>
                {/* Stat chip: Proficiency Bonus */}
                <StatChip label="BONUS" title="PROFICIENCY" value={profFmt} />
                {/* Stat chip: Walking Speed */}
                <StatChip label="SPEED" title="WALKING" value={`${walk} ft.`} />
                {/* Stat chip: Initiative */}
                <StatChip label="INITIATIVE" value={initFmt} bordered />
                {/* Stat chip: Armor Class */}
                <StatChip label="CLASS" title="ARMOR" value={String(ac)} />

                {/* Defenses + Conditions buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: 'auto', flexShrink: 0 }}>
                    <button style={{
                        padding: '3px 8px',
                        fontSize: '9px',
                        fontWeight: 700,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                        background: 'transparent',
                        border: '1px solid var(--theme-border)',
                        borderRadius: '3px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                    }} disabled>
                        DEFENSES
                    </button>
                    <button style={{
                        padding: '3px 8px',
                        fontSize: '9px',
                        fontWeight: 700,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                        background: 'transparent',
                        border: '1px solid var(--theme-border)',
                        borderRadius: '3px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                    }} disabled>
                        CONDITIONS
                    </button>
                </div>
            </div>

            {/* ---- Row 3: Campaign bar ---- */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderBottom: '2px solid var(--theme-border)',
            }}>
                <span style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase' as const,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    flexShrink: 0,
                }}>
                    CAMPAIGN:
                </span>
                <span style={{
                    flex: 1,
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' as const,
                    border: '1px solid var(--theme-border)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                }}>
                    Campaign Name...
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px', flexShrink: 0 }}>▶</span>
            </div>
        </header>
    );
}

/**
 * StatChip — compact stat display used in the mobile header stats strip.
 */
function StatChip({ title, label, value, bordered }: {
    title?: string;
    label: string;
    value: string;
    bordered?: boolean;
}) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '4px 10px',
            border: bordered ? '1px solid var(--theme-border)' : 'none',
            borderRadius: bordered ? 'var(--block-radius)' : '0',
            minWidth: '56px',
            flexShrink: 0,
        }}>
            {title && (
                <span style={{
                    fontSize: '8px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                }}>
                    {title}
                </span>
            )}
            <span style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                lineHeight: 1.1,
            }}>
                {value}
            </span>
            <span style={{
                fontSize: '8px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                fontWeight: 600,
            }}>
                {label}
            </span>
        </div>
    );
}
