# D&D module: complete character-lifecycle discovery audit

Status: **active implementation; investigation retained, acceptance open**. Date: 2026-10-19.

Owning plan: [proposed module ADR-0001](../adr/0001-complete-character-lifecycle.md). Supporting [native reference](../reference/native-6.0.6.md) and [acceptance matrix](../plans/0001-verification.md). This audit replaces no completed Core or sibling-module decision and does not activate parked native-runtime research.

## Finding

The module is a partially wired character-sheet presentation, not a complete D&D implementation. It can render bounded Actor fields and request basic checks, but important numbers rely on prepared-looking input or guessed defaults. Modern Item schemas are incompletely interpreted. Item/spell buttons do not resolve an executable module roll; rest recovery is incomplete; no builder or advancement workflow is registered. Current green tests do not cover these behaviors.

The target is the **current Foundry-installable D&D system 6.0.6**, with 2024 rules primary. This is a larger rules/data integration than repairing individual labels. It needs a deterministic module rules layer, shared projections, explicit caller-bound action plans, source discovery and complete lifecycle verification. Core already supplies authorization, stores, world context, maintenance migrations, dice and presentation primitives; it does not supply native D&D browser document methods.

## Provenance and limitations

| Repository | Branch / commit at inspection | Version / state |
| --- | --- | --- |
| D&D module | `main`, `e62a723a9930c7e04345fb80e51fd55d463b7d7e` | 0.4.1; clean before this documentation pass; experimental |
| Core | `main`, `90c13e5e57d88913cd3bae6bf6b9e6f0b995bad1` | 0.19.3; SDK 3.4.0, module-api 1.6.0, UI 3.2.0, roll 1.0.0; pre-existing release-scaffold/document changes preserved |
| Shadowdark reference | `main`, `60b9c6368feae1d9163b74522804868fc7e47c25` | 0.9.6, Core >=0.19.2/module-api >=1.6/UI >=3.2/roll >=1 (each API below its next major); clean at inspection |
| Mörk Borg reference | `fix/adr-0001-native-alignment`, `33d329185a69bd55fbc661e428c2e37f563947b6` | 0.8.3, Core >=0.19.3/module-api >=1.5/UI >=3.2/roll >=1 (each API below its next major); dirty, separate active corrections; timestamped reference, not acceptance |
| Native D&D checkout | `6.0.x`, `28f35531021bb07609c79c4cbbb9b7e7c2744bf9` | Clean, two commits beyond release; selected oracle is exact `release-6.0.6`, `87e94dbd9f930135e0694cd7e7d49f210603cd2c` |

D&D `info.json` declares Core `>=0.18.0`, module-api `>=1.1.0 <2.0.0`, UI `>=3.1.0 <4.0.0`, roll `>=1.0.0 <2.0.0`. CI and release use Core `v0.18.0`. There is no native-version compatibility declaration, world-settings declaration, migration catalog or server entry in the module. None was changed here.

The upstream release manifest requires Foundry 14.367+, verified 14. The deployed world/system/version and installed premium content were **not inspected**. No live service, native session, browser or production configuration was used. Source conclusions are not native runtime acceptance. Temporary Foundry core files have hashes but unverified build identities; see the reference map.

Read: module AGENTS/CLAUDE/handoff/architecture/manifests/tests; Core architecture/contributing and public SDK/module-authoring/migration contracts; relevant Core ADRs 0027, 0038, 0051, 0052, 0054, 0057 and 0064; sibling guidance and creation integration. The old local handoff's release-helper/uncommitted and `644a6d5` state is stale: current HEAD already includes the helper. Missing ignored files in future clones do not invalidate these tracked findings.

Core's pre-existing changes are in module-init/release scaffolding, guides and the scaffold test. They are outside this phase. No Core or sibling file is edited by this audit. Parked D&D `temp/audit-report/` material remains historical; its accepted experimental limitations are superseded only by this newly selected planning scope, not by an implementation authorization.

## Executed offline evidence

Against the current local Core toolchain (0.19.3):

Observed execution tools: Node v24.21.0 and npm 11.19.0. Current CI uses Node
22.x; this local pass is not evidence of running that CI Node profile.

