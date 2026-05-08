'use client';

import React from 'react';
import type { FeatureRow } from '../../types';

interface Props {
    rows?: FeatureRow[];
    title?: string;
}

const SOURCE_LABEL: Record<string, string> = {
    class: 'Class',
    subclass: 'Subclass',
    species: 'Species',
    feat: 'Feat',
    background: 'Background',
};

export default function Features({ rows = [], title = 'Features' }: Props) {
    return (
        <div className="block-card">
            <h2 className="block-heading">{title}</h2>
            {rows.length === 0 ? (
                <div className="stub-placeholder">No features to display</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {rows.map(row => (
                        <div key={row.key} style={{
                            paddingBottom: '6px',
                            borderBottom: '1px solid var(--theme-border)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {row.name}
                                </span>
                                <span style={{
                                    fontSize: '9px',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase' as const,
                                    letterSpacing: '0.05em',
                                }}>
                                    {row.sourceLabel ?? SOURCE_LABEL[row.source] ?? row.source}
                                </span>
                            </div>
                            {row.description && (
                                <div style={{
                                    fontSize: '11px',
                                    color: 'var(--text-secondary)',
                                    marginTop: '2px',
                                    lineHeight: 1.4,
                                }}>
                                    {row.description}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
