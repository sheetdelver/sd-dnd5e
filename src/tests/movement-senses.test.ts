import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {movementCases,movementSource,movementContext} from './fixtures/movement-scenarios';
import {unavailableContexts} from './fixtures/skill-scenarios';
const adapter=new DnD5eAdapter(),failures:string[]=[];
for(const row of movementCases){
    const source=movementSource(row),before=structuredClone(source),prepared=adapter.prepareActorData(source,movementContext(row)),d=prepared.derived as any,e=row.expected;
    if(!d.movement||!d.senses.status){failures.push(row.id);continue;}
    if(e.movement){
        for(const key of ['walk','burrow','climb','fly','swim'] as const)assert.equal(d.movement.speeds[key],e.movement[key],row.id+'/'+key);
        assert.equal(d.movement.jump.value,e.movement.jump,row.id+'/jump');for(const key of ['units','hover','max','slowed'] as const)assert.equal(d.movement[key],e.movement[key],row.id+'/'+key);
        assert.equal(d.speed.walk,e.movement.walk,row.id);if('special' in e.movement)assert.equal(d.movement.special,e.movement.special,row.id);
    }else {assert.equal(d.movement.status,'unavailable',row.id);assert.equal(d.speed.walk,null);assert.ok(d.movement.reason);}
    if(e.senses){for(const key of ['blindsight','darkvision','tremorsense','truesight'] as const)assert.equal(d.senses.ranges[key],e.senses[key],row.id+'/'+key);assert.equal(d.senses.units,e.senses.units);assert.equal(d.senses.special,e.senses.special);}
    else {assert.equal(d.senses.status,'unavailable',row.id);assert.ok(d.senses.reason);}
    for(const {context} of unavailableContexts()){
        const lost=adapter.prepareActorData(source,context);assert.equal((lost.derived.movement as any).status,'unavailable');assert.equal((lost.derived.senses as any).status,'unavailable');
        assert.deepEqual(adapter.prepareActorData(source,movementContext(row)).derived.movement,d.movement);
    }
    assert.deepEqual(source,before,row.id);assert.equal(Object.isFrozen(source.system),false);
}
console.log('Movement/senses source cases failing before:',JSON.stringify(failures));assert.deepEqual(failures,[]);
