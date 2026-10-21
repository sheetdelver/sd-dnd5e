'use client';
import React from 'react';
import {useSheet} from '../shared/SheetContext';
import {conditionsProjection,type ConditionPreparation606} from '../../../logic/preparation/conditions';

export function ConditionsFactsView({facts}:{facts:ConditionPreparation606}) {
    return <div aria-label="Condition status" data-status={facts.status} title={facts.provenance}>
        {facts.status==='unavailable'?<p role="status">Unavailable: {facts.reason}</p>
            :facts.statuses.length?<ul>{facts.statuses.map(status=><li key={status}>{status==='poisoned'?'Poisoned':status}</li>)}</ul>:<p>None</p>}
    </div>;
}
/** Effective prepared conditions, shared by both layouts. Editing uses the
 * future qualified command flow; this view never mutates native source. */
export default function Conditions() {
    const {actor}=useSheet();
    return <div className="block-card"><h2 className="block-heading">Conditions</h2>
        <ConditionsFactsView facts={conditionsProjection(actor?.derived)} />
    </div>;
}
