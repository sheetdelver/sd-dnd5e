import type { FoundryActor } from '@sheet-delver/sdk';
import cases from '../../../tests/fixtures/native-6.0.6/ability-checks.json';
import { skillSource } from './skill-scenarios';

export const abilityCases = cases.cases;
export function abilitySource(row: typeof abilityCases[number]): FoundryActor {
    const actor = skillSource(), system = actor.system as Record<string, unknown>;
    system.abilities = { [row.ability]: { value: row.score, proficient: row.proficient,
        check: { roll: { bonus: row.checkBonus ?? '' } }, save: { roll: { bonus: row.saveBonus ?? '' } } } };
    system.rolls = { ability: { check: { bonus: row.globalCheckBonus ?? '' },
        save: { bonus: row.globalSaveBonus ?? '' } } };
    actor.items = row.levels.map((levels, i) => ({ _id: `class${i}`, name: 'Synthetic class', type: 'class', system: { levels } })) as unknown as FoundryActor['items'];
    return actor;
}
