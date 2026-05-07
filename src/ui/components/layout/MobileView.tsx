'use client';

import React, { useState } from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';

// Page chrome
import Header from '../page/Header';
import BottomNav from '../page/BottomNav';

// Blocks (already wired)
import Abilities from '../blocks/Abilities';
import Skills from '../blocks/Skills';

// Blocks (stubs — no actor data yet)
import SavingThrows from '../blocks/SavingThrows';
import PassiveSenses from '../blocks/PassiveSenses';
import ProficiencyBonus from '../blocks/ProficiencyBonus';
import WalkingSpeed from '../blocks/WalkingSpeed';
import ArmorClass from '../blocks/ArmorClass';
import Initiative from '../blocks/Initiative';
import Defenses from '../blocks/Defenses';
import Conditions from '../blocks/Conditions';

// Standard tabs (already wired — reused in mobile for shared content)
import ActionsTab from '../tabs/mobile/Actions';
import SpellsTab from '../tabs/standard/Spells';
import FeaturesTab from '../tabs/standard/Features';
import InventoryTab from '../tabs/standard/Inventory';

// Mobile tabs (stubs — for tabs with no standard equivalent)
import ProficienciesTab from '../tabs/mobile/Proficiencies';
import BackgroundTab from '../tabs/mobile/Background';
import NotesTab from '../tabs/mobile/Notes';
import ExtrasTab from '../tabs/mobile/Extras';

/**
 * MobileView — mobile/tablet layout for the DnD5e character sheet.
 * Single-column layout with sticky header, core stats strip,
 * scrollable body, and bottom navigation with popup tab menu.
 *
 * Receives actor data from Sheet.tsx and distributes to wired blocks/tabs.
 * Stub blocks/tabs render with static placeholders.
 */

// Mobile tab identifiers
type MobileTab = 'abilities' | 'skills' | 'actions' | 'inventory' | 'spells' | 'features' | 'proficiencies' | 'background' | 'notes' | 'extras';

// Tab definitions for the popup menu grid
const MOBILE_TABS: { id: MobileTab; label: string; icon: string }[] = [
    { id: 'abilities',     label: 'Abilities, Saves, Senses', icon: '🛡' },
    { id: 'skills',        label: 'Skills',                   icon: '✦' },
    { id: 'actions',       label: 'Actions',                  icon: '⚔' },
    { id: 'inventory',     label: 'Inventory',                icon: '🎒' },
    { id: 'spells',        label: 'Spells',                   icon: '🔮' },
    { id: 'features',      label: 'Features & Traits',        icon: '⊙' },
    { id: 'proficiencies', label: 'Proficiencies & Training', icon: '🔍' },
    { id: 'background',    label: 'Background',               icon: '📜' },
    { id: 'notes',         label: 'Notes',                    icon: '📝' },
    { id: 'extras',        label: '••• Extras',               icon: '•••' },
];

