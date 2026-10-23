import fixture from '../../../tests/fixtures/native-6.0.6/consumption-references.json';
import {activityCommonSource,activityCommonContext} from './activity-common-scenarios';
export const referenceCases=fixture.cases,composedReferenceCases=fixture.composed,referenceContext=activityCommonContext;
export function referenceSource(row:typeof fixture.cases[number],type='tool'){
 const source=activityCommonSource({type,source:{_id:'ExactUtility',type:'utility',name:'Reference utility',consumption:{targets:[{type:row.type,target:row.target,value:'1'}]}},item:{magic:false,attunement:'required'}},true),gear=source.items.at(-1)as any;gear.system.identifier='activity-source';
 source.items=source.items.filter(item=>item.type==='class'||item._id==='ActivityGear');
 for(const item of source.items)if(item.type==='class')(item.system as any).identifier??='fighter';
 for(const raw of row.items)source.items.push({_id:raw.id,type:raw.type,name:raw.id,_stats:{compendiumSource:(raw as any).stats??null},flags:{dnd5e:{sourceId:(raw as any).flag}},system:{identifier:raw.identifier,type:{value:raw.type==='weapon'?'simpleM':''},equipped:false,attuned:false,attunement:'',properties:[],quantity:1,weight:{value:0,units:'lb'},uses:{max:'3',spent:1,recovery:[]},activities:{},...(raw.type==='weapon'?{range:{value:0,long:0,reach:0,units:'ft'}}:{})},effects:[]}as any);
 return source;
}
