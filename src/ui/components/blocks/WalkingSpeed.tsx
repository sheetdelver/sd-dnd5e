'use client';

import React from 'react';

/**
 * WalkingSpeed block — movement speed values.
 * Walk, fly, swim, climb, burrow.
 *
 * STUB — static placeholder, no data wiring.
 */
export default function WalkingSpeed() {
    return (
        <div className="block-card" style={{ textAlign: 'center' }}>
            {/* STUB: Walking speed value */}
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                30<span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>ft.</span>
            </div>
            <div className="block-heading" style={{ marginBottom: 0 }}>Walking Speed</div>
        </div>
    );
}
