import { useEffect, useRef } from 'react';
import { useSheet } from './SheetContext';
import { preparedRollAvailable, preparedRollReviewable, preparedRollFormula, configuredRollCheck, rollIntentSignature, type PreparedRollKind } from './skillIntent';
import type { SkillToolModel } from '../../../logic/preparation/skill-tool';
import { ABILITY_FULL_NAME } from './abilityNames';

/** One identity/retirement controller for source-prepared skill/check/save UI. */
export function usePreparedRollIntent(kind: PreparedRollKind, onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>) {
    const { actor } = useSheet(), signature = rollIntentSignature(actor, kind);
    const latest = useRef({ signature, token: {}, actor, onRoll, alive: true });
    latest.current = { signature, token: latest.current.signature === signature ? latest.current.token : {}, actor, onRoll, alive: latest.current.alive };
    useEffect(() => { latest.current.alive = true; return () => { latest.current.alive = false; latest.current.token = {}; }; }, []);
    const canRoll = (key: string) => Boolean(onRoll && preparedRollReviewable(actor, kind, key));
    function review(key: string) {
        if (!canRoll(key)) return null;
        const reviewed = latest.current;
        // Selected legacy behavior retains its separate, unqualified options.
        const resolveFormula = actor?.derived.lifecycle?.profile === '2024'
            ? (options: Record<string, unknown>) => preparedRollFormula(reviewed.actor,kind,key,options) : undefined;
        const model=actor?.derived.checkConfiguration as SkillToolModel|undefined;
        const configFields=resolveFormula && model && (kind==='skill'||kind==='tool') ? [
            {key:kind==='skill'?'tool':'skill',label:kind==='skill'?'Combine with tool':'Combine with skill',initialValue:'',options:[
                {value:'',label:'None (independent check)'},...Object.entries(kind==='skill'?model.tools:model.skills).map(([value,entry])=>({value,label:entry.reason?`${entry.label} (Unavailable: ${entry.reason})`:entry.label,disabled:!!entry.reason})),
            ]},
            {key:'ability',label:'Check ability',initialValue:'',options:[
                {value:'',label:'Default ability'},...Object.entries(model.abilities).map(([value,entry])=>({value,label:(ABILITY_FULL_NAME[value]??value)+(entry.score===null||entry.reason?' (source unavailable)':''),disabled:entry.score===null||!!entry.reason})),
            ]},
        ] : undefined;
        return { preparedIntentSignature: signature, resolveFormula, configFields,quickAvailable:preparedRollAvailable(actor,kind,key),
            resolveCheck:resolveFormula ? (options:Record<string,unknown>)=>configuredRollCheck(reviewed.actor,kind,key,options) : undefined,
            preparedDefaultMode: configuredRollCheck(actor, kind, key)?.sourceMode ?? 0, onConfirm: async (options?: Record<string, unknown>) => {
            const current = latest.current;
            if (!current.alive || current.token !== reviewed.token || !current.onRoll || !preparedRollReviewable(current.actor, kind, key)) throw new Error('Roll intent changed; review current values');
            if (resolveFormula && !resolveFormula(options ?? {})) throw new Error('Roll options require Q00 qualification');
            await current.onRoll(kind, key, options);
        } };
    }
    return { canRoll, review };
}
