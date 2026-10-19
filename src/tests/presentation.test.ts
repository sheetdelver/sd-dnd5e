import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import InitiativeModal from '../ui/components/modals/InitiativeModal';
import manifest from '../../module/ui';
import Skills from '../ui/components/blocks/Skills';
import PassiveSenses from '../ui/components/blocks/PassiveSenses';
import { ModalProvider } from '../ui/components/shared/useModal';
import { SheetProvider } from '../ui/components/shared/SheetContext';

assert.equal(manifest.info.compatibility?.coreVersion, '>=0.19.3');
assert.equal(manifest.info.compatibility?.apiContracts?.['ui-extension-api'], '>=3.1.0 <4.0.0');
assert.equal(manifest.dashboardActions, undefined, 'D&D 5e has no dashboard tools to migrate');
assert.equal(typeof manifest.rollModal, 'function', 'HUD uses the module-owned native roll frame');
const initiative = { isOpen: true, type: 'initiative' as const, title: 'Roll Initiative',
    combatantName: 'Hero', formula: '2d20kh1+2', source: 'module' as const, audience: 'public' as const,
    rollAvailable: true, manualAvailable: true, advantageAvailable: true, onClose() {}, onConfirm() {} };
const html = renderToStaticMarkup(createElement(InitiativeModal, initiative));
assert.match(html, /dnd5e-modal/);
assert.match(html, /2d20kh1\+2/);
assert.match(html, /aria-label="Roll initiative"/);
assert.match(html, /Public Roll/);
assert.match(html, /Input Manually/);
assert.doesNotMatch(html, /<select|Situational Bonus/);
const manual = renderToStaticMarkup(createElement(InitiativeModal, { ...initiative, rollAvailable: false }));
assert.match(manual, /Final initiative total/);
assert.match(manual, /step="any"/);
assert.doesNotMatch(manual, / min=| max=/);
const unavailableSkills = renderToStaticMarkup(createElement(SheetProvider, { actor: {}, children:
    createElement(ModalProvider, { children: createElement(Skills, { skills: {
        prc: { total: null, prof: null, ability: 'wis', label: 'Perception', unavailableReason: 'Active effect preparation unavailable' },
    } }) }) }));
assert.match(unavailableSkills, /disabled=""/);
assert.match(unavailableSkills, /Active effect preparation unavailable/);
const passives = renderToStaticMarkup(createElement(PassiveSenses, { perception: null, investigation: null, insight: null }));
assert.match(passives, /Unavailable passive checks/);
assert.doesNotMatch(passives, />10</);
console.log('dnd5e dashboard presentation: PASS');
