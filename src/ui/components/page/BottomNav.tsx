'use client';

import React from 'react';

/**
 * BottomNav — mobile bottom navigation bar.
 * Renders the tab menu trigger and navigation icons.
 * In the final implementation, the center button opens the popup tab menu grid.
 *
 * STUB — static placeholder, no routing logic.
 */
export default function BottomNav() {
    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '56px',
            background: 'var(--surface-header)',
            borderTop: '1px solid var(--theme-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 16px',
            zIndex: 30,
        }}>
            {/* STUB: Settings/gear icon */}
            <button
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid var(--theme-border)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                disabled
            >
                ⚙
            </button>

            {/* STUB: Tab menu grid trigger */}
            <button
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid var(--theme-border)',
                    background: 'var(--theme-glow)',
                    color: 'var(--theme-primary)',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                disabled
            >
                ▦
            </button>

            {/* STUB: Back/collapse button */}
            <button
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid var(--theme-border)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                disabled
            >
                ◀◀
            </button>
        </nav>
    );
}
