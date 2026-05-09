import {
    BaseSystemAdapter,
    resolveImage,
    type FoundryActor,
    type FoundryItem,
    type ActorSheetData,
    type ActorCardData,
    type RollData,
    type RollDataOptions,
} from '@sheet-delver/sdk';

import info from '../../info.json';

// ---------------------------------------------------------------------------
// DnD5e system shape (v3.x) — internal only
// ---------------------------------------------------------------------------

interface D5eAbility {
    value?: number;
    mod?: number;
    // In dnd5e v3.x, save is an object { roll: {...} }, not a pre-computed number
    save?: number | Record<string, unknown>;
    proficient?: number;
    bonuses?: { check?: string; save?: string };
}

interface D5eSkill {
    value?: number;
    total?: number;
    prof?: number;
    ability?: string;
}

interface D5eSystem {
    abilities?: Record<string, D5eAbility>;
    skills?: Record<string, D5eSkill>;
    attributes?: {
        hp?: { value?: number; max?: number; temp?: number };
        ac?: { value?: number };
        init?: { value?: number; mod?: number; bonus?: number };
        prof?: number;
        movement?: { walk?: number; fly?: number; swim?: number; climb?: number; burrow?: number };
        senses?: { darkvision?: number; blindsight?: number; tremorsense?: number; truesight?: number; special?: string };
        inspiration?: boolean;
        spellcasting?: string;
        spelldc?: number;
    };
    details?: {
        level?: number;
        race?: string;
        background?: string;
        alignment?: string;
    };
    currency?: Record<string, number>;
    traits?: { size?: string };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ABILITY_LABELS: Record<string, string> = {
    str: 'Strength', dex: 'Dexterity', con: 'Constitution',
    int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma',
};

export const SKILL_LABELS: Record<string, string> = {
    acr: 'Acrobatics',   ani: 'Animal Handling', arc: 'Arcana',
    ath: 'Athletics',    dec: 'Deception',        his: 'History',
    ins: 'Insight',      itm: 'Intimidation',     inv: 'Investigation',
    med: 'Medicine',     nat: 'Nature',            prc: 'Perception',
    prf: 'Performance',  per: 'Persuasion',        rel: 'Religion',
    slt: 'Sleight of Hand', ste: 'Stealth',        sur: 'Survival',
};

type RaceRecord = {
    name: string;
    img: string;
    system:{
        description: string;
    }
    _id: string;
    type: string;
}

function signBonus(n: number): string {
    return n >= 0 ? `1d20+${n}` : `1d20${n}`;
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export class DnD5eAdapter extends BaseSystemAdapter {
    systemId = info.id;

    match(actor: FoundryActor): boolean {
        return actor._stats?.systemId === this.systemId;
    }

    getRaceData(actor: FoundryActor): RaceRecord {
        const race = actor.items.filter((i: FoundryItem) => i.type === 'race');

        return {
            name: race[0]?.name ?? '',
            img: resolveImage(race[0]?.img ?? '', this.foundryUrl),
            system: {
                description: race[0]?.system?.description ?? '',
            },
            _id: race[0]?._id ?? '',
            type: race[0]?.type ?? '',
        }
    }

    normalizeActorData(actor: FoundryActor): ActorSheetData {
        const base = super.normalizeActorData(actor);
        const s = actor.system as Partial<D5eSystem>;
        base.img = resolveImage(actor.img ?? '', this.foundryUrl);
        const attrs = s?.attributes ?? {};
        const prof = attrs.prof ?? 2;
        const race = this.getRaceData(actor);

        return {
            ...base,
            // Preserve `flags` — the platform's base projection drops it,
            // but the sheet UI uses it for per-character settings (theme,
            // notes sections, …) via the `_sheet_delver` namespace.
            flags: (actor as { flags?: Record<string, unknown> }).flags ?? {},
            derived: {
                hp: {
                    value: attrs.hp?.value ?? 0,
                    max: attrs.hp?.max ?? 0,
                    temp: attrs.hp?.temp ?? 0,
                },
                ac: attrs.ac?.value ?? 10,
                initiative: attrs.init?.value ?? attrs.init?.mod ?? 0,
                speed: {
                    walk: attrs.movement?.walk ?? 30,
                    fly: attrs.movement?.fly,
                    swim: attrs.movement?.swim,
                    climb: attrs.movement?.climb,
                },
                profBonus: prof,
                abilities: this.buildAbilities(s),
                skills: this.buildSkills(s),
                level: s?.details?.level ?? 0,
                race: race?.name,
                background: s?.details?.background ?? '',
                alignment: s?.details?.alignment ?? '',
                classes: this.buildClassString(actor.items),
                spellAttackBonus: this.buildSpellAttackBonus(s, prof),
                spellSaveDC: attrs.spelldc ?? 8 + prof,
                passivePerception: this.buildPassive(s, 'prc', 'wis'),
                passiveInvestigation: this.buildPassive(s, 'inv', 'int'),
                passiveInsight: this.buildPassive(s, 'ins', 'wis'),
                senses: attrs.senses ?? {},
                inspiration: attrs.inspiration ?? false,
                currency: s?.currency ?? {},
            },
        };
    }

    categorizeItems(actor: ActorSheetData): Record<string, FoundryItem[]> {
        const items = actor.items ?? [];
        return {
            weapons:  items.filter(i => i.type === 'weapon'),
            spells:   items.filter(i => i.type === 'spell'),
            features: items.filter(i => ['feat', 'class', 'subclass', 'background', 'race'].includes(i.type)),
            gear:     items.filter(i => ['equipment', 'consumable', 'tool', 'loot'].includes(i.type)),
            all:      items,
        };
    }

    getRollData(
        actor: FoundryActor,
        type: string,
        key: string,
        _options?: RollDataOptions,
    ): RollData | null {
        const s = actor.system as Partial<D5eSystem>;

        if (type === 'ability') {
            const ab = s?.abilities?.[key];
            if (!ab) return null;
            const mod = ab.mod ?? Math.floor(((ab.value ?? 10) - 10) / 2);
            return { formula: signBonus(mod), label: `${ABILITY_LABELS[key] ?? key} Check` };
        }

        if (type === 'save') {
            const ab = s?.abilities?.[key];
            if (!ab) return null;
            const mod = ab.mod ?? Math.floor(((ab.value ?? 10) - 10) / 2);
            const prof = s?.attributes?.prof ?? 2;
            const saveProficient = (ab.proficient ?? 0) > 0;
            const save = typeof ab.save === 'number' ? ab.save : mod + (saveProficient ? prof : 0);
            return { formula: signBonus(save), label: `${ABILITY_LABELS[key] ?? key} Saving Throw` };
        }

        if (type === 'skill') {
            const skill = s?.skills?.[key];
            if (!skill) return null;
            const total = skill.value ?? skill.total ?? 0;
            return { formula: signBonus(total), label: `${SKILL_LABELS[key] ?? key} Check` };
        }

        return null;
    }

    getInitiativeFormula(actor: FoundryActor): string {
        const s = actor.system as Partial<D5eSystem>;
        const init = s?.attributes?.init?.value ?? s?.attributes?.init?.mod ?? 0;
        return signBonus(init);
    }

    getActorCardData(actor: FoundryActor): ActorCardData {
        const s = actor.system as Partial<D5eSystem>;
        const hp = s?.attributes?.hp;
        const ac = s?.attributes?.ac?.value ?? 10;
        const level = actor.items.filter((i: FoundryItem) => i.type === 'class')
                    .map((c: FoundryItem) => {
                        const sys = c.system as Record<string, any>;
                        const lvl = sys?.levels ?? sys?.level ?? '';
                        return lvl;
                    })
                    .join(' / ') || '—';      
        const prof = s?.attributes?.prof ?? 2;

        const classes = actor.items
            .filter((i: FoundryItem) => i.type === 'class')
            .map((c: FoundryItem) => {
                const sys = c.system as Record<string, any>;
                const lvl = sys?.levels ?? sys?.level ?? '';
                return lvl ? `${c.name} ${lvl}` : c.name;
            })
            .join(' / ');

        const race = this.getRaceData(actor)?.name;
        const subtext = [level > 0 ? `Level ${level}` : null, race, classes]
            .filter(Boolean)
            .join(' • ');

        return {
            name: actor.name,
            img: resolveImage(actor.img ?? ''),
            subtext: subtext || actor.type,
            blocks: [
                {
                    title: 'HP',
                    value: hp?.value ?? 0,
                    subValue: `/ ${hp?.max ?? 0}`,
                    valueClass: 'text-green-400',
                },
                {
                    title: 'AC',
                    value: ac,
                    valueClass: 'text-blue-400',
                },
                {
                    title: 'Level',
                    value: level || '—',
                },
                {
                    title: 'Prof',
                    value: `+${prof}`,
                },
            ],
        };
    }

    // --- Private helpers ---

    private buildAbilities(s: Partial<D5eSystem>): Record<string, unknown> {
        const prof = s?.attributes?.prof ?? 2;
        const result: Record<string, unknown> = {};
        for (const [key, ab] of Object.entries(s?.abilities ?? {})) {
            const score = ab.value ?? 10;
            const mod = ab.mod ?? Math.floor((score - 10) / 2);
            const saveProficient = (ab.proficient ?? 0) > 0;
            // In dnd5e v3.x, ab.save is an object { roll: {...} } not a number.
            // Calculate save bonus from mod + proficiency instead.
            const save = typeof ab.save === 'number' ? ab.save : mod + (saveProficient ? prof : 0);
            result[key] = { score, mod, save, saveProficient };
        }
        return result;
    }

    private buildSkills(s: Partial<D5eSystem>): Record<string, unknown> {
        const result: Record<string, unknown> = {};
        for (const [key, skill] of Object.entries(s?.skills ?? {})) {
            result[key] = {
                total: skill.value ?? skill.total ?? 0,
                prof: skill.prof ?? 0,
                ability: skill.ability ?? 'dex',
                label: SKILL_LABELS[key] ?? key,
            };
        }
        return result;
    }

    private buildClassString(items: FoundryItem[]): string {
        const classes = items.filter(i => i.type === 'class');
        if (classes.length === 0) return '';
        return classes.map(c => {
            const sys = c.system as Record<string, any>;
            const lvl = sys?.levels ?? sys?.level ?? '';
            return lvl ? `${c.name} ${lvl}` : c.name;
        }).join(' / ');
    }

    private buildSpellAttackBonus(s: Partial<D5eSystem>, profBonus: number): number {
        const castingAbility = s?.attributes?.spellcasting;
        if (!castingAbility) return profBonus;
        return profBonus + (s?.abilities?.[castingAbility]?.mod ?? 0);
    }

    private buildPassive(s: Partial<D5eSystem>, skillKey: string, fallbackAbility: string): number {
        const skillTotal = s?.skills?.[skillKey]?.value ?? s?.skills?.[skillKey]?.total;
        if (typeof skillTotal === 'number') return 10 + skillTotal;
        const ab = s?.abilities?.[fallbackAbility];
        const mod = ab?.mod ?? Math.floor(((ab?.value ?? 10) - 10) / 2);
        return 10 + mod;
    }
}
