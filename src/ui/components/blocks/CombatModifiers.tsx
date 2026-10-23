'use client';
import React from 'react';
import type {CombatModifiers606} from '../../../logic/preparation/combat-modifiers';
import {useSheet} from '../shared/SheetContext';
import {ABILITY_FULL_NAME} from '../shared/abilityNames';
export default function CombatModifiers({kind='spell'}:{kind?:'spell'|'damage'}){const {actor}=useSheet(),model=actor?.derived?.combatModifiers as CombatModifiers606|undefined;if(actor?.derived?.lifecycle?.profile==='legacy-limited')return null;
if(kind==='damage')return <section className="block-card" aria-label="Damage bonuses"><h2 className="block-heading">Damage bonuses</h2>{Object.entries({mwak:'Melee weapon',rwak:'Ranged weapon',msak:'Melee spell',rsak:'Ranged spell'}).map(([key,label])=>{const bonus=model?.damage[key]?.bonus;return <p key={key} aria-label={label+' damage bonus'} title={bonus?.reason}>{label}: {bonus?.value==null?'Unavailable':`${bonus.value<0?'':'+'}${bonus.value}`}</p>;})}<small>Apply to the first damage part. Item-specific bonuses may also apply.</small></section>;
const spell=model?.spell;
return <section className="block-card" aria-label="Spell defaults"><h2 className="block-heading">Spell defaults</h2><p>{spell?.ability?ABILITY_FULL_NAME[spell.ability]??spell.ability:spell?.modifier.value!=null?'No selected ability':'Ability unavailable'}</p><p aria-label="Prepared spell attack" title={spell?.attack.reason}>{spell?.attack.value==null?'Unavailable':`${spell.attack.value<0?'':'+'}${spell.attack.value}`}</p><p aria-label="Prepared spell save DC" title={spell?.dc.reason}>{spell?.dc.value==null?'Unavailable':String(spell.dc.value)}</p><small>Individual spells may use a different ability.</small></section>;}
