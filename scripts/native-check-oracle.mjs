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
const sandbox = { foundry: { utils: { getProperty, getType: value => value && typeof value === 'object' ? 'Object' : typeof value, mergeObject: merge, deepClone: structuredClone, setProperty:(obj,path,value)=>{const keys=path.split('.');let cursor=obj;for(const key of keys.slice(0,-1))cursor=cursor[key]??={};cursor[keys.at(-1)]=value;} } },
    dnd5e: { settings: { proficiencyModifier: 'bonus', rulesVersion: 'modern' } },
    CONFIG: { DND5E: { skillPassive: {base:10,modifier:5}, maxAbilityScore: 30, abilities: Object.fromEntries(['str','dex','con','int','wis','cha'].map(key => [key, { type: ['str','dex','con'].includes(key) ? 'physical' : 'mental' }])) } },
    AppliedRules: { collect: () => ({ filterWith: () => ({ toFormula: (parts=[]) => parts.join(' + '), toAdvantageCounts: (counts={}) => counts, resolve: () => ({toSmallest:value=>value,toLargest:value=>value}) }) }) },
    _loc: value => value,
    console: { error: () => { throw new Error('Unqualified formula evaluation reached native oracle'); } },
};
const utils = ts.createSourceFile('utils.mjs', files.get('module/utils.mjs'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const simplify = utils.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'simplifyBonus').getText(utils).replace(/^export /, '');
const code = `Number.isNumeric = value => value !== null && value !== '' && typeof value !== 'boolean' && Number.isFinite(Number(value));
${files.get('module/documents/actor/proficiency.mjs').replace('export default class', 'class')}
${simplify}
class CommonTemplate { ${member(commonPath, 'CommonTemplate', 'prepareAbilities')}
${member(commonPath, 'CommonTemplate', 'calculateAbilityCheckProficiency')}
${member(commonPath, 'CommonTemplate', 'calculateToolProficiency')}
${member(commonPath, 'CommonTemplate', 'calculateSkillToolProficiency')}
static shimAbilityData() {} }
class CreatureTemplate extends CommonTemplate { ${member('module/data/actor/templates/creature.mjs', 'CreatureTemplate', 'prepareSkill')}
${member('module/data/actor/templates/creature.mjs', 'CreatureTemplate', 'prepareTools')} }
class AdvantageModeField { ${['combineFields','getCounts','resolveMode'].map(name => member(advantagePath, 'AdvantageModeField', name)).join('\n')} }
class D20RollModificationField { ${member('module/data/shared/d20-roll-modification-field.mjs', 'D20RollModificationField', 'combineFields')}
${member('module/data/shared/d20-roll-modification-field.mjs', 'D20RollModificationField', '#makeRulesIterator')} }
class D20Dialog { ${['_prepareButtonsContext','_finalizeConfig'].map(name => member('module/applications/dice/d20-configuration-dialog.mjs','D20RollConfigurationDialog',name)).join('\n')} }
class BasicDie { ${['expandAdvantage','advantage'].map(name => member('module/dice/basic-die.mjs', 'BasicDie', name)).join('\n')} }
class DialogBase { async _prepareConfigurationContext(context) {return context;} }
class NativeSkillDialog extends DialogBase {
${member('module/applications/dice/skill-tool-configuration-dialog.mjs','SkillToolRollConfigurationDialog','_prepareConfigurationContext')} }
class NativeActor {
${member('module/documents/actor/actor.mjs','Actor5e','#rollSkillTool')}
${member('module/documents/actor/actor.mjs','Actor5e','_buildSkillToolConfig')}
run(...args) {return this.#rollSkillTool(...args);} }
class NativeParts { ${member('module/dice/basic-roll.mjs','BasicRoll','constructParts')}
${member('module/dice/basic-roll.mjs','BasicRoll','mergeOptions')} }
globalThis.native = { NativeSkillDialog, NativeActor, NativeParts, CommonTemplate, CreatureTemplate, Proficiency, AdvantageModeField, D20RollModificationField, D20Dialog, BasicDie };`;
vm.runInNewContext(code, sandbox, { timeout: 1000 });
const { CommonTemplate, CreatureTemplate, Proficiency, AdvantageModeField, D20RollModificationField, D20Dialog, BasicDie } = sandbox.native;
assert.match(files.get('module/dice/d20-roll.mjs'), /NORMAL: 0,\s*ADVANTAGE: 1,\s*DISADVANTAGE: -1/);
sandbox.CONFIG.Dice={D20Roll:{ADV_MODE:{NORMAL:0,ADVANTAGE:1,DISADVANTAGE:-1}}};
let manualModeCases=0;
for(const mode of [-1,0,1]) {
    const dialog=Object.create(D20Dialog.prototype);dialog.options={};dialog.config={rolls:[{options:{advantageMode:mode}}]};
    const context=await dialog._prepareButtonsContext({},{});
    assert.equal(Object.keys(context.buttons).find(key=>context.buttons[key].default),mode===1?'advantage':mode===-1?'disadvantage':'normal');
    for(const [action,expected] of [['normal',0],['advantage',1],['disadvantage',-1]]) {
        const config={rolls:[{options:{advantageMode:mode}}]};dialog._finalizeConfig(config,action);
        assert.equal(config.rolls[0].options.advantageMode,expected);manualModeCases++;
    }
}
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
// Tool source phase: explicit declarations qualify defaults; plain stubs do
// not instantiate Foundry fields. Arithmetic below starts after initialization.
const toolSchema = files.get('module/data/actor/templates/creature.mjs').match(/tools: new MappingField\([\s\S]*?entryLabel:[^\n]+/)[0];
assert.match(toolSchema,/ability: "int"/);
assert.match(toolSchema,/bonuses: new SchemaField\(\{\}, \{ persisted: false \}\)/);
assert.match(toolSchema,/min: 0,[\s\S]*max: 2,[\s\S]*step: 0.5,[\s\S]*initial: 0/);
assert.doesNotMatch(toolSchema,/initialKeys/);
assert.match(files.get('module/data/shared/roll-config-field.mjs'),/initial: ability/);
const toolFixture = JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/tool-checks.json'),'utf8'));
assert.equal(toolFixture.nativeCommit,nativeCommit);
// Exact configured identities compared as syntax, not inferred from labels.
const configFile=ts.createSourceFile('config.mjs',files.get('module/config.mjs'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const configKeys=name=>configFile.statements.find(node=>ts.isExpressionStatement(node)&&ts.isBinaryExpression(node.expression)&&node.expression.left.getText(configFile)==='DND5E.'+name).expression.right.properties.map(node=>node.name.text);
const moduleTools=ts.createSourceFile('tools.ts',readFileSync(join(moduleRoot,'src/logic/preparation/check-identities.ts'),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const moduleKeys=moduleTools.statements.flatMap(node=>ts.isVariableStatement(node)?node.declarationList.declarations.filter(decl=>decl.name.getText(moduleTools)==='TOOL_LABELS_606').flatMap(decl=>decl.initializer.properties.map(prop=>prop.name.text)):[]);
assert.deepEqual(moduleKeys,[...configKeys('tools'),...configKeys('vehicleTypes')]);
const tools=[];
for (const row of toolFixture.cases) {
    const model=Object.create(CreatureTemplate.prototype);
    model.attributes={prof:Proficiency.calculateMod(row.level)};
    model.abilities={[row.ability]:{mod:Math.floor((row.score-10)/2),check:{roll:{bonus:row.bonuses[1]}}}};
    model.tools={[row.key]:{ability:row.ability,value:row.value ?? 0,roll:{bonus:row.bonuses[0]}}};
    model.rolls={ability:{check:{bonus:row.bonuses[2],proficiency:0},tool:{bonus:row.bonuses[3],proficiency:0}}};
    model.parent={flags:{dnd5e:{}},conditionRollReduction:0}; model.prepareTools();
    assert.equal(model.tools[row.key].total,row.expectedTotal,row.id);
    assert.equal(model.tools[row.key].prof.multiplier,row.expectedMultiplier,row.id);
    tools.push({id:row.id,total:model.tools[row.key].total,multiplier:model.tools[row.key].prof.multiplier,phase:'explicit-schema-defaults then prepared numeric methods'});
}
let toolModeCombinations=0;
for(const a of [-1,0,1])for(const b of [-1,0,1])for(const c of [-1,0,1])for(const d of [-1,0,1]) {
    const model={tools:{thief:{roll:{mode:a}}},abilities:{dex:{check:{roll:{mode:b}}}},rolls:{ability:{check:{mode:c},tool:{mode:d}}}};
    model._source=structuredClone(model);
    const result=D20RollModificationField.combineFields(model,['tools.thief.roll','abilities.dex.check.roll','rolls.ability.check','rolls.ability.tool']);
    const expected=([a,b,c,d].includes(1)?1:0)-([a,b,c,d].includes(-1)?1:0);
    assert.equal(Number(result.advantage)-Number(result.disadvantage),expected);toolModeCombinations++;
}
// Combined checks are an intermediate-model contract only; module rejects them.
// Native max proficiency plus advantage if both selected prepared profs >0.
const actorSource=files.get('module/documents/actor/actor.mjs');
assert.match(actorSource,/doubleProf = !!relevant\?\.prof.hasProficiency && !!alternate\?\.prof.hasProficiency/);
assert.match(actorSource,/advantages: \{ count: Number\(doubleProf\)/);
let combinedToolCases=0;
for(const skill of [0,.5,1,2])for(const tool of [0,.5,1,1.5,2]) {
    const model=Object.create(CommonTemplate.prototype);
    model.attributes={prof:3};model.rolls={ability:{check:{proficiency:0},tool:{proficiency:0},skill:{proficiency:0}}};
    model.skills={prc:{effectValue:skill}};model.tools={thief:{effectValue:tool}};model.parent={flags:{dnd5e:{}},_isRemarkableAthlete:()=>false};
    const prof=CommonTemplate.calculateSkillToolProficiency({system:model},'dex',{skill:'prc',tool:'thief'});
    assert.equal(prof.flat,Math.floor(3*Math.max(skill,tool)));combinedToolCases++;
}
// Fresh fully selected requests through the exact private dispatch and public
// builder. Build is a capture seam, not a dice evaluator/native engine.
const selectionFixture=JSON.parse(readFileSync(join(moduleRoot,'tests/fixtures/native-6.0.6/combined-checks.json'),'utf8'));
assert.equal(selectionFixture.nativeCommit,nativeCommit);
const {NativeActor,NativeParts}=sandbox.native;
sandbox.dnd5e.dataModels={actor:{CommonTemplate}};
sandbox.TravelField={getTravelPaceMode:()=>({advantage:false,disadvantage:false})};
sandbox.SkillToolRollConfigurationDialog=class {};
sandbox.Trait={keyLabel:key=>key};sandbox.ChatMessage={getSpeaker:()=>({})};
sandbox.CONFIG.DND5E.skills={prc:{ability:'wis',label:'Perception'}};
sandbox.CONFIG.DND5E.tools={thief:{ability:'dex'}};sandbox.CONFIG.DND5E.vehicleTypes={};
let capture;
Object.assign(sandbox.CONFIG.Dice.D20Roll,{
    constructParts:NativeParts.constructParts,mergeOptions:NativeParts.mergeOptions,
    mergeConfigs:(a,b={})=>merge(a,b),
    build:async(process,dialog)=>{const config={options:{advantage:process.advantage,disadvantage:process.disadvantage}};dialog.options.buildConfig(process,config,undefined,0);capture={process,config};return [];}
});
sandbox.foundry.data={fields:{StringField:class {constructor(options){this.options=options;}}}};
const nativeAbilityDialog=new sandbox.native.NativeSkillDialog();nativeAbilityDialog.options={chooseAbility:true};nativeAbilityDialog.config={ability:'dex'};
const abilityDialogContext=await nativeAbilityDialog._prepareConfigurationContext({fields:[]},{});
assert.equal(abilityDialogContext.fields[0].name,'ability');assert.equal(abilityDialogContext.fields[0].value,'dex');
assert.deepEqual(Array.from(abilityDialogContext.fields[0].options,entry=>entry.value),['str','dex','con','int','wis','cha']);
const nativeAbilityDialogChoices=6;
const selectionCases=[];let selectedModeCases=0;
for(const row of selectionFixture.cases) {
    const actor=new NativeActor(),model=Object.create(CreatureTemplate.prototype);
    model.abilities={wis:{value:14,mod:2,check:{roll:{bonus:4,mode:-1}}},dex:{value:16,mod:3,check:{roll:{bonus:-2,mode:1}}}};
    model.skills={prc:{value:row.skillValue,ability:'wis',roll:{bonus:1,mode:0},bonuses:{passive:''}}};
    model.tools={thief:{value:row.toolValue,ability:'dex',roll:{bonus:7,mode:0}}};
    model.attributes={prof:Proficiency.calculateMod(row.level??5)};model.rolls={ability:{check:{bonus:2,mode:0,proficiency:0},skill:{bonus:3,mode:0,proficiency:0},tool:{bonus:-1,mode:0,proficiency:0}}};
    model._source=structuredClone({abilities:model.abilities,skills:model.skills,tools:model.tools,rolls:model.rolls});
    actor.system=model;actor.flags={dnd5e:{}};actor.getFlag=()=>undefined;actor.getRollData=()=>({roll:{}});actor.addConditionRollReduction=()=>{};actor._isRemarkableAthlete=()=>false;actor.conditionRollReduction=0;
    model.parent=actor;model.skills.prc=model.prepareSkill('prc',{rollData:{},originalSkills:{}});model.prepareTools();
    const config={ability:row.ability,[row.kind]:row.kind==='skill'?'prc':'thief'};
    if(row.combined)Object.assign(config,{skill:'prc',tool:'thief'});
    await actor.run(row.kind,config);
    const {process,config:built}=capture;
    const mode=Number(process.advantage)-Number(process.disadvantage);
    assert.equal(mode,row.expectedMode,row.id);
    assert.equal(Number(built.data.prof??0),Math.floor(Proficiency.calculateMod(row.level??5)*row.expectedProficiency),row.id);
    const bonuses=row.kind==='skill'?(row.ability==='wis'?10:4):(row.ability==='wis'?12:6);
    assert.equal(built.data.mod+Number(built.data.prof??0)+bonuses,row.expectedTotal,row.id);
    assert.equal(built.data.ruleBonus,(row.ability==='wis'?'4':'-2')+' + 2 + '+(row.kind==='skill'?'3 + 1':'-1 + 7'));
    assert.deepEqual(Array.from(built.parts),row.expectedProficiency>0?['@mod','@prof','@ruleBonus']:['@mod','@ruleBonus']);
    selectionCases.push({id:row.id,mode,parts:Array.from(built.parts),mod:built.data.mod,prof:built.data.prof??null,bonus:built.data.ruleBonus,total:row.expectedTotal});
    if(row.id===row.kind+'-1-0.5-wis')for(const automatic of [false,true])for(const a of [-1,0,1])for(const b of [-1,0,1])for(const c of [-1,0,1])for(const d of [-1,0,1]) {
        const values=[a,b,c,d],paths=[row.kind+'s.'+(row.kind==='skill'?'prc':'thief')+'.roll','abilities.wis.check.roll','rolls.ability.check','rolls.ability.'+row.kind];
        paths.forEach((path,index)=>{getProperty(model,path).mode=values[index];getProperty(model._source,path).mode=values[index];});
        const request={ability:'wis',[row.kind]:row.kind==='skill'?'prc':'thief',...(automatic?{skill:'prc',tool:'thief'}:{})};
        await actor.run(row.kind,request);
        const observed=Number(capture.process.advantage)-Number(capture.process.disadvantage);
        assert.equal(observed,((automatic||values.includes(1))?1:0)-(values.includes(-1)?1:0));selectedModeCases++;
    }
    // Native in-place dialog ability edits rebuild parts/ranges, but retain the
    // process mode. Module selections instead configure a fresh request above.
    if(row.id==='independent-skill-wis') {
        const form={get:key=>key==='ability'?'dex':undefined},changed={options:{advantage:process.advantage,disadvantage:process.disadvantage}};
        actor._buildSkillToolConfig('skill',null,process,changed,form,0);
        assert.equal(changed.data.mod,3);assert.equal(changed.data.ruleBonus,'-2 + 2 + 3 + 1');
        assert.equal(changed.options.disadvantage,true);assert.equal(changed.options.advantage,false);
    }
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
    selectionCases, selectedModeCases, nativeAbilityDialogChoices, manualModeCases, declarations, abilities, tools, toolModeCombinations, combinedToolCases, sourceModeCombinations: modes, orderedD20Selections: selections, range: { minimum: 12, maximum: 14 },
    stubs: ['Numeric literal classification only; unknown evaluation fails', 'No applied rules/conditions/cover/flags', 'Empty ability compatibility shims; Remarkable Athlete false', 'Tool defaults checked as schema syntax then explicitly initialized; no Foundry DataModel construction', 'Property traversal and plain count merging', 'Actor build capture with no dice evaluation or hooks; no travel, transformations or flags', 'Native skill dialog context uses empty base context and a StringField options stub; not a DOM/DataModel', 'Native in-place ability form changes retain process mode; module configures fresh selected requests'],
    limits: fixture.exclusions };
const output = option(args, '--write-evidence');
if (output) writeFileSync(output, JSON.stringify(evidence, null, 2) + '\n');
process.stdout.write(`S: ${abilities.length} native intermediate/source-default ability/save cases, ${modes} source-mode combinations and ${selections} ordered d20 selections, ${tools.length} tools/${toolModeCombinations} modes/${combinedToolCases} intermediate combinations/${selectionCases.length} selected request builds/${selectedModeCases} selected modes PASS; no native/SDK engine acceptance\n`);
