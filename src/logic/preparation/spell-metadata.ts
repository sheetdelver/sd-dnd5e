import {record} from '../native/6.0.6/source';
import {initializeTraitSet606} from './trait-fields';
import type {ItemFact} from './item-facts';
export interface SpellMetadata {level:number;school:string;properties:string[];components:string[];concentration:boolean;ritual:boolean;method:string;preparedSource:number}
/** Persisted spell metadata only; caster eligibility and effective prepared
 * state belong to the shared M5 casting model, not a Boolean source fallback. */
export function spellMetadata606(raw:unknown,reason?:string):ItemFact<SpellMetadata>{
 const s=record(raw)??{},level=s.level===undefined?1:s.level,properties=initializeTraitSet606(s.properties),school=s.school===undefined?'':s.school,method=s.method===undefined?'':s.method,prepared=s.prepared===undefined?0:s.prepared;
 const invalid=reason??(s.components!==undefined&&s.properties===undefined?'Legacy spell component migration requires qualification':typeof level!=='number'||!Number.isInteger(level)||level<0||level>9?'Spell level outside qualified source profile':!properties?'Spell properties source malformed':typeof school!=='string'||typeof method!=='string'||typeof prepared!=='number'||!Number.isInteger(prepared)||prepared<0?'Spell metadata source malformed':undefined);
 return {status:invalid?'unavailable':'ready',value:invalid?null:{level:level as number,school:school as string,method:method as string,preparedSource:prepared as number,properties:properties!,components:['vocal','somatic','material'].filter(key=>properties!.includes(key)).map(key=>({vocal:'V',somatic:'S',material:'M'}[key]!)),concentration:properties!.includes('concentration'),ritual:properties!.includes('ritual')},origin:s.level===undefined?'schema-default':'source',provenance:'release-6.0.6 SpellData.defineSchema / itemProperties',...(invalid?{reason:invalid}:{})};
}
