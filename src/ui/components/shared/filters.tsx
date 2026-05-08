/** 
 * Filters for tabs
 */
import React from 'react';


// Action tab filters
export const ACTION_FILTERS = ['ALL', 'ATTACK', 'ACTION', 'BONUS ACTION', 'REACTION', 'OTHER', 'LIMITED USE'];

// Spells Tab Filters -0- = Cantrips
export const SPELL_FILTERS = ['ALL', 'CANTRIP', '1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', 'CONCETRATION', 'RITUAL'];

// Inventory Filters
export const INVENTORY_FILTERS = ['ALL', 'WEAPONS', 'EQUIPMENT', 'BOX', 'BACKPACK', 'POUCH', 'ATTUNEMENT', 'OTHER POSSESSIONS'];

// Feature Filters
export const FEATURE_FILTERS = ['ALL', 'CLASS FEATURES', 'SUBCLASS FEATURES', 'SPECIES TRAITS', 'FEATS', 'BACKGROUND FEATURES', 'OTHER'];

// Background Filters
export const BACKGROUND_FILTERS = ['ALL', 'BACKGROUND', 'CHARACTERISTICS', 'APPEARANCE'];

// Note Filters
export const NOTE_FILTERS = ['ALL', 'ORGS', 'ALLIES', 'ENEMIES', 'BACKSTORY', 'OTHER'];

/**
 * FilterBar — reusable sub-filter bar for tabs.
 * Tracks which filter is active and notifies the parent via onFilterChange.
 *
 * Props:
 *   filterMap     — ordered list of filter label strings
 *   onFilterChange — callback invoked with the selected filter string
 *   activeFilter  — (optional) controlled active filter value; if omitted, defaults to first item
 */

interface FilterBarProps {
    filterMap: string[];
    onFilterChange?: (filter: string) => void;
    activeFilter?: string;
}

export function FilterBar({ filterMap, onFilterChange, activeFilter }: FilterBarProps) {
    // Default to the first filter if no active filter is provided
    const current = activeFilter ?? filterMap[0] ?? '';

    return (
        <div style={{
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
        }}>
            {filterMap.map(filter => {
                const isActive = filter === current;
                return (
                    <button
                        key={filter}
                        onClick={() => onFilterChange?.(filter)}
                        style={{
                            padding: '4px 10px',
                            fontSize: '10px',
                            fontWeight: 600,
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.03em',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            border: isActive
                                ? '1px solid var(--theme-primary)'
                                : '1px solid var(--text-muted)',
                            background: isActive
                                ? 'var(--theme-primary)'
                                : 'transparent',
                            color: isActive
                                ? 'var(--text-on-accent)'
                                : 'var(--text-secondary)',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        {filter}
                    </button>
                );
            })}
        </div>
    );
}