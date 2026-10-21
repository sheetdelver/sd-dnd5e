import fixture from '../../../tests/fixtures/native-6.0.6/species-identity.json';
import {skillSource} from './skill-scenarios';
export const speciesCases=fixture.cases;
export function speciesSource(row:typeof speciesCases[number]) {
    const actor=skillSource(),system=actor.system as Record<string,any>;
    system.details={...system.details,...(!row.omitRef?{race:structuredClone(row.ref)}:{})};
    if(row.invalidClass)(actor.items[0].system as any).levels='unknown';
    const items=[{_id:'speciesFirst001',name:row.sameName?'Shared label':'First species',type:'race',system:{source:{rules:'2014'},movement:{speeds:{walk:'20'}},description:{value:'First description'}}},
        {_id:'speciesSecond01',name:row.sameName?'Shared label':row.badName?null:'Second species',type:row.wrongType?'feat':'race',system:row.badSystem?42:{source:{rules:'2024'},movement:{speeds:{walk:'35'}},description:{value:'Second description'}},...(row.foreignUuid?{uuid:'Actor.other.Item.speciesSecond01'}:{})}];
    if(row.duplicate)items.push(structuredClone(items[1]));
    actor.items.push(...items as any);
    return actor;
}
