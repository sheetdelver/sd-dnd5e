'use client';

import React, { useState } from 'react';
import { NOTE_FILTERS, FilterBar } from '../../shared/filters';
import NotesBlock from '../../blocks/Notes';

/**
 * Notes tab — renders the Notes block with the active section as title.
 * Each filter selects one section (ORGS, ALLIES, ENEMIES, BACKSTORY, OTHER);
 * ALL shows every section stacked.
 */

const SECTION_TITLE: Record<string, string> = {
    'ORGS': 'Organizations',
    'ALLIES': 'Allies',
    'ENEMIES': 'Enemies',
    'BACKSTORY': 'Backstory',
    'OTHER': 'Other Notes',
};

const ALL_SECTIONS = ['ORGS', 'ALLIES', 'ENEMIES', 'BACKSTORY', 'OTHER'] as const;

export default function Notes() {
    const [activeFilter, setActiveFilter] = useState(NOTE_FILTERS[0]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FilterBar
                filterMap={NOTE_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            {activeFilter === 'ALL'
                ? ALL_SECTIONS.map(section => (
                    <NotesBlock key={section} title={SECTION_TITLE[section]} />
                ))
                : <NotesBlock title={SECTION_TITLE[activeFilter] ?? 'Notes'} />
            }
        </div>
    );
}
