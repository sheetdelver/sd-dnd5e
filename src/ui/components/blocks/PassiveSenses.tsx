'use client';

import React from 'react';
import type {SensesFacts} from '../../../logic/preparation/movement';
import {sensesProjection} from '../../../logic/preparation/movement';
import {SensesReadout} from '../shared/MovementFacts';


interface Props {
    perception?: number | null;
    investigation?: number | null;
    insight?: number | null;
    senses?: SensesFacts;
}

export default function PassiveSenses({ perception, investigation, insight, senses }: Props) {
    const items = [
        { label: 'Perception', value: perception },
        { label: 'Investigation', value: investigation },
        { label: 'Insight', value: insight },
    ];


    return (
        <div className="block-card">
            <h2 className="block-heading">Passive Senses</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '8px' }}>
                {items.map(sense => (
                    <div key={sense.label} style={{ textAlign: 'center' }}>
                        <div aria-label={`Passive ${sense.label}`} style={{
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
                            {sense.value ?? '—'}
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                            {sense.label}
                        </div>
                    </div>
                ))}
            </div>
            {items.some(sense => sense.value == null) && <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unavailable passive checks require supported preparation inputs.</p>}
            {(
                <div style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--theme-border)',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                }}>
                    <SensesReadout fact={senses??sensesProjection({})}/>
                </div>
            )}
        </div>
    );
}
