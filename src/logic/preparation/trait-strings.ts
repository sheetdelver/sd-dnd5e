/** Plain SimpleTraitField.custom StringField semantics, not FormulaField.
 * Source/default initialization and literal phase operations are separate. */
export function customTraitPath606(path:string):boolean {
    return /^system\.traits\.(dr|di|dv|ci|armorProf|weaponProf|languages)\.custom$/.test(path);
}
export function initializeCustomString606(value:unknown):string|null {
    return value===undefined?'':typeof value==='string'?value.trim():null;
}
export function applyCustomString606(before:string,type:string,delta:unknown):string|null {
    if(typeof delta!=='string'||delta.includes('@'))return null;
    switch(type){
        case 'add':return (before+delta).trim();
        case 'subtract':return before.replace(delta,'').trim();
        case 'override':return delta.trim();
        case 'upgrade':case 'downgrade':case 'multiply':return before;
        default:return null;
    }
}
