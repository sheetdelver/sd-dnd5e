'use client';

import React from 'react';

const ABILITY_ORDER = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
const ABILITY_LABEL: Record<string, string> = {
    str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA',
};

interface AbilityData {
    score: number;
    mod: number;
    save: number;
    saveProficient: boolean;
}

interface Props {
    abilities?: Record<string, AbilityData>;
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

export default function AbilityScores({ abilities, onRoll }: Props) {
    if (!abilities) return null;

    return (
        <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Ability Scores</h2>
            <div className="grid grid-cols-3 gap-2">
                {ABILITY_ORDER.map(key => {
                    const ab = abilities[key];
                    if (!ab) return null;
                    const mod = ab.mod;
                    return (
                        <button
                            key={key}
                            onClick={() => onRoll?.('ability', key)}
                            className="bg-white border border-stone-200 rounded-xl py-3 text-center shadow-sm hover:border-red-300 hover:shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                            <div className="text-[10px] text-stone-400 uppercase tracking-widest">{ABILITY_LABEL[key]}</div>
                            <div className="text-2xl font-bold text-stone-900 my-1 leading-none">
                                {mod >= 0 ? `+${mod}` : mod}
                            </div>
                            <div className="text-xs text-stone-400 border-t border-stone-100 pt-1.5 mt-1">{ab.score}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
