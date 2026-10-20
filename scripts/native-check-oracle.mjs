import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { coreRoot, moduleRoot, option } from './lib/toolchain.mjs';
import { nativeCommit, readRelease } from './lib/native-release.mjs';

const args = process.argv.slice(2), repo = option(args, '--native', process.env.DND5E_NATIVE_ROOT);
if (!repo) throw new Error('Exact native oracle required: --native PATH');
const files = readRelease(repo), require = createRequire(join(coreRoot(args), 'package.json')), ts = require('typescript');
const fixture = JSON.parse(readFileSync(join(moduleRoot, 'tests/fixtures/native-6.0.6/ability-checks.json'), 'utf8'));
assert.equal(fixture.nativeCommit, nativeCommit);
function member(path, className, name) {
    const file = ts.createSourceFile(path, files.get(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const cls = file.statements.find(node => ts.isClassDeclaration(node) && node.name?.text === className);
    const method = cls?.members.find(node => ts.isMethodDeclaration(node) && node.name?.getText(file) === name);
    if (!method) throw new Error(`Missing exact native symbol ${className}.${name}`);
    return method.getText(file);
}
const commonPath = 'module/data/actor/templates/common.mjs', advantagePath = 'module/data/fields/advantage-mode-field.mjs';
const getProperty = (value, path) => typeof path === 'string' ? path.split('.').reduce((v, k) => v?.[k], value) : undefined;
const merge = (target, input) => { for (const [key, value] of Object.entries(input)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) target[key] = merge(target[key] ?? {}, value); else target[key] = value;
} return target; };
const sandbox = { foundry: { utils: { getProperty, getType: value => value && typeof value === 'object' ? 'Object' : typeof value, mergeObject: merge } },
    dnd5e: { settings: { proficiencyModifier: 'bonus', rulesVersion: 'modern' } },
    CONFIG: { DND5E: { skillPassive: {base:10,modifier:5}, maxAbilityScore: 30, abilities: Object.fromEntries(['str','dex','con','int','wis','cha'].map(key => [key, { type: ['str','dex','con'].includes(key) ? 'physical' : 'mental' }])) } },
    AppliedRules: { collect: () => ({ filterWith: () => ({ toFormula: () => '', toAdvantageCounts: () => ({}) }) }) },
    console: { error: () => { throw new Error('Unqualified formula evaluation reached native oracle'); } },
};
const utils = ts.createSourceFile('utils.mjs', files.get('module/utils.mjs'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const simplify = utils.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'simplifyBonus').getText(utils).replace(/^export /, '');
const code = `Number.isNumeric = value => value !== null && value !== '' && typeof value !== 'boolean' && Number.isFinite(Number(value));
${files.get('module/documents/actor/proficiency.mjs').replace('export default class', 'class')}
${simplify}
class CommonTemplate { ${member(commonPath, 'CommonTemplate', 'prepareAbilities')}
${member(commonPath, 'CommonTemplate', 'calculateAbilityCheckProficiency')}
static shimAbilityData() {} }
class CreatureTemplate extends CommonTemplate { ${member('module/data/actor/templates/creature.mjs', 'CreatureTemplate', 'prepareSkill')} }
class AdvantageModeField { ${['combineFields','getCounts','resolveMode'].map(name => member(advantagePath, 'AdvantageModeField', name)).join('\n')} }
class D20RollModificationField { ${member('module/data/shared/d20-roll-modification-field.mjs', 'D20RollModificationField', 'combineFields')}
${member('module/data/shared/d20-roll-modification-field.mjs', 'D20RollModificationField', '#makeRulesIterator')} }
class BasicDie { ${['expandAdvantage','advantage'].map(name => member('module/dice/basic-die.mjs', 'BasicDie', name)).join('\n')} }
globalThis.native = { CommonTemplate, CreatureTemplate, Proficiency, AdvantageModeField, D20RollModificationField, BasicDie };`;
vm.runInNewContext(code, sandbox, { timeout: 1000 });
const { CommonTemplate, CreatureTemplate, Proficiency, AdvantageModeField, D20RollModificationField, BasicDie } = sandbox.native;
// Verify exact schema declarations without constructing native runtime fields.
const creature = ts.createSourceFile('creature.mjs', files.get('module/data/actor/templates/creature.mjs'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const declarations = [];
function visit(node) {
    if (ts.isNewExpression(node) && node.expression.getText(creature) === 'NumberField') {
        const options = node.arguments?.[0]?.getText(creature) ?? '';
        const scope = options.match(/rolls\.ability\.(check|save|skill|tool)\.proficiency/);
        if (scope) { assert.match(options, /initial:\s*0/); assert.match(options, /persisted:\s*false/); declarations.push(scope[1]); }
    }
    ts.forEachChild(node, visit);
}
visit(creature); assert.deepEqual(declarations, ['check','save','skill','tool']);
const abilities = [];
for (const phase of ['intermediate', 'source-default']) for (const row of fixture.cases) {
    const model = Object.create(CommonTemplate.prototype);
    model.abilities = { [row.ability]: { value: row.score, proficient: row.proficient, max: null,
        attack: { roll: {} }, check: { roll: { bonus: row.checkBonus ?? '' } }, save: { roll: { bonus: row.saveBonus ?? '' } } } };
    model.attributes = { prof: Proficiency.calculateMod(row.levels.reduce((a, b) => a + b, 0)), ac: { cover: 0 } };
    model.rolls = { ability: { check: { bonus: row.globalCheckBonus ?? '', proficiency: phase === 'intermediate' ? row.checkProficiency : 0 }, save: { bonus: row.globalSaveBonus ?? '', proficiency: phase === 'intermediate' ? row.saveProficiency : 0 } } };
    model.parent = { flags: { dnd5e: {} }, conditionRollReduction: 0, coverBonus: 0, hasConditionEffect: () => false };
    model.prepareAbilities();
    const result = model.abilities[row.ability];
    const observed = { mod: result.mod, check: result.check.value, save: result.save.value };
    assert.deepEqual(observed, phase === 'intermediate' ? row.expected : row.sourceExpected, row.id+'/'+phase); abilities.push({ id: row.id, phase, observed });
}
const modeFixture = JSON.parse(readFileSync(join(moduleRoot, 'tests/fixtures/native-6.0.6/skill-modes.json'), 'utf8'));
assert.equal(modeFixture.nativeCommit, nativeCommit);
assert.match(files.get('module/config.mjs'), /skillPassive = \{\s*base: 10,\s*modifier: 5/);
let modes = 0;
for (const row of modeFixture.cases) {
    const model = Object.create(CreatureTemplate.prototype);
    model.attributes = {prof:3}; model.abilities = {wis:{value:14,mod:2,check:{roll:{mode:row.modes[0]}}}};
    model.skills = {prc:{value:1,ability:'wis',roll:{mode:row.modes[1]},bonuses:{passive:''}}};
    model.rolls = {ability:{check:{mode:row.modes[2],proficiency:0},skill:{mode:row.modes[3],proficiency:0}}};
    model.parent = {flags:{dnd5e:{}},conditionRollReduction:0};
    model._source = structuredClone({abilities:model.abilities,skills:model.skills,rolls:model.rolls});
    const paths = modeFixture.scopeOrder.map(path => path+'.mode');
    assert.equal(AdvantageModeField.combineFields(model, paths).mode, row.expectedMode);
    const observed = model.prepareSkill('prc',{skillData:model.skills.prc,rollData:{},originalSkills:{}});
    assert.equal(observed.total, row.expectedTotal); assert.equal(observed.passive, row.expectedPassive);
    modes++;
}
const rangeModel = { a: { min: 10 }, b: { max: 15 }, c: { min: 12 }, d: { max: 14 }, _source: {} };
const range = D20RollModificationField.combineFields(rangeModel, ['a','b','c','d']);
assert.equal(range.minimum, 12); assert.equal(range.maximum, 14);
const defaults = D20RollModificationField.combineFields({ a: { min: null, max: null }, _source: {} }, ['a']);
assert.equal(defaults.minimum, -Infinity); assert.equal(defaults.maximum, Infinity);
let selections = 0;
for (const adv of [false,true]) for (let a = 1; a <= 20; a++) for (let b = 1; b <= 20; b++) {
    const die = Object.create(BasicDie.prototype);
    die.number = 1; die.options = {}; die.modifiers = [adv ? 'adv' : 'dis'];
    die.expandAdvantage(); assert.equal(die._number, 2);
    die.results = [{ result: a, active: true }, { result: b, active: true }];
    await die.advantage(adv ? 'adv' : 'dis');
    const kept = die.results.filter(value => value.active);
    assert.equal(kept.length, 1); assert.equal(kept[0].result, adv ? Math.max(a, b) : Math.min(a, b));
    if (a === b) assert.equal(die.results[0].active, true);
    selections++;
}
const evidence = { evidence: 'S controlled exact native methods, not native/SDK engine execution', nativeCommit,
    declarations, abilities, sourceModeCombinations: modes, orderedD20Selections: selections, range: { minimum: 12, maximum: 14 },
    stubs: ['Numeric literal classification only; unknown evaluation fails', 'No applied rules/conditions/cover/flags', 'Empty ability compatibility shims', 'Property traversal and plain count merging'],
    limits: fixture.exclusions };
const output = option(args, '--write-evidence');
if (output) writeFileSync(output, JSON.stringify(evidence, null, 2) + '\n');
process.stdout.write(`S: ${abilities.length} native intermediate/source-default ability/save cases, ${modes} source-mode combinations and ${selections} ordered d20 selections PASS; no native/SDK engine acceptance\n`);
