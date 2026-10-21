import {record} from '../native/6.0.6/source';

const equippableTypes=['consumable','container','equipment','tool','weapon'];
const otherTypes=['background','class','facility','feat','loot','race','spell','subclass'];
export interface ItemEffectState {
    suppressed:boolean;reason?:string;
    initialized?:{equipped:boolean;attuned:boolean;attunement:string};
    origins?:Record<string,'source'|'default'|'null-cleaned'>;
}
/** Detached source/default eligibility only. Equippable Boolean fields initialize
 * false; null equipped also migrates to false. Other Item schemas do not declare
 * these fields, so extra source properties cannot become prepared state. This
 * does not emulate Item creation hooks, effects or full schema coercion. */
export function itemEffectState606(item:Record<string,unknown>):ItemEffectState {
    if(typeof item.type!=='string'||![...equippableTypes,...otherTypes].includes(item.type))return {suppressed:false,reason:'Item effect eligibility type unavailable'};
    if(!equippableTypes.includes(item.type))return {suppressed:false};
    const data=item.system===undefined?{}:record(item.system);
    if(!data)return {suppressed:false,reason:'Item effect eligibility source malformed or migrated'};
    const equipped=data.equipped??false,attuned=data.attuned??false,rawAttunement=data.attunement??'';
    const attunement=typeof rawAttunement==='string'?rawAttunement.trim():rawAttunement;
    if(typeof equipped!=='boolean'||typeof attuned!=='boolean'||typeof attunement!=='string')return {suppressed:false,reason:'Item effect eligibility source malformed or migrated'};
    let requireEquipped=true;
    if(item.type==='consumable'){
        const type=data.type===undefined?{}:record(data.type),value=type?.value??'';
        if(!type||typeof value!=='string')return {suppressed:false,reason:'Item effect eligibility consumable type malformed'};
        requireEquipped=['rod','trinket','wand'].includes(value.trim());
    }
    return {suppressed:requireEquipped&&!equipped||attunement==='required'&&!attuned,
        initialized:{equipped,attuned,attunement},origins:Object.fromEntries(['equipped','attuned','attunement'].map(key=>[key,data[key]===undefined?'default':data[key]===null?'null-cleaned':'source']))};
}
