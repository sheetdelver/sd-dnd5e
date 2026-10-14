'use client';

import React, { useId, useState } from 'react';
import type { InitiativeRollModalProps } from '@sheet-delver/sdk/react';
import RollModalFrame, { AdvantageButton, ConfigRow, inputStyle } from './RollModalFrame';

/** Native module presentation with only the SDK's bounded initiative choices. */
export default function InitiativeModal(props: InitiativeRollModalProps) {
    const [manual, setManual] = useState(!props.rollAvailable);
    const [total, setTotal] = useState('');
    const inputId = useId();
    if (!props.isOpen) return null;
    const value = total.trim() ? Number(total) : Number.NaN;
    return <RollModalFrame title={props.title} subtitle={props.combatantName} onClose={props.onClose}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-sm)',
            margin: 'var(--space-md) 0', alignItems: 'baseline' }}>
            <code style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', overflowWrap: 'anywhere' }}>{props.formula || 'Unavailable'}</code>
            <span style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--text-muted)' }}>Formula</span>
        </div>
        <div style={{ padding: 'var(--space-sm) var(--space-md)', border: '1px solid var(--theme-border)',
            borderRadius: 'var(--block-radius)', background: 'var(--surface-elevated)', marginBottom: 'var(--space-md)' }}>
            <ConfigRow label="Roll Mode"><span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{props.audience === 'gm' ? 'Private GM Roll' : 'Public Roll'}</span></ConfigRow>
            <ConfigRow label="Source"><span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{props.source === 'module' ? 'System module' : props.source === 'gm' ? 'GM setting' : 'Core fallback'}</span></ConfigRow>
        </div>
        {props.manualAvailable && <div style={{ marginBottom: 'var(--space-md)' }}>
            <AdvantageButton onClick={() => setManual(!manual)}>{manual ? 'Revert to Roll' : 'Manual total'}</AdvantageButton>
        </div>}
        {manual && props.manualAvailable ? <>
            <label htmlFor={inputId} style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Final initiative total</label>
            <input id={inputId} type="number" step="any" value={total} onChange={event => setTotal(event.target.value)}
                style={{ ...inputStyle, margin: 'var(--space-sm) 0 var(--space-md)' }} />
            <AdvantageButton primary disabled={!Number.isFinite(value)} onClick={() => props.onConfirm({ kind: 'manual', total: value })}>Submit total</AdvantageButton>
        </> : props.rollAvailable && <div className="dnd5e-initiative-options" style={{ gridTemplateColumns: props.advantageAvailable ? undefined : '1fr' }}>
            {props.advantageAvailable && <AdvantageButton onClick={() => props.onConfirm({ kind: 'roll', advantageMode: 'advantage' })}>Advantage</AdvantageButton>}
            <AdvantageButton primary label="Roll initiative" onClick={() => props.onConfirm({ kind: 'roll' })}>Default</AdvantageButton>
            {props.advantageAvailable && <AdvantageButton onClick={() => props.onConfirm({ kind: 'roll', advantageMode: 'disadvantage' })}>Disadvantage</AdvantageButton>}
        </div>}
    </RollModalFrame>;
}
