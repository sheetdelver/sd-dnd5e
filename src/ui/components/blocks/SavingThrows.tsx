'use client';

import React from 'react';
import { useModal } from '../shared/useModal';
import { useSheet } from '../shared/SheetContext';
import { ABILITY_FULL_NAME } from '../shared/abilityNames';
import type { PreparedNumericD20 } from '../../../logic/preparation/d20-configuration';
import { usePreparedRollIntent } from '../shared/usePreparedRollIntent';
import ProficiencyIndicator from '../shared/ProficiencyIndicator';

const SAVE_ORDER = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
const SAVE_LABEL: Record<string, string> = {
    str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA',
};

interface AbilityData {
    save: number | null;
    saveProficient: boolean | null;
    saveRoll?: PreparedNumericD20;
}

interface Props {
    abilities?: Record<string, AbilityData>;
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

export default function SavingThrows({ abilities, onRoll }: Props) {
    const { openModal } = useModal();
    const { actor } = useSheet();
    const { canRoll, review } = usePreparedRollIntent('save', onRoll);

    const handleClick = (e: React.MouseEvent, key: string) => {
        const intent = review(key);
        if (!intent) return;
        if (e.shiftKey) {
            if(intent.quickAvailable)void intent.onConfirm();
            return;
        }
        openModal('roll', {
            rollType: 'save',
            rollKey: key,
            label: `${ABILITY_FULL_NAME[key] ?? key} Saving Throw`,
            subtitle: actor?.name,
            formula: abilities?.[key]?.saveRoll?.formula,
            ...intent,
        });
    };

    return (
        <div className="block-card">
            <h2 className="block-heading">Saving Throws</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                {SAVE_ORDER.map(key => {
                    const ab = abilities?.[key];
                    const save = ab?.save ?? null;
                    const proficient = ab?.saveProficient;
                    const formatted = save === null ? '—' : save >= 0 ? `+${save}` : `${save}`;
                    return (
                        <button
                            key={key}
                            aria-label={`${ABILITY_FULL_NAME[key] ?? key} Saving Throw`}
                            onClick={(e) => handleClick(e, key)}
                            disabled={!canRoll(key)}
                            title={ab?.saveRoll?.unavailableReason??ab?.saveRoll?.defaultUnavailableReason}
                            style={{
                                textAlign: 'center',
                                padding: '8px 4px',
                                borderRadius: 'var(--block-radius)',
                                border: '1px solid var(--theme-border)',
                                background: 'transparent',
                                cursor: ab ? 'pointer' : 'default',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => {
                                if (ab) e.currentTarget.style.background = 'var(--surface-elevated)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <div style={{
                                fontSize: '9px',
                            }}>
                                <ProficiencyIndicator value={proficient===true?1:proficient===false?0:null} label={`${ABILITY_FULL_NAME[key]??key} saving throw roll proficiency`} reason={ab?.saveRoll?.unavailableReason}/>
                            </div>
                            <div style={{
                                fontSize: '10px',
                                color: 'var(--text-secondary)',
                                textTransform: 'uppercase' as const,
                                letterSpacing: '0.05em',
                            }}>
                                {SAVE_LABEL[key]}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                {formatted}
                            </div>
                            {(ab?.saveRoll?.unavailableReason??ab?.saveRoll?.defaultUnavailableReason) && <small>{ab?.saveRoll?.unavailableReason??ab?.saveRoll?.defaultUnavailableReason}</small>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
