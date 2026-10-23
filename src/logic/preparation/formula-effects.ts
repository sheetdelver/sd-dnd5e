/** Native FormulaField expression composition,not NumberField arithmetic. In
 * particular add deliberately retains native unparenthesized signed text.
 * References remain unresolved until the consuming prepared/current roll phase.
 * Multiplication uses explicit grouping,semantically equivalent within the
 * qualified deterministic grammar;no dice AST/evaluator is introduced. */
export function composeFormulaEffect606(before:unknown,raw:unknown,type:string):string|null {
 if(before!==undefined&&typeof before!=='string'&&typeof before!=='number'||typeof before==='number'&&!Number.isFinite(before)||typeof raw!=='string'&&typeof raw!=='number'||typeof raw==='number'&&!Number.isFinite(raw))return null;
 const value=before===undefined?'':String(before).trim(),delta=String(raw).trim();if(!delta||value.length>1024||delta.length>1024)return null;
 let expression:string;
 switch(type){case'override':expression=delta;break;case'add':expression=value?`${value} ${delta.startsWith('-')?'-':'+'} ${delta.replace(/^[+-]/,'').trim()}`:delta;break;case'subtract':expression=value?`${value} - (${delta})`:`-(${delta})`;break;case'multiply':expression=value?`(${value}) * (${delta})`:value;break;case'upgrade':expression=value?`max(${value}, ${delta})`:delta;break;case'downgrade':expression=value?`min(${value}, ${delta})`:delta;break;default:return null;}
 return expression.length<=1024?expression:null;
}
export const checkBonusPath606=(key:string):boolean=>/^system\.(?:rolls\.ability\.(?:check|save|skill|tool)\.bonus|abilities\.(?:str|dex|con|int|wis|cha)\.(?:check|save)\.roll\.bonus|(?:skills|tools)\.[^.]+\.roll\.bonus|attributes\.init\.roll\.bonus|skills\.[^.]+\.bonuses\.passive)$/.test(key);
