'use client';

import React, { useState } from 'react';
import { NOTE_FILTERS, FilterBar } from '../../shared/filters';

/**
 * Notes tab (standard view) — note sections for Organizations, Allies,
 * Enemies, Backstory, and Other.
 * Includes sub-filter bar for note categories.
 *
 * STUB — static placeholder with functional filter switching.
 */
export default function Notes() {
    const [activeFilter, setActiveFilter] = useState(NOTE_FILTERS[0]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FilterBar
                filterMap={NOTE_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            {/* STUB: Filtered notes content placeholder */}
            <div className="stub-placeholder" style={{ minHeight: '200px' }}>
                Showing: {activeFilter}
            </div>
        </div>
    );
}
