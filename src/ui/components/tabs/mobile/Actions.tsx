'use client';

import React from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import StandardActions from '../standard/Actions';

/**
 * Actions tab (mobile) — same slice + render pattern as the standard Actions
 * tab. Mobile-specific spacing/sizing comes from CSS media queries on the
 * shared block, so this tab delegates to keep the filter logic single-sourced.
 */

interface Props {
    weapons: FoundryItem[];
    extra?: FoundryItem[];
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

export default function Actions(props: Props) {
    return <StandardActions {...props} />;
}
