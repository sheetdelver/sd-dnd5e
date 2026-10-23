import {initializedClassLevel606} from './class-initialization';
import { record,decodeCollection,advancementTypes,ownedItemUuid } from '../native/6.0.6/source';
import type {RulesContext} from '../rules-context';
import {characterFacts606} from './character-profile';
import {numericAbilityValue,numericConstant} from './numeric';
import {prepareNumericEffects606,type NumericEffects} from './numeric-effects';
export interface PreparedHp {
    status:'ready'|'unavailable'|'legacy-unqualified';reason?:string;calculation?:'source-override'|'class-advancements';provenance:string;commandReason:string;
    value:number|null;max:number|null;effectiveMax:number|null;temp:number|null;tempmax:number|null;damage:number|null;pct:number|null;
    advancements:Array<{classId:string;itemUuid:string;advancementId:string;total:number}>;
    temporaryEdit?:{status:'ready'|'unavailable';value:number|null;reason?:string};
}
export interface PreparedHitDice {
    status:'ready'|'unavailable';reason?:string;provenance:string;max:number|null;value:number|null;bySize:Record<string,number>;
    classes:Array<{classId:string;itemUuid:string;identifier:string;die:string;max:number;value:number;spent:number;additional:number}>;
}
const provenance='release-6.0.6 CharacterData / AttributesFields.prepareHitPoints / HitPointsAdvancement / ClassData / HitDice';
const commandReason='Health editing is not available for this rules profile yet.';
const noHp=(reason:string):PreparedHp=>({status:'unavailable',reason,provenance,commandReason,value:null,max:null,effectiveMax:null,temp:null,tempmax:null,damage:null,pct:null,advancements:[]});
const noHd=(reason:string):PreparedHitDice=>({status:'unavailable',reason,provenance,max:null,value:null,bySize:{},classes:[]});
const integer=(value:unknown,min=0):value is number=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=min&&Math.abs(value)<=1_000_000_000;
/** Source-only health/HD facts, with qualified initial ability effects. HP and
 * HD availability are separate: explicit HP overrides do not need CON, class
 * selections or bonus evaluation. No health/rest command is authorized here. */
