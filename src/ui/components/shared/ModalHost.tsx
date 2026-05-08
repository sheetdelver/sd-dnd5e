'use client';

import React from 'react';
import { useModal } from './useModal';

/**
 * ModalHost — single mount point for the active modal.
 *
 * Reads `useModal()` and switches on `activeId` to render the corresponding
 * concrete modal. Each new modal type added in later phases registers its
 * case here. The host returns `null` when no modal is open, so it costs
 * nothing in the idle state.
 *
 * Phase 1 ships with the registry empty — Phase 2 (ThemeModal) is the first
 * concrete entry. Add new entries here as each modal is built; keep modal
 * components themselves in `components/modals/`.
 */
export default function ModalHost() {
    const { activeId, activeProps, closeModal } = useModal();

    if (activeId === null) return null;

    // Registry — extend in later phases. Each case forwards `activeProps` and
    // `closeModal` to the concrete modal component.
    switch (activeId) {
        // case 'theme': return <ThemeModal {...activeProps} onClose={closeModal} />;
        // case 'roll':  return <RollModal {...activeProps} onClose={closeModal} />;
        // case 'hp':    return <HPModal {...activeProps} onClose={closeModal} />;
        // case 'rest':  return <RestModal {...activeProps} onClose={closeModal} />;
        // case 'item':  return <ItemModal {...activeProps} onClose={closeModal} />;
        // case 'spell': return <SpellModal {...activeProps} onClose={closeModal} />;
        // case 'richtext': return <RichTextModal {...activeProps} onClose={closeModal} />;
        default:
            // Unknown id — close so we don't get stuck in a no-op state.
            void activeProps;
            queueMicrotask(closeModal);
            return null;
    }
}
