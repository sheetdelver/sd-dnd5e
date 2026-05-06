'use client';

import React from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import { resolveImage } from '@sheet-delver/sdk';

interface Props {
    gear: FoundryItem[];
    foundryUrl?: string;
    isOwner?: boolean;
}

export default function GearTab({ gear, foundryUrl }: Props) {
    if (gear.length === 0) {
        return <p className="text-center text-stone-400 text-sm py-12">No equipment</p>;
    }

    // Split into equipped and carried
    const equipped = gear.filter(i => (i.system as any)?.equipped);
    const carried  = gear.filter(i => !(i.system as any)?.equipped);

    return (
        <div className="p-4 space-y-4">
            {equipped.length > 0 && (
                <Section label="Equipped" items={equipped} foundryUrl={foundryUrl} />
            )}
            <Section label={equipped.length > 0 ? 'Carried' : 'Equipment'} items={carried} foundryUrl={foundryUrl} />
        </div>
    );
}

function Section({ label, items, foundryUrl }: { label: string; items: FoundryItem[]; foundryUrl?: string }) {
    return (
        <section>
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">{label}</h2>
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
                {items.map(item => {
                    const sys = item.system as Record<string, any>;
                    const qty = sys?.quantity ?? 1;
                    const imgSrc = resolveImage(item.img ?? '', foundryUrl);
                    return (
                        <div key={item._id} className="flex items-center gap-2 px-3 py-2">
                            <div className="w-8 h-8 rounded bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                                <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-stone-800 truncate">{item.name}</div>
                                <div className="text-xs text-stone-400 capitalize">{item.type}</div>
                            </div>
                            {qty > 1 && (
                                <span className="text-xs text-stone-500 tabular-nums shrink-0">×{qty}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
