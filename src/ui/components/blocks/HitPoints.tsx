'use client';
import React from 'react';
import {useModal} from '../shared/useModal';
import {useSheet} from '../shared/SheetContext';
import {hpProjection} from '../../../logic/preparation/health';
import {HpReadout,HitDiceReadout} from '../shared/HealthFacts';
import {UnavailableNote,unavailableTitle} from '../shared/PreparationDiagnostics';
export default function HitPoints({hp}:{hp?:unknown}){
    const {openModal}=useModal(),{actor,onUpdate}=useSheet(),fact=hpProjection({hp});
    // Modern commands require the shared M3 intent/receipt pipeline. Legacy
    // keeps its explicitly selected, unqualified compatibility behavior.
    const canEdit=Boolean(onUpdate&&actor?.derived.lifecycle?.profile==='legacy-limited'&&fact.status==='legacy-unqualified');
    const reason=fact.reason??fact.commandReason;
    function open(initialMode:'heal'|'damage'|'temp'){
        if(!canEdit||fact.value===null||fact.effectiveMax===null||fact.temp===null)return;
        const {value,temp}=fact;
        openModal('hp',{hp:{value,max:fact.effectiveMax,temp},initialMode,onApply:async(next:{value:number;temp:number})=>{
            if(!onUpdate)return;
            if(next.value!==value)await onUpdate('system.attributes.hp.value',next.value);
            if(next.temp!==temp)await onUpdate('system.attributes.hp.temp',next.temp);
        }});
    }
    return <div className="block-card">
        <h2 className="block-heading">Hit Points</h2>
        <div className="dnd5e-hp-controls" style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',alignItems:'center',gap:'4px'}}>
            <button type="button" disabled={!canEdit} title={!canEdit?unavailableTitle(reason):undefined} onClick={()=>open('heal')}>HEAL</button>
            <button type="button" aria-label="Edit hit points" disabled={!canEdit} title={!canEdit?unavailableTitle(reason):'Edit hit points'} onClick={()=>open('temp')} style={{gridColumn:'1 / -1',gridRow:1,minWidth:0,textAlign:'center',background:'transparent',border:'none',color:'var(--text-primary)',fontSize:'20px',fontWeight:700}}>
                <HpReadout hp={fact}/>
                <div style={{fontSize:'10px',fontWeight:400,color:'var(--text-muted)'}}>TEMP: <span aria-label="Temporary hit points">{fact.temp??'—'}</span></div>
            </button>
            <button type="button" disabled={!canEdit} title={!canEdit?unavailableTitle(reason):undefined} onClick={()=>open('damage')}>DAMAGE</button>
        </div>
        <HitDiceReadout hitDice={actor?.derived.hitDice}/>
        {!canEdit&&fact.reason&&<UnavailableNote reason={fact.reason}/>}
    </div>;
}
