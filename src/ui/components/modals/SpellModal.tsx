'use client';

import React from 'react';
import { resolveImage,processHtmlContent } from '@sheet-delver/sdk';
import {ownedItemProjection} from '../../../logic/preparation/item-facts';
import BaseModal from '../shared/BaseModal';
import { useModal } from '../shared/useModal';
import { useSheet } from '../shared/SheetContext';
import { SPELL_FILTERS } from '../shared/filters';

/**
 * SpellModal — spell detail viewer with a Cast button.
 *
 * Layout:
 *   [×]
 *   Title (spell name)               Level + School badge
 *   ┌─────┐
 *   │ img │   Casting time | Range | Components | Duration
 *   └─────┘
 *   Description (HTML-rendered)
 *   Concentration / Ritual flags
 *   [Cast]  [Close]
 *
 * "Cast" closes this modal and opens RollModal pre-filled for the spell.
 */

interface FoundryItemLike {
    _id: string;
    name: string;
    type: string;
    img?: string | null;
    system?: Record<string, any>;
}

export interface SpellModalProps {
    item: FoundryItemLike;
    /** Roll handler forwarded from the parent block. */
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
    onClose: () => void;
}

const SCHOOL_LABEL: Record<string, string> = {
    abj: 'Abjuration',
    con: 'Conjuration',
    div: 'Divination',
    enc: 'Enchantment',
    evo: 'Evocation',
    ill: 'Illusion',
    nec: 'Necromancy',
    trs: 'Transmutation',
};

export default function SpellModal({ item, onRoll, onClose }: SpellModalProps) {
    const { foundryUrl, actor } = useSheet();
    const { openModal } = useModal();
    const liveItem=(actor?.items??[]).find((i:{_id:string})=>i._id===item._id);
    const sys = (liveItem?.system ?? {}) as Record<string, any>;
    const legacy=actor?.derived?.lifecycle?.status==='supported'&&actor?.derived?.lifecycle?.profile==='legacy-limited';
    const preparedItem=ownedItemProjection(actor?.derived).items[item._id];
    const prepared=preparedItem?.spell;
    const img = resolveImage(liveItem?.img ?? '', foundryUrl);
    const description = typeof sys.description?.value==='string'?processHtmlContent(sys.description.value,foundryUrl):'';
    const level=legacy?(typeof sys.level==='number'?sys.level:0):prepared?.value?.level??null;
    const levelLabel=level===null?'Level unavailable':level===0?'Cantrip':SPELL_FILTERS[level+1]??`Level ${level}`;
    const schoolKey=legacy?sys.school:prepared?.value?.school;
    const school=typeof schoolKey==='string'?(SCHOOL_LABEL[schoolKey]??schoolKey):undefined;
    const isConcentration=legacy?Boolean(sys.components?.concentration??sys.properties?.concentration):prepared?.value?.concentration;
    const isRitual=legacy?Boolean(sys.components?.ritual??sys.properties?.ritual):prepared?.value?.ritual;
    const castTime=typeof sys.activation?.type==='string'?sys.activation.type:undefined;
    const range=typeof sys.range?.value==='number'&&typeof sys.range?.units==='string'?`${sys.range.value} ${sys.range.units}`:['self','touch'].includes(sys.range?.units)?sys.range.units:undefined;
    const components=legacy?['vocal','somatic','material'].filter(key=>sys.components?.[key]).map(key=>key[0].toUpperCase()):prepared?.value?.components??[];
    const duration = sys?.duration?.value && sys?.duration?.units
        ? `${sys.duration.value} ${sys.duration.units}`
        : (sys?.duration?.units === 'inst' ? 'Instantaneous' : undefined);

    if(!liveItem)return <BaseModal open onClose={onClose}><p role="status">Spell no longer available</p><button onClick={onClose}>Close</button></BaseModal>;
    const handleCast = () => {
        if(!legacy)return;
        onClose();
        if (!onRoll) return;
        openModal('roll', {
            rollType: 'item',
            rollKey: item._id,
            label: 'Spell Roll',
            subtitle: `${item.name}${actor?.name ? ` — ${actor.name}` : ''}`,
            onConfirm: (opts: Record<string, unknown>) => onRoll('item', item._id, opts),
        });
    };

    return (
        <BaseModal open onClose={onClose} maxWidth={520}>
            <button type="button" aria-label="Close" onClick={onClose} style={closeButtonStyle}>×</button>

            <h2 style={titleStyle}>{liveItem.name}</h2>
            <div style={subtitleStyle}>
                {levelLabel}{school ? ` · ${school}` : ''}
            </div>

            {/* Top row: image + casting metadata */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                <div style={{
                    width: '72px',
                    height: '72px',
                    flexShrink: 0,
                    borderRadius: 'var(--block-radius)',
                    border: '1px solid var(--theme-border)',
                    overflow: 'hidden',
                    background: 'var(--surface-elevated)',
                }}>
                    {img && (
                        <img src={img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    {castTime && <PropertyRow label="Casting" value={castTime} />}
                    {range && <PropertyRow label="Range" value={range} />}
                    {components.length > 0 && <PropertyRow label="Components" value={components.join(', ')} />}
                    {duration && <PropertyRow label="Duration" value={duration} />}
                </div>
            </div>

            {!legacy&&preparedItem?.proficiency&&<p aria-label="Prepared spell Item proficiency" title={preparedItem.proficiency.reason}>{preparedItem.proficiency.status==='ready'?preparedItem.proficiency.term:'Unavailable'}</p>}
            {/* Concentration / Ritual flags */}
            {(isConcentration || isRitual) && (
                <div style={{ display: 'flex', gap: '6px', marginTop: 'var(--space-sm)' }}>
                    {isConcentration && <Flag>Concentration</Flag>}
                    {isRitual && <Flag>Ritual</Flag>}
                </div>
            )}

            {/* Description */}
            {description && (
                <div style={{ marginTop: 'var(--space-md)' }}>
                    <SectionLabel>Description</SectionLabel>
                    <div
                        className="dnd5e-spell-description"
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

            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
                <button type="button" onClick={onClose} style={cancelButtonStyle}>Close</button>
                <button type="button" onClick={handleCast} style={confirmButtonStyle} disabled={!onRoll||!legacy} title={legacy?undefined:'Casting requires the reviewed spellcasting command workflow'}>
                    Cast
                </button>
            </div>
        </BaseModal>
    );
}

function PropertyRow({ label, value }: { label: string; value: string }) {
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
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
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

function Flag({ children }: { children: React.ReactNode }) {
    return (
        <span style={{
            fontSize: '9px',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            padding: '2px 8px',
            border: '1px solid var(--theme-primary)',
            color: 'var(--theme-primary)',
            background: 'var(--theme-glow)',
            borderRadius: '999px',
        }}>
            {children}
        </span>
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
