import fixture from '../../../tests/fixtures/native-6.0.6/scalar-effects.json';
import {skillSource,skillContext} from './skill-scenarios';
export const scalarCases=fixture.cases;
export const scalarContext=skillContext;
export function scalarSource(row:typeof fixture.cases[number]) {
 const source=skillSource(),s=source.system as any;for(const key of ['str','dex','con','int','wis','cha'])s.abilities[key]={value:key==='str'?10:14};s.attributes.ac={};s.attributes.spellcasting='wis';s.attributes.movement={speeds:{walk:30}};
 source.items=source.items!.filter(item=>item.type==='class');const cls=source.items[0];cls.system={identifier:'fighter',levels:5,hd:{denomination:'d10',spent:0},advancement:[{_id:'ScalarHP',type:'HitPoints',value:{1:'max',2:'avg',3:'avg',4:'avg',5:'avg'}}]};s.attributes.hp={max:null,value:40};
 const parts=row.path.split('.');let parent=s;for(const key of parts.slice(0,-1))parent=parent[key]??={};parent[parts.at(-1)!]=row.before;
 // Derived-field seeds are legitimate earlier effects,not forged raw values.
 const nonpersisted=row.path.startsWith('attributes.ac.')||row.path.startsWith('attributes.encumbrance.');
 source.effects=[{_id:'Scalar',type:'base',system:{changes:[...(nonpersisted?[{key:'system.'+row.path,type:'override',value:row.before,phase:'initial',priority:0}]:[]),{key:'system.'+row.path,type:row.type,value:row.delta,phase:'initial'}]}}as any];return source;
}
