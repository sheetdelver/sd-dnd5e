'use client';

import React from 'react';
import { useModal } from '../shared/useModal';
import { useSheet } from '../shared/SheetContext';
import { ABILITY_FULL_NAME } from '../shared/abilityNames';
import { usePreparedRollIntent } from '../shared/usePreparedRollIntent';
import {rollBonusLabel} from '../shared/rollBonusLabel';
import ProficiencyIndicator from '../shared/ProficiencyIndicator';

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

interface SkillData {
    proficiencyTerm?:string;
    total: number | null;
    prof: number | null;
    ability: string;
    label: string;
    formula?: string | null;
    unavailableReason?: string;
    defaultUnavailableReason?:string;
    preparationNote?:string;
}

interface Props {
    skills?: Record<string, SkillData>;
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

export default function Skills({ skills, onRoll }: Props) {
    const { openModal } = useModal();
    const { actor } = useSheet();
    const { canRoll, review } = usePreparedRollIntent('skill', onRoll);
    if (!skills) return null;

    const ordered = SKILL_ORDER.filter(k => skills[k]);

    const handleClick = (e: React.MouseEvent, key: string) => {
        const skill = skills[key];
        const intent = review(key);
        if (!intent) return;
        if (e.shiftKey) {
            if(intent.quickAvailable)void intent.onConfirm();
            return;
        }
        const abilityName = ABILITY_FULL_NAME[skill.ability] ?? skill.ability;

        openModal('roll', {
            rollType: 'skill',
            rollKey: key,
            label: `${abilityName} (${skill.label}) Check`,
            subtitle: actor?.name,
            formula: skill.formula,
            ...intent,
        });
    };

    return (
        <div className="block-card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Column headers */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `28px 40px minmax(0,1fr) ${Object.values(skills??{}).some(row=>row.proficiencyTerm)?'140px':'48px'}`,
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
                return (
                    <button
                        key={key}
                        disabled={!canRoll(key)}
                        title={skill.unavailableReason??skill.defaultUnavailableReason}
                        onClick={(e) => handleClick(e, key)}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `28px 40px minmax(0,1fr) ${Object.values(skills??{}).some(row=>row.proficiencyTerm)?'140px':'48px'}`,
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
                        <span style={{fontSize:'12px'}}><ProficiencyIndicator value={skill.prof} label={`${skill.label} roll proficiency`} reason={skill.unavailableReason}/></span>
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
                            {skill.preparationNote && <small style={{display:'block',color:'var(--text-muted)'}}>{skill.preparationNote}</small>}
                            {(skill.unavailableReason??skill.defaultUnavailableReason) && <small style={{ display: 'block', color: 'var(--text-muted)' }}>{skill.unavailableReason??skill.defaultUnavailableReason}</small>}
                        </span>
                        {/* Bonus value */}
                        <span style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',overflowWrap:'anywhere',
                        }}>
                            {rollBonusLabel(skill)}
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