| Check | Result | What it establishes |
| --- | --- | --- |
| `npx tsx data/local/modules/dnd5e/src/tests/prepared-actor.test.ts` | Pass | Existing synthetic fixture behavior only |
| `npx tsx data/local/modules/dnd5e/src/tests/presentation.test.ts` | Pass | Static HUD initiative rendering and existing manifest expectations |
| Explicit TypeScript inclusion of every module `src/**/*.ts(x)` and `module/**/*.ts(x)` | Pass | Current module sources type-check with Core 0.19.3; no native behavior proof |
| Direct adapter/row-function probe below | Defects reproduced | Current function results differ from the cited native schema/rules |

The temporary type configuration extends Core `tsconfig.json`, supplies absolute module files, clears include/exclude and disables incremental output. It is retained at `temp/planning-2026-10-19/tsconfig.json`; the complete reproducible procedure is in the acceptance document. Existing Core root type checking excludes `data`. `module:check` falls back to that root configuration when a module has no tsconfig, so its green type line would not close this gap. Packaging, full Core suites and native acceptance were not run for this planning pass.

Independent probe inputs/results (synthetic, not captured native Actors):

| Input and independent expectation | Observed result | Finding |
| --- | --- | --- |
| WIS 14/mod 2, proficiency 3, Perception `value:1,total:5,passive:15`; native `CreatureTemplate.prepareSkill` uses multiplier 1 and total +5 | `getRollData(...,'skill','prc')` → `1d20+1`; sheet total 1/passive 11 | DD-02 |
| Request `getRollData(...,'item','spell')` | `null` | DD-10/14 |
| Spell `prepared:1,method:'spell',properties:['concentration','ritual','vocal']` | concentration false, ritual false, prepared false | DD-12 |
| Equipment `weight:{value:5,units:'lb'},quantity:1` | row has no weight | DD-09 |
| Legacy-shaped weapon with `proficient:0,attackBonus:'1+1d4'`, STR mod 2/prof 3 | displayed +6: assumes proficiency and truncates formula | DD-11; a compatibility-path defect, not a claim that this is the complete v6 weapon schema |
| Sparse Actor missing AC/init/speed/HP maximum | AC 10, initiative 0, walk 30, HP max 0 | DD-01: plausible output conceals unavailable preparation |

## Representative end-to-end traces

1. **Spell/weapon action:** `Sheet.tsx` filters embedded Items → standard/mobile tabs call `itemRows.ts` → `blocks/Spells.tsx` or `Actions.tsx` opens detail/roll modal → `onRoll('item', id, options)` → Core `src/shared/sdk/client-hooks.ts:useActorSheet` → `/api/actors/<id>/roll` → `src/server/services/actors/ActorService.ts:rollActor` → module `DnD5eAdapter.getRollData` returns null. Core's separate `use-item` path is a chat operation, not native `Activity.use`. No module server handler exists to perform consumption or native action sequencing. A visible Cast button is not working spellcasting.
2. **Long rest:** `blocks/Rest.tsx` → `RestModal` → sequential `onUpdate` of current HP and optionally temp HP only. Short-rest HD controls are explicitly unwired; `newDay`, HD and resource choices do not execute recovery. Core's convenience `useActorSheet.update` catches errors and notifies without rethrowing. Awaiting it is not a persistence receipt. Use strict public mutation/action responses for future multi-step workflows.
3. **Inventory edit:** `Sheet.tsx` independently categorizes Items, omitting container/backpack from gear, despite `itemRows.ts` recognizing them → ItemModal reads captured Item, writes dotted `items.<id>...` paths through Actor update callback. This is not the documented embedded Item mutation surface; native acceptance of this path is unproven. UI relies on callback presence, not `isOwner`, and suppresses errors. Core authorization still applies: this audit does **not** claim a write-permission bypass.
4. **Notes:** tabs store multiple sections in `_sheet_delver` flags through SheetContext and global localStorage fallback → optimistic settings update → actor callback. Failure cannot be reliably distinguished with the convenience callback. Browser fallback keys are not scoped by world/user/Actor; narrative content can appear under another scope. Native biography fields and explicit module-only sections need distinct treatment.
5. **Refresh:** Core's Actor hook supplies current data, but `useModal` retains Item/intent props and local derived/UI state; changing Actor data does not prove an open detail/roll modal refreshes. Layout switches at 1024px replace separate modal providers. Test identity-bound live dialogs, permission loss, external edits and breakpoint changes independently of initial rendering.
6. **Creation:** `module/ui.tsx` has only sheet, initiative modal and stylesheet. No `tools`, `dashboardActions`, creation server route or advancement interpreter exists. The presentation test explicitly asserts the absence of dashboard tools. Updating that assertion is part of implementing the new behavior, not deleting useful coverage arbitrarily.

