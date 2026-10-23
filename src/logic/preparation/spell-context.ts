import {record,ownedItemUuid} from '../native/6.0.6/source';
import type {RulesContext} from '../rules-context';
import type {NumericEffects} from './numeric-effects';
import {numericAbilityValue} from './numeric';
import {itemLocalEffectsReason606} from './effect-admission';

export interface SpellContext606 {
 status:'ready'|'unavailable';reason?:string;classIdentifier:string|null;
 availableAbilities:string[]|null;activityAbility:string|null;modifier:number|null;
 provenance:string;
}
const provenance='release-6.0.6 Actor5e.classes/spellcastingClasses/spellcastingAbility;Item5e.spellcasting;SpellData.classIdentifier/availableAbilities;BaseActivityData.ability';
const abilities=['str','dex','con','int','wis','cha'];
const identifier=(v:unknown):v is string=>typeof v==='string'&&/^[a-z0-9][a-z0-9-]*$/.test(v);
const optionalString=(v:unknown):string|null=>v==null?'':typeof v==='string'?v.trim():null;
const unavailable=(reason:string):SpellContext606=>({status:'unavailable',reason,classIdentifier:null,availableAbilities:null,activityAbility:null,modifier:null,provenance});
/** Caller-owned source identities only. Native source/default and prepared
 * ability modifiers remain distinct;this is not spell eligibility,slot planning
 * or an alternate Actor cache. Display names and nonpersisted casting maps are
 * deliberately excluded from the identity graph. */
export function prepareSpellContexts606(actor:unknown,context:RulesContext,effects:NumericEffects):Record<string,SpellContext606> {
 const source=record(actor),items=Array.isArray(source?.items)?source.items.map(record):[],out:Record<string,SpellContext606>=Object.create(null);
 const spells=items.filter(item=>item?.type==='spell');
 let gate=context.status!=='supported'||context.profile!=='2024'||source?.type!=='character'?'Spell ability rules context unavailable':effects.reason;
 if(!Array.isArray(source?.items)||items.some(item=>!item||typeof item._id!=='string')||new Set(items.map(item=>item?._id)).size!==items.length)gate??='Spell ability owned identities unavailable';
 const attributes=record(effects.system.attributes),attribute=optionalString(attributes?.spellcasting);
 if(attribute===null||attribute!==''&&!abilities.includes(attribute))gate??='Actor spellcasting ability source unavailable';
 const modifier=(key:string|null):number|null=>key===null||key===''?0:numericAbilityValue(record(record(effects.system.abilities)?.[key])?.value)?.mod??null;
 type Caster={item:Record<string,unknown>;ownAbility:string|null;ability:string|null;progression:string};
 const classes=new Map<string,Caster>();let classReason:string|undefined;
 const casting=(item:Record<string,unknown>):{ability:string|null;progression:string;reason?:string}=>{
  const system=item.system===undefined?{}:record(item.system),raw=system?.spellcasting===undefined?{}:record(system?.spellcasting),ability=optionalString(raw?.ability),progression=raw?.progression===undefined?'none':optionalString(raw?.progression);
  const reason=itemLocalEffectsReason606(item)??(!system||!raw||ability===null||ability!==''&&!abilities.includes(ability)||!progression||!['none','full','half','artificer','third','pact'].includes(progression)?'Class spellcasting source/default profile unavailable':undefined);
  return {ability:raw?.ability==null?null:ability,progression:progression??'',reason};
 };
 const indexedClasses=new Map<string,Record<string,unknown>>();
 for(const item of items){if(item?.type!=='class')continue;const key=record(item.system)?.identifier;if(identifier(key))indexedClasses.set(key,item);else if(casting(item).progression!=='none'||casting(item).reason)classReason??='Caster class requires explicit persisted identifier';}
 for(const [key,item]of indexedClasses){const own=casting(item);
  // A verified noncaster with no matching subclass cannot influence strongest
  // casting ability. It still participates in explicit sourceItem lookup below.
  const subs=items.filter(sub=>sub?.type==='subclass'&&record(sub.system)?.classIdentifier===key),sub=subs[0],effective=sub?casting(sub):own;
  if(own.reason||effective.reason){classReason??=own.reason??effective.reason;continue;}
  const selected=effective.progression!=='none'?effective:own;
  if(selected.progression==='none')continue;
  classes.set(key,{item,ownAbility:own.ability,ability:selected.ability,progression:selected.progression});
 }
 let strongest:string|null=null,strongestMod=-Infinity;
 for(const value of classes.values()){if(!value.ownAbility)continue;const mod=modifier(value.ownAbility);if(mod===null){classReason??='Caster ability modifier unavailable';continue;}if(mod>strongestMod){strongest=value.ownAbility;strongestMod=mod;}}
 const fallback=strongest??attribute??'';
 for(const spell of spells){const id=spell!._id as string,s=spell!.system===undefined?{}:record(spell!.system),ability=optionalString(s?.ability),requested=optionalString(s?.sourceItem);
  let reason=gate??itemLocalEffectsReason606(spell!)??(!s||ability===null||ability!==''&&!abilities.includes(ability)?'Spell ability source unavailable':requested===null?'Spell sourceItem malformed':undefined),classIdentifier='';
  try{const uuid=ownedItemUuid(source?._id as string,id);if(spell!.uuid!==undefined&&spell!.uuid!==uuid)reason??='Spell canonical identity does not match Actor ownership';}catch{reason??='Spell canonical identity unavailable';}
  if(!reason&&requested){const parts=requested.split(':'),type=parts.length===2?parts[0]:null,key=parts.at(-1)!;
   if(parts.length>2||!parts.every(identifier))reason='Spell sourceItem identifier syntax unavailable';
   else {
    let selected:Record<string,unknown>|undefined;
    for(const candidate of items){if(type&&candidate!.type!==type)continue;const identity=record(candidate!.system)?.identifier;if(!identifier(identity)){reason='Spell sourceItem index requires explicit persisted identifiers';break;}if(identity===key){selected=candidate!;break;}}
    if(selected&&!['class','subclass'].includes(String(selected.type))){const flags=record(record(selected.flags)?.dnd5e),root=flags?.advancementRoot;if(root!=null&&typeof root!=='string')reason='Spell advancement root identity malformed';else selected=typeof root==='string'?items.find(item=>item?._id===root.slice(0,16))??undefined:undefined;}
    if(selected?.type==='class'){const key=record(selected.system)?.identifier;if(!identifier(key))reason='Spell source class identifier unavailable';else classIdentifier=key;}
    else if(selected?.type==='subclass'){const key=optionalString(record(selected.system)?.classIdentifier);if(key!==''&&!identifier(key))reason='Spell subclass classIdentifier unavailable';else classIdentifier=key??'';}
   }
  }
  if(!reason&&classReason)reason=classReason;
  // Native nullish semantics matter: an effective class ability of the empty
  // string blocks the Actor attribute fallback and yields an empty Set.
  const selected=ability||(classes.get(classIdentifier)?.ability??attribute);
  const list=selected?[selected]:[],activity=list[0]??fallback,mod=modifier(activity);
  if(!reason&&mod===null)reason='Spell activity ability modifier unavailable';
  out[id]=reason?unavailable(reason):{status:'ready',classIdentifier,availableAbilities:list,activityAbility:activity||'',modifier:mod,provenance};
 }
 return out;
}
