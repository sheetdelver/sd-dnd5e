'use client';
import React from 'react';
import {useSheet} from '../shared/SheetContext';
import {armorClassProjection} from '../../../logic/preparation/defenses';
import type {ArmorClassFact} from '../../../logic/preparation/defenses';
import CharacterFact from '../shared/CharacterFact';
export function ArmorClassReadout({fact}:{fact:ArmorClassFact}){
    return <span><CharacterFact fact={fact} label="Armor class"/>{fact.warnings?.map(warning=><small key={warning} role="status" style={{display:'block',fontSize:'10px'}}>{warning==='multiple-armor'?'Multiple armor equipped; using the first source Item.':'Multiple shields equipped; using the first source Item.'}</small>)}</span>;
}
export default function ArmorClass({value:_value}:{value?:unknown}){
    const {actor}=useSheet(),fact=armorClassProjection(actor?.derived??{});
    return <div className="block-card" style={{textAlign:'center'}}><div style={{fontSize:'20px',fontWeight:700,color:'var(--text-primary)'}}><ArmorClassReadout fact={fact}/></div><div className="block-heading" style={{marginBottom:0}}>Armor Class</div></div>;
}
