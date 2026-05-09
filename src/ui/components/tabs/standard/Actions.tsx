'use client';

import React, { useState, useMemo } from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import { ACTION_FILTERS, FilterBar } from '../../shared/filters';
import { toActionRows } from '../../../itemRows';
import ActionsBlock from '../../blocks/Actions';
import type { ActionCategory } from '../../../types';
import { useSheet } from '../../shared/SheetContext';

interface Props {
    weapons: FoundryItem[];
    /** Optional: gear with activations could feed in here too, e.g. consumables. */
    extra?: FoundryItem[];
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

const FILTER_TO_CATEGORY: Record<string, ActionCategory> = {
    'ATTACK':        'attack',
    'ACTION':        'action',
    'BONUS ACTION':  'bonus',
    'REACTION':      'reaction',
    'OTHER':         'other',
};

export default function Actions({ weapons, extra = [], onRoll }: Props) {
    const [activeFilter, setActiveFilter] = useState(ACTION_FILTERS[0]);
    const { actor } = useSheet();

    // Pass derived ability mods + prof bonus so weapon attack bonuses can be
    // computed (STR/DEX mod + prof + magic bonus) instead of just the magic
    // bonus from `system.attackBonus`.
    const allRows = useMemo(() => {
        const ctx = {
            abilities: actor?.derived?.abilities as Record<string, { mod: number }> | undefined,
            profBonus: (actor?.derived?.profBonus ?? 2) as number,
        };
        return toActionRows([...weapons, ...extra], ctx);
    }, [weapons, extra, actor]);

    const filtered = useMemo(() => {
        if (activeFilter === 'ALL') return allRows;
        // LIMITED USE is a cross-category filter — it slices items that have
        // remaining/max uses regardless of their action category.
        if (activeFilter === 'LIMITED USE') return allRows.filter(r => r.uses != null);
        const cat = FILTER_TO_CATEGORY[activeFilter];
        return cat ? allRows.filter(r => r.category === cat) : allRows;
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
