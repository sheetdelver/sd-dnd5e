'use client';

import React from 'react';
import ProficienciesBlock from '../../blocks/Proficiencies';

/**
 * Proficiencies tab (mobile) — composes the Proficiencies block. No standard
 * counterpart: in StandardView, Proficiencies lives directly in the sidebar
 * rather than as a tab.
 */
export default function Proficiencies() {
    return <ProficienciesBlock />;
}
