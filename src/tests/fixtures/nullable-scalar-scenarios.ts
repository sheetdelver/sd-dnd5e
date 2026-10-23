import fixture from '../../../tests/fixtures/native-6.0.6/nullable-scalars.json';
import {scalarSource,scalarCases,scalarContext} from './scalar-effect-scenarios';
export const nullableScalarCases=fixture.numberRows,zeroScalarCases=fixture.zeroRows;
export const nullableScalarContext=scalarContext;
export function nullableScalarSource(row:{path:string;source?:string;phase?:string;type:string;delta:number|string;prefix?:string}){
 const source=scalarSource(scalarCases[0]),s=source.system as any;s.attributes.ac={};source.effects=[];
 const [,group,key]=row.path.split('.');
 if(row.source==='missing-parent')delete s.attributes[group];
 else if(row.source==='null'){s.attributes[group]??={};s.attributes[group][key]=null;}
 else if(row.source==='missing-leaf')delete s.attributes[group]?.[key];
 source.effects=[{_id:'NullableScalar',type:'base',system:{changes:[...(row.prefix!==undefined?[{key:'system.'+row.path,type:'override',value:row.prefix,phase:'final',priority:0}]:[]),{key:'system.'+row.path,type:row.type,value:row.delta,phase:row.phase??'final'}]}}as any];return source;
}
