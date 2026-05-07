'use client';

import React, { useState } from 'react';
import { FEATURE_FILTERS, FilterBar } from '../../shared/filters';

/**
 * Features tab (standard view) — class features, species traits, and feats.
 * Includes sub-filter bar for feature categories.
 *
 * STUB — static placeholder with functional filter switching.
 * TODO: Accept features array and filter by active category.
 */
export default function Features() {
    const [activeFilter, setActiveFilter] = useState(FEATURE_FILTERS[0]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FilterBar
                filterMap={FEATURE_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            {/* STUB: Filtered features list placeholder */}
            <div className="stub-placeholder" style={{ minHeight: '200px' }}>
                Showing: {activeFilter}
            </div>
        </div>
    );
}
