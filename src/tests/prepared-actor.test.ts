import { strict as assert } from 'node:assert';
import type { ActorPreparationContext, FoundryActor } from '@sheet-delver/sdk';
import { DnD5eAdapter } from '../logic/adapter';

const context: Readonly<ActorPreparationContext> = Object.freeze({
    worldEpoch: 1,
    sourceRevision: 4,
    systemId: 'dnd5e',
    systemVersion: '5.3.3',
    moduleId: 'dnd5e',
    moduleVersion: '0.2',
});

export function run(): void {
    const source = {
        _id: 'hero',
        name: 'Prepared Hero',
        type: 'character',
        img: 'icons/hero.webp',
        system: {
            abilities: { str: { value: 16 }, dex: { value: 14 } },
            skills: { prc: { value: 2, ability: 'wis' } },
            attributes: {
                hp: { value: 17, max: 20, temp: 2 },
                ac: { value: 15 },
                init: { value: 2 },
                prof: 2,
            },
            details: { level: 3, background: 'Sage' },
        },
        items: [
            { _id: 'class', name: 'Wizard', type: 'class', system: { levels: 3 } },
            { _id: 'race', name: 'Human', type: 'race', system: {} },
            { _id: 'weapon', name: 'Quarterstaff', type: 'weapon', system: {} },
        ],
        effects: [],
        _stats: { systemId: 'dnd5e' },
    } as unknown as FoundryActor;

    const prepared = new DnD5eAdapter().prepareActorData(source, context);

    assert.equal(prepared._id, 'hero');
    assert.equal(prepared.id, 'hero');
    assert.equal((prepared.derived.level as number), 3);
    assert.equal((prepared.derived.hp as { value: number }).value, 17);
    assert.deepEqual(prepared.categorizedItems?.weapons.map(item => item.name), ['Quarterstaff']);
    assert.deepEqual(prepared.categorizedItems?.features.map(item => item.name), ['Wizard', 'Human']);
    assert.equal(source.items[0].name, 'Wizard');

    console.log('dnd5e prepared Actor parity: PASS');
}

if (import.meta.url === `file://${process.argv[1]}`) run();
