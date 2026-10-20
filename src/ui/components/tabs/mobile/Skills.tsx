'use client';

import React from 'react';

import Skills from '../../blocks/Skills';
import Tools from '../../blocks/Tools';

interface Props {
    derived: Record<string, any>;
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

export default function SkillsTab({ derived, onRoll }: Props) {
    return <><Skills skills={derived.skills} onRoll={onRoll} /><Tools onRoll={onRoll} /></>;
}
