import fixture from '../../../tests/fixtures/native-6.0.6/poisoned-condition.json';
import {skillSource} from './skill-scenarios';
export interface ConditionCase {id:string;profile:Record<string,any>;expected?:{skill:number;tool:number;check:number;save:number;passive:number;mode:number;checkMode:number;toolMode:number;combined:number;combinedMode:number;statuses:string[]};modes?:number[];bad?:string}
const basic=(p:typeof fixture.profiles[number])=>({skill:5,tool:5,check:2,save:2,passive:p.expectedPassive,mode:p.expectedMode,checkMode:p.expectedMode,toolMode:p.expectedMode,combined:5,combinedMode:p.expectedCombinedMode,statuses:p.expectedStatuses});
export const conditionCases:ConditionCase[]=[
    ...fixture.profiles.map(profile=>({id:profile.id,profile,expected:basic(profile)})),
    ...fixture.sourceModes.map((row,index)=>({id:'source-mode-'+index,profile:fixture.profiles[0],modes:row.modes,expected:{...basic(fixture.profiles[0]),passive:row.expectedPassive,mode:row.expectedMode,checkMode:Number([row.modes[0],row.modes[2]].includes(1))-1,toolMode:Number(row.modes[2]===1)-1}})),
    ...fixture.proficiencyCases.map((row,index)=>({id:'proficiency-'+index,profile:{...fixture.profiles[0],skillValue:row.skill,toolValue:row.tool},expected:{...basic(fixture.profiles[0]),skill:row.expectedSkill,tool:row.expectedTool,passive:5+row.expectedSkill,combined:row.expectedCombined,combinedMode:row.expectedMode}})),
    ...fixture.modeEffects.map(row=>({id:'mode-effect-'+row.id,profile:{...fixture.profiles[0],modeEffect:row},expected:{...basic(fixture.profiles[0]),mode:row.mode,checkMode:row.mode,toolMode:row.toolMode,combinedMode:row.combinedMode,passive:15+5*row.mode}})),
    ...['type','extra-status','level','changes','effect-flag','actor-flag','dependent-guard','clock','start','item','source-status','immunity','mode','rider'].map(bad=>({id:'unqualified-'+bad,profile:fixture.profiles[0],bad})),
];
export function conditionSource(row:ConditionCase){
    const actor=skillSource(),p=row.profile,system=actor.system as any;
    system.abilities.str={value:10,proficient:0};system.abilities.dex={value:14,proficient:0};
    system.tools={thief:{value:p.toolValue??1,ability:'dex',roll:{mode:0}}};system.skills.prc.value=p.skillValue??1;
    system.traits??={};system.traits.ci={value:structuredClone(p.immunities??[])};
    const effect:any={_id:'conditionSrc001',type:'condition',name:p.name??'Not used to identify the condition',system:{type:'poisoned',conditions:p.guard??'{}'}};
    if(p.disabled!==undefined)effect.disabled=p.disabled;
    if(p.statuses!==undefined)effect.statuses=structuredClone(p.statuses);
    if(p.level!==undefined)effect.system.level=p.level;
    actor.effects=[effect];
    if(p.duplicate)actor.effects.push({...structuredClone(effect),_id:'conditionSrc002'});
    if(p.ciChange)actor.effects.push({_id:'ciChange00001',type:'base',system:{changes:[{key:'system.traits.ci.value',type:p.ciChange==='add'?'add':'subtract',value:'poisoned'}]}} as any);
    if(p.modeEffect)actor.effects.push({_id:'modeChange001',type:'base',system:{changes:[{key:'system.'+p.modeEffect.path,type:p.modeEffect.type,value:p.modeEffect.value}]}} as any);
    const modes=row.modes??[0,0,0,0];system.abilities.wis.check={roll:{mode:modes[0],modeCounts:{override:1}}};system.skills.prc.roll={mode:modes[1]};
    system.rolls={ability:Object.fromEntries(['check','save','skill','tool'].map(key=>[key,{proficiency:99,mode:key==='check'?modes[2]:key==='skill'?modes[3]:0}]))};
    system.conditions={poisoned:99,exhaustion:99};effect.system.isSuppressed=true;effect.system.hasLevels=true;effect.system.applicableType='Item';
    switch(row.bad){
        case 'type':effect.system.type='blinded';break;
        case 'extra-status':effect.statuses=['poisoned','prone'];break;
        case 'level':effect.system.level=0;break;
        case 'changes':effect.system.changes=[{key:'system.abilities.wis.value',type:'add',value:2}];break;
        case 'effect-flag':effect.flags={dnd5e:{unqualified:true}};break;
        case 'actor-flag':actor.flags={dnd5e:{originalActor:'unresolved'}};break;
        case 'dependent-guard':effect.system.conditions='{"k":"abilities.wis.value","v":14}';break;
        case 'clock':effect.duration={value:10,units:'seconds'};break;
        case 'start':effect.start={time:'malformed'};break;
        case 'item':actor.effects=[];actor.items.push({_id:'conditionItem01',type:'tool',name:'No inference',system:{equipped:true},effects:[effect]} as any);break;
        case 'source-status':(actor as any).statuses=['poisoned'];break;
        case 'immunity':system.traits.ci.value=42;break;
        case 'mode':system.abilities.wis.check.roll.mode='bad';break;
        case 'rider':effect.system.rider={statuses:['poisoned']};break;
    }
    return actor;
}
