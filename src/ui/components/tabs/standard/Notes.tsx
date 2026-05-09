'use client';

import React, { useState } from 'react';
import { NOTE_FILTERS, FilterBar } from '../../shared/filters';
import NotesBlock from '../../blocks/Notes';
import { useModal } from '../../shared/useModal';
import { useSheetSetting } from '../../shared/useSheetSetting';

/**
 * Notes tab — five sections (Organizations / Allies / Enemies / Backstory /
 * Other). Each section's body is stored in the actor flag
 * `flags._sheet_delver.notes.<key>` (or localStorage fallback). Clicking a
 * section's body opens RichTextModal; saving writes back to the flag.
 *
 * Filter `ALL` stacks every section. Individual filters narrow to one.
 */

type SectionKey = 'orgs' | 'allies' | 'enemies' | 'backstory' | 'other';

const SECTIONS: { id: SectionKey; filter: string; title: string }[] = [
    { id: 'orgs',      filter: 'ORGS',      title: 'Organizations' },
    { id: 'allies',    filter: 'ALLIES',    title: 'Allies' },
    { id: 'enemies',   filter: 'ENEMIES',   title: 'Enemies' },
    { id: 'backstory', filter: 'BACKSTORY', title: 'Backstory' },
    { id: 'other',     filter: 'OTHER',     title: 'Other Notes' },
];

export default function Notes() {
    const [activeFilter, setActiveFilter] = useState(NOTE_FILTERS[0]);
    const { openModal } = useModal();
    const [notes, setNotes] = useSheetSetting<Record<string, string>>('notes', {});

    const openEditor = (section: typeof SECTIONS[number]) => {
        openModal('richtext', {
            title: section.title,
            initialContent: notes[section.id] ?? '',
            placeholder: `Write about ${section.title.toLowerCase()}…`,
            onApply: (next: string) => {
                setNotes({ ...notes, [section.id]: next });
            },
        });
    };

    const renderSection = (section: typeof SECTIONS[number]) => (
        <NotesBlock
            key={section.id}
            title={section.title}
            body={notes[section.id]}
            onEdit={() => openEditor(section)}
        />
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FilterBar
                filterMap={NOTE_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            {activeFilter === 'ALL'
                ? SECTIONS.map(renderSection)
                : (() => {
                    const match = SECTIONS.find(s => s.filter === activeFilter);
                    return match ? renderSection(match) : null;
                })()
            }
        </div>
    );
}
