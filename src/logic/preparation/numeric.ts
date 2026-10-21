/** Qualified constant part of native simplifyBonus. Never evaluates expressions. */
export function numericConstant(input: unknown): number | null {
    if (input === undefined || input === null || input === '') return 0;
    if (typeof input === 'number') return Number.isFinite(input) ? input : null;
    if (typeof input === 'string' && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(input.trim())) {
        const value = Number(input); return Number.isFinite(value) ? value : null;
    }
    return null;
}
export function qualifiedNumericTotal(value: number): boolean {
    return Number.isFinite(value) && /^-?\d+(?:\.\d+)?$/.test(String(value));
}
/** Common initialized ability score/modifier qualification, independent of
 * unrelated check execution gates such as equipped armor or encumbrance. */
export function numericAbilityValue(value:unknown):{score:number;mod:number}|null {
    return typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=30?{score:value,mod:Math.floor((value-10)/2)}:null;
}
