'use client';

import React from 'react';

import Skills from '../../blocks/Skills';

interface Props {
    derived: Record<string, any>;
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

export default function SkillsTab({ derived, onRoll }: Props) {
    return <Skills skills={derived.skills} onRoll={onRoll} />;
}
