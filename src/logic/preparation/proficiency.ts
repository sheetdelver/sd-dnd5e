/** Qualified 6.0.6 coefficient arithmetic. Inputs are initialized operands, never
 * source prof/effectValue objects. Modern Jack is explicit; other flags/legacy rules remain caller gates. */
export type ProficiencyKind='skill'|'tool';
export type ProficiencyTargets=Readonly<Record<'check'|ProficiencyKind,unknown>>;
export function sourceCheckCoefficient606(value:unknown):number|null {
    return typeof value==='number'&&[0,.5,1,1.5,2].includes(value)?value:null;
}
export function checkProficiency606(primary:unknown,secondary:unknown,types:readonly ProficiencyKind[],targets:ProficiencyTargets,jackOfAllTrades=false,toolExpertise=false):number|null {
    const a=sourceCheckCoefficient606(primary),b=secondary===undefined?0:sourceCheckCoefficient606(secondary);
    const globals=[targets.check,...types.map(type=>targets[type])];
    if(a===null||b===null||globals.some(value=>typeof value!=='number'||![0,.5,1,2].includes(value)))return null;
    // Native calculateToolProficiency applies expertise to exactly1 before
    // calculateAbilityCheckProficiency sees check/skill target fields.
    const toolBase=Math.max(a,b,...(types.includes('tool')?[targets.tool as number]:[]));
    if(types.includes('tool')&&toolExpertise&&toolBase===1)return 2;
    const coefficient=Math.max(toolBase,...globals as number[]);
    return jackOfAllTrades&&types.includes('skill')&&coefficient<1?.5:coefficient;
}
export function saveProficiency606(source:unknown,global:unknown):number|null {
    return (source===0||source===1)&&(global===0||global===1)?Math.max(source,global):null;
}
