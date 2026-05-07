'use client';

import React from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import { resolveImage } from '@sheet-delver/sdk';

const SPELL_LEVEL_LABEL = ['Cantrip', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

interface Props {
    spells: FoundryItem[];
    foundryUrl?: string;
}

export default function Spells({ spells, foundryUrl }: Props) {
    if (spells.length === 0) {
        return <p className="text-center text-stone-400 text-sm py-12">No spells prepared</p>;
    }

    // Group by level
    const byLevel = spells.reduce<Record<number, FoundryItem[]>>((acc, spell) => {
        const level = Number((spell.system as any)?.level ?? 0);
        if (!acc[level]) acc[level] = [];
        acc[level].push(spell);
        return acc;
    }, {});

    return (
        <div className="p-4 space-y-4">
            {Object.entries(byLevel)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([level, levelSpells]) => (
                    <section key={level}>
                        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">
                            {SPELL_LEVEL_LABEL[Number(level)] ?? `Level ${level}`}
                        </h3>
                        <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
                            {levelSpells.map(spell => {
                                const sys = spell.system as Record<string, any>;
                                const imgSrc = resolveImage(spell.img ?? '', foundryUrl);
                                return (
                                    <div key={spell._id} className="flex items-center gap-2 px-3 py-2">
                                        <div className="w-7 h-7 rounded bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                                            <img src={imgSrc} alt={spell.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-stone-800 truncate">{spell.name}</div>
                                            {sys?.school && (
                                                <div className="text-xs text-stone-400 capitalize">{sys.school}</div>
                                            )}
                                        </div>
                                        {sys?.components?.concentration && (
                                            <span className="text-[9px] text-purple-500 font-semibold uppercase">C</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}
        </div>
    );
}
