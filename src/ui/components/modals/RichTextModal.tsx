'use client';

import React, { useState } from 'react';
import { useSDKComponents } from '@sheet-delver/sdk';
import BaseModal from '../shared/BaseModal';

/**
 * RichTextModal — wraps the SDK's `RichTextEditor` for editable narrative
 * fields (Background, Characteristics, Notes). Falls back to a plain
 * `<textarea>` if the SDK component isn't available at runtime.
 *
 * The modal stays decoupled from the actor — caller passes initial content
 * and an onApply callback that does the actual `onUpdate` write.
 */

export interface RichTextModalProps {
    title?: string;
    subtitle?: string;
    initialContent?: string;
    placeholder?: string;
    onApply: (content: string) => void | Promise<void>;
    onClose: () => void;
}

export default function RichTextModal({
    title = 'Edit',
    subtitle,
    initialContent = '',
    placeholder,
    onApply,
    onClose,
}: RichTextModalProps) {
    const { RichTextEditor } = useSDKComponents();
    const [content, setContent] = useState<string>(initialContent);

    const handleSave = async () => {
        await onApply(content);
        onClose();
    };

    return (
        <BaseModal open onClose={onClose} maxWidth={640}>
            <button type="button" aria-label="Close" onClick={onClose} style={closeButtonStyle}>×</button>

            <h2 style={titleStyle}>{title}</h2>
            {subtitle && <div style={subtitleStyle}>{subtitle}</div>}

            <div style={{
                marginTop: 'var(--space-md)',
                marginBottom: 'var(--space-md)',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--theme-border)',
                borderRadius: 'var(--block-radius)',
                overflow: 'hidden',
            }}>
                {RichTextEditor ? (
                    <RichTextEditor
                        content={content}
                        onChange={setContent}
                        placeholder={placeholder}
                        minHeight={240}
                    />
                ) : (
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder={placeholder}
                        style={textareaStyle}
                    />
                )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} style={cancelButtonStyle}>Cancel</button>
                <button type="button" onClick={handleSave} style={confirmButtonStyle}>Save</button>
            </div>
        </BaseModal>
    );
}

const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '28px',
    height: '28px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '20px',
    lineHeight: 1,
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
};

const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    textAlign: 'center',
    margin: '4px 0 4px',
    paddingRight: '24px',
    paddingLeft: '24px',
};

const subtitleStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
};

const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '240px',
    padding: 'var(--space-md)',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    lineHeight: 1.5,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
};

const cancelButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--theme-border)',
    borderRadius: 'var(--block-radius)',
    cursor: 'pointer',
};

const confirmButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    background: 'var(--theme-primary)',
    color: 'var(--text-on-accent)',
    border: '1px solid var(--theme-primary)',
    borderRadius: 'var(--block-radius)',
    cursor: 'pointer',
};