## Baseline requirement and feature-gap matrix

IDs remain stable through implementation. Baseline status describes the **workflow**, not whether a similarly named component exists; checkpoint changes are recorded under Implementation dispositions below. P = presentation/interaction; R = rules; A = authorization; W = persistence; S = synchronization. “Unverified” is not a confirmed exploit or native failure. Native paths below are expanded in the reference map. Milestones M0–M9 and external dependencies E01–E05 are defined in the ADR.

| ID | Feature / workflow and current status | Evidence and missing behavior / impact | Owning layer; dependency; observable acceptance |
| --- | --- | --- | --- |
| DD-01 | Preparation and version boundary — **partial** | `src/logic/adapter.ts:prepareActorData/normalizeActorData` delegates to Base adapter; prepared-looking source/defaults mask missing level, AC, HP, DC and movement. No selected native-version gate. P partial, R incomplete, S host-backed. | Module rules/projection, M1–M2; exact 6.0.6 source fixtures produce native numbers or explicit unavailable states, with unchanged source. |
| DD-02 | Abilities, saves, skills, tools, expertise/passives — **partial, confirmed errors** | `buildAbilities/buildSkills/buildPassive/getRollData`; multiplier mistaken for total, missing native bonuses/rules. Native `CreatureTemplate.prepareSkill`, proficiency model. | Module M2/M4; value/expertise/half/dice/advantage and all configured skills/tools agree across sheet/card/roll and native oracle. |
| DD-03 | AC, initiative, senses, movement — **partial** | Adapter and header fallbacks; no armor/effect/formula preparation. Native attribute and movement/senses fields. | Module M2; armor/unarmored/custom, speed types/units, initiative tiebreaker/conditions, sense ranges tested. |
| DD-04 | HP/temp HP, damage/healing, death saves — **partial** | `HitPoints.tsx`, `HPModal.tsx` do local arithmetic; source maximum may be null. No complete death-save/damage-rule pipeline. | Module M3/M4; resistance/immunity/vulnerability choices, temp/max modifiers, zero HP/death/revival and exact receipts; no unauthorized target updates. |
| DD-05 | Conditions, defenses, active effects — **stub/absent** | `Conditions.tsx`, `Defenses.tsx` static; adapter doesn't implement native phases/rule filters. | Module M2/M4; actual conditions/defenses, effect eligibility/order/duration, exhaustion and concentration shown and executed, no source mutation during prep. |
| DD-06 | Proficiencies, mastery, languages — **stub/partial** | `Proficiencies.tsx` displays fixed universal grants; UI attack heuristic assumes proficiency. Native traits/weapon mastery. | Module M2/M6; source-specific grants and restrictions; duplicate grants preserve source identities and validate replacement choices. |
| DD-07 | Short/long/new-day rests — **partial, incomplete** | `Rest.tsx`, `RestModal.tsx`; short rest no mutation, long rest only HP/temp HP. Native `_rest` and five recovery functions. | Module M4, world settings/E04 for automatic time; class HD, resources, slots, uses/effect expiry all match reviewed rest plan and native results. |
| DD-08 | Feat/item/activity uses and recharge — **partial display / absent execution** | `itemRows.ts` expects numeric max/value; native uses formula max/spent/recovery. | Module M4; spend/refund where supported, recharge outcomes, rest/day/dawn/dusk recovery without duplicate use or roll. |
| DD-09 | Inventory, containers, equipment, currency, weight/attunement — **partial** | Sheet categorization drops containers; scalar weight reads; ItemModal uses Actor path/captured item. No complete acquire/move/split/delete/currency workflow. | Module M3; embedded mutations, links/cycle prevention, exact duplicates, identification, limits and recalculation; no false save acknowledgement. |
| DD-10 | Activity selection and execution — **absent** | `getRollData('item')` null; manifest lacks server entry; native has 13 activity types. | Module M4/M7, E02/E04 as qualified; explicit per-type disposition, exact activity IDs, consumption/roll/effect/card ordering and failures. |
| DD-11 | Weapon attack, damage, criticals, ammunition — **partial display / absent action** | `itemRows.ts:computeAttackBonus/getWeaponAttackModes` duplicates heuristic rules; parseInt truncates formulas; old damage.parts. | Module M2/M4; native modes/mastery, ability/proficiency, crit/damage types, ammo and two-weapon choices produce same plans and receipts. |
| DD-12 | Spell identity/metadata/owned inventory — **partial, confirmed errors** | `toSpellRows`, `SpellModal` read old preparation/components; duplicate/catalog/owned identities not modeled. | Module M1/M5; exact owned IDs retained even source inaccessible, correct modern metadata, no catalog filtering away owned spells. |
| DD-13 | Spellbook, preparation, slots, pact magic — **absent workflow** | Spell tab only level/filter display; native `SpellcastingField`, `SpellcastingModel`, registry absent from module. | Module M5/M6; source grants/class progression/preparation caps, learned/prepared distinctions, slot pools and multiclass rounding match profile. |
| DD-14 | Casting/upcasting/ritual/concentration — **absent** | Cast UI invokes unsupported item roll; no slot/material usage or concentration lifecycle. | Module M4/M5; choose valid activity/method/slot, preview exact cost, ritual bypass only when native permits, concentration saves/replacement/ending and upcast scaling verified. |
| DD-15 | Authorized source discovery, SRD/premium/homebrew — **partial declarations / absent UI** | `info.json` fixed pack list, `getSystemDataForUser` not implemented. Core access list exists but dynamic full reads constrained. | Core E01 + module M1/M6; SRD-only works; optional installed accessible packs expand choices without hardcoding IDs or privileged leakage. |
| DD-16 | Provenance, duplicate names, edition selection — **absent policy** | No catalog/builder; labels call bundled SRD paid. Native `SourceField` and canonical UUID/origin flags. | Module M1/M6; distinct source/edition options, missing references diagnosed, no same-name replacement or implicit edition conversion. |
| DD-17 | Descriptions, links, privacy — **partial/unverified** | Notes/Characteristics/ItemModal/SpellModal use `dangerouslySetInnerHTML`; no module-side demonstrated SDK processing. Concealed/unidentified content not projected by D&D rules. | Module M1/M3/M7; SDK processing, exact readable links, secret/identification and observer projections checked. Raw rendering is a review risk; exploitability not tested. |
| DD-18 | Dashboard builder integration — **absent** | `module/ui.tsx`; test asserts tools absent. Siblings expose declared tools + dashboardActions. | Module M6, public Core tool host already available; one declared builder page navigable from dashboard with theme/background and clear prerequisites. |
| DD-19 | Guided choices and final validation — **absent** | No creation choice engine, native advancement/starting-equipment graph not interpreted. | Module M6; species/background/class/abilities/skills/equipment/spells/feats complete and server revalidated; prior-choice changes invalidate dependent intent. |
| DD-20 | Draft/resume/create/retry/recovery — **absent** | No caller-bound creation route or durable workflow record. SDK commit is not atomic. | Module M3/M6, E02 qualification; exact create ownership/IDs, one logical submission, zero-write restart and uncertain-write review, reconnect-safe draft. |
| DD-21 | Level/XP/subclass/feature advancement — **absent** | Class/level display only; native nine advancement types, originalClass and grant links missing. | Module M6; 1–20 progression and xpBoons mode, grants/HP/spells/choices/metadata persist and reopen natively without re-granting. |
| DD-22 | Multiclass/edit/replacements/respec boundary — **absent** | No rules or reverse/restore support. Native advancement manager includes level changes and recursive grants. | Module M6/M7; multiclass prerequisites/levels/slots, supported retraining and dependent reversal; unrestricted conversion/respec separately decided. |
| DD-23 | Desktop/mobile equivalent workflows — **partial** | `Sheet.tsx`, StandardView/MobileView, duplicate tabs; mobile fixed footer not registered, controls/placeholders differ. | Module M7; shared view/action models, keyboard and 360/390/768/1440 layouts, no tool obstruction or loss of draft on resize. |
| DD-24 | Dialogs/loading/errors/unsupported states — **partial** | `BaseModal`, `useModal`, captured props; several catch/no-op handlers; menu labeling/focus needs rendered checks. | Module M3/M7; source-bound refetch, accessible reasons/retry, explicit failed saves, nested shared overlays and focus return, stale confirmations blocked. |
| DD-25 | Caller authorization and ownership — **partial host enforcement** | Core request runtime checks callers; module UI often gates on callback existence; no D&D business-action routes. | Core retained + module M1/M3; GM/owner/observer/limited/none controls and server writes tested, create permission never borrowed from service GM. |
| DD-26 | Realtime/context/access convergence — **partial host Actor refresh / unverified consumers** | SDK useDocument present via default page, no module world settings or collection lifecycle; modal state copied. | Core retained + module M1/M7; ownership-only invalidation, world/rules change, reconnect and late replies retire old data/actions across mounted consumers. |
| DD-27 | HUD, rolls, shared chat/dice — **partial, bounded test verified** | `InitiativeModal`, `presentation.test.ts` preserve host formula/audience/manual total. Full native initiative/action parity absent. | Module M2/M4/M7; keep public shared presentation, visibility and speaker, no duplicate chat/dice, exact formula and persisted resources independently checked. |
| DD-28 | Identity, biography, appearance and notes — **partial/stub** | Header view, Appearance blank, Notes module flags/global fallback, Characteristics raw HTML. | Module M3; native fields editable with owner checks; module-specific notes scoped/migrated only if safe; readback, conflicts and content links. |
| DD-29 | World context and migration readiness — **absent adoption, no proven required migration yet** | Manifest no worldSettings/catalog; old flags and native schema migration assumptions. | Module M1/M8 using existing Core ADR-0064; only demonstrated module-owned persisted repairs get reviewed migration hooks, never native full-system upgrade or gameplay transactions. |
| DD-30 | Test/CI/native/package coverage — **partial** | Two small tests; prepared test feeds final-looking values, presentation asserts no builder; no explicit module tsconfig; Core pin old. | Module M0/M8/M9; independent source/prepared/action oracles, all module types, packaged/development and native full lifecycle matrix. |
| DD-31 | Optional rules, legacy/mixed documents — **unknown/unqualified** | No world context; native applyLegacyRules changes mechanics, not just names. | Module M1/M2/M5/M6; explicit supported combination table, variants verified or clearly disabled, never silent 2024 substitution. |
| DD-32 | Companions, summons, transformations, other Actors — **absent specialized support** | Generic sheet can receive non-PC data; no type-specific capability guard; native NPC/group/vehicle/encounter/facility workflows differ. | Module M7 + E04; supported PC-linked creature lifecycle; explicit read-only/unsupported other types, no fabricated PC rules. |
| DD-33 | License/content redistribution — **partial provenance** | Fonts documented; upstream MIT does not cover all images/purchased content. | Module M0/M8; package asset/license inventory, no restricted/premium data shipped, lawful neutral fallbacks and attribution. |
| DD-34 | Shared projection instead of repeated rules — **partial, contradiction confirmed** | Architecture claims sheets/cards/rolls share prepared model, but Sheet/itemRows/modals re-filter/recalculate/raw-read. | Module M1–M7; single rule result consumed by card, desktop, mobile, detail and command preview; equal-source contract tests. |
| DD-35 | Multi-document consistency and uncertain writes — **absent module handling** | SDK `documents.commit` prechecks then dispatches operations sequentially; no transaction/rollback or CAS contract. Default update callback swallows rejection. | Module M3, E02 qualification; exact readback/IDs and status, no replay after unknown writes, conflicting current edits never overwritten by stale plan. |
| DD-36 | Runtime limits and broader Foundry features — **unsupported/undecided** | Native methods depend on game/CONFIG/Hooks/Document classes/canvas. Scene/Setting not ordinary SDK store types. | Module M0/M7 + E04; explicit portable versus external/native-only table. No browser service, arbitrary macro execution or “import upstream and it works” assumption. |

