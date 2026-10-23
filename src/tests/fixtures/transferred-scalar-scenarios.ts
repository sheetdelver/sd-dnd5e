import fixture from '../../../tests/fixtures/native-6.0.6/transferred-scalars.json';
import {scalarNumberCases,scalarFinalFormulaCases,scalarPhaseSource,scalarPhaseContext} from './scalar-phase-scenarios';
import {nullableScalarCases,zeroScalarCases,nullableScalarSource} from './nullable-scalar-scenarios';
import {equippableFinalCases,equippableFinalSource} from './equippable-final-scenarios';
export const transferredScalarCases=fixture.cases,transferredScalarContext=scalarPhaseContext;
export function transferredScalarInput(c:typeof fixture.cases[number]):any {
 return c.family==='number'?scalarNumberCases.filter(r=>r.phase==='final')[c.index]:c.family==='formula'?scalarFinalFormulaCases[c.index]:c.family==='nullable'?nullableScalarCases.filter(r=>r.phase==='final')[c.index]:zeroScalarCases[c.index];
}
export function transferredScalarSource(c:typeof fixture.cases[number],includeUtility=c.utility){
 const row=transferredScalarInput(c),source=['number','formula'].includes(c.family)?scalarPhaseSource(row):nullableScalarSource(row);
 const gear=equippableFinalSource(equippableFinalCases.find(r=>r.type===c.type&&r.phase==='final'&&Boolean(r.source.properties.length)===c.state.magic&&r.source.attunement==='required'&&r.source.attuned===c.state.attuned&&r.source.equipped===c.state.equipped)!).items!.at(-1)! as any;
 const final:any[]=[];for(const effect of (source.effects??[])as any[]){const changes=effect.system.changes as any[];for(const change of changes)if(change.phase==='final'&&change.key!=='system.attributes.prof')final.push(change);effect.system.changes=changes.filter(change=>change.phase!=='final'||change.key==='system.attributes.prof');}
 if(c.type!=='container')gear.system.uses={max:'3',spent:1,recovery:[]};
 if(includeUtility)gear.system.activities={ScalarUtility001:{_id:'ScalarUtility001',type:'utility',name:'Scalar utility',duration:{value:'@item.uses.value',units:'round'},range:{override:true,value:'5',units:'ft'},uses:{max:'@item.uses.value',spent:1,recovery:[]}}};
 (gear.effects![0].system as any).changes=final;source.items!.push(gear);return source;
}
