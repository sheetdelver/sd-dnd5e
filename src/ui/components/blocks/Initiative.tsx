'use client';
import React from 'react';
import {useSheet} from '../shared/SheetContext';
import {useModal} from '../shared/useModal';
import {usePreparedRollIntent} from '../shared/usePreparedRollIntent';
import {initiativeProjection} from '../../../logic/preparation/defenses';
import CharacterFact from '../shared/CharacterFact';
interface Props {value?:unknown;compact?:boolean;onRoll?:(type:string,key:string,options?:Record<string,unknown>)=>Promise<void>}
export default function Initiative({onRoll,compact=false}:Props){
    const {actor}=useSheet(),fact=initiativeProjection(actor?.derived??{}),{canRoll,review}=usePreparedRollIntent('initiative',onRoll),{openModal}=useModal();
    const check=actor?.derived.initiativeCheck as any;
    function open(event:React.MouseEvent){const intent=review('initiative');if(!intent)return;if(event.shiftKey){if(intent.quickAvailable)void intent.onConfirm();return;}openModal('roll',{rollType:'initiative',rollKey:'initiative',label:'Initiative',subtitle:actor?.name,formula:check?.formula,...intent});}
    const Container=compact?'span':'div';
    return <Container className={compact?undefined:'block-card'} style={{textAlign:'center'}}>
        <button type="button" aria-label="Roll initiative" title={check?.unavailableReason??check?.defaultUnavailableReason??(fact.fixed?'Fixed initiative score':fact.provenance)} disabled={!canRoll('initiative')} onClick={open} style={{background:'transparent',border:'none',padding:0,fontSize:compact?'18px':'20px',fontWeight:700,color:'var(--text-primary)',cursor:canRoll('initiative')?'pointer':'default'}}><CharacterFact fact={fact} label="Initiative modifier"/></button>
        {!compact&&<div className="block-heading" style={{marginBottom:0}}>Initiative</div>}
    </Container>;
}
