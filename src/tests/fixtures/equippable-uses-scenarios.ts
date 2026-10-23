import fixture from '../../../tests/fixtures/native-6.0.6/equippable-uses.json';
import {equippableFinalSource,equippableFinalContext} from './equippable-final-scenarios';
export const equippableUsesCases=fixture.cases,equippableUsesContext=equippableFinalContext;
export function equippableUsesSource(row:typeof fixture.cases[number]){const source=equippableFinalSource(row);(source.items.at(-1)!.system as any).uses=structuredClone(row.source.uses);return source;}
