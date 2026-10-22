import {record} from '../native/6.0.6/source';
export interface SourceRuleFlags606 {
    halflingLucky?:boolean;elvenAccuracy?:boolean;halflingNimbleness?:boolean;reliableTalent?:boolean;enhancedDualWielding?:boolean;ignoreArmorSpeedReduction?:boolean;weaponCriticalThreshold?:number;spellCriticalThreshold?:number;meleeCriticalDamageDice?:number;
    jackOfAllTrades:boolean;initiativeAlert:boolean;diamondSoul?:boolean;toolExpertise?:boolean;observantFeat?:boolean;remarkableAthlete?:boolean;powerfulBuild?:boolean;tavernBrawlerFeat?:boolean;reason?:string;
    provenance:'release-6.0.6 modern persisted Actor flags';
}
/** Known persisted native Boolean read flags and numeric critical metadata.
 * Execution qualification is per workflow;recognition does not qualify rerolls,
 * attack accuracy or critical damage. No name inference,effect writes or legacy reinterpretation. */
export function sourceRuleFlags606(actor:unknown):SourceRuleFlags606 {
    const source=record(actor),raw=source?.flags,flags=record(raw),native=record(flags?.dnd5e);
    let reason=raw!=null&&!flags||flags?.dnd5e!=null&&!native?'Actor flag source container malformed':undefined;
    const numbers:Record<string,number>={};
    const active:Record<string,boolean>={halflingLucky:false,elvenAccuracy:false,halflingNimbleness:false,reliableTalent:false,enhancedDualWielding:false,ignoreArmorSpeedReduction:false,jackOfAllTrades:false,initiativeAlert:false,diamondSoul:false,toolExpertise:false,observantFeat:false,remarkableAthlete:false,powerfulBuild:false,tavernBrawlerFeat:false};
    for(const [key,value]of Object.entries(native??{})){
        if(['weaponCriticalThreshold','spellCriticalThreshold','meleeCriticalDamageDice'].includes(key)){if(value==null)continue;if(typeof value!=='number'||!Number.isSafeInteger(value)||value<0||value>(key==='meleeCriticalDamageDice'?1e9:20)){reason??=`Native numeric flag source malformed or unqualified: ${key}`;continue;}numbers[key]=value;continue;}
        if(value===undefined||value===null||value===false||value===0||value==='')continue;
        if(!Object.hasOwn(active,key)){reason??=`Native flag requires qualification: ${key}`;continue;}
        if(value!==true){reason??=`Native Boolean flag source malformed: ${key}`;continue;}
        active[key]=true;
    }
    return {...active,...numbers,jackOfAllTrades:active.jackOfAllTrades,initiativeAlert:active.initiativeAlert,provenance:'release-6.0.6 modern persisted Actor flags',...(reason?{reason}:{})};
}

/** Reroll execution is not established by plain-d20/range qualification. Static
 * facts and unrelated native flags remain independently available. */
export const halflingExecutionReason606=(flags:Pick<SourceRuleFlags606,'halflingLucky'>):string|undefined=>flags.halflingLucky?'Halfling Lucky reroll execution requires qualification':undefined;
