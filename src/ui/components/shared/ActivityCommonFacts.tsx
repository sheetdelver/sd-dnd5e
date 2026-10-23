import React from 'react';
import type {ActivityCommon606} from '../../../logic/preparation/activity-common';
/** Formatting only;both layouts receive the same prepared Activity facts. */
export default function ActivityCommonFacts({fact}:{fact?:ActivityCommon606}){
 if(!fact)return null;
 if(fact.status!=='ready')return <p aria-label="Activity preparation" title={fact.reason}>Activity details are not available for this rules profile.</p>;
 const activation=fact.activation!,duration=fact.duration!,range=fact.range!,target=fact.target!;
 const unit=(name:string,value:number|null)=>value===null||value===1?name:name+'s';
 const targets:Record<string,[string,string]>={creature:['creature','creatures'],object:['object','objects'],ally:['ally','allies'],enemy:['enemy','enemies'],space:['space','spaces'],willing:['willing creature','willing creatures'],any:['target','targets'],creatureOrObject:['creature or object','creatures or objects']};
 const targetLabel=target.type==='self'?'Self':target.type?targets[target.type]?.[target.count===1?0:1]??target.type:'None specified';
 return <div>
  <p aria-label="Activity activation">Activation: {activation.value===null?'':activation.value+' '}{activation.type}</p>
  <p aria-label="Activity duration">Duration: {duration.value===null?'':duration.value+' '}{duration.units==='inst'?'Instantaneous':unit(duration.units,duration.value)}</p>
  <p aria-label="Activity range">Range: {range.value===null?'':range.value+' '}{range.units==='self'?'Self':range.units==='touch'?'Touch':range.units}</p>
  <p aria-label="Activity target">Target: {target.count===null?'':target.count+' '}{targetLabel}</p>
  {target.template&&<div aria-label="Activity area">
   <p>Area: {target.template.count} × {target.template.type==='radius'?'Emanation':target.template.type}</p>
   {Object.entries(target.template.dimensions).map(([key,label])=><p key={key} aria-label={'Area '+key}>{label==='Label'?'Size':label}: {target.template![key as 'size'|'width'|'height']??'—'} {target.template!.units}</p>)}
  </div>}
  {fact.consumption&&<ul aria-label="Activity consumption">{fact.consumption.targets.map(reference=><li key={reference.index} data-reference-status={reference.status} title={reference.reason}>
   {reference.type}: {reference.status==='owned'||reference.status==='self'?reference.itemId??'This Item':reference.status==='not-applicable'?reference.sourceTarget??'This activity':'Unavailable'}
  </li>)}</ul>}
 </div>;
}
