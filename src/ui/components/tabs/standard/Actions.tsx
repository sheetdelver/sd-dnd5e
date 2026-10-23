'use client';
import CombatModifiers from '../../blocks/CombatModifiers';

import React, { useState, useMemo } from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import { ACTION_FILTERS, FilterBar } from '../../shared/filters';
import { toActionRows,itemRowsContext } from '../../../itemRows';
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

    // Filter and format shared prepared activities; no UI attack rules.
    const allRows = useMemo(() => {
        const ctx=itemRowsContext(actor?.derived);
        const ids=new Set([...weapons,...extra].map(item=>item._id));
        const other=(actor?.items??[]).filter((item:FoundryItem)=>item.type!=='spell'&&!ids.has(item._id)&&Boolean(ctx.prepared?.items[item._id]?.activities.length));
        return toActionRows([...weapons, ...extra,...other], ctx);
    }, [weapons, extra, actor]);

    const filtered = useMemo(() => {
        if (activeFilter === 'ALL') return allRows;
        // LIMITED USE is a cross-category filter — it slices items that have
        // remaining/max uses regardless of their action category.
        if (activeFilter === 'LIMITED USE') return allRows.filter(r => r.uses != null||r.itemUses!=null||r.usesStatus==='unavailable'||r.itemUsesStatus==='unavailable');
        const cat = FILTER_TO_CATEGORY[activeFilter];
        return cat ? allRows.filter(r => r.category === cat) : allRows;
    }, [allRows, activeFilter]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <CombatModifiers kind="damage"/>
            <FilterBar
                filterMap={ACTION_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            <ActionsBlock rows={filtered} onRoll={onRoll} />
        </div>
    );
}
