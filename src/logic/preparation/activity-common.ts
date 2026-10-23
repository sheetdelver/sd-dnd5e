import {record} from '../native/6.0.6/source';
import {initializeTraitSet606} from './trait-fields';
import {deterministicFormula606,type FormulaBindings606} from './deterministic-formula';
import type {RulesContext} from '../rules-context';
export interface ActivityTemplate606 {type:string;count:number;size:number;width:number|null;height:number|null;units:string;dimensions:Partial<Record<'size'|'width'|'height',string>>}
export interface ActivityCommon606 {
 status:'ready'|'unavailable';reason?:string;provenance:string;
 activation?:{type:string;value:number|null};duration?:{units:string;value:number|null};
 range?:{units:string;value:number|null;inherited:boolean};target?:{type:string|null;count:number|null;template?:ActivityTemplate606};
 visibility?:{requireMagic:boolean;requireAttunement:boolean;requireIdentification:boolean};
 inferredRangeValue?:string|number|null;
}
const provenance='release-6.0.6 BaseActivityData schema/prepareFinalData and Activation/Duration/Range/Target fields;nonspell utility profile';
const no=(reason:string):ActivityCommon606=>({status:'unavailable',reason,provenance});
const areaDimensions:Record<string,ActivityTemplate606['dimensions']>={circle:{size:'Radius'},cone:{size:'Length'},cube:{size:'Width'},cylinder:{size:'Radius',height:'Height'},line:{size:'Length',width:'Width'},radius:{size:'Label'},ring:{size:'Radius',width:'Thickness',height:'Height'},sphere:{size:'Radius'},square:{size:'Width'},wall:{size:'Length',width:'Thickness',height:'Height'}};
function defaultLengthUnits(context?:RulesContext):string|undefined {const setting=context?.settings['dnd5e.metricLengthUnits'];return context?.status==='supported'&&context.profile==='2024'&&setting&&setting.status!=='unavailable'&&typeof setting.value==='boolean'?setting.value?'m':'ft':undefined;}
function prepareTemplate(raw:Record<string,unknown>,bindings:FormulaBindings606,context?:RulesContext):{template?:ActivityTemplate606;reason?:string}{
 const type=raw.type==null?'':typeof raw.type==='string'?raw.type.trim():null;if(type==='')return {};
 if(type===null||!Object.hasOwn(areaDimensions,type))return {reason:'Activity area template type unavailable'};
 const dimensions=areaDimensions[type],expressions:Record<string,string|undefined>={};
 for(const key of ['count','size','width','height']){const value=raw[key];if(value==null)expressions[key]=undefined;else if(typeof value==='string')expressions[key]=value.trim();else if(typeof value==='number'&&Number.isFinite(value)&&Math.abs(value)<=1e9)expressions[key]=String(value);else return {reason:'Activity template FormulaField source malformed: '+key};}
 // Native fallback tests the initialized StringField operand,not a numeric
 // value:source0 becomes truthy "0" and must not be replaced with1 or5.
 expressions.count||='1';if(dimensions.width)expressions.width||='5';if(dimensions.height)expressions.height||='5';
 if(!expressions.size)return {reason:'Activity template size unavailable'};
 const values:Record<string,number|null>={};
 for(const key of ['count','size','width','height']){values[key]=expressions[key]?deterministicFormula606(expressions[key],bindings):null;if(expressions[key]&&values[key]===null)return {reason:'Activity template expression/reference requires qualification: '+key};}
 const unitSource=raw.units;if(unitSource!=null&&typeof unitSource!=='string')return {reason:'Activity template units source malformed'};
 const units=(typeof unitSource==='string'?unitSource.trim():'')||defaultLengthUnits(context);
 if(!units)return {reason:'Activity template default length units setting unavailable'};
 if(!['ft','mi','m','km'].includes(units))return {reason:'Activity template units outside qualified profile'};
 return {template:{type,count:values.count!,size:values.size!,width:values.width,height:values.height,units,dimensions:{...dimensions}}};
}
/** One detached common-field preparation. Source/defaults,inferred range and
 * final scalar values stay separate. This does not authorize or execute an
 * Activity,apply its effects,or resolve content/consumption references. */
