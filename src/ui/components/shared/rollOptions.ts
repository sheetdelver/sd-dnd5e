/**
 * Roll-modal dropdown option lists.
 * Mirrors `DND5E.attackModes` and the ability list from the original Foundry
 * dnd5e module.
 */

export const ATTACK_MODE_OPTIONS = [
    { value: 'oneHanded',       label: 'One-Handed' },
    { value: 'twoHanded',       label: 'Two-Handed' },
    { value: 'offhand',         label: 'Off-Hand' },
    { value: 'ranged',          label: 'Ranged' },
    { value: 'thrown',          label: 'Thrown' },
    { value: 'thrown-offhand',  label: 'Thrown (Off-Hand)' },
];

/** Default attack mode for melee weapons. */
export const DEFAULT_ATTACK_MODE = 'oneHanded';
