import {record} from '../native/6.0.6/source';
export interface SourceRuleFlags606 {
    jackOfAllTrades:boolean;initiativeAlert:boolean;diamondSoul?:boolean;toolExpertise?:boolean;observantFeat?:boolean;remarkableAthlete?:boolean;powerfulBuild?:boolean;tavernBrawlerFeat?:boolean;reason?:string;
    provenance:'release-6.0.6 modern persisted Actor flags';
}
/** Only these persisted Boolean flags are qualified. No feature-name inference,
 * effect/Item flag writes, prepared-field overrides or legacy reinterpretation. */
export function sourceRuleFlags606(actor:unknown):SourceRuleFlags606 {
    const source=record(actor),raw=source?.flags,flags=record(raw),native=record(flags?.dnd5e);
    let reason=raw!=null&&!flags||flags?.dnd5e!=null&&!native?'Actor flag source container malformed':undefined;
    const active:Record<string,boolean>={jackOfAllTrades:false,initiativeAlert:false,diamondSoul:false,toolExpertise:false,observantFeat:false,remarkableAthlete:false,powerfulBuild:false,tavernBrawlerFeat:false};
    for(const [key,value]of Object.entries(native??{})){
        if(value===undefined||value===null||value===false||value===0||value==='')continue;
        if(!Object.hasOwn(active,key)){reason??=`Native flag requires qualification: ${key}`;continue;}
        if(value!==true){reason??=`Native Boolean flag source malformed: ${key}`;continue;}
        active[key]=true;
    }
    return {...active,jackOfAllTrades:active.jackOfAllTrades,initiativeAlert:active.initiativeAlert,provenance:'release-6.0.6 modern persisted Actor flags',...(reason?{reason}:{})};
}
