import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { coreRoot, moduleRoot, option } from './lib/toolchain.mjs';

const args = process.argv.slice(2), core = coreRoot(args);
const browserTools = option(args, '--browser-tools', process.env.DND5E_BROWSER_TOOLS);
if (!browserTools) throw new Error('Supply --browser-tools PATH containing test-only playwright (not a module runtime dependency)');
const toolRequire = createRequire(join(browserTools, 'package.json'));
const { chromium } = toolRequire('playwright');
const require = createRequire(join(core, 'package.json')), { build } = require('esbuild');
const artifacts = mkdtempSync(join(tmpdir(), 'dnd5e-mounted-'));
const driver = join(artifacts, 'states.ts');
writeFileSync(driver, `import { DnD5eAdapter } from ${JSON.stringify(join(moduleRoot, 'src/logic/adapter.ts'))};
import { skillContext, skillSource, unavailableContexts, setSkillRoll, rollScopes } from ${JSON.stringify(join(moduleRoot, 'src/tests/fixtures/skill-scenarios.ts'))};
const adapter = new DnD5eAdapter();
const prepare = (input = skillSource(), context = skillContext()) => adapter.prepareActorData(input, context);
const states = { supported: prepare() };
for (const {id, context} of unavailableContexts()) states[id] = prepare(skillSource(), context);
for (const scope of rollScopes) for (const field of ['min','max']) {
    const bounded = skillSource(); setSkillRoll(bounded, scope, {[field]:10}); states['range-'+scope+'-'+field] = prepare(bounded);
}
process.stdout.write(JSON.stringify(states));`);
const result = spawnSync(process.execPath, [join(core, 'node_modules/tsx/dist/cli.mjs'), '--tsconfig', join(core, 'tsconfig.json'), driver], { cwd: core, encoding: 'utf8' });
if (result.status !== 0) throw new Error(result.stderr);
const states = JSON.parse(result.stdout);
const bundle = await build({ entryPoints: [join(moduleRoot, 'tests/browser/skill-lifecycle.tsx')], bundle: true, write: false,
    platform: 'browser', format: 'iife', jsx: 'automatic', tsconfig: join(core, 'tsconfig.json'),
    plugins: [{ name: 'isolated-sdk-presentation', setup(build) {
        build.onResolve({ filter: /^@sheet-delver\/sdk(?:\/react)?$/ }, () => ({ path: join(moduleRoot, 'tests/browser/sdk-fixture.tsx') }));
    } }], define: { 'process.env.NODE_ENV': '"development"' }, logLevel: 'silent' });
const code = bundle.outputFiles[0].text;
writeFileSync(join(artifacts, 'fixture.js'), code);
const executablePath = option(args, '--chromium', process.env.DND5E_CHROMIUM);
const rows = [], browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
try {
    for (const width of [1440, 390]) {
        const context = await browser.newContext({ viewport: { width, height: 1000 } });
        const page = await context.newPage(), errors = [];
        page.on('pageerror', error => errors.push(error.message));
        // Fulfill the sole page locally; every other request is aborted. No HTTP
        // server/listener, host configuration, network or Foundry connection.
        await page.route('**/*', route => route.request().url() === 'http://dnd5e-fixture.invalid/'
            ? route.fulfill({ contentType: 'text/html', body: '<html><body><div id="root"></div></body></html>' }) : route.abort());
        await page.goto('http://dnd5e-fixture.invalid/');
        await page.addStyleTag({ content: readFileSync(join(moduleRoot, 'assets/dnd5e.css'), 'utf8') });
        await page.addScriptTag({ content: code });
        const render = actor => page.evaluate(actor => window.skillFixture.render(actor), actor);
        await render(states.supported);
        if (width < 1024) {
            await page.getByRole('button', { name: '▲', exact: true }).click();
            await page.getByRole('button', { name: /Skills/ }).click();
        }
        const skill = page.locator('button').filter({ hasText: 'Perception' });
        for (const id of Object.keys(states).filter(id => id !== 'supported')) {
            await render(states.supported);
            await skill.click();
            await page.locator('dialog[open]').waitFor();
            assert.match(await page.locator('dialog[open]').innerText(), /1d20\+5/);
            await render(states[id]);
            await page.waitForFunction(() => !document.querySelector('dialog[open]'), undefined, { timeout: 1500 });
            assert.equal(await skill.isDisabled(), true, `${width}/${id} controls`);
            assert.match(await skill.innerText(), id.startsWith('range-') ? /\+5/ : /—/);
            await skill.dispatchEvent('click', { shiftKey: true });
            assert.equal(await page.evaluate(() => window.skillFixture.calls.length), 0, 'Unavailable shortcut dispatches no request');
            await render(states.supported);
            assert.equal(await skill.isEnabled(), true);
            await skill.click({ modifiers: ['Shift'] });
            assert.equal(await page.evaluate(() => window.skillFixture.calls.splice(0).length), 1);
            rows.push({ width, id, staleDialogRetired: true, shortcutBlocked: true, recovery: true });
        }
        // Also retain a real mounted consumer callback across loss and recovery;
        // closing DOM alone must not allow that old intent to become executable.
        await page.evaluate(actor => window.skillFixture.render(actor, true), states.supported);
        await skill.click();
        await page.evaluate(() => window.skillFixture.hold());
        await page.evaluate(actor => window.skillFixture.render(actor, true), states['snapshot-absent']);
        await page.evaluate(actor => window.skillFixture.render(actor, true), states.supported);
        assert.equal(await page.evaluate(() => window.skillFixture.submitHeld()), 'retired');
        assert.equal(await page.evaluate(() => window.skillFixture.calls.length), 0);
        assert.deepEqual(errors, []);
        await context.close();
    }
    writeFileSync(join(artifacts, 'evidence.json'), JSON.stringify({ evidence: 'Isolated mounted module R; SDK presentation seam; not installed Core U/I or native N/O',
        playwright: toolRequire('playwright/package.json').version, browser: browser.version(), rows }, null, 2));
    process.stdout.write(`Mounted module fixtures: ${rows.length} transitions and retained-callback fences PASS; artifacts ${artifacts}\n`);
} finally { await browser.close(); }
