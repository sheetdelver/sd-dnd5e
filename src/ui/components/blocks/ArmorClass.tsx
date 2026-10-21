'use client';
import React from 'react';
import {useSheet} from '../shared/SheetContext';
import {armorClassProjection} from '../../../logic/preparation/defenses';
import CharacterFact from '../shared/CharacterFact';
export default function ArmorClass({value:_value}:{value?:unknown}){
    const {actor}=useSheet(),fact=armorClassProjection(actor?.derived??{});
    return <div className="block-card" style={{textAlign:'center'}}><div style={{fontSize:'20px',fontWeight:700,color:'var(--text-primary)'}}><CharacterFact fact={fact} label="Armor class"/></div><div className="block-heading" style={{marginBottom:0}}>Armor Class</div></div>;
}
