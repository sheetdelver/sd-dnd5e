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

function readActorSettings(actor: Record<string, any> | null): SettingsMap {
    const flags = actor?.flags?.[FLAG_NAMESPACE];
    return (flags && typeof flags === 'object') ? { ...flags } : {};
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

export function SheetProvider({ actor, onUpdate, isOwner, foundryUrl, children }: ProviderProps) {
    // Seed settings from actor.flags first (authoritative), with localStorage
    // filling in anything the actor doesn't have. Re-seed on actor identity
    // change so switching characters loads the right palette.
    const [settings, setSettings] = useState<SettingsMap>(() => ({
        ...readLocalStorage(),
        ...readActorSettings(actor),
    }));

    const actorId = actor?._id ?? null;
    useEffect(() => {
        setSettings({
            ...readLocalStorage(),
            ...readActorSettings(actor),
        });
        // Only re-seed when the underlying character changes — incoming flag
        // updates from the server are layered on top via the next render's
        // actor prop without clobbering optimistic local writes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actorId]);

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
