'use client';

import React, { useState, useMemo } from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import { FEATURE_FILTERS, FilterBar } from '../../shared/filters';
import { toFeatureRows } from '../../../itemRows';
import FeaturesBlock from '../../blocks/Features';
import TraitsBlock from '../../blocks/Traits';
import type { FeatureSource } from '../../../types';

interface Props {
    features: FoundryItem[];
}

const FILTER_TO_SOURCES: Record<string, FeatureSource[] | 'ALL'> = {
    'ALL': 'ALL',
    'CLASS FEATURES': ['class'],
    'SUBCLASS FEATURES': ['subclass'],
    'SPECIES TRAITS': ['species'],
    'FEATS': ['feat'],
    'BACKGROUND FEATURES': ['background'],
    'OTHER': ['class', 'subclass', 'species', 'feat', 'background'], // post hoc filter for "other" features that don't fit the above buckets; see toFeatureRows
};

export default function Features({ features }: Props) {
    const [activeFilter, setActiveFilter] = useState(FEATURE_FILTERS[0]);

    const allRows = useMemo(() => toFeatureRows(features), [features]);

    const filtered = useMemo(() => {
        const sources = FILTER_TO_SOURCES[activeFilter];
        if (!sources || sources === 'ALL') return allRows;
        return allRows.filter(r => sources.includes(r.source));
    }, [allRows, activeFilter]);

    // Filter→block swap: SPECIES_TRAITS routes to the Traits block (parallel
    // to how Background tab swaps blocks per filter).
    const isSpeciesView = activeFilter === 'SPECIES_TRAITS';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FilterBar
                filterMap={FEATURE_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            {isSpeciesView
                ? <TraitsBlock rows={filtered} />
                : <FeaturesBlock rows={filtered} />}
        </div>
    );
}
