import fixture from '../../../tests/fixtures/native-6.0.6/scalar-phases.json';
import {scalarSource,scalarCases,scalarContext} from './scalar-effect-scenarios';
export const scalarPhaseContext=scalarContext;
export const scalarNumberCases=fixture.numberRows,scalarFinalFormulaCases=[...fixture.formulaRows,...fixture.movementRows],scalarUnsupportedCases=fixture.unsupported;
export function scalarPhaseSource(row:{path:string;before:number;phase?:string;type:string;delta:number|string;sourceExpression?:string;currentProf?:number}){
 const source=scalarSource(scalarCases[0]),s=source.system as any;s.attributes.ac={};source.effects=[];const parts=row.path.split('.');let parent=s;for(const key of parts.slice(0,-1))parent=parent[key]??={};parent[parts.at(-1)!]=row.before;
 if(row.path==='attributes.ac.flat')s.attributes.ac.calcs=['natural'];
 const nonpersisted=/^attributes\.(?:ac\.(?:bonus|min|cover)|movement\.multiplier)/.test(row.path),changes=[...(nonpersisted?[{key:'system.'+row.path,type:'override',value:row.before,phase:'initial',priority:0}]:[]),{key:'system.'+row.path,type:row.type,value:row.delta,phase:row.phase??'final'}];
 // Speeds are native prepared numbers at final. This source+initial bonus
 // produces walk32/jump5;the raw source never supplies a prepared32.
 if(row.path.startsWith('attributes.movement.speeds.')){s.attributes.movement={speeds:{walk:30},bonus:2};}
 if(row.sourceExpression)(changes[0]as any).value=row.sourceExpression;if(row.currentProf)changes.push({key:'system.attributes.prof',type:'add',value:row.currentProf-3,phase:'final'});
 source.effects=[{_id:'ScalarPhase',type:'base',system:{changes}}as any];return source;
}
