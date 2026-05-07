'use client';

import React, { useState } from 'react';

/**
 * Skills block — full skill list with columnar layout.
 * Columns: PROF (proficiency indicator) | MOD (ability) | SKILL (name) | BONUS (modifier).
 * Dark themed with themed border, matching the D&D Beyond standard view.
 */

// Skill display order
const SKILL_ORDER = [
    'acr', 'ani', 'arc', 'ath', 'dec', 'his', 'ins', 'itm',
    'inv', 'med', 'nat', 'prc', 'prf', 'per', 'rel', 'slt', 'ste', 'sur',
];

// Proficiency multiplier → dot indicator
const PROF_DOT: Record<string, string> = { '0': '○', '0.5': '◐', '1': '●', '2': '◉' };
const PROF_DOT_COLOR: Record<string, string> = {
    '0': 'var(--prof-none)',
    '0.5': 'var(--prof-half)',
    '1': 'var(--prof-full)',
    '2': 'var(--prof-expert)',
};

interface SkillData {
    total: number;
    prof: number;
    ability: string;
    label: string;
}

interface Props {
    skills?: Record<string, SkillData>;
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

export default function Skills({ skills, onRoll }: Props) {
    const [expanded, setExpanded] = useState(true); // default expanded in standard view
    if (!skills) return null;

    const ordered = SKILL_ORDER.filter(k => skills[k]);

    return (
        <div className="block-card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Column headers */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '28px 40px 1fr 48px',
                alignItems: 'center',
                padding: '8px 12px',
                borderBottom: '1px solid var(--theme-border)',
                background: 'var(--surface-elevated)',
            }}>
                <span style={{
                    fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                }}>PROF</span>
                <span style={{
                    fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                }}>MOD</span>
                <span style={{
                    fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                }}>SKILL</span>
                <span style={{
                    fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                    textAlign: 'right',
                }}>BONUS</span>
            </div>

            {/* Skill rows */}
            {ordered.map((key, i) => {
                const skill = skills[key];
                const profKey = String(skill.prof);
                const dot = PROF_DOT[profKey] ?? '○';
                const dotColor = PROF_DOT_COLOR[profKey] ?? 'var(--prof-none)';
                return (
                    <button
                        key={key}
                        onClick={() => onRoll?.('skill', key)}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '28px 40px 1fr 48px',
                            alignItems: 'center',
                            width: '100%',
                            padding: '6px 12px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: i < ordered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                        {/* Proficiency indicator */}
                        <span style={{ fontSize: '12px', color: dotColor }}>{dot}</span>
                        {/* Ability modifier */}
                        <span style={{
                            fontSize: '10px',
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase' as const,
                            fontWeight: 600,
                        }}>
                            {skill.ability}
                        </span>
                        {/* Skill name */}
                        <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                            {skill.label}
                        </span>
                        {/* Bonus value */}
                        <span style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                        }}>
                            {skill.total >= 0 ? `+${skill.total}` : skill.total}
                        </span>
                    </button>
                );
            })}

            {/* Footer label */}
            <div style={{
                textAlign: 'center',
                padding: '6px',
                borderTop: '1px solid var(--theme-border)',
            }}>
                <span style={{
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                }}>
                    Additional Skills
                </span>
            </div>
            <div style={{
                textAlign: 'center',
                padding: '4px 0 8px',
                borderTop: '1px solid var(--theme-border)',
            }}>
                <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.1em',
                }}>
                    SKILLS ⚙
                </span>
            </div>
        </div>
    );
}
