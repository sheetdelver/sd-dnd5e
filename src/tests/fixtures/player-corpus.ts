import {healthCases,healthSource} from './health-scenarios';
import {skillContext,unavailableContexts} from './skill-scenarios';
import {spellContextCases,spellContextSource} from './spell-context-scenarios';
/** Representative source fixtures, not captures of a user's Actor. Expectations
 * come from the existing pinned health/check/spell fixtures, not preparation. */
export function playerCorpus(){
 const base=healthSource(healthCases[0]);base.name='Offline adventurer';base.effects=[];
 const migrated=structuredClone(base);migrated.effects=[{_id:'MigratedFocus',name:'Migrated focus',type:'base',flags:{dnd5e:{persistSourceMigration:true,dependents:[]}},system:{changes:[{key:'system.abilities.wis.value',type:'add',value:2,phase:'initial'}]}}];
 const unknown=structuredClone(migrated);(unknown.effects![0] as any).flags.dnd5e.futureMechanic=true;
 const local=structuredClone(base);local.items.push({_id:'UnknownCounter',name:'Unresolved counter',type:'feat',system:{uses:{max:'@unknown'}}}as any);
 const multi=healthSource(healthCases.find(row=>row.id==='multiclass')!);multi.effects=[];
 const caster=spellContextSource(spellContextCases.find(row=>row.id==='linked-class')!);caster.name='Offline caster';
 return [
  {id:'martial',source:base,context:skillContext(),formula:'1d20+4'},
  {id:'migration',source:migrated,context:skillContext(),formula:'1d20+5'},
  {id:'multiclass',source:multi,context:skillContext(),formula:'1d20+4'},
  {id:'caster',source:caster,context:skillContext(),formula:'1d20+5'},
  {id:'local-unavailable',source:local,context:skillContext(),formula:'1d20+4'},
  {id:'unknown-mechanics',source:unknown,context:skillContext(),formula:null},
  {id:'unqualified-version',source:base,context:unavailableContexts()[1].context,formula:null}
 ];
}
