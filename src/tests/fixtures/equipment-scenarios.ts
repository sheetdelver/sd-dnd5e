import fixture from '../../../tests/fixtures/native-6.0.6/equipment.json';
import {skillSource} from './skill-scenarios';
export const equipmentCases=fixture.cases;
export function equipmentSource(row:typeof equipmentCases[number]) {
    const actor=skillSource(),system=actor.system as Record<string,any>;
    system.abilities={dex:{value:row.abilities?.dex??14,proficient:0},wis:{value:16,proficient:0},con:{value:14,proficient:0}};
    system.skills={ste:{ability:'dex',value:1,roll:{mode:row.skillMode??0},bonuses:{passive:''}}};
    system.tools={thief:{ability:'dex',value:1,roll:{}}};
    system.rolls={ability:{check:{mode:row.globalMode??0,proficiency:99}}};
    system.attributes.ac={armor:99,base:99,bonus:'99',cover:99,shield:99,...structuredClone(row.actorAc??{})};
    for(const [index,item] of row.equipment.entries()) {
        const data=item as Record<string,any>,armor=data.armor===undefined?{}:typeof data.armor==='object'?{...data.armor,magicalBonus:data.magicalBonus??''}:data.armor;
        actor.items.push({_id:data.badIdentity?'invalid.id':data.duplicateIdentity?'fixtureClass0001':'equipment'+index,uuid:`Actor.${actor._id}.Item.equipment${index}`,type:'equipment',name:data.name??'Label is not a calculation',
            system:{equipped:data.equipped??true,attunement:data.attunement??'',attuned:data.attuned??false,properties:data.properties??[],type:{value:data.type},armor,
                ...(data.poison?{isArmor:false,magicAvailable:false,proficiencyMultiplier:99,armor:{...armor,base:99},type:{value:data.type,identifier:'Poison'}}:{}),
                ...(data.legacyStealth?{stealth:true}:{}),source:{rules:'2024',book:'Synthetic',custom:'preserve'},unknownExtension:{keep:[1,{a:true}]}},
            ...(data.nativeFlag?{flags:{dnd5e:{migratedProperties:['mgc']}}}:{}),_stats:{compendiumSource:'Compendium.example.armor.Item.sameSource'}} as any);
    }
    if(row.modeEffect)actor.effects=[{_id:'armorModeFixture',type:'base',system:{changes:[{key:'system.skills.ste.roll.mode',...row.modeEffect,phase:'initial'}]}}];
    return actor;
}
