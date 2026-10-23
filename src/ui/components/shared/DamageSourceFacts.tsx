import React from 'react';
import type {DamageSourceFact606,ActivityDamageSource606} from '../../../logic/preparation/damage-source';
export function DamageSourceFact({fact,label='Base formula'}:{fact:DamageSourceFact606;label?:string}){
 return <p aria-label={label} title={fact.reason??'Before activity,ability,scaling and critical adjustments'}>{label}: {fact.status==='ready'?(fact.value!.formula||'None defined'):'Unavailable'}{fact.value?.types.length?' · '+fact.value.types.join(' / '):''}</p>;
}
export default function DamageSourceFacts({source}:{source?:ActivityDamageSource606}){
 if(!source)return null;
 if(source.status!=='ready')return <p aria-label="Base formulas" title={source.reason}>Base formulas: Unavailable</p>;
 return <section aria-label="Base formulas">{source.parts.length?source.parts.map(part=><DamageSourceFact key={part.key} label={(part.role==='healing'?'Base healing formula':'Base formula')+' '+part.key} fact={part.fact}/>):<p>No base formula defined</p>}</section>;
}
