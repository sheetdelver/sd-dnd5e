'use client';

import React from 'react';

/**
 * Notes block — generic single-section notes renderer.
 *
 * Used by the Notes tab to render Organizations / Allies / Enemies /
 * Backstory / Other in turn. Each instance accepts a `title`, optional
 * `body` (HTML), and optional `onEdit` handler — when `onEdit` is supplied,
 * the body area becomes a clickable button that opens RichTextModal.
 */

interface Props {
    title?: string;
    body?: string;
    onEdit?: () => void;
}

export default function Notes({ title = 'Notes', body, onEdit }: Props) {
    const hasBody = Boolean(body && body.trim().length > 0);
    const editable = Boolean(onEdit);

    if (!editable) {
        return (
            <div className="block-card">
                <h2 className="block-heading">{title}</h2>
                {hasBody ? (
                    <div
                        style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}
                        dangerouslySetInnerHTML={{ __html: body! }}
                    />
                ) : (
                    <div className="stub-placeholder">No notes to display</div>
                )}
            </div>
        );
    }

    return (
        <div className="block-card">
            <h2 className="block-heading">{title}</h2>
            <button
                type="button"
                onClick={onEdit}
                aria-label={`Edit ${title}`}
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
                    cursor: 'pointer',
                    minHeight: '60px',
                }}
            >
                {hasBody ? (
                    <div dangerouslySetInnerHTML={{ __html: body! }} />
                ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Click to add notes…
                    </span>
                )}
            </button>
        </div>
    );
}
