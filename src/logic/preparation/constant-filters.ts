import type {ClassSource606} from './class-initialization';
import {record} from '../native/6.0.6/source';
export type InitialFilterRead = {key:string;value:number;origin:'class-base-preparation';classSources:ClassSource606[]}
    | {key:string;value:number;origin:'source'|'schema-default'|'nonpersisted-schema-default'}
    | {key:string;kind:'set';value:string[];sourceValue:string[]|null|'[absent]';origin:'schema-initialized-source'|'schema-default'};
export type RuleFilterRead606=InitialFilterRead|{key:string;kind:'scalar';value:string|boolean|null|undefined;origin:'configured-roll'};
export interface ConstantFilter {status:'ready';origin:'default'|'source';definition:string;matches:boolean;phase?:'initial'|'configured-roll'|'mixed';reads?:RuleFilterRead606[]}
export type ConstantFilterResult=ConstantFilter|{status:'unavailable';reason:string};
/** Native predicates over explicitly qualified scalar/Set snapshots. This is
 * not a roll evaluator or replacement-data model. Validate every branch before applying boolean
 * logic: short-circuiting must never hide an unqualified property comparison. */
export function constantFilter606(raw:unknown):ConstantFilterResult {return filter606(raw);}
export function initialFieldFilter606(raw:unknown,read:(key:string)=>InitialFilterRead|null):ConstantFilterResult {return filter606(raw,read);}
export function ruleFilter606(raw:unknown,read:(key:string)=>RuleFilterRead606|null):ConstantFilterResult {return filter606(raw,read);}
function filter606(raw:unknown,read?:(key:string)=>RuleFilterRead606|null):ConstantFilterResult {
    const definition=raw===undefined?'{}':raw;
    const unavailable:ConstantFilterResult={status:'unavailable',reason:'Filter requires Q02a snapshot/definition qualification'};
    if(typeof definition!=='string'||definition.length>8192)return unavailable;
    let tree:unknown;try{tree=JSON.parse(definition);}catch{return unavailable;}
    let count=0;const reads:RuleFilterRead606[]=[];
    function node(value:unknown,depth:number):boolean|null {
        if(++count>256||depth>16)return null;
        const data=record(value);
        if(data&&Object.hasOwn(data,'k')){
            if(!read||Object.keys(data).some(key=>!['k','v','o'].includes(key))||typeof data.k!=='string'||!Object.hasOwn(data,'v'))return null;
            const operation=data.o===undefined?'exact':data.o;
            if(typeof operation!=='string')return null;
            const input=read(data.k),literal=data.v;if(!input)return null;
            if('kind'in input&&input.kind==='set'){
                const members=new Set(input.value);let matches:boolean;
                if(operation==='has'){
                    if(typeof literal!=='string'||literal.length>256)return null;
                    matches=members.has(literal);
                }else if(['hasany','hasall','subsetof'].includes(operation)){
                    if(!Array.isArray(literal)||literal.length>256||literal.some(value=>typeof value!=='string'||value.length>256))return null;
                    if(operation==='hasany')matches=literal.some(value=>members.has(value));
                    else if(operation==='hasall')matches=literal.every(value=>members.has(value));
                    else {const allowed=new Set(literal);matches=input.value.every(value=>allowed.has(value));}
                }else if(operation==='empty'){
                    if(typeof literal!=='boolean')return null;
                    matches=(members.size===0)===literal;
                }else return null;
                reads.push(input);return matches;
            }
            const primitive=(value:unknown)=>value==null||['string','boolean'].includes(typeof value)||typeof value==='number'&&Number.isFinite(value);
            if(['contains','startswith','endswith'].includes(operation)){
                if(!primitive(input.value)||!primitive(literal)||String(literal).length>256)return null;
                const data=String(input.value),value=String(literal),matches=operation==='contains'?data.includes(value):operation==='startswith'?data.startsWith(value):data.endsWith(value);
                reads.push(input);return matches;
            }
            if(operation==='in'){
                if(!primitive(input.value)||!Array.isArray(literal)||literal.length>256||literal.some(value=>!primitive(value)||typeof value==='string'&&value.length>256))return null;
                reads.push(input);return literal.includes(input.value);
            }
            if('kind'in input&&input.kind==='scalar'){if(operation!=='exact'||literal!==null&&!['string','boolean','number'].includes(typeof literal))return null;reads.push(input);return input.value===literal;}
            if(!['exact','gt','gte','lt','lte'].includes(operation)||typeof input.value!=='number'
                ||literal!==null&&!['string','boolean','number'].includes(typeof literal)||typeof literal==='number'&&!Number.isFinite(literal))return null;
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
    const configured=reads.some(read=>read.origin==='configured-roll'),initial=reads.some(read=>read.origin!=='configured-roll');
    const phase=configured?initial?'mixed' as const:'configured-roll' as const:'initial' as const;
    return matches===null?unavailable:{status:'ready',origin:raw===undefined?'default':'source',definition,matches,...(reads.length?{phase,reads}:{})};
}
