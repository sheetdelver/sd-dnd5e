import type {ItemFact} from './item-facts';
import {record} from '../native/6.0.6/source';
import {deterministicFormula606,formulaUnavailableReason606,type FormulaBindings606} from './deterministic-formula';
const provenance='release-6.0.6 PhysicalItemTemplate / ActivitiesTemplate / UsesField; source-only read preparation';
const fact=<T>(value:T|null,reason?:string,origin:ItemFact<T>['origin']='source'):ItemFact<T>=>({status:reason?'unavailable':'ready',value:reason?null:value,origin,provenance,...(reason?{reason}:{})});
const na=<T>():ItemFact<T>=>({...fact<T>(null),status:'not-applicable'});
const nat=(value:unknown,fallback:number,integer=false):number|null=>value===undefined?fallback:typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=1e9&&(!integer||Number.isSafeInteger(value))?value:null;
export interface RecoveryFact {period:string;type:string;formula:string|null}
export interface UsesFacts {status:'ready'|'unavailable'|'not-applicable';reason?:string;max:number|null;spent:number|null;remaining:number|null;limited:boolean|null;capacitySource:string|null;origin:'source'|'schema-default';recovery:ItemFact<RecoveryFact[]>;display:string;provenance:string}
export const emptyUses606=(status:UsesFacts['status'],reason?:string):UsesFacts=>({status,reason,max:null,spent:null,remaining:null,limited:null,capacitySource:null,origin:'schema-default',recovery:status==='not-applicable'?na<RecoveryFact[]>():fact<RecoveryFact[]>(null,reason??'Uses preparation unavailable'),display:status==='not-applicable'?'Not applicable':'Unavailable',provenance});
/** The counter is independent of its recovery recipe. Source uses.value/label
 * are nonpersisted; neither can supply an override or hide a malformed maximum. */
export function prepareUses606(raw:unknown,reason?:string,bindings:FormulaBindings606={}):UsesFacts {
 const data=raw===undefined?{}:record(raw);if(!data)return emptyUses606('unavailable','Uses source mapping malformed');
 const source=data.max,capacity=source==null?undefined:typeof source==='string'?source.trim():typeof source==='number'&&Number.isFinite(source)?String(source):null;
 const spent=nat(data.spent,0,true),max=capacity===undefined||capacity===''?0:deterministicFormula606(capacity,bindings);
 const counterReason=reason??(capacity===null||max===null||max<0||max>1e9?formulaUnavailableReason606(capacity,bindings):spent===null?'Uses spent source must be a nonnegative integer':undefined);
 const recovery:RecoveryFact[]=[];let recoveryReason:string|undefined;
 if(data.recovery!==undefined&&!Array.isArray(data.recovery))recoveryReason='Uses recovery collection malformed';
 else for(const entry of (data.recovery as unknown[]|undefined)??[]){const row=record(entry),period=row?.period===undefined?'lr':row?.period,type=row?.type===undefined?'recoverAll':row?.type,formula=row?.formula;
  if(!row||typeof period!=='string'||!period.trim()||typeof type!=='string'||!type.trim()||formula!=null&&typeof formula!=='string'){recoveryReason='Uses recovery source requires qualification';break;}
  if(period.trim().startsWith('@scale')){recoveryReason='Recovery period scale dependency requires preparation qualification';break;}
  recovery.push({period:period.trim(),type:period.trim()==='recharge'?'recoverAll':type,formula:period.trim()==='recharge'&&formula==null?'6':typeof formula==='string'?formula.trim():null});
 }
 const initialized=counterReason?emptyUses606('unavailable',counterReason):{status:'ready' as const,max:max!,spent:spent!,remaining:max?Math.min(max,Math.max(0,max-spent!)):0,limited:Boolean(capacity),capacitySource:capacity??null,origin:(source===undefined?'schema-default':'source') as UsesFacts['origin'],display:capacity?`${max?Math.min(max,Math.max(0,max-spent!)):0}/${max}`:'No limited uses',provenance};
 return {...initialized,recovery:recoveryReason?fact<RecoveryFact[]>(null,recoveryReason):fact(recovery,undefined,data.recovery===undefined?'schema-default':'source')};
}
