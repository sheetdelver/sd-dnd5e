import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { PreparedActorData } from '@sheet-delver/sdk';
import { DnD5eAdapter } from '../logic/adapter';
import type { PreparedSkill } from '../logic/preparation/skills';
import Skills from '../ui/components/blocks/Skills';
import { SheetProvider } from '../ui/components/shared/SheetContext';
import { ModalProvider } from '../ui/components/shared/useModal';
import { rollScopes, setSkillRoll, skillContext, skillSource, skillWorld, unavailableContexts } from './fixtures/skill-scenarios';

const adapter = new DnD5eAdapter(), failures: string[] = [];
const skill = (actor: PreparedActorData) => (actor.derived.skills as Record<string, PreparedSkill & { label: string }>).prc;
function check(id: string, actor: PreparedActorData, totals: boolean) {
    try {
        assert.equal(skill(actor).total, totals ? 5 : null);
        assert.equal(actor.derived.passivePerception, totals ? 15 : null);
        assert.equal(adapter.getRollData(actor, 'skill', 'prc'), null);
        assert.ok(skill(actor).unavailableReason);
    } catch { failures.push(`${id}: total=${skill(actor).total}, passive=${actor.derived.passivePerception}, roll=${adapter.getRollData(actor, 'skill', 'prc')?.formula}`); }
}
// Unchanged review input/expectation. Enumerate all eleven before asserting so
// the failing-before evidence covers both findings in a single maintained run.
for (const scope of rollScopes) for (const field of ['min', 'max']) {
    const input = skillSource(); setSkillRoll(input, scope, { [field]: 10 });
    const before = structuredClone(input);
    check(`DD-R01 ${scope}.${field}`, adapter.prepareActorData(input, skillContext()), true);
    assert.deepEqual(input, before);
}
for (const { id, context } of unavailableContexts()) check(`DD-R02 ${id}`, adapter.prepareActorData(skillSource(), context), false);
assert.deepEqual(failures, [], `Review corrections required:\n${failures.join('\n')}`);

for (const scope of rollScopes) for (const field of ['min', 'max']) {
    for (const value of [undefined, null]) {
        const input = skillSource(); setSkillRoll(input, scope, { [field]: value });
        assert.equal(adapter.getRollData(adapter.prepareActorData(input, skillContext()), 'skill', 'prc')?.formula, '1d20+5');
    }
    for (const value of [0, 21, -1, 1.5, '10', true, {}, [], NaN, Infinity]) {
        const input = skillSource(); setSkillRoll(input, scope, { [field]: value });
        const output = adapter.prepareActorData(input, skillContext());
        assert.equal(skill(output).total, 5);
        assert.equal(output.derived.passivePerception, 15);
        assert.equal(adapter.getRollData(output, 'skill', 'prc'), null);
        assert.match(skill(output).unavailableReason!, /range|bound/i);
    }
}
const combined = skillSource();
setSkillRoll(combined, rollScopes[0], { min: 10 });
setSkillRoll(combined, rollScopes[1], { max: 15 });
setSkillRoll(combined, rollScopes[2], { min: 12 });
setSkillRoll(combined, rollScopes[3], { max: 14 });
const bounded = adapter.prepareActorData(combined, skillContext());
assert.equal(skill(bounded).total, 5); assert.equal(skill(bounded).passive, 15);
assert.equal(adapter.getRollData(bounded, 'skill', 'prc', { advantage: 'adv' }), null);
assert.equal(adapter.getRollData(bounded, 'skill', 'prc', { advantage: 'dis' }), null);
for (const range of [{ min: 1, max: 20 }, { min: 20, max: 1 }, { min: 10, max: 10 }]) {
    const actor = skillSource(); setSkillRoll(actor, rollScopes[0], range);
    assert.equal(adapter.getRollData(adapter.prepareActorData(actor, skillContext()), 'skill', 'prc'), null);
}
for (const { context } of unavailableContexts()) {
    const source = skillSource(), before = structuredClone(source);
    const initial = adapter.prepareActorData(source, skillContext());
    const unavailable = adapter.prepareActorData(source, context);
    const recovered = adapter.prepareActorData(source, skillContext());
    assert.deepEqual([skill(initial).total, skill(unavailable).total, skill(recovered).total], [5, null, 5]);
    assert.deepEqual([initial.derived.passivePerception, unavailable.derived.passivePerception, recovered.derived.passivePerception], [15, null, 15]);
    const html = renderToStaticMarkup(createElement(SheetProvider, { actor: unavailable, children:
        createElement(ModalProvider, { children: createElement(Skills, { skills: unavailable.derived.skills as Record<string, PreparedSkill & { label: string }> }) }) }));
    assert.match(html, /disabled=""/); assert.doesNotMatch(html, />\+1</);
    assert.deepEqual(source, before);
}
const legacy = skillWorld();
(legacy.settings as Record<string, unknown>)['dnd5e.rulesVersion'] = { status: 'world', value: 'legacy' };
const selectedLegacy = adapter.prepareActorData(skillSource(), skillContext(legacy));
assert.equal((selectedLegacy.derived.lifecycle as Record<string, unknown>).profile, 'legacy-limited');
assert.equal(adapter.getRollData(selectedLegacy, 'skill', 'prc')?.formula, '1d20+1', 'Explicit historical legacy path is preserved, not qualified');
assert.equal(adapter.getRollData({ ...selectedLegacy, derived: {} }, 'skill', 'prc'), null, 'Absence of prepared checks is never authority to select legacy');
console.log('R: DD-R01 eight ranges + defaults/malformed/combinations; DD-R02 context transitions/direct/static controls: PASS');
