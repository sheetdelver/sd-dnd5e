'use client';

import React from 'react';
import { useModal } from './useModal';
import ThemeModal, { type ThemeModalProps } from '../modals/ThemeModal';

/**
 * ModalHost — single mount point for the active modal.
 *
 * Reads `useModal()` and switches on `activeId` to render the corresponding
 * concrete modal. Each new modal type added in later phases registers its
 * case here. The host returns `null` when no modal is open, so it costs
 * nothing in the idle state.
 *
 * Phase 2 adds the first concrete entry: `theme` → ThemeModal.
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
        // case 'roll':  return <RollModal {...activeProps} onClose={closeModal} />;
        // case 'hp':    return <HPModal {...activeProps} onClose={closeModal} />;
        // case 'rest':  return <RestModal {...activeProps} onClose={closeModal} />;
        // case 'item':  return <ItemModal {...activeProps} onClose={closeModal} />;
        // case 'spell': return <SpellModal {...activeProps} onClose={closeModal} />;
        // case 'richtext': return <RichTextModal {...activeProps} onClose={closeModal} />;
        default:
            // Unknown id — close so we don't get stuck in a no-op state.
            queueMicrotask(closeModal);
            return null;
    }
}
