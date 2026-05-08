'use client';

/**
 * Single-slot modal context for the dnd5e sheet.
 *
 * One modal at a time — the active slot is `{ id, props }` where `id` selects
 * which concrete modal `ModalHost` should render and `props` are forwarded to
 * that modal. Triggers anywhere in the tree call `openModal(id, props)`;
 * `closeModal()` clears the slot.
 *
 * Wrap the layout root in `<ModalProvider>` so blocks/tabs nested inside can
 * `useModal()` without prop drilling.
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ModalId =
    | 'theme'
    | 'roll'
    | 'hp'
    | 'rest'
    | 'item'
    | 'spell'
    | 'richtext';

interface ModalSlot {
    id: ModalId | null;
    props: Record<string, unknown>;
}

interface ModalContextValue {
    activeId: ModalId | null;
    activeProps: Record<string, unknown>;
    openModal: (id: ModalId, props?: Record<string, unknown>) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [slot, setSlot] = useState<ModalSlot>({ id: null, props: {} });

    const openModal = useCallback((id: ModalId, props: Record<string, unknown> = {}) => {
        setSlot({ id, props });
    }, []);

    const closeModal = useCallback(() => {
        setSlot({ id: null, props: {} });
    }, []);

    const value = useMemo<ModalContextValue>(() => ({
        activeId: slot.id,
        activeProps: slot.props,
        openModal,
        closeModal,
    }), [slot, openModal, closeModal]);

    return React.createElement(ModalContext.Provider, { value }, children);
}

export function useModal(): ModalContextValue {
    const ctx = useContext(ModalContext);
    if (!ctx) {
        throw new Error('useModal must be used inside <ModalProvider>');
    }
    return ctx;
}
