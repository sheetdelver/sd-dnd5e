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
