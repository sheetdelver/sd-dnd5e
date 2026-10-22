import {record} from '../native/6.0.6/source';
import {initializeTraitSet606} from './trait-fields';
import type {ConditionSource606} from './conditions';
import type {EffectChange} from './effects';

/** Shared admission for both String phases. Text never supplies condition
 * identity or immunity. Wider condition/CI phase combinations remain gated. */
export function customStringConditionReason606(actor:unknown,sources:ConditionSource606[],changes:EffectChange[]):string|undefined {
    const source=record(actor)??{};
    if(source.statuses!==undefined&&(!Array.isArray(source.statuses)||source.statuses.length))return 'Custom String Actor status source requires qualification';
    if(!sources.length)return;
    const condition=sources[0],type=condition.type,level=condition.source.level;
    if(sources.length!==1||!['poisoned','exhaustion'].includes(type)||!condition.condition.matches||condition.statuses.length!==1||condition.statuses[0]!==type)return 'Custom String condition composition requires qualification';
    if(type==='exhaustion'&&(typeof level!=='number'||!Number.isInteger(level)||level<1||level>6)||type==='poisoned'&&level!==null&&level!=='[absent]')return 'Custom String condition level source requires qualification';
    const system=record(source.system),rawTraits=system?.traits,traits=rawTraits==null?{}:record(rawTraits),rawCI=traits?.ci,ci=rawCI==null?{}:record(rawCI);
    const immunity=ci&&initializeTraitSet606(ci.value);
    if(!traits||!immunity||immunity.length||changes.some(change=>change.key==='system.traits.ci.value'))return 'Custom String immunity/condition phase composition requires qualification';
}

/** Plain SimpleTraitField.custom StringField semantics, not FormulaField.
 * Source/default initialization and literal phase operations are separate. */
export function customTraitPath606(path:string):boolean {
    return /^system\.traits\.(dr|di|dv|ci|armorProf|weaponProf|languages)\.custom$/.test(path);
}
export function initializeCustomString606(value:unknown):string|null {
    return value===undefined?'':typeof value==='string'?value.trim():null;
}
export function applyCustomString606(before:string,type:string,delta:unknown):string|null {
    if(typeof delta!=='string'||delta.includes('@'))return null;
    switch(type){
        case 'add':return (before+delta).trim();
        case 'subtract':return before.replace(delta,'').trim();
        case 'override':return delta.trim();
        case 'upgrade':case 'downgrade':case 'multiply':return before;
        default:return null;
    }
}
