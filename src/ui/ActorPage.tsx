'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSDK, useSDKComponents, processHtmlContent } from '@sheet-delver/sdk';
import Sheet from './Sheet';

interface Props {
    actorId: string;
    token?: string | null;
}

/**
 * Self-sufficient actor page for D&D 5e.
 * All data fetching and realtime subscriptions go through useSDK() —
 * no platform internal imports needed.
 */
export default function DnD5eActorPage({ actorId }: Props) {
    const { fetchWithAuth, onActorUpdate, addNotification, foundryUrl } = useSDK();
    const { LoadingModal } = useSDKComponents();

    const [actor, setActor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const fetchActor = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await fetchWithAuth(`/api/actors/${actorId}`);
            if (res.status === 404) { setNotFound(true); return; }
            if (!res.ok) return;
            const data = await res.json();
            if (data && !data.error) setActor(data);
        } catch {
            // connection errors are silent — realtime will retry
        } finally {
            if (!silent) setLoading(false);
        }
    }, [actorId, fetchWithAuth]);

    useEffect(() => {
        fetchActor();
        const cleanup = onActorUpdate(actorId, () => fetchActor(true));
        return cleanup;
    }, [actorId, fetchActor, onActorUpdate]);

    const handleRoll = useCallback(async (type: string, key: string, options: Record<string, unknown> = {}) => {
        if (!actor) return;
        try {
            const res = await fetchWithAuth(`/api/actors/${actor.id}/roll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, key, options }),
            });
            const data = await res.json();
            if (data.success && data.html) {
                addNotification(processHtmlContent(data.html, foundryUrl), 'success', { html: true });
            } else if (data.success) {
                const total = data.result?.total;
                addNotification(`${data.label || 'Roll'}${total !== undefined ? `: ${total}` : ''}`, 'success');
            } else if (data.error) {
                addNotification(`Roll failed: ${data.error}`, 'error');
            }
        } catch (e: any) {
            addNotification(`Roll error: ${e.message}`, 'error');
        }
    }, [actor, fetchWithAuth, addNotification, foundryUrl]);

    const handleUpdate = useCallback(async (path: string, value: unknown) => {
        if (!actor) return;
        try {
            const res = await fetchWithAuth(`/api/actors/${actor.id}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [path]: value }),
            });
            const data = await res.json();
            if (data.success) fetchActor(true);
            else addNotification(`Update failed: ${data.error}`, 'error');
        } catch (e: any) {
            addNotification(`Update error: ${e.message}`, 'error');
        }
    }, [actor, fetchWithAuth, fetchActor, addNotification]);

    if (loading) return <LoadingModal message="Loading character..." />;

    if (notFound) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
                <div className="text-center p-8">
                    <p className="text-neutral-400 text-lg">Character not found.</p>
                </div>
            </div>
        );
    }

    if (!actor) return null;

    return (
        <Sheet
            actor={actor}
            onRoll={handleRoll}
            onUpdate={handleUpdate}
            foundryUrl={actor.foundryUrl ?? foundryUrl}
            isOwner={actor.isOwner ?? false}
        />
    );
}
