'use client';

import React from 'react';
import { useModal } from '../shared/useModal';
import { useSheet } from '../shared/SheetContext';

/**
 * Characteristics block — Personality Traits, Ideals, Bonds, Flaws.
 *
 * Each field reads/writes `system.details.<field>` (HTML). Clicking a field
 * opens RichTextModal pre-filled with its current content; saving writes
 * back via `onUpdate`.
 */

const FIELDS: { key: 'trait' | 'ideal' | 'bond' | 'flaw'; label: string }[] = [
    { key: 'trait', label: 'Personality Traits' },
    { key: 'ideal', label: 'Ideals' },
    { key: 'bond',  label: 'Bonds' },
    { key: 'flaw',  label: 'Flaws' },
];

export default function Characteristics() {
    const { actor, onUpdate } = useSheet();
    const { openModal } = useModal();

    const details = (actor?.system?.details ?? {}) as Record<string, any>;
    const canEdit = Boolean(onUpdate);

    const openEditor = (field: typeof FIELDS[number]) => {
        const current = typeof details?.[field.key] === 'string' ? details[field.key] : '';
        openModal('richtext', {
            title: field.label,
            initialContent: current,
            placeholder: `Enter ${field.label.toLowerCase()}…`,
            onApply: async (next: string) => {
                if (!onUpdate) return;
                await onUpdate(`system.details.${field.key}`, next).catch(() => {});
            },
        });
    };

    return (
        <div className="block-card">
            <h2 className="block-heading">Characteristics</h2>
            {FIELDS.map(field => {
                const value = typeof details?.[field.key] === 'string' ? details[field.key] : '';
                return (
                    <div key={field.key} style={{ marginBottom: '8px' }}>
                        <div style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.05em',
                            marginBottom: '2px',
                        }}>
                            {field.label}
                        </div>
                        <button
                            type="button"
                            onClick={() => openEditor(field)}
                            disabled={!canEdit}
                            aria-label={`Edit ${field.label}`}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '4px 8px',
                                fontSize: '12px',
                                color: value ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontStyle: value ? 'normal' : 'italic',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '1px solid var(--theme-border)',
                                textAlign: 'left' as const,
                                cursor: canEdit ? 'pointer' : 'default',
                                lineHeight: 1.4,
                                opacity: canEdit ? 1 : 0.7,
                            }}
                        >
                            {value
                                ? <span dangerouslySetInnerHTML={{ __html: value }} />
                                : (canEdit ? `Click to add…` : '—')}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
