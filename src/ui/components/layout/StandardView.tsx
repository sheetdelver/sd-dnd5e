'use client';

import React, { useState } from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';

// Page chrome
import Header from '../page/Header';

// Blocks (already wired)
import Abilities from '../blocks/Abilities';
import Skills from '../blocks/Skills';

// Blocks (stubs — no actor data yet)
import SavingThrows from '../blocks/SavingThrows';
import PassiveSenses from '../blocks/PassiveSenses';
import Proficiencies from '../blocks/Proficiencies';
import ProficiencyBonus from '../blocks/ProficiencyBonus';
import WalkingSpeed from '../blocks/WalkingSpeed';
import HeroicInspiration from '../blocks/HeroicInspiration';
import HitPoints from '../blocks/HitPoints';
import ArmorClass from '../blocks/ArmorClass';
import Initiative from '../blocks/Initiative';
import Defenses from '../blocks/Defenses';
import Conditions from '../blocks/Conditions';

// Standard tabs (stubs — Actions tab is now a stub with sub-filters)
import ActionsTab from '../tabs/standard/Actions';
import SpellsTab from '../tabs/standard/Spells';
import FeaturesTab from '../tabs/standard/Features';
import InventoryTab from '../tabs/standard/Inventory';
import BackgroundTab from '../tabs/standard/Background';
import NotesTab from '../tabs/standard/Notes';
import ExtrasTab from '../tabs/standard/Extras';

// Modal infrastructure (Phase 1 — ui-refinement-02)
import { ModalProvider } from '../shared/useModal';
import ModalHost from '../shared/ModalHost';
import { useSheetSetting } from '../shared/useSheetSetting';

/**
 * StandardView — desktop/wide layout for the DnD5e character sheet.
 * Layout structure (matching D&D Beyond standard view):
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │ HEADER: Portrait | Name | Rest | Campaign                  │
 * ├─────────────────────────────────────────────────────────────┤
 * │ [STR][DEX][CON][INT][WIS][CHA] | PROF | SPEED | INSP | HP │
 * ├─────────┬─────────┬─────────────────────────────────────────┤
 * │ Saves   │ Skills  │ Init │ AC │ Defenses │ Conditions      │
 * │ Senses  │ (full   │─────────────────────────────────────────│
 * │ Profs   │  list)  │ TABS: Actions|Spells|Inv|Feat|Bg|Notes │
 * │         │         │ [Active tab content]                    │
 * └─────────┴─────────┴─────────────────────────────────────────┘
 */

// Standard view tab identifiers
type StandardTab = 'actions' | 'spells' | 'inventory' | 'features' | 'background' | 'notes' | 'extras';

// Tab definitions for the right panel tab bar
const STANDARD_TABS: { id: StandardTab; label: string }[] = [
    { id: 'actions',    label: 'Actions' },
    { id: 'spells',     label: 'Spells' },
    { id: 'inventory',  label: 'Inventory' },
    { id: 'features',   label: 'Features & Traits' },
    { id: 'background', label: 'Background' },
    { id: 'notes',      label: 'Notes' },
    { id: 'extras',     label: 'Extras' },
];

export interface StandardViewProps {
    actor: Record<string, any>;
    derived: Record<string, any>;
    items: FoundryItem[];
    weapons: FoundryItem[];
    spells: FoundryItem[];
    features: FoundryItem[];
    gear: FoundryItem[];
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
    onUpdate?: (path: string, value: unknown) => Promise<void>;
    foundryUrl?: string;
    isOwner?: boolean;
}

export default function StandardView({
    actor,
    derived,
    weapons,
    spells,
    features,
    gear,
    onRoll,
    foundryUrl,
}: StandardViewProps) {
    const [activeTab, setActiveTab] = useState<StandardTab>('actions');
    const [theme] = useSheetSetting<string>('theme', 'paladin');

    return (
        <ModalProvider>
        <div data-theme={theme} style={{
            fontFamily: 'var(--font-body)',
            background: 'var(--surface-bg)',
            color: 'var(--text-primary)',
            minHeight: '100vh',
        }}>
            {/* ---- Header (black/dark gray) ---- */}
            <Header actor={actor} derived={derived} foundryUrl={foundryUrl} />

            {/* ---- Ability scores + Stat chips — single horizontal row ---- */}
            <div style={{
                background: 'var(--surface-bg)',
                borderBottom: '1px solid var(--theme-border)',
                padding: 'var(--space-md) var(--space-lg)',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: 'var(--space-md)',
                    maxWidth: '1200px',
                    margin: '0 auto',
                }}>
                    {/* 6 ability score cards */}
                    <div style={{ flex: '0 0 auto', width: '52%' }}>
                        <Abilities abilities={derived.abilities} onRoll={onRoll} />
                    </div>

                    {/* Stat chips: Prof, Speed, Inspiration, HP */}
                    <div style={{
                        flex: 1,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 'var(--space-sm)',
                    }}>
                        <ProficiencyBonus value={derived.profBonus} />
                        <WalkingSpeed walk={derived.speed?.walk} />
                        <HeroicInspiration active={derived.inspiration} />
                        <HitPoints hp={derived.hp} />
                    </div>
                </div>
            </div>

            {/* ---- Main 3-column layout ---- */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '220px 260px 1fr',
                gap: 'var(--space-lg)',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: 'var(--space-lg)',
                minHeight: 'calc(100vh - 240px)',
            }}>
                {/* Left column: Saves, Senses, Proficiencies */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <SavingThrows abilities={derived.abilities} onRoll={onRoll} />
                    <PassiveSenses
                        perception={derived.passivePerception}
                        investigation={derived.passiveInvestigation}
                        insight={derived.passiveInsight}
                        senses={derived.senses}
                    />
                    <Proficiencies />
                </aside>

                {/* Center column: Skills */}
                <div>
                    <Skills skills={derived.skills} onRoll={onRoll} />
                </div>

                {/* Right column: Init/AC/Def/Cond → Tab bar → Tab content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {/* Stat blocks row: Initiative, AC, Defenses, Conditions */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 'var(--space-sm)',
                    }}>
                        <Initiative value={derived.initiative} />
                        <ArmorClass value={derived.ac} />
                        <Defenses />
                        <Conditions />
                    </div>

                    {/* Tab bar */}
                    <div style={{
                        display: 'flex',
                        gap: '2px',
                        borderBottom: '2px solid var(--theme-border)',
                        paddingBottom: 'var(--space-xs)',
                        flexWrap: 'wrap',
                    }}>
                        {STANDARD_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '6px 10px',
                                    fontSize: '11px',
                                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                                    textTransform: 'uppercase' as const,
                                    letterSpacing: '0.03em',
                                    cursor: 'pointer',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '2px solid',
                                    borderBottomColor: activeTab === tab.id ? 'var(--theme-primary)' : 'transparent',
                                    marginBottom: '-2px',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Active tab content */}
                    <div style={{ flex: 1, padding: 'var(--space-sm) 0' }}>
                        {activeTab === 'actions' && <ActionsTab weapons={weapons} onRoll={onRoll} />}
                        {activeTab === 'spells' && <SpellsTab spells={spells} onRoll={onRoll} />}
                        {activeTab === 'inventory' && <InventoryTab weapons={weapons} gear={gear} />}
                        {activeTab === 'features' && <FeaturesTab features={features} />}
                        {activeTab === 'background' && <BackgroundTab />}
                        {activeTab === 'notes' && <NotesTab />}
                        {activeTab === 'extras' && <ExtrasTab />}
                    </div>
                </div>
            </div>
            <ModalHost />
        </div>
        </ModalProvider>
    );
}
