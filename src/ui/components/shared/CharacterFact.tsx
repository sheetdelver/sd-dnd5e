import React from 'react';
import type { NumericFact } from '../../../logic/preparation/character-profile';

export default function CharacterFact({ fact, label }: { fact: NumericFact; label: string }) {
    return <span aria-label={label} title={`${fact.provenance}${fact.reason ? ': ' + fact.reason : ''}`}>
        {fact.display}{fact.reason && <small style={{ display: 'block' }}>{fact.reason}</small>}
    </span>;
}
