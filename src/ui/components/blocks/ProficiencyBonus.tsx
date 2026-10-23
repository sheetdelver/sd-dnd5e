'use client';
import React from 'react';
import { characterFactsProjection } from '../../../logic/preparation/character-profile';
import CharacterFact from '../shared/CharacterFact';

export default function ProficiencyBonus({ derived }: { derived: Record<string, any> }) {
    const fact=characterFactsProjection(derived).proficiency;
    return <div className="block-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            <CharacterFact fact={fact} label="Proficiency bonus" />
        </div>
        <div className="block-heading" style={{ marginBottom: 0 }}>{fact.mode==='dice'?'Proficiency Die':'Proficiency Bonus'}</div>
    </div>;
}
