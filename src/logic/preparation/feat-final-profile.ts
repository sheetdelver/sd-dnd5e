import {record} from '../native/6.0.6/source';
/** C73's empty feat recipe only. Prepared-looking fields are not persisted
 * source overrides. Other Item final preparation remains unavailable. */
export function featFinalCustomReason606(actor:unknown,itemId:string|null,hasConditions:boolean):string|undefined {
 if(!itemId)return 'Final custom String owned Item identity unavailable';
 const items=record(actor)?.items;
 const matches=Array.isArray(items)?items.map(record).filter(item=>item?._id===itemId):[];
 if(matches.length!==1)return 'Final custom String owned Item identity ambiguous or unavailable';
 const item=matches[0]!;
 if(item.type!=='feat'||hasConditions)return 'Transferred Item final custom text requires an empty condition-free feat';
 const raw=item.system,system=raw===undefined?{}:record(raw);
 if(!system||Object.keys(system).some(key=>!['activities','uses','prof','hasProficiency','proficiencyMultiplier'].includes(key)))return 'Feat final custom text source recipe requires qualification';
 const activities=system.activities===undefined?{}:record(system.activities);
 if(!activities||Object.keys(activities).length)return 'Feat final custom text with activities requires qualification';
 const uses=system.uses===undefined?{}:record(system.uses);
 if(!uses||Object.keys(uses).some(key=>!['spent','max','recovery','value','label','rollRecharge'].includes(key))
  ||uses.spent!==undefined&&uses.spent!==0||uses.max!==undefined&&uses.max!==''
  ||uses.recovery!==undefined&&(!Array.isArray(uses.recovery)||uses.recovery.length))return 'Feat final custom text with configured uses requires qualification';
}
