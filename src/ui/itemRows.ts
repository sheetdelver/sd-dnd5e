import type { FoundryItem } from '@sheet-delver/sdk';
import type {
    ActionRow,
    ActionCategory,
    SpellRow,
    InventoryRow,
    InventoryCategory,
    FeatureRow,
    FeatureSource,
} from './types';

/**
 * Convert dnd5e FoundryItems into UI row shapes consumed by item-driven blocks.
 * Best-effort extraction — fields default gracefully when system data is sparse.
 */

const formatBonus = (n: number): string => (n >= 0 ? `+${n}` : `${n}`);

function getActionCategory(item: FoundryItem): ActionCategory {
    const sys = item.system as Record<string, any>;
    const activation = sys?.activation?.type ?? sys?.actionType;
    if (item.type === 'weapon') return 'attack';
    switch (activation) {
        case 'action': return 'action';
        case 'bonus': return 'bonus';
        case 'reaction': return 'reaction';
        case 'special':
        case 'minute':
        case 'hour':
        case 'day':
            return 'other';
        default:
            return 'action';
    }
}

/**
 * Derived data needed to compute realistic attack-roll bonuses for weapons.
 * If omitted, only the magic `system.attackBonus` (when present) is shown.
 */
export interface ActionRowsContext {
    abilities?: Record<string, { mod: number }>;
    profBonus?: number;
}

/** Foundry dnd5e `CONFIG.DND5E.weaponTypeMap` — weapon class → attack type. */
const WEAPON_TYPE_MAP: Record<string, 'melee' | 'ranged'> = {
    simpleM: 'melee',
    simpleR: 'ranged',
    martialM: 'melee',
    martialR: 'ranged',
    siege: 'ranged',
};

/** Read an item's `system.properties` as a string set, regardless of whether
 *  the system stores it as an array or an object of booleans. */
function getProps(sys: Record<string, any>): Set<string> {
    const raw = sys?.properties;
    if (Array.isArray(raw)) return new Set(raw.map(String));
    if (raw && typeof raw === 'object') {
        return new Set(Object.keys(raw).filter(k => Boolean(raw[k])));
    }
    return new Set();
}

/**
 * Pick the ability key used for a weapon attack. Honors an explicit
 * `system.ability`; otherwise falls back to a property-based heuristic
 * (finesse → higher of STR/DEX; ranged/thrown → DEX; else STR).
 */
function pickAttackAbility(item: FoundryItem, abilities?: Record<string, { mod: number }>): string {
    const sys = item.system as Record<string, any>;
    if (sys?.ability) return String(sys.ability);
    const props = getProps(sys);
    const isFinesse = props.has('fin') || props.has('finesse');
    const weaponType = sys?.type?.value;
    const attackType = (weaponType && WEAPON_TYPE_MAP[weaponType])
        ?? (sys?.actionType === 'rwak' ? 'ranged' : null);
    if (isFinesse) {
        const str = abilities?.str?.mod ?? 0;
        const dex = abilities?.dex?.mod ?? 0;
        return dex >= str ? 'dex' : 'str';
    }
    return attackType === 'ranged' ? 'dex' : 'str';
}

/**
 * Compute the valid attack modes for a weapon, mirroring Foundry's
 * `weapon.mjs#attackModes` getter. Returns the option values used by
 * `ATTACK_MODE_OPTIONS`; non-weapons return an empty array.
 */
function getWeaponAttackModes(item: FoundryItem): string[] {
    if (item.type !== 'weapon') return [];
    const sys = item.system as Record<string, any>;
    const props = getProps(sys);
    const weaponType = sys?.type?.value;
    const attackType = weaponType ? WEAPON_TYPE_MAP[weaponType] ?? null : null;
    const isVersatile = props.has('ver') || Boolean(sys?.damage?.versatile);
    const isThrown = props.has('thr');
    const isLight = props.has('lgt');

    const modes: string[] = [];

    // Thrown ranged weapons (dart, etc.) skip the one/two-handed pair —
    // they only get the "Thrown" mode below.
    const isThrownRanged = isThrown && attackType === 'ranged';
    if (!isThrownRanged) {
        if (isVersatile || !props.has('two')) modes.push('oneHanded');
        if (isVersatile || props.has('two')) modes.push('twoHanded');
    }

    if (isLight) modes.push('offhand');

    if (isThrown) {
        modes.push('thrown');
        if (isLight) modes.push('thrown-offhand');
    } else if (!attackType && ((sys?.range?.value ?? 0) > (sys?.range?.reach ?? 0))) {
        // Untyped weapon with explicit range > reach (rare edge case).
        modes.push('ranged');
    }

    return modes;
}

function computeAttackBonus(item: FoundryItem, ctx?: ActionRowsContext): string | undefined {
    if (item.type !== 'weapon') return undefined;
    const sys = item.system as Record<string, any>;

    const abilityKey = pickAttackAbility(item, ctx?.abilities);
    const abilityMod = ctx?.abilities?.[abilityKey]?.mod ?? 0;

    // Magic / item-level bonus — sometimes a number, sometimes a parsed string.
    const magicRaw = sys?.attackBonus;
    let magicBonus = 0;
    if (typeof magicRaw === 'number') magicBonus = magicRaw;
    else if (typeof magicRaw === 'string') {
        const n = parseInt(magicRaw, 10);
        if (Number.isFinite(n)) magicBonus = n;
    }

    // Proficiency: assume proficient unless explicitly false.
    const isProf = sys?.proficient !== false;
    const profPart = isProf ? (ctx?.profBonus ?? 0) : 0;

    const total = abilityMod + magicBonus + profPart;
    return formatBonus(total);
}

