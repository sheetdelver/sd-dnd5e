import React,{useId} from 'react';
import BaseModal from '../shared/BaseModal';
import {useSheet} from '../shared/SheetContext';
import {ConditionsFactsView} from '../blocks/Conditions';
import {conditionsProjection} from '../../../logic/preparation/conditions';
export default function ConditionsModal({onClose}:{onClose:()=>void}) {
    const {actor}=useSheet(),heading=useId();
    return <BaseModal open onClose={onClose} title="Conditions" labelledBy={heading}>
        <ConditionsFactsView facts={conditionsProjection(actor?.derived)} />
    </BaseModal>;
}
