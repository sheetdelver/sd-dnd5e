'use client';

import React, { useEffect } from 'react';
import { useModal } from './useModal';
import { useSheet } from './SheetContext';
import { rollIntentSignature, type PreparedRollKind } from './skillIntent';
import ThemeModal, { type ThemeModalProps } from '../modals/ThemeModal';
import RollModal, { type RollModalProps } from '../modals/RollModal';
import HPModal, { type HPModalProps } from '../modals/HPModal';
import RestModal, { type RestModalProps } from '../modals/RestModal';
import ItemModal, { type ItemModalProps } from '../modals/ItemModal';
import SpellModal, { type SpellModalProps } from '../modals/SpellModal';
import RichTextModal, { type RichTextModalProps } from '../modals/RichTextModal';
import DefensesModal from '../modals/DefensesModal';

/**
 * ModalHost — single mount point for the active modal.
 *
 * Reads `useModal()` and switches on `activeId` to render the corresponding
 * concrete modal. Returns `null` when no modal is open, so it costs nothing
 * in the idle state.
 */
export default function ModalHost() {
    const { activeId, activeProps, closeModal } = useModal();
    const { actor } = useSheet();
    const kind = ['skill', 'ability', 'save', 'tool','initiative'].includes(String(activeProps.rollType)) ? activeProps.rollType as PreparedRollKind : null;
    const currentSignature = kind ? rollIntentSignature(actor, kind) : null;
    const staleRoll = activeId === 'roll' && kind !== null
        && (!currentSignature || activeProps.preparedIntentSignature !== currentSignature);
    useEffect(() => { if (staleRoll) closeModal(); }, [staleRoll, closeModal]);
    if (staleRoll) return null;

    if (activeId === null) return null;

    switch (activeId) {
        case 'defenses':
            return <DefensesModal onClose={closeModal} />;
        case 'theme':
            return (
                <ThemeModal
                    {...(activeProps as Omit<ThemeModalProps, 'onClose'>)}
                    onClose={closeModal}
                />
            );
        case 'roll':
            return (
                <RollModal
                    {...(activeProps as Omit<RollModalProps, 'onClose'>)}
                    onClose={closeModal}
                />
            );
        case 'hp':
            return (
                <HPModal
                    {...(activeProps as Omit<HPModalProps, 'onClose'>)}
                    onClose={closeModal}
                />
            );
        case 'rest':
            return (
                <RestModal
                    {...(activeProps as Omit<RestModalProps, 'onClose'>)}
                    onClose={closeModal}
                />
            );
        case 'item':
            return (
                <ItemModal
                    {...(activeProps as Omit<ItemModalProps, 'onClose'>)}
                    onClose={closeModal}
                />
            );
        case 'spell':
            return (
                <SpellModal
                    {...(activeProps as Omit<SpellModalProps, 'onClose'>)}
                    onClose={closeModal}
                />
            );
        case 'richtext':
            return (
                <RichTextModal
                    {...(activeProps as Omit<RichTextModalProps, 'onClose'>)}
                    onClose={closeModal}
                />
            );
        default:
            // Unknown id — close so we don't get stuck in a no-op state.
            queueMicrotask(closeModal);
            return null;
    }
}
