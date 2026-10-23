import fixture from '../../../tests/fixtures/native-6.0.6/activity-common.json';
import {skillSource,skillContext} from './skill-scenarios';
export const activityCommonCases=fixture.cases,activityTransferredCases=fixture.transferred,activityCommonContext=skillContext;
export function activityCommonSource(row:{source:Record<string,unknown>;item:{magic:boolean;attunement:string};parentRange?:unknown;type?:string},transfer=false){
 const source=skillSource(),type=row.type??(row.parentRange?'weapon':'tool');
 source.items.push({_id:'ActivityGear',type,name:'Activity phase gear',system:{type:{value:type==='weapon'?'simpleM':type==='equipment'?'wondrous':'',baseItem:''},equipped:true,attuned:true,attunement:row.item.attunement,identified:true,properties:row.item.magic?['mgc']:[],quantity:1,weight:{value:0,units:'lb'},uses:{max:'3',spent:1,recovery:[]},activities:{ExactUtility:structuredClone(row.source)},...(type==='weapon'?{range:row.parentRange??{value:0,long:0,reach:0,units:'ft'}}:{})},effects:transfer?[{_id:'ActivityTransfer',type:'base',transfer:true,system:{changes:[{key:'system.attributes.prof',type:'add',value:1,phase:'final'}]}}]:[]}as any);return source;
}
