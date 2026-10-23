import type {RulesContext} from '../rules-context';
/** Pinned native movementUnits conversions,including D&D's5ft→1.5m scale. */
export const lengthConversions606:Readonly<Record<string,number>>=Object.freeze({ft:1,mi:5280,m:10/3,km:10000/3});
export function defaultLengthUnits606(context?:RulesContext):string|undefined {
 const setting=context?.settings['dnd5e.metricLengthUnits'];return context?.status==='supported'&&context.profile==='2024'&&setting&&setting.status!=='unavailable'&&typeof setting.value==='boolean'?setting.value?'m':'ft':undefined;
}
