'use client';

import React from 'react';
import { useModal } from './useModal';
import ThemeModal, { type ThemeModalProps } from '../modals/ThemeModal';
import RollModal, { type RollModalProps } from '../modals/RollModal';
import HPModal, { type HPModalProps } from '../modals/HPModal';
import RestModal, { type RestModalProps } from '../modals/RestModal';
import ItemModal, { type ItemModalProps } from '../modals/ItemModal';
import SpellModal, { type SpellModalProps } from '../modals/SpellModal';
import RichTextModal, { type RichTextModalProps } from '../modals/RichTextModal';

/**
 * ModalHost — single mount point for the active modal.
 *
 * Reads `useModal()` and switches on `activeId` to render the corresponding
 * concrete modal. Returns `null` when no modal is open, so it costs nothing
 * in the idle state.
 */
export default function ModalHost() {
    const { activeId, activeProps, closeModal } = useModal();

    if (activeId === null) return null;

    switch (activeId) {
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
