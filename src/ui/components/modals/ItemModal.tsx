'use client';

import React from 'react';
import { resolveImage } from '@sheet-delver/sdk';
import BaseModal from '../shared/BaseModal';
import { useSheet } from '../shared/SheetContext';

/**
 * ItemModal — equipment / inventory detail viewer.
 *
 * Layout:
 *   [×]
 *   Title (item.name)              Type badge
 *   ┌─────┐
 *   │ img │   Properties grid (qty, weight, rarity, etc.)
 *   └─────┘
 *   Description (HTML-rendered)
 *   [Equip / Attune toggles]
 *   [Close]
 *
 * The modal looks up `actor + foundryUrl` via SheetContext so the caller only
 * has to pass the FoundryItem reference (which it already has from the row's
 * key lookup).
 */

interface FoundryItemLike {
    _id: string;
    name: string;
    type: string;
    img?: string | null;
    system?: Record<string, any>;
}

export interface ItemModalProps {
    item: FoundryItemLike;
    onClose: () => void;
}

const TYPE_LABEL: Record<string, string> = {
    weapon: 'Weapon',
    equipment: 'Equipment',
    consumable: 'Consumable',
    tool: 'Tool',
    loot: 'Loot',
    container: 'Container',
    backpack: 'Backpack',
    feat: 'Feature',
    spell: 'Spell',
};

const RARITY_COLORS: Record<string, string> = {
    common: '#bdc3c7',
    uncommon: '#27ae60',
    rare: '#2980b9',
    veryRare: '#8e44ad',
    legendary: '#e67e22',
    artifact: '#c0392b',
};

export default function ItemModal({ item, onClose }: ItemModalProps) {
    const { actor, foundryUrl, onUpdate } = useSheet();
    const sys = (item.system ?? {}) as Record<string, any>;
    const img = resolveImage(item.img ?? '', foundryUrl);
    const description = typeof sys?.description?.value === 'string' ? sys.description.value : '';
    const rarity = typeof sys?.rarity === 'string' ? sys.rarity : undefined;
    const equipped = Boolean(sys?.equipped);
    const attuned = Boolean(sys?.attuned);
    const canAttune = sys?.attunement === 1 || sys?.attunement === 2 || sys?.requiresAttunement;
    const canApply = Boolean(onUpdate);

    // Look up the up-to-date item from the actor (in case of mid-modal updates).
    const liveItem = (actor?.items ?? []).find((i: { _id: string }) => i._id === item._id) ?? item;
    const liveSys = liveItem.system ?? sys;
    const liveEquipped = Boolean(liveSys?.equipped);
    const liveAttuned = Boolean(liveSys?.attuned);

    const writeField = async (path: string, value: unknown) => {
        if (!onUpdate) return;
        await onUpdate(`items.${item._id}.${path}`, value).catch(() => {});
    };

    return (
        <BaseModal open onClose={onClose} maxWidth={520}>
            <button type="button" aria-label="Close" onClick={onClose} style={closeButtonStyle}>×</button>

            <h2 style={titleStyle}>{item.name}</h2>
            <div style={subtitleStyle}>{TYPE_LABEL[item.type] ?? item.type}</div>

            {/* Top row: image + property grid */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    flexShrink: 0,
                    borderRadius: 'var(--block-radius)',
                    border: '1px solid var(--theme-border)',
                    overflow: 'hidden',
                    background: 'var(--surface-elevated)',
                }}>
                    {img && (
                        <img
                            src={img}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    )}
                </div>

                <div style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    columnGap: 'var(--space-md)',
                    rowGap: '4px',
                    fontSize: '12px',
                    alignContent: 'start',
                }}>
                    {typeof sys?.quantity === 'number' && (
                        <PropertyRow label="Quantity" value={String(sys.quantity)} />
                    )}
                    {typeof sys?.weight === 'number' && sys.weight > 0 && (
                        <PropertyRow label="Weight" value={`${sys.weight} lb.`} />
                    )}
                    {rarity && (
                        <PropertyRow
                            label="Rarity"
                            value={rarity.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}
                            valueColor={RARITY_COLORS[rarity]}
                        />
                    )}
                    {sys?.range?.value && (
                        <PropertyRow
                            label="Range"
                            value={sys.range.long
                                ? `${sys.range.value}/${sys.range.long} ${sys.range.units ?? 'ft.'}`
                                : `${sys.range.value} ${sys.range.units ?? 'ft.'}`}
                        />
                    )}
                    {Array.isArray(sys?.damage?.parts) && sys.damage.parts.length > 0 && (
                        <PropertyRow
                            label="Damage"
                            value={sys.damage.parts.map((p: unknown[]) => p?.[0]).filter(Boolean).join(' + ')}
                        />
                    )}
                    {sys?.source?.book && (
                        <PropertyRow label="Source" value={String(sys.source.book)} />
                    )}
                </div>
            </div>

            {/* Description */}
            {description && (
                <div style={{ marginTop: 'var(--space-md)' }}>
                    <SectionLabel>Description</SectionLabel>
                    <div
                        className="dnd5e-item-description"
                        style={{
                            padding: 'var(--space-sm) var(--space-md)',
                            background: 'var(--surface-elevated)',
                            border: '1px solid var(--theme-border)',
                            borderRadius: 'var(--block-radius)',
                            fontSize: '12px',
                            lineHeight: 1.5,
                            color: 'var(--text-primary)',
                            maxHeight: '240px',
                            overflowY: 'auto',
                        }}
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                </div>
            )}

            {/* Equip / attune toggles */}
            {(item.type === 'weapon' || item.type === 'equipment' || canAttune) && (
                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                    {(item.type === 'weapon' || item.type === 'equipment') && (
                        <ToggleButton
                            label={liveEquipped ? 'Equipped' : 'Equip'}
                            active={liveEquipped}
                            disabled={!canApply}
                            onClick={() => writeField('system.equipped', !liveEquipped)}
                        />
                    )}
                    {canAttune && (
                        <ToggleButton
                            label={liveAttuned ? 'Attuned' : 'Attune'}
                            active={liveAttuned}
                            disabled={!canApply}
                            onClick={() => writeField('system.attuned', !liveAttuned)}
                        />
                    )}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
                <button type="button" onClick={onClose} style={cancelButtonStyle}>Close</button>
            </div>
        </BaseModal>
    );
}

function PropertyRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
    return (
        <>
            <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                alignSelf: 'baseline',
            }}>
                {label}
            </span>
            <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: valueColor ?? 'var(--text-primary)',
            }}>
                {value}
            </span>
        </>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            fontSize: '9px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.1em',
            marginBottom: '4px',
        }}>
            {children}
        </div>
    );
}

function ToggleButton({ label, active, disabled, onClick }: {
    label: string;
    active: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                background: active ? 'var(--theme-glow)' : 'var(--surface-elevated)',
                color: active ? 'var(--theme-primary)' : 'var(--text-secondary)',
                border: active ? '1px solid var(--theme-primary)' : '1px solid var(--theme-border)',
                borderRadius: 'var(--block-radius)',
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.4 : 1,
            }}
        >
            {label}
        </button>
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
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--theme-primary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    textAlign: 'center',
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
