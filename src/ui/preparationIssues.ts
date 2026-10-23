/** Presentation of shared preparation results only. No source value is promoted
 * to an effective value and no failed calculation is retried here. */
export interface PreparationIssue {reason:string;message:string;fields:string[];sources:string[]}
export function preparationMessage(reason:string):string {
 if(/not available.*yet|not implemented/i.test(reason))return 'This action is not implemented yet.';
 if(/context unavailable|unsupported.*version|not-qualified|unsupported-version/i.test(reason))return 'The current system or world rules are not qualified. Effective values and actions are restricted.';
 if(/world.time|timed effect|duration\/expiry/i.test(reason))return 'A timed effect needs native time information that is not available to this sheet.';
 if(/conditions\/dependencies|flag|dependency\/rider/i.test(reason))return 'An effect has mechanics or dependencies that this sheet cannot calculate yet.';
 if(/formula|expression|reference/i.test(reason))return 'A required formula or reference is not supported or is missing.';
 return 'Some required data or rules are unavailable for this part of the sheet.';
}
export const unavailableTitle=(reason?:string)=>reason?preparationMessage(reason)+' See sheet diagnostics.':undefined;
const fieldNames:Record<string,string>={characterFacts:'Level and proficiency',hp:'Hit points',hitDice:'Hit dice',armorClass:'Armor class',initiativeFacts:'Initiative',movement:'Movement',senses:'Senses',defenses:'Defenses',training:'Training',abilities:'Abilities and saving throws',skills:'Skills',tools:'Tools'};
export function preparationIssues(actor:Record<string,any>):PreparationIssue[]{
 const d=actor.derived??{},groups=new Map<string,PreparationIssue>();
 function add(reason:unknown,field:string,source?:string){if(typeof reason!=='string'||!reason)return;reason=[...new Set(reason.split('; '))].join('; ');const key=reason as string;field=fieldNames[field.split(' · ')[0]]??field;const g=groups.get(key)??{reason:key,message:preparationMessage(key),fields:[],sources:[]};if(!g.fields.includes(field))g.fields.push(field);if(source&&!g.sources.includes(source))g.sources.push(source);groups.set(key,g);}
 const lifecycle=d.lifecycle;
 if(lifecycle&&lifecycle.status!=='supported'){add(lifecycle.reason??'Rule context unavailable','Effective character values and actions');return [...groups.values()];}
 for(const decision of d.effectPreparation?.decisions??[]){if(!decision.reason)continue;const parent=actor.items?.find((i:any)=>i._id===decision.parentId),effect=(parent?.effects??actor.effects??[]).find((e:any)=>e._id===decision.id);add(decision.reason,decision.key??'Effect preparation',`${parent?`Item ${parent.name??'Unnamed item'} (${parent._id}) / `:''}Effect ${effect?.name??'Unnamed effect'} (${decision.id||'missing ID'})`);}
 add(d.effectPreparation?.reason,'Effect preparation');
 function visit(value:any,path:string,source?:string,depth=0){if(!value||typeof value!=='object'||depth>5)return;add(value.reason??value.unavailableReason??value.defaultUnavailableReason,path,source);for(const [key,child]of Object.entries(value)){if(['provenance','source','initialized','origins','preparedFlags','currentFlags','sourceFlags','applied'].includes(key))continue;if(child&&typeof child==='object')visit(child,path+' · '+key,source,depth+1);}}
 for(const key of ['characterFacts','hp','hitDice','armorClass','initiativeFacts','movement','senses','defenses','training','abilities','skills','tools'])visit(d[key],key);
 for(const item of Object.values(d.ownedItems?.items??{})as any[]){const label=`Item ${item.name??'Unnamed item'} (${item.id})`;for(const key of ['uses','weight','quantity','proficiency'])visit(item[key],key,label);for(const activity of item.activities??[])visit(activity.common,`Activity ${activity.name??activity.id}`,label);}
 return [...groups.values()];
}
