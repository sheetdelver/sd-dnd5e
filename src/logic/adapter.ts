import { prepareArmorClass606,prepareInitiative606,initiativeRoll,armorClassProjection } from './preparation/defenses';
import { prepareHealth606, hpProjection } from './preparation/health';
import {prepareMovement606,movementKeys,senseKeys} from './preparation/movement';
import {prepareSpeciesIdentity606,speciesProjection,legacySpeciesIdentity} from './preparation/species-identity';
import {prepareDefenseTraits606,defensesProjection} from './preparation/defense-traits';
import {
    BaseSystemAdapter, SdkError,
    resolveImage,
    type FoundryActor,
    type ActorPreparationContext,
    type PreparedActorData,
    type FoundryItem,
    type ActorSheetData,
    type ActorCardData,
    type RollData,
    type RollDataOptions,
    type SystemAdapter,
} from '@sheet-delver/sdk';

import info from '../../info.json';
import { resolveRulesContext } from './rules-context';
import { callerCatalog } from '../server/content/catalog';
import { decodeActor606 } from './native/6.0.6/source';
import { prepareNumericSkills606, numericSkillRoll, unavailableSkillChecks, type PreparedSkill } from './preparation/skills';
import { d20RangeReason, skillRollScopes, abilityRollScopes, numericD20Roll, independentD20Options } from './preparation/d20-configuration';
import { prepareNumericAbilities606, type PreparedNumericAbility } from './preparation/abilities';
import { prepareNumericTools606 } from './preparation/tools';
import { SKILL_LABELS } from './preparation/check-identities';
import { prepareSkillToolModel606, configureSkillToolCheck, skillToolRoll, type SkillToolModel } from './preparation/skill-tool';
import { characterFacts606, characterFactsProjection } from './preparation/character-profile';
import { prepareNumericEffects606 } from './preparation/numeric-effects';

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

export { SKILL_LABELS } from './preparation/check-identities';

type RaceRecord = {
    name: string;
    img: string;
    description: string;
    _id: string;
    type: string;
    status?:string;
    reason?:string;
    provenance?:string;
    uuid?:string|null;
}

