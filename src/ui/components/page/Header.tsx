'use client';

import React from 'react';
import { resolveImage } from '@sheet-delver/sdk';
import { useModal } from '../shared/useModal';
import { useSheetSetting } from '../shared/useSheetSetting';

/**
 * Header — top-level character identity and utility bar.
 * Dark themed with class-colored accents.
 * Portrait, name, race/class/level, rest buttons, campaign info.
 */

interface Props {
    actor: Record<string, any>;
    derived: Record<string, any>;
    foundryUrl?: string;
}

export default function Header({ actor, derived, foundryUrl }: Props) {
    const imgSrc = resolveImage(actor.img ?? '', foundryUrl);
    const subtitle = [derived.race, derived.classes].filter(Boolean).join(' • ');
    const level = derived.level ?? 0;
    const { openModal } = useModal();
    const [theme, setTheme] = useSheetSetting<string>('theme', 'paladin');

    return (
        <header style={{
            background: 'var(--surface-header)',
            borderBottom: '2px solid var(--theme-border)',
            padding: 'var(--space-md) var(--space-xl)',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-lg)',
                maxWidth: '1200px',
                margin: '0 auto',
            }}>
                {/* Character portrait */}
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid var(--theme-border)',
                    background: 'var(--surface-elevated)',
                    flexShrink: 0,
                    boxShadow: '0 0 8px var(--theme-glow)',
                }}>
                    <img
                        src={imgSrc}
                        alt={actor.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>

                {/* Character identity */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <h1 style={{
                            fontSize: '20px',
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
                                fontSize: '9px',
                                padding: '2px 8px',
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
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        margin: '2px 0 0',
                    }}>
                        {subtitle}
                        {level > 0 && <span style={{ marginLeft: '4px' }}>Level {level}</span>}
                    </p>
                </div>

                {/* Rest buttons */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexShrink: 0 }}>
                    <button
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '8px 16px',
                            borderRadius: 'var(--block-radius)',
                            border: '1px solid var(--theme-border)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                        }}
                        disabled
                    >
                        ☾ SHORT REST
                    </button>
                    <button
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '8px 16px',
                            borderRadius: 'var(--block-radius)',
                            border: '1px solid var(--theme-border)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                        }}
                        disabled
                    >
                        ◯ LONG REST
                    </button>
                </div>

                {/* STUB: Campaign info */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    padding: '8px 12px',
                    border: '1px solid var(--theme-border)',
                    borderRadius: 'var(--block-radius)',
                    flexShrink: 0,
                    maxWidth: '220px',
                }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' as const, flexShrink: 0 }}>
                        CAMPAIGN:
                    </span>
                    <span style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                    }}>
                        Campaign Name...
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', flexShrink: 0 }}>▶</span>
                </div>

                {/* STUB: Inspiration star */}
                <div style={{
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: 'var(--theme-primary)',
                    cursor: 'pointer',
                    flexShrink: 0,
                }}>
                    ✦
                </div>
            </div>
        </header>
    );
}
