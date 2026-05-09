/**
 * Title-case ability names — used in modal titles and dropdowns.
 *
 * The block-level uppercase labels (`ABILITY_LABEL` in `blocks/Abilities.tsx`)
 * are visual styling for the ability cards; for prose contexts like
 * "Strength Check" we want title-case here.
 */
export const ABILITY_FULL_NAME: Record<string, string> = {
    str: 'Strength',
    dex: 'Dexterity',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Wisdom',
    cha: 'Charisma',
};

export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

/** Ordered options array suitable for `<select>` and `RollModal.configFields`. */
export const ABILITY_OPTIONS = ABILITY_KEYS.map(k => ({
    value: k,
    label: ABILITY_FULL_NAME[k],
}));
