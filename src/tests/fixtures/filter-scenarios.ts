import fixture from '../../../tests/fixtures/native-6.0.6/constant-filters.json';
import {skillSource} from './skill-scenarios';
export const filterCases=fixture.cases;
export function filterSource(row:typeof filterCases[number]){
    const actor=skillSource(),effect:any={_id:'filterEffect001',type:'base',system:{changes:[]}};
    const change:any={key:row.unknownTarget?'system.unknown.unqualified':'system.abilities.wis.value',type:'add',value:2,...(row.final?{phase:'final'}:{})};
    if(row.conditions!==undefined){if(row.scope==='change')change.conditions=structuredClone(row.conditions);else effect.system.conditions=structuredClone(row.conditions);}
    if(row.statuses!==undefined)effect.statuses=structuredClone(row.statuses);
    if(row.rider)effect.system.rider={statuses:row.rider};
    if(row.flags)effect.flags={dnd5e:{unqualified:true}};
    effect.system.changes=[change,...(row.otherBonus?[{key:'system.skills.prc.roll.bonus',type:'add',value:1}]:[])];
    if(row.legacy)effect.changes=[];
    if(row.malformedCollection)effect.system.changes=42;
    if(row.malformedPriority)change.priority='unknown';
    if(row.badEnvelope==='priority')change.priority='unknown';
    if(row.badEnvelope==='phase')change.phase='during';
    if(row.badEnvelope==='type')change.type='mystery';
    if(row.badEnvelope==='entry')effect.system.changes=[42];
    actor.effects=[effect];(actor.system as any).abilities.dex={value:14,proficient:0};(actor.system as any).tools={thief:{value:1,ability:'dex'}};
    return actor;
}
export function filterExpected(row:typeof filterCases[number]){
    return row.truth===undefined||row.workflowUnavailable?undefined:{skill:row.truth||row.otherBonus?6:5,tool:5,check:row.truth?3:2,save:row.truth?3:2,passive:row.truth||row.otherBonus?16:15,combined:row.truth||row.otherBonus?6:5,combinedTool:row.truth?6:5,combinedMode:1};
}
