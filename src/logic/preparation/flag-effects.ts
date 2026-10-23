import type {SourceRuleFlags606} from './rule-flags';
import type {EffectChange} from './effects';
export const BOOLEAN_FLAG_KEYS_606=['jackOfAllTrades','initiativeAlert','diamondSoul','toolExpertise','observantFeat','remarkableAthlete','powerfulBuild','tavernBrawlerFeat','halflingLucky','reliableTalent','elvenAccuracy','halflingNimbleness','ignoreArmorSpeedReduction','enhancedDualWielding'] as const;
/** Native _prepareFlagChange followed by Foundry Boolean handlers. This runs
 * only on module-owned phase operands;it never writes Actor source flags. */
export function applyBooleanFlag606(state:SourceRuleFlags606,change:EffectChange):{before:boolean;value:boolean;reason?:undefined}|{reason:string} {
 const match=/^flags\.dnd5e\.([A-Za-z0-9]+)$/.exec(change.key),key=match?.[1];
 if(!key||!BOOLEAN_FLAG_KEYS_606.includes(key as typeof BOOLEAN_FLAG_KEYS_606[number]))return {reason:'Effect flag target requires qualification'};
 const raw=change.value;
 if(raw!=null&&!['boolean','number','string'].includes(typeof raw)||typeof raw==='number'&&!Number.isFinite(raw)||typeof raw==='string'&&raw.length>1024)return {reason:'Effect Boolean flag delta outside qualified primitive profile'};
 const before=Boolean((state as unknown as Record<string,unknown>)[key]),delta=raw==='false'?false:Boolean(raw);let value:boolean;
 switch(change.type){case'add':value=before||delta;break;case'subtract':value=before!==delta;break;case'multiply':value=before&&delta;break;case'override':value=delta;break;case'upgrade':value=before||delta;break;case'downgrade':value=before&&delta;break;default:return {reason:'Effect Boolean flag operation requires qualification'};}
 (state as unknown as Record<string,unknown>)[key]=value;return {before,value};
}
