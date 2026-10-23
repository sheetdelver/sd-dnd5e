'use client';
import React from 'react';
import {useSheet} from '../shared/SheetContext';
import {ownedItemProjection} from '../../../logic/preparation/item-facts';
/** Formats the shared current rule result;never recounts or reads source poison. */
export default function Attunement(){const {actor}=useSheet();if(actor?.derived?.lifecycle?.profile==='legacy-limited')return null;const model=ownedItemProjection(actor?.derived).attunement;
return <section className="block-card"><h2 className="block-heading">Attunement</h2><p aria-label="Attunement capacity" title={model?.reason??model?.provenance}>{model?.display??'Unavailable'}</p></section>;}