### Separate assessment by concern

These ratings prevent presentation work from being counted as execution or
authorization evidence. “Host guard” means an existing Core boundary, not native
acceptance of the D&D workflow.

| Workflow | Presentation | Interaction | Rules computation | Authorization | Persistence | Synchronization |
| --- | --- | --- | --- | --- | --- | --- |
| Basic checks/stats | Present | Basic roll path wired | Confirmed skill/fallback errors | Host guard; native D&D roles untested | Rolls via Core; no source mutation expected | Host Actor refresh; complete derived parity absent |
| Weapon/spell action | Rows/detail/roll modal present | Buttons wired to unsupported type | Native activity engine absent | Host guard; business permission/cost validation absent | No working consumption/effect pipeline | Captured dialog intent unverified |
| Rest | Present | Apply exists; HD roll disabled | HP subset; missing recovery | Callback presence only in UI; host guard | Sequential HP/temp writes, weak success signal | Authoritative completion unverified |
| Inventory/equipment | Rows/detail present; containers omitted | Toggle controls partial | Weight schema wrong; limits/aggregation incomplete | UI owner checks incomplete; host guard | Dotted Actor paths, embedded receipt not proven | Modal captures old Item |
| Inspiration | Boolean control present | Toggle wired | Native sheet also toggles boolean; no automatic reroll parity claim | Callback presence in UI; host guard | Rejection suppressed by convenience flow | Current Actor feeds control; native write untested |
| Conditions/defenses/proficiencies | Placeholders/fixed text | Required controls absent | Absent | No meaningful action to qualify | Absent | No real data projection |
| Notes/identity | Partial | Editing and modal present | Native versus module field semantics incomplete | Controls often callback-based | Optimistic flags/local fallback, no reliable receipt | Global fallback/captured editor can cross scopes |
| Builder/advancement | Absent | Absent | Absent | No route | Absent | Absent |
| HUD initiative | Static contract tested | Public modal contract wired | Underlying formula preparation incomplete | Core audience/operation boundary | Core owns encounter roll/update | Actual mounted/native integration untested here |

