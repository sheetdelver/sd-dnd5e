import React,{createContext,useContext} from 'react';
import {preparationIssues,unavailableTitle} from '../../preparationIssues';
export {unavailableTitle} from '../../preparationIssues';
export const PreparationDiagnosticScope=createContext<string|undefined>(undefined);
export function UnavailableNote({reason}:{reason?:string}){
 const id=useContext(PreparationDiagnosticScope);
 return reason?<small className="dnd5e-unavailable-note" title={unavailableTitle(reason)} aria-describedby={id}>Unavailable</small>:null;
}
export function PreparationDiagnostics({actor,id}:{actor:Record<string,any>;id:string}){
 const issues=preparationIssues(actor);if(!issues.length)return null;
 return <section id={id} className="dnd5e-preparation-diagnostics" aria-label="Sheet diagnostics" tabIndex={-1}>
  <details><summary><span role="status">Some values or actions are unavailable</span> · View details</summary>
   <p>Available values remain usable. Unavailable values are shown as —. Stored values are not substitutes for effective values.</p>
   <ul>{issues.map(issue=><li key={issue.reason}><p>{issue.message}</p>
    {issue.sources.length>0&&<ul>{issue.sources.map(source=><li key={source}>{source}</li>)}</ul>}
    <p>Affected: {issue.fields.join(', ')}.</p>
    <p>Technical detail: <code>{issue.reason}</code></p>
   </li>)}</ul>
   <p>Review the named source in Foundry or provide this diagnostic when reporting the issue. Removing an effect is not required to inspect this sheet.</p>
  </details>
 </section>;
}
