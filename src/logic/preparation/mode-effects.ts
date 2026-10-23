/** Initialized mode counts are module-produced preparation, never source
 * overrides. Source modeCounts and prepared-looking fields are ignored. */
export interface EffectModeState {
    source:-1|0|1;override:-1|0|1|null;
    advantages:{count:number;suppressed:boolean};disadvantages:{count:number;suppressed:boolean};
}
export function initializedModeState(value:unknown):EffectModeState|null {
    if(value!==undefined&&(typeof value!=='number'||![-1,0,1].includes(value)))return null;
    return {source:(value??0) as -1|0|1,override:null,advantages:{count:0,suppressed:false},disadvantages:{count:0,suppressed:false}};
}
export function resolvedEffectMode(state:EffectModeState):-1|0|1 {
    if(state.override!==null)return state.override;
    const adv=state.advantages.suppressed?0:Math.max(0,state.advantages.count+Number(state.source===1));
    const dis=state.disadvantages.suppressed?0:Math.max(0,state.disadvantages.count+Number(state.source===-1));
    return (Math.sign(adv)-Math.sign(dis)) as -1|0|1;
}
/** Exact qualified AdvantageModeField operations, not numeric addition to mode.
 * Invalid/unqualified deltas remain unavailable rather than fabricating hooks. */
export function applyEffectMode(state:EffectModeState,type:string,delta:number):-1|0|1|null {
    if(![-1,0,1].includes(delta))return null;
    switch(type){
        case 'add':case 'subtract':
            if(delta!==0)state[delta===1?'advantages':'disadvantages'].count+=type==='add'?1:-1;
            break;
        case 'multiply':break;
        case 'override':state.override=delta as -1|0|1;break;
        case 'upgrade':
            if(delta!==0&&delta!==1)return null;
            state.disadvantages.suppressed=true;if(delta===1)state.advantages.count++;break;
        case 'downgrade':
            if(delta!==0&&delta!==-1)return null;
            state.advantages.suppressed=true;if(delta===-1)state.disadvantages.count++;break;
        default:return null;
    }
    return resolvedEffectMode(state);
}
