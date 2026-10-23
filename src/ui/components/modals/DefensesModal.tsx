import React,{useId} from 'react';
import BaseModal from '../shared/BaseModal';
import {useSheet} from '../shared/SheetContext';
import {DefenseFactsView} from '../blocks/Defenses';
import {defensesProjection} from '../../../logic/preparation/defense-traits';

/** Read-only live projection: source/context changes update the open dialog. */
export default function DefensesModal({onClose}:{onClose:()=>void}) {
    const {actor}=useSheet(),heading=useId();
    return <BaseModal open onClose={onClose} title="Defenses" labelledBy={heading}>
        <DefenseFactsView facts={defensesProjection(actor?.derived)} />
    </BaseModal>;
}
