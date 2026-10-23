import React from 'react';
import type { NumericFact } from '../../../logic/preparation/character-profile';
import {UnavailableNote,unavailableTitle} from './PreparationDiagnostics';

export default function CharacterFact({ fact, label }: { fact: NumericFact; label: string }) {
    return <span aria-label={label} title={unavailableTitle(fact.reason)??fact.provenance}>
        {fact.display}<UnavailableNote reason={fact.reason}/>{!fact.reason&&fact.preparationNote&&<small style={{display:'block'}}>{fact.preparationNote}</small>}
    </span>;
}
