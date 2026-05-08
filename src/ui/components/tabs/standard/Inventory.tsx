'use client';

import React, { useState, useMemo } from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import { INVENTORY_FILTERS, FilterBar } from '../../shared/filters';
import { toInventoryRows } from '../../../itemRows';
import InventoryBlock from '../../blocks/Inventory';
import { INVENTORY_FOUNDRY_TYPE_FILTERS_MAP } from '../../../types';

interface Props {
    gear: FoundryItem[];
}

export default function Inventory({ gear }: Props) {
    const [activeFilter, setActiveFilter] = useState(INVENTORY_FILTERS[0]);

    const allRows = useMemo(() => toInventoryRows(gear), [gear]);

    const filtered = useMemo(() => {
        if (activeFilter === 'ALL') return allRows;
        return allRows.filter(r => INVENTORY_FOUNDRY_TYPE_FILTERS_MAP[r.category] === activeFilter);
    }, [allRows, activeFilter]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FilterBar
                filterMap={INVENTORY_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            <InventoryBlock rows={filtered} />
        </div>
    );
}
