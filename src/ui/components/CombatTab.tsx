'use client';

import React from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import { resolveImage } from '@sheet-delver/sdk';

const SAVE_ORDER = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
const ABILITY_SHORT: Record<string, string> = {
    str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA',
};

interface AbilityData {
    mod: number;
    save: number;
    saveProficient: boolean;
}

interface Props {
    abilities?: Record<string, AbilityData>;
    weapons: FoundryItem[];
    profBonus: number;
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
    foundryUrl?: string;
}

export default function CombatTab({ abilities, weapons, profBonus, onRoll, foundryUrl }: Props) {
    return (
        <div className="p-4 space-y-5">
            {/* Saving throws */}
            <section>
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Saving Throws</h2>
                <div className="bg-white rounded-xl border border-stone-200 shadow-sm grid grid-cols-3">
                    {SAVE_ORDER.map((key, i) => {
                        const ab = abilities?.[key];
                        if (!ab) return null;
                        return (
                            <button
                                key={key}
                                onClick={() => onRoll?.('save', key)}
                                className={`py-3 text-center hover:bg-stone-50 active:bg-stone-100 transition-colors ${i % 3 !== 2 ? 'border-r border-stone-100' : ''} ${i >= 3 ? 'border-t border-stone-100' : ''}`}
                            >
                                <div className="text-[10px] text-stone-400 uppercase tracking-wide">{ABILITY_SHORT[key]}</div>
                                <div className="font-bold text-stone-900 text-sm leading-none mt-1">
                                    {ab.save >= 0 ? `+${ab.save}` : ab.save}
                                </div>
                                {ab.saveProficient && (
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mx-auto mt-1" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Attacks */}
            <section>
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Attacks</h2>
                {weapons.length === 0 ? (
                    <p className="text-center text-stone-400 text-sm py-6">No weapons</p>
                ) : (
                    <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
                        {weapons.map(weapon => (
                            <WeaponRow
                                key={weapon._id}
                                weapon={weapon}
                                profBonus={profBonus}
                                abilities={abilities}
                                onRoll={onRoll}
                                foundryUrl={foundryUrl}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function WeaponRow({ weapon, profBonus, abilities, onRoll, foundryUrl }: {
    weapon: FoundryItem;
    profBonus: number;
    abilities?: Record<string, AbilityData>;
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
    foundryUrl?: string;
}) {
    const sys = weapon.system as Record<string, any>;
    const imgSrc = resolveImage(weapon.img ?? '', foundryUrl);

    const actionType = sys?.actionType ?? '';
    const isRanged = actionType === 'rwak' || actionType === 'rsak';
    const abilityKey = sys?.ability || (isRanged ? 'dex' : 'str');
    const abilityMod = abilities?.[abilityKey]?.mod ?? 0;
    const bonus = Number(sys?.attackBonus ?? 0);
    const totalHit = abilityMod + profBonus + bonus;
    const hitStr = totalHit >= 0 ? `+${totalHit}` : `${totalHit}`;

    const damageParts: [string, string][] = sys?.damage?.parts ?? [];
    const damageStr = damageParts.length > 0
        ? damageParts.map(([f, t]) => `${f} ${t}`).join(' + ')
        : '—';

    return (
        <button
            onClick={() => onRoll?.('attack', weapon._id)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-stone-50 active:bg-stone-100 transition-colors"
        >
            <div className="w-8 h-8 rounded bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                <img src={imgSrc} alt={weapon.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-stone-800 truncate">{weapon.name}</div>
                <div className="text-xs text-stone-400 truncate">{damageStr}</div>
            </div>
            <div className="text-sm font-bold text-red-700 shrink-0">{hitStr}</div>
        </button>
    );
}
