import fixture from '../../../tests/fixtures/native-6.0.6/formula-effects.json';
import {skillSource,skillContext} from './skill-scenarios';
export const formulaEffectCases=fixture.cases;
export const formulaEffectContext=skillContext;
export function formulaEffectSource(row:typeof fixture.cases[number]){const source=skillSource(),s=source.system as any;s.skills.prc={ability:'wis',value:row.coefficient,roll:{bonus:row.source},bonuses:{}};source.effects=[{_id:'FormulaEffect',type:'base',system:{changes:[{key:'system.skills.prc.roll.bonus',type:row.type,value:row.raw,phase:row.phase}]}}as any];return source;}
export const formulaEffectScopes=fixture.scopeCases;
export function formulaEffectScopeSource(row:typeof fixture.scopeCases[number]){const source=skillSource(),s=source.system as any;s.abilities.wis.proficient=1;s.skills.prc={ability:'wis',value:1,roll:{},bonuses:{}};s.tools={thief:{ability:'wis',value:1,roll:{}}};s.attributes.init={ability:'wis',roll:{}};const keys=row.path.split('.');let parent=s;for(const key of keys.slice(0,-1))parent=parent[key]??={};parent[keys.at(-1)!]='@prof + 1';source.effects=[{_id:'ScopeFormula',type:'base',system:{changes:[{key:'system.'+row.path,type:'multiply',value:2,phase:row.phase}]}}as any];return source;}
