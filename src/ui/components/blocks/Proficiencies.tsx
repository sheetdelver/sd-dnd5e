'use client';

import React from 'react';
import {useSheet} from '../shared/SheetContext';
import {trainingProjection,trainingKeys,trainingLabels} from '../../../logic/preparation/training';

/** Read-only source/local training facts. Effective roll coefficients and
 * unresolved content identities remain distinct in the shared preparation. */
export default function Proficiencies() {
    const {actor}=useSheet(),facts=trainingProjection(actor?.derived);
    return <div className="block-card">
        <h2 className="block-heading">Proficiencies & Training</h2>
        <dl data-training-status={facts.status} title={facts.provenance} style={{margin:0,fontSize:'12px',overflowWrap:'anywhere'}}>
            {trainingKeys.map(key=>{const category=facts.categories[key];return <div key={key} style={{marginBottom:'8px'}}>
                <dt style={{fontWeight:600,fontSize:'11px',textTransform:'uppercase',marginBottom:'2px'}}>{trainingLabels[key]}</dt>
                <dd aria-label={`Training: ${trainingLabels[key]}`} data-status={category.status} title={category.reason??facts.provenance} style={{margin:0,color:category.status==='unavailable'?'var(--text-muted)':'var(--text-secondary)'}}>
                    <span data-training-value>{category.display}</span>
                    {category.preparationNote&&<small data-training-preparation-note style={{display:'block'}}>{category.preparationNote}</small>}
                    {category.reason&&<small style={{display:'block'}}>{category.reason}</small>}
                </dd>
            </div>;})}
        </dl>
    </div>;
}
