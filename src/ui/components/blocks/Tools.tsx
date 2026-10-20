'use client';
import React from 'react';
import type { PreparedTool } from '../../../logic/preparation/tools';
import { useSheet } from '../shared/SheetContext';
import { useModal } from '../shared/useModal';
import { usePreparedRollIntent } from '../shared/usePreparedRollIntent';
import { ABILITY_FULL_NAME } from '../shared/abilityNames';

export default function Tools({ onRoll }: {onRoll?: (type:string,key:string,options?:Record<string,unknown>)=>Promise<void>}) {
    const {actor} = useSheet(), {openModal} = useModal();
    const {canRoll,review} = usePreparedRollIntent('tool',onRoll);
    const tools = (actor?.derived.tools ?? {}) as Record<string,PreparedTool>;
    const preparation = actor?.derived.toolPreparation as {reason?:string} | undefined;
    return <section className="block-card" aria-label="Tool checks">
        <h3>Tool checks</h3>
        <p style={{fontSize:'11px'}}>Choose a skill or ability in the roll dialog. Shift-click uses the independent default.</p>
        {preparation?.reason && <p role="status">{preparation.reason}</p>}
        {!preparation?.reason && !Object.keys(tools).length && <p>No tool checks in actor source.</p>}
        {Object.values(tools).map(tool => <div key={tool.key} style={{marginBottom:'8px'}}>
            <button type="button" aria-label={`${tool.label} Tool Check`} disabled={!canRoll(tool.key)}
                title={`${tool.provenance}; identity: ${tool.key}${tool.unavailableReason ? `; ${tool.unavailableReason}` : ''}`}
                style={{width:'100%',textAlign:'left'}}
                onClick={event => {
                    const intent = review(tool.key); if (!intent) return;
                    if (event.shiftKey) {void intent.onConfirm(); return;}
                    openModal('roll',{rollType:'tool',rollKey:tool.key,label:`${ABILITY_FULL_NAME[tool.ability] ?? tool.ability} (${tool.label}) Check`,subtitle:actor?.name,formula:tool.formula,...intent});
                }}>
                <span>{tool.label}</span>{' '}<small>{tool.ability.toUpperCase()} · Proficiency {tool.prof === null ? '—' : `${tool.prof}×`}</small>{' '}
                <strong>{tool.total === null ? '—' : `${tool.total < 0 ? '' : '+'}${tool.total}`}</strong>
            </button>
            {tool.unavailableReason && <small style={{display:'block'}}>{tool.unavailableReason}</small>}
        </div>)}
    </section>;
}
