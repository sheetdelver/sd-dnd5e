import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { coreRoot, moduleRoot, option } from './lib/toolchain.mjs';

const args = process.argv.slice(2), core = coreRoot(args);
const indicatorDiagnosticsOnly=args.includes('--indicator-diagnostics');
const trainingDiagnosticsOnly=args.includes('--training-diagnostics');
const filtersOnly=args.includes('--filters-only');
const classFactsOnly=args.includes('--class-facts-only');
const conditionsOnly=args.includes('--conditions-only');
const familyOnly=args.includes('--condition-family-only');
const finalModesOnly=args.includes('--final-modes-only');
const finalProficienciesOnly=args.includes('--final-proficiencies-only');
const finalBonusesOnly=args.includes('--final-bonuses-only');
const conditionCustomOnly=args.includes('--condition-custom-strings-only');
const featCustomRepresentatives=args.includes('--feat-final-custom-strings-representatives-only');
const featCustomOnly=args.includes('--feat-final-custom-strings-only')||featCustomRepresentatives;
const itemCustomRepresentatives=args.includes('--item-custom-strings-representatives-only');
const itemCustomOnly=args.includes('--item-custom-strings-only')||itemCustomRepresentatives;
const initialCustomOnly=args.includes('--initial-custom-strings-only');
const finalCustomOnly=args.includes('--final-custom-strings-only')||initialCustomOnly||conditionCustomOnly||itemCustomOnly||featCustomOnly;
const finalCiOnly=args.includes('--final-ci-conditions-only');
const finalTrainingOnly=args.includes('--final-training-sets-only');
const finalDefenseOnly=args.includes('--final-defense-sets-only');
const sourceFlagsOnly=args.includes('--source-flags-only');
const finalNumbersOnly=args.includes('--final-numbers-only');
const petrificationOnly=args.includes('--petrification-only');
const exhaustionFixedOnly=args.includes('--exhaustion-fixed-only');
const exhaustionOnly=args.includes('--exhaustion-only')||exhaustionFixedOnly;
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
import { toolCases, toolSource } from ${JSON.stringify(join(moduleRoot, 'src/tests/fixtures/tool-scenarios.ts'))};
import { combinedCases, combinedSource } from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/combined-scenarios.ts'))};
import effectFixture from ${JSON.stringify(join(moduleRoot,'tests/fixtures/native-6.0.6/effect-phases.json'))};
import {numericEffectCases,numericEffectSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/effect-scenarios.ts'))};
import {itemEffectCases,itemEffectSource,itemEffectExpected} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/item-effect-scenarios.ts'))};
import {bonusEffectCases,bonusEffectSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/bonus-effect-scenarios.ts'))};
import {modeEffectCases,modeEffectSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/mode-effect-scenarios.ts'))};
import {healthCases,healthSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/health-scenarios.ts'))};
import {defenseCases,defenseSource,defenseContext,defenseRangeSuffix} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/defense-scenarios.ts'))};
import {equipmentCases,equipmentSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/equipment-scenarios.ts'))};
import {movementCases,movementSource,movementContext} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/movement-scenarios.ts'))};
import {normalRangeCases,rangeSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/range-scenarios.ts'))};
import {speciesCases,speciesSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/species-scenarios.ts'))};
import {defenseTraitCases,defenseTraitSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/defense-trait-scenarios.ts'))};
import {traitEffectCases,traitEffectSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/trait-effect-scenarios.ts'))};
import {proficiencyIndicatorCases,proficiencyIndicatorSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/proficiency-indicator-scenarios.ts'))};
import {trainingCases,trainingSource,trainingContext} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/training-scenarios.ts'))};
import {trainingEffectCases,trainingEffectSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/training-effect-scenarios.ts'))};
import {filterCases,filterSource,filterExpected} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/filter-scenarios.ts'))};
import {initialFilterCases,initialFilterSource,initialFilterExpected} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/initial-filter-scenarios.ts'))};
import {initialCollectionFilterCases,initialCollectionFilterSource,initialCollectionFilterExpected} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/initial-collection-filter-scenarios.ts'))};
import {initialClassFilterCases,initialClassFilterSource,initialClassFilterExpected} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/initial-class-filter-scenarios.ts'))};
import {conditionCases,conditionSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/condition-scenarios.ts'))};
import {exhaustionCases,exhaustionSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/exhaustion-scenarios.ts'))};
import {familyCases,familySource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/condition-family-scenarios.ts'))};
import {finalNumberCases,finalNumberSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-number-scenarios.ts'))};
import {finalBonusCases,finalBonusSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-bonus-scenarios.ts'))};
import {finalProficiencyCases,finalProficiencySource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-proficiency-scenarios.ts'))};
import {finalModeCases,finalModeSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-mode-scenarios.ts'))};
import {petrificationCases,petrificationSource,petrificationModeCases,petrificationModeSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/petrification-scenarios.ts'))};
import {sourceFlagCases,sourceFlagSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/source-flag-scenarios.ts'))};
import {finalDefenseCases,finalDefenseSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-defense-scenarios.ts'))};
import defenseRegistry from ${JSON.stringify(join(moduleRoot,'tests/fixtures/native-6.0.6/defense-registries.json'))};
import {finalTrainingCases,finalTrainingSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-training-scenarios.ts'))};
import finalTrainingRegistry from ${JSON.stringify(join(moduleRoot,'tests/fixtures/native-6.0.6/training-registries.json'))};
import {conditionCustomCases,conditionCustomSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/condition-custom-scenarios.ts'))};
import {initialCustomCases,initialCustomSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/initial-custom-scenarios.ts'))};
import {itemCustomCases,itemCustomSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/item-custom-scenarios.ts'))};
import {featCustomCases,featCustomSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/feat-custom-scenarios.ts'))};
import {finalCustomCases,finalCustomSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-custom-scenarios.ts'))};
import {finalCiCases,finalCiSource} from ${JSON.stringify(join(moduleRoot,'src/tests/fixtures/final-ci-scenarios.ts'))};
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
const tools={supported:prepare(toolSource())}, toolExamples=toolCases.map(row=>({actor:prepare(toolSource(row)),key:row.key,total:row.expectedTotal,prof:row.expectedMultiplier,ability:row.ability}));
for(const {id,context} of unavailableContexts())tools[id]=prepare(toolSource(),context);
for(const path of ['tools.thief.roll','abilities.dex.check.roll','rolls.ability.check','rolls.ability.tool'])for(const field of ['min','max']){const actor=toolSource();setSkillRoll(actor,path,{[field]:10});tools['range-'+path+'-'+field]=prepare(actor);}
for(const patch of [{value:'1'},{ability:'missing'},{roll:{bonus:'1d4'}},{roll:{mode:2}}]){const actor=toolSource();Object.assign(actor.system.tools.thief,patch);tools['malformed-'+JSON.stringify(patch)]=prepare(actor);}
const effectTool=toolSource();effectTool.effects=[{disabled:false}];tools.effect=prepare(effectTool);
const toolModes=[];for(const mode of [-1,0,1]){const actor=toolSource();setSkillRoll(actor,'tools.thief.roll',{mode:mode===0?1:mode});if(mode===0)setSkillRoll(actor,'rolls.ability.tool',{mode:-1});toolModes.push({actor:adapter.prepareActorData(actor,{...skillContext(),sourceRevision:200+mode}),mode,formula:(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+'+5'});}
const combinations=combinedCases.map(row=>({...row,actor:prepare(combinedSource(row))}));
const effectCases=effectFixture.cases.map((row,index)=>{const source=skillSource();source.effects=row.effects;source.items.push(...row.items);return {id:row.id,ready:row.expected.ready,formula:row.expected.formula??'1d20+5',actor:adapter.prepareActorData(source,{...skillContext(),sourceRevision:300+index})};});
const numericEffects=[...conditionCases.map(row=>({id:'condition:'+row.id,expected:row.expected?{...row.expected,combinedTool:row.expected.combined}:undefined,actor:prepare(conditionSource(row))})),...initialClassFilterCases.filter(row=>!row.inputOnly).map(row=>({id:'initial-filter:class:'+row.id,expected:initialClassFilterExpected(row),actor:prepare(initialClassFilterSource(row))})),...initialCollectionFilterCases.map(row=>({id:'initial-filter:collection:'+row.id,expected:initialCollectionFilterExpected(row),actor:prepare(initialCollectionFilterSource(row))})),...initialFilterCases.map(row=>({id:'initial-filter:'+row.id,expected:initialFilterExpected(row),actor:prepare(initialFilterSource(row))})),...filterCases.map(row=>({id:'constant-filter:'+row.id,expected:filterExpected(row),actor:prepare(filterSource(row))})),...trainingEffectCases.map(row=>({id:'training-set:'+row.id,expected:row.expectedOperands||['final-training','custom-string-not-set'].includes(row.id)?{skill:5,tool:5,check:2,save:2,passive:15,combined:5,combinedTool:5,combinedMode:1}:undefined,actor:prepare(trainingEffectSource(row))})),...traitEffectCases.map(row=>({id:'trait-effect:'+row.id,expected:row.expectedOperands||row.id==='unavailable-final'?{skill:5,tool:5,check:2,save:2,passive:15,combined:5,combinedTool:5,combinedMode:1}:undefined,actor:prepare(traitEffectSource(row))})),...itemEffectCases.map(row=>({id:'item-default:'+row.id,expected:itemEffectExpected(row),actor:prepare(itemEffectSource(row))})),...numericEffectCases.map(row=>({id:row.id,expected:row.expected,actor:prepare(numericEffectSource(row))})),...bonusEffectCases.map(row=>({id:'constant:'+row.id,expected:row.expected,actor:prepare(bonusEffectSource(row))}))];
const modeEffects=modeEffectCases.map(row=>({id:row.id,expected:row.expected,actor:prepare(modeEffectSource(row))}));
const healthActors=healthCases.map(row=>({...row,actor:prepare(healthSource(row))}));
for(const {id,context} of unavailableContexts())healthActors.push({id,actor:prepare(healthSource(healthCases[0]),context),hpUnavailable:true,hdUnavailable:true});
const movementActors=movementCases.map((row,index)=>({...row,actor:adapter.prepareActorData(movementSource(row),{...movementContext(row),sourceRevision:3000+index})}));
const movementUnavailable=unavailableContexts().map(({id,context})=>({id,expected:{movement:null,senses:null},actor:adapter.prepareActorData(movementSource(movementCases[0]),context)}));
const equipmentActors=equipmentCases.map((row,index)=>({...row,actor:adapter.prepareActorData(equipmentSource(row),{...skillContext(),sourceRevision:2000+index})}));
const equivalentArmorSource=equipmentSource(equipmentCases.find(row=>row.id==='stealth-disadvantage-after-passive'));const sameArmor=equivalentArmorSource.items.find(item=>item.type==='equipment');sameArmor._id='different-owned-armor';sameArmor.uuid='Actor.'+equivalentArmorSource._id+'.Item.'+sameArmor._id;const equipmentEquivalent=adapter.prepareActorData(equivalentArmorSource,{...skillContext(),sourceRevision:2000+equipmentCases.findIndex(row=>row.id==='stealth-disadvantage-after-passive')});
const defenseTraits=defenseTraitCases.map(row=>{const actor=prepare(defenseTraitSource(row));return {...row,actor,card:adapter.getActorCardData(actor)};});
for(const row of traitEffectCases){const actor=prepare(traitEffectSource(row));defenseTraits.push({id:'trait-effect:'+row.id,expected:Object.fromEntries(['dr','di','dv','ci','dm'].map(k=>[k,row.expectedOperands||row.id==='unavailable-final'?{}:null])),actor,card:adapter.getActorCardData(actor)});}
for(const {id,context} of unavailableContexts()){const actor=prepare(defenseTraitSource(defenseTraitCases[1]),context);defenseTraits.push({id,expected:Object.fromEntries(['dr','di','dv','ci','dm'].map(k=>[k,null])),actor,card:adapter.getActorCardData(actor)});}
const finalNumberRows=finalNumberCases.filter((row,index)=>index<36||[432,864].some(base=>index>=base&&index<base+36&&(index-base)%6===2)||index>=1296);
const finalNumberActors=${finalNumbersOnly ? "finalNumberRows.map(row=>({id:row.id,expected:row.expected,actor:prepare(finalNumberSource(row))}))" : '[]'};
const finalNumberTieActors=${finalNumbersOnly ? "finalNumberRows.filter(row=>row.path==='abilities.dex.value').map(row=>{const context=skillContext();context.world.settings['dnd5e.initiativeDexTiebreaker']={status:'world',value:true};return {id:row.id,expected:row.expected,actor:prepare(finalNumberSource(row),context)};})" : '[]'};
const finalNumberFixedActors=${finalNumbersOnly ? "[finalNumberCases[0],finalNumberCases.at(-1)].map(row=>{const context=skillContext();context.world.settings['dnd5e.initiativeDexTiebreaker']={status:'world',value:true};context.world.settings['dnd5e.initiativeScore']={status:'world',value:'all'};return {id:row.id,expected:row.expected,actor:prepare(finalNumberSource(row),context)};})" : '[]'};
const finalNumberLiveSource=finalNumberSource(finalNumberCases[0]),finalNumberLive=prepare(finalNumberLiveSource);finalNumberLiveSource.effects[1]._id='changedFinalNumber';const finalNumberEquivalent=prepare(finalNumberLiveSource);finalNumberLiveSource.effects[1].system.changes[0].value='@abilities.wis.mod';const finalNumberUnavailable=prepare(finalNumberLiveSource);
const finalBonusActors=${finalBonusesOnly ? "finalBonusCases.filter(row=>row.before==='2'&&row.change.value==='-3').map(row=>({id:row.id,expected:row.expected,actor:prepare(finalBonusSource(row))}))" : '[]'};
const finalBonusLiveRow=finalBonusCases.find(row=>row.path==='skills.prc.roll.bonus'&&row.before==='2'&&row.change.type==='add'&&row.change.value==='2'),finalBonusLiveSource=finalBonusSource(finalBonusLiveRow),finalBonusLive=prepare(finalBonusLiveSource);finalBonusLiveSource.effects[0]._id='changedFinalBonus';const finalBonusEquivalent=prepare(finalBonusLiveSource);finalBonusLiveSource.effects[0].system.changes[0].value='1d4';const finalBonusUnavailable=prepare(finalBonusLiveSource);
const finalBonusFixed=${finalBonusesOnly}?finalBonusCases.filter(row=>row.before==='2'&&row.change.type==='add'&&row.change.value==='2'&&['attributes.init.roll.bonus','rolls.ability.check.bonus','abilities.dex.check.roll.bonus'].includes(row.path)).map(row=>{const context=skillContext();context.world.settings['dnd5e.initiativeScore']={status:'world',value:'all'};return {id:row.id,expected:row.expected,actor:prepare(finalBonusSource(row),context)};}):[];
const finalProficiencyActors=${finalProficienciesOnly ? "[...new Map(finalProficiencyCases.filter(row=>row.skillValue===0&&row.toolValue===0||row.initial.check===.5&&row.skillValue===1&&row.toolValue===1).map(row=>[row.scope+'/'+row.change.type+'/'+row.sourceMode+'/'+row.expected.automaticAdvantage,row])).values()].map(row=>({id:row.id,expected:row.expected,actor:prepare(finalProficiencySource(row))}))" : '[]'};
const finalProficiencyLiveSource=finalProficiencySource(finalProficiencyCases[0]),finalProficiencyLive=prepare(finalProficiencyLiveSource);finalProficiencyLiveSource.effects[1]._id='changedFinalProficiency';const finalProficiencyEquivalent=prepare(finalProficiencyLiveSource);finalProficiencyLiveSource.effects[1].system.changes[0].value=1.5;const finalProficiencyUnavailable=prepare(finalProficiencyLiveSource);
const finalModeActors=${finalModesOnly ? "finalModeCases.filter(row=>row.context==='none'&&row.sourceMode!==0&&(row.change.type==='add'&&row.change.value===1||row.change.type==='override'&&row.change.value===0)||row.context==='poisoned'&&row.sourceMode===0&&row.path==='abilities.wis.check.roll.mode'||row.context==='incapacity-invisible'&&row.sourceMode===0&&row.path==='attributes.init.roll.mode').map(row=>({id:row.id,expected:row.expected,actor:prepare(finalModeSource(row))}))" : '[]'};
const finalModeFixedActors=${finalModesOnly ? "['none/attributes.init.roll.mode/1/override/0','none/attributes.init.roll.mode/-1/override/1','incapacity-invisible/attributes.init.roll.mode/0/override/1','poisoned/rolls.ability.check.mode/0/override/1'].map(id=>{const row=finalModeCases.find(row=>row.id===id),context=skillContext();context.world.settings['dnd5e.initiativeScore']={status:'world',value:'all'};return {id,expected:row.expected,actor:adapter.prepareActorData(finalModeSource(row),context)};})" : '[]'};
const finalLiveRow=finalModeCases.find(row=>row.id==='none/rolls.ability.check.mode/0/add/1'),finalLiveSource=finalModeSource(finalLiveRow),finalLive=prepare(finalLiveSource);finalLiveSource.effects[1]._id='changedFinalEffect';const finalEquivalent=prepare(finalLiveSource);finalLiveSource.effects[1].system.changes[0].key='system.skills.prc.total';const finalUnavailable=prepare(finalLiveSource);const finalItemSource=finalModeSource(finalLiveRow),finalItemEffect=finalItemSource.effects.pop();finalItemSource.items.push({_id:'finalModeItem',type:'tool',system:{equipped:true},effects:[finalItemEffect]});const finalItemUnavailable=prepare(finalItemSource);
const petrificationActors=${petrificationOnly ? '[...petrificationCases.map(row=>({id:row.id,expected:row.expected,actor:prepare(petrificationSource(row))})),...petrificationModeCases.map(row=>({id:"phase-mode:"+row.id,expected:{...petrificationCases.find(row=>row.id==="poisoned").expected,checkMode:row.mode,toolMode:row.toolMode,combinedMode:row.combinedMode,passive:15+5*row.mode,initMode:row.toolMode},actor:prepare(petrificationModeSource(row))}))]' : '[]'};
const petrificationChangedSource=petrificationSource(petrificationCases[0]);petrificationChangedSource.effects[0]._id='differentPetrified';const petrificationEquivalent=prepare(petrificationChangedSource);
const familyModeKeys=new Set(['0,0,0,1','0,0,0,-1','-1,1,-1,-1','1,-1,1,1','0,-1,1,0','0,1,-1,0','1,0,0,-1','-1,0,0,1']);
const familyActors=${familyOnly ? "familyCases.filter(row=>!row.id.startsWith('modes-')||['dodging','restrained','invisible-incapacitated','incapacitated','stunned-dodging','stunned-incapacity','unconscious-dodging','unconscious-invisible-incapacity'].includes(row.profile.id)&&familyModeKeys.has(row.modes.join(','))).map(row=>{const source=familySource(row),actor=prepare(source);if(['stunned-incapacity','unconscious-incapacity'].includes(row.id)){source.effects[0]._id='changedConditionIdentity';return {id:row.id,expected:row.expected,actor,changedActor:prepare(source)};}return {id:row.id,expected:row.expected,actor};})" : '[]'};
const familyBase=familyCases.find(row=>row.id==='invisible'),familyChanged=familySource(familyBase);familyChanged.effects[0]._id='changedCondition';const familyEquivalent=prepare(familyChanged),familyImmune=prepare(familySource(familyCases.find(row=>row.id==='invisible-immune')));
const familyFixedActors=${familyOnly ? "['invisible','incapacitated','invisible-incapacitated','init-global-override-adv','stunned-only','unconscious-incapacity'].map(id=>{const row=familyCases.find(row=>row.id===id),context=skillContext();context.world.settings['dnd5e.initiativeScore']={status:'world',value:'all'};return {id,score:row.expected.score,actor:adapter.prepareActorData(familySource(row),context)};})" : '[]'};
const exhaustionActors=exhaustionCases.map(row=>({id:row.id,expected:row.expected,actor:prepare(exhaustionSource(row))}));
const exhaustionIdentitySource=exhaustionSource(exhaustionCases.find(row=>row.id==='level-2'));exhaustionIdentitySource.effects[0]._id='changedIdentity';const exhaustionIdentity=prepare(exhaustionIdentitySource);
const exhaustionImmunitySource=exhaustionSource(exhaustionCases.find(row=>row.id==='level-2'));exhaustionImmunitySource.system.traits.ci.value=[' poisoned '];const exhaustionImmunity=prepare(exhaustionImmunitySource);
const fixedNegativeSource=exhaustionSource(exhaustionCases.find(row=>row.id==='level-6'));fixedNegativeSource.system.attributes.init={ability:'dex',roll:{mode:-1}};const fixedNegativeContext=skillContext();fixedNegativeContext.world.settings['dnd5e.initiativeScore']={status:'world',value:'all'};const exhaustionFixedNegative=adapter.prepareActorData(fixedNegativeSource,fixedNegativeContext);
const exhaustionInvalid=exhaustionSource(exhaustionCases[0]);exhaustionInvalid.effects[0].system.level=0;const exhaustionUnavailable=prepare(exhaustionInvalid);
const conditionActors=conditionCases.map(row=>({id:row.id,actor:prepare(conditionSource(row)),expected:row.expected,status:row.expected||row.bad==='mode'?'ready':'unavailable',statuses:row.expected?.statuses??(row.bad==='mode'?['poisoned']:[])}));
const changedCondition=conditionSource(conditionCases[0]);changedCondition.effects[0]._id='differentCondition';const conditionEquivalent=prepare(changedCondition);
const classHeaderActors=initialClassFilterCases.filter(row=>!row.inputOnly).map(row=>{const actor=prepare(initialClassFilterSource(row)),e=initialClassFilterExpected(row);return {id:row.id,actor,card:adapter.getActorCardData(actor),expectedLevel:e?row.expectedLevel:null,expectedProficiency:e?row.expectedProficiency:null,expectedSkill:e?.skill};});
const trainingActors=trainingCases.map(row=>{const actor=adapter.prepareActorData(trainingSource(row),trainingContext(row));return {id:row.id,actor,card:adapter.getActorCardData(actor)};});
for(const row of initialClassFilterCases.filter(row=>!row.inputOnly)){const actor=prepare(initialClassFilterSource(row));trainingActors.push({id:'initial-filter:class:'+row.id,actor,card:adapter.getActorCardData(actor)});}
const classEquivalentSource=initialClassFilterSource(initialClassFilterCases.find(row=>row.id==='level-5')!);classEquivalentSource.items[0]._id='differentClassID';const classEquivalent=prepare(classEquivalentSource);
for(const row of initialCollectionFilterCases){const actor=prepare(initialCollectionFilterSource(row));trainingActors.push({id:'initial-filter:collection:'+row.id,actor,card:adapter.getActorCardData(actor)});}
const equivalentSource=initialCollectionFilterSource(initialCollectionFilterCases[0]);equivalentSource.system.traits.dr.value.push('fire');
const collectionEquivalent=prepare(equivalentSource);
for(const row of initialFilterCases){const actor=prepare(initialFilterSource(row));trainingActors.push({id:'initial-filter:'+row.id,actor,card:adapter.getActorCardData(actor)});}
for(const row of filterCases){const actor=prepare(filterSource(row));trainingActors.push({id:'constant-filter:'+row.id,actor,card:adapter.getActorCardData(actor)});}
for(const row of trainingEffectCases){const actor=prepare(trainingEffectSource(row));trainingActors.push({id:'training-set:'+row.id,actor,card:adapter.getActorCardData(actor)});}
for(const {id,context} of unavailableContexts()){const actor=prepare(trainingSource(trainingCases[1]),context);trainingActors.push({id,actor,card:adapter.getActorCardData(actor)});}
const indicatorActors=proficiencyIndicatorCases.map(row=>({...row,actor:prepare(proficiencyIndicatorSource(row))}));
for(const {id,context} of unavailableContexts())indicatorActors.push({id,prof:null,total:null,glyph:'—',saveGlyph:'—',actor:prepare(proficiencyIndicatorSource(proficiencyIndicatorCases[0]),context)});
const speciesActors=speciesCases.map(row=>{const actor=prepare(speciesSource(row));return {...row,actor,card:adapter.getActorCardData(actor)};});
for(const {id,context} of unavailableContexts()){const actor=prepare(speciesSource(speciesCases[0]),context);speciesActors.push({id,expected:{status:'unavailable',display:'Species unavailable',id:null},actor,card:adapter.getActorCardData(actor)});}
const rangeActors=normalRangeCases.flatMap((row,index)=>[-1,0,1].map(mode=>({...row,sourceMode:mode,actor:adapter.prepareActorData(rangeSource(row,mode),{...skillContext(),sourceRevision:4000+index*3+mode+1})})));
const rangeChanged=adapter.prepareActorData(rangeSource(normalRangeCases[1],1),{...skillContext(),sourceRevision:4002});
const defenses=defenseCases.map(row=>({...row,rangeSuffix:defenseRangeSuffix(row),actor:adapter.prepareActorData(defenseSource(row),{...defenseContext(row),sourceRevision:1000+defenseCases.indexOf(row)})}));
const initiativeBaseline=adapter.prepareActorData(defenseSource(defenseCases[0]),{...defenseContext(defenseCases[0]),sourceRevision:9000});
const defenseUnavailable=unavailableContexts().map(({id,context})=>({id,actor:adapter.prepareActorData(defenseSource(defenseCases[0]),context),expected:{ac:null,total:null}}));
const combinedUnavailable=unavailableContexts().map(({id,context})=>({id,actor:prepare(combinedSource(combinedCases[8]),context)}));
const removed=combinedSource(combinedCases[8]);delete removed.system.tools.thief;combinedUnavailable.push({id:'selected-tool-removed',actor:prepare(removed)});
const removedSkill=combinedSource(combinedCases[8]);delete removedSkill.system.skills.prc;combinedUnavailable.push({id:'selected-skill-removed',actor:prepare(removedSkill)});
const sourceFlagActors=sourceFlagCases.filter(row=>[0,5,20].includes(row.level)&&row.skillValue===0&&row.toolValue===1&&row.initial.check===0&&row.initial.skill===0&&row.initial.tool===0).map(row=>({id:row.id,level:row.level,expected:row.expected,actor:prepare(sourceFlagSource(row))}));
const flagLiveSource=sourceFlagSource(sourceFlagCases.find(row=>row.level===5&&row.flags.jackOfAllTrades&&row.flags.initiativeAlert&&row.skillValue===0&&row.toolValue===1&&row.sourceMode===0&&row.initial.check===0&&row.initial.skill===0&&row.initial.tool===0));const flagLive=prepare(flagLiveSource);flagLiveSource.flags.dnd5e.originalActor=true;const flagUnavailable=prepare(flagLiveSource);delete flagLiveSource.flags.dnd5e.originalActor;delete flagLiveSource.flags.dnd5e.jackOfAllTrades;const flagChanged=prepare(flagLiveSource);
const finalDefenseDisplay=(row,key)=>{const e=row.expectedAfter[key],bypasses=e.bypasses??[],suffix=id=>bypasses.length&&(id==='ALL'||defenseRegistry.physical.includes(id))?' ('+(id==='ALL'?'physical damage bypassed by ':'bypassed by ')+bypasses.map(id=>defenseRegistry.bypasses[id]).join(', ')+')':'';return [...(e.value??[]).map(id=>(id==='ALL'?defenseRegistry.allDamage:(key==='ci'?defenseRegistry.conditions: defenseRegistry.damage)[id])+suffix(id)),...Object.entries(e.amount??{}).filter(([,v])=>Number(v)!==0).map(([id,v])=>defenseRegistry.damage[id]+' '+(Number(v)>=0?'+':'')+v+suffix(id))].join('; ')||'None';};
const finalDefenseActors=finalDefenseCases.filter(row=>row.id.startsWith('overlap/')||row.id.startsWith('physical/')||row.petrified).map(row=>{const actor=prepare(finalDefenseSource(row));return {id:row.id,petrified:row.petrified,note:Boolean(row.petrified&&JSON.stringify(row.expectedBefore)!==JSON.stringify(row.expectedAfter)),actor,card:adapter.getActorCardData(actor),expected:Object.fromEntries(['dr','di','dv','ci','dm'].map(key=>[key,finalDefenseDisplay(row,key)]))};});
const finalDefenseLive=finalDefenseActors.find(row=>row.petrified).actor,finalDefenseBadSource=finalDefenseSource(finalDefenseCases.find(row=>row.petrified));Object.assign(finalDefenseBadSource.effects[1].system.changes[0],{key:'system.traits.ci.value',value:'["petrified"]'});const finalDefenseUnavailable=prepare(finalDefenseBadSource);const finalDefenseChangedSource=finalDefenseSource(finalDefenseCases.find(row=>row.petrified));finalDefenseChangedSource.effects[1]._id='differentDefenseId';const finalDefenseChanged=prepare(finalDefenseChangedSource);
const finalTrainingActors=finalTrainingCases.filter(row=>row.id.startsWith('local/')||row.change.key==='system.traits.languages.value').map(row=>{const actor=prepare(finalTrainingSource(row)),e=row.expectedAfter,mastery=[...e['weaponProf.mastery.value'].map(key=>key+' (label unresolved)'),...e['weaponProf.mastery.bonus'].map(key=>'Additional option: '+finalTrainingRegistry.mastery[key].label+' (requires a mastered weapon with a base mastery)')];return {id:row.id,actor,card:adapter.getActorCardData(actor),expected:{armor:e['armorProf.value'].map(key=>finalTrainingRegistry.armor[key]).join('; ')||'None',weapons:e['weaponProf.value'].map(key=>finalTrainingRegistry.weapons[key]).join('; ')||'None',languages:row.expectedCallerSpoken.join('; ')||'None',mastery:mastery.join('; ')||'None'},note:JSON.stringify(row.expectedCallerSpoken)!==JSON.stringify(row.expectedSpokenBeforeAndAfter)?'Earlier language labels: '+(row.expectedSpokenBeforeAndAfter.join('; ')||'None')+'.':null};});
const finalTrainingLive=finalTrainingActors.find(row=>row.id==='local/languages.value/override').actor,finalTrainingBadSource=finalTrainingSource(finalTrainingCases[0]);finalTrainingBadSource.effects[0].system.changes[0].value='["unknown"]';const finalTrainingUnavailable=prepare(finalTrainingBadSource),finalTrainingChangedSource=finalTrainingSource(finalTrainingCases.find(row=>row.id==='local/languages.value/override'));finalTrainingChangedSource.effects[0]._id='differentTrainingId';const finalTrainingChanged=prepare(finalTrainingChangedSource);
const finalCustomActors=${featCustomOnly?(featCustomRepresentatives?"featCustomCases.filter(row=>row.id.startsWith('default/absent/')&&row.id.endsWith('/add'))":'featCustomCases'):itemCustomOnly?(itemCustomRepresentatives?"itemCustomCases.filter(row=>row.id.startsWith('stable-order/'))":'itemCustomCases'):conditionCustomOnly?'conditionCustomCases':initialCustomOnly?'initialCustomCases':'finalCustomCases'}.map(row=>{const actor=prepare(${featCustomOnly?'featCustomSource':itemCustomOnly?'itemCustomSource':conditionCustomOnly?'conditionCustomSource':initialCustomOnly?'initialCustomSource':'finalCustomSource'}(row));return {id:row.id,key:row.field.split('.')[0],expected:row.expectedCurrentLabels,prepared:row.expectedPreparedLabels,numeric:row.expected,actor,card:adapter.getActorCardData(actor)};});
if(${initialCustomOnly}){const actor=prepare(trainingEffectSource(trainingEffectCases.find(row=>row.id==='custom-string-not-set')));finalCustomActors.push({id:'C28/custom-string-not-set/add',key:'languages',expected:['Cant'],prepared:['Cant'],actor,card:adapter.getActorCardData(actor)});}
const finalCustomLiveSource=${featCustomOnly?"featCustomSource(featCustomCases.find(row=>row.id==='default/duplicates/languages.custom/override'))":itemCustomOnly?"itemCustomSource(itemCustomCases.find(row=>row.id==='transferred/initial/duplicates/languages.custom/add'))":conditionCustomOnly?"conditionCustomSource(conditionCustomCases.find(row=>row.id==='poisoned-None/0/languages.custom/both'))":initialCustomOnly?"initialCustomSource(initialCustomCases.find(row=>row.id==='initial-then-final/languages.custom'))":"finalCustomSource(finalCustomCases.find(row=>row.id==='duplicates/languages.custom/override'))"},finalCustomLive=prepare(finalCustomLiveSource),customLiveExpected=${itemCustomOnly?"'Echo; Echo; RootEcho'":conditionCustomOnly||initialCustomOnly?"'Echo; Root; Added'":"'Echo'"};
const customEffect=${itemCustomOnly||featCustomOnly?'finalCustomLiveSource.items.at(-1).effects[0]':`finalCustomLiveSource.effects[${conditionCustomOnly?1:0}]`},customEffectId=customEffect._id;customEffect._id='differentCustom';const finalCustomChanged=prepare(finalCustomLiveSource);customEffect._id=customEffectId;customEffect.system.changes[0].value='Root';const finalCustomValueChanged=prepare(finalCustomLiveSource);customEffect.system.changes[0].value='@abilities.wis.mod';const finalCustomUnavailable=prepare(finalCustomLiveSource);
const itemCustomTransitions=[];
if(${featCustomOnly}){
 for(const state of ['active','activity','uses','different-owned-identity','recovered']){
  const source=featCustomSource(featCustomCases.find(row=>row.id==='default/duplicates/languages.custom/override')),item=source.items.at(-1);
  if(state==='activity')item.system.activities={activity:{type:'utility'}};if(state==='uses')item.system.uses={max:'3'};if(state==='different-owned-identity')item._id='differentFinalFeat';
  const actor=prepare(source),ready=!['activity','uses'].includes(state);itemCustomTransitions.push({id:state,actor,expected:ready?'Echo':'Unavailable',ready});
 }
}

if(${itemCustomOnly}){
 const liveRow=itemCustomCases.find(row=>row.id==='eligibility/tool-required-attuned-true/languages.custom/add');
 for(const state of ['active','unequipped','unattuned','default-attuned','malformed','recovered','different-owned-identity']){
  const source=itemCustomSource(liveRow),item=source.items.at(-1);
  if(state==='unequipped')item.system.equipped=false;if(state==='unattuned')item.system.attuned=false;if(state==='default-attuned')delete item.system.attuned;if(state==='malformed')item.system.equipped='true';if(state==='different-owned-identity')item._id='differentOwnedIdentity';
  const actor=prepare(source);itemCustomTransitions.push({id:state,actor,expected:state==='malformed'?'Unavailable':['unequipped','unattuned','default-attuned'].includes(state)?'Root':'Root; Added',ready:state!=='malformed'});
 }
}

const finalCiActors=finalCiCases.filter(row=>row.profile.statuses.length&&['add','subtract','override','multiply'].includes(row.change.type)||row.id.startsWith('exhaustion-6/0/')).map(row=>({id:row.id,expected:row.expected,actor:prepare(finalCiSource(row))}));
const finalCiLiveSource=finalCiSource(finalCiCases.find(row=>row.id==='poisoned/1/0/add')),finalCiLive=prepare(finalCiLiveSource);finalCiLiveSource.effects[1]._id='differentCI';const finalCiChanged=prepare(finalCiLiveSource);finalCiLiveSource.effects[1].system.changes[0].value='["stunned"]';const finalCiUnavailable=prepare(finalCiLiveSource);
process.stdout.write(JSON.stringify(${finalCustomOnly ? '{skills:states,finalCustomActors,finalCustomLive,finalCustomChanged,finalCustomValueChanged,finalCustomUnavailable,customLiveExpected,itemCustomTransitions}' : finalCiOnly ? '{skills:states,finalCiActors,finalCiLive,finalCiChanged,finalCiUnavailable}' : finalTrainingOnly ? '{skills:states,finalTrainingActors,finalTrainingLive,finalTrainingUnavailable,finalTrainingChanged}' : finalDefenseOnly ? '{skills:states,finalDefenseActors,finalDefenseLive,finalDefenseUnavailable,finalDefenseChanged}' : sourceFlagsOnly ? '{skills:states,sourceFlagActors,flagLive,flagUnavailable,flagChanged}' : finalNumbersOnly ? '{skills:states,finalNumberActors,finalNumberTieActors,finalNumberFixedActors,finalNumberLive,finalNumberEquivalent,finalNumberUnavailable}' : finalBonusesOnly ? '{skills:states,finalBonusActors,finalBonusLive,finalBonusEquivalent,finalBonusUnavailable,finalBonusFixed}' : finalProficienciesOnly ? '{skills:states,finalProficiencyActors,finalProficiencyLive,finalProficiencyEquivalent,finalProficiencyUnavailable}' : finalModesOnly ? '{skills:states,finalModeActors,finalModeFixedActors,finalLive,finalEquivalent,finalUnavailable,finalItemUnavailable}' : petrificationOnly ? '{skills:states,petrificationActors,petrificationEquivalent}' : familyOnly ? '{skills:states,familyActors,familyEquivalent,familyImmune,familyFixedActors}' : '{skills: states, abilities, facts, collectionEquivalent, classEquivalent, classHeaderActors, exhaustionActors, exhaustionUnavailable, exhaustionIdentity, exhaustionImmunity, exhaustionFixedNegative, conditionActors, conditionEquivalent, modes, tools, toolExamples, toolModes, combinations, combinedUnavailable, effectCases, numericEffects, modeEffects, healthActors, defenses, defenseUnavailable, initiativeBaseline, equipmentActors, equipmentEquivalent, movementActors, movementUnavailable, speciesActors, defenseTraits, indicatorActors, trainingActors, rangeActors, rangeChanged}'}));`);
const result = spawnSync(process.execPath, [join(core, 'node_modules/tsx/dist/cli.mjs'), '--tsconfig', join(core, 'tsconfig.json'), driver], { cwd: core, encoding: 'utf8', maxBuffer:32*1024*1024 });
if (result.error) throw result.error;
if (result.status !== 0) throw new Error(result.stderr);
const { itemCustomTransitions,customLiveExpected,finalCustomActors,finalCustomLive,finalCustomChanged,finalCustomValueChanged,finalCustomUnavailable, finalCiActors,finalCiLive,finalCiChanged,finalCiUnavailable, finalTrainingActors,finalTrainingLive,finalTrainingUnavailable,finalTrainingChanged, finalDefenseActors,finalDefenseLive,finalDefenseUnavailable,finalDefenseChanged, sourceFlagActors,flagLive,flagUnavailable,flagChanged, finalNumberActors, finalNumberTieActors, finalNumberFixedActors, finalNumberLive, finalNumberEquivalent, finalNumberUnavailable, finalBonusActors, finalBonusLive, finalBonusEquivalent, finalBonusUnavailable, finalBonusFixed, finalProficiencyActors, finalProficiencyLive, finalProficiencyEquivalent, finalProficiencyUnavailable, finalModeActors, finalModeFixedActors, finalLive, finalEquivalent, finalUnavailable, finalItemUnavailable, petrificationActors, petrificationEquivalent, familyActors, familyEquivalent, familyImmune, familyFixedActors, skills: states, abilities: abilityStates, facts, collectionEquivalent, classEquivalent, classHeaderActors, exhaustionActors, exhaustionUnavailable, exhaustionIdentity, exhaustionImmunity, exhaustionFixedNegative, conditionActors, conditionEquivalent, modes, tools, toolExamples, toolModes, combinations, combinedUnavailable, effectCases, numericEffects, modeEffects, healthActors, defenses, defenseUnavailable, initiativeBaseline, equipmentActors, equipmentEquivalent, movementActors, movementUnavailable, speciesActors, defenseTraits, indicatorActors, trainingActors, rangeActors, rangeChanged } = JSON.parse(result.stdout);
const bundle = await build({ entryPoints: [join(moduleRoot, 'tests/browser/skill-lifecycle.tsx')], bundle: true, write: false,
    platform: 'browser', format: 'iife', jsx: 'automatic', tsconfig: join(core, 'tsconfig.json'),
    plugins: [{ name: 'isolated-sdk-presentation', setup(build) {
        build.onResolve({ filter: /^@sheet-delver\/sdk(?:\/react)?$/ }, () => ({ path: join(moduleRoot, 'tests/browser/sdk-fixture.tsx') }));
    } }], define: { 'process.env.NODE_ENV': '"development"' }, logLevel: 'silent' });
const code = bundle.outputFiles[0].text;
writeFileSync(join(artifacts, 'fixture.js'), code);
const executablePath = option(args, '--chromium', process.env.DND5E_CHROMIUM);
const finalCustomResults=[];
const rows = [], previewRows = [], factRows = [], modeRows = [], toolRows = [], focusRows = [], combinationRows = [], effectRows = [], numericEffectRows = [], effectModeRows = [], healthRows = [], defenseRows = [], equipmentRows = [], movementRows = [], rangeRows = [], speciesRows = [], defenseTraitRows = [], indicatorRows = [], trainingRows = [], focusedFilterRows = [], classFactRows = [], conditionRows = [], exhaustionRows = [], familyRows = [], petrificationRows = [], finalModeRows = [], finalProficiencyRows = [], finalBonusRows = [], finalCiResults = [], finalTrainingResults = [], finalDefenseResults = [], sourceFlagResults = [], finalNumberResults = [], browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
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
        const tab = async name => { if (width < 1024) { await page.getByRole('button', {name:'▲',exact:true}).click(); await page.getByRole('button',{name:new RegExp(name)}).click(); } };
        if(finalCustomOnly){
            const formula=(mode,total)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+(total<0?'':'+')+total;
            const previews=row=>conditionCustomOnly?(row.key==='languages'||row.id==='literal-condition-names-do-not-grant-immunity'):(row.id.endsWith('/add')||initialCustomOnly&&!row.id.startsWith('initial/'));
            const defenses={dr:'Damage resistances',di:'Damage immunities',dv:'Damage vulnerabilities',ci:'Condition immunities'},training={armorProf:'Armor',weaponProf:'Weapons',languages:'Languages'};
            for(const row of finalCustomActors){await render(row.actor);const expected=row.expected.join('; ')||'None',e=row.numeric??{skill:5,passive:15,skillMode:0};
                if(defenses[row.key]){if(width<1024)await page.getByRole('button',{name:'DEFENSES',exact:true}).click();const surface=width<1024?page.getByRole('dialog',{name:'Defenses',exact:true}):page;assert.equal(await surface.getByLabel(defenses[row.key],{exact:true}).innerText(),expected,row.id+'/current defense');if(width<1024)await surface.getByRole('button',{name:'Close',exact:true}).click();}
                else {await tab('Proficiencies');const cell=page.getByLabel('Training: '+training[row.key],{exact:true});assert.equal(await cell.locator('[data-training-value]').innerText(),expected,row.id+'/current training');if(row.key==='languages'){const note=JSON.stringify(row.expected)!==JSON.stringify(row.prepared)?'Earlier language labels: '+(row.prepared.join('; ')||'None')+'.':null;assert.equal(await cell.locator('[data-training-preparation-note]').count(),note?1:0);if(note)assert.equal(await cell.locator('[data-training-preparation-note]').innerText(),note);}}
                for(const [title,projection]of [['Defenses','defenses'],['Training','training']])assert.equal(row.card.blocks.find(block=>block.title===title).value,row.actor.derived[projection].summary);
                if(previews(row)){await tab('Abilities');assert.equal(await page.getByLabel('Passive Perception',{exact:true}).innerText(),String(e.passive));await tab('Skills');await skill.click();const dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.skillMode,e.skill)));await dialog.getByRole('textbox',{name:'Situational bonus'}).fill('2.5');await dialog.getByRole('button',{name:'Advantage',exact:true}).focus();await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(1,e.skill)+'+(2.5)'));await page.keyboard.press('Enter');assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(1,e.skill)+'+(2.5)');await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(e.skillMode,e.skill));}
                if(conditionCustomOnly&&previews(row)){
                    await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);await skill.click();let dialog=page.locator('dialog[open]');await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.combinedSkillMode,e.skill)));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,e.skill));
                    await page.evaluate(actor=>window.skillFixture.render(actor,'tool'),row.actor);await page.getByRole('button',{name:"Thieves' tools Tool Check",exact:true}).click();dialog=page.locator('dialog[open]');await dialog.getByRole('combobox',{name:'Combine with skill',exact:true}).selectOption('prc');await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('wis');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.combinedToolMode,e.skill)));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,e.skill));
                    await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),row.actor);await page.getByRole('button',{name:'Roll initiative',exact:true}).click();dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.initiativeMode,e.initiative)));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,e.initiative));
                    await render(row.actor);if(width<1024)await page.getByRole('button',{name:'CONDITIONS',exact:true}).click();assert.deepEqual(await page.getByLabel('Condition status',{exact:true}).locator('li').allTextContents(),e.statuses.map(id=>id==='exhaustion'?'Exhaustion ('+e.levels.exhaustion+')':id==='poisoned'?'Poisoned':'Dead'));if(width<1024)await page.keyboard.press('Escape');
                }
                if(itemCustomRepresentatives||featCustomRepresentatives){
                    await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);await skill.click();let dialog=page.locator('dialog[open]');await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('dex');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('2d20kh1+5'));await dialog.getByRole('button',{name:'Disadvantage',exact:true}).focus();await page.keyboard.press('Enter');let call=(await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0];assert.equal(call.formula,'2d20kl1+5');assert.equal(call.options.tool,'thief');assert.equal(call.options.ability,'dex');
                    await page.evaluate(actor=>window.skillFixture.render(actor,'tool'),row.actor);await page.getByRole('button',{name:"Thieves' tools Tool Check",exact:true}).click();dialog=page.locator('dialog[open]');assert.ok((await dialog.innerText()).includes('1d20+5'));await dialog.getByRole('combobox',{name:'Combine with skill',exact:true}).selectOption('prc');await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('wis');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('2d20kh1+5'));await dialog.getByRole('button',{name:'Normal',exact:true}).click();call=(await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0];assert.equal(call.formula,'1d20+5');assert.equal(call.options.skill,'prc');assert.equal(call.options.ability,'wis');
                }
                finalCustomResults.push({width,id:row.id,currentConsumer:true,earlierLabels:row.key==='languages'?row.prepared:undefined,cardProjection:true,previewShortcut:previews(row),selectedSkillTool:itemCustomRepresentatives||featCustomRepresentatives});
            }
            if(itemCustomOnly||featCustomOnly){
                for(const transition of itemCustomTransitions){await render(transition.actor);await tab('Proficiencies');const cell=page.getByLabel('Training: Languages',{exact:true});assert.equal(await cell.locator('[data-training-value]').innerText(),transition.expected,transition.id);assert.equal(await cell.getAttribute('data-status'),transition.ready?'ready':'unavailable');await tab('Skills');assert.equal(await skill.isDisabled(),!transition.ready);if(transition.ready){await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');}}
                for(const transition of itemCustomTransitions.filter(row=>row.id!=='active'&&row.id!=='recovered')){const active=itemCustomTransitions[0].actor;await page.evaluate(actor=>window.skillFixture.render(actor,true),active);await skill.click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,true),transition.actor);await page.evaluate(actor=>window.skillFixture.render(actor,true),active);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            }
            for(const actor of [finalCustomLive,finalCustomUnavailable,states['snapshot-absent'],states['unsupported-native-version'],finalCustomLive]){await render(actor);await tab('Proficiencies');const cell=page.getByLabel('Training: Languages',{exact:true});assert.equal(await cell.getAttribute('data-status'),actor===finalCustomLive?'ready':'unavailable');assert.equal(await cell.locator('[data-training-value]').innerText(),actor===finalCustomLive?customLiveExpected:'Unavailable');}
            for(const changed of [finalCustomChanged,finalCustomValueChanged,finalCustomUnavailable,states['snapshot-absent'],states['rules-setting-unavailable'],states['unsupported-native-version'],...(conditionCustomOnly?[finalCustomActors.find(row=>row.id==='exhaustion-2/0/languages.custom/both').actor]:[])]){await page.evaluate(actor=>window.skillFixture.render(actor,true),finalCustomLive);await skill.click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,true),changed);await page.evaluate(actor=>window.skillFixture.render(actor,true),finalCustomLive);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            await page.evaluate(actor=>window.skillFixture.render(actor,true),finalCustomUnavailable);assert.equal(await skill.isDisabled(),true);await page.evaluate(actor=>window.skillFixture.render(actor,true),finalCustomLive);await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,conditionCustomOnly?'2d20kl1+5':'1d20+5');assert.equal(await page.evaluate(()=>window.skillFixture.updates.length),0);finalCustomResults.push({width,id:'live-final-custom',retiredCallbacks:true,contextSourceRecovery:true,zeroSourceWrites:true});assert.deepEqual(errors,[]);await context.close();continue;
        }
        if(finalCiOnly){
            const formula=(mode,total)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+(total<0?'':'+')+total;
            for(const row of finalCiActors){const e=row.expected;await render(row.actor);if(width<1024)await page.getByRole('button',{name:'CONDITIONS',exact:true}).click();const panel=page.getByLabel('Condition status',{exact:true}),current=e.actorStatuses.filter(id=>!e.afterCI.includes(id));assert.equal(await panel.getAttribute('data-status'),'ready');assert.deepEqual(await panel.locator('li').allTextContents(),current.map(id=>id==='exhaustion'?'Exhaustion ('+row.actor.derived.conditions.levels.exhaustion+')':id==='poisoned'?'Poisoned':'Dead'),row.id+'/current statuses');if(!current.length)assert.equal(await panel.getByText('None',{exact:true}).count(),1);assert.equal(await panel.locator('[data-condition-preparation-note]').count(),JSON.stringify(current)!==JSON.stringify(e.actorStatuses)?1:0);if(width<1024)await page.keyboard.press('Escape');await tab('Abilities');assert.equal(await page.getByLabel('Passive Perception',{exact:true}).innerText(),String(e.passive),row.id+'/earlier passive');
                await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);await skill.click();let dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.preparedMode,e.skill)),row.id+'/earlier numeric configuration');await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.combinedMode,e.skill)));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,e.skill));await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(e.preparedMode,e.skill));
                await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),row.actor);const init=page.getByRole('button',{name:'Roll initiative',exact:true});await init.click();dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.preparedMode,e.initiative)));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,e.initiative));finalCiResults.push({width,id:row.id,currentStatuses:current,earlierPassive:e.passive,cachedReduction:e.cachedReduction,defaultAndSelectedPreviewsShortcutsAndInit:true});
            }
            for(const changed of [finalCiChanged,finalCiUnavailable,states['snapshot-absent']]){await page.evaluate(actor=>window.skillFixture.render(actor,true),finalCiLive);await skill.click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,true),changed);await page.evaluate(actor=>window.skillFixture.render(actor,true),finalCiLive);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            await page.evaluate(actor=>window.skillFixture.render(actor,true),finalCiUnavailable);assert.equal(await skill.isDisabled(),true);await page.evaluate(actor=>window.skillFixture.render(actor,true),finalCiLive);await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'2d20kl1+5');assert.equal(await page.evaluate(()=>window.skillFixture.updates.length),0);finalCiResults.push({width,id:'live-final-ci',contextSourceRecovery:true,heldCallbacksRetired:true,freshIntent:true,zeroSourceWrites:true});assert.deepEqual(errors,[]);await context.close();continue;
        }
        if(finalTrainingOnly){
            for(const row of finalTrainingActors){await render(row.actor);await tab('Proficiencies');for(const [key,label]of [['armor','Armor'],['weapons','Weapons'],['languages','Languages'],['mastery','Mastery source choices']]){const cell=page.getByLabel('Training: '+label,{exact:true});assert.equal(await cell.locator('[data-training-value]').innerText(),row.expected[key],row.id+'/'+key);assert.notEqual(await cell.getAttribute('data-status'),'unavailable');assert.ok(await cell.getAttribute('title'));}
                const note=page.getByLabel('Training: Languages',{exact:true}).locator('[data-training-preparation-note]');if(row.note)assert.equal(await note.innerText(),row.note,row.id+'/earlier labels separately');else assert.equal(await note.count(),0);assert.equal(row.card.blocks.find(block=>block.title==='Training').value,row.actor.derived.training.summary);finalTrainingResults.push({width,id:row.id,independentCurrentDisplays:row.expected,earlierNote:row.note,currentValuesAndEarlierCacheDistinct:true,cardProjection:true});
            }
            for(const change of [finalTrainingLive,finalTrainingUnavailable,states['snapshot-absent'],finalTrainingLive]){await render(change);await tab('Proficiencies');const cell=page.getByLabel('Training: Languages',{exact:true});assert.equal(await cell.getAttribute('data-status'),change===finalTrainingLive?'ready':'unavailable');assert.equal(await cell.locator('[data-training-value]').innerText(),change===finalTrainingLive?'Dwarvish; Elvish':'Unavailable');if(change!==finalTrainingLive)assert.equal(await cell.locator('[data-training-preparation-note]').count(),0);}
            for(const changed of [finalTrainingChanged,finalTrainingUnavailable,states['snapshot-absent']]){await page.evaluate(actor=>window.skillFixture.render(actor,true),finalTrainingLive);await skill.click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,true),changed);await page.evaluate(actor=>window.skillFixture.render(actor,true),finalTrainingLive);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            await page.evaluate(actor=>window.skillFixture.render(actor,true),finalTrainingUnavailable);assert.equal(await skill.isDisabled(),true);await page.evaluate(actor=>window.skillFixture.render(actor,true),finalTrainingLive);await skill.click();const dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('1d20+5'));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');assert.equal(await page.evaluate(()=>window.skillFixture.updates.length),0);finalTrainingResults.push({width,id:'live-final-training',retiredCallbacks:true,currentContextRecovery:true,freshIntent:true,zeroSourceWrites:true});assert.deepEqual(errors,[]);await context.close();continue;
        }
        if(finalDefenseOnly){
            for(const row of finalDefenseActors){await render(row.actor);if(width<1024)await page.getByRole('button',{name:'DEFENSES',exact:true}).click();const surface=width<1024?page.getByRole('dialog',{name:'Defenses',exact:true}):page;
                for(const [key,label]of Object.entries({dr:'Damage resistances',di:'Damage immunities',dv:'Damage vulnerabilities',ci:'Condition immunities',dm:'Damage adjustments'})){const value=surface.getByLabel(label,{exact:true});assert.equal(await value.getAttribute('data-status'),'ready');assert.equal(await value.innerText(),row.expected[key],row.id+'/'+key);assert.ok(await value.getAttribute('title'));}
                assert.equal(row.card.blocks.find(block=>block.title==='Defenses').value,row.actor.derived.defenses.summary);assert.equal(await surface.locator('[data-defense-preparation-note]').count(),row.note?1:0);if(row.note){const bounds=await surface.locator('[data-defense-preparation-note]').boundingBox();assert.ok(bounds&&bounds.x>=0&&bounds.x+bounds.width<=width,row.id+'/note fits');}if(width<1024)await surface.getByRole('button',{name:'Close',exact:true}).click();
                if(row.petrified){await tab('Abilities');assert.equal(await page.getByLabel('Passive Perception',{exact:true}).innerText(),'15');await tab('Skills');await skill.click();const dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('1d20+5'));await dialog.getByRole('textbox',{name:'Situational bonus'}).fill('2.5');await dialog.getByRole('button',{name:'Advantage',exact:true}).focus();await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('2d20kh1+5+(2.5)'));await page.keyboard.press('Enter');assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'2d20kh1+5+(2.5)');await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');}
                finalDefenseResults.push({width,id:row.id,actualAllCategoryConsumers:true,independentDisplays:row.expected,cardProjection:true});
            }
            await render(finalDefenseLive);if(width<1024)await page.getByRole('button',{name:'DEFENSES',exact:true}).click();const surface=width<1024?page.getByRole('dialog',{name:'Defenses',exact:true}):page;for(const change of [finalDefenseUnavailable,states['snapshot-absent'],states['rules-setting-unavailable'],states['unsupported-native-version'],finalDefenseLive]){await render(change);assert.equal(await surface.getByLabel('Damage resistances',{exact:true}).getAttribute('data-status'),change===finalDefenseLive?'ready':'unavailable');}if(width<1024)await surface.getByRole('button',{name:'Close',exact:true}).click();
            for(const changed of [finalDefenseChanged,finalDefenseUnavailable,states['snapshot-absent'],states['rules-setting-unavailable'],states['unsupported-native-version']]){await page.evaluate(actor=>window.skillFixture.render(actor,true),finalDefenseLive);await skill.click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,true),changed);await page.evaluate(actor=>window.skillFixture.render(actor,true),finalDefenseLive);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            await page.evaluate(actor=>window.skillFixture.render(actor,true),finalDefenseUnavailable);assert.equal(await skill.isDisabled(),true);await page.evaluate(actor=>window.skillFixture.render(actor,true),finalDefenseLive);await skill.click();const dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('1d20+5'));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');assert.equal(await page.evaluate(()=>window.skillFixture.updates.length),0);finalDefenseResults.push({width,id:'live-final-defenses',sourceContextRecovery:true,heldCallbacksRetired:true,previewShortcutAgreement:true,zeroSourceWrites:true});assert.deepEqual(errors,[]);await context.close();continue;
        }
        if(sourceFlagsOnly){
            const formula=(mode,total)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+(total<0?'':'+')+total;
            for(const row of sourceFlagActors){const e=row.expected;
                await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);assert.equal(await page.getByLabel('Perception roll proficiency',{exact:true}).getAttribute('data-proficiency'),String(e.skillProf));await skill.click();let dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.sourceMode,e.skill)),row.id+'/skill');await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('dex');await dialog.getByRole('textbox',{name:'Situational bonus'}).fill('2');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.combinedMode,e.combined)+'+(2)'),row.id+'/selected');await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,e.combined)+'+(2)');await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(e.sourceMode,e.skill));
                await render(row.actor);assert.equal(await page.getByLabel('Character level',{exact:true}).innerText(),String(row.level));assert.equal(await page.getByLabel('Proficiency bonus',{exact:true}).innerText(),'+'+e.baseProficiency);await tab('Abilities');assert.equal(await page.getByLabel('Passive Perception',{exact:true}).innerText(),String(e.passive));assert.ok((await page.getByRole('button',{name:'Wisdom Check',exact:true}).innerText()).includes('+'+e.check));
                for(const [probe,label,total]of [['tool',"Thieves' tools Tool Check",e.tool],['initiative','Roll initiative',e.initiative]]){await page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor:row.actor,probe});const control=page.getByRole('button',{name:label,exact:true});await control.click();dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.sourceMode,total)),row.id+'/'+probe);await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,total));await control.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(e.sourceMode,total));}
                sourceFlagResults.push({width,id:row.id,skill:e.skill,tool:e.tool,passive:e.passive,initiative:e.initiative,prof:e.skillProf,selectedMode:e.combinedMode,actualControlsAndShortcuts:true});
            }
            for(const changed of [flagChanged,flagUnavailable,states['snapshot-absent']]){await page.evaluate(actor=>window.skillFixture.render(actor,true),flagLive);await skill.click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,true),changed);await page.evaluate(actor=>window.skillFixture.render(actor,true),flagLive);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            await page.evaluate(actor=>window.skillFixture.render(actor,true),flagUnavailable);assert.equal(await skill.isDisabled(),true);await page.evaluate(actor=>window.skillFixture.render(actor,true),flagLive);await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+3');sourceFlagResults.push({width,id:'flag-recovery',retiredHeldCallbacks:true,freshIntent:true});assert.deepEqual(errors,[]);await context.close();continue;
        }
        if(finalNumbersOnly){
            const formula=(mode,total)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+(total<0?'':'+')+total;
            for(const row of finalNumberActors){const e=row.expected;
                await render(row.actor);await tab('Abilities');for(const [key,name]of [['wis','Wisdom'],['dex','Dexterity']]){const score=page.getByLabel(name+' score',{exact:true});assert.equal(await score.innerText(),String(e.currentFields['abilities.'+key+'.value']),row.id+'/current score');assert.equal(await score.evaluate(el=>el.scrollWidth<=el.clientWidth),true,row.id+'/score fits');assert.ok((await page.getByRole('button',{name:name+' Check',exact:true}).innerText()).includes('+2'));}assert.equal(await page.getByLabel('Passive Perception',{exact:true}).innerText(),String(e.passive));
                await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);assert.equal(await page.getByLabel('Perception roll proficiency',{exact:true}).getAttribute('data-proficiency'),String(e.skillProf));await skill.click();let dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(0,e.rolls.skill)));await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('dex');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(Number(e.automaticAdvantage),e.rolls.combined)),row.id+'/retained modifiers/proficiency');await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,e.rolls.combined));await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,e.rolls.skill));
                for(const [name,probe,label]of [['wisCheck','ability','Wisdom Check'],['dexCheck','ability','Dexterity Check'],['wisSave','save','Wisdom Saving Throw'],['dexSave','save','Dexterity Saving Throw'],['tool','tool',"Thieves' tools Tool Check"]]){
                    await page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor:row.actor,probe});const control=page.getByRole('button',{name:label,exact:true});if(probe==='save'){const coefficient=name==='wisSave'?e.wisSaveProf:e.dexSaveProf;assert.equal(await page.getByLabel((name==='wisSave'?'Wisdom':'Dexterity')+' saving throw roll proficiency',{exact:true}).getAttribute('data-proficiency'),String(coefficient));}await control.click();dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(0,e.rolls[name])),row.id+'/'+name);await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,e.rolls[name]));await control.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,e.rolls[name]));
                }
                finalNumberResults.push({width,id:row.id,currentWis:e.currentFields['abilities.wis.value'],currentDex:e.currentFields['abilities.dex.value'],earlierModsAndProfObjects:true,earlierPassive:e.passive,actualHeadersIndicatorsSelectedPreviewsAndShortcutsAgree:true});
            }
            for(const row of finalNumberTieActors){await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),row.actor);const control=page.getByRole('button',{name:'Roll initiative',exact:true});await control.click();const dialog=page.locator('dialog[open]'),expected='1d20+2'+(row.expected.initiativeTiebreaker?'+'+row.expected.initiativeTiebreaker:'');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(expected),row.id+'/fresh tie');await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,expected);await control.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,expected);finalNumberResults.push({width,id:'tie:'+row.id,currentTie:row.expected.initiativeTiebreaker});}
            for(const row of finalNumberFixedActors){await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),row.actor);await page.getByRole('button',{name:'Roll initiative',exact:true}).click();const dialog=page.locator('dialog[open]');assert.ok((await dialog.innerText()).includes('12'));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'12');finalNumberResults.push({width,id:'fixed:'+row.id,earlierScore:12});}
            for(const changed of [finalNumberEquivalent,finalNumberUnavailable,states['snapshot-absent']]){await page.evaluate(actor=>window.skillFixture.render(actor,true),finalNumberLive);await skill.click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,true),changed);await page.evaluate(actor=>window.skillFixture.render(actor,true),finalNumberLive);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            await page.evaluate(actor=>window.skillFixture.render(actor,true),finalNumberUnavailable);assert.equal(await skill.isDisabled(),true);await page.evaluate(actor=>window.skillFixture.render(actor,true),finalNumberLive);await skill.click();const dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('1d20+2'));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+2');finalNumberResults.push({width,id:'live-final-number-recovery',heldCallbacksRetired:true,unavailableDisabled:true,freshIntentRequired:true});assert.deepEqual(errors,[]);await context.close();continue;
        }
        if(finalBonusesOnly){
            const formula=(mode,total)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+(total<0?'':'+')+total;
            for(const row of finalBonusActors){const e=row.expected;
                await render(row.actor);assert.equal(await page.getByLabel('Initiative modifier',{exact:true}).innerText(),(e.fresh.initiative<0?'':'+')+e.fresh.initiative,row.id+'/current initiative consumer');if(row.actor.derived.initiativeFacts.preparationNote){const note=page.getByRole('button',{name:'Roll initiative',exact:true}).locator('..').locator('small');assert.equal(await note.evaluate(el=>el.scrollWidth<=el.clientWidth),true,row.id+'/initiative note wraps');const bounds=await note.boundingBox();assert.ok(bounds&&bounds.x>=0&&bounds.x+bounds.width<=width,row.id+'/note inside viewport');}await tab('Abilities');assert.equal(await page.getByLabel('Passive Perception',{exact:true}).innerText(),String(e.passive),row.id+'/earlier passive');
                await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);if(row.actor.derived.skills.prc.preparationNote)assert.ok((await skill.innerText()).includes(row.actor.derived.skills.prc.preparationNote));
                await skill.click();let dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(0,e.fresh.skill)),row.id+'/current skill');await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(1,e.fresh.combinedSkill)),row.id+'/primary scopes');await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('dex');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(1,e.fresh.alternateSkill)),row.id+'/alternate scopes');await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,e.fresh.alternateSkill));await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,e.fresh.skill));
                for(const [name,probe,label]of [['wisCheck','ability','Wisdom Check'],['dexCheck','ability','Dexterity Check'],['wisSave','save','Wisdom Saving Throw'],['dexSave','save','Dexterity Saving Throw'],['tool','tool',"Thieves' tools Tool Check"],['initiative','initiative','Roll initiative']]){
                    await page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor:row.actor,probe});const control=page.getByRole('button',{name:label,exact:true});await control.click();dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(0,e.fresh[name])),row.id+'/'+name);
                    if(probe==='tool'){await dialog.getByRole('combobox',{name:'Combine with skill',exact:true}).selectOption('prc');await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('wis');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(1,e.fresh.combinedTool)));}
                    await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,probe==='tool'?e.fresh.combinedTool:e.fresh[name]));await control.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,e.fresh[name]));
                }
                finalBonusRows.push({width,id:row.id,currentBonuses:e.fresh,earlierPassive:e.passive,actualHeaderSkillToolAbilitySaveInitAndSelectedPreviewsShortcutsAgree:true});
            }
            for(const row of finalBonusFixed){await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),row.actor);await page.getByRole('button',{name:'Roll initiative',exact:true}).click();const dialog=page.locator('dialog[open]');assert.ok((await dialog.innerText()).includes(String(row.expected.initiativeScore)));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,String(row.expected.initiativeScore));finalBonusRows.push({width,id:'fixed:'+row.id,earlierScoreRetained:true});}
            for(const changed of [finalBonusEquivalent,finalBonusUnavailable,states['snapshot-absent']]){await page.evaluate(actor=>window.skillFixture.render(actor,true),finalBonusLive);await skill.click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,true),changed);await page.evaluate(actor=>window.skillFixture.render(actor,true),finalBonusLive);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            await page.evaluate(actor=>window.skillFixture.render(actor,true),finalBonusUnavailable);assert.equal(await skill.isDisabled(),true);await page.evaluate(actor=>window.skillFixture.render(actor,true),finalBonusLive);await skill.click();const dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('1d20+9'));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+9');finalBonusRows.push({width,id:'live-final-bonus-recovery',heldCallbacksRetired:true,unavailableDisabled:true,freshIntentRequired:true});assert.deepEqual(errors,[]);await context.close();continue;
        }
        if(finalProficienciesOnly){
            const formula=(mode,total)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+'+'+total;
            for(const row of finalProficiencyActors){const e=row.expected;
                await render(row.actor);await tab('Abilities');assert.equal(await page.getByLabel('Passive Perception',{exact:true}).innerText(),String(e.passive),row.id+'/earlier passive');
                await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);
                assert.equal(await page.getByLabel('Perception roll proficiency',{exact:true}).getAttribute('data-proficiency'),String(e.skillProf));
                if(row.actor.derived.skills.prc.preparationNote){assert.ok((await skill.innerText()).includes(row.actor.derived.skills.prc.preparationNote));if(row===finalProficiencyActors[0])await page.screenshot({path:join(artifacts,'final-proficiency-skill-'+width+'.png')});}
                await skill.click();let dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.mode,e.skill)),row.id+'/fresh skill');
                await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.combinedMode,e.combined)),row.id+'/earlier auto advantage');
                await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('str');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.combinedMode,e.combined-2)),row.id+'/alternate ability');
                await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,e.combined-2));
                await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(e.mode,e.skill));
                for(const [probe,name,total,mode]of [['ability','Wisdom Check',e.check,e.mode],['save','Wisdom Saving Throw',e.save,0],['tool',"Thieves' tools Tool Check",e.tool,e.mode]]){
                    await page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor:row.actor,probe});const control=page.getByRole('button',{name,exact:true});
                    if(probe==='tool'&&row.actor.derived.tools.thief.preparationNote)assert.ok((await page.getByLabel('Tool checks',{exact:true}).innerText()).includes(row.actor.derived.tools.thief.preparationNote));
                    await control.click();dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(mode,total)),row.id+'/'+probe);
                    if(probe==='tool'){await dialog.getByRole('combobox',{name:'Combine with skill',exact:true}).selectOption('prc');await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('wis');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.combinedMode,e.combined)));}
                    await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,probe==='tool'?e.combined:total));await control.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(mode,total));
                }
                finalProficiencyRows.push({width,id:row.id,passive:e.passive,currentSkill:e.skill,currentTool:e.tool,earlierAbilityProfAndAutomaticAdvantage:true,notesAndIndicators:true,previewSelectionAlternateShortcutExecutionAgree:true});
            }
            for(const changed of [finalProficiencyEquivalent,finalProficiencyUnavailable,states['snapshot-absent']]){await page.evaluate(actor=>window.skillFixture.render(actor,true),finalProficiencyLive);await skill.click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,true),changed);await page.evaluate(actor=>window.skillFixture.render(actor,true),finalProficiencyLive);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            await skill.click();const dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('1d20+5'));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');finalProficiencyRows.push({width,id:'live-final-proficiency-recovery',heldCallbacksRetired:true,freshIntentRequired:true});assert.deepEqual(errors,[]);await context.close();continue;
        }
        if(finalModesOnly){
            const formula=(mode,total)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+'+'+total;
            for(const row of finalModeActors){const e=row.expected;await render(row.actor);await tab('Abilities');assert.equal(await page.getByLabel('Passive Perception',{exact:true}).innerText(),String(e.passive),row.id+'/pre-final passive');
                await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);await skill.click();let dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.skill,5)),row.id+'/skill');await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.combinedSkill,5)),row.id+'/combined skill');await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(e.skill,5));
                for(const [probe,name,mode,total]of [['ability','Wisdom Check',e.wisCheck,2],['ability','Dexterity Check',e.dexCheck,2],['save','Wisdom Saving Throw',e.wisSave,2],['save','Dexterity Saving Throw',e.dexSave,2],['tool',"Thieves' tools Tool Check",e.tool,5],['initiative','Roll initiative',e.initiative,2]]){await page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor:row.actor,probe});const control=page.getByRole('button',{name,exact:true});await control.click();dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(mode,total)),row.id+'/'+probe);await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,total));await control.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(mode,total));}
                await page.evaluate(actor=>window.skillFixture.render(actor,'tool'),row.actor);await page.getByRole('button',{name:"Thieves' tools Tool Check",exact:true}).click();dialog=page.locator('dialog[open]');await dialog.getByRole('combobox',{name:'Combine with skill',exact:true}).selectOption('prc');await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('wis');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.combinedTool,5)));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');finalModeRows.push({width,id:row.id,earlierPassiveAndFinalDefaultManualSelectedPreviewsAndShortcutsAgree:true});
            }
            for(const row of finalModeFixedActors){await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),row.actor);await page.getByRole('button',{name:'Roll initiative',exact:true}).click();const dialog=page.locator('dialog[open]');assert.ok((await dialog.innerText()).includes(String(row.expected.score)));assert.equal(await dialog.getByRole('button',{name:'Advantage',exact:true}).isDisabled(),true);await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,String(row.expected.score));finalModeRows.push({width,id:'fixed:'+row.id,preFinalScoreRetained:true});}
            for(const changed of [finalEquivalent,finalUnavailable,finalItemUnavailable,states['snapshot-absent']]){await page.evaluate(actor=>window.skillFixture.render(actor,true),finalLive);await skill.click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,true),changed);await page.evaluate(actor=>window.skillFixture.render(actor,true),finalLive);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}await skill.click();let dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('2d20kh1+5'));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');finalModeRows.push({width,id:'live-final-source-context-recovery',heldCallbacksRetired:true,freshIntentRequired:true});assert.deepEqual(errors,[]);await context.close();continue;
        }
        if(petrificationOnly){
            const formula=(mode,total)=>(mode===-1?'2d20kl1':mode===1?'2d20kh1':'1d20')+'+'+total,labels={petrified:'Petrified',incapacitated:'Incapacitated',poisoned:'Poisoned',diseased:'Diseased',cold:'Cold',poison:'Poison',acid:'Acid',ALL:'All Damage'};
            for(const row of petrificationActors){const e=row.expected;await render(row.actor);assert.equal(await page.getByLabel('Walking speed',{exact:true}).innerText(),e.walk+' ft',row.id+'/walking');if(width<1024)await page.getByRole('button',{name:'CONDITIONS',exact:true}).click();assert.equal((await page.getByLabel('Condition status',{exact:true}).innerText()).trim(),e.effective.map(id=>labels[id]).join('\n')||'None',row.id+'/effective status');if(width<1024)await page.keyboard.press('Escape');
                if(width<1024)await page.getByRole('button',{name:'DEFENSES',exact:true}).click();for(const [key,label]of [['dr','Damage resistances'],['di','Damage immunities'],['dv','Damage vulnerabilities'],['ci','Condition immunities']]){const text=await page.getByLabel(label,{exact:true}).innerText();if(!e[key].length)assert.equal(text,'None',row.id+'/'+key);for(const id of e[key])assert.ok(text.includes(labels[id]),row.id+'/'+key+'/'+id);}if(width<1024)await page.keyboard.press('Escape');
                await tab('Abilities');assert.equal(await page.getByLabel('Passive Perception',{exact:true}).innerText(),String(e.passive));await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);await skill.click();let dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.checkMode,5)),row.id+'/skill preview');await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.combinedMode??(e.checkMode===-1?0:1),5)),row.id+'/combined');await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(e.checkMode,5));
                await page.evaluate(actor=>window.skillFixture.render(actor,'tool'),row.actor);const tool=page.getByRole('button',{name:"Thieves' tools Tool Check",exact:true});await tool.click();dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.toolMode??e.checkMode,5)),row.id+'/tool preview');await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');await tool.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(e.toolMode??e.checkMode,5));
                await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),row.actor);await page.getByRole('button',{name:'Roll initiative',exact:true}).click();dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.initMode,2)),row.id+'/init preview');await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+2');petrificationRows.push({width,id:row.id,actualConditionDefenseMovementPassiveAndRollConsumers:true,sourceVsEffectiveStatus:true,previewSelectionShortcutExecution:true});}
            const active=petrificationActors.find(row=>row.id==='poisoned').actor,immune=petrificationActors.find(row=>row.id==='immune-petrified').actor;await render(active);if(width<1024)await page.getByRole('button',{name:'CONDITIONS',exact:true}).click();const live=page.getByLabel('Condition status',{exact:true});assert.ok((await live.innerText()).includes('Petrified'));assert.equal((await live.innerText()).includes('Poisoned'),false);await render(immune);assert.equal((await live.innerText()).trim(),'Poisoned');await render(states['snapshot-absent']);assert.equal(await live.getAttribute('data-status'),'unavailable');await render(active);assert.equal((await live.innerText()).includes('Poisoned'),false);if(width<1024)await page.keyboard.press('Escape');
            for(const changed of [immune,states['snapshot-absent'],petrificationEquivalent]){await page.evaluate(actor=>window.skillFixture.render(actor,true),active);await skill.click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,true),changed);await page.evaluate(actor=>window.skillFixture.render(actor,true),active);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}await skill.click();await page.locator('dialog[open]').getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');petrificationRows.push({width,id:'live-status-trait-context-recovery',heldCallbackRetired:true,freshIntentRequired:true});assert.deepEqual(errors,[]);await context.close();continue;
        }
        if(familyOnly){
            const formula=(mode,total)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+'+'+total,labels={restrained:'Restrained',grappled:'Grappled',paralyzed:'Paralyzed',incapacitated:'Incapacitated',invisible:'Invisible',surprised:'Surprised',prone:'Prone',dodging:'Dodging',stunned:'Stunned',unconscious:'Unconscious'};
            for(const row of familyActors){
                const e=row.expected;await render(row.actor);assert.equal(await page.getByLabel('Walking speed',{exact:true}).innerText(),e.walk+' ft',row.id+'/walking');
                if(width<1024)await page.getByRole('button',{name:'CONDITIONS',exact:true}).click();const panel=page.getByLabel('Condition status',{exact:true});assert.equal((await panel.innerText()).trim(),e.statuses.map(id=>labels[id]).join('\n')||'None',row.id+'/status');if(width<1024)await page.keyboard.press('Escape');
                await tab('Abilities');assert.equal(await page.getByLabel('Passive Perception',{exact:true}).innerText(),String(e.passive),row.id+'/passive');
                await page.evaluate(actor=>window.skillFixture.render(actor,'save'),row.actor);const save=page.getByRole('button',{name:'Dexterity Saving Throw',exact:true});await save.click();let dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.dexSave,2)),row.id+'/save preview');await dialog.getByRole('button',{name:'Advantage',exact:true}).focus();await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('2d20kh1+2'));await page.keyboard.press('Enter');assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'2d20kh1+2');await save.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(e.dexSave,2));
                await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),row.actor);const init=page.getByRole('button',{name:'Roll initiative',exact:true});await init.click();dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.init,2)),row.id+'/initiative preview');await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+2');await init.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(e.init,2));
                await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);await skill.click();dialog=page.locator('dialog[open]');await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.combinedMode,5)),row.id+'/selected');await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');
                familyRows.push({width,id:row.id,expected:e,actualStatusHeaderPassiveSaveInitSkill:true,manualPreviewShortcutExecution:true});
            }
            for(const row of familyFixedActors){await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),row.actor);await page.getByRole('button',{name:'Roll initiative',exact:true}).click();const dialog=page.locator('dialog[open]');assert.ok((await dialog.innerText()).includes(String(row.score)));assert.equal(await dialog.getByRole('button',{name:'Advantage',exact:true}).isDisabled(),true);await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,String(row.score));familyRows.push({width,id:'fixed:'+row.id,score:row.score,previewExecution:true});}
            for(const type of ['stunned','unconscious']){
                const row=familyActors.find(row=>row.id===type+'-incapacity'),active=row.actor,changed=row.changedActor,immune=familyActors.find(row=>row.id===type+'-immune-primary').actor;
                await render(active);if(width<1024)await page.getByRole('button',{name:'CONDITIONS',exact:true}).click();const live=page.getByLabel('Condition status',{exact:true});assert.ok((await live.innerText()).includes(labels[type]));await render(immune);assert.equal((await live.innerText()).trim(),'None');await render(states['snapshot-absent']);assert.equal(await live.getAttribute('data-status'),'unavailable');await render(active);assert.ok((await live.innerText()).includes(labels[type]));if(width<1024)await page.keyboard.press('Escape');
                for(const next of [immune,states['snapshot-absent'],changed]){await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),active);await page.getByRole('button',{name:'Roll initiative',exact:true}).click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),next);await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),active);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
                await page.getByRole('button',{name:'Roll initiative',exact:true}).click();await page.locator('dialog[open]').getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+2');familyRows.push({width,id:type+'-live-recovery',sourceAndImmunityAndContextRetireHeldCallbacks:true,freshIntentRequired:true});
            }
            const active=familyActors.find(row=>row.id==='invisible').actor;await render(active);if(width<1024)await page.getByRole('button',{name:'CONDITIONS',exact:true}).click();const live=page.getByLabel('Condition status',{exact:true});assert.equal((await live.innerText()).trim(),'Invisible');await render(familyImmune);assert.equal((await live.innerText()).trim(),'None');await render(states['snapshot-absent']);assert.equal(await live.getAttribute('data-status'),'unavailable');await render(active);assert.equal((await live.innerText()).trim(),'Invisible');if(width<1024)await page.keyboard.press('Escape');
            for(const changed of [states['snapshot-absent'],familyEquivalent,familyImmune]){await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),active);await page.getByRole('button',{name:'Roll initiative',exact:true}).click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),changed);await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),active);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            await page.getByRole('button',{name:'Roll initiative',exact:true}).click();await page.locator('dialog[open]').getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+2');familyRows.push({width,id:'live-recovery-retained-callbacks',contextAndSourceRetirement:true,freshIntentRequired:true});assert.deepEqual(errors,[]);await context.close();continue;
        }
        if(exhaustionOnly){
            const formula=(mode,total)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+(total<0?'':'+')+total;
            for(const row of (exhaustionFixedOnly?[]:exhaustionActors)){
                const e=row.expected,total=5+e.reduction;await render(row.actor);
                assert.equal(await page.getByLabel('Walking speed',{exact:true}).innerText(),Math.max(0,30+e.reduction/2*5)+' ft',row.id+'/header');
                if(width<1024)await page.getByRole('button',{name:'CONDITIONS',exact:true}).click();
                const panel=page.getByLabel('Condition status',{exact:true});assert.equal(await panel.getAttribute('data-status'),'ready');
                const expected=e.statuses.map(id=>id==='exhaustion'?'Exhaustion ('+e.level+')':id==='poisoned'?'Poisoned':'Dead').join('\n')||'None';assert.equal((await panel.innerText()).trim(),expected,row.id+'/status');
                if(width<1024)await page.keyboard.press('Escape');await tab('Skills');await skill.click();let dialog=page.locator('dialog[open]');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.mode,total)),row.id+'/preview');
                await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes(formula(e.combinedSkillMode,total)),row.id+'/combined');
                await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(0,total));
                await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(e.mode,total));
                await tab('Abilities');assert.equal(await page.getByLabel('Passive Perception',{exact:true}).innerText(),String(e.passive));
                for(const [probe,name,mode,bonus]of [['tool',"Thieves’ tools Check",e.toolMode,total],['ability','Wisdom Check',e.checkMode,2+e.reduction],['save','Wisdom Saving Throw',0,2+e.reduction],['initiative','Roll initiative',e.toolMode,2+e.reduction]]){
                    await page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor:row.actor,probe});
                    const control=probe==='tool'?page.getByRole('button',{name:/Thieves.*tools/}):page.getByRole('button',{name,exact:true});await control.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula(mode,bonus),row.id+'/'+probe);
                }
                exhaustionRows.push({width,id:row.id,expected:e,actualHeaderStatusPassiveAndChecks:true,previewSelectionExecution:true});
            }
            await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),exhaustionFixedNegative);await page.getByRole('button',{name:'Roll initiative',exact:true}).click();const fixedDialog=page.locator('dialog[open]');assert.ok((await fixedDialog.innerText()).includes('-5'));assert.equal(await fixedDialog.getByRole('button',{name:'Advantage',exact:true}).isDisabled(),true);assert.equal(await fixedDialog.getByRole('button',{name:'Disadvantage',exact:true}).isDisabled(),true);assert.equal(await fixedDialog.getByRole('textbox',{name:'Situational bonus'}).isDisabled(),true);await fixedDialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'-5');exhaustionRows.push({width,id:'negative-fixed-initiative',previewAndExecution:'-5',qualifiedModesPreserved:true});
            const active=exhaustionActors.find(row=>row.id==='level-2').actor,immune=exhaustionActors.find(row=>row.id==='1-immune').actor;
            await render(active);if(width<1024)await page.getByRole('button',{name:'CONDITIONS',exact:true}).click();const panel=page.getByLabel('Condition status',{exact:true});assert.equal((await panel.innerText()).trim(),'Exhaustion (2)');await render(immune);assert.equal((await panel.innerText()).trim(),'None');await render(exhaustionUnavailable);assert.equal(await panel.getAttribute('data-status'),'unavailable');await render(active);assert.equal((await panel.innerText()).trim(),'Exhaustion (2)');if(width<1024)await page.keyboard.press('Escape');
            for(const changed of [exhaustionUnavailable,states['snapshot-absent'],exhaustionIdentity,exhaustionImmunity]){await page.evaluate(actor=>window.skillFixture.render(actor,true),active);await skill.click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,true),changed);await page.evaluate(actor=>window.skillFixture.render(actor,true),active);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            await skill.click();let dialog=page.locator('dialog[open]');await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('str');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('1d20-1'));await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('1d20+1'));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+1');
            exhaustionRows.push({width,id:'live-unavailable-recovery-and-selection-clearing',retainedCallbackFenced:true,freshIntentRequired:true});assert.deepEqual(errors,[]);await context.close();continue;
        }
        if(conditionsOnly){
            for(const row of conditionActors){
                await render(row.actor);
                if(width<1024)await page.getByRole('button',{name:'CONDITIONS',exact:true}).click();
                const panel=page.getByLabel('Condition status',{exact:true});assert.equal(await panel.getAttribute('data-status'),row.status,row.id+'/readout');
                if(row.status==='ready')assert.equal((await panel.innerText()).trim(),row.statuses.length?'Poisoned':'None',row.id);else assert.match(await panel.innerText(),/Unavailable:/);
                if(width<1024)await page.keyboard.press('Escape');await tab('Skills');
                assert.equal(await skill.isDisabled(),!row.expected,row.id+'/control');
                if(row.expected){
                    await skill.click();const dialog=page.locator('dialog[open]');const mode=row.expected.mode;
                    assert.ok((await dialog.innerText()).includes((mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+'+'+row.expected.skill),row.id+'/preview');
                    await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+'+row.expected.skill);
                    await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);await skill.click();await page.evaluate(()=>window.skillFixture.hold());
                    await page.evaluate(actor=>window.skillFixture.render(actor,true),states['snapshot-absent']);await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);
                    assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
                }else{await skill.dispatchEvent('click',{shiftKey:true});assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
                conditionRows.push({width,id:row.id,readout:row.status,effectiveStatuses:row.statuses,actualReadoutAndSkillPreviewExecution:true,sourcePreserved:true,contextRecovery:true,retainedCallbackFenced:!!row.expected});
            }
            const active=conditionActors.find(row=>row.id==='active').actor,immune=conditionActors.find(row=>row.id==='immune').actor;
            await render(active);if(width<1024)await page.getByRole('button',{name:'CONDITIONS',exact:true}).click();
            const live=page.getByLabel('Condition status',{exact:true});assert.equal((await live.innerText()).trim(),'Poisoned');
            await render(immune);assert.equal((await live.innerText()).trim(),'None');await render(states['snapshot-absent']);assert.equal(await live.getAttribute('data-status'),'unavailable');await render(active);assert.equal((await live.innerText()).trim(),'Poisoned');
            if(width<1024)await page.keyboard.press('Escape');await tab('Skills');await skill.click();
            let dialog=page.locator('dialog[open]');await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('1d20+5'));
            await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('str');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('1d20+3'));
            await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('2d20kl1+3'));
            await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('');await page.mouse.move(0,0);assert.ok((await dialog.innerText()).includes('2d20kl1+5'));
            await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5');
            await page.evaluate(actor=>window.skillFixture.render(actor,true),active);await skill.click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,true),conditionEquivalent);await page.evaluate(actor=>window.skillFixture.render(actor,true),active);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
            conditionRows.push({width,id:'live-readout-selection-clearing-and-equal-result-identity',liveRecovery:true,alternateAbility:true,sourceCancellation:true,retainedCallbackFenced:true});
            assert.deepEqual(errors,[]);await context.close();continue;
        }
        if(classFactsOnly){
            for(const row of classHeaderActors){
                const level=row.expectedLevel===null?'—':String(row.expectedLevel),prof=row.expectedProficiency===null?'—':'+'+row.expectedProficiency;
                assert.equal(row.card.blocks.find(block=>block.title==='Level').value,row.expectedLevel??'—',row.id+'/card level');
                assert.equal(row.card.blocks.find(block=>block.title==='Prof').value,prof,row.id+'/card proficiency');
                await render(row.actor);await tab('Skills');
                const levelControl=page.getByLabel('Character level',{exact:true}),profControl=page.getByLabel('Proficiency bonus',{exact:true});
                assert.equal(await levelControl.evaluate(node=>node.firstChild.textContent),level,row.id+'/header level');
                assert.equal(await profControl.evaluate(node=>node.firstChild.textContent),prof,row.id+'/actual proficiency');
                assert.ok(await levelControl.getAttribute('title'));assert.ok(await profControl.getAttribute('title'));
                if(row.expectedSkill===undefined){assert.equal(await skill.isDisabled(),true);await skill.dispatchEvent('click',{shiftKey:true});assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
                else {await skill.click();const dialog=page.locator('dialog[open]');assert.ok((await dialog.innerText()).includes('1d20+'+row.expectedSkill));await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+'+row.expectedSkill);}
                await render(states['snapshot-absent']);assert.match(await levelControl.innerText(),/^—/);await render(row.actor);assert.equal(await levelControl.evaluate(node=>node.firstChild.textContent),level);
                assert.equal(await page.evaluate(()=>window.skillFixture.updates.length),0);
                classFactRows.push({width,id:row.id,level,proficiency:prof,actualCardHeaderProficiencySkillPreviewAndExecution:true,contextRecovery:true});
            }
            assert.deepEqual(errors,[]);await context.close();continue;
        }
        if(filtersOnly){
            for(const row of numericEffects.filter(row=>row.id.startsWith('constant-filter:')||row.id.startsWith('initial-filter:'))){
                await render(row.actor);await tab('Skills');
                assert.equal(await skill.isDisabled(),!row.expected,row.id);
                const tool=page.getByRole('button',{name:"Thieves' tools Tool Check",exact:true});assert.equal(await tool.isDisabled(),!row.expected,row.id+'/tool');
                if(row.expected){
                    await skill.click();const dialog=page.locator('dialog[open]');assert.ok((await dialog.innerText()).includes('1d20+'+row.expected.skill));
                    await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+'+row.expected.skill);
                    await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);await skill.click();await page.evaluate(()=>window.skillFixture.hold());
                    await page.evaluate(actor=>window.skillFixture.render(actor,true),states['snapshot-absent']);await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);
                    assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
                }else {await skill.dispatchEvent('click',{shiftKey:true});assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
                await render(row.actor);await tab('Proficiencies');
                assert.equal(await page.getByLabel('Training: Tools',{exact:true}).getAttribute('data-status'),row.expected?'ready':'unavailable');
                await render(states.supported);await tab('Skills');assert.equal(await skill.isEnabled(),true);
                focusedFilterRows.push({width,id:row.id,ready:!!row.expected,actualSkillToolTrainingConsumers:true,previewExecutionAgreement:true,recovery:true,retainedCallbackFenced:!!row.expected});
            }
            assert.deepEqual(errors,[]);await context.close();continue;
        }
        for(const row of trainingActors){
            await render(row.actor);await tab('Proficiencies');
            const facts=row.actor.derived.training,observed={};
            for(const [key,label] of [['armor','Armor'],['weapons','Weapons'],['tools','Tools'],['languages','Languages'],['mastery','Mastery source choices']]){
                const category=facts.categories[key],cell=page.getByLabel('Training: '+label,{exact:true});
                if(trainingDiagnosticsOnly){observed[key]=await cell.count()?await cell.locator('[data-training-value]').innerText():null;continue;}
                assert.equal(await cell.getAttribute('data-status'),category.status,row.id+'/'+key);
                assert.equal(await cell.locator('[data-training-value]').innerText(),category.display,row.id+'/'+key);
                assert.ok(await cell.getAttribute('title'));observed[key]=category.display;
            }
            if(!trainingDiagnosticsOnly){
                assert.ok(row.card, row.id+'/card');
                assert.equal(await page.evaluate(()=>window.skillFixture.updates.length),0);
                await render(trainingActors[0].actor);await tab('Proficiencies');
                assert.equal(await page.getByLabel('Training: Armor',{exact:true}).locator('[data-training-value]').innerText(),'None');
            }
            trainingRows.push({width,id:row.id,...(trainingDiagnosticsOnly?{panelText:await page.getByRole('heading',{name:'Proficiencies & Training',exact:true}).locator('..').innerText()}:{}),observed,expected:Object.fromEntries(Object.entries(facts.categories).map(([key,value])=>[key,value.display])),sourceReadOnly:true,recovery:!trainingDiagnosticsOnly});
        }
        if(trainingDiagnosticsOnly){await context.close();continue;}
        for(const row of indicatorActors){
            await render(row.actor);await tab('Skills');
            if(indicatorDiagnosticsOnly){
                const observedSkill=await skill.locator('span').first().innerText();await tab('Abilities');
                const observedSave=await page.getByRole('button',{name:'Wisdom Saving Throw',exact:true}).locator('div').first().innerText();
                indicatorRows.push({width,id:row.id,observedSkill,expectedSkill:row.glyph,observedSave,expectedSave:row.saveGlyph});continue;
            }
            assert.equal(await skill.locator('span').first().innerText(),row.glyph,row.id+'/skill marker');
            const skillIndicator=skill.getByLabel('Perception roll proficiency',{exact:true});
            assert.equal(await skillIndicator.getAttribute('data-proficiency'),row.prof===null?'unavailable':String(row.prof));
            assert.ok(await skillIndicator.getAttribute('title'));
            if(row.prof!==null)assert.equal(await skillIndicator.getAttribute('title'),row.description);
            if(row.prof===1.5){const size=await skillIndicator.boundingBox();assert.ok(size.width<=28,'Fractional indicator fits its column');}
            if(row.total!==null&&!row.bounded){await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+'+row.total);}
            else {await skill.dispatchEvent('click',{shiftKey:true});assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            if(row.bounded){await skill.click();const dialog=page.locator('dialog[open]');await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20min10+6');}
            await tab('Abilities');const save=page.getByRole('button',{name:'Wisdom Saving Throw',exact:true});
            assert.equal(await save.locator('div').first().innerText(),row.saveGlyph,row.id+'/save marker');
            assert.ok(await save.getByLabel('Wisdom saving throw roll proficiency',{exact:true}).getAttribute('title'));
            await render(indicatorActors[0].actor);await tab('Skills');assert.equal(await skill.locator('span').first().innerText(),'1½×');
            indicatorRows.push({width,id:row.id,skillMarker:row.glyph,saveMarker:row.saveGlyph,actualConsumers:true,recovery:true});
        }
        if(indicatorDiagnosticsOnly){await context.close();continue;}
        await render(states.supported);await tab('Skills');
        await verifyOptions(skill, 'skill', 5);
        for (const id of Object.keys(states).filter(id => id !== 'supported')) {
            await render(states.supported);
            await skill.click();
            await page.locator('dialog[open]').waitFor();
            assert.match(await page.locator('dialog[open]').innerText(), /1d20\+5/);
            await render(states[id]);
            await page.waitForFunction(() => !document.querySelector('dialog[open]'), undefined, { timeout: 1500 });
            const bounded=id.startsWith('range-');assert.equal(await skill.isDisabled(), !bounded, `${width}/${id} controls`);
            assert.match(await skill.innerText(), id.startsWith('range-') ? /\+5/ : /—/);
            await skill.dispatchEvent('click', { shiftKey: true });
            const dispatched=await page.evaluate(()=>window.skillFixture.calls.splice(0));assert.equal(dispatched.length,bounded?1:0,'Shortcut follows qualified default only');if(bounded)assert.equal(dispatched[0].formula,'1d20'+(id.endsWith('-min')?'min10':'max10')+'+5');
            await render(states.supported);
            assert.equal(await skill.isEnabled(), true);
            await skill.click({ modifiers: ['Shift'] });
            assert.equal(await page.evaluate(() => window.skillFixture.calls.splice(0).length), 1);
            rows.push({ width, id, staleDialogRetired: true, shortcutBlocked: !bounded, qualifiedNormalRange:bounded, recovery: true });
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
                const bounded=/^(check|save)-/.test(id);assert.equal(await control.isDisabled(),!bounded);
                await control.dispatchEvent('click', { shiftKey: true });
                const dispatched=await page.evaluate(()=>window.skillFixture.calls.splice(0));assert.equal(dispatched.length,bounded?1:0);if(bounded)assert.equal(dispatched[0].formula,'1d20'+(id.endsWith('-min')?'min10':'max10')+'+'+(kind==='ability'?5:10));
                await render(abilityStates.supported);
                assert.equal(await control.isEnabled(), true);
                await control.click({ modifiers: ['Shift'] });
                assert.equal(await page.evaluate(() => window.skillFixture.calls.splice(0).length), 1);
                rows.push({ width, kind, id, staleDialogRetired: true, shortcutBlocked: !bounded, qualifiedNormalRange:bounded, recovery: true });
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
        for(const row of speciesActors){
            await render(row.actor);const label=page.getByLabel('Species',{exact:true});
            assert.equal(await label.innerText(),row.expected.display,row.id);
            assert.equal(await label.getAttribute('data-status'),row.expected.status,row.id);
            assert.equal(await label.getAttribute('data-species-uuid'),row.actor.derived.speciesIdentity.uuid,row.id);
            assert.ok(await label.getAttribute('title'),row.id);
            assert.ok(row.card.subtext.includes(row.expected.display),row.id+' card');
            await render(speciesActors[0].actor);assert.equal(await label.innerText(),'Second species');
            speciesRows.push({width,id:row.id,status:row.expected.status,display:row.expected.display,header:true,cardProjection:true,recovery:true});
        }
        for(const row of defenseTraits){
            await render(row.actor);
            if(width<1024)await page.getByRole('button',{name:'DEFENSES',exact:true}).click();
            const surface=width<1024?page.getByRole('dialog',{name:'Defenses',exact:true}):page;
            for(const [key,label] of Object.entries({dr:'Damage resistances',di:'Damage immunities',dv:'Damage vulnerabilities',ci:'Condition immunities',dm:'Damage adjustments'})){
                const value=surface.getByLabel(label,{exact:true}),fact=row.actor.derived.defenses.categories[key];
                assert.equal(await value.getAttribute('data-status'),row.expected[key]?'ready':'unavailable',row.id+'/'+key);
                if(row.expected[key])assert.equal(await value.innerText(),fact.display,row.id+'/'+key);
                else assert.ok((await value.innerText()).startsWith('Unavailable'),row.id+'/'+key);
                assert.ok(await value.getAttribute('title'));
            }
            assert.equal(row.card.blocks.find(b=>b.title==='Defenses').value,row.actor.derived.defenses.summary);
            if(width<1024)await surface.getByRole('button',{name:'Close',exact:true}).click();
            await render(defenseTraits[1].actor);
            if(width<1024){await page.getByRole('button',{name:'DEFENSES',exact:true}).click();assert.equal(await page.getByRole('dialog',{name:'Defenses'}).getByLabel('Damage resistances',{exact:true}).innerText(),'Cold');await page.getByRole('button',{name:'Close',exact:true}).click();}
            else assert.equal(await page.getByLabel('Damage resistances',{exact:true}).innerText(),'Cold');
            defenseTraitRows.push({width,id:row.id,actualConsumers:true,cardProjection:true,recovery:true});
        }
        if(width<1024){
            await render(defenseTraits[1].actor);await page.getByRole('button',{name:'DEFENSES',exact:true}).click();
            const dialog=page.getByRole('dialog',{name:'Defenses',exact:true});
            await render(defenseTraits.at(-1).actor);assert.equal(await dialog.getByLabel('Damage resistances',{exact:true}).getAttribute('data-status'),'unavailable');
            await render(defenseTraits[0].actor);assert.equal(await dialog.getByLabel('Damage resistances',{exact:true}).innerText(),'None');
            await render(defenseTraits[1].actor);assert.equal(await dialog.getByLabel('Damage resistances',{exact:true}).innerText(),'Cold');
            assert.equal(await page.evaluate(()=>window.skillFixture.updates.length),0);await dialog.getByRole('button',{name:'Close',exact:true}).click();
            defenseTraitRows.push({width,id:'live-read-only-context-and-source',recovery:true,zeroWrites:true});
        }
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
        await render(tools.supported); await tab('Skills');
        const toolControl=page.getByRole('button',{name:"Thieves' tools Tool Check",exact:true});
        await verifyOptions(toolControl,'tool',5);
        // RV04/DD-R06: pointer exit must not erase a still-focused action.
        await toolControl.click();
        const focusDialog=page.locator('dialog[open]'), advantage=focusDialog.getByRole('button',{name:'Advantage',exact:true});
        const preview=async()=>((await focusDialog.innerText()).match(/(?:1d20|2d20k[hl]1)[+-]5/) ?? [])[0];
        await advantage.focus();await advantage.hover();const beforePointerLeaves=await preview();
        await page.mouse.move(0,0);const afterPointerLeaves=await preview();
        const retainedFocus=await advantage.evaluate(element=>element===document.activeElement);
        await page.keyboard.press('Enter');const submitted=(await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0]?.formula;
        focusRows.push({width,beforePointerLeaves,afterPointerLeaves,retainedFocus,submitted});
        assert.equal(retainedFocus,true);assert.equal(submitted,'2d20kh1+5');
        await toolControl.click();
        await advantage.focus();await focusDialog.getByRole('button',{name:'Disadvantage',exact:true}).hover();
        assert.equal(await preview(),'2d20kh1+5','Focus takes precedence over a different hovered action');
        await focusDialog.getByRole('button',{name:'Normal',exact:true}).focus();
        assert.equal(await preview(),'1d20+5','Focus transfer previews its action');
        await focusDialog.getByRole('textbox',{name:'Situational bonus'}).focus();
        assert.equal(await preview(),'2d20kl1+5','Blur falls back to remaining hover');
        await page.mouse.move(0,0);assert.equal(await preview(),'1d20+5','Neither interaction restores source default');
        await focusDialog.getByRole('button',{name:'Close',exact:true}).click();


        for(const [id,actor] of Object.entries(tools).filter(([id])=>id!=='supported')) {
            await render(tools.supported);await toolControl.click();await page.locator('dialog[open]').waitFor();
            await render(actor);await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
            const bounded=id.startsWith('range-');assert.equal(await toolControl.isDisabled(),!bounded,id);
            assert.match(await toolControl.innerText(),id.startsWith('range-')?/\+5/:/—/);
            assert.ok(await toolControl.getAttribute('title'));
            await toolControl.dispatchEvent('click',{shiftKey:true});const dispatched=await page.evaluate(()=>window.skillFixture.calls.splice(0));assert.equal(dispatched.length,bounded?1:0);if(bounded)assert.equal(dispatched[0].formula,'1d20'+(id.endsWith('-min')?'min10':'max10')+'+5');
            await render(tools.supported);assert.equal(await toolControl.isEnabled(),true);
            await toolControl.click({modifiers:['Shift']});const calls=await page.evaluate(()=>window.skillFixture.calls.splice(0));
            assert.equal(calls.length,1);assert.equal(calls[0].type,'tool');assert.equal(calls[0].key,'thief');assert.equal(calls[0].formula,'1d20+5');
            toolRows.push({width,id,disabled:!bounded,qualifiedNormalRange:bounded,staleDialogRetired:true,recovery:true});
        }
        for(const row of toolExamples) {
            await render(row.actor);const control=page.getByRole('region',{name:'Tool checks',exact:true}).getByRole('button');
            const text=await control.innerText();assert.ok(text.includes(row.ability.toUpperCase()));assert.ok(text.includes(row.prof+'×'));
            assert.ok(text.includes((row.total<0?'':'+')+row.total));
            await control.click({modifiers:['Shift']});const calls=await page.evaluate(()=>window.skillFixture.calls.splice(0));
            assert.equal(calls[0].key,row.key);assert.equal(calls[0].formula,'1d20'+(row.total<0?'':'+')+row.total);
            toolRows.push({width,key:row.key,total:row.total,prof:row.prof,actualConsumer:true});
        }
        await render(tools.supported);
        for(const state of toolModes) {
            await toolControl.click();await page.locator('dialog[open]').waitFor();await render(state.actor);
            await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
            for(const [name,choice,die] of [['Normal','normal','1d20'],['Advantage','adv','2d20kh1'],['Disadvantage','dis','2d20kl1']]) {
                await toolControl.click();assert.ok((await page.locator('dialog[open]').innerText()).includes(state.formula));
                await page.getByRole('textbox',{name:'Situational bonus'}).fill('-1.5');
                const button=page.getByRole('button',{name,exact:true});await button.focus();
                const formula=die+'+5+(-1.5)';assert.ok((await page.locator('dialog[open]').innerText()).includes(formula));
                await button.click();const calls=await page.evaluate(()=>window.skillFixture.calls.splice(0));
                assert.equal(calls[0].formula,formula);assert.equal(calls[0].options.advantage,choice);
            }
            await toolControl.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,state.formula);
            toolRows.push({width,mode:state.mode,formula:state.formula,buttons:true,previews:true,shortcut:true});
        }
        await page.evaluate(actor=>window.skillFixture.render(actor,'tool'),tools.supported);
        await toolControl.click();await page.evaluate(()=>window.skillFixture.hold());
        await page.evaluate(actor=>window.skillFixture.render(actor,'tool'),tools['snapshot-absent']);
        await page.evaluate(actor=>window.skillFixture.render(actor,'tool'),tools.supported);
        assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld({advantage:'adv'})),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
        toolRows.push({width,retainedCallbackFencedAcrossRecovery:true});
        await render(combinations[8].actor);await tab('Skills');
        const combinedControl=kind=>kind==='skill'?skill:toolControl;
        for(const row of combinations) {
            await render(row.actor);await combinedControl(row.kind).click();
            const dialog=page.locator('dialog[open]');
            await dialog.getByRole('combobox',{name:row.kind==='skill'?'Combine with tool':'Combine with skill',exact:true}).selectOption(row.combined?(row.kind==='skill'?'thief':'prc'):'');
            await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption(row.ability);
            await page.mouse.move(0,0);
            const expected=(row.expectedMode===1?'2d20kh1':row.expectedMode===-1?'2d20kl1':'1d20')+'+'+row.expectedTotal;
            assert.ok((await dialog.innerText()).includes(expected),row.id+' preview');
            assert.ok((await dialog.getByRole('heading').innerText()).includes(row.ability==='dex'?'Dexterity':'Wisdom'),'Selected ability updates heading');
            await dialog.getByRole('button',{name:'Normal',exact:true}).click();
            const calls=await page.evaluate(()=>window.skillFixture.calls.splice(0));assert.equal(calls.length,1);
            assert.equal(calls[0].formula,'1d20+'+row.expectedTotal);assert.equal(calls[0].options.ability,row.ability);
            combinationRows.push({width,id:row.id,defaultPreview:expected,manualNormal:calls[0].formula});
        }
        for(const kind of ['skill','tool']) {
            const actor=combinations[8].actor;await render(actor);await combinedControl(kind).click();
            const dialog=page.locator('dialog[open]'),secondary=dialog.getByRole('combobox',{name:kind==='skill'?'Combine with tool':'Combine with skill',exact:true}),ability=dialog.getByRole('combobox',{name:'Check ability',exact:true});
            await secondary.selectOption(kind==='skill'?'thief':'prc');await ability.selectOption('wis');await page.mouse.move(0,0);
            assert.ok((await dialog.innerText()).includes(kind==='skill'?'1d20+15':'1d20+17'));
            await secondary.selectOption('');assert.ok((await dialog.innerText()).includes('2d20kl1+15'),'Clearing secondary removes automatic advantage and uses primary proficiency');
            await ability.selectOption('');assert.ok((await dialog.innerText()).includes(kind==='skill'?'2d20kl1+15':'2d20kh1+10'),'Default ability restored');
            await secondary.selectOption(kind==='skill'?'thief':'prc');await ability.selectOption('dex');
            await secondary.selectOption('');assert.equal(await ability.inputValue(),'dex','Valid independent ability choice remains valid');
            await secondary.selectOption(kind==='skill'?'thief':'prc');
            await dialog.getByRole('button',{name:'Disadvantage',exact:true}).focus();
            assert.ok((await dialog.innerText()).includes(kind==='skill'?'2d20kl1+10':'2d20kl1+12'));
            await page.keyboard.press('Enter');const calls=await page.evaluate(()=>window.skillFixture.calls.splice(0));
            assert.equal(calls[0].formula,kind==='skill'?'2d20kl1+10':'2d20kl1+12');
            for(const state of combinedUnavailable.filter(state=>state.id!==('selected-'+(kind==='skill'?'skill':'tool')+'-removed'))) {
                await render(actor);await combinedControl(kind).click();
                await page.getByRole('combobox',{name:kind==='skill'?'Combine with tool':'Combine with skill',exact:true}).selectOption(kind==='skill'?'thief':'prc');
                await render(state.actor);await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
                assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
                await render(actor);await combinedControl(kind).click();
                assert.equal(await page.getByRole('combobox',{name:kind==='skill'?'Combine with tool':'Combine with skill',exact:true}).inputValue(),'','Recovery starts fresh');
                await page.getByRole('button',{name:'Close',exact:true}).click();
            }
            const probe=kind==='skill'?true:'tool';
            await page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor,probe});
            await combinedControl(kind).click();await page.evaluate(()=>window.skillFixture.hold());
            await page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor:combinedUnavailable[0].actor,probe});
            await page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor,probe});
            assert.equal(await page.evaluate(kind=>window.skillFixture.submitHeld({ability:'dex',...(kind==='skill'?{tool:'thief'}:{skill:'prc'}),advantage:'adv'}),kind),'retired');
            assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
            // The same retained callback must retire on secondary source loss
            // even with the same world/context/revision fixture numbers.
            await combinedControl(kind).click();await page.evaluate(()=>window.skillFixture.hold());
            const removedSecondary=combinedUnavailable.find(state=>state.id==='selected-'+(kind==='skill'?'tool':'skill')+'-removed').actor;
            await page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor:removedSecondary,probe});
            await page.evaluate(({actor,probe})=>window.skillFixture.render(actor,probe),{actor,probe});
            assert.equal(await page.evaluate(kind=>window.skillFixture.submitHeld({ability:'dex',...(kind==='skill'?{tool:'thief'}:{skill:'prc'}),advantage:'adv'}),kind),'retired');
            assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
            combinationRows.push({width,kind,clearing:true,abilityPreservedWhenValid:true,recoveryFresh:true,retainedCallbackFenced:true,secondarySourceLossFenced:true});
            await render(actor);await tab('Skills');
        }
        await render(states.supported);await tab('Skills');
        for(const state of effectCases){
            await render(states.supported);await skill.click();
            await render(state.actor);await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
            assert.equal(await skill.isEnabled(),state.ready,state.id);
            if(state.ready){await skill.click({modifiers:['Shift']});const calls=await page.evaluate(()=>window.skillFixture.calls.splice(0));assert.equal(calls[0].formula,state.formula);}
            else {await skill.dispatchEvent('click',{shiftKey:true});assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            await render(states.supported);assert.equal(await skill.isEnabled(),true);
            effectRows.push({width,id:state.id,ready:state.ready,staleRetired:true,recovery:true});
        }

        for(const row of numericEffects){
            await render(states.supported);await tab('Skills');await skill.click();await render(row.actor);
            await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
            if(!row.expected){assert.equal(await skill.isDisabled(),true,row.id);assert.equal(await toolControl.isDisabled(),true,row.id);}
            else {
                const e=row.expected;const numericFormula=(mode,total)=>(mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20')+'+'+total;assert.equal(await skill.isEnabled(),true,row.id);
                await skill.click();const dialog=page.locator('dialog[open]');
                assert.ok((await dialog.innerText()).includes(numericFormula(e.mode??0,e.skill)),row.id+' independent');
                await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');await page.mouse.move(0,0);
                assert.ok((await dialog.innerText()).includes(numericFormula(e.combinedMode??0,e.combined)),row.id+' combined');
                await dialog.getByRole('textbox',{name:'Situational bonus'}).fill('2');
                await dialog.getByRole('button',{name:'Disadvantage',exact:true}).focus();
                assert.ok((await dialog.innerText()).includes('2d20kl1+'+e.combined+'+(2)'),row.id+' manual');
                await page.keyboard.press('Enter');assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'2d20kl1+'+e.combined+'+(2)');
                await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,numericFormula(e.mode??0,e.skill));
                await toolControl.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,numericFormula(e.toolMode??0,e.tool));
                if(e.combinedTool!==undefined){
                    await toolControl.click();const dialog=page.locator('dialog[open]');
                    await dialog.getByRole('combobox',{name:'Combine with skill',exact:true}).selectOption('prc');
                    await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('wis');await page.mouse.move(0,0);
                    assert.ok((await dialog.innerText()).includes(numericFormula(e.combinedMode??1,e.combinedTool)),row.id+' primary tool scope');
                    await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+'+e.combinedTool);
                }
                await tab('Abilities');assert.equal(await page.getByLabel('Passive Perception',{exact:true}).innerText(),String(e.passive));
                for(const [kind,total] of [['ability',e.check],['save',e.save]]){
                    await page.evaluate(({actor,kind})=>window.skillFixture.render(actor,kind),{actor:row.actor,kind});
                    const control=page.getByRole('button',{name:kind==='ability'?'Wisdom Check':'Wisdom Saving Throw',exact:true});
                    await control.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,numericFormula(kind==='ability'?(e.checkMode??0):0,total));
                }
                await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);await skill.click();await page.evaluate(()=>window.skillFixture.hold());
                await page.evaluate(actor=>window.skillFixture.render(actor,true),states['snapshot-absent']);
                await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);
                assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired',row.id);assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
            }
            await render(states.supported);await tab('Skills');assert.equal(await skill.isEnabled(),true);
            numericEffectRows.push({width,id:row.id,ready:!!row.expected,actualConsumers:true,recovery:true});
        }

        // Same revision/total, different source/default provenance also retires.
        const defaultItem=numericEffects.find(row=>row.id==='item-default:tool-required-attuned-omitted').actor;
        const explicitItem=numericEffects.find(row=>row.id==='item-default:tool-required-attuned-false').actor;
        await page.evaluate(actor=>window.skillFixture.render(actor,true),defaultItem);
        await skill.click();await page.evaluate(()=>window.skillFixture.hold());
        await page.evaluate(actor=>window.skillFixture.render(actor,true),explicitItem);
        await page.evaluate(actor=>window.skillFixture.render(actor,true),defaultItem);
        assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');
        assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
        numericEffectRows.push({width,id:'item-default:equal-total-source-default-retirement',retainedCallbackFenced:true});

        const literalTrait=numericEffects.find(row=>row.id==='trait-effect:add-plain').actor;
        const jsonTrait=numericEffects.find(row=>row.id==='trait-effect:add-json-scalar').actor;
        await page.evaluate(actor=>window.skillFixture.render(actor,true),literalTrait);
        await skill.click();await page.evaluate(()=>window.skillFixture.hold());
        await page.evaluate(actor=>window.skillFixture.render(actor,true),jsonTrait);
        await page.evaluate(actor=>window.skillFixture.render(actor,true),literalTrait);
        assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');
        assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
        numericEffectRows.push({width,id:'trait-effect:equal-total-equal-set-retirement',retainedCallbackFenced:true});

        const literalClass=numericEffects.find(row=>row.id==='initial-filter:class:level-5').actor;
        await page.evaluate(actor=>window.skillFixture.render(actor,true),literalClass);await skill.click();await page.evaluate(()=>window.skillFixture.hold());
        await page.evaluate(actor=>window.skillFixture.render(actor,true),classEquivalent);
        await page.evaluate(actor=>window.skillFixture.render(actor,true),literalClass);
        assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
        numericEffectRows.push({width,id:'initial-filter:class:equal-facts-source-identity-retirement',retainedCallbackFenced:true});

        const literalCollection=numericEffects.find(row=>row.id==='initial-filter:collection:dr.value-has').actor;
        await page.evaluate(actor=>window.skillFixture.render(actor,true),literalCollection);await skill.click();await page.evaluate(()=>window.skillFixture.hold());
        await page.evaluate(actor=>window.skillFixture.render(actor,true),collectionEquivalent);
        await page.evaluate(actor=>window.skillFixture.render(actor,true),literalCollection);
        assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
        numericEffectRows.push({width,id:'initial-filter:collection:equal-initial-set-source-retirement',retainedCallbackFenced:true});

        const defaultFilter=numericEffects.find(row=>row.id==='constant-filter:empty-object').actor;
        const arrayFilter=numericEffects.find(row=>row.id==='constant-filter:empty-array').actor;
        await page.evaluate(actor=>window.skillFixture.render(actor,true),defaultFilter);
        await skill.click();await page.evaluate(()=>window.skillFixture.hold());
        await page.evaluate(actor=>window.skillFixture.render(actor,true),arrayFilter);
        await page.evaluate(actor=>window.skillFixture.render(actor,true),defaultFilter);
        assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');
        assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
        numericEffectRows.push({width,id:'constant-filter:equal-outcome-filter-identity-retirement',retainedCallbackFenced:true});

        const effectFormula=(mode,total)=>`${mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20'}+${total}`;
        for(const row of modeEffects){
            await render(states.supported);await tab('Skills');await skill.click();await render(row.actor);await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
            const e=row.expected;
            if(!e){assert.equal(await skill.isDisabled(),true,row.id);assert.equal(await toolControl.isDisabled(),true,row.id);}
            else {
                await skill.click();const dialog=page.locator('dialog[open]');assert.ok((await dialog.innerText()).includes(effectFormula(e.mode,5)),row.id+' default');
                await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');await page.mouse.move(0,0);
                assert.ok((await dialog.innerText()).includes(effectFormula(e.combinedMode,5)),row.id+' combined skill');
                await dialog.getByRole('textbox',{name:'Situational bonus'}).fill('2');await dialog.getByRole('button',{name:'Normal',exact:true}).focus();
                assert.ok((await dialog.innerText()).includes('1d20+5+(2)'));await page.keyboard.press('Enter');assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+5+(2)');
                await skill.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,effectFormula(e.mode,5));
                await toolControl.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,effectFormula(e.toolMode,4));
                await toolControl.click();await dialog.getByRole('combobox',{name:'Combine with skill',exact:true}).selectOption('prc');await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('wis');await page.mouse.move(0,0);
                assert.ok((await dialog.innerText()).includes(effectFormula(e.combinedToolMode,5)),row.id+' combined tool');
                await dialog.getByRole('button',{name:'Advantage',exact:true}).focus();await page.keyboard.press('Enter');assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'2d20kh1+5');
                await tab('Abilities');assert.equal(await page.getByLabel('Passive Perception',{exact:true}).innerText(),String(e.passive));
                for(const [kind,mode] of [['ability',e.abilityMode],['save',e.saveMode]]){
                    await page.evaluate(({actor,kind})=>window.skillFixture.render(actor,kind),{actor:row.actor,kind});const control=page.getByRole('button',{name:kind==='ability'?'Wisdom Check':'Wisdom Saving Throw',exact:true});
                    await control.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,effectFormula(mode,2));
                }
                await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);await skill.click();await page.evaluate(()=>window.skillFixture.hold());
                await page.evaluate(actor=>window.skillFixture.render(actor,true),states['snapshot-absent']);await page.evaluate(actor=>window.skillFixture.render(actor,true),row.actor);
                assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
            }
            await render(states.supported);await tab('Skills');assert.equal(await skill.isEnabled(),true);effectModeRows.push({width,id:row.id,expected:e,retired:true,recovery:true});
        }

        for(const row of healthActors){
            await render(healthActors[0].actor);await render(row.actor);
            const hp=row.expected??row.availableHp,hd=row.expected?{max:row.expected.hdMax,value:row.expected.hdValue}:row.availableHd;
            assert.equal(await page.getByLabel('Current hit points',{exact:true}).innerText(),hp?String(hp.value):'—',row.id);
            assert.equal(await page.getByLabel('Maximum hit points',{exact:true}).innerText(),hp?String(hp.effectiveMax):'—',row.id);
            if(hd){assert.equal(await page.getByLabel('Remaining hit dice',{exact:true}).innerText(),String(hd.value),row.id);assert.equal(await page.getByLabel('Maximum hit dice',{exact:true}).innerText(),String(hd.max),row.id);}
            else assert.match(await page.getByLabel('Hit dice',{exact:true}).innerText(),/—/,row.id);
            if(width===1440){
                for(const name of ['HEAL','DAMAGE','Edit hit points']){const button=page.getByRole('button',{name,exact:true});assert.equal(await button.isDisabled(),true,row.id);await button.dispatchEvent('click');}
                assert.equal(await page.getByRole('button',{name:/Short Rest/}).isDisabled(),true);assert.equal(await page.getByRole('button',{name:/Long Rest/}).isDisabled(),true);
            }else assert.equal(await page.getByRole('button',{name:'Rest',exact:true}).isDisabled(),true);
            assert.equal(await page.locator('dialog[open]').count(),0);assert.equal(await page.evaluate(()=>window.skillFixture.updates.length),0);
            await render(healthActors[0].actor);assert.equal(await page.getByLabel('Current hit points',{exact:true}).innerText(),'7');assert.equal(await page.getByLabel('Maximum hit points',{exact:true}).innerText(),'10');
            healthRows.push({width,id:row.id,hp:hp??'unavailable',hitDice:hd??'unavailable',unqualifiedCommandsDisabled:true,recovery:true});
        }

        const initiativeFormula=row=>row.expected.fixed?String(row.expected.rollBonus):`${row.expected.mode===1?'2d20kh1':row.expected.mode===-1?'2d20kl1':'1d20'}${row.rangeSuffix??''}${row.expected.total<0?'':'+'}${row.expected.total}${row.settings?.tie&&!row.expected.fixed?'+0.14':''}`;
        for(const row of [...defenses,...defenseUnavailable]){
            await render(initiativeBaseline);await page.getByRole('button',{name:'Roll initiative',exact:true}).click();await render(row.actor);await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
            const e=row.expected,available=e.total!==null&&!row.executionUnavailable,control=page.getByRole('button',{name:'Roll initiative',exact:true});
            const acText=await page.getByLabel('Armor class',{exact:true}).innerText(),initText=await page.getByLabel('Initiative modifier',{exact:true}).innerText();
            assert.ok(acText.startsWith(e.ac===null?'—':String(e.ac)),row.id+' armor');assert.ok(initText.startsWith(e.total===null?'—':(e.total<0?'':'+')+e.total),row.id+' initiative');
            assert.equal(await control.isEnabled(),available,row.id);
            if(available){
                await control.click();const dialog=page.locator('dialog[open]');assert.ok((await dialog.innerText()).includes(initiativeFormula(row)),row.id+' preview');
                if(e.fixed){assert.equal(await dialog.getByRole('button',{name:'Advantage',exact:true}).isDisabled(),true);assert.equal(await dialog.getByRole('button',{name:'Disadvantage',exact:true}).isDisabled(),true);assert.equal(await dialog.getByRole('textbox',{name:'Situational bonus'}).isDisabled(),true);}
                else {await dialog.getByRole('textbox',{name:'Situational bonus'}).fill('2');await dialog.getByRole('button',{name:row.rangeSuffix?'Normal':'Disadvantage',exact:true}).focus();assert.ok((await dialog.innerText()).includes((row.rangeSuffix?'1d20'+row.rangeSuffix:'2d20kl1')+(e.total<0?'':'+')+e.total+(row.settings?.tie?'+0.14':'')+'+(2)'));if(row.rangeSuffix)assert.equal(await dialog.getByRole('button',{name:'Advantage',exact:true}).isDisabled(),true);}
                await dialog.getByRole('button',{name:e.fixed||row.rangeSuffix?'Normal':'Disadvantage',exact:true}).click();const calls=await page.evaluate(()=>window.skillFixture.calls.splice(0));assert.equal(calls[0].formula,e.fixed?String(e.rollBonus):(row.rangeSuffix?'1d20'+row.rangeSuffix:'2d20kl1')+(e.total<0?'':'+')+e.total+(row.settings?.tie?'+0.14':'')+'+(2)');
                await control.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,initiativeFormula(row));
            }else{await control.dispatchEvent('click',{shiftKey:true});assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            await render(defenses[0].actor);assert.equal(await page.getByRole('button',{name:'Roll initiative',exact:true}).isEnabled(),true);
            defenseRows.push({width,id:row.id,ac:e.ac,initiative:e.total,available,fixed:!!e.fixed,recovery:true});
        }
        for(const row of equipmentActors){
            await render(row.actor);const e=row.expected;
            assert.ok((await page.getByLabel('Armor class',{exact:true}).innerText()).startsWith(e.ac===null?'—':String(e.ac)),row.id);
            if(row.warnings?.length)assert.equal(await page.getByRole('status').filter({hasText:/Multiple (armor|shields) equipped/}).count(),row.warnings.length);
            await tab('Skills');const control=page.getByRole('button',{name:/Stealth/});
            assert.equal(await control.isEnabled(),e.skill!==null,row.id);
            if(e.skill!==null){
                const die=e.mode===1?'2d20kh1':e.mode===-1?'2d20kl1':'1d20',formula=die+'+'+e.skill;
                await control.click();let dialog=page.locator('dialog[open]');assert.ok((await dialog.innerText()).includes(formula),row.id+' preview');
                await dialog.getByRole('button',{name:'Normal',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'1d20+'+e.skill);
                await control.click({modifiers:['Shift']});assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,formula);
                if(row.selected){
                    await control.click();dialog=page.locator('dialog[open]');await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('thief');assert.ok((await dialog.innerText()).includes('1d20+5'));
                    await dialog.getByRole('combobox',{name:'Check ability',exact:true}).selectOption('wis');assert.ok((await dialog.innerText()).includes('1d20+6'));
                    await dialog.getByRole('combobox',{name:'Combine with tool',exact:true}).selectOption('');assert.ok((await dialog.innerText()).includes('2d20kl1+6'));
                    await dialog.getByRole('button',{name:'Disadvantage',exact:true}).click();assert.equal((await page.evaluate(()=>window.skillFixture.calls.splice(0)))[0].formula,'2d20kl1+6');
                }
            }
            equipmentRows.push({width,id:row.id,ac:e.ac,skill:e.skill,passive:e.passive,mode:e.mode,sharedPreviewAndShortcut:true});
        }
        // Equipment identity changes retire callbacks even with equal numbers
        // and revision. No stale equipment roll is replayed on recovery.
        const armorActor=equipmentActors.find(row=>row.id==='stealth-disadvantage-after-passive').actor;
        await page.evaluate(actor=>window.skillFixture.render(actor,true),armorActor);await page.getByRole('button',{name:/Stealth/}).click();await page.evaluate(()=>window.skillFixture.hold());
        await page.evaluate(actor=>window.skillFixture.render(actor,true),equipmentEquivalent);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');
        await page.evaluate(actor=>window.skillFixture.render(actor,true),armorActor);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);

        for(const row of [...movementActors,...movementUnavailable]){
            await render(row.actor);const e=row.expected;
            const walking=await page.getByLabel('Walking speed',{exact:true}).innerText();
            assert.ok(walking.startsWith(e.movement?e.movement.walk+' '+e.movement.units:'—'),row.id+' walking');
            await tab('Skills');const sensory=await page.getByLabel('Senses',{exact:true}).innerText();
            if(e.senses){
                for(const [key,label] of [['blindsight','Blindsight'],['darkvision','Darkvision'],['tremorsense','Tremorsense'],['truesight','Truesight']])if(e.senses[key]>0)assert.ok(sensory.includes(label+' '+e.senses[key]+' '+e.senses.units),row.id+' senses');
                if(e.senses.special)assert.ok(sensory.includes(e.senses.special),row.id+' special');
                if(!e.senses.special&&!['blindsight','darkvision','tremorsense','truesight'].some(key=>e.senses[key]>0))assert.equal(sensory,'No additional senses',row.id);
            }else assert.ok(sensory.startsWith('Unavailable:'),row.id+' sensory unavailable');
            const detail=await page.getByLabel('Movement details',{exact:true}).innerText();
            if(e.movement?.jump!==null&&e.movement)assert.ok(detail.includes('Jump '+e.movement.jump+' '+e.movement.units),row.id+' jump');
            if(e.movement?.hover)assert.ok(detail.includes('Hover'),row.id+' hover');
            await render(movementActors[0].actor);assert.equal(await page.getByLabel('Walking speed',{exact:true}).innerText(),'0 ft');
            assert.equal(await page.evaluate(()=>window.skillFixture.updates.length),0);
            movementRows.push({width,id:row.id,walking:e.movement?e.movement.walk:null,senses:e.senses??'unavailable',recovery:true,fixtureWrites:0});
        }

        for(const row of rangeActors){
            await render(row.actor);await tab(row.kind==='ability'||row.kind==='save'?'Abilities':'Skills');
            const control=row.kind==='skill'?skill:row.kind==='tool'?toolControl:page.getByRole('button',{name:row.kind==='ability'?'Wisdom Check':row.kind==='save'?'Wisdom Saving Throw':'Roll initiative',exact:true});
            assert.equal(await control.isEnabled(),true,row.id+' reviewable');
            await control.click({modifiers:['Shift']});let calls=await page.evaluate(()=>window.skillFixture.calls.splice(0));assert.equal(calls.length,row.sourceMode===0?1:0,row.id+' qualified default only');if(calls.length)assert.equal(calls[0].formula,row.formula);
            await control.click();const dialog=page.locator('dialog[open]');
            assert.equal(await dialog.getByRole('button',{name:'Normal',exact:true}).isEnabled(),true);
            for(const name of ['Advantage','Disadvantage']){const button=dialog.getByRole('button',{name,exact:true});assert.equal(await button.isDisabled(),true);await button.dispatchEvent('click');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);}
            if(row.sourceMode===0)assert.ok((await dialog.innerText()).includes(row.formula),row.id+' default preview');else assert.ok((await dialog.innerText()).includes('Choose Normal'),row.id+' default reason');
            await dialog.getByRole('textbox',{name:'Situational bonus'}).fill('-1.5');assert.equal(await dialog.getByRole('textbox',{name:'Situational bonus'}).getAttribute('aria-invalid'),'false');
            await dialog.getByRole('button',{name:'Normal',exact:true}).focus();assert.ok((await dialog.innerText()).includes(row.formula+'+(-1.5)'));
            await dialog.getByRole('button',{name:'Normal',exact:true}).press('Enter');calls=await page.evaluate(()=>window.skillFixture.calls.splice(0));assert.equal(calls.length,1);assert.equal(calls[0].formula,row.formula+'+(-1.5)');
            rangeRows.push({width,id:row.id,sourceMode:row.sourceMode,defaultAvailable:row.sourceMode===0,explicitNormal:true,boundedSelectionBlocked:true});
        }
        const boundedSkill=rangeActors.find(row=>row.kind==='skill'&&row.sourceMode===1).actor;
        await page.evaluate(actor=>window.skillFixture.render(actor,true),boundedSkill);await skill.click();await page.evaluate(()=>window.skillFixture.hold());
        await page.evaluate(actor=>window.skillFixture.render(actor,true),states['snapshot-absent']);await page.evaluate(actor=>window.skillFixture.render(actor,true),boundedSkill);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld({advantage:'normal'})),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
        await skill.click();await page.evaluate(()=>window.skillFixture.hold());await page.evaluate(actor=>window.skillFixture.render(actor,true),rangeChanged);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld({advantage:'normal'})),'retired');await page.evaluate(actor=>window.skillFixture.render(actor,true),boundedSkill);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld({advantage:'normal'})),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);

        // Retained callbacks must not survive context, settings or public UUID
        // changes even when Actor IDs/source revisions and numeric totals match.
        const base=defenses[0].actor;
        await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),base);await page.getByRole('button',{name:'Roll initiative',exact:true}).click();await page.evaluate(()=>window.skillFixture.hold());
        await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),defenseUnavailable[0].actor);await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),base);
        assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');
        const first={...base,uuid:'Scene.offline.Token.first.Actor.synthetic'},second={...base,uuid:'Scene.offline.Token.second.Actor.synthetic'};
        await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),first);await page.getByRole('button',{name:'Roll initiative',exact:true}).click();await page.evaluate(()=>window.skillFixture.hold());
        await page.evaluate(actor=>window.skillFixture.render(actor,'initiative'),second);assert.equal(await page.evaluate(()=>window.skillFixture.submitHeld()),'retired');assert.equal(await page.evaluate(()=>window.skillFixture.calls.length),0);
        assert.deepEqual(errors, []);
        await context.close();
    }
    writeFileSync(join(artifacts, 'focus.json'),JSON.stringify(focusRows,null,2));
    for(const row of focusRows)assert.equal(row.afterPointerLeaves,'2d20kh1+5','DD-R06/'+row.width+'; artifacts '+artifacts);
    writeFileSync(join(artifacts, 'evidence.json'), JSON.stringify({ evidence: 'Isolated mounted module R; SDK presentation seam; not installed Core U/I or native N/O',
        customPhase:featCustomOnly?'feat-final':itemCustomOnly?'item-initial':conditionCustomOnly?'condition':initialCustomOnly?'initial':'final', playwright: toolRequire('playwright/package.json').version, browser: browser.version(), rows, previewRows, factRows, modeRows, toolRows, focusRows, combinationRows, effectRows, numericEffectRows, effectModeRows, healthRows, defenseRows, equipmentRows, movementRows, rangeRows, speciesRows, defenseTraitRows, indicatorRows, trainingRows, focusedFilterRows, classFactRows, conditionRows, exhaustionRows, familyRows, petrificationRows, finalModeRows, finalProficiencyRows, finalBonusRows, finalNumberResults, sourceFlagResults, finalDefenseResults, finalTrainingResults, finalCiResults, finalCustomResults }, null, 2));
    if(finalCustomOnly)process.stdout.write('Mounted focused custom Strings: '+finalCustomResults.length+' desktop/mobile current fields/earlier labels/cards/previews/shortcuts/recovery states PASS; artifacts '+artifacts+'\n');
    if(finalCiOnly)process.stdout.write('Mounted focused final CI: '+finalCiResults.length+' current conditions/earlier passives-cached reductions/selected previews/shortcuts/init/recovery states PASS; artifacts '+artifacts+'\n');
    if(finalTrainingOnly)process.stdout.write('Mounted focused final training Sets: '+finalTrainingResults.length+' actual current fields/earlier language labels/card/stale intent/recovery states PASS; artifacts '+artifacts+'\n');
    if(finalDefenseOnly)process.stdout.write('Mounted focused final defense Sets: '+finalDefenseResults.length+' actual desktop/mobile current field/physical bypass/card/recovery/intent states PASS; artifacts '+artifacts+'\n');
    if(sourceFlagsOnly)process.stdout.write('Mounted focused source flags: '+sourceFlagResults.length+' actual skill/tool/passive/ability/init/selected/manual/shortcut/recovery states PASS; artifacts '+artifacts+'\n');
    if(finalNumbersOnly)process.stdout.write('Mounted focused final numbers: '+finalNumberResults.length+' actual current score/earlier modifier/proficiency/passive/selected roll/tie/fixed/recovery states PASS; artifacts '+artifacts+'\n');
    else if(finalBonusesOnly)process.stdout.write('Mounted focused final bonuses: '+finalBonusRows.length+' actual current bonus/earlier passive-score/header/selected preview/execution/recovery states PASS; artifacts '+artifacts+'\n');
    else if(finalProficienciesOnly)process.stdout.write('Mounted focused final proficiencies: '+finalProficiencyRows.length+' actual snapshot/indicator/note/preview/selection/execution/recovery states PASS; artifacts '+artifacts+'\n');
    else if(finalModesOnly)process.stdout.write('Mounted focused final modes: '+finalModeRows.length+' actual passive/score/preview/execution/recovery states PASS; artifacts '+artifacts+'\n');
    else if(petrificationOnly)process.stdout.write('Mounted focused petrification: '+petrificationRows.length+' actual status/defense/movement/preview/execution/recovery states PASS; artifacts '+artifacts+'\n');
    else if(familyOnly)process.stdout.write('Mounted focused condition family: '+familyRows.length+' actual readout/save/init/preview/execution/recovery states PASS; artifacts '+artifacts+'\n');
    else if(exhaustionOnly)process.stdout.write('Mounted focused exhaustion: '+exhaustionRows.length+' actual header/status/passive/preview/execution/recovery states PASS; artifacts '+artifacts+'\n');
    else if(conditionsOnly)process.stdout.write('Mounted focused conditions: '+conditionRows.length+' actual readout/preview/execution/recovery states PASS; artifacts '+artifacts+'\n');
    else if(classFactsOnly)process.stdout.write('Mounted focused class facts: '+classFactRows.length+' actual card/header/proficiency/skill/recovery states PASS; artifacts '+artifacts+'\n');
    else if(filtersOnly)process.stdout.write('Mounted focused filter fixtures: '+focusedFilterRows.length+' actual consumer/preview/execution/recovery states PASS; artifacts '+artifacts+'\n');
    else if(trainingDiagnosticsOnly)process.stdout.write('Mounted training diagnostics only: '+trainingRows.filter(row=>JSON.stringify(row.observed)!==JSON.stringify(row.expected)).length+' mismatching rows; artifacts '+artifacts+'\n');
    else if(indicatorDiagnosticsOnly)process.stdout.write('Mounted indicator diagnostics only: '+indicatorRows.filter(row=>row.observedSkill!==row.expectedSkill||row.observedSave!==row.expectedSave).length+' mismatching rows; artifacts '+artifacts+'\n');
    else     process.stdout.write(`Mounted module fixtures: ${rows.length} transitions, ${previewRows.length} preview validations, ${factRows.length} fact projections, ${modeRows.length} source modes, ${toolRows.length} tool cases, ${combinationRows.length} selected checks, ${effectRows.length} eligibility and ${numericEffectRows.length} field and ${effectModeRows.length} mode effect cases, ${healthRows.length} health and ${defenseRows.length} AC/initiative and ${equipmentRows.length} equipped armor and ${movementRows.length} movement/senses and ${trainingRows.length} source training and ${indicatorRows.length} proficiency indicators and ${defenseTraitRows.length} defense traits and ${speciesRows.length} species identity and ${rangeRows.length} normal-range projections and retained-callback fences PASS; artifacts ${artifacts}\n`);
} finally { await browser.close(); }
