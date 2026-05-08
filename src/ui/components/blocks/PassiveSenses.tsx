'use client';

import React from 'react';

interface SensesData {
    darkvision?: number;
    blindsight?: number;
    tremorsense?: number;
    truesight?: number;
    special?: string;
}

interface Props {
    perception?: number;
    investigation?: number;
    insight?: number;
    senses?: SensesData;
}

export default function PassiveSenses({ perception = 10, investigation = 10, insight = 10, senses }: Props) {
    const items = [
        { label: 'Perception', value: perception },
        { label: 'Investigation', value: investigation },
        { label: 'Insight', value: insight },
    ];

    const specialSenses: string[] = [];
    if (senses?.darkvision) specialSenses.push(`Darkvision ${senses.darkvision} ft.`);
    if (senses?.blindsight) specialSenses.push(`Blindsight ${senses.blindsight} ft.`);
    if (senses?.tremorsense) specialSenses.push(`Tremorsense ${senses.tremorsense} ft.`);
    if (senses?.truesight) specialSenses.push(`Truesight ${senses.truesight} ft.`);
    if (senses?.special) specialSenses.push(senses.special);

    return (
        <div className="block-card">
            <h2 className="block-heading">Passive Senses</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '8px' }}>
                {items.map(sense => (
                    <div key={sense.label} style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: '2px solid var(--theme-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 4px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            color: 'var(--text-primary)',
                        }}>
                            {sense.value}
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                            {sense.label}
                        </div>
                    </div>
                ))}
            </div>
            {specialSenses.length > 0 && (
                <div style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--theme-border)',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                }}>
                    {specialSenses.join(' · ')}
                </div>
            )}
        </div>
    );
}
