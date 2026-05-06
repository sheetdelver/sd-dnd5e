'use client';

import React, { useState } from 'react';

const SKILL_ORDER = [
    'acr', 'ani', 'arc', 'ath', 'dec', 'his', 'ins', 'itm',
    'inv', 'med', 'nat', 'prc', 'prf', 'per', 'rel', 'slt', 'ste', 'sur',
];

// proficiency multiplier → indicator
const PROF_ICON: Record<string, string> = { '0': '○', '0.5': '◐', '1': '●', '2': '◉' };
const PROF_COLOR: Record<string, string> = {
    '0': 'text-stone-300', '0.5': 'text-amber-400', '1': 'text-green-500', '2': 'text-blue-500',
};

interface SkillData {
    total: number;
    prof: number;
    ability: string;
    label: string;
}

interface Props {
    skills?: Record<string, SkillData>;
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

export default function SkillList({ skills, onRoll }: Props) {
    const [expanded, setExpanded] = useState(false);
    if (!skills) return null;

    const ordered = SKILL_ORDER.filter(k => skills[k]);
    const visible = expanded ? ordered : ordered.slice(0, 10);

    return (
        <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Skills</h2>
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
                {visible.map(key => {
                    const skill = skills[key];
                    const profKey = String(skill.prof);
                    const icon  = PROF_ICON[profKey]  ?? '○';
                    const color = PROF_COLOR[profKey] ?? 'text-stone-300';
                    return (
                        <button
                            key={key}
                            onClick={() => onRoll?.('skill', key)}
                            className="w-full flex items-center px-3 py-2 text-sm hover:bg-stone-50 active:bg-stone-100 transition-colors text-left"
                        >
                            <span className={`text-sm mr-2.5 ${color}`}>{icon}</span>
                            <span className="flex-1 text-stone-700 text-xs">{skill.label}</span>
                            <span className="text-[10px] text-stone-400 uppercase mr-2">{skill.ability}</span>
                            <span className="font-semibold text-stone-900 text-xs w-7 text-right tabular-nums">
                                {skill.total >= 0 ? `+${skill.total}` : skill.total}
                            </span>
                        </button>
                    );
                })}
            </div>
            {ordered.length > 10 && (
                <button
                    onClick={() => setExpanded(e => !e)}
                    className="w-full text-center text-xs text-stone-400 hover:text-stone-600 py-2 transition-colors"
                >
                    {expanded ? 'Show less' : `Show all ${ordered.length} skills`}
                </button>
            )}
        </div>
    );
}
