'use client';
import CarriedWeight from '../../blocks/CarriedWeight';

import React, { useState, useMemo } from 'react';
import {useSheet} from '../../shared/SheetContext';
import type { FoundryItem } from '@sheet-delver/sdk';
import { INVENTORY_FILTERS, FilterBar } from '../../shared/filters';
import { toInventoryRows,itemRowsContext } from '../../../itemRows';
import InventoryBlock from '../../blocks/Inventory';
import { INVENTORY_FOUNDRY_TYPE_FILTERS_MAP } from '../../../types';

interface Props {
    /** Weapons live in their own slice in Sheet.tsx (so the Actions tab can use them too). */
    weapons: FoundryItem[];
    gear: FoundryItem[];
}

export default function Inventory({ weapons, gear }: Props) {
    const {actor}=useSheet();
    const [activeFilter, setActiveFilter] = useState(INVENTORY_FILTERS[0]);

    const allRows = useMemo(
        () => toInventoryRows([...weapons, ...gear],itemRowsContext(actor?.derived)),
        [weapons, gear,actor],
    );

    const filtered = useMemo(() => {
        if (activeFilter === 'ALL') return allRows;
        return allRows.filter(r => INVENTORY_FOUNDRY_TYPE_FILTERS_MAP[r.category] === activeFilter);
    }, [allRows, activeFilter]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <CarriedWeight/>
            <FilterBar
                filterMap={INVENTORY_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            <InventoryBlock rows={filtered} />
        </div>
    );
}
