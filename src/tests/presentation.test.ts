import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import InitiativeModal from '../ui/components/modals/InitiativeModal';
import manifest from '../../module/ui';

assert.equal(manifest.info.compatibility?.coreVersion, '>=0.17.0');
assert.equal(manifest.info.compatibility?.apiContracts?.['ui-extension-api'], '>=3.0.0 <4.0.0');
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
assert.doesNotMatch(html, /<select|Situational Bonus/);
const manual = renderToStaticMarkup(createElement(InitiativeModal, { ...initiative, rollAvailable: false }));
assert.match(manual, /Final initiative total/);
assert.match(manual, /step="any"/);
assert.doesNotMatch(manual, / min=| max=/);
console.log('dnd5e dashboard presentation: PASS');
