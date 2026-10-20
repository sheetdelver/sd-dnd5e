import { record } from '../native/6.0.6/source';
import type { RulesContext } from '../rules-context';
import type { PreparedNumericD20 } from './d20-configuration';
import { prepareSkillToolModel606, configureSkillToolCheck } from './skill-tool';
export { TOOL_LABELS_606 } from './check-identities';
export interface PreparedTool extends PreparedNumericD20 { key:string; label:string; prof:number|null; provenance:string }
/** Default independent projection; operands/calculation are shared with all
 * selected requests, never reconstructed from total/prof/effectValue. */
export function prepareNumericTools606(actor:unknown,context:RulesContext,model=prepareSkillToolModel606(actor,context)):{checks:Record<string,PreparedTool>;status:'ready'|'unavailable';reason?:string} {
    const raw=record(record(actor)?.system)?.tools;
    const reason=raw!==undefined&&!record(raw)?'Tool source mapping malformed':model.reason;
    const checks=Object.fromEntries(Object.keys(model.tools).map(key=>[key,{
        ...configureSkillToolCheck(model,'tool',key),key,
        provenance:'release-6.0.6 tool schema / prepareTools / Actor roll builder; source-only',
    }]));
    return {checks,status:reason?'unavailable':'ready',...(reason?{reason}:{})};
}
