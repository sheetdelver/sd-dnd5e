'use client';

import React, { useState, useMemo } from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import { INVENTORY_FILTERS, FilterBar } from '../../shared/filters';
import { toInventoryRows } from '../../../itemRows';
import InventoryBlock from '../../blocks/Inventory';
import type { InventoryCategory } from '../../../types';

interface Props {
    gear: FoundryItem[];
}

const FILTER_TO_CATEGORY: Record<string, InventoryCategory | 'ALL'> = {
    'ALL': 'ALL',
    'EQUIPMENT': 'equipment',
    'BACKPACK': 'backpack',
    'POUCH': 'pouch',
    'ATTUNEMENT': 'attunement',
    'OTHER POSSESSIONS': 'other',
    // 'ALMS BOX' has no semantic mapping in dnd5e core; leave as ALL passthrough.
    'ALMS BOX': 'ALL',
};

export default function Inventory({ gear }: Props) {
    const [activeFilter, setActiveFilter] = useState(INVENTORY_FILTERS[0]);

    const allRows = useMemo(() => toInventoryRows(gear), [gear]);

    const filtered = useMemo(() => {
        const cat = FILTER_TO_CATEGORY[activeFilter];
        if (!cat || cat === 'ALL') return allRows;
        return allRows.filter(r => r.category === cat);
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
