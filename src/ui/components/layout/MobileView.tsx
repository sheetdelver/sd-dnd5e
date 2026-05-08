'use client';

import React, { useState } from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';

// Page chrome — mobile-specific header
import MobileHeader from '../page/MobileHeader';

// Modal infrastructure (Phase 1 — ui-refinement-02)
import { ModalProvider } from '../shared/useModal';
import ModalHost from '../shared/ModalHost';
import { useSheetSetting } from '../shared/useSheetSetting';

// Mobile tabs — each tab composes its own blocks. MobileView only delegates.
import AbilitiesTab from '../tabs/mobile/Abilities';
import SkillsTab from '../tabs/mobile/Skills';
import ActionsTab from '../tabs/mobile/Actions';
import SpellsTab from '../tabs/mobile/Spells';
import InventoryTab from '../tabs/mobile/Inventory';
import FeaturesTab from '../tabs/mobile/Features';
import ProficienciesTab from '../tabs/mobile/Proficiencies';
import BackgroundTab from '../tabs/mobile/Background';
import NotesTab from '../tabs/mobile/Notes';
import ExtrasTab from '../tabs/mobile/Extras';

/**
 * MobileView — mobile/tablet layout for the DnD5e character sheet.
 * Single-column layout:
 * - MobileHeader (portrait, stats, campaign)
 * - Scrollable body with active tab content
 * - Bottom navigation with popup tab menu
 *
 * All blocks render full-width within bounds. Fonts are scaled up
 * for touch-friendly readability.
 */

// Mobile tab identifiers
type MobileTab = 'abilities' | 'skills' | 'actions' | 'inventory' | 'spells' | 'features' | 'proficiencies' | 'background' | 'notes' | 'extras';

// Tab definitions for the popup menu grid
const MOBILE_TABS: { id: MobileTab; label: string; icon: string }[] = [
    { id: 'abilities',     label: 'Abilities',     icon: '🛡' },
    { id: 'skills',        label: 'Skills',        icon: '✦' },
    { id: 'actions',       label: 'Actions',       icon: '⚔' },
    { id: 'inventory',     label: 'Inventory',     icon: '🎒' },
    { id: 'spells',        label: 'Spells',        icon: '🔮' },
    { id: 'features',      label: 'Features',      icon: '⊙' },
    { id: 'proficiencies', label: 'Proficiencies', icon: '🔍' },
    { id: 'background',    label: 'Background',    icon: '📜' },
    { id: 'notes',         label: 'Notes',         icon: '📝' },
    { id: 'extras',        label: 'Extras',        icon: '•••' },
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
}: MobileViewProps) {
    const [activeTab, setActiveTab] = useState<MobileTab>('abilities');
    const [menuOpen, setMenuOpen] = useState(false);
    const [theme] = useSheetSetting<string>('theme', 'paladin');

    /**
     * Renders the content for the currently active mobile tab.
     * Each mobile tab composes its own blocks — MobileView only delegates.
     */
    const renderTabContent = () => {
        switch (activeTab) {
            case 'abilities':
                return <AbilitiesTab derived={derived} onRoll={onRoll} />;
            case 'skills':
                return <SkillsTab derived={derived} onRoll={onRoll} />;
            case 'actions':
                return <ActionsTab weapons={weapons} onRoll={onRoll} />;
            case 'spells':
                return <SpellsTab spells={spells} onRoll={onRoll} />;
            case 'inventory':
                return <InventoryTab weapons={weapons} gear={gear} />;
            case 'features':
                return <FeaturesTab features={features} />;
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
        <ModalProvider>
        <div data-theme={theme} style={{
            fontFamily: 'var(--font-body)',
            background: 'var(--surface-bg)',
            color: 'var(--text-primary)',
            minHeight: '100vh',
            paddingBottom: '64px', /* Space for bottom nav */
            fontSize: '14px', /* Base font bump for mobile */
        }}>
            {/* ---- Mobile-specific header ---- */}
            <MobileHeader actor={actor} derived={derived} foundryUrl={foundryUrl} />

            {/* ---- Scrollable body: active tab content ---- */}
            <main style={{
                padding: '16px',
                maxWidth: '100%',
                overflow: 'hidden', /* Prevent horizontal overflow */
            }}>
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
                        paddingBottom: '64px', /* Above bottom nav */
                    }}
                    onClick={() => setMenuOpen(false)}
                >
                    <div
                        style={{
                            background: 'var(--surface-card)',
                            borderRadius: '16px 16px 0 0',
                            padding: '16px',
                            width: '100%',
                            maxWidth: '420px',
                            border: '1px solid var(--theme-border)',
                            borderBottom: 'none',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Current tab label */}
                        <div style={{
                            textAlign: 'center',
                            fontSize: '10px',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.08em',
                            marginBottom: '12px',
                        }}>
                            Current: {MOBILE_TABS.find(t => t.id === activeTab)?.label}
                        </div>

                        {/* Tab grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '8px',
                        }}>
                            {MOBILE_TABS.map(tab => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                                        style={{
                                            padding: '14px 10px',
                                            textAlign: 'center',
                                            background: isActive ? 'var(--theme-glow)' : 'var(--surface-elevated)',
                                            border: isActive
                                                ? '2px solid var(--theme-primary)'
                                                : '1px solid var(--theme-border)',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: isActive ? 'var(--theme-primary)' : 'var(--text-primary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ---- Bottom Navigation ---- */}
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
                padding: '0 24px',
                zIndex: 50,
            }}>
                {/* Settings placeholder */}
                <button
                    style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        border: '1px solid var(--theme-border)',
                        background: 'transparent', color: 'var(--text-secondary)',
                        fontSize: '16px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    disabled
                >
                    ⚙
                </button>

                {/* Tab menu trigger — center, larger for touch */}
                <button
                    onClick={() => setMenuOpen(o => !o)}
                    style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        border: '2px solid var(--theme-border)',
                        background: menuOpen ? 'var(--theme-primary)' : 'var(--theme-glow)',
                        color: menuOpen ? 'var(--text-on-accent)' : 'var(--theme-primary)',
                        fontSize: '20px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: menuOpen ? '0 0 12px var(--theme-glow)' : 'none',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {menuOpen ? '▼' : '▲'}
                </button>

                {/* Back/collapse placeholder */}
                <button
                    style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        border: '1px solid var(--theme-border)',
                        background: 'transparent', color: 'var(--text-secondary)',
                        fontSize: '16px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    disabled
                >
                    ◀◀
                </button>
            </nav>
            <ModalHost />
        </div>
        </ModalProvider>
    );
}
