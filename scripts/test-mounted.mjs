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
import { abilityCases, abilitySource } from ${JSON.stringify(join(moduleRoot, 'src/tests/fixtures/ability-scenarios.ts'))};
const adapter = new DnD5eAdapter();
const prepare = (input = skillSource(), context = skillContext()) => adapter.prepareActorData(input, context);
const states = { supported: prepare() };
for (const {id, context} of unavailableContexts()) states[id] = prepare(skillSource(), context);
for (const scope of rollScopes) for (const field of ['min','max']) {
    const bounded = skillSource(); setSkillRoll(bounded, scope, {[field]:10}); states['range-'+scope+'-'+field] = prepare(bounded);
}
const abilities = { supported: prepare(abilitySource(abilityCases[2])) };
for (const {id, context} of unavailableContexts()) abilities[id] = prepare(abilitySource(abilityCases[2]), context);
for (const type of ['check','save']) for (const scope of ['local','global']) for (const field of ['min','max']) {
    const actor = abilitySource(abilityCases[2]);
    const target = scope === 'local' ? actor.system.abilities.wis[type].roll : actor.system.rolls.ability[type];
    target[field] = 10; abilities[type+'-'+scope+'-'+field] = prepare(actor);
}
const facts = { supported: {actor: states.supported, expected: 5} };
for (const {id, context} of unavailableContexts()) facts[id] = {actor: prepare(skillSource(), context), expected: null};
const invalid = skillSource(); invalid.items[0].system.levels = 'unknown'; facts.invalid = {actor: prepare(invalid), expected: null};
const armor = skillSource(); armor.items.push({_id:'armor',name:'Armor',type:'equipment',system:{equipped:true}}); facts.armor = {actor:prepare(armor),expected:5};
const effect = skillSource(); effect.effects = [{disabled:false}]; facts.effect = {actor:prepare(effect),expected:null};
const poison = skillSource(); poison.system.details = {level:99}; poison.system.attributes.prof = 99;
facts.poison = {actor:prepare(poison,unavailableContexts()[1].context),expected:null};
for (const value of Object.values(facts)) value.card = adapter.getActorCardData(value.actor);
const modes = {};
for (const kind of ['skill','ability','save']) {
    modes[kind] = [];
    for (const mode of [-1,0,1]) {
        const actor = kind === 'skill' ? skillSource() : abilitySource(abilityCases[1]);
        const local = kind === 'skill' ? 'skills.prc.roll' : 'abilities.wis.'+(kind === 'ability'?'check':'save')+'.roll';
        const global = 'rolls.ability.'+(kind === 'skill'?'check':kind === 'ability'?'check':'save');
        setSkillRoll(actor,local,{mode:mode === 0?1:mode});
        if (mode === 0) setSkillRoll(actor,global,{mode:-1});
        const prepared=adapter.prepareActorData(actor,{...skillContext(),sourceRevision:100+mode});
        modes[kind].push({actor:prepared,mode,formula:adapter.getRollData(prepared,kind,kind==='skill'?'prc':'wis')?.formula ?? null});
    }
}
process.stdout.write(JSON.stringify({skills: states, abilities, facts, modes}));`);
const result = spawnSync(process.execPath, [join(core, 'node_modules/tsx/dist/cli.mjs'), '--tsconfig', join(core, 'tsconfig.json'), driver], { cwd: core, encoding: 'utf8' });
if (result.status !== 0) throw new Error(result.stderr);
const { skills: states, abilities: abilityStates, facts, modes } = JSON.parse(result.stdout);
const bundle = await build({ entryPoints: [join(moduleRoot, 'tests/browser/skill-lifecycle.tsx')], bundle: true, write: false,
    platform: 'browser', format: 'iife', jsx: 'automatic', tsconfig: join(core, 'tsconfig.json'),
    plugins: [{ name: 'isolated-sdk-presentation', setup(build) {
        build.onResolve({ filter: /^@sheet-delver\/sdk(?:\/react)?$/ }, () => ({ path: join(moduleRoot, 'tests/browser/sdk-fixture.tsx') }));
    } }], define: { 'process.env.NODE_ENV': '"development"' }, logLevel: 'silent' });
const code = bundle.outputFiles[0].text;
writeFileSync(join(artifacts, 'fixture.js'), code);
const executablePath = option(args, '--chromium', process.env.DND5E_CHROMIUM);
const rows = [], previewRows = [], factRows = [], modeRows = [], browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
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
        const verifyOptions = async (control, kind, total) => {
            await control.click();
            const dialog = page.locator('dialog[open]'), bonus = dialog.getByRole('textbox', { name: 'Situational bonus' });
            for (const unsupported of ['1d4', '1+2']) {
                await bonus.fill(unsupported);
                assert.match(await dialog.innerText(), /Unavailable: situational bonus outside the supported numeric profile/);
                for (const name of ['Advantage', 'Normal', 'Disadvantage']) assert.equal(await dialog.getByRole('button', { name, exact: true }).isDisabled(), true);
                assert.equal(await page.evaluate(() => window.skillFixture.calls.length), 0);
            }
            await bonus.fill('2');
            assert.match(await dialog.innerText(), new RegExp('1d20\\+'+total+'\\+\\(2\\)'));
            await dialog.getByRole('button', { name: 'Normal', exact: true }).click();
            const calls = await page.evaluate(() => window.skillFixture.calls.splice(0));
            assert.equal(calls.length, 1);
            assert.equal(calls[0].options.situationalBonus, '2');
            assert.equal(calls[0].options.advantage, 'normal');
            previewRows.push({ width, kind, unsupported: ['1d4', '1+2'], preview: `1d20+${total}+(2)`, submitted: 'normal with numeric2' });
        };
        await render(states.supported);
        if (width < 1024) {
            await page.getByRole('button', { name: '▲', exact: true }).click();
            await page.getByRole('button', { name: /Skills/ }).click();
        }
        const skill = page.locator('button').filter({ hasText: 'Perception' });
        await verifyOptions(skill, 'skill', 5);
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
        for (const kind of ['ability', 'save']) {
            await render(abilityStates.supported);
            const domain = kind === 'ability' ? 'check' : 'save';
            const control = page.getByRole('button', { name: kind === 'ability' ? 'Wisdom Check' : 'Wisdom Saving Throw', exact: true });
            for (const id of Object.keys(abilityStates).filter(id => id !== 'supported' && (!/^(check|save)-/.test(id) || id.startsWith(domain+'-')))) {
                await render(abilityStates.supported);
                await control.click();
                await page.locator('dialog[open]').waitFor();
                assert.match(await page.locator('dialog[open]').innerText(), kind === 'ability' ? /1d20\+5/ : /1d20\+10/);
                await render(abilityStates[id]);
                await page.waitForFunction(() => !document.querySelector('dialog[open]'), undefined, { timeout: 1500 });
                assert.equal(await control.isDisabled(), true);
                await control.dispatchEvent('click', { shiftKey: true });
                assert.equal(await page.evaluate(() => window.skillFixture.calls.length), 0);
                await render(abilityStates.supported);
                assert.equal(await control.isEnabled(), true);
                await control.click({ modifiers: ['Shift'] });
                assert.equal(await page.evaluate(() => window.skillFixture.calls.splice(0).length), 1);
                rows.push({ width, kind, id, staleDialogRetired: true, shortcutBlocked: true, recovery: true });
            }
            await control.click();
            await page.getByRole('button', { name: /^normal$/i }).click();
            assert.equal(await page.evaluate(() => window.skillFixture.calls.splice(0).length), 1, 'Fresh dialog confirmation dispatches once');
            await verifyOptions(control, kind, kind === 'ability' ? 5 : 10);
            await page.evaluate(({actor, kind}) => window.skillFixture.render(actor, kind), {actor: abilityStates.supported, kind});
            await control.click(); await page.evaluate(() => window.skillFixture.hold());
            await page.evaluate(({actor, kind}) => window.skillFixture.render(actor, kind), {actor: abilityStates['snapshot-absent'], kind});
            await page.evaluate(({actor, kind}) => window.skillFixture.render(actor, kind), {actor: abilityStates.supported, kind});
            assert.equal(await page.evaluate(() => window.skillFixture.submitHeld()), 'retired');
            assert.equal(await page.evaluate(() => window.skillFixture.calls.length), 0);
        }
        for (const [id, state] of Object.entries(facts)) {
            const level = state.expected, prof = level === null ? '—' : '+3';
            assert.equal(state.card.blocks.find(b => b.title === 'Level').value, level ?? '—');
            assert.equal(state.card.blocks.find(b => b.title === 'Prof').value, prof);
            if (level === null) assert.ok(state.card.blocks.find(b => b.title === 'Prof').subValue);
            await render(state.actor);
            assert.match(await page.getByLabel('Character level', {exact:true}).innerText(), level === null ? /^—/ : /^5$/);
            assert.match(await page.getByLabel('Proficiency bonus', {exact:true}).innerText(), level === null ? /^—/ : /^\+3$/);
            assert.ok(await page.getByLabel('Character level', {exact:true}).getAttribute('title'), 'Provenance is exposed');
            await render(facts.supported.actor);
            assert.equal(await page.getByLabel('Character level', {exact:true}).innerText(), '5');
            assert.equal(await page.getByLabel('Proficiency bonus', {exact:true}).innerText(), '+3');
            factRows.push({width,id,cardProjection:true,mountedHeaderAndProficiency:true,recovery:true});
        }
        const tab = async name => { if (width < 1024) { await page.getByRole('button', {name:'▲',exact:true}).click(); await page.getByRole('button',{name:new RegExp(name)}).click(); } };
        for (const kind of ['skill','ability','save']) {
            await render(kind==='skill'?states.supported:abilityStates.supported);
            await tab(kind==='skill'?'Skills':'Abilities');
            const control = kind==='skill'?skill:page.getByRole('button',{name:kind==='ability'?'Wisdom Check':'Wisdom Saving Throw',exact:true});
            for (const state of modes[kind]) {
                await render(kind==='skill'?states.supported:abilityStates.supported);
                await control.click(); await page.locator('dialog[open]').waitFor();
                await render(state.actor);
                await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
                assert.equal(await control.isEnabled(),true);
                for (const [name,choice,die] of [['Normal','normal','1d20'],['Advantage','adv','2d20kh1'],['Disadvantage','dis','2d20kl1']]) {
                    await control.click();
                    assert.ok((await page.locator('dialog[open]').innerText()).includes(state.formula));
                    const button=page.getByRole('button',{name,exact:true});
                    assert.equal(await button.isEnabled(),true);
                    await page.getByRole('textbox',{name:'Situational bonus'}).fill('2');
                    await button.focus();
                    const expected=die+'+'+(kind==='ability'?2:5)+'+(2)';
                    assert.ok((await page.locator('dialog[open]').innerText()).includes(expected),'Focused mode previews its exact request');
                    await button.click();
                    const calls=await page.evaluate(()=>window.skillFixture.calls.splice(0));
                    assert.equal(calls.length,1);assert.equal(calls[0].options.advantage,choice);assert.equal(calls[0].formula,expected);
                }
                await control.click({modifiers:['Shift']});
                const shortcut=await page.evaluate(()=>window.skillFixture.calls.splice(0));
                assert.equal(shortcut.length,1);assert.equal(shortcut[0].options,undefined);assert.equal(shortcut[0].formula,state.formula);
                if (kind==='skill') {
                    await tab('Abilities');
                    assert.equal(await page.getByLabel('Passive Perception',{exact:true}).innerText(),String(15+state.mode*5));
                    await tab('Skills');
                }
                modeRows.push({width,kind,mode:state.mode,formula:state.formula,staleRetired:true,execution:'qualified-normal-adv-dis'});
            }
        }
        for (const kind of ['skill','ability','save']) {
            const state=modes[kind][2].actor, baseline=kind==='skill'?states.supported:abilityStates.supported;
            const probe=kind==='skill'?true:kind;
            await page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor:state,probe});
            const control=kind==='skill'?skill:page.getByRole('button',{name:kind==='ability'?'Wisdom Check':'Wisdom Saving Throw',exact:true});
            await control.click();await page.evaluate(()=>window.skillFixture.hold());
            await page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor:baseline,probe});
            await page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor:state,probe});
            assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld({advantage:'adv'})),'retired');
            assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
        }
        assert.deepEqual(errors, []);
        await context.close();
    }
    writeFileSync(join(artifacts, 'evidence.json'), JSON.stringify({ evidence: 'Isolated mounted module R; SDK presentation seam; not installed Core U/I or native N/O',
        playwright: toolRequire('playwright/package.json').version, browser: browser.version(), rows, previewRows, factRows, modeRows }, null, 2));
    process.stdout.write(`Mounted module fixtures: ${rows.length} transitions, ${previewRows.length} preview validations, ${factRows.length} fact projections, ${modeRows.length} source modes and retained-callback fences PASS; artifacts ${artifacts}\n`);
} finally { await browser.close(); }
