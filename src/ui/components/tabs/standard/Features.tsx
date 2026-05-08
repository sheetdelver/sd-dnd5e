'use client';

import React, { useState, useMemo } from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import { FEATURE_FILTERS, FilterBar } from '../../shared/filters';
import { toFeatureRows } from '../../../itemRows';
import FeaturesBlock from '../../blocks/Features';
import type { FeatureSource } from '../../../types';

interface Props {
    features: FoundryItem[];
}

const FILTER_TO_SOURCES: Record<string, FeatureSource[] | 'ALL'> = {
    'ALL': 'ALL',
    'CLASS_FEATURES': ['class', 'subclass'],
    'SPECIES_TRAITS': ['species'],
    'FEATS': ['feat'],
};

export default function Features({ features }: Props) {
    const [activeFilter, setActiveFilter] = useState(FEATURE_FILTERS[0]);

    const allRows = useMemo(() => toFeatureRows(features), [features]);

    const filtered = useMemo(() => {
        const sources = FILTER_TO_SOURCES[activeFilter];
        if (!sources || sources === 'ALL') return allRows;
        return allRows.filter(r => sources.includes(r.source));
    }, [allRows, activeFilter]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FilterBar
                filterMap={FEATURE_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            <FeaturesBlock rows={filtered} />
        </div>
    );
}
