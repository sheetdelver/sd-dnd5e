/** Verified StringField cleaning followed by Set initialization, represented by
 * an ordered array in detached module operands. Never changes source arrays. */
export function initializeTraitSet606(raw:unknown):string[]|null {
    if(raw==null)return [];
    if(!Array.isArray(raw)||raw.some(value=>typeof value!=='string'))return null;
    return [...new Set(raw.map(value=>value.trim()))];
}

/** Exact bounded ArrayField/SetField literal delta profile. Parse JSON before
 * element casting; compare untrimmed deltas for set operations, then clean the
 * result. In particular subtract/upgrade MUST NOT trim before comparing. */
export function applyTraitSet606(before:string[],type:string,raw:unknown,valid:(value:string)=>boolean):{value:string[];delta:string[]}|null {
    if(typeof raw!=='string'||raw.includes('@')||before.some(value=>!valid(value)))return null;
    let parsed:unknown;
    try {parsed=JSON.parse(raw);}catch {parsed=raw;}
    const values=Array.isArray(parsed)?parsed:[parsed];
    if(values.some(value=>typeof value!=='string'||!valid(value.trim())))return null;
    const delta=[...new Set(values as string[])],base=new Set(before),operand=new Set(delta);
    let result:string[];
    switch(type){
        case 'add':result=[...new Set([...before,...delta])];break;
        case 'subtract':result=before.filter(value=>!operand.has(value));break;
        case 'override':result=delta;break;
        case 'upgrade':result=before.every(value=>operand.has(value))?delta:before;break;
        case 'downgrade':result=delta.every(value=>base.has(value))?delta:before;break;
        case 'multiply':result=before;break; // Native DataField no-op, not intersection.
        default:return null;
    }
    const value=initializeTraitSet606(result)!;
    return value.every(valid)?{value,delta}:null;
}
