import fixture from '../../../tests/fixtures/native-6.0.6/remaining-flags.json';
import {skillSource,skillContext} from './skill-scenarios';
export const remainingFlags=fixture;
export const remainingFlagContext=skillContext;
export function remainingFlagSource(flags:Record<string,unknown>={},coefficient=1){const source=skillSource(),s=source.system as any;source.flags={dnd5e:{...flags}};s.abilities.wis={value:14,proficient:0};s.abilities.dex={value:14,proficient:0};s.tools={thief:{ability:'wis',value:1}};s.skills.prc={ability:'wis',value:coefficient};source.effects=[];return source;}
export function reliableSource(row:typeof fixture.reliable[number]){const source=remainingFlagSource({reliableTalent:row.flag},row.coefficient),s=source.system as any;s[row.kind+'s'][row.kind==='skill'?'prc':'thief'].roll={min:row.minimum,max:row.maximum};return source;}
export function reliableOptions(row:typeof fixture.reliable[number]){return row.selected?(row.kind==='skill'?{tool:'thief'}:{skill:'prc'}):{};}
