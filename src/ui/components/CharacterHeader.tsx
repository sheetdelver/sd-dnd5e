'use client';

import React from 'react';
import { resolveImage } from '@sheet-delver/sdk';

interface Props {
    actor: Record<string, any>;
    derived: Record<string, any>;
    foundryUrl?: string;
}

export default function CharacterHeader({ actor, derived, foundryUrl }: Props) {
    const imgSrc = resolveImage(actor.img ?? '', foundryUrl);
    const hp = derived.hp ?? { value: 0, max: 0 };
    const hpPct = hp.max > 0 ? Math.max(0, Math.min(100, Math.round((hp.value / hp.max) * 100))) : 0;
    const hpColor = hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-600';

    const subtitle = [derived.race, derived.classes].filter(Boolean).join(' • ');

    return (
        <header className="sticky top-0 z-10 bg-white border-b border-stone-200 shadow-sm">
            {/* Identity row */}
            <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-stone-300 bg-stone-200 shrink-0 shadow">
                    <img src={imgSrc} alt={actor.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold text-stone-900 truncate leading-tight">{actor.name}</h1>
                    {subtitle && <p className="text-xs text-stone-500 truncate mt-0.5">{subtitle}</p>}
                    {/* HP bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                            <div className={`h-full ${hpColor} rounded-full transition-all duration-300`} style={{ width: `${hpPct}%` }} />
                        </div>
                        <span className="text-xs text-stone-500 tabular-nums shrink-0">{hp.value}/{hp.max}{hp.temp > 0 ? `+${hp.temp}` : ''}</span>
                    </div>
                </div>
                {(derived.level ?? 0) > 0 && (
                    <div className="text-center shrink-0">
                        <div className="text-xl font-bold text-red-700 leading-none">{derived.level}</div>
                        <div className="text-[9px] uppercase tracking-wider text-stone-400 mt-0.5">Level</div>
                    </div>
                )}
            </div>

            {/* Core stats strip */}
            <div className="grid grid-cols-5 divide-x divide-stone-100 border-t border-stone-100">
                <Chip label="AC"    value={derived.ac ?? 10} />
                <Chip label="Init"  value={signed(derived.initiative ?? 0)} />
                <Chip label="Speed" value={`${derived.speed?.walk ?? 30}ft`} />
                <Chip label="Prof"  value={signed(derived.profBonus ?? 2)} />
                <Chip label="Pass." value={derived.passivePerception ?? 10} />
            </div>
        </header>
    );
}

function Chip({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="py-1.5 text-center">
            <div className="text-xs font-bold text-stone-800 leading-none">{value}</div>
            <div className="text-[9px] text-stone-400 uppercase tracking-wide mt-0.5">{label}</div>
        </div>
    );
}

function signed(n: number): string {
    return n >= 0 ? `+${n}` : `${n}`;
}
