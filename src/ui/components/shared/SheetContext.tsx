'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Sheet-level context — exposes the actor + onUpdate to nested components,
 * and holds the live settings map (`flags._sheet_delver.*`) so that all
 * `useSheetSetting` consumers observe the same value across the tree.
 *
 * Why centralized settings state: if every `useSheetSetting` call kept its
 * own `useState`, a write from one component (e.g. THEME button in the
 * header) wouldn't propagate to another consumer (e.g. the layout's
 * `data-theme` attribute). Sharing through context guarantees single-source-
 * of-truth.
 */

export type ActorOnUpdate = (path: string, value: unknown) => Promise<void>;

const FLAG_NAMESPACE = '_sheet_delver';

type SettingsMap = Record<string, unknown>;

interface SheetContextValue {
    actor: Record<string, any> | null;
    onUpdate: ActorOnUpdate | null;
    isOwner: boolean;
    foundryUrl: string | undefined;
    settings: SettingsMap;
    setSetting: (key: string, value: unknown) => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);

interface ProviderProps {
    actor: Record<string, any>;
    onUpdate?: ActorOnUpdate;
    isOwner?: boolean;
    foundryUrl?: string;
    children: React.ReactNode;
}

/**
 * Read settings from the actor's flags, defensively handling both possible
 * storage shapes:
 *   1. Nested object — `actor.flags._sheet_delver = { theme: 'rogue' }`
 *      (what we'd ideally want; produced when the update endpoint expands
 *      dotted paths into nested writes).
 *   2. Flat dot-keys — `actor.flags['_sheet_delver.theme'] = 'rogue'`
 *      (what some Foundry update endpoints actually produce when given
 *      `{ "flags._sheet_delver.theme": "rogue" }` as a flat patch).
 *
 * Whichever shape the server stored, we resolve back to a flat `{ theme: ... }`
 * map.
 */
function readActorSettings(actor: Record<string, any> | null): SettingsMap {
    if (!actor?.flags || typeof actor.flags !== 'object') return {};
    const out: SettingsMap = {};

    // Shape 1: nested object.
    const nested = (actor.flags as Record<string, unknown>)[FLAG_NAMESPACE];
    if (nested && typeof nested === 'object') {
        Object.assign(out, nested as Record<string, unknown>);
    }

    // Shape 2: flat dot-keys at the top of the flags map.
    for (const [k, v] of Object.entries(actor.flags as Record<string, unknown>)) {
        if (k.startsWith(`${FLAG_NAMESPACE}.`)) {
            out[k.slice(FLAG_NAMESPACE.length + 1)] = v;
        }
    }

    return out;
}

function readLocalStorage(): SettingsMap {
    if (typeof window === 'undefined') return {};
    const out: SettingsMap = {};
    for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (!k || !k.startsWith(`${FLAG_NAMESPACE}.`)) continue;
        const raw = window.localStorage.getItem(k);
        if (raw === null) continue;
        try { out[k.slice(FLAG_NAMESPACE.length + 1)] = JSON.parse(raw); } catch { /* noop */ }
    }
    return out;
}

const VALID_THEMES = new Set([
    'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk',
    'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard',
]);

/**
 * Derive a default theme from the actor's primary class. Used when the
 * settings map has no `theme` key from either the actor flag or localStorage
 * — first time we see this character, paint the sheet with their class
 * palette automatically. Once the user picks a theme via ThemeModal, it
 * persists to flags/localStorage and overrides this fallback on subsequent
 * loads.
 */
function deriveThemeFromClass(actor: Record<string, any> | null): string | undefined {
    if (!actor) return undefined;
    const items = Array.isArray(actor.items) ? actor.items : [];
    const classItem = items.find((i: { type?: string }) => i?.type === 'class');
    if (!classItem) return undefined;
    const candidate = String(classItem.name ?? '').toLowerCase();
    return VALID_THEMES.has(candidate) ? candidate : undefined;
}

/**
 * Seed the settings map. Read order:
 *   1. localStorage (per-browser fallback)
 *   2. Actor flag (authoritative — overrides localStorage)
 *   3. Class-derived defaults for known keys (theme) when neither is set
 */
function seedSettings(actor: Record<string, any> | null): SettingsMap {
    const merged: SettingsMap = {
        ...readLocalStorage(),
        ...readActorSettings(actor),
    };
    if (merged.theme === undefined) {
        const classTheme = deriveThemeFromClass(actor);
        if (classTheme) merged.theme = classTheme;
    }
    return merged;
}

export function SheetProvider({ actor, onUpdate, isOwner, foundryUrl, children }: ProviderProps) {
    // Seed settings from actor.flags first (authoritative), with localStorage
    // filling in anything the actor doesn't have. When neither has a value
    // for `theme`, fall back to the actor's class-derived default. Re-seed
    // on actor identity change so switching characters loads the right
    // palette.
    const [settings, setSettings] = useState<SettingsMap>(() => seedSettings(actor));

    const actorId = actor?._id ?? null;
    // Track flag content (not just actor identity) so that asynchronously
    // hydrated flags re-seed the settings map. Without this, a saved theme
    // that arrives a render after the actor id can be missed and the class
    // fallback paints over it.
    const flagsHash = useMemo(() => {
        try {
            const settingsKeys = readActorSettings(actor);
            return JSON.stringify(settingsKeys);
        } catch {
            return '';
        }
    }, [actor]);

    useEffect(() => {
        setSettings(seedSettings(actor));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actorId, flagsHash]);

    const setSetting = useCallback((key: string, value: unknown) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        if (onUpdate) {
            onUpdate(`flags.${FLAG_NAMESPACE}.${key}`, value).catch(() => {
                // Server write failed — fall back to localStorage so the
                // setting still survives a reload.
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(`${FLAG_NAMESPACE}.${key}`, JSON.stringify(value));
                }
            });
        } else if (typeof window !== 'undefined') {
            window.localStorage.setItem(`${FLAG_NAMESPACE}.${key}`, JSON.stringify(value));
        }
    }, [onUpdate]);

    const value = useMemo<SheetContextValue>(() => ({
        actor,
        onUpdate: onUpdate ?? null,
        isOwner: Boolean(isOwner),
        foundryUrl,
        settings,
        setSetting,
    }), [actor, onUpdate, isOwner, foundryUrl, settings, setSetting]);

    return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

export function useSheet(): SheetContextValue {
    const ctx = useContext(SheetContext);
    if (!ctx) {
        throw new Error('useSheet must be used inside <SheetProvider>');
    }
    return ctx;
}
