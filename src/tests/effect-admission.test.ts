import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {planEffects606} from '../logic/preparation/effects';
import {skillSource,skillContext} from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter();
// Independent S expectations are actual pinned Base/Enchantment applicability,
// Actor/Item collection and permanent duration preparation;see native-effect-admission-oracle.
let count=0;
for(const own of [false,true])for(const type of ['base','enchantment'])for(const transfer of [false,true])for(const expired of [false,true])for(const metadata of [{},{sourceId:'Compendium.dnd5e.feats24.Item.ExactOrigin',advancementOrigin:'Actor.exact.Item.class.advancement',advancementRoot:'Actor.exact.Item.class'},{riders:{effect:[],statuses:[]}}]){
 const source=skillSource(),effect={_id:'ExactEffect',type,transfer,start:{combat:null,combatant:null,initiative:null,round:null,turn:null,time:0},duration:{value:null,units:'seconds',expiry:null,expired},system:{changes:[{key:'system.abilities.wis.value',type:'add',value:4}]}};
 if(own)source.effects=[effect as any];else source.items.push({_id:'ExactItem',type:'feat',system:{},flags:{dnd5e:metadata},effects:[effect]}as any);
 const before=structuredClone(source),actor=adapter.prepareActorData(source,skillContext()),formula=adapter.getRollData(actor,'skill','prc')?.formula??null;
 const itemEnchantment=!own&&type==='enchantment'&&transfer,applies=type==='base'&&(own||transfer);
 assert.equal(formula,itemEnchantment?null:applies?'1d20+7':'1d20+5',JSON.stringify({own,type,transfer,expired,metadata}));assert.deepEqual(source,before);count++;
}
for(const transfer of [false,true]){const source=skillSource();source.items.push({_id:'RiderItem',type:'feat',system:{},flags:{dnd5e:{riders:{effect:['RiderEffect']}}},effects:[{_id:'RiderEffect',type:'base',transfer,system:{changes:[{key:'system.abilities.wis.value',value:4}]}}]}as any);assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,'1d20+5');assert.equal(planEffects606(source).decisions.at(-1)?.status,transfer?'rider-template':'stored-template');count++;}
for(const mutate of [(e:any)=>e.duration.value=1,(e:any)=>e.duration.expiry='turnStart',(e:any)=>e.flags={dnd5e:{isTemporary:true}},(e:any)=>e.start={time:'not-a-number'},(e:any)=>e.duration.expired='false']){const source=skillSource(),effect={_id:'Timed',start:{time:0},duration:{value:null,expiry:null,expired:false},system:{changes:[{key:'system.abilities.wis.value',value:4}]}};mutate(effect);source.effects=[effect as any];assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc'),null);count++;}
{const source=skillSource();source.effects=[{_id:'PermanentCondition',type:'condition',statuses:['poisoned'],start:{time:1},duration:{value:null,expired:true},system:{type:'poisoned'}}as any];assert.equal(adapter.getRollData(adapter.prepareActorData(source,skillContext()),'skill','prc')?.formula,'2d20kl1+5');count++;}
for(const phase of ['initial','final']){const source=skillSource();source.effects=[{_id:'Build',system:{changes:[{key:'flags.dnd5e.powerfulBuild',type:'override',value:true,phase}]}}as any];const d=adapter.prepareActorData(source,skillContext()).derived as any;assert.equal(d.physical.encumbrance.value.max,phase==='initial'?300:150);count++;}
process.stdout.write('R:'+count+' source applicability/permanent duration/rider/metadata/flag physical phase profiles PASS\n');
