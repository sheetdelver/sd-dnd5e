'use client';

import React, { useState, useMemo } from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import { SPELL_FILTERS, FilterBar } from '../../shared/filters';
import { toSpellRows } from '../../../itemRows';
import SpellsBlock from '../../blocks/Spells';

interface Props {
    spells: FoundryItem[];
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

const LEVEL_FILTERS: Record<string, number> = {
    'CANTRIP': 0,
    '1ST': 1,
    '2ND': 2,
    '3RD': 3,
    '4TH': 4,
    '5TH': 5,
    '6TH': 6,
    '7TH': 7,
    '8TH': 8,
    '9TH': 9,
};

export default function Spells({ spells, onRoll }: Props) {
    const [activeFilter, setActiveFilter] = useState(SPELL_FILTERS[0]);

    const allRows = useMemo(() => toSpellRows(spells), [spells]);

    const filtered = useMemo(() => {
        if (activeFilter === 'ALL') return allRows;
        if (activeFilter === 'CONCETRATION') return allRows.filter(r => r.concentration);
        if (activeFilter === 'RITUAL') return allRows.filter(r => r.ritual);
        const level = LEVEL_FILTERS[activeFilter];
        if (typeof level === 'number') return allRows.filter(r => r.level === level);
        return allRows;
    }, [allRows, activeFilter]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FilterBar
                filterMap={SPELL_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            <SpellsBlock rows={filtered} onRoll={onRoll} />
        </div>
    );
}
