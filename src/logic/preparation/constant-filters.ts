import {record} from '../native/6.0.6/source';
export interface InitialFilterRead {key:string;value:number;origin:'source'|'schema-default'|'nonpersisted-schema-default'}
export interface ConstantFilter {status:'ready';origin:'default'|'source';definition:string;matches:boolean;phase?:'initial';reads?:InitialFilterRead[]}
export type ConstantFilterResult=ConstantFilter|{status:'unavailable';reason:string};
/** Only snapshot-invariant native boolean filters. This is not a roll evaluator
 * or a replacement-data model. Validate every branch before applying boolean
 * logic: short-circuiting must never hide an unqualified property comparison. */
export function constantFilter606(raw:unknown):ConstantFilterResult {return filter606(raw);}
export function numericInitialFilter606(raw:unknown,read:(key:string)=>InitialFilterRead|null):ConstantFilterResult {return filter606(raw,read);}
function filter606(raw:unknown,read?:(key:string)=>InitialFilterRead|null):ConstantFilterResult {
    const definition=raw===undefined?'{}':raw;
    const unavailable:ConstantFilterResult={status:'unavailable',reason:'Filter requires Q02a snapshot/definition qualification'};
    if(typeof definition!=='string'||definition.length>8192)return unavailable;
    let tree:unknown;try{tree=JSON.parse(definition);}catch{return unavailable;}
    let count=0;const reads:InitialFilterRead[]=[];
    function node(value:unknown,depth:number):boolean|null {
        if(++count>256||depth>16)return null;
        const data=record(value);
        if(data&&Object.hasOwn(data,'k')){
            if(!read||Object.keys(data).some(key=>!['k','v','o'].includes(key))||typeof data.k!=='string'||!Object.hasOwn(data,'v'))return null;
            const operation=data.o===undefined?'exact':data.o;
            if(typeof operation!=='string'||!['exact','gt','gte','lt','lte'].includes(operation))return null;
            const input=read(data.k),literal=data.v;
            if(!input||literal!==null&&!['string','boolean','number'].includes(typeof literal)||typeof literal==='number'&&!Number.isFinite(literal))return null;
            if(operation!=='exact'&&typeof literal!=='number')return null;
            reads.push(input);
            if(operation==='exact')return input.value===literal;
            if(typeof literal!=='number')return null;
            switch(operation){case 'gt':return input.value>literal;case 'gte':return input.value>=literal;case 'lt':return input.value<literal;case 'lte':return input.value<=literal;default:return null;}
        }
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
    return matches===null?unavailable:{status:'ready',origin:raw===undefined?'default':'source',definition,matches,...(reads.length?{phase:'initial' as const,reads}:{})};
}