export function prepareHealth606(actor:unknown,context:RulesContext,effects:NumericEffects=prepareNumericEffects606(actor,context)):{hp:PreparedHp;hitDice:PreparedHitDice} {
    const source=record(actor)??{},system=effects.system,attributes=record(system.attributes)??{};
    let common:string|undefined;
    if(context.status!=='supported'||context.profile!=='2024')common=`Health rules context unavailable: ${context.reason??context.profile??'unknown'}`;
    else if(source.type!=='character'||typeof source._id!=='string'||!/^[A-Za-z0-9_-]+$/.test(source._id))common='Character health source identity unavailable';
    if(source.uuid!==undefined&&source.uuid!==`Actor.${source._id}`)common??='Health UUID outside qualified world-character profile';
    common??=effects.reason;
    common ??= effects.ruleFlags.reason;
    if(attributes.exhaustion!==undefined&&attributes.exhaustion!==0||Array.isArray(source.statuses)&&source.statuses.length)common??='Condition health preparation unavailable';
    if(common)return {hp:noHp(common),hitDice:noHd(common)};
    const items=Array.isArray(source.items)?source.items:null,classes:Record<string,unknown>[]=[],ids=new Set(),identifiers=new Set();
    let classReason=items?undefined:'Class source collection unavailable';
    for(const raw of items??[]){
        const item=record(raw);if(item?.type!=='class')continue;
        const data=record(item.system),id=item._id,identifier=data?.identifier;
        if(typeof id!=='string'||!/^[A-Za-z0-9_-]+$/.test(id)||ids.has(id))classReason??='Class source identity unavailable or duplicated';
        else ids.add(id);
        if(typeof identifier!=='string'||!/^[a-z][a-z0-9-]*$/.test(identifier)||identifiers.has(identifier))classReason??='Persisted class identifier unavailable or duplicated';
        else identifiers.add(identifier);
        const levels=initializedClassLevel606(item.system);if(levels===null)classReason??='Class level source unavailable';
        classes.push({...item,system:{...data,levels}});
    }
    if(classes.reduce((sum,item)=>sum+(typeof record(item.system)?.levels==='number'?record(item.system)!.levels as number:0),0)>20)classReason??='Class levels above20 unsupported';
    let hdReason=classReason;const hdClasses:PreparedHitDice['classes']=[],bySize:Record<string,number>={};
    for(const item of classes){
        const data=record(item.system)??{},hd=record(data.hd),die=hd?.denomination===undefined?'d6':hd.denomination,spent=hd?.spent===undefined?0:hd.spent,additional=numericConstant(hd?.additional);
        if(data.hd!==undefined&&!hd||hd?.additional===null||typeof die!=='string'||!['d6','d8','d10','d12'].includes(die)||!integer(spent)||additional===null||!integer(additional,-1_000_000_000)){hdReason??='Class Hit Dice source/formula outside qualified profile';continue;}
        if(typeof data.levels!=='number'||typeof item._id!=='string'||typeof data.identifier!=='string')continue;
        if(!/^[A-Za-z0-9_-]+$/.test(item._id))continue;
        const max=Math.max(data.levels+additional,0),value=Math.max(max-spent,0);
        if(!integer(max)){hdReason??='Hit Dice maximum outside qualified numeric range';continue;}
        hdClasses.push({classId:item._id,itemUuid:ownedItemUuid(source._id as string,item._id),identifier:data.identifier,die,max,value,spent,additional});
        bySize[die]=(bySize[die]??0)+value;
    }
    const hitDice:PreparedHitDice=hdReason?noHd(hdReason):{status:'ready',provenance,classes:hdClasses,bySize,max:hdClasses.reduce((n,c)=>n+c.max,0),value:hdClasses.reduce((n,c)=>n+c.value,0)};
    const rawHp=record(attributes.hp);if(!rawHp)return {hp:noHp('HP source unavailable'),hitDice};
    const value=rawHp.value==null?0:rawHp.value,temp=rawHp.temp===undefined?0:rawHp.temp,tempmax=rawHp.tempmax==null?0:rawHp.tempmax;
    if(!integer(value)||!integer(temp)||!integer(tempmax,-1_000_000_000))return {hp:noHp('HP current/temporary source malformed'),hitDice};
    const override=rawHp.max===undefined?null:rawHp.max;
    if(override!==null&&!integer(override))return {hp:noHp('HP maximum override source malformed'),hitDice};
    let max=typeof override==='number'?override:0,hpReason:string|undefined;const advancements:PreparedHp['advancements']=[];
    if(override===null){
        hpReason=classReason;
        const facts=characterFacts606(actor,context,effects),con=numericAbilityValue(record(record(system.abilities)?.con)?.value);
        if(facts.level.value===null)hpReason??=facts.level.reason??'Class level unavailable for HP';
        if(!con)hpReason??='Constitution source score unavailable for HP';
        if(!classes.length)hpReason??='HP advancement source unavailable';
        const bonuses=record(rawHp.bonuses),perLevel=numericConstant(bonuses?.level),overall=numericConstant(bonuses?.overall);
        if(rawHp.bonuses!==undefined&&!bonuses||perLevel===null||overall===null)hpReason??='HP bonus formula requires Q00 qualification';
        for(const item of classes){
            const data=record(item.system)??{},diagnostics:Array<{code:string;path:string}>=[],collection=decodeCollection(structuredClone(data.advancement),'advancement',advancementTypes,diagnostics);
            const hp=Object.values(collection).filter(adv=>adv.type==='HitPoints'),choices=record(hp[0]?.value),hd=record(data.hd),die=hd?.denomination===undefined?'d6':hd.denomination;
            if(diagnostics.length||hp.length!==1||!choices||typeof data.levels!=='number'||data.levels<1||typeof die!=='string'||!['d6','d8','d10','d12'].includes(die)) {hpReason??='HitPoints advancement source unavailable';continue;}
            const faces=Number(die.slice(1));let total=0;
            if(Object.keys(choices).length!==data.levels||Object.keys(choices).some(key=>!/^(?:[1-9]|1\d|20)$/.test(key)||Number(key)>Number(data.levels)))hpReason??='HitPoints advancement choices incomplete or beyond current class levels';
            for(let level=1;level<=data.levels;level++){
                const choice=choices[String(level)],amount=choice==='max'?faces:choice==='avg'?faces/2+1:choice;
                if(!integer(amount,1)||amount>faces){hpReason??='HitPoints advancement selection unavailable';continue;}
                if(con)total+=Math.max(amount+con.mod,1);
            }
            if(typeof item._id==='string'&&/^[A-Za-z0-9_-]+$/.test(item._id))advancements.push({classId:item._id,itemUuid:ownedItemUuid(source._id as string,item._id),advancementId:String(hp[0]._id),total});
            max+=total;
        }
        if(perLevel!==null&&overall!==null&&facts.level.value!==null)max+=perLevel*facts.level.value+overall;
        max=Math.floor(max);
    }
    if(hpReason)return {hp:noHp(hpReason),hitDice};
    if(!integer(max,-1_000_000_000))return {hp:noHp('HP result outside qualified numeric range'),hitDice};
    const effectiveMax=Math.max(max+tempmax,0),current=Math.min(value,effectiveMax);
    const hp:PreparedHp={status:'ready',provenance,calculation:override===null?'class-advancements':'source-override',commandReason,max,effectiveMax,value:current,temp,tempmax,damage:effectiveMax-current,pct:Math.max(0,Math.min(effectiveMax?current/effectiveMax*100:0,100)),advancements};
    for(const key of ['value','max','temp','tempmax']as const){const current=effects.finalScalars?.['system.attributes.hp.'+key];if(current!==undefined)hp[key]=current;}
    // A manual source edit is qualified only when this effective field has no
    // effect dependency. Even a same-value override must not become editable.
    const sourceTemp=record(record(record(source.system)?.attributes)?.hp)?.temp;
    const stored=sourceTemp===undefined?0:sourceTemp;
    const editedByEffect=[...effects.plan.initial,...effects.plan.final].some(change=>change.key==='system.attributes.hp.temp');
    hp.temporaryEdit=integer(stored)&&!editedByEffect&&hp.temp===stored
        ?{status:'ready',value:stored}:{status:'unavailable',value:null,reason:'Temporary HP is effect-dependent or its stored value is unavailable.'};
    return {hp,hitDice};
}
/** Projection access only, never reconstruction from source/default numbers. */
export function hpProjection(derived:Record<string,any>):PreparedHp {return derived.hp?.status?derived.hp:noHp('HP preparation unavailable');}
export function hitDiceProjection(derived:Record<string,any>):PreparedHitDice {return derived.hitDice?.status?derived.hitDice:noHd('Hit Dice preparation unavailable');}
