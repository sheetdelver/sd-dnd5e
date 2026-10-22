import type {PreparedNumericD20} from '../../../logic/preparation/d20-configuration';
/** Format shared prepared fields only;no proficiency/rule calculation in UI. */
export function rollBonusLabel(check:Pick<PreparedNumericD20,'total'|'proficiencyTerm'>|undefined):string {
    if(!check||check.total===null)return '—';
    return (check.total<0?'':'+')+check.total+(check.proficiencyTerm?' + '+check.proficiencyTerm:'');
}
