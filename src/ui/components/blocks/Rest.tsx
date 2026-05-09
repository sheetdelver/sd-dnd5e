'use client';

import React from 'react';
import { useModal } from '../shared/useModal';
import { useSheet } from '../shared/SheetContext';

/**
 * Rest block — opens RestModal preset to short or long.
 *
 * Two visual variants:
 *   - `variant="bar"` (default) — pair of buttons (☾ SHORT REST | ☀ LONG REST)
 *     for the standard header bar. Each pre-selects its type, but the modal
 *     still allows switching via the small pill switcher inside.
 *   - `variant="icon"` — single campfire icon button for the mobile header
 *     stat strip (placed under Defenses/Conditions). Opens with long-rest
 *     selected by default.
 *
 * On apply, the modal forwards `{ type, newDay, ... }` and the block
 * translates that into `onUpdate` writes against the actor. Long rest
 * restores HP and clears temp HP. Hit-dice rolling on short rest is left as
 * a follow-up since it requires roll integration.
 */

interface Props {
    variant?: 'bar' | 'icon';
    /** Optional character name to show as subtitle in the modal. */
    subtitle?: string;
}

type RestApplyResult = {
    type: 'short' | 'long';
    newDay: boolean;
    removeTempHp?: boolean;
    recoverMaxHp?: boolean;
    hitDieDenomination?: string;
    autoSpendHd?: boolean;
};

export default function Rest({ variant = 'bar', subtitle }: Props) {
    const { openModal } = useModal();
    const { actor, onUpdate } = useSheet();
    const canApply = Boolean(onUpdate);

    const open = (initialType: 'short' | 'long') => {
        openModal('rest', {
            initialType,
            subtitle: subtitle ?? actor?.name,
            onApply: async (result: RestApplyResult) => {
                if (!onUpdate) return;
                if (result.type === 'long') {
                    if (result.recoverMaxHp !== false) {
                        const max = actor?.system?.attributes?.hp?.max
                            ?? actor?.derived?.hp?.max;
                        if (typeof max === 'number') {
                            await onUpdate('system.attributes.hp.value', max);
                        }
                    }
                    if (result.removeTempHp !== false) {
                        await onUpdate('system.attributes.hp.temp', 0);
                    }
                    // Hit-dice / spell-slot recovery: deferred to adapter
                    // follow-up. Different dnd5e versions expose these fields
                    // inconsistently and proper recovery needs the activity
                    // pipeline.
                }
                // Short rest: hit-dice spend rolls are deferred — the dropdown
                // captures intent for later wiring.
            },
        });
    };

    if (variant === 'icon') {
        return (
            <button
                type="button"
                onClick={() => open('long')}
                disabled={!canApply}
                aria-label="Rest"
                title="Rest"
                style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1px solid var(--theme-border)',
                    background: 'transparent',
                    color: 'var(--theme-primary)',
                    fontSize: '14px',
                    cursor: canApply ? 'pointer' : 'default',
                    opacity: canApply ? 1 : 0.4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                🔥
            </button>
        );
    }

    return (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexShrink: 0 }}>
            <RestButton onClick={() => open('short')} disabled={!canApply}>
                ☾ Short Rest
            </RestButton>
            <RestButton onClick={() => open('long')} disabled={!canApply}>
                ☀ Long Rest
            </RestButton>
        </div>
    );
}

function RestButton({ onClick, disabled, children }: {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                borderRadius: 'var(--block-radius)',
                border: '1px solid var(--theme-border)',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.4 : 1,
            }}
        >
            {children}
        </button>
    );
}