Native inspiration evidence is `module/applications/actor/character-sheet.mjs:
#toggleInspiration` and `CharacterData.defineSchema`. Improve ownership/error
handling without inventing an automatic native resource-consumption behavior.

## Documentation contradictions to retire during implementation

- Architecture's shared-prepared-model statement is an intended boundary, not current complete behavior; view-layer rules still exist.
- Adapter comment “v3.x” and synthetic test version 5.3.3 do not describe the new 6.0.6 target.
- Pack labels say paid 2024 content where native manifest says bundled SRD 5.2.
- README “roll dialogs and styled chat cards” must not imply working weapon/spell activities or complete rest automation.
- Rest controls capture intent that is not executed. Success must not be inferred from modal closure or the convenience update callback.
- Old ignored tracker checklists are neither current native evidence nor an obligation to unpark the runtime experiment.

## Priority and disposition

First establish versioned fixtures, source/derived schemas, world settings and caller-safe content boundaries. Then implement shared preparation and strict action outcomes, followed by activity/rest/spell semantics and creation/advancement. UI completion consumes those results. E01 dynamic authorized content is a confirmed external dependency; E02 exact write/recovery guarantees and E04 scene/time capabilities require bounded qualification or separate Core proposals. Neither permits modifying Core in this phase.

No feature is marked native-verified here. The experimental designation remains. Acceptance, branch/commit authority, release changes and live tests are subsequent tasks.

