import fixture from '../../../tests/fixtures/native-6.0.6/transferred-fields.json';
import {finalTrainingCases,finalTrainingSource} from './final-training-scenarios';
import {finalDefenseCases,finalDefenseSource} from './final-defense-scenarios';
import {finalCustomCases,finalCustomSource} from './final-custom-scenarios';
import {flagEffectCases,flagEffectSource} from './flag-effect-scenarios';
import {equippableFinalCases,equippableFinalSource} from './equippable-final-scenarios';
import {skillContext} from './skill-scenarios';
export const transferredFieldCases=fixture.cases,transferredFieldContext=skillContext;
export function transferredFieldInput(c:typeof fixture.cases[number]):any {
 return c.family==='training'?finalTrainingCases[c.index]:c.family==='defense'?finalDefenseCases.filter(r=>!r.petrified)[c.index]:c.family==='custom'?finalCustomCases[c.index]:flagEffectCases.filter(r=>r.phase==='final')[c.index];
}
export function transferredFieldSource(c:typeof fixture.cases[number],includeUtility=c.utility){
 const row=transferredFieldInput(c),source=c.family==='training'?finalTrainingSource(row):c.family==='defense'?finalDefenseSource(row):c.family==='custom'?finalCustomSource(row):flagEffectSource(row);
 const gear=equippableFinalSource(equippableFinalCases.find(r=>r.type===c.type&&r.phase==='final'&&Boolean(r.source.properties.length)===c.state.magic&&r.source.attunement==='required'&&r.source.attuned===c.state.attuned&&r.source.equipped===c.state.equipped)!).items!.at(-1)! as any;
 gear.effects=source.effects;source.effects=[];
 if(c.type!=='container')gear.system.uses={max:'3',spent:1,recovery:[]};
 if(includeUtility)gear.system.activities={FieldUtility0001:{_id:'FieldUtility0001',type:'utility',name:'Field utility',duration:{value:'@item.uses.value',units:'round'},range:{override:true,value:'5',units:'ft'}}};
 source.items!.push(gear);return source;
}
