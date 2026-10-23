import fixture from '../../../tests/fixtures/native-6.0.6/tool-checks.json';
import { skillSource, setSkillRoll } from './skill-scenarios';
export const toolCases = fixture.cases;
export function toolSource(row = toolCases[2]) {
    const actor = skillSource(), system = actor.system as Record<string, any>;
    (actor.items[0].system as any).levels = row.level;
    system.abilities[row.ability] = {value: row.score, check: {roll: {}}};
    system.tools = {[row.key]: row.id === 'initialized-defaults' ? {} : {ability:row.ability, value:row.value}};
    fixture.scopeOrder.forEach((path, index) => setSkillRoll(actor, path.replace('KEY',row.key).replace('ABILITY',row.ability), {bonus:row.bonuses[index]}));
    return actor;
}
