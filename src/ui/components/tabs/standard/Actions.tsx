'use client';

import React, { useState } from 'react';
import { ACTION_FILTERS, FilterBar } from '../../shared/filters';

/**
 * Actions tab (standard view) — actions content with sub-filter bar.
 * Displays attacks, actions, bonus actions, reactions, and other entries.
 * Saving throws are NOT rendered here — they live in blocks/SavingThrows
 * (left sidebar in the standard view layout).
 *
 * STUB — static placeholder with functional filter switching.
 * TODO: Accept items and filter by active category.
 */
export default function Actions() {
    const [activeFilter, setActiveFilter] = useState(ACTION_FILTERS[0]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FilterBar
                filterMap={ACTION_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            {/* STUB: Filtered actions content placeholder */}
            <div className="stub-placeholder" style={{ minHeight: '200px' }}>
                Showing: {activeFilter}
            </div>
        </div>
    );
}
