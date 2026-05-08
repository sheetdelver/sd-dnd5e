'use client';

import React, { useEffect, useRef } from 'react';

/**
 * BaseModal — theme-aware wrapper around the native <dialog> element.
 *
 * Why <dialog>: built-in focus trap, Esc-to-close, accessible default behavior.
 * The host imperatively calls showModal()/close() in response to the `open`
 * prop so SSR doesn't try to mount a dialog with native-modal semantics.
 *
 * Backdrop clicks close the modal (we detect them via the click target — when
 * <dialog> is the click target itself, the click landed on the backdrop).
 */

interface Props {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    /** Optional max-width override; defaults to 480px for typical settings. */
    maxWidth?: number | string;
}

export default function BaseModal({ open, onClose, title, children, maxWidth = 480 }: Props) {
    const ref = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    // Native `cancel` event fires on Esc; mirror it into onClose.
    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        const handler = (e: Event) => {
            e.preventDefault();
            onClose();
        };
        dialog.addEventListener('cancel', handler);
        return () => dialog.removeEventListener('cancel', handler);
    }, [onClose]);

    const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        // Click landed on the dialog element itself (not bubbled from a child) → backdrop.
        if (e.target === ref.current) onClose();
    };

    return (
        <dialog
            ref={ref}
            onClick={handleClick}
            className="dnd5e-modal"
            style={{
                maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
                width: '90vw',
                padding: 0,
                border: '2px solid var(--theme-border)',
                borderRadius: 'var(--block-radius)',
                background: 'var(--surface-card)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 16px var(--theme-glow)',
            }}
        >
            <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                {title && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-md)',
                        paddingBottom: 'var(--space-sm)',
                        borderBottom: '1px solid var(--theme-border)',
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '14px',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 700,
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.08em',
                            color: 'var(--theme-primary)',
                        }}>
                            {title}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                fontSize: '18px',
                                lineHeight: 1,
                                cursor: 'pointer',
                                padding: '4px 8px',
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}
                {children}
            </div>
        </dialog>
    );
}
