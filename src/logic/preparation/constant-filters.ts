import {record} from '../native/6.0.6/source';
export interface ConstantFilter {status:'ready';origin:'default'|'source';definition:string;matches:boolean}
export type ConstantFilterResult=ConstantFilter|{status:'unavailable';reason:string};
/** Only snapshot-invariant native boolean filters. This is not a roll evaluator
 * or a replacement-data model. Validate every branch before applying boolean
 * logic: short-circuiting must never hide an unqualified property comparison. */
export function constantFilter606(raw:unknown):ConstantFilterResult {
    const definition=raw===undefined?'{}':raw;
    const unavailable:ConstantFilterResult={status:'unavailable',reason:'Filter requires Q02a snapshot/definition qualification'};
    if(typeof definition!=='string'||definition.length>8192)return unavailable;
    let tree:unknown;try{tree=JSON.parse(definition);}catch{return unavailable;}
    let count=0;
    function node(value:unknown,depth:number):boolean|null {
        if(++count>256||depth>16)return null;
        const data=record(value);
        if(!data||Object.keys(data).some(key=>key!=='o'&&key!=='v')||!Object.hasOwn(data,'o')||!Object.hasOwn(data,'v')||typeof data.o!=='string')return null;
        if(data.o==='NOT'){const child=node(data.v,depth+1);return child===null?null:!child;}
        if(!['AND','NAND','OR','NOR','XOR'].includes(data.o)||!Array.isArray(data.v))return null;
        const children=data.v.map(child=>node(child,depth+1));
        if(children.some(child=>child===null))return null;
        switch(data.o){
            case 'AND':return children.every(Boolean);
            case 'NAND':return !children.every(Boolean);
            case 'OR':return children.some(Boolean);
            case 'NOR':return !children.some(Boolean);
            case 'XOR':return children.filter(Boolean).length%2===1;
            default:return null;
        }
    }
    const root=record(tree);
    let matches:boolean|null;
    if(Array.isArray(tree)){
        const values=tree.map(value=>node(value,0));matches=values.some(value=>value===null)?null:values.every(Boolean);
    }else if(root&&Object.keys(root).length===0)matches=true;
    else matches=node(tree,0);
    return matches===null?unavailable:{status:'ready',origin:raw===undefined?'default':'source',definition,matches};
}
