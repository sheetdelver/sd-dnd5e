import React from 'react';
import type {MovementFacts,SensesFacts} from '../../../logic/preparation/movement';
const labels:Record<string,string>={burrow:'Burrow',climb:'Climb',fly:'Fly',swim:'Swim',blindsight:'Blindsight',darkvision:'Darkvision',tremorsense:'Tremorsense',truesight:'Truesight'};
export function WalkingSpeedReadout({fact}:{fact:MovementFacts}){
    return <span aria-label="Walking speed" title={fact.provenance}>{fact.status==='unavailable'?'—':`${fact.speeds.walk} ${fact.units}`}{fact.reason&&<small style={{display:'block',fontSize:'10px'}}>{fact.reason}</small>}</span>;
}
export function MovementDetails({fact}:{fact:MovementFacts}){
    const values=Object.entries(fact.speeds).filter(([key,value])=>key!=='walk'&&key!=='jump'&&typeof value==='number'&&value>0).map(([key,value])=>`${labels[key]??key} ${value} ${fact.units}`);
    if(fact.jump.value!==null)values.push(`Jump ${fact.jump.value} ${fact.units}`);
    if(fact.hover)values.push('Hover');
    if(fact.special)values.push(fact.special);
    return <div aria-label="Movement details" title={fact.provenance} style={{fontSize:'11px',color:'var(--text-secondary)'}}>{fact.status==='unavailable'?fact.reason:values.join(' · ')}{fact.status==='ready'&&fact.jump.value===null&&<small style={{display:'block'}}>{fact.jump.reason}</small>}</div>;
}
export function SensesReadout({fact}:{fact:SensesFacts}){
    const values=Object.entries(fact.ranges).filter(([,value])=>typeof value==='number'&&value>0).map(([key,value])=>`${labels[key]??key} ${value} ${fact.units}`);
    if(fact.special)values.push(fact.special);
    return <div aria-label="Senses" title={fact.provenance} style={{fontSize:'11px',color:'var(--text-secondary)'}}>{fact.status==='unavailable'?`Unavailable: ${fact.reason}`:values.join(' · ')||'No additional senses'}{fact.status==='legacy-unqualified'&&<small style={{display:'block'}}>{fact.reason}</small>}</div>;
}
