import {skillSource} from './skill-scenarios';
export function predicateSource(score=14,operation='contains'){
 const source=skillSource();(source.system as any).abilities.wis.value=score;
 source.effects=[{_id:'PredicateEffect1',type:'base',system:{conditions:JSON.stringify({k:'abilities.wis.value',o:operation,v:operation==='in'?[14]:operation==='startswith'?'14':'4'}),changes:[{key:'system.abilities.wis.value',type:'override',value:18}]}}]as any;return source;
}
