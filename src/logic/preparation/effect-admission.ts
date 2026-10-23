import {record} from '../native/6.0.6/source';
/** Native _initializeSource bookkeeping and an empty outgoing dependency list
 * do not control applicability. Keep them in source;never treat a real incoming
 * dependency,temporary flag or unknown mechanic as bookkeeping. */
function nativeBookkeeping606(key:string,value:unknown):boolean {
 return key==='persistSourceMigration'&&typeof value==='boolean'
  ||key==='dependents'&&Array.isArray(value)&&value.length===0;
}
/** Identity metadata does not participate in Item.dependentOrigin. Never resolve
 * or replace these UUIDs. Rider effect identities are exact embedded IDs. */
export function itemEffectMetadata606(item:Record<string,unknown>):{riders:string[];reason?:string}{
 const raw=record(item.flags)?.dnd5e,flags=raw===undefined?{}:record(raw);
 const fail=()=>({riders:[],reason:'Item dependency/rider preparation unavailable'});
 if(!flags)return fail();
 for(const [key,value]of Object.entries(flags)){
  if(nativeBookkeeping606(key,value))continue;
  if(['sourceId','advancementOrigin','advancementRoot'].includes(key)){if(value!=null&&typeof value!=='string')return fail();continue;}
  if(key==='riders')continue;
  if(value)return fail();
 }
 const rawRiders=flags.riders,riders=rawRiders===undefined?{}:record(rawRiders);if(!riders)return fail();
 if(Object.entries(riders).some(([key,value])=>!['effect','statuses'].includes(key)&&Boolean(value)))return fail();
 const effects=riders.effect??[],statuses=riders.statuses??[];
 if(!Array.isArray(effects)||effects.some(id=>typeof id!=='string'||!id)||!Array.isArray(statuses)||statuses.length)return fail();
 return {riders:effects};
}
/** Actual Item.allApplicableEffects accepts applied enchantments only. Base and
 * non-applied enchantments stored for later activities do not prepare the Item. */
export function itemLocalEffectsReason606(item:Record<string,unknown>):string|undefined{
 if(item.effects===undefined)return;
 if(!Array.isArray(item.effects))return 'Owned Item effect collection malformed';
 for(const raw of item.effects){const effect=record(raw);if(!effect)return 'Owned Item effect source malformed';if(effect.disabled===true)continue;
  if(effect.type==='enchantment'&&effect.transfer!==false)return 'Applied Item enchantment preparation requires qualification';
  if(effect.type!==undefined&&!['base','condition','enchantment'].includes(String(effect.type)))return 'Owned Item effect type requires qualification';
 }
}
/** Permanent native duration is re-prepared as Infinity with expired=false.
 * Raw expired is nonauthoritative;timed/flag-forced temporary profiles need the
 * scene/time phase. Start metadata alone cannot expire a permanent effect. */
export function permanentEffectReason606(effect:Record<string,unknown>):string|undefined{
 const duration=effect.duration==null?{}:record(effect.duration);if(!duration)return 'Effect duration source malformed';
 // C105 proves identical persisted source can change applicability solely with
 // worldTime. Neither raw expired nor a local wall clock supplies that input.
 if(typeof duration.value==='number'&&Number.isFinite(duration.value)&&Number.isInteger(duration.value)&&duration.value>=0)return 'Timed effect preparation needs public world-time context (E04)';
 if(Object.entries(duration).some(([key,value])=>!['units','value','expiry','expired'].includes(key)||key==='value'&&value!=null||key==='expiry'&&value!=null||key==='expired'&&typeof value!=='boolean'||key==='units'&&typeof value!=='string'))return 'Effect duration/expiry preparation unavailable';
 const start=effect.start==null?{}:record(effect.start);if(!start)return 'Effect start source malformed';
 if(Object.entries(start).some(([key,value])=>!['combat','combatant','initiative','round','turn','time'].includes(key)||value!=null&&(['combat','combatant'].includes(key)?typeof value!=='string':typeof value!=='number'||!Number.isFinite(value))))return 'Effect start source malformed';
 const raw=record(effect.flags)?.dnd5e,flags=raw===undefined?{}:record(raw);if(!flags)return 'Effect flag source malformed';
 if(Object.entries(flags).some(([key,value])=>!nativeBookkeeping606(key,value)&&(key==='isTemporary'?value!==undefined&&value!==false:Boolean(value))))return 'Effect conditions/dependencies require Q02a qualification';
}
