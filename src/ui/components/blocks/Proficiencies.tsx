'use client';

import React from 'react';

/**
 * Proficiencies block — displays proficiency categories.
 * Armor, Weapons, Tools, and Languages rendered as labeled lists.
 *
 * STUB — static placeholder, no data wiring.
 */

// STUB: Proficiency categories with placeholder values
const CATEGORIES = [
    { label: 'Armor', items: 'Light Armor, Medium Armor, Heavy Armor, Shields' },
    { label: 'Weapons', items: 'Simple Weapons, Martial Weapons' },
    { label: 'Tools', items: '—' },
    { label: 'Languages', items: 'Common' },
];

export default function Proficiencies() {
    return (
        <div className="block-card">
            <h2 className="block-heading">Proficiencies & Training</h2>
            {CATEGORIES.map(cat => (
                <div key={cat.label} style={{ marginBottom: '8px' }}>
                    <div style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.03em',
                        marginBottom: '2px',
                    }}>
                        {cat.label}
                    </div>
                    {/* STUB: Placeholder proficiency items */}
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {cat.items}
                    </div>
                </div>
            ))}
        </div>
    );
}
