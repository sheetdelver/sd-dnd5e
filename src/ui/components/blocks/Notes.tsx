'use client';

import React from 'react';

/**
 * Notes block — generic notes renderer.
 * Can be used to render Organizations, Allies, Enemies, Backstory, and other notes.
 *
 * STUB — static placeholder, no data wiring.
 * TODO: Accept a category prop (organizations, allies, enemies, backstory, other)
 */
export default function Notes() {
    return (
        <div className="block-card">
            <h2 className="block-heading">Notes</h2>
            {/* STUB: Empty notes area */}
            <div className="stub-placeholder">
                No notes to display
            </div>
        </div>
    );
}