export interface MobileViewProps {
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

export default function MobileView({
    actor,
    derived,
    weapons,
    spells,
    features,
    gear,
    onRoll,
    foundryUrl,
    isOwner,
}: MobileViewProps) {
    const [activeTab, setActiveTab] = useState<MobileTab>('abilities');
    const [menuOpen, setMenuOpen] = useState(false);

    /**
     * Renders the content for the currently active mobile tab.
     * Wired tabs pass through existing actor data; stub tabs render placeholders.
     */
    const renderTabContent = () => {
        switch (activeTab) {
            case 'abilities':
                return (
                    <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        {/* Wired block: ability scores */}
                        <Abilities abilities={derived.abilities} onRoll={onRoll} />
                        {/* Stub blocks: saves and senses */}
                        <SavingThrows />
                        <PassiveSenses />
                    </div>
                );
            case 'skills':
                return (
                    <div style={{ padding: 'var(--space-lg)' }}>
                        {/* Wired block: skills list */}
                        <Skills skills={derived.skills} onRoll={onRoll} />
                    </div>
                );
            case 'actions':
                return <ActionsTab />;
            case 'spells':
                return <SpellsTab spells={spells} foundryUrl={foundryUrl} />;
            case 'inventory':
                return <InventoryTab gear={gear} foundryUrl={foundryUrl} isOwner={isOwner} />;
            case 'features':
                return <FeaturesTab features={features} foundryUrl={foundryUrl} />;
            case 'proficiencies':
                return <ProficienciesTab />;
            case 'background':
                return <BackgroundTab />;
            case 'notes':
                return <NotesTab />;
            case 'extras':
                return <ExtrasTab />;
            default:
                return null;
        }
    };

    return (
        <div data-theme="paladin" style={{
            fontFamily: 'var(--font-body)',
            background: 'var(--surface-bg)',
            color: 'var(--text-primary)',
            minHeight: '100vh',
            paddingBottom: '72px', /* Space for BottomNav */
        }}>
            {/* ---- Sticky header (existing wired component) ---- */}
            <Header actor={actor} derived={derived} foundryUrl={foundryUrl} />

            {/* ---- Core stats strip (stub blocks, compact) ---- */}
            <div style={{
                background: 'var(--surface-card)',
                borderBottom: '1px solid var(--theme-border)',
                padding: 'var(--space-sm) var(--space-lg)',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr) auto',
                gap: 'var(--space-xs)',
                alignItems: 'center',
            }}>
                <ProficiencyBonus />
                <WalkingSpeed />
                <Initiative />
                <ArmorClass />
                {/* Defenses & Conditions stacked */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <Defenses />
                    <Conditions />
                </div>
            </div>

            {/* ---- Scrollable body: active tab content ---- */}
            <main>
                {renderTabContent()}
            </main>

            {/* ---- Tab menu popup (overlay grid) ---- */}
            {menuOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        zIndex: 40,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        paddingBottom: '72px', /* Above the BottomNav */
                    }}
                    onClick={() => setMenuOpen(false)}
                >
                    <div
                        style={{
                            background: 'var(--surface-bg)',
                            borderRadius: '12px 12px 0 0',
                            padding: 'var(--space-lg)',
                            width: '100%',
                            maxWidth: '420px',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 'var(--space-sm)',
                        }}>
                            {MOBILE_TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                                    style={{
                                        padding: '12px 8px',
                                        textAlign: 'center',
                                        background: activeTab === tab.id ? 'var(--theme-glow)' : 'var(--surface-elevated)',
                                        border: activeTab === tab.id
                                            ? '2px solid var(--theme-primary)'
                                            : '1px solid var(--theme-border)',
                                        borderRadius: 'var(--block-radius)',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: activeTab === tab.id ? 'var(--theme-primary)' : 'var(--text-primary)',
                                        textTransform: 'uppercase' as const,
                                        letterSpacing: '0.03em',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span style={{ marginRight: '4px' }}>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ---- Bottom Nav (with functional tab menu trigger) ---- */}
            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '56px',
                background: 'var(--surface-header)',
                borderTop: '1px solid var(--theme-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '0 16px',
                zIndex: 50,
            }}>
                {/* Settings placeholder */}
                <button
                    style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        border: '1px solid var(--theme-border)',
                        background: 'transparent', color: 'var(--text-secondary)',
                        fontSize: '18px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    disabled
                >
                    ⚙
                </button>

                {/* Tab menu trigger — functional */}
                <button
                    onClick={() => setMenuOpen(o => !o)}
                    style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        border: '1px solid var(--theme-border)',
                        background: menuOpen ? 'var(--theme-primary)' : 'var(--theme-glow)',
                        color: menuOpen ? 'var(--text-on-accent)' : 'var(--theme-primary)',
                        fontSize: '18px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    ▦
                </button>

                {/* Back/collapse placeholder */}
                <button
                    style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        border: '1px solid var(--theme-border)',
                        background: 'transparent', color: 'var(--text-secondary)',
                        fontSize: '18px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    disabled
                >
                    ◀◀
                </button>
            </nav>
        </div>
    );
}
