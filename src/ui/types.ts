/**
 * Row shapes consumed by item-driven blocks.
 *
 * "Tabs slice, blocks render" — tabs filter `FoundryItem[]` against the active
 * `FilterBar` selection, convert the slice to these rows via helpers in
 * `itemRows.ts`, and pass the result to the corresponding block. Blocks stay
 * generic and reusable across StandardView and mobile tabs.
 */

export type ActionCategory =
    | 'attack'
    | 'action'
    | 'bonus'
    | 'reaction'
    | 'other'
    | 'limited';

export interface ActionRow {
    /** Stable identifier — typically the FoundryItem._id. Used as React key. */
    key: string;
    name: string;
    category: ActionCategory;
    /** Display string (e.g. "+5") for attack roll. */
    attackBonus?: string;
    /** Display string (e.g. "1d8+3 slashing"). */
    damage?: string;
    /** Display string (e.g. "5 ft." or "30/120 ft."). */
    range?: string;
    /** Display string for save DC (e.g. "DC 15 DEX"). */
    save?: string;
    /** Uses remaining / max, when limited. */
    uses?: { value: number; max: number };
}

export interface SpellRow {
    key: string;
    name: string;
    /** 0 = cantrip, 1–9 = spell level. */
    level: number;
    school?: string;
    concentration?: boolean;
    ritual?: boolean;
    prepared?: boolean;
    castTime?: string;
    range?: string;
}

export type InventoryCategory =
    | 'weapon'
    | 'consumable'
    | 'loot'
    | 'tool'
    | 'equipment'
    | 'container'
    | 'backpack'
    | 'other';

export const INVENTORY_FOUNDRY_TYPE_FILTERS_MAP: Record<string, string> = {
    "weapon": 'EQUIPMENT',
    "equipment": "EQUIPMENT",
    "consumable": "EQUIPMENT",
    "tool": "EQUIPMENT",
    "loot": "EQUIPMENT",
    "container": "BOX",
    "backpack": "BACKPACK"
};

export interface InventoryRow {
    key: string;
    name: string;
    category: InventoryCategory;
    quantity?: number;
    weight?: number;
    equipped?: boolean;
    attuned?: boolean;
}

export type FeatureSource = 'class' | 'subclass' | 'species' | 'feat' | 'background';

export interface FeatureRow {
    key: string;
    name: string;
    source: FeatureSource;
    /** Source label, e.g. "Paladin 5" or "Variant Human". */
    sourceLabel?: string;
    description?: string;
}
