'use client';

import React, { useState } from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import { resolveImage, getSafeDescription, processHtmlContent } from '@sheet-delver/sdk';

interface Props {
    features: FoundryItem[];
    foundryUrl?: string;
}

export default function FeaturesTab({ features, foundryUrl }: Props) {
    if (features.length === 0) {
        return <p className="text-center text-stone-400 text-sm py-12">No features</p>;
    }

    return (
        <div className="p-4 space-y-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Features & Traits</h2>
            {features.map(item => (
                <FeatureRow key={item._id} item={item} foundryUrl={foundryUrl} />
            ))}
        </div>
    );
}

function FeatureRow({ item, foundryUrl }: { item: FoundryItem; foundryUrl?: string }) {
    const [open, setOpen] = useState(false);
    const rawDesc = getSafeDescription(item.system);
    const desc = rawDesc ? processHtmlContent(rawDesc, foundryUrl) : '';
    const imgSrc = resolveImage(item.img ?? '', foundryUrl);

    return (
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-stone-50 transition-colors"
            >
                <div className="w-7 h-7 rounded bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                    <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-800 truncate">{item.name}</div>
                    <div className="text-xs text-stone-400 capitalize">{item.type}</div>
                </div>
                <span className="text-stone-400 text-xs shrink-0">{open ? '▲' : '▼'}</span>
            </button>
            {open && desc && (
                <div
                    className="px-3 pb-3 pt-2 text-xs text-stone-600 border-t border-stone-100 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: desc }}
                />
            )}
        </div>
    );
}
