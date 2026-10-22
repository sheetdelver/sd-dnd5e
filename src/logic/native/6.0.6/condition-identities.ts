import {CONDITION_LABELS_606} from './defense-identities';
/** Literal IDs recognized by pinned conditionEffects. These labels present stored
 * IDs; they do not construct presets or resolve content/grants. */
export const FAMILY_CONDITION_IDS_606=['restrained','grappled','paralyzed','incapacitated','invisible','surprised','prone','dodging'] as const;
export type FamilyCondition606=typeof FAMILY_CONDITION_IDS_606[number];
export type QualifiedCondition606='poisoned'|'exhaustion'|FamilyCondition606;
export const CONDITION_STATUS_LABELS_606:Readonly<Record<string,string>>={...CONDITION_LABELS_606,dodging:'Dodging',dead:'Dead'};
