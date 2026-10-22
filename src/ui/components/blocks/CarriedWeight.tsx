'use client';
import React from 'react';
import {useSheet} from '../shared/SheetContext';
import type {Physical606} from '../../../logic/preparation/physical';
/** Formats the shared source-prepared model;never sums raw inventory in UI. */
export default function CarriedWeight(){const {actor}=useSheet(),model=actor?.derived?.physical as Physical606|undefined;if(actor?.derived?.lifecycle?.profile==='legacy-limited')return null;
const enc=model?.encumbrance.value;
return <section className="block-card" aria-label="Carried weight"><h2 className="block-heading">Carried weight</h2>
<p aria-label="Total carried weight" title={model?.weight.reason}>{model?.weight.value==null?'Unavailable':`${model.weight.value} ${model.units}`}</p>
<p aria-label="Carrying capacity" title={model?.encumbrance.reason}>{enc?`${enc.value}/${enc.max} ${model?.units}`:'Unavailable'}</p>
{enc&&<small>Encumbered above {enc.thresholds.encumbered}; heavily encumbered above {enc.thresholds.heavilyEncumbered}. Rule: {enc.setting}.</small>}
<p aria-label="Carried currency" title={model?.currency.reason}>{model?.currency.value?Object.entries(model.currency.value).map(([key,value])=>`${value} ${key}`).join(' · '):'Unavailable'}</p>
</section>;}
