import {itemFactsSource} from './item-fact-scenarios';
export function formulaSource(){
 const actor=itemFactsSource(),s=actor.system as any;
 s.rolls={ability:{check:{bonus:'@prof - 1'}}};
 s.skills.prc.roll={bonus:'floor(@details.level / 2)'};s.skills.prc.bonuses={passive:'ceil(@prof/2)'};
 s.abilities.wis.check={roll:{bonus:'max(1, @abilities.wis.mod)'}};
 s.tools={thief:{ability:'dex',value:1,roll:{bonus:'2*(3-1)'}}};
 s.attributes.movement={speeds:{walk:'@details.level*5+5'}};
 s.attributes.ac={calcs:[],formulas:[{formula:'10+@abilities.dex.mod+@abilities.wis.mod'}]};
 (actor.items.find(i=>i._id==='counter')!.system as any).uses.max='max(1,@abilities.wis.mod)*2+@prof';
 (actor.items.find(i=>i._id==='counter')!.system as any).activities.u.uses.max='1+1';
 return actor;
}
