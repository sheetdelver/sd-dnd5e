# Native reference: D&D 5e 6.0.6

Investigation date: 2026-10-19. Supporting evidence for [ADR-0001](../adr/0001-complete-character-lifecycle.md), not a second implementation plan. Paths beginning `module/`, `packs/` or `system.json` in this document refer to **Foundry's D&D system**, not SheetDelver's module.

## Version authority

The [Foundry package listing](https://foundryvtt.com/packages/dnd5e) identifies **6.0.6** as the current installable release, requiring **Foundry 14.367+**, verified generation 14. The [release](https://github.com/foundryvtt/dnd5e/releases/tag/release-6.0.6) points to `87e94dbd9f930135e0694cd7e7d49f210603cd2c`. This is the selected oracle, following the user's clarification to use the current Foundry release. It is not a claim about the operator's deployed system.

The Core reference `temp/dnd5e` checkout is clean on `6.0.x`, HEAD `28f35531021bb07609c79c4cbbb9b7e7c2744bf9`, described as `release-6.0.6-2-g28f355310`. The complete release-to-HEAD diff is four changed lines in `module/applications/api/application-v2-mixin.mjs`. All models, rules, settings, packs and document methods cited below are identical to the release. No checkout, fetch, reset or branch change was performed. From this module, that reference is `../../../../temp/dnd5e`. A separate module-local `temp/dnd5e` is clean at older `965ad2d0c`; it contains the same pinned release objects but its HEAD is not an oracle either. Read exact release files with `git -C <reference> show release-6.0.6:<path>`; do not treat branch names or future branch changes as release evidence.

Foundry's listing also offers system **5.3.3** for Foundry **13.351+**. That is a separate older schema/runtime profile, not evidence that 6.0.6 runs on v13. It is outside the primary implementation qualification. The existing module test's `systemVersion: '5.3.3'` does not establish support for either profile.

Temporary Foundry core source copies were available, without independently established build identities:

| File under Core `temp/` | Bytes | SHA-256 |
| --- | ---: | --- |
| `foundry-v13.mjs` | 6249998 | `ffe2756dda6aeae453a57d53d6bd87c0a14747beffce093fae9b21fc776af073` |
| `foundry-v14.mjs` | 7709341 | `d34e6bc53a26f794b41b89b51e27c7a5c899318cf2632d2c8a6c39f8434afdfb` |

These copies help identify runtime coupling; they do not establish native acceptance on a specific build. The parked native preparation-runtime experiment remains parked.

## Data and execution map

Use the [versioned upstream tree](https://github.com/foundryvtt/dnd5e/tree/release-6.0.6) with the exact paths and symbols below. Preparation outputs must remain distinct from persisted source. The server receives JSON documents, not instances of these classes.

RV02 clarification: `CreatureTemplate.defineSchema` in
`module/data/actor/templates/creature.mjs` declares
`rolls.ability.{check,save,skill,tool}.proficiency` with `initial:0` and
`persisted:false`. These are preparation/effect targets, not persisted source
overrides. Foundry14.367 `SchemaField.initialize` selects a nonpersisted field's
initial value instead of supplied source data. A direct `prepareAbilities`
comparison on an already-populated plain model does not establish that source
initialization occurred. See [DD-R04](../audits/evidence/2026-10-19-c04-c05-review.md)
for exact file provenance, controlled-method qualifications and fixture guidance.

| Domain | Authoritative source and native symbols | Consequence for SheetDelver |
| --- | --- | --- |
| PC model | `module/data/actor/character.mjs`: `CharacterData.defineSchema`, `prepareBaseData`, `prepareEmbeddedData`, `prepareDerivedData` | Class Item levels produce total level and proficiency. HP max may be null in source and derive from HitPoints advancements plus bonuses. Background is a local Item reference, not necessarily a display string. |
| Core actor preparation | `module/documents/actor/actor.mjs`: `Actor5e.prepareEmbeddedDocuments`, `applyActiveEffects`, `_prepareSpellcasting`; Foundry core `ClientDocumentMixin.prepareData`, `Actor.prepareData` | Model base preparation, embedded preparation, initial effects, model derived preparation, final Item attributes/spellcasting and final effects have ordered dependencies. A flat loop adding effects after all formulas is insufficient. |
| Attributes | `module/data/actor/templates/attributes.mjs`: `prepareArmorClass`, `prepareInitiative`, `prepareMovement`, `prepareHitPoints`, `prepareConcentration`; `module/documents/actor/proficiency.mjs` | Implement actual armor calculations, equipped/attuned effects, caps, alternate formulas, HP advancement, proficiency bonus/dice and initiative options. Preserve explicit overrides distinctly from derived defaults. |
| Skills and saves | `module/data/actor/templates/creature.mjs`: `prepareSkills`, `prepareSkill`, `prepareTools`; `module/data/actor/templates/common.mjs` | `skills.*.value` is proficiency multiplier, **not** total. `total` and `passive` incorporate ability, proficiency, bonuses, conditions and applicable rules. Support expertise, half proficiency, advantage and proficiency dice. |
| Movement/senses | `module/data/shared/movement-field.mjs`, `senses-field.mjs`; attribute preparation | New structured fields and units have migration shims. Read source schema explicitly; old `.walk` or assumed feet cannot be the universal representation. |
| Effects/rules | `module/documents/actor/actor.mjs:applyActiveEffects`, `module/documents/applied-rules.mjs`, `module/data/active-effect/` | Effects include statuses, conditions, phases, transfers, suppression, enchantment and applied rule filters. Do not equate a numeric ADD/MULTIPLY/OVERRIDE loop with complete 6.0.6 behavior. |
| Physical inventory | `module/data/item/templates/physical-item.mjs:defineSchema`, `module/data/item/container.mjs` | Weight is `{value, units}`, with quantity/container/currency relationships. Preserve owned IDs and container links, prevent cycles; aggregate only once. |
| Equipment | `module/data/item/templates/equippable-item.mjs`: `canAttune`, `magicAvailable`; `module/data/item/weapon.mjs`: `masteryOptions`, `attackModes` | `attuned` is a boolean in this version; that toggle's type is not itself a defect. Eligibility, limits, effects and owner-aware persistence still need implementation. Native `attunement` is a string. |
| Activity source | `module/data/item/templates/activities.mjs`, `module/data/activity/base-activity.mjs:defineSchema`, `prepareFinalData`, `_processDamagePart` | Items can have multiple activities. Select by owned Item ID + activity ID, not Item name. Damage parts, scaling, activation, targets and consumption are activity-specific. |
| Activity execution | `module/documents/activity/mixin.mjs`: `use`, `consume`, `_prepareUsageConfig`, `_prepareUsageUpdates`, `_createUsageMessage`, `refund` | Owner/canUse checks → configuration → scaling → consumption → concentration → message → final steps. SDK dice evaluation or `chat.useItem` alone does not run this machinery. Record ordered effects, not just a final total. |
| Attack/damage | `module/documents/activity/attack.mjs`, `module/data/activity/attack.mjs`, `module/data/item/weapon.mjs` | Ability choices, proficiency, ammunition, attack modes, criticals, mastery and applied bonuses must come from the selected native rule profile. Never `parseInt` a formula or assume proficiency when absent. |
| Spell Item | `module/data/item/spell.mjs:defineSchema` | Source uses `method`, numeric `prepared`, `sourceItem`, `properties` set serialized as an array, materials, activation, duration, target and activities. Old `preparation.prepared`/`components.*` reads do not cover it. |
| Spellcasting | `module/data/item/fields/spellcasting-field.mjs:prepareData`, `module/data/spellcasting/spellcasting-model.mjs`, `module/documents/actor/actor.mjs:_prepareSpellcasting`, `module/registry.mjs` | Class/subclass progression, preparation formula, multiple casting abilities, spell-list registry, shared slots and pact slots must remain distinguishable. A class label is not a casting capability. |
| Uses/recharge | `module/data/shared/uses-field.mjs`: `prepareData`, recovery and recharge methods | Source `spent`, formula-valued `max`, and recovery profiles produce available `value`. Item and activity uses are separate. A numeric `uses.max` check misses valid resources. |
| Health/rest | `module/documents/actor/actor.mjs`: `applyDamage`, `rollHitDie`, `initiateRest`, `_rest`, `_getRestHitDiceRecovery`, `_getRestHitPointRecovery`, `_getRestResourceRecovery`, `_getRestSpellRecovery`, `_getRestItemUsesRecovery`; `module/documents/actor/hit-dice.mjs` | Rest can update Actor, class Items, other Items and effects. Modern long-rest HD fraction is 1, legacy 0.5 before overrides. New-day/calendar settings affect recovery. HP fill is not a complete long rest. |
| Advancement | `module/applications/advancement/advancement-manager.mjs`: `forNewItem`, `createLevelChangeSteps`, completion; `module/documents/advancement/` | Native workflows operate on a clone, gather choices, then calculate Actor and embedded-document changes. Browser applications are not reusable server runtime. Adapt choice/plan semantics, not application classes. |
| Grant identity | `module/documents/advancement/advancement.mjs:createItemData`; ItemGrant/ItemChoice/Subclass handlers | Preserve `_stats.compendiumSource`, `flags.dnd5e.sourceId`, `advancementOrigin` (`itemId.advancementId`), `advancementRoot`, advancement IDs and selected values. IDs must be allocated/remapped consistently before persistence. |
| Equipment choices | `module/data/item/templates/starting-equipment.mjs`, `module/data/item/class.mjs`, `background.mjs` | Interpret native equipment groups, AND/OR choices, counts, currency alternatives and canonical references. Avoid hardcoded class kits or name substitution. |
| Source/edition | `module/data/shared/source-field.mjs:SourceField`, `module/data/item/templates/item-description.mjs:prepareDescriptionData` | `source.rules`, book/page/license/revision/custom and canonical source UUID serve different purposes. New-document default edition follows world settings; that does not authorize rewriting existing documents. |

### Native activity and advancement coverage inventory

`module/documents/activity/_module.mjs` exports **13 activity types**: attack, cast, check, damage, enchant, forward, heal, order, save, summon, teleport, transform and utility. The implementation must keep a disposition for every one:

- Attack/check/damage/heal/save/utility: portable character rules, consumption, typed rolls/cards and appropriate owner-authorized updates.
- Cast/forward: resolve exact linked activity/spell, retain scaling/consumption identity, detect cycles and missing/inaccessible references.
- Enchant: select an eligible owned target, create/remove dependent effects, preserve duration and origin; cross-owner targets require their own authorization.
- Summon/transform: character-facing choice, resources, linked Actor lifecycle and reversion remain part of the target. Canvas placement, tokens and templates are an explicit external boundary, not silently simulated.
- Teleport: character action and native targeting/destination intent; actual scene movement requires a separately approved host capability.
- Order: principally Bastion/facility behavior. Preserve/read and explicitly mark unsupported execution unless the broader Bastion scope is selected. It is not a missing attack implementation.

`module/documents/advancement/_module.mjs` exports **nine concrete advancement types**: AbilityScoreImprovement, HitPoints, ItemChoice, ItemGrant, ModifyItem, ScaleValue, Size, Subclass and Trait. Base Advancement is abstract. Nested spell configuration is data, not a tenth interchangeable advancement type. `system.advancement` is an object keyed by ID in 6.0.6; the native migration from arrays is in `module/data/item/templates/advancement.mjs`.

The release's pack YAML still contains advancement **arrays** (for example
`packs/_source/classes24/fighter/fighter.yml`). A versioned model schema is not
proof that every persisted/catalog payload already has its normalized shape.
Decode both the documented migration input and current model form on detached
data, preserve IDs, and capture actual backend versus native prepared shapes.
Do not rewrite a system pack or fabricate a world migration just to normalize a
catalog projection.

| Advancement | Observed configuration/value and mutation boundary | Implementation work / required comparison |
| --- | --- | --- |
| AbilityScoreImprovement | `ability-score-improvement.mjs:apply/reverse`; fixed/points/max and `value.type`, `assignments`, `feat`; updates source abilities or grants selected feat | Exact point allocation, ability limits, fixed origin changes, ASI versus feat, reversal and retained IDs; preserve source baseline rather than subtracting from unrelated later edits |
| HitPoints | `hit-points.mjs:apply/valueForLevel/getAdjustedTotal`; per-level value numeric, `max` or `avg`; original-class first level gets max; average is half die + 1 | Class HD comes from native `system.hd`; per-level CON/minimum and bonuses, multiclass first level, stored roll/average choice, current HP consequences and later CON changes |
| ItemGrant | `item-grant.mjs:apply/storagePath/restore`; configured UUIDs/optional and spell config; stored owned-ID→UUID mapping plus casting ability | Fixed versus optional counts; create exact owned copies with grant origin/root, preserve spell modifications and selected ability, reuse only the exact grant record on retry |
| ItemChoice | `item-choice.mjs:apply/getCounts/reverse`; configured per-level counts/replacements; `value.added[level]`, `value.replaced[level]` with original/replacement level/ID | Choice pools/prerequisites, old/new grant identity, recursive effects, replacement versus new allowance, reversal restoring the original owned data |
| ModifyItem | `modify-item.mjs:apply`; configured change identifiers plus local/UUID effect; `value.modified` records change/effect/item IDs | Select native eligible Items, create dependent transferred effects with source/origin, skip already-applied exact change+Item pairs, reverse only those effects; native source explicitly defers riders, so do not promise them |
| ScaleValue | `scale-value.mjs:valueForLevel`; configured type/identifier and level-keyed scale | Resolve effective value at the appropriate class level, retain typed die/number/usage semantics and `@scale` dependencies; no extra persisted total merely for presentation |
| Size | `size.mjs:apply/reverse`; configured sizes and `value.size`; updates Actor trait size | Exact valid selection, automatic single choice, native reversal behavior and consequences for dependent calculations; no token resize transport in this handler |
| Subclass | `subclass.mjs:apply/reverse`; selected UUID, `value.document/uuid`; sets subclass Item `system.classIdentifier` | Correct class match, timing/catch-up, exact owned subclass ID and nested grants, replacement/removal review |
| Trait | `trait.mjs:apply/changeKeyPath/availableChoices`; grants/choice pools, default/upgrade/expertise/mastery modes, `value.chosen` | Set-valued traits versus numeric proficiency, mastery target path, configured tool ability, duplicate upgrades/replacements and exact choice counts |

These methods mutate a native detached clone via `updateSource`; they are not
SDK persistence operations. `AdvancementManager.#complete` computes toCreate,
toUpdate and toDelete, then calls native `performBulkUpdate` with Actor changes.
The module must produce its own reviewed delta plan and use the public receipt
protocol. Native code sometimes skips unresolved content during clone assembly;
the planned module should report incomplete required dependencies before any
write, rather than create an incomplete character and call it success.

Map each type's apply/reverse/restore behavior and stored `value` into fixtures before implementing it. Cover multiclass restrictions, recursive grants, class catch-up, duplicate proficiency choices, spell grants/replacements and level changes. Ordinary character creation must not require native Foundry sheet applications.

## World settings to declare and consume

Evidence: `module/settings.mjs:registerSystemSettings`, `applyLegacyRules`, and `disableExhaustionAutomation`. The following are observed registered defaults at 6.0.6, not values read from a deployed world. Declare exact `dnd5e.<key>` with proven default provenance and exact system-version applicability through SDK `worldSettings`; read `runtime.world`, and revalidate context revision before actions. Do not copy a global `game.settings` object into the client.

| Settings | Observed defaults / meaning | Intended consumers |
| --- | --- | --- |
| `rulesVersion` | `modern`; choices modern/legacy; native requires reload | All preparation, builders and actions; show current world rule profile |
| `disableAdvancements`, `disableConcentration`, `disableExhaustion` | false each | Gate automation explicitly; preserve source and allow documented manual management |
| `allowRests` | true | Rest permission in addition to Actor ownership |
| `allowPolymorphing`, `allowSummoning` | false each | Actor transformation/summon permissions; GM policy remains authoritative |
| `metricLengthUnits`, `metricVolumeUnits`, `metricWeightUnits` | false each | Unit-aware displays/choices, no unitless calculations |
| `strictValidation` | true | Do not use a relaxed native setting to bypass module validation |
| `packSourceConfiguration` | `{}` | Native browser source inclusion policy, intersected with caller access and workflow selection |
| `allowFeats` | true | Choice availability appropriate to rules profile |
| `currencyWeight` | true | Encumbrance |
| `encumbrance` | `none`; none/normal/variant | Carrying capacity/penalties |
| `honorScore`, `sanityScore` | false each | Optional ability schema/rolls |
| `levelingMode` | `xpBoons`; noxp/xp/xpBoons | XP display, level validation and post-level-20 boon workflow |
| `proficiencyModifier` | `bonus`; bonus/dice | Rules must retain a roll term when proficiency is dice |
| `restVariant` | `normal`; normal/gritty/epic | Rest duration/recovery choices |

Also trace and declare the settings actually read by selected domains: `calendarConfig` (structured `CalendarSetting`, including `manualRecovery`), `autoRecharge`, critical damage options, `initiativeDexTiebreaker`, `autoApplyDowned`, `allowPlayerDamageTray`, `allowPlayerEffectsTray`, and visibility settings including `concealItemDescriptions`. Their defaults must be extracted from each registration/type schema in milestone M1; do not invent them from the table above. Calendar-dependent automatic passage of time is a separate host dependency. Client preferences such as `transformationSettings` are **client scope**, so they cannot be declared as native world settings.

`applyLegacyRules` changes half-caster rounding, transformation presets, languages, condition behavior, exhaustion, rules references, base item identities and spell lists. Document `source.rules` also influences item-specific behavior (for example starting-equipment presentation). An edition badge alone cannot implement mixed-edition rules; fixtures need both world policy and document metadata.

## Bundled content and discovery

All current module declarations match real pack IDs at this release. Their **classification** is wrong: the `*24` entries are described as paid content, but the system manifest identifies the applicable packs as **SRD 5.2**. No premium purchase is required for these bundled packs. Prefix every name below with `dnd5e.` for its canonical pack ID.

| Pack(s) | Native type / purpose | Current module declaration |
| --- | --- | --- |
| `items`, `tradegoods`, `spells`, `backgrounds`, `classes`, `subclasses`, `classfeatures`, `races` | Item; bundled SRD 5.1 options | Hydrated |
| `tables` | RollTable | Hydrated |
| `heroes`, `monsters` | Actor, legacy sample characters/monsters | Absent |
| `monsterfeatures` | Item | Absent |
| `rules` | JournalEntry | Absent |
| `classes24` | Item: class, subclass, feat | Hydrated, mislabeled paid |
| `origins24` | Item: race (species), background, feat | Hydrated, mislabeled paid |
| `feats24`, `spells24` | Item | Hydrated, mislabeled paid |
| `equipment24` | Item: weapon/equipment/consumable/tool/loot/feat/container | Hydrated, mislabeled paid |
| `tables24` | RollTable | Hydrated, mislabeled paid |
| `monsterfeatures24` | Item | Declared, not hydrated, mislabeled paid |
| `content24` | JournalEntry, rules/content links | Absent |
| `actors24` | Actor | Absent |
| `effects` | ActiveEffect | Absent |

The modern manifest grants PLAYER:OBSERVER and ASSISTANT:OWNER to most modern packs. `monsterfeatures24` declares ASSISTANT:OWNER only. Legacy packs often omit an explicit ownership declaration. These are package defaults, **not current player authorization**. Use Core's current caller access, including world overrides. Neither a full-GM service account nor server hydration grants a player access.

Native browser evidence: `module/applications/compendium-browser.mjs:fetch` uses pack document class, visibility, configured sources, subtype hints and index fields. `module/applications/settings/compendium-browser-settings.mjs:collateSources` reads native source policy. `SourceField` uses pack/package provenance and document metadata. The SDK currently exposes caller-visible pack `id/label/type`, but not this full metadata/hydration negotiation (external dependency E01 in the ADR).

An offline parse of all 2,242 non-folder YAML files under `packs/_source/*24`
completed without parse failures. It found 12 classes, 12 subclasses, 14 species
records, four backgrounds, 340 Spell records and 17 records in `feats24`.
The species count includes separate lineage records, not 14 distinct umbrella
species. The backgrounds are Acolyte, Criminal, Sage and Soldier. Each class has
one bundled subclass. These are source inventory counts, not installed-world
availability or proof that every graph of grants resolves.

The actual content also includes three Weapon records in `classes24` and one
Consumable in `spells24`; pack subtype hints are not an exhaustive record schema.
Classify full records by their actual type and preserve cross-type grant links.
The activity/advancement inventory must also cover supported built-in types
absent from current bundled samples through independently constructed fixtures.

Plan source defaults as accessible, compatible bundled 2024 SRD options plus explicitly selected available books/homebrew; preserve previous user selections. Premium and third-party packs are discovered dynamically and may contain 2014, 2024 or mixed content. A package name, same-name Item, or `24` suffix is not enough to classify an individual document. Unknown edition is visible as unknown and requires an explicit compatible choice. World Items can be options when the caller can read sufficient detail and the workflow accepts their type.

## Reuse, assets and licensing

- System software: `LICENSE.txt` is MIT. A narrowly adapted pure rule helper can retain attribution/license and a versioned source map. Its dependencies must be audited; importing a class that expects `foundry`, `game`, `CONFIG`, `Hooks`, `fromUuid`, canvas, Document collections or native dialogs is not direct reuse of an available runtime.
- Bundled rules text: upstream `README.md` and manifest distinguish SRD 5.1 and SRD 5.2 under CC BY 4.0. Preserve their attribution if any allowed content is redistributed. Runtime selection from an installed pack does not authorize copying a purchased book into the SheetDelver archive or public fixtures.
- `icons/LICENSE` contains multiple licenses, including CC BY 3.0, CC0 and CC BY-NC-SA 4.0; no blanket MIT asset assumption.
- `tokens/LICENSE` restricts Forgotten Adventures tokens to their licensed Foundry use, with separate permission needed for redistribution or other use. `ui/official/LICENSE` restricts official artwork to running the D&D system within Foundry. An accessible URL is not proof that external SheetDelver presentation is licensed. Use neutral module-owned artwork when applicable rights are unresolved; do not bundle these assets.
- Existing module fonts have their own retained provenance in [assets/fonts/README.md](../../assets/fonts/README.md). Keep those licenses with packaged fonts.
- D&D Beyond informs information organization, not permission to copy branding, layouts verbatim, proprietary content or services. Marketplace/accounts/campaign hosting/import from D&D Beyond are outside this plan.

Native captures must use redistributable SRD/synthetic records in tracked tests. Private purchased-content acceptance may retain only permitted minimal/redacted evidence and hashes in the durable ledger.

## M1/Q01 qualification update

C02 corrects the module's bundled SRD labels; the pack-declaration table above
records the planning baseline. No extra pack was hydrated as an E01 workaround.
29 relevant native world settings now have exact-version declarations. Scalar
and pack-source defaults match static `registerSystemSettings` syntax in the
versioned inventory. `calendarConfig` deliberately has no default: its schema
only declares `BooleanField({required:true})` and a StringField with choices;
the exact Foundry14 field initialization remains unqualified. Its getter
`manualRecovery` is `(dailyRecovery === "manual") || (!dailyRecovery && !enabled)`;
it is not a separately persisted field. Missing/invalid structured settings stay
unavailable. Client/user preferences were not declared as world settings.

`CompendiumBrowserSettingsConfig.collateSources` excludes only exact pack keys
whose value is false. This policy is independent of caller authorization and
does not remove owned Items. C02 checks both and rechecks context/access after
reads. Current public pack metadata has no content revision; no module revision
or cross-document invalidation guarantee has been invented. E01 remains open.

`SpellListRegistry.register` resolves a JournalEntryPage of type `spells`, merges
by `page.system.type`/`identifier`, and contributes `system.spells` and
`unlinkedSpells.source.uuid`. `SpellList.has` keys owned spells by
`_stats.compendiumSource` or their own UUID. These are selection/list membership
dependencies; `SpellcastingField.prepareData` calculates preparation/attack/save
from embedded class/Actor data without that registry. Selection refresh and any
numeric cross-document dependency still need executable M5/Q05 qualification.
No global registry or privileged pack cache is copied into the module.

## Q00/M2 bounded C05 comparisons

The maintained `test:native-checks` runner extracts exact-release
`CommonTemplate.prepareAbilities/calculateAbilityCheckProficiency`, `Proficiency`,
`simplifyBonus`, `AdvantageModeField` combine/count/resolve,
`D20RollModificationField.combineFields` and `BasicDie.expandAdvantage/advantage`.
Eight independent numeric cases agree. Source modes cancel when both directions
are present across all81 combinations. All400 ordered face pairs per direction
select the greater/lesser face, retaining the first tie; combined min/max12/14
and null defaults are compared separately. These are controlled source-method S
results with explicit stubs, not native Documents or SDK roll-engine acceptance.

Numeric ability/check/save preparation now shares the skill prerequisites and
compiler. Conditions (including cover), applied rules, original/transformed
saves, native flags, nonconstant expressions, optional abilities and proficiency
dice remain excluded. Nonzero source modes and configured bounds stay explicitly
unavailable pending implementation/SDK qualification. Public `simulateRoll` is
a limited basic-dice preview; its fallback cannot establish kh/kl equivalence.
No new Core defect or required extension is established. Q00/E05 remains open.

## C06 source/default correction

The eight original ability expectations are intermediate-model cases. C06 keeps
them unchanged and adds eight independently specified source/default expectations:
without qualified effects, global proficiency targets initialize0. Check-half
source result is5 (intermediate6), INT expert source check5 (intermediate17),
CON global-save source3 (intermediate7). These supersede C05's source-parity
interpretation without changing historical evidence. The runner verifies all four
exact native `initial:0,persisted:false` declarations and labels each phase. It
still does not instantiate native Documents. Future effects must reach nonzero
target values through qualified preparation phases.

## C07 persisted modes, passives and public-host limit

At87e94db `CreatureTemplate.prepareSkill` combines local ability-check, skill,
global-check and global-skill modes through `AdvantageModeField.combineFields`.
Presence of both directions cancels regardless of multiplicity. Persisted mode
values are−1/0/1 with initial0; effect counts/overrides are later-phase data and
are never trusted from raw source. `CONFIG.DND5E.skillPassive` is base10/modifier5:
passive is10 + known numeric total + passive bonus + combinedMode×5. Die minimum/
maximum does not add a passive bonus. Eighty-one independent persisted-mode cases
now compare both combination and exact prepareSkill passive output with explicit
no-effect/condition/flag stubs.

Native BasicDie.advantage retains the first equal face in both directions. The
real isolated Core0.19.3 public runtime returns the same face value/distributions
but keeps index1 for all40 tied pairs among the800 ordered adv/dis inputs.
This was observed through public login and `req.runtime.rolls.roll`, with exact
face/entropy-consumption checks. It is not captured native Actor/engine behavior.
C07 originally proposed equivalent ordered first-tie selection/serialization for E05; C08 supersedes that proposal for the bounded numeric profile;
current generic keep/drop is not declared defective. Normal numeric rolls and
literal bounds were qualified separately. No critical/chat/audience parity or
range support follows. Temporary adv/dis unavailability is not completed support.

RV03 independently reproduces the index difference and narrows its significance:
for the plain homogeneous d20 profile, all901 results retain the correct value
and count, ordered faces and consistent discarded flags. Every differing index
is an equal pair without die-specific metadata. Native first-tie behavior is a
real source fact, but it does not by itself establish a necessary Core extension
for numerical equivalence. See [DD-R05](../audits/evidence/2026-10-19-c06-c07-review.md)
for the proposed narrow acceptance criterion. Preserve the original host results
and diagnostics; no extension to rerolls, groups, effects or identity-sensitive
operations follows from that recommendation.

### C08 — DD-R05 correction (2026-10-20)

Review-only checkpoint `89f4645` preserves RV03. C08 accepts its bounded numeric
equivalence recommendation and restores source/manual normal/adv/dis requests.
Twelve unchanged qualified requests first failed and now pass. Native default
button selection and all nine explicit overrides compare against exact
D20RollConfigurationDialog methods at87e94db. Source-mode cancellation, range/
context gates and retained callback protections remain covered.

Qualification requires ordered faces, exact entropy consumption, one correct
retained value, consistent active/discarded states, unchanged totals and complete
distributions. Unequal pairs require exact identity. Equal-index diagnostics are
nonblocking only for plain homogeneous d20 without distinguishable metadata.
Negative oracle tests reject corrupt counts, values, flags, metadata, groups,
modifiers and totals. No host record is rewritten. C07's first-tie dependency and
blanket unavailability are superseded for this profile; historical evidence and
native first-tie observation remain. Wider E05, effects/flags/ranges/groups/
rerolls and die-specific behavior remain unqualified; no new Core dependency.

### Tool schema, source phase and roll configuration (C09)

All comparisons read87e94dbd9f930135e0694cd7e7d49f210603cd2c. In
`module/data/actor/templates/creature.mjs`, `tools` is a MappingField without
initialKeys. Each existing RollConfigField declares ability="int" and
value initial0/min0/max2/step0.5; `bonuses` is persisted:false. RollConfigField
provides the ability StringField default and D20RollModificationField provides
bonus/mode/range initialization. MappingField does not infer tool entries or
abilities from names. An empty bagpipes entry therefore uses the schema INT
default, not CONFIG.tools.bagpipes' CHA suggestion. C09 verifies the declarations
as syntax and then supplies explicit initialized defaults to extracted methods;
it does not claim actual Foundry schema/model initialization acceptance.

`CreatureTemplate.prepareTools` uses `CommonTemplate.calculateToolProficiency`,
then `calculateAbilityCheckProficiency` and `Proficiency.flat`. With no effects,
flags, conditions or proficiency dice, total = floor((score−10)/2) +
floor(multiplier × floor((level+7)/4)) + four numeric bonuses: tool.roll,
ability.check.roll, rolls.ability.check and rolls.ability.tool. Multipliers
0/.5/1/1.5/2 are schema-valid. Global proficiency targets are nonpersisted initial0
(DD-R04); tool effectValue/prof/mod/bonus/total are later prepared results.

Actor5e.#rollSkillTool and `_buildSkillToolConfig` use these same scopes and the
selected ability. Independent checks differ from an explicitly selected
skill/tool combination: calculateSkillToolProficiency takes max of the selected
prepared effectValue multipliers, and #rollSkillTool contributes advantage when
both selected prof.hasProficiency values are positive (including half). No
automatic same-name matching or implicit scan of every skill establishes that
selection. C09 qualifies independent Actor mapping checks only. It refuses
combination/pace/alternate ability options; their native roll-builder workflow
remains a next M2/Q00 package. Owned Item ToolData ability/proficient/bonus and
activity configuration remain separate, unqualified workflows.

Maintained tool-checks.json independently specifies eight totals and defaults;
controlled extracted methods match all eight, plus81 tool mode combinations and
20 intermediate combined-proficiency cases. The combined cases explain a
boundary; they do not establish source effects or completed combination support.
Unknown formulas fail the oracle. Empty AppliedRules, flags/conditions and plain
property/count helpers are explicit stubs. See C09 portable evidence for separate
regression, source-method, mounted and public-host results and their limits.

### Selected requests and native dialog phases (C11)

At exact87e94db, Actor5e.#rollSkillTool reads primary and alternate prepared
prof.hasProficiency; both positive grant one advantage source. Proficiency.flat
uses floor(multiplier×base), while hasProficiency tests positive multiplier/base,
so a positive half multiplier can grant advantage despite a zero flat result.
CommonTemplate.calculateSkillToolProficiency uses max of selected effectValue
multipliers, then tool proficiency when a tool is selected. With effects/flags
absent, those values are the persisted skill/tool multipliers; nonpersisted raw
proficiency/effectValue/prof fields are not initialization substitutes.

Both #rollSkillTool and _buildSkillToolConfig use selected ability check,
global check, primary global skill/tool and primary local roll scopes. They do
not combine both local/global type bonuses or modes. The selected ability supplies
mod and ability bonus/mode/range. Manual D20 dialog actions override the resulting
source/automatic mode. SkillToolRollConfigurationDialog offers the six configured
abilities. Controlled comparisons use the exact dispatch, prepareSkill/prepareTools,
proficiency methods, BasicRoll.constructParts, D20 combination and dialog methods.

Phase boundary: #rollSkillTool chooses mode before a native dialog opens.
Its in-place ability form edit reaches _buildSkillToolConfig, which rebuilds
parts/ranges but does not recalculate that process mode. C11 explicitly compares
this behavior. Module choices instead configure fresh requests with final ability
and selected identities before dispatch. Their previews therefore match a fresh
#rollSkillTool request, not the native dialog's retained initial process state.
This distinction is intentional and is not presented as native UI acceptance.

combined-checks.json independently specifies asymmetric WIS/DEX bonuses/modes,
primary type differences, fractions/expertise and a zero-flat half case.38 builds,
324 auto/source cases,6 native ability choices and existing manual overrides
pass with explicit initialized model inputs. Empty AppliedRules preserve supplied
source parts/counts/ranges; travel, flags, conditions, transforms and native hooks
are stubbed absent. Build captures parts/data without evaluating dice. Module
regressions compare arithmetic separately; isolated public rolls qualify the
compiled numeric requests. No native engine, DataModel or operator acceptance
follows, and C09's broader exclusions remain except the explicitly qualified
combination/ability selections.

### Effect source and phase order (C12)

Native release87e94db is paired with read-only static Foundry14.367 sources for
this comparison. Foundry stores changes in `system.changes` with initial phase,
add type and operation-specific priority defaults. Native Actor initial processing
prepares embedded data first; final processing prepares Item final attributes and
spellcasting before final changes. Actor effects precede transferred Item effects,
then applicable active changes are stably sorted by priority. Native unequipped/
required-unattuned Item suppression is checked separately from Actor eligibility.
Nontransfer Item changes can still affect Item preparation feeding Actor facts.

`test:native-effects` extracts exact methods into controlled classes: five cases
capture order only, with explicitly initialized defaults, a host Function realm
bridge for the embedded-data callback, empty filters/roll data and trace-only
field application. It reads static files and verifies14.367; it never starts
Foundry or resumes the parked runtime experiment. Hashes are recorded in C12.
The eleven maintained module fixtures include explicit unavailable outcomes for
unsupported phases of Item preparation, filters, status/time, migration and type.
No schema initialization or native Document/operator acceptance is established.

### Initial numeric fields and proficiency (C13)

Foundry14.367 NumberField operations cast numeric deltas, perform the chosen
operation, then clean and validate. Ability fields round/clamp at their schema
constraints; skill/tool multipliers use0–2 in half steps; global nonpersisted
proficiency targets initialize0 and use exact declared choices. Controlled
source comparisons exercise the actual operation/clean/validation methods with
explicit wrapper/default stubs and numeric-literal-only Roll input. These are
not a DataModel initialization or general expression-engine comparison.

Native independent prepareSkill/prepareTools proficiency can exceed the local
post-initial effectValue through global targets. #rollSkillTool tests the two
independently prepared prof.hasProficiency values for automatic advantage.
calculateSkillToolProficiency instead starts from selected raw effectValue values,
then applies global check, skill when selected and tool when selected. Thus a
skill target can raise a selected skill/tool request without raising an independent
tool check or granting advantage from an otherwise unproficient tool. Global
check half proficiency can make both independent proficiencies positive despite
local0. Twenty independent numeric fixtures compare these cases and forty exact
native dispatch/build captures. Native source, module regressions and public-host
roll execution remain separate; no native/operator acceptance is claimed.

### Constant FormulaField adaptation (C14)

Qualified initial add/subtract/override effects on constant roll/passive bonus
operands now share the detached NumericEffects path. Applied provenance keeps
the native FormulaField construction; effective numeric operands feed checks,
saves, tools, skills, passives and fresh configured requests. This is operation
reduction on known scalar inputs, not an arbitrary expression parser. Nonempty
unknown expressions, references, multiply/upgrade/downgrade/custom FormulaField
operations and final phases remain unavailable. Numeric NumberFields retain
their separately qualified C13 operations. Global bonus effects use detached
initialized globals without laundering malformed source scopes into defaults.

Pinned FormulaField construction is controlled source evidence only. The public
host separately qualifies expected constant expressions and actual module rolls.
Raw nested unary `1d20+(-(3))` is a maintained negative candidate; binary-zero
`1d20+(0-(3))` and the numeric reduction pass. No extra host contract is needed
for this constant operation subset. Source and host serialization remain intact.

### Trusted effect-mode counts and phase ordering (C15)

`NumericEffects.modes` and `SkillToolModel.modeStates` carry qualified initialized
source modes plus actual module-produced counts, ordered overrides and suppression.
They never accept raw source modeCounts as overrides. `applyEffectMode` implements
the qualified initial field operations; `sourceD20Mode` merges those states with
source counts and automatic combined advantage. The result is not obtained by
adding numeric-1/0/1 values or collapsing each field before merging.

Static skill passives use the native passive scope order and resolveMode override
semantics. Fresh skill/tool execution uses the native dispatch scope order and
its advantage/disadvantage booleans, where suppression can mask an override.
Prepared passiveMode and execution sourceMode can therefore differ; both are
independently qualified. UI formats these shared results and keeps manual mode
buttons explicit. Count/provenance changes participate in intent retirement.
Ability/save and tool scopes use the same trusted count semantics.

Twenty-five controlled native comparisons and mounted/public-host requests cover
source poison, negative counts, automatic advantage, cross-scope suppression and
override precedence, including different passive/roll outcomes. Four explicit
unqualified cases remain gated. Initial literal deltas-1/0/1 only; final/effect
filters/time/Item dependencies/custom hooks and wider values remain separate work.
No native DataModel/Document or operator parity is inferred from these methods.

### Character health facts and command boundary (C16)

`prepareHealth606` reads immutable source, initialized defaults and the shared
initial numeric effect operands. HP override and class-advancement calculations
are identified separately. It preserves base max, effective max, clamped current,
temp, damage and percentage without persistence. HD keeps exact class IDs/UUIDs,
persisted identifiers, source die/spent/additional and independently derived pools.
Raw Actor/class HD totals, HP effectiveMax/damage/pct and CON mod/details.level
are not source overrides. `numericAbilityValue` is shared with checks and saves.

HP and HD availability are independent. HP override need not evaluate unused
advancement/CON/bonus rules. Calculated HP requires complete current-level owned
HitPoints choices, canonical unique persisted class identifiers and known CON.
World character identity, standard d6/d8/d10/d12 HD, integer constant additional
HD and scalar HP bonuses define this bounded profile. Malformed/incomplete/future
choices, duplicate/missing identifiers, broader formulas, Item/effect/status/time
phases and token Actor UUIDs stay explicitly unavailable until qualified.

Cards use `hpProjection`; shared `HpReadout`/`HitDiceReadout` format prepared facts
in both layouts. Unknown context never selects old HP defaults. Selected legacy
retains its separate unqualified projection. Modern health/rest controls are
gated pending M3/M4; generic writes and native healing/rest rules are not qualified
by these displays. Source/default native comparisons are controlled method/phase
fixtures, not native Documents/DataModel/engine or installed/operator acceptance.

### Armor and initiative projections (C17)

`prepareArmorClass606`/`prepareInitiative606` separate source, initialized defaults,
static facts and executable configuration. Modern cards/headers/blocks never use
raw ac.value/init.total or synthetic10/0. AC registry identity/order is pinned;
constant source formulas and overrides are bounded, equipped Item phases remain
open. Legacy source migration aliases are explicit unqualified inputs, while
verified current nonpersisted fields are ignored without modifying source.

Initiative uses the shared d20/mode compiler, separate static score and optional
trailing tiebreaker. Fixed initiative uses the native BasicRoll branch (no entropy),
with inapplicable manual controls disabled and direct overrides rejected. Ordinary
range execution stays gated; valid ranges are irrelevant only to the no-die fixed
branch. Unavailable modern initiative throws through the public hook, preventing
Core's empty-hook default1d20. Canonical UUID/source/context/effect changes retire
roll intents. Combat metadata points at prepared stats and effective HP max using
existing public contracts; explicit GM configuration remains authoritative.

Controlled source captures, public rolls and mounted SDK-seam UI are separate
layers. No installed combat HUD, native DataModel/engine, migration or operator
acceptance follows from these fixtures. Legacy behavior stays separately labeled.

### Equipped armor evidence (C18)

Pinned EquipmentData.prepareBaseData resets armor.base/value from source; derived
preparation adds magicalBonus only through exact EquippableItemTemplate.magicAvailable
(attuned or not required, mgc and valid property). Item-description validProperties
uses the equipment registry. Actor AttributesFields.prepareArmorClass selects first
armor/shield in source fixture order, clamps Dex (heavy0), filters formulas and adds
shield. It adds Stealth mode after CreatureTemplate.prepareSkill has computed its
passive. `native-equipment-oracle.mjs` captures34 initialized cases using exact
methods/getters, known constant arithmetic and explicit empty dependencies. Source
schema/default and prepared phases are identified; labels/price/mount/description
phases are no-ops. It does not boot native Item/Actor DataModels or qualify Item
activities/effects/final phases, collection hydration or native/operator behavior.

### Movement, senses and species initialization (C19)

Exact ScalarString clean/cast/default methods establish numeric0 -> string"0",
null -> undefined, blank -> blank, and text trimming. The controlled oracle uses
an explicit option-merging constructor, migration/sanitization disabled and no
full schema validation. Exact LocalDocumentField.initialize looks up the requested
ID; fallback returns its string, not another Item. Character.prepareEmbeddedData
runs prepareRace before filling movement/sense defaults. Movement takes a species
speed only for a falsey initialized Actor operand; senses require null. Species
hover is additive and unit inheritance copies values without conversion.

AttributesFields.prepareMovement clamps base speeds, applies constant bonus only
to positive post-reduction speeds, converts armor reduction, computes max/slowed,
then overwrites jump from Strength. The31 movement captures include30 complete
method returns and one explicitly labeled incomplete initialized-STR diagnostic;
only its independently calculated speed fields compare. Jump remains unavailable
there. Thirty-four sensory comparisons and one unresolved-reference diagnostic
are separate. Empty conditions/status reducers, lightweight owned Items/collection,
no-op embedded super, constant-only Roll and separately prepared STR-effect16 are
stubs. No native DataModel/Document/engine/operator acceptance is established.

### Configured d20 ranges (C20)

Native D20RollModificationField combines maximum=min(all max), minimum=max(all min).
D20Roll.configureModifiers applies BasicDie advantage selection before D20Die
applyRange's minimum then maximum. Foundry Die.minimum/maximum compare each
original result and assign count/rerolled, including inactive dice; total uses
active count if present, otherwise original result. Crossed bounds retain these
ordered semantics. The exact-method oracle verifies8 tables/6560 ordered cases/
24 distributions. Constructor/raw-result injection, empty flag/rule configuration,
findSplice and formula reset are explicit stubs, not native engine acceptance.
Core0.19.3 strict normal range execution passes160 cases. Bounded adv/dis remain
unqualified due320 equal-index differences; plain-profile equivalence is unchanged.

### Complete normal bound pairs and surface limits (C21)

The exact-method range oracle now additionally verifies all441 nullable1–20 bound
pairs across20 faces:15380 total ordered cases/465 distributions with the C20
matrix. Source field validation/aggregation, native modifier order, raw result,
count/rerolled, active state and contribution remain distinct. Public execution
uses actual module-compiled formulas for those8820 normal cases,30 applicable
scope checks with source/manual modes, combined selections, qualified initial
effects and ordered initiative tiebreakers. Bounded selection still has the C20
strict identity gate; plain tie equivalence never extends to it.

Core0.19.3's released formula-hook consumer is separately executed as controlled
source with a base-adapter identity stub. A leading bounded d20 yields
advantageAvailable=true and the string hook has no mode-capability result.
Throwing yields module-unavailable without Core fallback. This is a documented
integration limit, not a new Core defect solely from tied indices. Module HUD
bounds remain gated; character-sheet Normal/direct adapter coverage is separate
from installed combat/native/operator acceptance.

### Item source/default suppression (C22)

`EquippableItemTemplate` declares equipped/attuned BooleanFields (initial false)
and attunement StringField. Only consumable/container/equipment/tool/weapon mix it
in; the other eight declared Item models do not expose these fields. Native
`Item5e.areEffectsSuppressed` requires equip except for consumables other than
rod/trinket/wand, then suppresses required attunement when unattuned. Explicit
null equipped migrates false; exact primitive cleaning/defaults separately verify
null booleans and trimmed strings. C22 fixtures compare69 source/default states
with the pinned getter after that controlled initialization. Hidden=false and
parent.isGroup=false are explicit stubs; malformed/coerced states, creation hooks,
DataModels/Documents and full Item effect phases are not qualified. Earlier
initialized phase/arithmetic comparisons remain separate evidence categories.

### Species source-reference presentation (C23)

DetailsFields.race declares LocalDocumentField with fallback=true. Inherited
StringField cleaning trims the raw reference; DocumentIdField defaults make an
absent/blank reference null. LocalDocumentField.initialize returns the exact
collection entry and defines source name stringification; if absent it returns
the stored value.12 controlled C23 comparisons independently verify selected first/
second IDs, equal display names, literal unresolved text/UUIDs, sparse refs and
source label independence from class/Item-rule data. Wrong-type/duplicate/foreign/
malformed model inputs stay unqualified module boundaries, not claimed native
parity. Item/Map/parent lookup and primitive constructors are explicit stubs. C19's
movement/senses comparisons and incomplete-STR diagnostic remain separate phases.

### Condition-free defense preparation (C24)

SimpleTraitField initializes value Set/custom string; DamageTraitField adds bypass
Set. TraitsFields.prepareResistImmune processes dr→di→dv, retaining only ALL when
present, clearing resistance for ALL immunity and removing individual immune types
from resistance. CI source fields remain separate; active condition processing,
including petrification, is outside this subset. Source poison is not initialization.
The exact native sheet trait method separately verifies physical-only bypass icons
and numeric simplifyBonus presentation using explicit translation/formatter stubs.

`test:native-traits` verifies pinned registries and24 controlled source captures
(15 complete,9 independently available domains), primitive cleaning/Set defaults,
normalization and presentation metadata. Unsupported domains are omitted explicitly,
not initialized as proof of complete native models. Formula validation/expressions,
DataModels/Documents, game locale, Item/final/filter/condition phases and installed/
operator acceptance are absent. Runtime module uses its own shared pure preparation
and public SDK only; the static native methods are test-only controlled sources.

### Initial defense field operations (C25)

Foundry14.367 ActiveEffect change values are AnyField data. ArrayField first tries
JSON.parse(raw), wraps a non-array or falls back to [raw], then casts each element.
SetField wraps that in a Set. DataField.applyChange performs the operation before
clean/revalidate/initialize; native equality uses Set.equals membership, and Set.map
retains size. Whitespace therefore affects subtract/superset/subset comparisons
before StringField trimming. Equal-member upgrade/downgrade retains delta order.
Set multiply inherits a no-op; it is not intersection. Native raw array ['fire',
'cold'] becomes one “fire,cold” member, not the parsed JSON-string pair.

The C25 oracle executes33 supported ordered field cases plus that separate raw-
array diagnostic with exact field/equality/Set methods. Existing24 condition-free
source comparisons remain. Primitive validation/reference wrappers are explicit;
reference/object equality paths outside the profile throw. Native constant modifier
strings are captured separately from reduced module operands. A closed two-formula
Roll stub supplies independent arithmetic for source-method construction comparisons;
public Core execution separately verifies those candidates. No arbitrary expression
or native engine/DataModel/Actor-lifecycle acceptance follows.

### Fractional roll coefficient presentation (C26)

The skill NumberField allows0–2 in0.5 steps, including1.5. Exact native Proficiency
and prepareAbilities/prepareSkill methods independently verify level5/proficiency3,
Wisdom14 coefficients0/.5/1/1.5/2: totals2/3/5/6/8 and normal passives12/13/15/16/18.
Saving proficiency0/1 gives2/5. Configured skill advantage gives passive21 for1.5;
its minimum die does not add another passive bonus. These7 source/default method
cases are separate from malformed source/UI availability tests and native engine
acceptance. Empty flags/rules/conditions and Remarkable Athlete=false are explicit
stubs; nonpersisted global coefficients initialize0. Module marker choices are
presentation of those prepared values, not a new native training interpretation.


### Source training / canonical English presentation (C27)

CharacterData declares armorProf and weaponProf as SimpleTraitField. Its mastery
value and bonus are persisted String Sets, unlike nonpersisted roll proficiency.
TraitsFields.creature declares languages value/custom and communication MappingField
(value NumberField min0, units defaultUnits(length)). Common/Creature tool methods
capture initialized local value in effectValue, then replace prepared value with
effective prof.multiplier. Global check proficiency2 can therefore produce effective2
while local stored/default training is0. The module training DTO uses that local
operand, never the effective field to infer a grant.

Exact config preLocalize/performPreLocalization/_localizeObject/sortObjectEntries
produce the captured modern English tree. Standard/exotic children registered with
key=label contain primitive strings: their label comparator is NaN and preserves
insertion order. Primordial's separate no-key registration sorts its strings.
Source sign/draconic/common consequently presents Common, Draconic, Common Sign
Language. This supersedes the preliminary ignored-handoff alphabetical assumption.
prepareLanguages supplies ALL, grouped children, custom splitting and ranged labels.

Trait.keyLabel normally consults its private base Item index for specific source
keys. The controlled harness deliberately has no index and records native raw-key
fallbacks; the module explicitly marks those labels unresolved. Prototype keys
produce an inherited-function native lookup diagnostic (captured, not treated as
a usable label); the module retains a literal unresolved key. Weapon.masteryOptions
requires a mastered baseItem AND an Item base mastery. bonus contains additional
property IDs, excludes the base property and does not itself master a weapon.
Only a fixed longsword/sap conditional example is compared; no Item lifecycle or
operator acceptance follows.

The oracle adds33 initialized/source/qualified-intermediate training cases, exact
schema assertions and pinned registry capture. Empty AppliedRules, conditions and
flags; no base Item index; fixed English/unit formatter; and explicit initialization
are declared stubs. Partial malformed/default-range cases compare only the independent
spoken domain. No DataModel, native engine, installed sheet or native/operator parity
is claimed. Unknown context, malformed and source-preservation tests remain R.


### Initial persisted training Set targets (C28)

C27's exact CharacterData/SimpleTrait/TraitsFields schema assertions establish
persisted source targets independently of roll proficiency's nonpersisted defaults.
The C28 oracle applies exact Foundry14.367 field methods to24 independently declared
initialized training cases before native language preparation. It verifies defaults,
null cleaning, JSON/plain deltas, duplicate order, whitespace-before-clean comparison,
all six Set operations, equal-member reorder and priority/source order. Mastery
value contains base weapon identities; bonus contains mastery property identities.
Native language preparation independently supplies ALL, grouped Primordial and
configuration-ordered labels after those field operations.

15 module unavailable cases are not native schema rejection claims: native strings
can contain wider keys and coercions. Unknown/coerced/reference identities, raw array
deltas, nonselectable language categories, incorrect mastery domains, custom-string
operations and filtered/final phases remain unqualified. The harness uses explicit
initialization and the previously declared primitive validation wrappers, not a
DataModel or an installed native lifecycle. No base Item index or pack access occurs.


### Snapshot-invariant filter profile (C29)

Native FiltersField is a JSONField with initial"{}"; initialize parses it into Filter
or returnsnull on parse failure. Filter.check has a root isEmpty fast path, otherwise
performCheck uses implicit root AND or explicit operators. Empty AND/NOR are true;
NAND/OR/XOR false. XOR is odd parity, including3 true operands. NOT takes one node.
Native accepts wider/malformed shapes with various results; the module qualifies
only exact declared boolean shapes and never claims its boundaries are schema errors.

Exact Filter/functions, FiltersField initialization/default assertion and native
isEmpty/getType helpers independently establish40 guard observations. All supported
checks must make zero property reads: the oracle's getProperty throws. Effect model
evaluateCondition/prepareBaseData/isSuppressed plus document shouldApplyChange show
first-effect caching and per-change fresh checks. A separate callback cache probe
shows false initial remains false at final until reset; fresh change checks differ.
That callback proves method lifetime, not a data-dependent Filter/snapshot profile.

Superclass eligibility=true, replacement adapter identity, no source Item and fixed
add skipConditions=false are explicit stubs. Primitive persisted JSON/default strings
are initialized without a full DataModel.6 guard observations belong to workflows
still gated for statuses/flags/malformed source. Source workflow arithmetic composes
previously qualified numeric field/ability methods with independently expected guard
truth; no native Actor lifecycle, engine or operator acceptance follows. Native phase
source shows initial status precollection and final Item/spell preparation boundaries;
those data-dependent snapshots are not silently approximated by C29.


### Retained source-envelope boundaries (C30)

Four additional false-effect cases exercise malformed priority/entry and unqualified
phase/type envelopes. Their expected module result is unavailable, preserving the
preexisting gates used when the effect guard is true. Native guard truth is still
false, but that alone does not qualify initialization/validation of wider source
fields. The controlled oracle now records44 guard truths including10 separately
gated source workflows; no native schema rejection or DataModel parity is claimed.


### Initial scalar predicates and collection timing (C31)

CommonTemplate's score is required/nonnullable/integer/min0/initial10; save
coefficient is required/integer/min0/max1/initial0. C31 uses explicit valid scores,
not guessed missing score defaults. Creature global roll proficiency is initial0,
persisted:false. The profile requires explicit roll parent containers; it does not
infer optional-path existence from an arithmetic fallback. The native controlled
harness keeps raw mod/global99 separate from schema initialized fields and preserves
its raw input. Missing persisted save coefficient initializes0 by exact NumberField
methods, then shared module initialization feeds both predicates and saving throws.

Exact Character base/embedded, ActorDataModel/Actor getRollData, effect suppression/
first-cache/phase checks, Filter comparisons and Actor initial collection methods
establish30 independent captures. Every filter read occurs before the first typed
field application. Earlier Wisdom+2 cannot make a Wisdom16 predicate match during
collection: Wisdom14 remains its input. A Wisdom14 predicate still matches before
that earlier change and both+2 operations produce18. A priority10 global floor2
still has initialized0 when its predicate is checked, then legitimately changes
later prepared operands. This is distinct from stale raw source proficiency99.

Only the qualified base-field projection is compared. Unrelated HD/AC/encumbrance/
movement/senses helpers and XP mapping are explicit stubs; the Creature classes/
subclasses overlay is excluded after source proof it does not overwrite queried
abilities/rolls. Primitive validation/clone/overrides wrappers, empty active Item/
scale collections and no status/Item replacement are limits. Expected post-effect
scores/totals are declared independently; derived arithmetic composes the prior
C13/C26 method qualification. This does not boot a DataModel, execute a native dice
engine or revive the parked preparation runtime. No full native source/operator
parity follows. Final-only/no-initial, Item, derived/mod, unsupported/unknown branch
and malformed/coerced data cases remain module availability boundaries.


### Q02 phase boundary (C32)

Public Core0.19.3 command qualification uses a synthetic backend, not release6.0.6
Document creation/update hooks. Its ID remapping, acknowledgement loss and external
edit cases establish SDK behavior, not native keepId/embedded relationship policy,
flag persistence or atomic compare support. Native command/receipt/operator fixtures
remain separately required. Exact release87e94db stays the rules oracle; no reference
checkout/runtime was started or modified by this investigation.


### Command foundation versus native rules (C33)

The journal/status implementation adds no native rule interpretation and does not
qualify native create IDs, flag correlation or concurrency. Its domain-driver
interface requires server-derived rules/fingerprints and exact confirmation; those
are not supplied by a generic JSON plan. Pinned rules fixtures and native/operator
command acceptance remain separate from synthetic public-host infrastructure tests.


### Initial collection predicates (C34)

Pinned SimpleTraitField.value and damage-trait bypasses use StringField/SetField;
CharacterData adds armor/weapon training and mastery Sets. Character base/embedded/
prepareRace and Creature getRollData do not overwrite these queried paths. Exact
DataField/ArrayField/StringField cleaning and SetField initialization establish
trimmed,de-duplicated initial members,including missing/null defaults under explicit
parents. Native Filter.has uses in_(literal,Set);hasany/all use Array.from(values),
subsetof checks every member with in_,and empty uses isEmpty/strict boolean comparison.
C34 qualifies primitive string/array/boolean literals only,without general coercions
or nested filter evaluation. Unknown source literals remain literal identities.

88 controlled captures retain30 scalar and add58 collection cases. Actual initial
Actor collection checks precede all writes,including priority10 training Set changes;
ALL/immunity normalization is later and cannot replace initial input. Source defaults,
initialized Sets and final fields are separately recorded. Model/validation/domain
stubs remain explicit; this is not full DataModel/native engine/operator acceptance.


### Base class fields before initial effects (C35)

DetailsField.creature.level is integer/min0/initial0/persisted:false. ClassData.levels
is required,nonnullable,integer/min0/initial1; C35 qualifies explicit0–20 only. Actual
CharacterData.prepareBaseData sums class source levels into initialized level0 and
assigns attributes.prof using Proficiency.calculateMod:floor((level+7)/4),including
level0→1. Source level/prof99 is distinct from initialization and base preparation;
class names/identifier metadata never supplies levels. The30 class captures cover
thresholds,no-class,multiclass,false predicates and name poison;31 retained scalar/
58 Set captures give119 total. Model/validation/HD/XP stubs and excluded namespaces
are explicit. This does not establish full native source boot or operator acceptance.


### ConditionData and initial Actor statuses (C36)

ConditionData.level is nullable/integer/min1/initialnull;type is required/nonblank.
BaseActiveEffect.disabled is BooleanField and statuses a SetField of required,
nonblank StringFields. Primitive cleaning/defaults are captured separately from
ConditionData.prepareDerivedData: nonleveled poisoned sets prepared levelnull,
without inventing a missing status from type/name. Suppression includes CI and the
base condition/expiry result. Actor clearData clears statuses; native initial
precollection and Foundry initial collection both precede sorted changes. Later
prepareResistImmune removes final immunities. Add/remove CI timing probes explicitly
use a synthetic change executor; other methods are pinned source.

CommonTemplate.prepareAbilities adds disadvantage through AdvantageModeField.setMode;
counts/overrides/suppression survive into skill/tool builders and passives.93 status/
mode cases and372 native default configurations compare independently declared
outcomes;3 primitive captures verify defaults/source99 handling. No evaluated dice,
full DataModel/native runtime/operator acceptance. Manual,alternate-ability and
initiative configuration remain required before shipping condition execution.


### Poisoned runtime profile qualification (C37)

C37 extends the pinned C36 harness with324 alternate-ability configurations,50
fractional/expertise combined checks,14 mode-effect builds,9 D20Dialog manual action
finalizations and4 initiative configurations. Native Proficiency.hasProficiency tests
base>0 and multiplier>0: .5 on both selected operands grants automatic advantage.
Ability-phase condition counts preserve initial overrides/suppression; source/manual
modes still follow the native builder/dialog instead of adding all normalized flags.

Poisoned applies check disadvantage before passives,not a flat passive adjustment.
AttributesFields.prepareInitiative.score uses init.roll.mode only; the initiative
roll builder also combines ability-check modes. Poisoned can produce score12 with
a disadvantage roll,source init advantage gives score17 with a Normal roll,and fixed
initiative remains12 without a die. Tie contribution .14 is retained in its profile.

C37 integrates only the constant-guard,untimed Actor poisoned envelope and immutable
precollection/final-CI behavior described above. Source/default/initialized/prepared
and caller facts stay separate. Controlled model hooks,guard callbacks,clock defaults,
custom-rule absence and roll-build callbacks remain stubs; the CI executor is synthetic.
No native dice engine,full DataModel/native boot or installed/operator acceptance.
The public-host harness independently evaluates compiled formulas with real Core0.19.3
primitives and preserves actual serialized results. See the [C37 record](../audits/evidence/2026-10-21-c37-poisoned-condition.json).


### Modern exhaustion and the nonpersisted condition map (C38)

CommonTemplate.conditions is a persisted:false MappingField(NumberField integer/min1).
Actual Foundry14.367 DataModel._initialize selects its initial empty value even with
raw exhaustion/poisoned99. The probe uses actual ObjectField/MappingField initialization
with restricted constructor/order/getDefiningClass helpers; no full model/source boot.
ConditionData.prepareDerivedData clamps missing/null level to1 and high values to6,
adds dead at6,and writes the map when active BEFORE initial condition evaluation.
The cached guard starts null: later false guard may leave a level entry but no Actor
status or reduction. Duplicate documents write last active level,not sum/max.

Actor.conditionRollReductions requires effective status minus CI and a prepared level;
modern config uses2 roll/5ft speed reduction per level. Common abilities/Creature
skill/tool/passive and actual roll builders agree,including negative totals,mixed
Poisoned and81 source-mode vectors with different primary skill/tool scopes.
Attributes.prepareMovement converts reduction before bonus/multiplier and cannot
revive zero speed with a positive bonus. Jump overwrite follows max/slowed. Modern
conditionEffects.noMovement excludes dead; no added inference is justified. Initiative
score/roll/fixed configuration are distinct. 32 profiles/192 builds,324 additional
mode builds,576 initialized movement,288 initiative and4 map-default captures pass.

See [C38 record](../audits/evidence/2026-10-21-c38-exhaustion-foundation.json) for exact
source hashes,independent inputs and declared primitive/model/clock/guard/custom-rule/
CI/roll-build stubs. These are controlled method comparisons,no native dice engine,
full DataModel/runtime,installed/operator acceptance or source-expression expansion.


### Exhaustion integration and armor composition (C39)

C39's shared runtime consumes C38's independently captured map/status/reduction
semantics. The maintained source profile admits missing/null level and positive safe
integers (clamp6); native cleaning of other coercible inputs is not claimed.113
maintained contracts include32 profiles/81 source-mode vectors; source fields/maps
and prepared virtuals remain separate. Fixed initiative0 and negative roll totals
retain their exact meaning through public Core primitives.

The controlled movement matrix adds equipped strength15 armor to the prior initialized
STR10 profiles:1152 comparisons atft/m and bonus/multiplier combinations. Actual native
armorSpeedReduction10 is read from the pinned registry; a missing probe constant was
corrected before successful capture. Native adds armor/exhaustion reduction before
unit conversion and movement bonus/multiplier. Module source regressions cover384
combinations with the independently qualified default multiplier1; raw99 is ignored.
No new movement expression/effect qualification follows. Earlier source,mode,selected
check,initiative and map comparisons remain intact;678 actual native ability/check/save
roll constructions add direct configuration evidence. [C39 record](../audits/evidence/2026-10-21-c39-exhaustion.json)
separates controlled methods,source regression,mounted consumers and real isolated
public-host arithmetic. Full DataModel/native/installed/operator acceptance stays open.


### Dexterity-save,initiative and movement condition modes (C40)

The maintained pinned harness adds84 explicit source/phase profiles,972 raw source-mode
cases and8 override/suppression cases. Each checks actual native #rollD20Test(save)
and getInitiativeRollConfig,totals/parts,statuses,score and initialized movement:
2128 configurations total. Frozen independent expected tables derive from explicit
status predicates and raw source flags,never module output or captured native output.

Common.prepareAbilities adds dodging Dexterity-save advantage unless incapacitated
or affected by noMovement; restrained adds Dexterity-save disadvantage. Attributes
prepareInitiative adds invisible advantage and incapacitated/surprised disadvantage
to the initiative field BEFORE score calculation. Global check mode is combined later
for execution. Numeric mode0 may retain both signs; an added global advantage does not
erase an existing disadvantage. Effect overrides/suppression preserve native scope
order. NoMovement zeroes speeds before later arithmetic; prone crawl zeroes nonwalking
speeds. These profiles use explicit serialized statuses,not preset construction.

SimpleTraitField CI is a SetField(StringField) without fixed choices; literal membership
may be exact even when a label is unresolved. Source type never grants an absent status.
CI add/remove preserves initial collection and later filtering,not final active-state
recomputation. Source/model/guard/clock/custom-rule/CI executor/roll-build stubs remain
explicit; initialized operands do not establish source boot or installed/operator
acceptance. [C40 record](../audits/evidence/2026-10-21-c40-condition-modes.json) retains
new tables,captures,source hashes and limits; C39 runtime remains unchanged.


### Shared bounded condition-family integration (C41)

C41 consumes C40's independent source/status/mode expectations through shared rules.
The supported source types are the eight explicit family IDs plus prior Poisoned/
exhaustion. This remains the untimed,constant-guard Actor-owned,empty-change/rider
profile; typed source never grants missing statuses. Native phase/query behavior
controls dodging save advantage,restrained disadvantage,initiative conditions and
movement. Initial/global source effects retain their distinct scope and count state.

Ability-phase modes apply before passives; initiative-phase modes apply during
initiative preparation to a copy of initialized/effected local state. Score uses that
local state; execution also combines ability/global counts. Multiple contributing
statuses trigger each native boolean query once. NoMovement/crawl apply before later
speed arithmetic; jump remains the later overwrite. Exact stored dodging/dead CI
identities are supported by the unrestricted StringField Set schema and existing
phase observations; module labels assert no native preset or content grant.

1064 source contracts and the public-host/mounted comparisons are recorded separately
from the retained controlled native methods. Unknown types,riders,dependent rules,
flags/time,Item/final phases and broader expressions remain unqualified. No full
DataModel/native boot/operator acceptance follows. [C41 evidence](../audits/evidence/2026-10-21-c41-condition-modes.json)
retains source/artifact identities and limits.


### Petrification and late immunity grants (C42)

Eighteen explicit source/initialized-model cases capture actual Traits.prepareResistImmune
and Actor status/query/Common/initiative/movement methods. Current CI removes statuses
first. Petrification then adds DR.ALL,clears DR bypasses,adds DI.poison and CI.poisoned/
diseased; DR/DI/DV normalization follows. DI.ALL clears the newly granted resistance.
Poisoned can remain in Actor.statuses while final CI suppresses its rule query and
check disadvantage. Condition document active state after mutation is not a substitute
for the earlier collection. Explicit source incapacity contributes initiative
disadvantage; the Petrified type alone does not create that status.

Source/guard/disabled/CI add/remove and DI.ALL cases retain frozen independent results.
Defense sets are initialized operands; model/constant guard/clock/custom-rule absence,
synthetic CI executor and roll-build callbacks stay declared stubs. No preset/rider,
full DataModel/native boot/dice/installed/operator acceptance. Runtime Petrified stays
gated until shared integration. [C42 record](../audits/evidence/2026-10-21-c42-petrification-foundation.json)
contains exact source/script identities and new captures.


### Petrification runtime profile integration (C43)

C43 consumes C42's independent phase expectations through one shared path. It admits
only the untimed,constant-guard Actor-owned Petrified document with explicit Petrified/
incapacitated statuses and empty own changes/riders. Actual source/default/prepared
phases stay distinct; no missing status is inferred. Trait grant validation precedes
detached mutation. Existing defense preparation performs the later damage normalization.
Actor statuses after current CI deletion remain separate from effective statuses
after newly granted poison/disease immunity; numeric rules use the latter.

18 maintained source contracts,mode/manual/selected/bound/context/poison regressions
and actual desktop/mobile/public-host checks are recorded separately from native
method captures. Malformed trait operands,other condition/rider/preset/flag/time/
Item/final/expression behavior stays unqualified. [C43 record](../audits/evidence/2026-10-21-c43-petrification.json)
retains identities and evidence limits; no full native DataModel/operator acceptance.

C44 adds `incapacity-conditions.json`:34 independently expected explicit Stunned/
Unconscious source states and648 source-mode vectors. `test:native-conditions` executes
the retained actual initial-status/CI,condition query,save/init configuration and movement
methods. Unconscious blocks movement; Stunned alone does not. Explicit incapacity or
surprise supplies initiative disadvantage; preset metadata never supplies missing source
statuses. Unconscious preset riders remain separate. Source Number/String/Set defaults
and initialized model phases stay distinct. [Record](../audits/evidence/2026-10-21-c44-incapacity-foundation.json)
records exact87e94db/staticFoundry14.367 identities and declared stubs. No native boot,
preset/rider construction,automatic downed/combat/attack/save-failure/operator acceptance.

C45 integrates the bounded C44 source states. The retained harness's mixed petrification
arithmetic has a newly confirmed composition error (DD-R07): actual CharacterData.
prepareDerivedData calls abilities/skills/tools before Traits.prepareResistImmune.
The C42 harness used the reverse order,so its late-immunity arithmetic expectation is
superseded pending immediate correction. No Core defect follows. Unmixed C44 explicit
Stunned/Unconscious profiles have no petrification grants and are unaffected.


C46 corrects DD-R07 by executing exact CharacterData.prepareDerivedData with trace-only
phase collaborators and recording its source hash/order. Actual numeric methods now
follow abilities/skills/tools before Traits.prepareResistImmune. Two mixed Petrified+
Poisoned expected mode/passive values are corrected independently to disadvantage/
passive10. Final poison immunity changes final queries,not already prepared counts.
Seven initial-mode cases compare override/suppression/subtraction/combined checks and
initiative separately. [Record](../audits/evidence/2026-10-21-c46-character-phase-order.json)
retains source/schema/phase identities and stubs. C42/C43 mixed arithmetic claims are
superseded;their historical captures remain. No native boot/preset/operator acceptance.

C47 `final-modes.json` freezes1188 independent cases across11 roll-mode paths,three source
modes,12 operation/delta pairs and no-status/Poisoned/incapacity+Invisible contexts.
Actual field/count and roll methods compare9504 skill/tool/ability configurations,
1188 initiative configurations and earlier passive/score snapshots. Actual static
Foundry ClientDocument/Actor prepareData and exact Character methods execute with trace-only
collaborators to qualify ordering separately. Direct field-change wrappers are explicit;
no full effect/Item/filter/DataModel initialization or native/operator acceptance.
[Record](../audits/evidence/2026-10-21-c47-final-modes-foundation.json) preserves hashes/stubs.


C48 integrates only qualified Actor-owned final mode fields.1188 cases share C47's
independent expectations;four additional exact late-derived counter/final field cases
preserve a pre-counter passive snapshot (armor itself remains C18's separate evidence).
The existing effect-modes final-open fixture now expects final advantage with unchanged
passive15;native-effect-oracle applies initial and final changes on their respective
sides of actual ability/skill/tool derivation. [Record](../audits/evidence/2026-10-21-c48-final-modes.json)
separates regression/method/mounted/public evidence. Item-transferred final modes,
Item-final preparation,other final fields/filters and native/operator gates remain open.

C49 freezes852 independent final global proficiency cases. Actual NumberField operations
and Actor/Common/Creature methods distinguish earlier prepared totals/passives/prof
from fresh skill/tool builders and earlier automatic advantage.32 actual DataModel
initialization cases use nonpersisted default0 despite raw poison. Field constructors,
model collaborators and dice capture remain declared stubs.
[Evidence](../audits/evidence/2026-10-22-c49-final-proficiencies-foundation.json) records
phase/source identities. Runtime integration and native/operator acceptance are separate.

C50 admits C49's bounded Actor-owned final global proficiency fields. Earlier prepared
proficiency determines automatic combined advantage; fresh CommonTemplate skill/tool
calculation reads effectValue/current global targets. Earlier ability/save prof objects
and passives do not refresh. The existing initial-WIS+2/final-check-prof2 case separately
compares prepared skill6/passive16 against fresh roll9 through actual NumberField and
Actor methods. Six numeric-string operations use a declared literal-only Roll stub,
not native dice evaluation. [Evidence](../audits/evidence/2026-10-22-c50-final-proficiencies.json)
separates controlled methods,regressions,mounted consumers and public-host serialization.
Other final fields,Item phases,filters/flags/time/formulas and full native/operator
acceptance remain open;historical pre-integration restrictions are superseded narrowly.
