import {initiativeRoll} from '../../../logic/preparation/defenses';
import { record } from '../../../logic/native/6.0.6/source';
import type { PreparedNumericD20 } from '../../../logic/preparation/d20-configuration';
import { numericD20Roll } from '../../../logic/preparation/d20-configuration';
import { configureSkillToolCheck, skillToolRoll, type SkillToolModel } from '../../../logic/preparation/skill-tool';

/** Consumer intent identity only; no rule calculation and no source cache. */
export type PreparedRollKind = 'skill' | 'ability' | 'save' | 'tool'|'initiative';
export function rollIntentSignature(actor: unknown, kind: PreparedRollKind): string | null {
    const value = record(actor), derived = record(value?.derived), lifecycle = record(derived?.lifecycle);
    if (lifecycle?.status !== 'supported' || !['2024', 'legacy-limited'].includes(String(lifecycle.profile))) return null;
    return JSON.stringify({ actor: value?.uuid??value?._id ?? value?.id, identity: lifecycle.identity,
        sourceRevision: lifecycle.sourceRevision, worldEpoch: lifecycle.worldEpoch,
        profile: lifecycle.profile, kind, effects:derived?.effectPreparation, configuration: kind === 'skill' || kind === 'tool' ? derived?.checkConfiguration : undefined,
        checks:kind==='initiative'?derived?.initiativeCheck:kind === 'skill' ? derived?.skills : kind === 'tool' ? derived?.tools : derived?.abilities });
}
export function configuredRollCheck(actor: unknown, kind: PreparedRollKind, key: string, options:Record<string,unknown>={}): PreparedNumericD20 | undefined {
    if (!rollIntentSignature(actor, kind)) return undefined;
    const derived = record(record(actor)?.derived);
    if(kind==='initiative')return key==='initiative'&&record(derived?.lifecycle)?.profile==='2024'?derived?.initiativeCheck as PreparedNumericD20|undefined:undefined;
    if ((kind === 'skill' || kind === 'tool') && record(derived?.lifecycle)?.profile === '2024') {
        const model=derived?.checkConfiguration as SkillToolModel|undefined;
        return model ? configureSkillToolCheck(model,kind,key,options) : undefined;
    }
    const row = kind === 'skill' ? record(record(derived?.skills)?.[key]) : kind === 'tool' ? record(record(derived?.tools)?.[key]) : record(record(derived?.abilities)?.[key]);
    const check = kind === 'skill' || kind === 'tool' ? row : record(row?.[kind === 'ability' ? 'check' : 'saveRoll']);
    return check as unknown as PreparedNumericD20 | undefined;
}
export function preparedRollCheck(actor:unknown,kind:PreparedRollKind,key:string,options:Record<string,unknown>={}):PreparedNumericD20|undefined {
    const check=configuredRollCheck(actor,kind,key,options);
    return check && typeof check.total==='number' && typeof check.formula==='string' && !check.unavailableReason ? check : undefined;
}
export function preparedRollFormula(actor:unknown,kind:PreparedRollKind,key:string,options:Record<string,unknown>={}):string|null {
    if (!rollIntentSignature(actor,kind)) return null;
    const derived=record(record(actor)?.derived);
    if(kind==='initiative')return key==='initiative'?initiativeRoll(derived?.initiativeCheck as PreparedNumericD20|undefined,options):null;
    if ((kind==='skill'||kind==='tool')&&record(derived?.lifecycle)?.profile==='2024') {
        return derived?.checkConfiguration ? skillToolRoll(derived.checkConfiguration as SkillToolModel,kind,key,options) : null;
    }
    return numericD20Roll(preparedRollCheck(actor,kind,key),options);
}
export function preparedRollAvailable(actor: unknown, kind: PreparedRollKind, key: string): boolean {
    return Boolean(preparedRollCheck(actor, kind, key));
}
