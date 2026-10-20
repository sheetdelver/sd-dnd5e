import { useEffect, useRef } from 'react';
import { useSheet } from './SheetContext';
import { preparedRollAvailable, preparedRollCheck, rollIntentSignature, type PreparedRollKind } from './skillIntent';
import { numericD20Roll } from '../../../logic/preparation/d20-configuration';

/** One identity/retirement controller for source-prepared skill/check/save UI. */
export function usePreparedRollIntent(kind: PreparedRollKind, onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>) {
    const { actor } = useSheet(), signature = rollIntentSignature(actor, kind);
    const latest = useRef({ signature, token: {}, actor, onRoll, alive: true });
    latest.current = { signature, token: latest.current.signature === signature ? latest.current.token : {}, actor, onRoll, alive: latest.current.alive };
    useEffect(() => { latest.current.alive = true; return () => { latest.current.alive = false; latest.current.token = {}; }; }, []);
    const canRoll = (key: string) => Boolean(onRoll && preparedRollAvailable(actor, kind, key));
    function review(key: string) {
        if (!canRoll(key)) return null;
        const reviewed = latest.current;
        // Selected legacy behavior retains its separate, unqualified options.
        const resolveFormula = actor?.derived.lifecycle?.profile === '2024'
            ? (options: Record<string, unknown>) => numericD20Roll(preparedRollCheck(reviewed.actor, kind, key), options) : undefined;
        return { preparedIntentSignature: signature, resolveFormula, preparedDefaultMode: preparedRollCheck(actor, kind, key)?.sourceMode ?? 0, onConfirm: async (options?: Record<string, unknown>) => {
            const current = latest.current;
            if (!current.alive || current.token !== reviewed.token || !current.onRoll || !preparedRollAvailable(current.actor, kind, key)) throw new Error('Roll intent changed; review current values');
            if (resolveFormula && !resolveFormula(options ?? {})) throw new Error('Roll options require Q00 qualification');
            await current.onRoll(kind, key, options);
        } };
    }
    return { canRoll, review };
}
