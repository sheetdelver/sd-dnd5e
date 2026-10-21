import {TRAINING_606} from '../native/6.0.6/training-identities';

type LanguageNode=string|{selectable?:boolean;children?:Readonly<Record<string,LanguageNode>>};
function languageKeys(tree:Readonly<Record<string,LanguageNode>>,keys:string[]=[]):string[]{
    for(const [key,node] of Object.entries(tree)){
        if(typeof node==='string'||node.selectable!==false)keys.push(key);
        if(typeof node!=='string'&&node.children)languageKeys(node.children,keys);
    }
    return keys;
}
/** Pinned identity vocabulary, not an owned/caller content cache. StringField
 * accepts wider IDs natively; effects outside these qualified identities stay
 * unavailable rather than guessing grants or copying a private Item index. */
const fields:Readonly<Record<string,ReadonlySet<string>>>={
    'armorProf.value':new Set([...Object.keys(TRAINING_606.armor),...Object.keys(TRAINING_606.armorReferences)]),
    'weaponProf.value':new Set([...Object.keys(TRAINING_606.weapons),...Object.keys(TRAINING_606.weaponReferences)]),
    'languages.value':new Set(['ALL',...languageKeys(TRAINING_606.languages)]),
    'weaponProf.mastery.value':new Set(Object.keys(TRAINING_606.weaponReferences)),
    'weaponProf.mastery.bonus':new Set(Object.keys(TRAINING_606.mastery)),
};
export function trainingSetField606(path:string):((value:string)=>boolean)|null {
    const values=Object.hasOwn(fields,path)?fields[path]:null;
    return values?value=>values.has(value):null;
}
