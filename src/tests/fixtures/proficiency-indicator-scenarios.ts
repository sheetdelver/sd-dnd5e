import fixture from '../../../tests/fixtures/native-6.0.6/proficiency-indicators.json';
import {skillSource} from './skill-scenarios';
export const proficiencyIndicatorCases=fixture.cases;
export function proficiencyIndicatorSource(row:typeof proficiencyIndicatorCases[number]) {
    const source=skillSource(),system=source.system as Record<string,any>;
    system.skills.prc.value=row.value;system.abilities.wis.proficient=row.saveProficient?1:0;
    if(row.bounded)system.skills.prc.roll={mode:1,min:10};
    // Prepared-looking coefficients never override the persisted source value.
    system.skills.prc.prof=99;system.rolls={ability:{check:{proficiency:99},skill:{proficiency:99},save:{proficiency:99}}};
    return source;
}
