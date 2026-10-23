import {itemEffectMetadata606,itemLocalEffectsReason606} from './effect-admission';
import {record,documentIdentity} from '../native/6.0.6/source';
import {numericConstant,qualifiedNumericTotal} from './numeric';

export interface PreparedArmorItem {
    id:string;uuid:string;type:string;base:number;value:number;dex:number|null;
    magicAvailable:boolean;stealthDisadvantage:boolean;
}
export interface EquipmentPreparation {
    provenance:string;reason?:string;armor:PreparedArmorItem|null;shield:PreparedArmorItem|null;
    items:PreparedArmorItem[];warnings:string[];
}
const armorTypes=['light','medium','heavy','natural','shield'];
const miscTypes=['clothing','ring','rod','trinket','vehicle','wand','wondrous'];
/** Exact source-only Item base/derived armor subset. No Item effect, activity,
 * flag, migration or final phase is fabricated. The immutable prepared result
 * belongs to this Actor revision and is shared by all downstream consumers. */
export function prepareEquipment606(actor:unknown):EquipmentPreparation {
    const source=record(actor)??{},out:EquipmentPreparation={
        provenance:'release-6.0.6 EquipmentData.prepareBaseData/prepareDerivedData, EquippableItemTemplate.magicAvailable, AttributesFields.prepareArmorClass',
        armor:null,shield:null,items:[],warnings:[],
    };
    const fail=(reason:string)=>{out.reason??=reason;};
    if(!Array.isArray(source.items)){fail('Equipment Item source collection unavailable');return out;}
    const identities=new Map<unknown,number>();
    for(const raw of source.items){const id=record(raw)?._id;identities.set(id,(identities.get(id)??0)+1);}
    for(const raw of source.items){
        const item=record(raw),data=record(item?.system);
        const duplicate=identities.get(item?._id)!>1;
        if(item?.type!=='equipment')continue;
        if(!data){fail('Equipment source mapping malformed');continue;}
        if(data.equipped!==undefined&&data.equipped!==null&&typeof data.equipped!=='boolean'){fail('Equipment equipped source malformed');continue;}
        if(data.equipped!==true)continue;
        const id=item._id,uuid=`Actor.${source._id}.Item.${id}`,identity=documentIdentity(uuid);
        if(duplicate||typeof id!=='string'||!identity||item.uuid!==undefined&&item.uuid!==uuid||source.uuid!==undefined&&source.uuid!==`Actor.${source._id}`){fail('Equipped Item canonical identity unavailable');continue;}
        const type=record(data.type)?.value;
        if(typeof type==='string'&&miscTypes.includes(type))continue;
        if(typeof type!=='string'||!armorTypes.includes(type)){fail('Equipped Item type outside qualified armor profile');continue;}
        if(itemEffectMetadata606(item).reason||itemLocalEffectsReason606(item)||data.stealth!==undefined){fail('Equipped Item flags/migration require qualification');continue;}
        if(data.armor!=null&&!record(data.armor)){fail('Equipped armor source mapping malformed');continue;}
        const armor=record(data.armor)??{},base=armor.value??0,dex=armor.dex??null,properties=data.properties??[],attunement=data.attunement??'',attuned=data.attuned??false;
        if(typeof base!=='number'||!Number.isInteger(base)||base<0||base>1_000_000_000||dex!==null&&(typeof dex!=='number'||!Number.isInteger(dex)||Math.abs(dex)>1_000_000_000)){
            fail('Equipped armor value/Dex cap source malformed');continue;
        }
        if(!Array.isArray(properties)||properties.some(prop=>typeof prop!=='string')||typeof attunement!=='string'||typeof attuned!=='boolean'){
            fail('Equipped armor properties/attunement source malformed or migrated');continue;
        }
        const bonus=numericConstant(armor.magicalBonus);
        if(bonus===null){fail('Equipped armor magical expression requires Q00 qualification');continue;}
        const magicAvailable=(attuned||attunement!=='required')&&properties.includes('mgc');
        const value=base+(magicAvailable?bonus:0);
        if(!qualifiedNumericTotal(value)||Math.abs(value)>1_000_000_000){fail('Equipped armor result outside qualified numeric range');continue;}
        out.items.push({id,uuid,type,base,value,dex,magicAvailable,stealthDisadvantage:properties.includes('stealthDisadvantage')});
    }
    const armors=out.items.filter(item=>item.type!=='shield'),shields=out.items.filter(item=>item.type==='shield');
    out.armor=armors[0]??null;out.shield=shields[0]??null;
    if(armors.length>1)out.warnings.push('multiple-armor');
    if(shields.length>1)out.warnings.push('multiple-shields');
    return out;
}
