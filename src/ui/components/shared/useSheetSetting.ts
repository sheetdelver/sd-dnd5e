'use client';

import { useCallback } from 'react';
import { useSheet } from './SheetContext';

/**
 * Per-sheet user setting backed by the shared `settings` map in SheetContext.
 *
 * Reads from the central map (seeded from `actor.flags._sheet_delver` and
 * localStorage at provider mount); writes go through `setSetting` which
 * updates the shared state and persists to actor flag (or localStorage when
 * `onUpdate` isn't available). Because every consumer reads the same map,
 * a write in one component is visible everywhere on the next render.
 */
export function useSheetSetting<T>(key: string, defaultValue: T): [T, (value: T) => void] {
    const { settings, setSetting } = useSheet();
    const stored = settings[key];
    const value = (stored !== undefined ? stored : defaultValue) as T;
    const setValue = useCallback((next: T) => setSetting(key, next), [setSetting, key]);
    return [value, setValue];
}