function getDescriptionValue(system: unknown): string {
    if (!system || typeof system !== 'object') return '';
    const description = (system as { description?: unknown }).description;
    if (typeof description === 'string') return description;
    if (description && typeof description === 'object') {
        const value = (description as { value?: unknown }).value;
        return typeof value === 'string' ? value : '';
    }
    return '';
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

    prepareActorData(
        actor: FoundryActor,
        context: Readonly<ActorPreparationContext>,
    ): PreparedActorData {
        const prepared = super.prepareActorData(actor, context);
        const rules = resolveRulesContext(context.world);
        const decoded = rules.status === 'supported' ? decodeActor606(actor) : null;
        prepared.derived.lifecycle = { status: rules.status, reason: rules.reason,
            profile: rules.profile, identity: rules.identity,
            sourceRevision: context.sourceRevision, worldEpoch: context.worldEpoch,
            actorCapability: decoded?.capability ?? 'unavailable',
            sourceDiagnostics: decoded?.diagnostics ?? [],
            // Schema context readiness does not qualify the old numeric projection.
            preparation: 'legacy-projection-unqualified' };
        const selectedLegacy = rules.status === 'supported' && rules.profile === 'legacy-limited';
        const oldSpecies=selectedLegacy?this.getLegacyRaceData(actor):null;
        const species=oldSpecies?legacySpeciesIdentity(oldSpecies.name,oldSpecies._id,oldSpecies.img,oldSpecies.description):prepareSpeciesIdentity606(actor,rules);
        prepared.derived.speciesIdentity=species;
        prepared.derived.race=species.name??'';
        const effects=prepareNumericEffects606(actor);
        prepared.derived.defenses=prepareDefenseTraits606(actor,rules,effects);
        prepared.derived.equipmentPreparation=effects.equipment;
        prepared.derived.effectPreparation = {...effects.plan,reason:effects.reason,applied:effects.applied};
        const checkModel = prepareSkillToolModel606(actor,rules,effects);
        prepared.derived.checkConfiguration = checkModel;
        const tools = prepareNumericTools606(actor,rules,checkModel);
        prepared.derived.tools = tools.checks;
        prepared.derived.toolPreparation = {status:tools.status,reason:tools.reason};
        if (!selectedLegacy) {
            prepared.derived.abilities = prepareNumericAbilities606(actor, rules,effects);
            const skills = rules.status === 'supported' && rules.profile === '2024' ? prepareNumericSkills606(actor, rules,checkModel)
                : unavailableSkillChecks(actor, `Skill rules context unavailable: ${rules.reason ?? 'unknown profile'}`);
            prepared.derived.skillChecks = skills;
            prepared.derived.skills = Object.fromEntries(Object.entries(skills).map(([key, skill]) => [key, { ...skill, label: SKILL_LABELS[key] ?? key }]));
            prepared.derived.passivePerception = skills.prc?.passive ?? null;
            prepared.derived.passiveInvestigation = skills.inv?.passive ?? null;
            prepared.derived.passiveInsight = skills.ins?.passive ?? null;
            const facts = characterFacts606(actor, rules,effects);
            prepared.derived.characterFacts = facts;
            prepared.derived.level = facts.level.value;
            prepared.derived.profBonus = facts.proficiency.value;
            const health=prepareHealth606(actor,rules,effects);prepared.derived.hp=health.hp;prepared.derived.hitDice=health.hitDice;
            const armor=prepareArmorClass606(actor,rules,effects),initiative=prepareInitiative606(actor,rules,effects);
            prepared.derived.armorClass=armor;prepared.derived.ac=armor.value;prepared.derived.initiativeFacts=initiative.fact;prepared.derived.initiative=initiative.fact.value;prepared.derived.initiativeCheck=initiative.check;
            const motion=prepareMovement606(actor,rules,effects);prepared.derived.movement=motion.movement;prepared.derived.speed=motion.movement.speeds;prepared.derived.senses=motion.senses;
        } else {
            const oldSpeed=prepared.derived.speed as Record<string,number>,oldSenses=prepared.derived.senses as Record<string,any>;
            prepared.derived.movement={status:'legacy-unqualified',reason:'Selected legacy movement remains unqualified',provenance:'Selected legacy compatibility movement projection',speeds:Object.fromEntries(movementKeys.map(k=>[k,oldSpeed[k]??null])),jump:{status:'legacy-unqualified',value:null,display:'—',provenance:'Selected legacy compatibility'},units:'ft',max:null,slowed:null,hover:null,special:''};
            prepared.derived.senses={status:'legacy-unqualified',reason:'Selected legacy senses remain unqualified',provenance:'Selected legacy compatibility senses projection',ranges:Object.fromEntries(senseKeys.map(k=>[k,oldSenses[k]??0])),units:'ft',special:oldSenses.special??''};
            prepared.derived.armorClass={status:'legacy-unqualified',value:prepared.derived.ac,display:String(prepared.derived.ac),provenance:'Selected legacy AC compatibility projection',reason:'Legacy armor class remains unqualified'};
            prepared.derived.initiativeFacts={status:'legacy-unqualified',value:prepared.derived.initiative,display:String(prepared.derived.initiative),ability:'',score:null,provenance:'Selected legacy initiative compatibility projection',reason:'Legacy initiative remains unqualified'};
            const hp=prepared.derived.hp as Record<string,unknown>;
            prepared.derived.hp={...hp,status:'legacy-unqualified',effectiveMax:hp.max,tempmax:0,provenance:'Selected legacy compatibility HP projection',reason:'Legacy HP remain unqualified'};
            prepared.derived.characterFacts = Object.fromEntries([['level', prepared.derived.level], ['proficiency', prepared.derived.profBonus]].map(([key, value]) => [key, {
                status: 'legacy-unqualified', value, display: key === 'proficiency' ? `+${value}` : String(value),
                provenance: 'Selected legacy compatibility projection', reason: 'Legacy level/proficiency remain unqualified',
            }]));
            // Explicitly selected historical compatibility projection only.
            // Its math remains unqualified; bounds still cannot be discarded.
            const skills = prepared.derived.skills as Record<string, Record<string, unknown>>;
            for (const [key, skill] of Object.entries(skills)) {
                const reason = d20RangeReason(skillRollScopes(actor, key));
                skill.formula = reason ? null : signBonus(skill.total as number);
                if (reason) skill.unavailableReason = reason;
            }
            const abilities = prepared.derived.abilities as Record<string, Record<string, unknown>>;
            for (const [key, ability] of Object.entries(abilities)) {
                for (const [type, field, total] of [['check', 'check', ability.mod], ['save', 'saveRoll', ability.save]] as const) {
                    const reason = d20RangeReason(abilityRollScopes(actor, key, type));
                    ability[field] = { ability: key, total, formula: reason ? null : signBonus(total as number), ...(reason ? { unavailableReason: reason } : {}) };
                }
            }
        }
        const hp=hpProjection(prepared.derived),hd=prepared.derived.hitDice as any;
        prepared.derived.combatStats={hp:hp.value!==null&&hp.effectiveMax!==null?{value:hp.value,max:hp.effectiveMax}:null,hitDice:hd?.status==='ready'?{value:hd.value,max:hd.max}:null};
        return prepared;
    }

    async getSystemDataForUser(context: Parameters<NonNullable<SystemAdapter['getSystemDataForUser']>>[0]): Promise<unknown> {
        return callerCatalog(context);
    }

    getRaceData(actor: FoundryActor): RaceRecord {
        const species=speciesProjection((actor as PreparedActorData).derived);
        return {name:species.name??'',_id:species.id??'',type:species.id?'race':'',img:resolveImage(species.img,this.foundryUrl),description:species.description,status:species.status,reason:species.reason,provenance:species.provenance,uuid:species.uuid};
    }

    private getLegacyRaceData(actor:FoundryActor):RaceRecord {
        const race = actor.items.filter((i: FoundryItem) => i.type === 'race');
        const description = getDescriptionValue(race[0]?.system);

        return {
            name: race[0]?.name ?? '',
            img: resolveImage(race[0]?.img ?? '', this.foundryUrl),
            description: description,
            _id: race[0]?._id ?? '',
            type: race[0]?.type ?? '',
        } as RaceRecord;
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
        actor: PreparedActorData,
        type: string,
        key: string,
        _options?: RollDataOptions,
    ): RollData | null {
        const s = actor.system as Partial<D5eSystem>;
        const lifecycle = actor.derived.lifecycle as { status?: string; profile?: string } | undefined;
        const selectedLegacy = lifecycle?.status === 'supported' && lifecycle.profile === 'legacy-limited';
        if(type==='initiative'){
            if(key!=='initiative')return null;
            if(lifecycle?.status!=='supported'||lifecycle.profile!=='2024')return null;
            const formula=initiativeRoll(actor.derived.initiativeCheck as any,_options);
            return formula?{formula,label:'Initiative'}:null;
        }
        if (selectedLegacy && ['ability','save','skill'].includes(type) && !independentD20Options(_options)) return null;
        if (!selectedLegacy && (type === 'skill' || type === 'tool')) {
            if (lifecycle?.status !== 'supported' || lifecycle.profile !== '2024') return null;
            const model = actor.derived.checkConfiguration as SkillToolModel | undefined;
            if (!model) return null;
            const check = configureSkillToolCheck(model,type,key,_options);
            const formula = skillToolRoll(model,type,key,_options);
            return formula ? {formula,label:`${check.label} Check`} : null;
        }
        if (['ability', 'save', 'skill'].includes(type) && !selectedLegacy
            && (lifecycle?.status !== 'supported' || lifecycle.profile !== '2024')) return null;
        if ((type === 'ability' || type === 'save') && !selectedLegacy) {
            const ability = (actor.derived.abilities as Record<string, PreparedNumericAbility> | undefined)?.[key];
            const formula = numericD20Roll(type === 'ability' ? ability?.check : ability?.saveRoll, _options);
            return formula ? { formula, label: `${ABILITY_LABELS[key] ?? key} ${type === 'ability' ? 'Check' : 'Saving Throw'}` } : null;
        }
        if (selectedLegacy && (type === 'ability' || type === 'save') && d20RangeReason(abilityRollScopes(actor, key, type === 'ability' ? 'check' : 'save'))) return null;

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
            const preparedSkills = actor.derived.skillChecks as Record<string, PreparedSkill> | undefined;
            if (preparedSkills) {
                const formula = numericSkillRoll(preparedSkills[key], _options);
                return formula ? { formula, label: `${SKILL_LABELS[key] ?? key} Check` } : null;
            }
            if (!selectedLegacy
                || d20RangeReason(skillRollScopes(actor, key))) return null;
            const skill = s?.skills?.[key];
            if (!skill) return null;
            const total = skill.value ?? skill.total ?? 0;
            return { formula: signBonus(total), label: `${SKILL_LABELS[key] ?? key} Check` };
        }

        return null;
    }

    getInitiativeFormula(actor: PreparedActorData): string {
        const lifecycle=actor.derived.lifecycle as any;
        if(lifecycle?.status==='supported'&&lifecycle.profile==='legacy-limited'){
            const s=actor.system as Partial<D5eSystem>;
            const init=(s?.attributes?.init??{}) as any,ability=typeof init.ability==='string'&&init.ability?init.ability:'dex';
            const reason=d20RangeReason([...abilityRollScopes(actor,ability,'check'),{path:'attributes.init.roll',value:init.roll}]);
            if(reason)throw new SdkError('validation',reason);
            return signBonus(init.value??init.mod??0);
        }
        const check=actor.derived.initiativeCheck as any;
        if(lifecycle?.status!=='supported'||lifecycle.profile!=='2024'||!check?.formula||check.unavailableReason)throw new SdkError('validation',check?.unavailableReason??check?.defaultUnavailableReason??'Initiative preparation unavailable');
        // The public HUD hook supplies only a formula, not mode restrictions.
        // Preserve its default/override authority without exposing an unqualified
        // bounded advantage/disadvantage request. Sheet Normal remains available.
        if(check.range)throw new SdkError('validation','Initiative with die bounds is available from the character sheet using Normal; HUD mode restrictions are not qualified');
        return check.formula;
    }

    getActorCardData(actor: PreparedActorData): ActorCardData {
        const s = actor.system as Partial<D5eSystem>;
        const hp = hpProjection(actor.derived);
        const ac = armorClassProjection(actor.derived);
        const facts = characterFactsProjection(actor.derived);
        const level = facts.level.value;
        const defenses=defensesProjection(actor.derived);

        const classes = actor.items
            .filter((i: FoundryItem) => i.type === 'class')
            .map((c: FoundryItem) => {
                const sys = c.system as Record<string, any>;
                const lvl = sys?.levels ?? sys?.level ?? '';
                return lvl ? `${c.name} ${lvl}` : c.name;
            })
            .join(' / ');

        const race = speciesProjection(actor.derived).display;
        const subtext = [level !== null ? `Level ${facts.level.display}` : 'Level unavailable', race, classes]
            .filter(Boolean)
            .join(' • ');

        return {
            name: actor.name,
            img: resolveImage(actor.img ?? ''),
            subtext: subtext || actor.type,
            blocks: [
                {
                    title: 'HP',
                    value: hp.value ?? '—',
                    subValue: hp.effectiveMax!==null?`/ ${hp.effectiveMax}`:hp.reason,
                    valueClass: hp.status==='unavailable'?'text-muted-foreground':'text-green-400',
                },
                {
                    title: 'AC',
                    value: ac.value??'—', subValue:ac.reason,
                    valueClass: ac.status==='unavailable'?'text-muted-foreground':'text-blue-400',
                },
                {
                    title: 'Level',
                    value: level ?? '—', subValue: facts.level.reason,
                },
                {
                    title: 'Prof',
                    value: facts.proficiency.display, subValue: facts.proficiency.reason,
                },
                {title:'Defenses',value:defenses.summary,subValue:defenses.reason},
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
