'use client';

import React from 'react';
import {useSheet} from '../shared/SheetContext';
import {defensesProjection,defenseKeys,defenseLabels,type DefenseFacts} from '../../../logic/preparation/defense-traits';

/**
 * Defenses block — damage resistances, immunities, and vulnerabilities.
 *
 * Reads one prepared projection; it performs no rule or source calculations.
 */
export default function Defenses() {
    const {actor}=useSheet();
    return (
        <div className="block-card">
            <h2 className="block-heading">Defenses</h2>
            <DefenseFactsView facts={defensesProjection(actor?.derived)} />
        </div>
    );
}

export function DefenseFactsView({facts}:{facts:DefenseFacts}) {
    return <div><dl data-defense-status={facts.status} title={facts.provenance} style={{margin:0,fontSize:'11px'}}>
        {defenseKeys.map(key=>{const category=facts.categories[key];return <div key={key} style={{marginBottom:'6px'}}>
            <dt style={{fontWeight:600}}>{defenseLabels[key]}</dt>
            <dd aria-label={defenseLabels[key]} data-status={category.status} title={category.status==='unavailable'?category.reason:facts.provenance} style={{margin:0,color:category.status==='unavailable'?'var(--text-muted)':'var(--text-primary)'}}>
                {category.display}{category.status==='unavailable'&&<small style={{display:'block'}}>{category.reason}</small>}
            </dd>
        </div>;})}
    </dl>{facts.preparationNote&&<small data-defense-preparation-note>{facts.preparationNote}</small>}</div>;
}
