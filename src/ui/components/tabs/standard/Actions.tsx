'use client';

import React, { useState, useMemo } from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import { ACTION_FILTERS, FilterBar } from '../../shared/filters';
import { toActionRows } from '../../../itemRows';
import ActionsBlock from '../../blocks/Actions';
import type { ActionCategory } from '../../../types';

interface Props {
    weapons: FoundryItem[];
    /** Optional: gear with activations could feed in here too, e.g. consumables. */
    extra?: FoundryItem[];
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

const FILTER_TO_CATEGORY: Record<string, ActionCategory | 'ALL'> = {
    'ALL': 'ALL',
    'ATTACK': 'attack',
    'ACTION': 'action',
    'BONUS ACTION': 'bonus',
    'REACTION': 'reaction',
    'OTHER': 'other',
    'LIMITED USE': 'limited',
};

export default function Actions({ weapons, extra = [], onRoll }: Props) {
    const [activeFilter, setActiveFilter] = useState(ACTION_FILTERS[0]);

    const allRows = useMemo(
        () => toActionRows([...weapons, ...extra]),
        [weapons, extra],
    );

    const filtered = useMemo(() => {
        const cat = FILTER_TO_CATEGORY[activeFilter];
        if (!cat || cat === 'ALL') return allRows;
        return allRows.filter(r => r.category === cat);
    }, [allRows, activeFilter]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FilterBar
                filterMap={ACTION_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            <ActionsBlock rows={filtered} onRoll={onRoll} />
        </div>
    );
}
