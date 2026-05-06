'use client';

import React, { useState } from 'react';
import type { ActorSheetData, FoundryItem } from '@sheet-delver/sdk';
import CharacterHeader from './components/CharacterHeader';
import AbilityScores from './components/AbilityScores';
import SkillList from './components/SkillList';
import CombatTab from './components/CombatTab';
import SpellsTab from './components/SpellsTab';
import FeaturesTab from './components/FeaturesTab';
import GearTab from './components/GearTab';

type Tab = 'stats' | 'combat' | 'spells' | 'features' | 'gear';

interface Props {
    actor: ActorSheetData & Record<string, any>;
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
    onUpdate?: (path: string, value: unknown) => Promise<void>;
    foundryUrl?: string;
    isOwner?: boolean;
    // accept but ignore SheetRouter-specific props
    [key: string]: unknown;
}

export default function DnD5eSheet({ actor, onRoll, onUpdate, foundryUrl, isOwner }: Props) {
    const [tab, setTab] = useState<Tab>('stats');

    const derived = (actor.derived ?? {}) as Record<string, any>;
    const items: FoundryItem[] = actor.items ?? [];

    const weapons  = items.filter(i => i.type === 'weapon');
    const spells   = items.filter(i => i.type === 'spell');
    const features = items.filter(i => ['feat', 'class', 'subclass', 'background', 'race'].includes(i.type));
    const gear     = items.filter(i => ['equipment', 'consumable', 'tool', 'loot'].includes(i.type));

    const tabs: { id: Tab; label: string; count?: number }[] = [
        { id: 'stats',    label: 'Stats' },
        { id: 'combat',   label: 'Combat' },
        { id: 'spells',   label: 'Spells',   count: spells.length },
        { id: 'features', label: 'Features', count: features.length },
        { id: 'gear',     label: 'Gear',     count: gear.length },
    ];

    return (
        <div className="flex flex-col min-h-[100dvh] bg-stone-50 text-stone-900 font-sans">
            <CharacterHeader actor={actor} derived={derived} foundryUrl={foundryUrl} />

            <main className="flex-1 overflow-y-auto pb-20">
                {tab === 'stats' && (
                    <div className="p-4 space-y-4">
                        <AbilityScores abilities={derived.abilities} onRoll={onRoll} />
                        <SkillList skills={derived.skills} onRoll={onRoll} />
                    </div>
                )}
                {tab === 'combat' && (
                    <CombatTab
                        abilities={derived.abilities}
                        weapons={weapons}
                        profBonus={derived.profBonus ?? 2}
                        onRoll={onRoll}
                        foundryUrl={foundryUrl}
                    />
                )}
                {tab === 'spells' && (
                    <SpellsTab spells={spells} foundryUrl={foundryUrl} />
                )}
                {tab === 'features' && (
                    <FeaturesTab features={features} foundryUrl={foundryUrl} />
                )}
                {tab === 'gear' && (
                    <GearTab gear={gear} foundryUrl={foundryUrl} isOwner={isOwner} />
                )}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-stone-200 z-20">
                <div className="max-w-lg mx-auto flex justify-around py-2 px-2">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                                tab === t.id
                                    ? 'text-red-700 font-bold'
                                    : 'text-stone-500 hover:text-stone-800'
                            }`}
                        >
                            <span>{t.label}</span>
                            {t.count !== undefined && t.count > 0 && (
                                <span className="text-[9px] text-stone-400 tabular-nums">{t.count}</span>
                            )}
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}
