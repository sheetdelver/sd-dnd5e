import assert from 'node:assert/strict';
import manifest from '../../module/ui';

assert.equal(manifest.info.compatibility?.coreVersion, '>=0.14.2');
assert.equal(manifest.info.compatibility?.apiContracts?.['ui-extension-api'], '>=2.0.0 <3.0.0');
assert.equal(manifest.dashboardActions, undefined, 'D&D 5e has no dashboard tools to migrate');
console.log('dnd5e dashboard presentation: PASS');
