import React from 'react';
import type {WeaponRange606} from '../../../logic/preparation/weapon-range';
/** Formatting only;including0 and explicit missing/not-applicable states. */
export default function WeaponRangeFacts({range}:{range?:WeaponRange606}){
 if(!range)return null;
 if(range.status!=='ready')return <p aria-label="Weapon range" title={range.reason}>Weapon range: Unavailable</p>;
 return <section aria-label="Weapon range">{(['value','long','reach']as const).map(key=>{const field=range.fields[key];if(field.status==='not-applicable')return null;const label=key==='value'?'Range':key==='long'?'Long range':'Reach';return <p key={key} aria-label={'Weapon '+key} title={field.reason}>{label}: {field.status==='ready'?field.value+' '+range.values!.units:'Unavailable'}</p>;})}</section>;
}