export function prepareActivityCommon606(raw:unknown,item:unknown,bindings:FormulaBindings606={},gate?:string,context?:RulesContext):ActivityCommon606 {
 if(gate)return no(gate);
 const a=record(raw),parent=record(item),s=parent?.system===undefined?{}:record(parent.system);
 if(!a||!s||a.type!=='utility'||!['tool','equipment','consumable','weapon'].includes(String(parent?.type)))return no('Activity common final preparation requires a qualified nonspell utility Item');
 if(['behaviors','effects'].some(key=>a[key]!==undefined&&(!Array.isArray(a[key])||(a[key]as unknown[]).length)))return no('Activity behaviors/effect profiles require final preparation qualification');
 const mapping=(value:unknown)=>value===undefined?{}:record(value),activation=mapping(a.activation),duration=mapping(a.duration),range=mapping(a.range),target=mapping(a.target),visibility=mapping(a.visibility),consumption=mapping(a.consumption);
 if(!activation||!duration||!range||!target||!visibility||!consumption)return no('Activity common source container malformed');
 const affects=mapping(target.affects),template=mapping(target.template);
 if(!affects||!template)return no('Activity target source container malformed');
 if(consumption.targets!==undefined&&(!Array.isArray(consumption.targets)||consumption.targets.length))return no('Activity consumption target final references require qualification');
 const string=(value:unknown,fallback:string):string|null=>value==null?fallback:typeof value==='string'?value.trim():null;
 const bool=(value:unknown):boolean|null=>value==null?false:typeof value==='boolean'?value:null;
 const activationType=string(activation.type,'action'),durationUnits=string(duration.units,'inst'),targetType=string(affects.type,''),override=bool(range.override);
 const requireMagic=bool(visibility.requireMagic),requireAttunement=bool(visibility.requireAttunement),requireIdentification=bool(visibility.requireIdentification);
 if(activationType===null||!['action','bonus','reaction','minute','hour','day'].includes(activationType)||durationUnits===null||!['inst','spec','disp','dstr','perm','turn','round','second','minute','hour','day','week','month','year'].includes(durationUnits)||targetType===null||!['','self','ally','enemy','creature','object','space','creatureOrObject','any','willing'].includes(targetType)||[override,requireMagic,requireAttunement,requireIdentification].some(v=>v===null))return no('Activity common selector/Boolean source outside qualified profile');
 const scalarActivation=['minute','hour','day'].includes(activationType),activationValue=scalarActivation?(activation.value==null?null:typeof activation.value==='number'&&Number.isInteger(activation.value)&&activation.value>=0&&activation.value<=1e9?activation.value:undefined):null;
 if(activationValue===undefined)return no('Activity scalar activation source malformed');
 const scalarDuration=['turn','round','minute','hour','day','month','year'].includes(durationUnits),durationValue=scalarDuration?deterministicFormula606(duration.value,bindings):null;
 // Native does not fold an absent/blank FormulaField into a numeric zero here.
 if(scalarDuration&&(duration.value==null||duration.value===''))return no('Activity scalar duration value unavailable');
 if(scalarDuration&&durationValue===null)return no('Activity duration expression/reference requires qualification');
 let rangeValue:unknown=range.value,rangeUnits=string(range.units,'self'),inherited=false;
 if(parent?.type==='weapon'&&!override){
  const r=mapping(s.range);if(!r)return no('Parent weapon range source malformed');
  const valid=(v:unknown)=>v==null||typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1e9;
  const value=r.value,long=r.long,reach=r.reach;rangeUnits=r.units==null||typeof r.units==='string'&&!r.units.trim()?defaultLengthUnits(context)??null:string(r.units,'');
  if(![value,long,reach].every(valid))return no('Parent weapon range source outside qualified numeric profile');
  rangeValue=value;inherited=true;
  if(typeof long==='number'&&long>Number(value))rangeValue=long;else if(reach&&!rangeValue)rangeValue=reach;
 }
 if(rangeUnits===null||!['self','touch','spec','any','ft','mi','m','km'].includes(rangeUnits))return no('Activity range units outside qualified profile');
 const inferredRangeValue=rangeValue==null?null:typeof rangeValue==='string'||typeof rangeValue==='number'?rangeValue:undefined;
 if(inferredRangeValue===undefined)return no('Activity range formula source malformed');
 const scalarRange=['ft','mi','m','km'].includes(rangeUnits),preparedRange=scalarRange?deterministicFormula606(rangeValue,bindings):null;
 if(scalarRange&&(rangeValue==null||rangeValue===''))return no('Activity scalar range value unavailable');
 if(scalarRange&&preparedRange===null)return no('Activity range expression/reference requires qualification');
 const scalarTarget=targetType!==''&&targetType!=='self',targetCount=scalarTarget?deterministicFormula606(affects.count,bindings):null;
 if(scalarTarget&&(affects.count==null||affects.count===''))return no('Activity target count unavailable');
 if(scalarTarget&&targetCount===null)return no('Activity target expression/reference requires qualification');
 const area=prepareTemplate(template,bindings,context);if(area.reason)return no(area.reason);
 const properties=initializeTraitSet606(s.properties),attunement=string(s.attunement,'');
 if(!properties||attunement===null||!['','required','optional'].includes(attunement))return no('Activity Item magic/attunement source unavailable');
 const magic=properties.includes('mgc'),currentAttunement=magic?(attunement==='required'?requireMagic!:Boolean(attunement)&&requireAttunement!):false;
 return {status:'ready',provenance,activation:{type:activationType,value:activationValue},duration:{units:durationUnits,value:durationValue},range:{units:rangeUnits,value:preparedRange,inherited},target:{type:targetType||null,count:targetCount,...(area.template?{template:area.template}:{})},visibility:{requireMagic:magic&&requireMagic!,requireAttunement:currentAttunement,requireIdentification:requireIdentification!},inferredRangeValue};
}
