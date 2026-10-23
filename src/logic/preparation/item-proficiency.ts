import {record} from '../native/6.0.6/source';
import type {RulesContext} from '../rules-context';
import type {NumericEffects} from './numeric-effects';
import {characterFacts606} from './character-profile';
import {checkProficiency606,sourceCheckCoefficient606} from './proficiency';
import {proficiencyDiceTerm606} from './proficiency-term';
import {initializeTraitSet606} from './trait-fields';
export interface ItemProficiency606 {status:'ready'|'unavailable'|'not-applicable';base:number|null;multiplier:number|null;flat:number|null;term:string|null;mode:'bonus'|'dice'|null;reason?:string;origin:string;provenance:string}
const provenance='release-6.0.6 Item._prepareProficiency / per-type proficiencyMultiplier;before Actor final effects';
const unavailable=(reason:string):ItemProficiency606=>({status:'unavailable',base:null,multiplier:null,flat:null,term:null,mode:null,reason,origin:'unavailable',provenance});
const weaponCategories:Record<string,string>={simpleM:'sim',simpleR:'sim',martialM:'mar',martialR:'mar'},armorCategories:Record<string,string|true>={natural:true,clothing:true,light:'lgt',medium:'med',heavy:'hvy',shield:'shl'};
/** Native Item proficiency is prepared independently of a check's current/selected
 * coefficient. Only typed persisted overrides and exact trait/tool identities
 * contribute;raw prof/hasProficiency/proficiencyMultiplier are never authoritative. */
export function prepareItemProficiency606(actor:unknown,item:unknown,context:RulesContext,effects:NumericEffects,gate?:string):ItemProficiency606 {
 const source=record(item),s=source?.system===undefined?{}:record(source?.system),type=source?.type;
 if(gate)return unavailable(gate);
 if(context.status!=='supported'||context.profile!=='2024'||record(actor)?.type!=='character')return unavailable('Item proficiency rules context unavailable');
 if(!source||!s||typeof type!=='string')return unavailable('Item proficiency source malformed');
 if(!['weapon','equipment','tool','feat','spell','consumable'].includes(type))return {status:'not-applicable',base:null,multiplier:null,flat:null,term:null,mode:null,origin:'native-type',provenance};
 const facts=characterFacts606(actor,context,effects,'prepared'),base=facts.proficiency.value;
 if(effects.reason||base===null)return unavailable(effects.reason??facts.proficiency.reason??'Actor base proficiency unavailable');
 let multiplier:number|null=null,origin='native-fixed';
 if(type==='feat'||type==='spell')multiplier=1;
 else if(type==='consumable'){multiplier=Number(effects.ruleFlags.tavernBrawlerFeat===true);origin='persisted-flag';}
 else {
  const raw=type==='weapon'&&typeof s.proficient==='boolean'?Number(s.proficient):s.proficient;
  if(raw!=null){if(type==='tool')multiplier=sourceCheckCoefficient606(raw);else if(raw===0||raw===1)multiplier=raw;origin='persisted-override';}
  else {
   const data=s.type===undefined?{}:record(s.type),key=data?.value===undefined?(type==='weapon'?'simpleM':''):data.value,baseItem=data?.baseItem??'';
   if(!data||typeof key!=='string'||typeof baseItem!=='string')return unavailable('Item proficiency selector source malformed');
   if(type==='weapon'||type==='equipment'){
    const traits=effects.system.traits===undefined?{}:record(effects.system.traits),field=type==='weapon'?'weaponProf':'armorProf',row=traits?.[field]===undefined?{}:record(traits?.[field]),training=initializeTraitSet606(row?.value);
    if(!traits||!row||!training)return unavailable('Item training source unavailable');
    const category=(type==='weapon'?weaponCategories:armorCategories)[key];
    multiplier=Number(category===true||typeof category==='string'&&training.includes(category)||training.includes(baseItem)||type==='weapon'&&(key==='natural'||key==='improv'&&effects.ruleFlags.tavernBrawlerFeat===true));origin='prepared-traits';
   }else {
    const tools=effects.system.tools===undefined?{}:record(effects.system.tools);if(!tools)return unavailable('Item tool proficiency source mapping unavailable');
    const values:number[]=[];
    for(const selector of [baseItem,key]){const rawEntry=tools[selector];if(rawEntry===undefined){values.push(0);continue;}const entry=record(rawEntry);if(!entry)return unavailable('Item tool proficiency source entry malformed');const value=checkProficiency606(entry.value===undefined?0:entry.value,undefined,['tool'],{check:record(effects.globals.check)?.proficiency,skill:0,tool:record(effects.globals.tool)?.proficiency},effects.ruleFlags.jackOfAllTrades,effects.ruleFlags.toolExpertise);if(value===null)return unavailable('Item tool prepared proficiency coefficient unavailable');values.push(value);}
    multiplier=Math.max(...values);origin='prepared-tool-coefficient';
   }
  }
 }
 if(multiplier===null)return unavailable('Item persisted proficiency coefficient malformed');
 const flat=Math.floor(base*multiplier),mode=facts.proficiency.mode??'bonus',term=mode==='dice'?proficiencyDiceTerm606(base,multiplier)??'0':String(flat);
 return {status:'ready',base,multiplier,flat,term,mode,origin,provenance};
}
/** Public numeric properties of the prepared Item proficiency;dice terms remain
 * symbolic/unavailable to deterministic preparation instead of becoming flat. */
export function itemProficiencyBindings606(fact:ItemProficiency606):Record<string,number>{
 if(fact.status!=='ready')return {};
 const bindings:Record<string,number>={'item.prof.flat':fact.flat!,'item.prof.multiplier':fact.multiplier!};
 if(fact.term!==null&&/^\d+$/.test(fact.term)){bindings['item.prof']=Number(fact.term);bindings['item.prof.term']=Number(fact.term);}
 return bindings;
}
