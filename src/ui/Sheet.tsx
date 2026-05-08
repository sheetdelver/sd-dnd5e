'use client';

import React, { useState, useEffect } from 'react';
import type { ActorSheetData, FoundryItem } from '@sheet-delver/sdk';
import './dnd5e.css';

// Layout views
import StandardView from './components/layout/StandardView';
import MobileView from './components/layout/MobileView';

// Sheet-level context (actor + onUpdate)
import { SheetProvider } from './components/shared/SheetContext';

/**
 * Sheet — top-level character sheet component for D&D 5e.
 * Receives actor data from ActorPage, derives computed values,
 * categorizes items, and delegates rendering to the appropriate
 * layout view based on viewport width.
 *
 * StandardView: >= 1024px (desktop/tablet landscape)
 * MobileView:   < 1024px (mobile/tablet portrait)
 */

// Breakpoint for switching between standard and mobile layouts
const LAYOUT_BREAKPOINT = 1024;

interface Props {
    actor: ActorSheetData & Record<string, any>;
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
    onUpdate?: (path: string, value: unknown) => Promise<void>;
    foundryUrl?: string;
    isOwner?: boolean;
    // accept but ignore SheetRouter-specific props
    [key: string]: unknown;
}

export default function Sheet({ actor, onRoll, onUpdate, foundryUrl, isOwner }: Props) {
    // --- Viewport detection ---
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check initial width
        const check = () => setIsMobile(window.innerWidth < LAYOUT_BREAKPOINT);
        check();

        // Listen for resize events
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // --- Derive computed values from actor data ---
    const derived = (actor.derived ?? {}) as Record<string, any>;
    const items: FoundryItem[] = actor.items ?? [];

    // --- Categorize items ---
    const weapons  = items.filter(i => i.type === 'weapon');
    const spells   = items.filter(i => i.type === 'spell');
    const features = items.filter(i => ['feat', 'class', 'subclass', 'background', 'race'].includes(i.type));
    const gear     = items.filter(i => ['equipment', 'consumable', 'tool', 'loot'].includes(i.type));

    // --- Shared props for both layout views ---
    const viewProps = {
        actor,
        derived,
        items,
        weapons,
        spells,
        features,
        gear,
        onRoll,
        onUpdate,
        foundryUrl,
        isOwner,
    };

    // --- Render the appropriate layout ---
    return (
        <SheetProvider
            actor={actor}
            onUpdate={onUpdate}
            isOwner={isOwner}
            foundryUrl={foundryUrl}
        >
            {isMobile ? <MobileView {...viewProps} /> : <StandardView {...viewProps} />}
        </SheetProvider>
    );
}
