import React from 'react';
import type {ActivityFacts} from '../../../logic/preparation/item-facts';
export default function ActivitySaveFacts({activity}:{activity:ActivityFacts}){
 const fact=activity.save;if(!fact)return null;
 return <p aria-label={'Activity save DC '+activity.id} title={fact.reason}>Save DC: {fact.value?.dc??'Unavailable'}{fact.value?' · '+(fact.value.targets.length?fact.value.targets.map(key=>key.toUpperCase()).join(' / '):'No save ability selected'):''}</p>;
}
