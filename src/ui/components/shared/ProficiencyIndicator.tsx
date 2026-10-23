import React from 'react';
import {unavailableTitle} from './PreparationDiagnostics';

const displays:Readonly<Record<string,{glyph:string;description:string;color:string}>>={
    '0':{glyph:'○',description:'No proficiency (0×)',color:'var(--prof-none)'},
    '0.5':{glyph:'◐',description:'Half proficiency (0.5×)',color:'var(--prof-half)'},
    '1':{glyph:'●',description:'Proficient (1×)',color:'var(--prof-full)'},
    '1.5':{glyph:'1½×',description:'One and a half proficiency (1.5×)',color:'var(--prof-full)'},
    '2':{glyph:'◉',description:'Double proficiency (2×)',color:'var(--prof-expert)'},
};
/** Formats an already-prepared roll coefficient. It does not infer training,
 * calculate a bonus, choose a rule profile or change execution readiness. */
export default function ProficiencyIndicator({value,label,reason}:{value:number|null|undefined;label:string;reason?:string}) {
    const display=typeof value==='number'?displays[String(value)]:undefined;
    return <span aria-label={label} data-proficiency={display?String(value):'unavailable'}
        title={display?.description??unavailableTitle(reason??'Prepared roll proficiency unavailable')}
        style={{fontSize:value===1.5?'10px':'inherit',color:display?.color??'var(--text-muted)'}}>
        {display?.glyph??'—'}
    </span>;
}
