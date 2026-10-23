import React from 'react';
import {hpProjection,hitDiceProjection} from '../../../logic/preparation/health';
import {UnavailableNote,unavailableTitle} from './PreparationDiagnostics';
/** Formatting of the shared prepared facts only; no source reconstruction. */
export function HpReadout({hp}:{hp:unknown}){
    const fact=hpProjection({hp});
    return <span aria-label="Hit points" data-health-status={fact.status} title={unavailableTitle(fact.reason)??fact.provenance}>
        <span aria-label="Current hit points">{fact.value??'—'}</span>
        <span style={{color:'var(--text-muted)',fontWeight:400}}> / </span>
        <span aria-label="Maximum hit points">{fact.effectiveMax??'—'}</span>
    </span>;
}
export function HitDiceReadout({hitDice}:{hitDice:unknown}){
    const fact=hitDiceProjection({hitDice});
    return <span aria-label="Hit dice" data-health-status={fact.status} title={unavailableTitle(fact.reason)??fact.provenance} style={{fontSize:'10px',color:'var(--text-muted)'}}>
        {fact.status==='ready'?<><span aria-label="Remaining hit dice">{fact.value}</span> / <span aria-label="Maximum hit dice">{fact.max}</span> HD
            {Object.keys(fact.bySize).length>0&&` · ${Object.entries(fact.bySize).map(([die,value])=>`${value} ${die}`).join(', ')}`}</>:<>Hit Dice —<UnavailableNote reason={fact.reason}/></>}
    </span>;
}
