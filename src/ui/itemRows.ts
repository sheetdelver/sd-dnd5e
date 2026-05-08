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

export function toActionRows(items: FoundryItem[]): ActionRow[] {
    return items.map(item => {
        const sys = item.system as Record<string, any>;
        const uses = sys?.uses;
        const hasLimitedUses = typeof uses?.max === 'number' && uses.max > 0;
        const baseCategory = getActionCategory(item);
        const category: ActionCategory = hasLimitedUses ? 'limited' : baseCategory;

        const attackBonus = typeof sys?.attackBonus === 'number'
            ? formatBonus(sys.attackBonus)
            : undefined;
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

        return {
            key: item._id,
            name: item.name,
            category,
            attackBonus,
            damage,
            range,
            save,
            uses: hasLimitedUses ? { value: uses.value ?? 0, max: uses.max } : undefined,
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

function getInventoryCategory(item: FoundryItem): InventoryCategory {
    const sys = item.system as Record<string, any>;
    if (sys?.attuned || sys?.attunement === 2) return 'attunement';
    if (item.type === 'equipment' || sys?.equipped) return 'equipment';
    if (item.type === 'consumable') return 'pouch';
    if (sys?.container) return 'backpack';
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
