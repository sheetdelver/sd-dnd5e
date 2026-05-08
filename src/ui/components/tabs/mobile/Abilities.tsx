'use client';

import React from 'react';

import Abilities from '../../blocks/Abilities';
import SavingThrows from '../../blocks/SavingThrows';
import PassiveSenses from '../../blocks/PassiveSenses';

/**
 * Convention for `components/tabs/mobile/*`:
 *   Mobile tabs COMPOSE blocks. Mobile shows one tab at a time, so each tab
 *   stacks the related blocks vertically. `layout/MobileView.tsx` delegates
 *   to these tab components — it must NEVER render blocks inline.
 *
 * Abilities tab — composes Abilities + SavingThrows + PassiveSenses.
 */

interface Props {
    derived: Record<string, any>;
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

export default function AbilitiesTab({ derived, onRoll }: Props) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Abilities abilities={derived.abilities} onRoll={onRoll} columns={3} />
            <SavingThrows abilities={derived.abilities} onRoll={onRoll} />
            <PassiveSenses
                perception={derived.passivePerception}
                investigation={derived.passiveInvestigation}
                insight={derived.passiveInsight}
                senses={derived.senses}
            />
        </div>
    );
}
