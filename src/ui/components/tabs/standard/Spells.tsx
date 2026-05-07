'use client';

import React, { useState } from 'react';
import { SPELL_FILTERS, FilterBar } from '../../shared/filters';

/**
 * Spells tab (standard view) — spell list organized by level.
 * Includes sub-filter bar for level and concentration/ritual filters.
 *
 * STUB — static placeholder with functional filter switching.
 * TODO: Accept spells array and filter by active category.
 */
export default function Spells() {
    const [activeFilter, setActiveFilter] = useState(SPELL_FILTERS[0]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FilterBar
                filterMap={SPELL_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            {/* STUB: Filtered spell list placeholder */}
            <div className="stub-placeholder" style={{ minHeight: '200px' }}>
                Showing: {activeFilter}
            </div>
        </div>
    );
}
