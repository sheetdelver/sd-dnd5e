'use client';
import {ATTACK_MODE_OPTIONS} from '../shared/rollOptions';

import React from 'react';
import { resolveImage,processHtmlContent } from '@sheet-delver/sdk';
import {ownedItemProjection} from '../../../logic/preparation/item-facts';
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
    const liveItem = (actor?.items ?? []).find((i: { _id: string }) => i._id === item._id);
    const sys = (liveItem?.system ?? {}) as Record<string, any>;
    const prepared=ownedItemProjection(actor?.derived).items[item._id];
    const legacy=actor?.derived?.lifecycle?.profile==='legacy-limited'&&actor?.derived?.lifecycle?.status==='supported';
    const img = resolveImage(liveItem?.img ?? '', foundryUrl);
    const description = typeof sys?.description?.value === 'string' ? processHtmlContent(sys.description.value,foundryUrl) : '';
    const rarity = typeof sys?.rarity === 'string' ? sys.rarity : undefined;
    const liveEquipped = legacy?Boolean(sys?.equipped):prepared?.equipped.value===true;
    const liveAttuned = legacy?Boolean(sys?.attuned):prepared?.attuned.value===true;
    const canAttune = legacy?(sys?.attunement===1||sys?.attunement===2||sys?.requiresAttunement):prepared?.attunement?.value==='required'||prepared?.attunement?.value==='optional';
    const canApply = legacy&&Boolean(onUpdate)&&Boolean(liveItem);
    if(!liveItem)return <BaseModal open onClose={onClose}><p role="status">Item no longer available</p><button onClick={onClose}>Close</button></BaseModal>;
    const writeField = async (path: string, value: unknown) => {
        if (!onUpdate) return;
        await onUpdate(`items.${item._id}.${path}`, value).catch(() => {});
    };

    return (
        <BaseModal open onClose={onClose} maxWidth={520}>
            <button type="button" aria-label="Close" onClick={onClose} style={closeButtonStyle}>×</button>

            <h2 style={titleStyle}>{liveItem.name}</h2>
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
                    {legacy&&typeof sys.quantity==='number'?<PropertyRow label="Quantity" value={String(sys.quantity)}/>:<PropertyRow label="Quantity" value={prepared?.quantity.status==='not-applicable'?'Not applicable':prepared?.quantity.value==null?'Unavailable':String(prepared.quantity.value)}/>}
                    {!legacy&&<PropertyRow label="Weight" value={prepared?.weight.value?`${prepared.weight.value.value} ${prepared.weight.value.units}`:prepared?.weight.status==='not-applicable'?'Not applicable':'Unavailable'}/>}
                    {!legacy&&prepared?.proficiency&&prepared.proficiency.status!=='not-applicable'&&<PropertyRow label="Item proficiency (prepared)" value={prepared.proficiency.status==='ready'?prepared.proficiency.term??'Unavailable':'Unavailable'}/>}
                    {!legacy&&liveItem.type==='weapon'&&<PropertyRow label="Attack modes" value={prepared?.attackModes.status==='ready'?prepared.attackModes.value?.map(key=>ATTACK_MODE_OPTIONS.find(option=>option.value===key)?.label??key).join(', ')||'None':prepared?.attackModes.reason??'Unavailable'}/>}
                    {!legacy&&prepared?.physical&&<>
                        <PropertyRow label="Total weight" value={prepared.physical.totalWeight.value==null?'Unavailable':`${prepared.physical.totalWeight.value} ${prepared.physical.units}`}/>
                        {liveItem.type==='container'&&<PropertyRow label="Capacity" value={prepared.physical.capacity.value?prepared.physical.capacity.value.max==null?'Unlimited':`${prepared.physical.capacity.value.value}/${prepared.physical.capacity.value.max} ${prepared.physical.capacity.value.units}`:prepared.physical.capacity.reason??'Unavailable'}/>}
                    </>}
                    {!legacy&&<PropertyRow label="Uses" value={prepared?.uses.display??'Unavailable'}/>}
                    {rarity && (
                        <PropertyRow
                            label="Rarity"
                            value={rarity.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}
                            valueColor={RARITY_COLORS[rarity]}
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

            {!legacy&&<p role="status" style={{fontSize:'12px'}}>Equipment changes require the reviewed inventory command workflow.</p>}
            {!legacy&&prepared?.activities.map(activity=><section key={activity.id} aria-label={'Activity '+activity.id}><h3>{activity.name}</h3><p>{activity.type} · Uses: {activity.uses.display}</p>{activity.attack&&<p>Attack: {activity.attack.value?.display??'Unavailable'}</p>}<p>{activity.executionReason}</p></section>)}
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
