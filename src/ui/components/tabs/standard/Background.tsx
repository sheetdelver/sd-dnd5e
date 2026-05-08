'use client';

import React, { useState } from 'react';
import { BACKGROUND_FILTERS, FilterBar } from '../../shared/filters';
import BackgroundBlock from '../../blocks/Background';
import CharacteristicsBlock from '../../blocks/Characteristics';
import AppearanceBlock from '../../blocks/Appearance';

/**
 * Background tab — composes Background, Characteristics, and Appearance blocks.
 * The filter selects which block(s) to show: ALL shows all three, individual
 * filters show one.
 */
export default function Background() {
    const [activeFilter, setActiveFilter] = useState(BACKGROUND_FILTERS[0]);

    const showAll = activeFilter === 'ALL';
    const showBackground = showAll || activeFilter === 'BACKGROUND';
    const showCharacteristics = showAll || activeFilter === 'CHARACTERISTICS';
    const showAppearance = showAll || activeFilter === 'APPEARANCE';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FilterBar
                filterMap={BACKGROUND_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            {showBackground && <BackgroundBlock />}
            {showCharacteristics && <CharacteristicsBlock />}
            {showAppearance && <AppearanceBlock />}
        </div>
    );
}
