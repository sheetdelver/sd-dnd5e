'use client';

import React from 'react';
import { useModal } from '../shared/useModal';
import { useSheet } from '../shared/SheetContext';

/**
 * Background block — character background name + biography.
 *
 * Reads `system.details.background` for the background name (or finds the
 * matching `type === 'background'` item) and `system.details.biography.value`
 * for the long-form description (HTML). Clicking the body opens
 * RichTextModal; the saved content is written back to
 * `system.details.biography.value`.
 */
export default function Background() {
    const { actor, onUpdate } = useSheet();
    const { openModal } = useModal();

    const sys = (actor?.system ?? {}) as Record<string, any>;
    // dnd5e v3.x: `system.details.background` is sometimes a string (name)
    // and sometimes an object. We also fall back to the background item.
    const detailsBg = sys?.details?.background;
    const backgroundName = typeof detailsBg === 'string'
        ? detailsBg
        : (detailsBg?.name
            ?? (actor?.items ?? []).find((i: { type: string; name: string }) => i.type === 'background')?.name
            ?? '');
    const biographyHtml = typeof sys?.details?.biography?.value === 'string'
        ? sys.details.biography.value
        : '';

    const canEdit = Boolean(onUpdate);

    const handleEdit = () => {
        openModal('richtext', {
            title: 'Biography',
            subtitle: backgroundName || undefined,
            initialContent: biographyHtml,
            placeholder: 'Tell your character\'s story…',
            onApply: async (next: string) => {
                if (!onUpdate) return;
                await onUpdate('system.details.biography.value', next).catch(() => {});
            },
        });
    };

    return (
        <div className="block-card">
            <h2 className="block-heading">Background</h2>

            {backgroundName && (
                <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-sm)',
                }}>
                    {backgroundName}
                </div>
            )}

            <button
                type="button"
                onClick={handleEdit}
                disabled={!canEdit}
                aria-label="Edit biography"
                style={{
                    display: 'block',
                    width: '100%',
                    padding: 'var(--space-sm)',
                    background: 'var(--surface-elevated)',
                    border: '1px dashed var(--theme-border)',
                    borderRadius: 'var(--block-radius)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    textAlign: 'left' as const,
                    cursor: canEdit ? 'pointer' : 'default',
                    opacity: canEdit ? 1 : 0.7,
                }}
            >
                {biographyHtml ? (
                    <div
                        style={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                        }}
                        dangerouslySetInnerHTML={{ __html: biographyHtml }}
                    />
                ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Click to add biography…
                    </span>
                )}
            </button>
        </div>
    );
}
