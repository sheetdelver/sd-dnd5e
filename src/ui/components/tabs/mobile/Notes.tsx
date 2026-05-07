'use client';

import React from 'react';

/**
 * Notes tab (mobile view) — note sections for Organizations, Allies,
 * Enemies, Backstory, and Other in a scrollable mobile view.
 *
 * STUB — static placeholder, no data wiring.
 */

// STUB: Note section categories
const NOTE_SECTIONS = ['Organizations', 'Allies', 'Enemies', 'Backstory', 'Other'];

export default function Notes() {
    return (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {NOTE_SECTIONS.map(section => (
                <div key={section} className="block-card">
                    <h2 className="block-heading">{section}</h2>
                    <div className="stub-placeholder">No {section.toLowerCase()} notes</div>
                </div>
            ))}
        </div>
    );
}
