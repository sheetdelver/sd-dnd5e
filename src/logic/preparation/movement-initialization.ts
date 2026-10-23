import {record} from '../native/6.0.6/source';
import type {RulesContext} from '../rules-context';
import {resolveSpecies606} from './species-identity';
export const movementKeys606=['walk','burrow','climb','fly','jump','swim'] as const;
export const senseKeys606=['blindsight','darkvision','tremorsense','truesight'] as const;
export interface MovementInitialization606 {sourceWalk?:string;fromSpecies:Record<string,string|undefined>;speciesUuid?:string;movementReason?:string;sensesReason?:string}
/** Native embedded phase precedes initial effects. Scalar zero cleans to the
 * truthy string "0" and blocks species inheritance; sense zero also blocks it.
 * This detached model is never written back to the Actor. */
export function initializeMovement606(actor:unknown,system:Record<string,unknown>,context?:RulesContext):MovementInitialization606 {
 const result:MovementInitialization606={fromSpecies:{}},source=record(actor),attributes=record(system.attributes);
 if(!attributes)return {...result,movementReason:'Movement attributes malformed',sensesReason:'Senses attributes malformed'};
 const ref=resolveSpecies606(actor,system),species=ref.kind==='resolved'?record(ref.item?.system):null;
 if(ref.kind==='text'||ref.kind==='unavailable')result.movementReason=result.sensesReason=ref.reason;
 if(ref.kind==='resolved'){result.speciesUuid=ref.uuid;if(!species)result.movementReason=result.sensesReason='Species identity/source unavailable';}
 const metric=context?.settings['dnd5e.metricLengthUnits'],fallback=metric&&metric.status!=='unavailable'&&typeof metric.value==='boolean'?(metric.value?'m':'ft'):undefined;
 function object(parent:Record<string,unknown>,key:string,domain:'movementReason'|'sensesReason') {if(parent[key]===undefined||parent[key]===null)parent[key]={};const value=record(parent[key]);if(!value)result[domain]??='Movement/senses source mapping malformed';return value;}
 const m=object(attributes,'movement','movementReason'),s=object(attributes,'senses','sensesReason'),sm=record(species?.movement),ss=record(species?.senses);
 if(species?.movement!=null&&!sm||sm?.speeds!=null&&!record(sm.speeds))result.movementReason??='Species movement source malformed';
 if(species?.senses!=null&&!ss||ss?.ranges!=null&&!record(ss.ranges))result.sensesReason??='Species senses source malformed';
 if(m){const speeds=object(m,'speeds','movementReason');
  for(const key of movementKeys606){const raw=speeds?.[key],own=raw==null?undefined:typeof raw==='string'||typeof raw==='number'?String(raw).trim():raw,inherit=record(sm?.speeds)?.[key],inherited=inherit==null?undefined:typeof inherit==='string'||typeof inherit==='number'?String(inherit).trim():inherit;
   if(key==='walk'&&typeof own==='string')result.sourceWalk=own;
   if(speeds){if(species&&inherited&&!own){speeds[key]=inherited;if(typeof inherited==='string')result.fromSpecies[key]=inherited;}else speeds[key]=own??0;}
  }
  m.multiplier=1; // persisted:false, not an authoritative raw source override.
  m.units??=sm?.units??fallback;m.hover=sm?.hover===true?true:m.hover??false;
 }
 if(s){const ranges=object(s,'ranges','sensesReason');for(const key of senseKeys606)if(ranges){const own=ranges[key],inherit=record(ss?.ranges)?.[key];ranges[key]=own==null&&inherit?inherit:own??0;}
  s.units??=ss?.units??fallback;
  const own=s.special==null?'':typeof s.special==='string'?s.special.trim():s.special,inherited=ss?.special==null?'':typeof ss.special==='string'?ss.special.trim():ss.special;
  if(typeof own!=='string'||typeof inherited!=='string')result.sensesReason??='Sense special source malformed';else s.special=[own,inherited].filter(Boolean).join(';');
 }
 if(source&&record(system.attributes)?.speed!==undefined)result.movementReason??='Legacy movement source migration requires qualification';
 return result;
}
