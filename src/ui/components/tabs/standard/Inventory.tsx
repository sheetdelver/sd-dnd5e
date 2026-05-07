'use client';

import React, { useState } from 'react';
import { INVENTORY_FILTERS, FilterBar } from '../../shared/filters';

/**
 * Inventory tab (standard view) — equipment and possessions list.
 * Includes sub-filter bar for equipment categories.
 *
 * STUB — static placeholder with functional filter switching.
 * TODO: Accept items array and filter by active category.
 */
export default function Inventory() {
    const [activeFilter, setActiveFilter] = useState(INVENTORY_FILTERS[0]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FilterBar
                filterMap={INVENTORY_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            {/* STUB: Filtered inventory list placeholder */}
            <div className="stub-placeholder" style={{ minHeight: '200px' }}>
                Showing: {activeFilter}
            </div>
        </div>
    );
}
