/** Native Proficiency.dice for the qualified character positive-integer base/profile;execution qualification stays separate.
 * Terms are compiled for the public roll runtime;no random evaluation here. */
export function proficiencyDiceTerm606(base:number,coefficient:number):string|null {
    if(!Number.isInteger(base)||base<1||base>1e9||![0,.5,1,1.5,2].includes(coefficient))return null;
    if(coefficient===0)return null;
    if(coefficient===.5)return `floor(1d${base*2} / 2)`;
    return `${coefficient}d${base*2}`;
}
export function qualifiedProficiencyTerm606(term:string):boolean{return /^(?:[12]d(?:2|4|6|8|10|12)|floor\(1d(?:2|4|6|8|10|12) \/ 2\))$/.test(term);}
