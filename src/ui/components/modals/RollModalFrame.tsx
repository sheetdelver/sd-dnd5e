'use client';

import React, { useId } from 'react';
import BaseModal from '../shared/BaseModal';

/** The sheet roller's native frame and controls, shared with HUD initiative. */
export default function RollModalFrame({ title, subtitle, onClose, children }: {
    title: string;
    subtitle?: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    const titleId = useId();
    return <BaseModal open onClose={onClose} maxWidth={420} labelledBy={titleId}>
        <button type="button" aria-label="Close" onClick={onClose} style={closeButtonStyle}>×</button>
        <h2 id={titleId} style={titleStyle}>{title}</h2>
        {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
        {children}
    </BaseModal>;
}

export function ConfigRow({ label, children }: { label: string; children: React.ReactNode }) {
    return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', alignItems: 'center',
        gap: 'var(--space-sm)', padding: '4px 0' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        {children}
    </div>;
}

export function AdvantageButton({ onClick, primary, children, disabled = false, label, onPreview, onPreviewEnd }: {
    onClick: () => void;
    primary?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
    label?: string;
    onPreview?: () => void;
    onPreviewEnd?: () => void;
}) {
    return <button type="button" onClick={onClick} disabled={disabled} aria-label={label} onFocus={onPreview} onBlur={onPreviewEnd}
        style={{ padding: '10px 4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.05em', background: primary ? 'var(--theme-glow)' : 'var(--surface-elevated)',
            color: primary ? 'var(--theme-primary)' : 'var(--text-primary)',
            border: primary ? '1px solid var(--theme-primary)' : '1px solid var(--theme-border)',
            borderRadius: 'var(--block-radius)', cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1, transition: 'all 0.1s' }}
        onMouseEnter={event => { if (!disabled) onPreview?.(); event.currentTarget.style.boxShadow = '0 0 8px var(--theme-glow)'; }}
        onMouseLeave={event => { onPreviewEnd?.(); event.currentTarget.style.boxShadow = 'none'; }}>{children}</button>;
}

const closeButtonStyle: React.CSSProperties = {
    position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', background: 'transparent',
    border: 'none', color: 'var(--text-secondary)', fontSize: '20px', lineHeight: 1, cursor: 'pointer', padding: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px',
};
const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)',
    textAlign: 'center', margin: '4px 0 4px', paddingRight: '24px', paddingLeft: '24px',
};
const subtitleStyle: React.CSSProperties = {
    fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '4px',
};
export const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', fontSize: '13px', background: 'var(--surface-elevated)',
    border: '1px solid var(--theme-border)', borderRadius: 'var(--block-radius)', color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)', boxSizing: 'border-box',
};
export const selectStyle: React.CSSProperties = {
    width: '100%', padding: '4px 8px', fontSize: '12px', background: 'var(--surface-card)',
    border: '1px solid var(--theme-border)', borderRadius: '4px', color: 'var(--text-primary)',
    cursor: 'pointer', boxSizing: 'border-box',
};