## Implementation dispositions

C01 establishes maintained tests, explicit all-module typing and exact-tag static
source inventory (DD-30 foundation). The separate fixture source/expectations
and missing-native-capture marker address DD-01/33/36 evidence discipline.
`source-inventory.json` covers all 2,242 modern records and hashes native source;
its candidate expressions and reference cycles are investigation inputs, not
claims of executable parity. All DD workflows and A acceptance gates remain open.
See the verification ledger for commands and limits. E01 remains confirmed and
external; E02–E05 have no new defect claim from this checkpoint.

C02 implements foundations for DD-01/12/15/16/17/25/26/29/31/34: detached source
decoding, exact identities/edition, setting declarations/context fences and
caller-bound metadata routes. Bundled SRD labels are corrected. Full dynamic
catalog access, descriptions, choice validation and UI remain open. Fixed
ItemGrant closure detects missing references/cycles without same-name lookup.
No DD workflow or A acceptance row is closed by these R/S results. Actual SDK
contract adoption requires the selected released Core0.19.3 baseline; module
version0.4.1 and experimental status remain unchanged. No data repair is needed.

C03 corrects the recorded DD-02 +1 versus +5 defect for the bounded modern
source-only numeric skill profile. The same input failed before correction
(`actual1, expected5`) and passes +5/passive15 after; independent level/proficiency
expectations and unchanged-source checks are retained. Sheets/dialog defaults
and skill execution use one prepared result. Unqualified formulas/effects/dice
and missing inputs become unavailable rather than guessed. This partially
addresses DD-02/24/34 and A02; complete skill/native acceptance and the rest of
M2 remain open. Static render checks do not establish mounted U acceptance.
