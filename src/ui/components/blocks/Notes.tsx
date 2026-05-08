'use client';

import React from 'react';

interface Props {
    title?: string;
    /** Free-form content for the section. When omitted, an empty-state placeholder shows. */
    body?: string;
}

export default function Notes({ title = 'Notes', body }: Props) {
    return (
        <div className="block-card">
            <h2 className="block-heading">{title}</h2>
            {body ? (
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {body}
                </div>
            ) : (
                <div className="stub-placeholder">No notes to display</div>
            )}
        </div>
    );
}
