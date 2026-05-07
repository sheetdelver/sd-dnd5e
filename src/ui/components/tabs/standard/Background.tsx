'use client';

import React, { useState } from 'react';
import { BACKGROUND_FILTERS, FilterBar } from '../../shared/filters';

/**
 * Background tab (standard view) — background details, characteristics,
 * and appearance sections.
 * Includes sub-filter bar for background categories.
 *
 * STUB — static placeholder with functional filter switching.
 */
export default function Background() {
    const [activeFilter, setActiveFilter] = useState(BACKGROUND_FILTERS[0]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FilterBar
                filterMap={BACKGROUND_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            {/* STUB: Filtered background content placeholder */}
            <div className="stub-placeholder" style={{ minHeight: '200px' }}>
                Showing: {activeFilter}
            </div>
        </div>
    );
}
