import { record } from '../native/6.0.6/source';
import type { RulesContext } from '../rules-context';
import { initializedAbilityRolls606 } from './roll-initialization';
import { numericCharacterProfile, numericConstant, qualifiedNumericTotal } from './character-profile';
import { d20RangeReason, numericD20ExecutionReason, numericD20Formula, sourceD20Mode, type PreparedNumericD20 } from './d20-configuration';

/** Rule identities from release-6.0.6 CONFIG.tools / vehicleTypes. These are
 * Actor mapping keys, never Item name matching, content lookup or grants. */
export const TOOL_LABELS_606: Readonly<Record<string, string>> = {
    alchemist: "Alchemist's supplies", bagpipes: 'Bagpipes', brewer: "Brewer's supplies",
    calligrapher: "Calligrapher's supplies", card: 'Playing cards', carpenter: "Carpenter's tools",
    cartographer: "Cartographer's tools", chess: 'Dragonchess', cobbler: "Cobbler's tools",
    cook: "Cook's utensils", dice: 'Dice', disg: 'Disguise kit', drum: 'Drum', dulcimer: 'Dulcimer',
    flute: 'Flute', forg: 'Forgery kit', glassblower: "Glassblower's tools", herb: 'Herbalism kit',
    horn: 'Horn', jeweler: "Jeweler's tools", leatherworker: "Leatherworker's tools", lute: 'Lute', lyre: 'Lyre',
    mason: "Mason's tools", navg: "Navigator's tools", painter: "Painter's supplies", panflute: 'Pan flute',
    pois: "Poisoner's kit", potter: "Potter's tools", shawm: 'Shawm', smith: "Smith's tools",
    thief: "Thieves' tools", tinker: "Tinker's tools", viol: 'Viol', weaver: "Weaver's tools", woodcarver: "Woodcarver's tools",
    air: 'Air vehicles', land: 'Land vehicles', space: 'Space vehicles', water: 'Water vehicles',
};
export interface PreparedTool extends PreparedNumericD20 {
    key: string; label: string; prof: number | null; provenance: string;
}
export function toolRollScopes(actor: unknown, key: string, ability: string) {
    const system = record(record(actor)?.system), global = record(record(system?.rolls)?.ability);
    return [
        {path:`tools.${key}.roll`,value:record(record(system?.tools)?.[key])?.roll},
        {path:`abilities.${ability}.check.roll`,value:record(record(record(system?.abilities)?.[ability])?.check)?.roll},
        {path:'rolls.ability.check',value:global?.check},
        {path:'rolls.ability.tool',value:global?.tool},
    ];
}
const provenance = 'release-6.0.6 CreatureTemplate tool schema / prepareTools; source-only independent check';
/** Explicit initialized defaults: ability=int, value=0. Ignore nonpersisted
 * bonuses and prepared-looking mod/total/prof/effectValue. No source mutation.
 * AppliedRules and flags remain gated by the shared character profile. */
export function prepareNumericTools606(actor: unknown, context: RulesContext): {
    checks: Record<string, PreparedTool>; status: 'ready' | 'unavailable'; reason?: string;
} {
    const system = record(record(actor)?.system) ?? {}, raw = system.tools;
    const tools = record(raw), abilities = record(system.abilities) ?? {}, rolls = initializedAbilityRolls606(actor);
    const profile = numericCharacterProfile(actor,context);
    const collectionReason = raw !== undefined && !tools ? 'Tool source mapping malformed' : profile.status !== 'ready' ? profile.reason : undefined;
    const checks: Record<string, PreparedTool> = Object.create(null);
    for (const [key, value] of Object.entries(tools ?? {})) {
        const tool = record(value), ability = tool?.ability === undefined ? 'int' : typeof tool.ability === 'string' ? tool.ability : '';
        const multiplier = tool?.value === undefined ? 0 : tool.value;
        let reason = collectionReason;
        const abilityCheck = record(abilities[ability])?.check;
        if ([system.rolls,record(system.rolls)?.ability,abilityCheck].some(value => value != null && !record(value))) reason ??= 'Tool roll source container malformed';
        if (!tool) reason ??= 'Tool source entry malformed';
        if (!Object.hasOwn(TOOL_LABELS_606,key)) reason ??= 'Tool identity is outside the qualified native configuration';
        if (!['str','dex','con','int','wis','cha'].includes(ability)) reason ??= 'Tool ability is outside the qualified profile';
        const score = record(abilities[ability])?.value;
        if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 30) reason ??= 'Tool ability source score unavailable';
        if (typeof multiplier !== 'number' || ![0,.5,1,1.5,2].includes(multiplier)) reason ??= 'Tool proficiency source unavailable';
        const scopes = toolRollScopes(actor,key,ability), mode = sourceD20Mode(scopes);
        if (mode.reason) reason ??= mode.reason;
        const bonuses = [record(tool?.roll)?.bonus, record(record(record(abilities[ability])?.check)?.roll)?.bonus, rolls.check.bonus, rolls.tool.bonus].map(numericConstant);
        if (bonuses.some(bonus => bonus === null)) reason ??= 'Tool formula requires Q00 qualification';
        const base = {key,label:Object.hasOwn(TOOL_LABELS_606,key) ? TOOL_LABELS_606[key] : key,ability,provenance};
        if (reason || profile.status !== 'ready' || mode.mode === undefined) {
            checks[key] = {...base,prof:null,total:null,formula:null,unavailableReason:reason ?? 'Tool preparation unavailable'};
            continue;
        }
        const total = Math.floor(((score as number)-10)/2) + Math.floor((multiplier as number)*profile.proficiency) + (bonuses as number[]).reduce((a,b)=>a+b,0);
        if (!qualifiedNumericTotal(total)) {
            checks[key] = {...base,prof:multiplier as number,total:null,formula:null,unavailableReason:'Numeric tool result outside qualified roll representation'};
            continue;
        }
        const unavailableReason = d20RangeReason(scopes) ?? numericD20ExecutionReason(total,mode.mode);
        checks[key] = {...base,prof:multiplier as number,total,sourceMode:mode.mode,formula:unavailableReason ? null : numericD20Formula(total,mode.mode),...(unavailableReason ? {unavailableReason} : {})};
    }
    return {checks,status:collectionReason ? 'unavailable' : 'ready',...(collectionReason ? {reason:collectionReason} : {})};
}
