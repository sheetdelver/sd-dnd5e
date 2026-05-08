'use client';

import React from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import StandardSpells from '../standard/Spells';

interface Props {
    spells: FoundryItem[];
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

export default function Spells(props: Props) {
    return <StandardSpells {...props} />;
}
