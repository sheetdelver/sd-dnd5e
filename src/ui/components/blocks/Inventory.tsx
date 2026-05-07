'use client';

import React from 'react';

/**
 * Inventory block — generic item list renderer.
 * Can be used to display equipment, alms box, backpack, pouch, attunement,
 * and other possessions.
 *
 * STUB — static placeholder, no data wiring.
 * TODO: Accept a category prop (equipment, alms-box, backpack, pouch, attunement, other)
 */
export default function Inventory() {
    return (
        <div className="block-card">
            <h2 className="block-heading">Inventory</h2>
            {/* STUB: Empty state placeholder */}
            <div className="stub-placeholder">
                No items to display
            </div>
        </div>
    );
}
