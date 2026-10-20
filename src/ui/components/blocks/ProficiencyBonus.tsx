'use client';
import React from 'react';
import { characterFactsProjection } from '../../../logic/preparation/character-profile';
import CharacterFact from '../shared/CharacterFact';

export default function ProficiencyBonus({ derived }: { derived: Record<string, any> }) {
    return <div className="block-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            <CharacterFact fact={characterFactsProjection(derived).proficiency} label="Proficiency bonus" />
        </div>
        <div className="block-heading" style={{ marginBottom: 0 }}>Proficiency Bonus</div>
    </div>;
}
