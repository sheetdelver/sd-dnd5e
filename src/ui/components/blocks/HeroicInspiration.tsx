'use client';

import React from 'react';

/**
 * HeroicInspiration block — heroic inspiration toggle.
 *
 * STUB — static placeholder, no data wiring.
 */
export default function HeroicInspiration() {
    return (
        <div className="block-card" style={{ textAlign: 'center' }}>
            {/* STUB: Inspiration toggle placeholder */}
            <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '2px solid var(--theme-border)',
                margin: '0 auto 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px',
            }}>
                ○
            </div>
            <div className="block-heading" style={{ marginBottom: 0 }}>Heroic Inspiration</div>
        </div>
    );
}
