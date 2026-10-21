import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {speciesCases,speciesSource} from './fixtures/species-scenarios';
import {skillContext,skillWorld,unavailableContexts} from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of speciesCases){
    const source=speciesSource(row),before=structuredClone(source),prepared=adapter.prepareActorData(source,skillContext()),e=row.expected;
    const species=(prepared.derived as any).speciesIdentity,card=adapter.getActorCardData(prepared),race=adapter.getRaceData(prepared);
    if(species?.status!==e.status||species?.display!==e.display||species?.id!==e.id||!card.subtext?.includes(e.display)||race.name!==(e.status==='unavailable'||e.status==='absent'?'':e.display))failures.push(row.id);
    assert.deepEqual(source,before,row.id);
    if(!species)continue;
    const poison=structuredClone(source) as any;
    poison.derived={race:'Poison label',speciesIdentity:{name:'Poison label',uuid:'Item.poison'}};
    poison.system.details.species='speciesFirst001';poison.system.race={name:'Poison label'};
    const poisonBefore=structuredClone(poison);
    assert.deepEqual((adapter.prepareActorData(poison,skillContext()).derived as any).speciesIdentity,species,'Prepared-looking aliases never replace the persisted reference');
    assert.deepEqual(poison,poisonBefore);
    if(e.status==='resolved-source'){
        assert.equal(species.uuid,`Actor.${source._id}.Item.${e.id}`);
        if(!row.badSystem)assert.equal((prepared.derived as any).movement.speciesUuid,species.uuid);
        else assert.equal((prepared.derived as any).movement.status,'unavailable');
        assert.equal(species.edition,row.badSystem?null:e.id==='speciesSecond01'?'2024':'2014');
    }else assert.equal(species.uuid,null);
    for(const {context} of unavailableContexts()){
        const lost=adapter.prepareActorData(source,context);
        assert.equal((lost.derived as any).speciesIdentity.status,'unavailable');
        assert.ok(adapter.getActorCardData(lost).subtext?.includes('Species unavailable'));
        assert.equal((adapter.prepareActorData(source,skillContext()).derived as any).speciesIdentity.display,e.display);
    }
}
console.log('Species identity failing-before cases:',JSON.stringify(failures));assert.deepEqual(failures,[]);
const legacy=skillWorld();(legacy.settings as Record<string,unknown>)['dnd5e.rulesVersion']={status:'world',value:'legacy'};
const selectedLegacy=adapter.prepareActorData(speciesSource(speciesCases[0]),skillContext(legacy));
assert.equal((selectedLegacy.derived as any).speciesIdentity.status,'legacy-unqualified');
assert.equal(adapter.getRaceData(selectedLegacy).name,'First species','Selected legacy behavior retains its explicit compatibility boundary');
