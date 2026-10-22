import {record} from '../native/6.0.6/source';
import type {RulesContext} from '../rules-context';
import {numericFact,type NumericFact} from './character-profile';
import {numericConstant,numericAbilityValue} from './numeric';
import {prepareNumericEffects606,type NumericEffects} from './numeric-effects';
import {resolveSpecies606} from './species-identity';

export const movementKeys=['walk','burrow','climb','fly','jump','swim'] as const;
export const senseKeys=['blindsight','darkvision','tremorsense','truesight'] as const;
type Status='ready'|'unavailable'|'legacy-unqualified';
export interface MovementFacts {
    status:Status;reason?:string;provenance:string;units:string|null;
    speeds:Record<string,number|null>;jump:NumericFact;max:number|null;slowed:boolean|null;
    hover:boolean|null;special:string|null;speciesUuid?:string;fromSpecies?:Record<string,string|undefined>;
}
export interface SensesFacts {status:Status;reason?:string;provenance:string;units:string|null;ranges:Record<string,number|null>;special:string|null;speciesUuid?:string}
const provenance='release-6.0.6 MovementField / SensesField / LocalDocumentField / CharacterData.prepareEmbeddedData / AttributesFields.prepareRace/prepareMovement';
const noMovement=(reason:string):MovementFacts=>({status:'unavailable',reason,provenance,units:null,speeds:Object.fromEntries(movementKeys.map(k=>[k,null])),jump:numericFact(null,reason),max:null,slowed:null,hover:null,special:null});
const noSenses=(reason:string):SensesFacts=>({status:'unavailable',reason,provenance,units:null,ranges:Object.fromEntries(senseKeys.map(k=>[k,null])),special:null});
const units:Record<string,number>={ft:1,m:10/3,mi:5280,km:10000/3};
const bounded=(value:number)=>Number.isFinite(value)&&Math.abs(value)<=1_000_000_000;
/** Verified ScalarString cleaning for this constant FormulaField subset. Numeric
 * zero becomes truthy "0"; missing/null remains undefined. Preserve that phase
 * distinction until species inheritance has finished. Never evaluate expressions. */