export function toActionRows(items: FoundryItem[], ctx?: ActionRowsContext): ActionRow[] {
    return items.map(item => {
        const sys = item.system as Record<string, any>;
        const uses = sys?.uses;
        const hasLimitedUses = typeof uses?.max === 'number' && uses.max > 0;
        // Category reflects how the item is *categorized*, not its limit state.
        // Limited-use items still show under their natural category (e.g. an
        // attack stays an attack); the LIMITED USE filter narrows by `uses`.
        const category = getActionCategory(item);

        const attackBonus = item.type === 'weapon'
            ? computeAttackBonus(item, ctx)
            : (typeof sys?.attackBonus === 'number' ? formatBonus(sys.attackBonus) : undefined);
        const damageParts: string[] = (sys?.damage?.parts ?? [])
            .map((p: unknown[]) => p?.[0])
            .filter(Boolean) as string[];
        const damage = damageParts.length > 0 ? damageParts.join(' + ') : undefined;
        const rangeVal = sys?.range?.value;
        const rangeLong = sys?.range?.long;
        const rangeUnits = sys?.range?.units ?? 'ft.';
        const range = rangeVal
            ? rangeLong ? `${rangeVal}/${rangeLong} ${rangeUnits}` : `${rangeVal} ${rangeUnits}`
            : undefined;
        const save = sys?.save?.dc && sys?.save?.ability
            ? `DC ${sys.save.dc} ${String(sys.save.ability).toUpperCase()}`
            : undefined;

        const attackModes = item.type === 'weapon' ? getWeaponAttackModes(item) : undefined;

        return {
            key: item._id,
            name: item.name,
            category,
            attackBonus,
            damage,
            range,
            save,
            uses: hasLimitedUses ? { value: uses.value ?? 0, max: uses.max } : undefined,
            attackModes: attackModes && attackModes.length > 0 ? attackModes : undefined,
        };
    });
}

export function toSpellRows(items: FoundryItem[]): SpellRow[] {
    return items.map(item => {
        const sys = item.system as Record<string, any>;
        return {
            key: item._id,
            name: item.name,
            level: typeof sys?.level === 'number' ? sys.level : 0,
            school: sys?.school,
            concentration: Boolean(sys?.components?.concentration ?? sys?.properties?.concentration),
            ritual: Boolean(sys?.components?.ritual ?? sys?.properties?.ritual),
            prepared: Boolean(sys?.preparation?.prepared),
            castTime: sys?.activation?.type,
            range: sys?.range?.value
                ? `${sys.range.value} ${sys.range.units ?? 'ft.'}`
                : undefined,
        };
    });
}

const VALID_INVENTORY_TYPES: ReadonlySet<string> = new Set([
    'weapon', 'consumable', 'loot', 'tool', 'equipment', 'container', 'backpack',
]);

function getInventoryCategory(item: FoundryItem): InventoryCategory {
    if (VALID_INVENTORY_TYPES.has(item.type)) return item.type as InventoryCategory;
    return 'other';
}

export function toInventoryRows(items: FoundryItem[]): InventoryRow[] {
    return items.map(item => {
        const sys = item.system as Record<string, any>;
        return {
            key: item._id,
            name: item.name,
            category: getInventoryCategory(item),
            quantity: typeof sys?.quantity === 'number' ? sys.quantity : undefined,
            weight: typeof sys?.weight === 'number' ? sys.weight : undefined,
            equipped: Boolean(sys?.equipped),
            attuned: Boolean(sys?.attuned),
        };
    });
}

function getFeatureSource(item: FoundryItem): FeatureSource {
    const sys = item.system as Record<string, any>;
    if (item.type === 'class') return 'class';
    if (item.type === 'subclass') return 'subclass';
    if (item.type === 'race') return 'species';
    if (item.type === 'background') return 'background';
    if (item.type === 'feat') {
        const subtype = sys?.type?.value;
        if (subtype === 'class' || subtype === 'subclass') return 'class';
        if (subtype === 'race') return 'species';
        return 'feat';
    }
    return 'feat';
}

export function toFeatureRows(items: FoundryItem[]): FeatureRow[] {
    return items.map(item => {
        const sys = item.system as Record<string, any>;
        const source = getFeatureSource(item);
        let sourceLabel: string | undefined;
        if (source === 'class' && typeof sys?.levels === 'number') {
            sourceLabel = `${item.name} ${sys.levels}`;
        }
        const description = typeof sys?.description?.value === 'string'
            ? sys.description.value.replace(/<[^>]+>/g, '').trim().slice(0, 240)
            : undefined;
        return {
            key: item._id,
            name: item.name,
            source,
            sourceLabel,
            description,
        };
    });
}
