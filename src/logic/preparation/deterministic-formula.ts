import {numericConstant} from './numeric';
export type FormulaBindings606=Readonly<Record<string,number>>;
const functions:Readonly<Record<string,{min:number;max:number;run:(...values:number[])=>number}>>={
    floor:{min:1,max:1,run:Math.floor},ceil:{min:1,max:1,run:Math.ceil},
    round:{min:1,max:1,run:Math.round},abs:{min:1,max:1,run:Math.abs},
    min:{min:1,max:16,run:Math.min},max:{min:1,max:16,run:Math.max},
};
const precedence:Readonly<Record<string,number>>={'+':10,'-':10,'*':20,'/':20,'%':20};
/** Pure deterministic rule arithmetic only. No dice grammar, entropy, eval,
 * dynamic functions, implicit missing-reference zero or source object traversal.
 * Bindings must come from the qualified preparation phase, never caller input. */
export function deterministicFormula606(input:unknown,bindings:FormulaBindings606={}):number|null {
    const literal=numericConstant(input);
    if(literal!==null)return Math.abs(literal)<=1e9?literal:null;
    if(typeof input!=='string'||input.length>1024)return null;
    if(!input.trim())return 0;
    const tokens:string[]=[];let position=0;
    while(position<input.length){
        const match=/^(?:\s+|\d+(?:\.\d+)?|@[a-zA-Z][a-zA-Z0-9_.-]*|[a-zA-Z]+|[()+*/%,\-])/.exec(input.slice(position));
        // Plus is kept separate because it also begins numeric source literals.
        const token=match?.[0]??(input[position]==='+'?'+':null);
        if(token===null||tokens.length>=256)return null;
        position+=token.length;if(token.trim())tokens.push(token);
    }
    let cursor=0,depth=0;
    function expression(minimum=0):number {
        if(++depth>32)throw Error('Formula nesting outside qualified profile');
        const token=tokens[cursor++];let value:number;
        if(token==='+'||token==='-')value=(token==='-'?-1:1)*expression(30);
        else if(token==='('){value=expression();if(tokens[cursor++]!==')')throw Error('Missing closing parenthesis');}
        else if(token?.startsWith('@')){
            const key=token.slice(1);
            if(!Object.hasOwn(bindings,key)||typeof bindings[key]!=='number'||!Number.isFinite(bindings[key]))throw Error('Reference unavailable');
            value=bindings[key];
        }else if(token&&/^\d/.test(token))value=Number(token);
        else if(token&&Object.hasOwn(functions,token)){
            if(tokens[cursor++]!=='(')throw Error('Function arguments missing');
            const args:number[]=[];
            if(tokens[cursor]!==')')do{args.push(expression());if(tokens[cursor]!==',')break;cursor++;}while(args.length<17);
            if(tokens[cursor++]!==')')throw Error('Function arguments malformed');
            const f=functions[token];if(args.length<f.min||args.length>f.max)throw Error('Function arity unavailable');
            value=f.run(...args);
        }else throw Error('Formula term outside qualified profile');
        while(Object.hasOwn(precedence,tokens[cursor])&&precedence[tokens[cursor]]>=minimum){
            const operator=tokens[cursor++],right=expression(precedence[operator]+1);
            switch(operator){case '+':value+=right;break;case '-':value-=right;break;case '*':value*=right;break;case '/':value/=right;break;case '%':value%=right;break;}
        }
        depth--;return value;
    }
    try{const value=expression();return cursor===tokens.length&&Number.isFinite(value)&&Math.abs(value)<=1e9?value:null;}catch{return null;}
}
/** Exact numeric d20 folding profile: bounded dyadic bonuses keep grouping
 * independent of dice addition. Other fractional expressions stay unqualified. */
export function qualifiedFormulaBonus606(value:number):boolean{return Number.isInteger(value*1024);}

export function formulaUnavailableReason606(input:unknown,bindings:FormulaBindings606={}):string {const refs=typeof input==='string'?input.match(/@[a-zA-Z][a-zA-Z0-9_.-]*/g)??[]:[],missing=[...new Set(refs)].filter(ref=>!Object.hasOwn(bindings,ref.slice(1)));return missing.length?'Rule reference unavailable: '+missing.join(', '):'Formula expression outside qualified deterministic profile';}
