import fixture from '../../../tests/fixtures/native-6.0.6/combined-checks.json';
import { skillSource } from './skill-scenarios';
export const combinedCases = fixture.cases;
export function combinedSource(row = combinedCases[8]) {
    const actor = skillSource(), system = actor.system as Record<string, any>;
    (actor.items[0].system as any).levels=(row as {level?:number}).level??5;
    system.abilities = {wis:{value:14,proficient:0,check:{roll:{bonus:4,mode:-1}}},dex:{value:16,proficient:0,check:{roll:{bonus:-2,mode:1}}}};
    system.skills = {prc:{value:row.skillValue,ability:'wis',roll:{bonus:1,mode:0},bonuses:{passive:''}}};
    system.tools = {thief:{value:row.toolValue,ability:'dex',roll:{bonus:7,mode:0}}};
    system.rolls = {ability:{check:{bonus:2,mode:0},skill:{bonus:3,mode:0},tool:{bonus:-1,mode:0}}};
    return actor;
}
export function combinedOptions(row: typeof combinedCases[number]) {
    return {ability:row.ability,...(row.combined ? row.kind==='skill' ? {tool:'thief'} : {skill:'prc'} : {})};
}
