import React from 'react';
import type {ItemFacts} from '../../../logic/preparation/item-facts';
const abilityNames:Record<string,string>={str:'Strength',dex:'Dexterity',con:'Constitution',int:'Intelligence',wis:'Wisdom',cha:'Charisma'};
/** Formatting of the shared Item preparation;not a casting eligibility control. */
export default function SpellPreparationFacts({item}:{item?:ItemFacts}){
 const casting=item?.casting;
 return <section aria-label="Spell preparation">
  <p aria-label="Spell activity ability" title={casting?.reason}>Activity ability: {casting?.status==='ready'?abilityNames[casting.activityAbility??'']??'None':'Unavailable'}</p>
  {casting?.status==='ready'&&<p aria-label="Spell source class">Source class: {casting.classIdentifier||'None'}</p>}
  {item?.activities.filter(a=>a.type==='attack').map(a=><p key={a.id} aria-label={'Spell attack '+a.id} title={a.attack?.reason}>Attack: {a.attack?.value?.display??'Unavailable'}{a.attack?.status==='ready'?' · '+(abilityNames[a.attack.value?.ability??'']??'No ability modifier'):''}</p>)}
 </section>;
}
