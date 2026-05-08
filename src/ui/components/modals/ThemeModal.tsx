'use client';

import React from 'react';
import BaseModal from '../shared/BaseModal';

/**
 * ThemeModal — class-themed palette switcher.
 *
 * Renders one preview card per theme defined in `dnd5e.css`. Each card uses
 * its own `data-theme` so the CSS variables paint the swatch — no need to
 * duplicate the color values here.
 *
 * Triggered from the THEME button in Header / MobileHeader; persists via
 * `useSheetSetting('theme', …)` at the call site.
 */

const THEMES = [
    'barbarian', 'bard', 'cleric', 'druid',
    'fighter', 'monk', 'paladin', 'ranger',
    'rogue', 'sorcerer', 'warlock', 'wizard',
] as const;

export interface ThemeModalProps {
    current: string;
    onSelect: (theme: string) => void;
    onClose: () => void;
}

export default function ThemeModal({ current, onSelect, onClose }: ThemeModalProps) {
    return (
        <BaseModal open onClose={onClose} title={`Theme — ${current}`} maxWidth={520}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-sm)',
            }}>
                {THEMES.map(name => {
                    const isActive = name === current;
                    return (
                        <button
                            key={name}
                            type="button"
                            data-theme={name}
                            aria-pressed={isActive}
                            onClick={() => {
                                onSelect(name);
                                onClose();
                            }}
                            style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '14px 8px 10px',
                                background: isActive ? 'var(--theme-glow)' : 'var(--surface-elevated)',
                                outline: isActive ? '3px solid var(--theme-primary)' : 'none',
                                outlineOffset: isActive ? '2px' : '0',
                                border: '2px solid var(--theme-border)',
                                borderRadius: 'var(--block-radius)',
                                cursor: 'pointer',
                                transition: 'box-shadow 0.15s, transform 0.1s',
                                boxShadow: isActive ? '0 0 16px var(--theme-glow)' : 'none',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.boxShadow = '0 0 16px var(--theme-glow)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.boxShadow = isActive ? '0 0 16px var(--theme-glow)' : 'none';
                            }}
                        >
                            {/* Active checkmark badge — top-right corner */}
                            {isActive && (
                                <span
                                    aria-label="Active"
                                    style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        right: '-8px',
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        background: 'var(--theme-primary)',
                                        color: 'var(--text-on-accent)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                        border: '2px solid var(--surface-card)',
                                    }}
                                >
                                    ✓
                                </span>
                            )}

                            {/* Color swatches reading from this card's data-theme */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <span style={{
                                    width: '14px', height: '14px', borderRadius: '50%',
                                    background: 'var(--theme-primary)',
                                    border: '1px solid var(--theme-border)',
                                }} />
                                <span style={{
                                    width: '14px', height: '14px', borderRadius: '50%',
                                    background: 'var(--theme-accent)',
                                    border: '1px solid var(--theme-border)',
                                }} />
                                <span style={{
                                    width: '14px', height: '14px', borderRadius: '50%',
                                    background: 'var(--theme-glow)',
                                    border: '1px solid var(--theme-border)',
                                }} />
                            </div>
                            <span style={{
                                fontSize: '12px',
                                fontWeight: isActive ? 700 : 600,
                                textTransform: 'capitalize' as const,
                                color: 'var(--theme-primary)',
                                letterSpacing: '0.03em',
                            }}>
                                {name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </BaseModal>
    );
}
