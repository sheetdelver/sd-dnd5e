import fixture from '../../../tests/fixtures/native-6.0.6/equippable-final.json';
import {skillSource,skillContext} from './skill-scenarios';
export const equippableFinalCases=fixture.cases;
export const equippableFinalContext=skillContext;
export function equippableFinalSource(row:typeof fixture.cases[number]){const source=skillSource(),s=source.system as any;s.attributes.attunement={max:3,value:99};source.items.push({_id:'ExactGear',type:row.type,name:'Exact phase gear',system:{...structuredClone(row.source),type:{value:row.type==='weapon'?'simpleM':row.type==='equipment'?'wondrous':'',baseItem:''},...(row.type==='container'?{}:{activities:{},uses:{max:'',spent:0,recovery:[]}}),...(row.type==='weapon'?{range:{value:0,long:0,reach:0,units:'ft'}}:{}),quantity:1,weight:{value:0,units:'lb'}},effects:[{_id:'FinalGear',type:'base',transfer:true,disabled:false,system:{changes:[{key:'system.attributes.prof',value:1,type:'add',phase:row.phase}]}}]}as any);return source;}