function literal(value:unknown):{text:string|undefined;number:number}|null {
    if(value==null)return {text:undefined,number:0};
    if(typeof value!=='string'&&typeof value!=='number')return null;
    const text=String(value).trim(),number=numericConstant(text);
    return number!==null&&bounded(number)?{text,number}:null;
}
export function prepareMovement606(actor:unknown,context:RulesContext,effects:NumericEffects=prepareNumericEffects606(actor)):{movement:MovementFacts;senses:SensesFacts} {
    const source=record(actor)??{},system=effects.system,attributes=record(system.attributes)??{};
    let common:string|undefined;
    if(context.status!=='supported'||context.profile!=='2024')common=`Movement/senses rules context unavailable: ${context.reason??context.profile??'unknown'}`;
    else if(source.type!=='character'||typeof source._id!=='string'||!/^[A-Za-z0-9_-]+$/.test(source._id)||source.uuid!==undefined&&source.uuid!==`Actor.${source._id}`)common='Movement/senses identity outside qualified world-character profile';
    common??=effects.reason;
    if(Object.values(record(record(source.flags)?.dnd5e)??{}).some(Boolean))common??='Movement/senses flags or transformation unavailable';
    if(attributes.exhaustion!==undefined&&attributes.exhaustion!==0||source.statuses!==undefined&&(!Array.isArray(source.statuses)||source.statuses.length))common??='Movement/senses condition preparation unavailable';
    const ref=resolveSpecies606(actor,system);let species:Record<string,unknown>|null=null,speciesUuid:string|undefined;
    if(ref.kind==='text'||ref.kind==='unavailable')common??=ref.reason;
    if(ref.kind==='resolved'){
        species=record(ref.item?.system);speciesUuid=ref.uuid;
        if(!species)common??='Species identity/source unavailable';
    }
    if(common)return {movement:noMovement(common),senses:noSenses(common)};
    const setting=context.settings['dnd5e.metricLengthUnits'];
    const fallback=setting&&setting.status!=='unavailable'&&typeof setting.value==='boolean'?(setting.value?'m':'ft'):null;
    function unit(actorUnits:unknown,speciesUnits:unknown):string|null {
        const value=actorUnits??(species?speciesUnits??fallback:fallback);
        return typeof value==='string'&&Object.hasOwn(units,value)?value:null;
    }
    const rawMovement=attributes.movement,rawSenses=attributes.senses,m=record(rawMovement)??{},s=record(rawSenses)??{},sm=record(species?.movement)??{},ss=record(species?.senses)??{};
    let moveReason:string|undefined,senseReason:string|undefined;
    if(rawMovement!=null&&!record(rawMovement)||m.speeds!=null&&!record(m.speeds)||species?.movement!=null&&!record(species.movement)||sm.speeds!=null&&!record(sm.speeds))moveReason='Movement source mapping malformed';
    if(rawSenses!=null&&!record(rawSenses)||s.ranges!=null&&!record(s.ranges)||species?.senses!=null&&!record(species.senses)||ss.ranges!=null&&!record(ss.ranges))senseReason='Senses source mapping malformed';
    if(attributes.speed!==undefined||movementKeys.some(k=>m[k]!==undefined||sm[k]!==undefined))moveReason??='Legacy movement source migration requires qualification';
    if(senseKeys.some(k=>s[k]!==undefined||ss[k]!==undefined))senseReason??='Legacy senses source migration requires qualification';
    const movementUnits=unit(m.units,sm.units),senseUnits=unit(s.units,ss.units);
    if(!movementUnits)moveReason??='Movement units or default setting unavailable';
    if(!senseUnits)senseReason??='Sense units or default setting unavailable';
    const speeds:Record<string,number|null>={},fromSpecies:Record<string,string|undefined>={};
    const initializedWalk=literal(record(m.speeds)?.walk);
    for(const key of movementKeys){
        let value=literal(record(m.speeds)?.[key]);const inherited=literal(record(sm.speeds)?.[key]);
        if(!value||!inherited){moveReason??='Movement expression requires Q00 qualification';speeds[key]=null;continue;}
        if(species&&inherited.text&&!value.text){value=inherited;fromSpecies[key]=inherited.text;}
        speeds[key]=Math.max(0,value.number);
    }
    const bonus=literal(m.bonus),hover=m.hover??false,speciesHover=sm.hover??false,special=typeof m.special==='string'?m.special.trim():m.special??'';
    if(!bonus)moveReason??='Movement bonus expression requires Q00 qualification';
    if(typeof hover!=='boolean'||typeof speciesHover!=='boolean'||typeof special!=='string')moveReason??='Movement hover/special source malformed';
    moveReason??=effects.equipment.reason;
    const armor=effects.equipment.armor,ability=numericAbilityValue(record(record(system.abilities)?.str)?.value);
    let reduction=movementUnits?effects.conditions.speedReduction/units[movementUnits]:0;
    if(armor){
        const item=(source.items as unknown[]).find(raw=>record(raw)?._id===armor.id),required=record(record(item)?.system)?.strength??0;
        if(typeof required!=='number'||!Number.isInteger(required)||required<0||!bounded(required))moveReason??='Equipped armor strength source unavailable';
        else if(required>0&&!ability)moveReason??='Strength source required for equipped armor movement';
        else if(ability&&required>ability.score&&movementUnits)reduction+=10/units[movementUnits];
    }
    let max=0;
    for(const key of movementKeys){
        let value=Math.max(0,(speeds[key]??0)-reduction);
        // Native does not create a speed by adding a positive bonus to zero.
        if(value>0)value=Math.max(0,value+(bonus?.number??0));
        if(!bounded(value))moveReason??='Movement result outside qualified numeric range';
        speeds[key]=value;max=Math.max(max,value);
    }
    const base=initializedWalk?.text||fromSpecies.walk,baseValue=literal(base)?.number??0;
    const slowed=(speeds.walk??0)<=baseValue/2;
    const jump={...numericFact(ability?ability.score/2:null,ability?undefined:'Strength source unavailable for jump'),provenance};
    // Native computes max/slowed before overwriting the persisted jump operand.
    speeds.jump=jump.value;
    const movement:MovementFacts=moveReason?noMovement(moveReason):{status:'ready',provenance,units:movementUnits,speeds,jump,max,slowed,hover:hover===true||speciesHover===true,special:special as string,...(speciesUuid?{speciesUuid,fromSpecies}:{})};
    const ranges:Record<string,number|null>={};
    for(const key of senseKeys){
        const own=record(s.ranges)?.[key]??null,inherited=record(ss.ranges)?.[key]??null;
        if([own,inherited].some(v=>v!==null&&(typeof v!=='number'||!Number.isInteger(v)||v<0||!bounded(v))))senseReason??='Sense range source outside qualified numeric schema';
        ranges[key]=typeof own==='number'?own:typeof inherited==='number'?inherited:0;
    }
    const ownSpecial=typeof s.special==='string'?s.special.trim():s.special??'',speciesSpecial=typeof ss.special==='string'?ss.special.trim():ss.special??'';
    if(typeof ownSpecial!=='string'||typeof speciesSpecial!=='string')senseReason??='Sense special source malformed';
    const senses:SensesFacts=senseReason?noSenses(senseReason):{status:'ready',provenance,units:senseUnits,ranges,special:[ownSpecial,speciesSpecial].filter(Boolean).join(';'),...(speciesUuid?{speciesUuid}:{})};
    return {movement,senses};
}
export function movementProjection(derived:Record<string,any>):MovementFacts {return derived.movement??noMovement('Movement preparation unavailable');}
export function sensesProjection(derived:Record<string,any>):SensesFacts {return derived.senses?.status?derived.senses:noSenses('Senses preparation unavailable');}
