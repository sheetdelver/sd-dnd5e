# D&D module: complete character-lifecycle discovery audit

Status: **active implementation; investigation retained, acceptance open**. Date: 2026-10-19.

Owning plan: [accepted module ADR-0001](../adr/0001-complete-character-lifecycle.md). Supporting [native reference](../reference/native-6.0.6.md) and [acceptance matrix](../plans/0001-verification.md). This audit replaces no completed Core or sibling-module decision and does not activate parked native-runtime research.

## Current implementation — C12–C16 (2026-10-21)

C12 `d0cf3f2` qualifies eligibility/phase order; C13 `b50a717` adds initial numeric
fields; C14 `c6339ef` adds constant bonuses; C15 `94a1bec` qualifies bounded
initial effect modes and passive/dispatch differences; C16 (Git checkpoint below)
adds shared HP/HD facts with modern editing/rest controls explicitly gated.
DD-R01–DD-R06 remain corrected. Partial M2 work and evidence are recorded below;
no new independent review or complete acceptance is implied. E01 and wider Q00/
E05, final effects, filters, Item preparation and later lifecycle milestones stay
open. Native/operator testing is still unperformed under the offline authority.

## Current independent review — C08/C09 (RV04)

The [C08/C09 review](evidence/2026-10-20-c08-c09-review.md) at `1c81d05`
confirms DD-R05's bounded correction and the independent source tool checks.
Fresh offline, mounted, isolated public-host and packaging checks pass; all 15
regular archive entries match the reported package. DD-R01–DD-R04 remain covered.

**DD-R06 (low; corrected in C10 below)**: RV04 found that mouse leave cleared a
still-focused mode button's preview.
At both tested widths, a focused Advantage button shows `1d20+5` after pointer
exit but Enter submits the correct `2d20kh1+5`. C10 corrects focus/hover preview
coordination with maintained mounted coverage. This is a module
presentation issue, not a calculation or Core-contract blocker. Combined
skill/tool and alternate-ability qualification can proceed alongside it.
See the report and [portable evidence](evidence/2026-10-20-c08-c09-review.json).
ADR-0001 and native/operator acceptance remain open. Review edits are docs only.

### C06/C07 review (RV03), finding now corrected

The [C06/C07 review](evidence/2026-10-19-c06-c07-review.md) at `a1492d8`
independently confirms DD-R01–DD-R04 corrections and the reported offline,
mounted and isolated public-host evidence. **DD-R05**, subsequently corrected by C08 below, was the review
finding: the blanket adv/dis execution block treats equal-valued die identity
as a rules failure, although all901 numeric outcomes and retained values match.
All40 index differences occur on equal pairs. No required first-tie Core
extension has been demonstrated for this plain numeric profile.

RV03 recommended defining narrow numeric equivalence, preserving the
index diagnostic and unmodified host serialization, restoring qualified mode
execution with consumer tests, then continuing source-only tools. C08/C09 implement
those bounded segments; full acceptance remains open. Wider E05 and
E01 remain open. See the report and
[portable evidence](evidence/2026-10-19-c06-c07-review.json) for boundaries.
No source changes or live/native acceptance occurred during review.

### C04/C05 review (RV02), findings now corrected

The [C04/C05 review](evidence/2026-10-19-c04-c05-review.md) at `b45e144`
independently passes the reported checks and confirms DD-R01/DD-R02 corrections.
It adds two medium-priority module findings to the next M2 checkpoint:

| ID | Finding | Required disposition |
| --- | --- | --- |
| DD-R03 | When the numeric profile is unavailable, level/proficiency retain old defaults or stale source values; the five-level baseline card becomes level0/+2. | Corrected C06: shared fact availability/provenance drives cards and both headers; known armor-independent class facts survive, unknown facts display unavailable. DD-01/02/24/34, A02/A03/A18. |
| DD-R04 | Source fixtures and preparation trust global proficiency fields that native6.0.6 declares nonpersisted. Later-phase arithmetic comparisons miss initialization. | Corrected C06: detached initialized proficiency0, poisoned-source invariance, separate source/default and intermediate cases; effects remain unavailable. DD-01/02/30/34, A02/A04. |

See the report for exact paths, reproduced values, correction criteria and
[portable results](evidence/2026-10-19-c04-c05-review.json). No new Core issue or
live acceptance is claimed. C06 resolves these findings; RV03 verifies them.
Continue the current checkpoint guidance above. Effects,
range execution, tools and E01 remain their existing planned work.

### Earlier review and implementation dispositions

The [October 19 review](evidence/2026-10-19-c01-c03-review.md) at `6189dcd`
independently passes the reported foundation checks, but records two required
module corrections. Their reproductions and native-source references are in that
report and its [portable ledger](evidence/2026-10-19-c01-c03-review.json).

| ID | Finding | Disposition |
| --- | --- | --- |
| DD-R01 | Configured native skill die min/max values are ignored in all four applicable roll scopes. | Corrected C04 via explicit unavailable state; C21 qualifies normal bound execution and explicit Normal overrides with unchanged static/passives. Bounded adv/dis and HUD range execution remain gated. |
| DD-R02 | Missing/unavailable/unsupported context restores old +1/passive11 skills and permits `1d20+1`, despite lifecycle diagnostics; supported baseline is +5/passive15. | Corrected C04: explicit unavailable preparation/execution, separate legacy selection, mounted intent retirement and recovery. |

C04 evidence is in the verification ledger and [portable correction record](evidence/2026-10-19-c04-corrections.json). No new Core dependency is established;
E01 and existing Q00/Q01 work retain their prior scope. M0/M1/M2 and full
acceptance remain open. Earlier baseline observations below are historical;
current compatibility is Core>=0.19.3/module-api>=1.5 and module0.4.1 experimental.

C05 subsequently implements shared bounded numeric abilities/checks/saves and
the supported-profile card level/proficiency path (DD-01/02/24/34 partial,
A02/A18 partial; DD-R03 qualifies its unavailable path and DD-R04 its source
proficiency fixtures).
Independent expectations precede implementation: six of eight cases failed on
C04; all now pass. Prepared previews, options, shortcuts, direct execution and
mounted loss/recovery agree for that profile. A separate failing regression
showed retained numeric preparation could authorize a context-retired direct
check; direct execution now also requires the explicit supported profile.
Controlled exact-native comparisons cover eight ability cases,81 source-mode
combinations and800 ordered d20 selections. See verification C05 and the
[portable preparation record](evidence/2026-10-19-c05-preparation.json).
These do not close the ordinary rules obligations: native source modes/ranges,
effects/filters, conditions/flags, proficiency dice, broader expressions, tools
and other M2 domains remain open. No new Core dependency, installed I/U or native
N/O acceptance is asserted; the historical baseline below remains preserved.

## Finding

The module is a partially wired character-sheet presentation, not a complete D&D implementation. It can render bounded Actor fields and request basic checks, but important numbers rely on prepared-looking input or guessed defaults. Modern Item schemas are incompletely interpreted. Item/spell buttons do not resolve an executable module roll; rest recovery is incomplete; no builder or advancement workflow is registered. Current green tests do not cover these behaviors.

The target is the **current Foundry-installable D&D system 6.0.6**, with 2024 rules primary. This is a larger rules/data integration than repairing individual labels. It needs a deterministic module rules layer, shared projections, explicit caller-bound action plans, source discovery and complete lifecycle verification. Core already supplies authorization, stores, world context, maintenance migrations, dice and presentation primitives; it does not supply native D&D browser document methods.

## Provenance and limitations at discovery

| Repository | Branch / commit at inspection | Version / state |
| --- | --- | --- |
| D&D module | `main`, `e62a723a9930c7e04345fb80e51fd55d463b7d7e` | 0.4.1; clean before this documentation pass; experimental |
| Core | `main`, `90c13e5e57d88913cd3bae6bf6b9e6f0b995bad1` | 0.19.3; SDK 3.4.0, module-api 1.6.0, UI 3.2.0, roll 1.0.0; pre-existing release-scaffold/document changes preserved |
| Shadowdark reference | `main`, `60b9c6368feae1d9163b74522804868fc7e47c25` | 0.9.6, Core >=0.19.2/module-api >=1.6/UI >=3.2/roll >=1 (each API below its next major); clean at inspection |
| Mörk Borg reference | `fix/adr-0001-native-alignment`, `33d329185a69bd55fbc661e428c2e37f563947b6` | 0.8.3, Core >=0.19.3/module-api >=1.5/UI >=3.2/roll >=1 (each API below its next major); dirty, separate active corrections; timestamped reference, not acceptance |
| Native D&D checkout | `6.0.x`, `28f35531021bb07609c79c4cbbb9b7e7c2744bf9` | Clean, two commits beyond release; selected oracle is exact `release-6.0.6`, `87e94dbd9f930135e0694cd7e7d49f210603cd2c` |

At discovery, D&D `info.json` declared Core `>=0.18.0`, module-api `>=1.1.0 <2.0.0`, UI `>=3.1.0 <4.0.0`, roll `>=1.0.0 <2.0.0`. CI and release use Core `v0.18.0`. There is no native-version compatibility declaration, world-settings declaration, migration catalog or server entry in the module. None was changed here.

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
| DD-01 | Preparation and version boundary — **partial** | C02 supplies exact-version context/source boundaries; C04–C48 replace modern numeric/health/AC/init/movement/species/defense/training/condition fallbacks in bounded shared profiles,with phase-separated final modes. Remaining fields,Item/final/filter/formula dependencies,activities and full native preparation are open. | Module rules/projection, M1–M2; exact 6.0.6 source fixtures produce native numbers or explicit unavailable states, with unchanged source. |
| DD-02 | Abilities, saves, skills, tools, expertise/passives — **partial** | C04–C48 share qualified numeric source/default/initial-effect preparation,selected checks/abilities,source/manual/condition/final modes,passives and Normal bounds. DD-R01–07 are corrected. Broader expressions,other conditions/final fields/filter/Item phases,proficiency dice and bounded adv/dis remain open. | Module M2/M4; value/expertise/half/dice/advantage and all configured skills/tools agree across sheet/card/roll and native oracle. |
| DD-03 | AC, initiative, senses, movement — **partial** | C17–C48 share bounded AC/init/equipment/movement/senses facts,selected condition restrictions/reductions and phase-correct initiative modes/scores. Broader effects/formulas,other conditions and complete native parity remain open. | Module M2; armor/unarmored/custom, speed types/units, initiative tiebreaker/conditions, sense ranges tested. |
| DD-04 | HP/temp HP, damage/healing, death saves — **partial** | C16 shares truthful HP/HD facts; modern health/rest writes are gated pending M3/M4. Legacy HPModal arithmetic remains limited. No complete death-save/damage-rule/receipt pipeline. | Module M3/M4; resistance/immunity/vulnerability choices, temp/max modifiers, zero HP/death/revival and exact receipts; no unauthorized target updates. |
| DD-05 | Conditions, defenses, active effects — **partial** | C12–C48 qualify bounded initial effects/eligibility,defense Sets/adjustments,explicit untimed condition statuses/reductions and Actor-owned final modes. Shared readouts and numeric execution preserve source and preparation phases. Other condition/preset/rider/time/flag/filter/final/Item behavior and combat/concentration remain open. | Module M2/M4; actual conditions/defenses, effect eligibility/order/duration, exhaustion and concentration shown and executed, no source mutation during prep. |
| DD-06 | Proficiencies, mastery, languages — **partial** | C26 corrects fractional/unavailable effective roll indicators; C27 shares source/local training, languages and conditional mastery metadata across cards and both layouts; C28 applies qualified initial training Sets. Specific content labels, complete grants/replacements and Item attack/mastery execution remain open; UI attack heuristics still need replacement. | Module M2/M6; source-specific grants and restrictions; duplicate grants preserve source identities and validate replacement choices. |
| DD-07 | Short/long/new-day rests — **partial, incomplete** | `Rest.tsx`, `RestModal.tsx`; short rest no mutation, long rest only HP/temp HP. Native `_rest` and five recovery functions. | Module M4, world settings/E04 for automatic time; class HD, resources, slots, uses/effect expiry all match reviewed rest plan and native results. |
| DD-08 | Feat/item/activity uses and recharge — **partial display / absent execution** | `itemRows.ts` expects numeric max/value; native uses formula max/spent/recovery. | Module M4; spend/refund where supported, recharge outcomes, rest/day/dawn/dusk recovery without duplicate use or roll. |
| DD-09 | Inventory, containers, equipment, currency, weight/attunement — **partial** | Sheet categorization drops containers; scalar weight reads; ItemModal uses Actor path/captured item. No complete acquire/move/split/delete/currency workflow. | Module M3; embedded mutations, links/cycle prevention, exact duplicates, identification, limits and recalculation; no false save acknowledgement. |
| DD-10 | Activity selection and execution — **absent** | `getRollData('item')` remains null; the server entry provides read-only catalog metadata, with no activity command route. Native has13 activity types. | Module M4/M7, E02/E04 as qualified; explicit per-type disposition, exact activity IDs, consumption/roll/effect/card ordering and failures. |
| DD-11 | Weapon attack, damage, criticals, ammunition — **partial display / absent action** | `itemRows.ts:computeAttackBonus/getWeaponAttackModes` duplicates heuristic rules; parseInt truncates formulas; old damage.parts. | Module M2/M4; native modes/mastery, ability/proficiency, crit/damage types, ammo and two-weapon choices produce same plans and receipts. |
| DD-12 | Spell identity/metadata/owned inventory — **partial, confirmed errors** | `toSpellRows`, `SpellModal` read old preparation/components; duplicate/catalog/owned identities not modeled. | Module M1/M5; exact owned IDs retained even source inaccessible, correct modern metadata, no catalog filtering away owned spells. |
| DD-13 | Spellbook, preparation, slots, pact magic — **absent workflow** | Spell tab only level/filter display; native `SpellcastingField`, `SpellcastingModel`, registry absent from module. | Module M5/M6; source grants/class progression/preparation caps, learned/prepared distinctions, slot pools and multiclass rounding match profile. |
| DD-14 | Casting/upcasting/ritual/concentration — **absent** | Cast UI invokes unsupported item roll; no slot/material usage or concentration lifecycle. | Module M4/M5; choose valid activity/method/slot, preview exact cost, ritual bypass only when native permits, concentration saves/replacement/ending and upcast scaling verified. |
| DD-15 | Authorized source discovery, SRD/premium/homebrew — **partial declarations / absent UI** | `info.json` fixed pack list, `getSystemDataForUser` not implemented. Core access list exists but dynamic full reads constrained. | Core E01 + module M1/M6; SRD-only works; optional installed accessible packs expand choices without hardcoding IDs or privileged leakage. |
| DD-16 | Provenance, duplicate names, edition selection — **absent policy** | No catalog/builder; labels call bundled SRD paid. Native `SourceField` and canonical UUID/origin flags. | Module M1/M6; distinct source/edition options, missing references diagnosed, no same-name replacement or implicit edition conversion. |
| DD-17 | Descriptions, links, privacy — **partial/unverified** | Notes/Characteristics/ItemModal/SpellModal use `dangerouslySetInnerHTML`; no module-side demonstrated SDK processing. Concealed/unidentified content not projected by D&D rules. | Module M1/M3/M7; SDK processing, exact readable links, secret/identification and observer projections checked. Raw rendering is a review risk; exploitability not tested. |
| DD-18 | Dashboard builder integration — **absent** | `module/ui.tsx`; test asserts tools absent. Siblings expose declared tools + dashboardActions. | Module M6, public Core tool host already available; one declared builder page navigable from dashboard with theme/background and clear prerequisites. |
| DD-19 | Guided choices and final validation — **absent** | No creation choice engine, native advancement/starting-equipment graph not interpreted. | Module M6; species/background/class/abilities/skills/equipment/spells/feats complete and server revalidated; prior-choice changes invalidate dependent intent. |
| DD-20 | Draft/resume/create/retry/recovery — **partial infrastructure** | C33 adds durable scoped command admission/inspection, duplicate and restart fences. No creation route or resumable builder draft. SDK commit is not atomic. | Module M3/M6, E02 qualification; exact create ownership/IDs, one logical submission, zero-write restart and uncertain-write review, reconnect-safe draft. |
| DD-21 | Level/XP/subclass/feature advancement — **absent** | Class/level display only; native nine advancement types, originalClass and grant links missing. | Module M6; 1–20 progression and xpBoons mode, grants/HP/spells/choices/metadata persist and reopen natively without re-granting. |
| DD-22 | Multiclass/edit/replacements/respec boundary — **absent** | No rules or reverse/restore support. Native advancement manager includes level changes and recursive grants. | Module M6/M7; multiclass prerequisites/levels/slots, supported retraining and dependent reversal; unrestricted conversion/respec separately decided. |
| DD-23 | Desktop/mobile equivalent workflows — **partial** | `Sheet.tsx`, StandardView/MobileView, duplicate tabs; mobile fixed footer not registered, controls/placeholders differ. | Module M7; shared view/action models, keyboard and 360/390/768/1440 layouts, no tool obstruction or loss of draft on resize. |
| DD-24 | Dialogs/loading/errors/unsupported states — **partial** | C04–C48 shared numeric dialogs validate source/context and retire held callbacks;DD-R06 focus/hover coverage is retained in both layouts. Other modals/loading/errors,write handlers and installed accessibility acceptance remain open. | Module M3/M7; source-bound refetch, accessible reasons/retry, explicit failed saves, nested shared overlays and focus return, stale confirmations blocked. |
| DD-25 | Caller authorization and ownership — **partial host enforcement** | Core request runtime checks callers; module UI often gates on callback existence; no D&D business-action routes. | Core retained + module M1/M3; GM/owner/observer/limited/none controls and server writes tested, create permission never borrowed from service GM. |
| DD-26 | Realtime/context/access convergence — **partial host Actor refresh / unverified consumers** | SDK useDocument present via default page, no module world settings or collection lifecycle; modal state copied. | Core retained + module M1/M7; ownership-only invalidation, world/rules change, reconnect and late replies retire old data/actions across mounted consumers. |
| DD-27 | HUD, rolls, shared chat/dice — **partial, bounded test verified** | Shared HUD frame preserves host formula/audience/manual total. C08–C48 qualify public plain-d20 numeric execution/source/condition/final modes and Normal-only bounds;critical/activity/chat/resource and installed/native parity remain open. | Module M2/M4/M7; keep public shared presentation, visibility and speaker, no duplicate chat/dice, exact formula and persisted resources independently checked. |
| DD-28 | Identity, biography, appearance and notes — **partial/stub** | Header view, Appearance blank, Notes module flags/global fallback, Characteristics raw HTML. | Module M3; native fields editable with owner checks; module-specific notes scoped/migrated only if safe; readback, conflicts and content links. |
| DD-29 | World context and migration readiness — **absent adoption, no proven required migration yet** | Manifest no worldSettings/catalog; old flags and native schema migration assumptions. | Module M1/M8 using existing Core ADR-0064; only demonstrated module-owned persisted repairs get reviewed migration hooks, never native full-system upgrade or gameplay transactions. |
| DD-30 | Test/CI/native/package coverage — **partial** | Two small tests; prepared test feeds final-looking values, presentation asserts no builder; no explicit module tsconfig; Core pin old. | Module M0/M8/M9; independent source/prepared/action oracles, all module types, packaged/development and native full lifecycle matrix. |
| DD-31 | Optional rules, legacy/mixed documents — **partial, bounded** | C02 uses public native world/settings context;unknown/unsupported contexts gate execution. Explicit legacy-limited behavior is preserved separately. Optional rules/full legacy qualification and edition conversion remain open. | Module M1/M2/M5/M6; explicit supported combination table, variants verified or clearly disabled, never silent 2024 substitution. |
| DD-32 | Companions, summons, transformations, other Actors — **absent specialized support** | Generic sheet can receive non-PC data; no type-specific capability guard; native NPC/group/vehicle/encounter/facility workflows differ. | Module M7 + E04; supported PC-linked creature lifecycle; explicit read-only/unsupported other types, no fabricated PC rules. |
| DD-33 | License/content redistribution — **partial provenance** | Fonts documented; upstream MIT does not cover all images/purchased content. | Module M0/M8; package asset/license inventory, no restricted/premium data shipped, lawful neutral fallbacks and attribution. |
| DD-34 | Shared projection instead of repeated rules — **partial** | C04–C48 share qualified numeric/fact/trait/condition and phase-specific roll results across cards,desktop/mobile and numeric modals/execution. Item rows/attacks,spells and other modals still use older raw/heuristic paths and remain unqualified. | Module M1–M7; single rule result consumed by card, desktop, mobile, detail and command preview; equal-source contract tests. |
| DD-35 | Multi-document consistency and uncertain writes — **partial infrastructure** | C32 reproduces receipt/race limits; C33 journals individual steps, retains exact acknowledgements and fences partial/unknown outcomes. Gameplay write paths and E02 native/conflict qualification remain open. | Module M3, E02 qualification; exact readback/IDs and status, no replay after unknown writes, conflicting current edits never overwritten by stale plan. |
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
and missing inputs become unavailable within its tested supported branch.
DD-R01/DD-R02 above identify missed range handling and context fallthrough, so
this is not a general fail-closed readiness guarantee. This partially
addresses DD-02/24/34 and A02; complete skill/native acceptance and the rest of
M2 remain open. Static render checks do not establish mounted U acceptance.

C06 (`35c6abc` review baseline) corrects DD-R03/DD-R04 with maintained failing-before/passing-after tests and mounted header/proficiency recovery. See verification C06 and its portable record. DD-R01/DD-R02 coverage is retained. No full DD/A/M acceptance gate closes.

C07 implements persisted source-mode combination and native passive±5 (DD-02/34
partial). Eighty of81 cases failed readiness before implementation; all static
cases now pass independent controlled exact-source comparisons. Source-mode
counts/proficiency poison does not become an effect. Public-host qualification
is separate:901 numeric totals and distributions pass,40 tied adv/dis selections
retain index1 instead of native index0. E05 now has executable evidence for a
bounded selection contract; this is not a claim of a generic Core defect.
Affected default/manual execution is explicitly fenced, with static totals and
passives retained. Normal execution remains bounded; ranges/tools/effects and
full DD/A/M acceptance remain open. See verification C07 and portable evidence.

RV03 supersedes C07's mandatory first-tie dependency recommendation for the
plain numeric profile. At RV03 the guards remained an implementation limitation
tracked as DD-R05 (corrected by C08); wider native roll equivalence is still open.

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

### C09 — Independent source tools (2026-10-20)

C08 implementation is `6839b73f1dcba855be4dec9da615b2ec0b46e1bb`; review docs
were checkpointed separately at89f4645. DD-R01–DD-R05 remain corrected with
maintained regressions. C09 adds shared source-only Actor tool preparation and a
small Tool checks surface in desktop/mobile Skills. Eight independent arithmetic
cases,81 mode combinations, poisoned-field/source invariance and malformed/
unsupported/recovery cases pass. Native schema/default and extracted-method
comparisons explicitly separate source from intermediate phases.

This advances DD-02/24/34 and A02/A18 only. Combined skill/tool proficiency and
advantage are documented and refused, as are alternate abilities/pace, effects,
Item activities, broader formulas and ranges. The public-host fixture passes943
requests (24 tool requests added) with40 equal-index diagnostics preserved.
Mounted tests use the actual layout/tool consumers and shared modal with an SDK
presentation seam. No installed UI/N/O, full tool/lifecycle or release acceptance
is claimed. See [C09 evidence](evidence/2026-10-20-c09-tools.json) and the
verification ledger. E01 and wider Q00/E05 remain open; continue the bounded
combined-check/ability-selection qualification before planned effects.

### C10 — DD-R06 focused preview correction (2026-10-20)

RV04 documentation checkpoint `e9be054` preserves the independent review.
Maintained mounted coverage first reproduced the same mismatch at1440/390:
Advantage remained focused after pointer exit, preview reverted to1d20+5 and
Enter submitted2d20kh1+5. Both now preview and submit2d20kh1+5. Focus and hover
are separate; focus takes precedence, blur uses remaining hover, and neither
interaction restores the source default. Transfer between actions is covered.
Source/manual execution, disabled choices and stale-intent fences are retained.
`npm test` passes33 tooling assertions/13 suites; explicit `npm run typecheck`
passes102 files; `test:mounted` passes50 transitions/8 previews/16 facts/18 modes/
56 tools plus the new interaction cases. Portable C10 evidence records unchanged
inputs and results in docs/audits/evidence/2026-10-20-c10-preview.json. These are
mounted module regressions with the SDK presentation seam, not installed UI or
native/operator acceptance. DD-R06 is corrected (DD-24/27/34, A02/A18 partial);
DD-R01–DD-R05 remain covered. No Core/rules/serialization change or full gate
closure. Continue combined-check/alternate-ability qualification; ADR-0001 open.

### C11 — Selected check qualification and implementation (2026-10-20)

C10 (`508369f`) corrects DD-R06; DD-R01–DD-R05 remain covered. C11 advances
DD-02/24/27/34 and A02/A18 with shared source-only skill/tool combinations and
alternate abilities. Original36 independent inputs first failed34 requests.
Final38 native builds include fractional/expertise and positive-half/zero-flat
cases;324 automatic/source combinations and114 manual numeric-bonus cases pass.
Only primary bonus/mode scopes contribute; selected resource poison or unused
bonus/range/mode fields do not become overrides. Requested invalid identities
never fall back to independent checks. Both layouts use one shared model/compiler.

Mounted80 selected cases plus earlier protections and DD-R06 pass; public-host
1095 requests preserve strict plain-d20 equivalence and40 diagnostic equal-index
differences with host serialization unchanged. Full checks/package pass; see the
[ledger](../plans/0001-verification.md) and [C11 record](evidence/2026-10-20-c11-selections.json).
Native source/preparation/request construction, the native in-place dialog phase,
mounted SDK seam and isolated public host remain separate evidence. No installed
UI/native/operator or release acceptance. Effects/flags/ranges/dice/expressions/
pace/Item activities/legacy expansion, E01 and wider Q00/E05 remain open. Continue
independent effect eligibility/phase-order and numeric modifier work in M2/Q00.

### C12 — Effect eligibility and phase foundation (2026-10-21)

C11 behavior and DD-R01–DD-R06 remain covered. This M2/Q00 slice replaces the
blanket active-effect-presence gate with a detached eligibility/phase plan. An
empty Actor effect, disabled effect, or provably unequipped/unattuned transferred
Item effect no longer hides otherwise qualified checks. Active changes remain
unavailable pending field/phase qualification. Nontransfer/Item-target effects
remain unavailable: Item preparation can alter class and other Actor operands.
No effect is applied to persisted source and no alternate world cache is added.

Eleven independent cases cover defaults, suppression, initial/final order,
stable explicit/default priorities, Item preparation, conditions, duration,
statuses, legacy change migration and unknown types. Two same-input regressions
failed before (empty Actor effect and unequipped transfer) and pass after.
Controlled exact6.0.6/Foundry14.367 methods capture five eligibility/order cases;
initialized defaults, empty conditions/roll data and trace-only change application
are explicit stubs. No Document/DataModel/runtime/operator parity follows.

Evidence and commands: [C12 verification ledger](../plans/0001-verification.md#c12--effect-eligibility-and-phase-foundation-2026-10-21)
and [portable record](evidence/2026-10-21-c12-effects.json).
M2/Q00 and ADR-0001 remain open. Next: initial numeric field/proficiency effects.

### C13 — Initial numeric field effects (2026-10-21)

C12 implementation checkpoint is `d0cf3f2`. C13 advances M2/Q00 and DD-02/24/27/
34, A02/A18 partially with one detached source/default/initial-effect operand
path. Twenty independently specified supported cases cover six numeric field
operations, stable priority ordering, integer rounding, half-step cleaning and
clamping, ability scores/save proficiency, local skill/tool multipliers and all
four verified initialized0 global proficiency targets. Seventeen original cases
failed before implementation; all now pass. Eight deliberately unqualified cases
remain unavailable (final phase, expressions, unknown/missing targets, invalid
choices, custom hooks, bonus FormulaFields and uninitialized fractional source).

The adapter prepares the detached effect operands once, then shares them with
character facts, ability checks/saves and the configurable skill/tool model.
Source remains byte-for-value unchanged, including poisoned nonpersisted target99.
Effective global check/skill/tool proficiency follows native scope selection.
Automatic combined advantage uses independently prepared proficiencies, not just
raw local multipliers: global half proficiency can grant advantage with both
local values0. Source disadvantage cancels it; manual choices still override.
Effect provenance participates in intent retirement even when a changed effect
does not change a particular total. Recovery requires fresh intent, without replay.

Evidence/commands/limits: [C13 ledger](../plans/0001-verification.md#c13--initial-numeric-field-effects-2026-10-21)
and [portable record](evidence/2026-10-21-c13-numeric-effects.json).
No full gate closes. Next: constant FormulaField check bonuses; final phases,
filters, Item preparation and wider expressions remain open. E01 and wider Q00/E05
remain open. ADR-0001 stays open with experimental0.4.1/compatibility unchanged.

### C14 — Constant check-bonus field effects (2026-10-21)

C13 implementation checkpoint is `b50a717`. Nineteen independently specified
constant FormulaField cases now pass; the original16 requests failed before.
Four expression/final/multiply cases remain unavailable. Exact native casts and
add/subtract/override string operations match all19 expected constructions,
including signed decimals, empty defaults, sequences and priority order.

The existing detached effect path now reduces only known constant operands by
the qualified operation and retains the native constructed formula as separate
provenance. It does not parse arbitrary expressions or add a dice evaluator.
Applicable local skill/tool, ability check/save, global check/save/skill/tool
and skill passive bonus fields share this path. Only primary selected scopes
contribute: a skill-local bonus never leaks into a primary tool check or vice
versa. Passive-only changes leave check totals unchanged. Raw prepared poison,
source preservation, mode/manual overrides, range gates, malformed global scopes
and stale intent recovery remain covered. C13's former `bonus-field` unavailable
case is explicitly advanced to +7/passive17 and compared with the C14 +2 case;
its historical C13 evidence remains unchanged.

Evidence/commands/limits: [C14 ledger](../plans/0001-verification.md#c14--constant-check-bonus-field-effects-2026-10-21)
and [portable record](evidence/2026-10-21-c14-constant-bonuses.json).
The rejected nested unary candidate is recorded alongside its qualified binary
and numeric adaptations; no required Core extension follows. Next: effect mode
counts/override/suppression with separate passive/roll scope ordering. ADR-0001
and full gates remain open; metadata unchanged.

### C15 — Initial effect modes and passive phases (2026-10-21)

C14 implementation is `c6339ef`. C15 adds the bounded initial AdvantageModeField
profile, preserving source mode separately from module-produced effect counts.
Raw modeCounts/override/suppression poison is ignored, not reclassified as source.
Nineteen original maintained requests failed before;25 independently specified
supported cases now match exact native field/dispatch/passive methods. Four
malformed/delta/custom/final cases stay unavailable. Numeric deltas are limited
to-1/0/1 and qualified operation branches; no wider no-op behavior is claimed.

Counts include positive/negative sources across scopes; add/subtract are not flat
mode arithmetic. Upgrade/downgrade suppress the opposite direction, override
remains ordered, and multiply is the qualified no-op. Automatic combined
advantage enters the same native count merge. Both primary skill/tool checks,
local/global tool scopes and ability/save modes use one shared interpretation.
Native passive and execution phases are deliberately distinct: passive ordering
is ability/local/global-check/global-skill; fresh execution is ability/global-
check/global-primary/local. An override can therefore choose opposite modes in
the two phases. Native passive resolveMode also returns an override before
suppression; dispatch booleans still mask it. Maintained fixtures assert these
surprising outcomes instead of forcing totals to look consistent.

The detached NumericEffects result holds initialized trusted count states.
The shared check model combines them using the appropriate phase; passive
projection consumes passiveMode while preview/button/shortcut/direct execution
consume sourceMode. Explicit manual modes continue to override configured modes.
Source remains unchanged; invalid context/ranges/custom/final rules refuse
execution. Source/context changes retire dialogs and callbacks, and recovery
requires a fresh intent. No browser evaluator, transport or second cache is added.

Evidence/commands/limits: [C15 ledger](../plans/0001-verification.md#c15--initial-effect-modes-and-passive-phases-2026-10-21)
and [portable record](evidence/2026-10-21-c15-effect-modes.json).
No full gate closes. Continue source/advancement HP/HD facts and health projections
in M2, with final/Item/filter/time and other unqualified behavior still unavailable.
E01/wider Q00/E05 and native/operator acceptance remain open; metadata unchanged.

### C16 — Shared character HP and Hit Dice facts (2026-10-21)

C15 implementation is `94a1bec`. C16 advances the M2 health foundation for
DD-01/02/03/24/25/34 and A02/A03/A18 partially. Twenty-two original source cases
failed before. The final26 cases include17 complete HP/HD expectations and9
independently unavailable/partial dispositions. Explicit HP overrides bypass CON,
class choices and unused bonus formulas. Calculated maxima use exact owned class
HitPoints selections, the shared initialized ability modifier, per-level/overall
constant bonuses and native per-level minimum1/final floor. Base maximum and
effective maximum stay distinct; current HP clamps to effective maximum without
writing source. Negative derived maxima, null/default current/max/tempmax,
multiclass levels, negative CON and initial CON effects are independently covered.

HD initializes verified d6/0/empty additional defaults, then derives each owned
class pool and by-size totals. Negative additional HD and overspent pools clamp
as native. Actor/class prepared-looking max/value/bySize and CON mod/level poison
are ignored. Source values, extension fields, canonical identities and object
mutability remain unchanged. HP/HD availability is separate: a literal HP override
can remain known with unavailable HD, or HD remain known while HP choices/CON are
missing. Unresolved armor checks do not hide independently qualified health facts.
Malformed/future/incomplete choices, unknown additional expressions, invalid or
duplicate persisted class identifiers and unqualified world/token UUIDs stay
explicitly unavailable; no name or same-name grant inference occurs.

One `prepareHealth606` result drives cards and desktop/mobile HP/HD consumers.
Cards no longer reconstruct HP from raw source; headers/blocks show effective
maximum and unavailable reasons. The old unsupported-context synthetic regression
now expects unavailable prepared HP while asserting its source17 is unchanged;
its prior carry-through was unqualified behavior, not a native oracle. Selected
legacy HP remains a separately labeled compatibility projection with its existing
limits. Modern HP editing and incomplete rest shortcuts are disabled until M3/M4
reliable command/rule qualification; populated health facts do not qualify those
actions. This is UI gating, not a claim of complete generic-write command coverage.

Evidence/commands/limits: [C16 ledger](../plans/0001-verification.md#c16--shared-character-hp-and-hit-dice-facts-2026-10-21)
and [portable record](evidence/2026-10-21-c16-health.json).
No complete gate closes. Continue bounded native AC/initiative qualification;
modern health/rest commands await M3/M4. E01/wider Q00/E05 and native/operator
acceptance remain open. ADR-0001 and version/compatibility remain unchanged.

### C17 — Shared armor and initiative facts/execution (2026-10-21)

C16 implementation is `9d15b1a`. C17 advances DD-01/02/03/24/27/34 and A02/A03/A18
partially. All47 original AC/initiative inputs failed before;48 maintained inputs
now pass. Modern AC ignores verified nonpersisted totals and follows the pinned
registry order, source calculation selection, constant custom formulas and final
literal override. This slice has no equipped Item interpretation. An explicit AC
override remains independently known; unresolved equipment otherwise stays gated.
Old `ac.value`/`ac.calc` and truthy `init.value`/old `init.bonus` are native migration
inputs, not interchangeable with current nonpersisted poison. They remain
unavailable pending migration qualification; three controlled migrations preserve
that distinction. This corrects the overly broad C16 handoff suggestion to ignore
all of those aliases. Source is unchanged.

Initiative shares initialized ability/constant bonuses, qualified initial effects
and ability/local/global mode combination. Static total, local-mode initiative
score and execution readiness are separate. Global check proficiency is not an
initiative proficiency grant. The declared exact-release `initiativeScore` setting
supports character d20 and fixed-score branches; fixed scores consume zero dice
and reject inapplicable manual mode/bonus overrides. Valid die bounds do not affect
the native BasicRoll fixed branch; malformed bounds still refuse. Ordinary bounded
dice remain unavailable. The tiebreaker is a separate trailing term, preserving
native arithmetic order: flattening `1d20+2+0.14` into `1d20+2.14` failed the exact
public-host assertion for face2 (4.14 versus4.140000000000001). No tolerance or host
serialization was changed.

Cards and actual desktop/mobile AC/initiative blocks consume these shared facts;
button, preview, shortcut and direct adapter use one compiler. The public initiative
hook throws a validation error on unavailable modern rules instead of returning an
empty formula that Core could replace with1d20. Earlier context-loss fixtures
returned1d20+99; all three now refuse. Actor UUID participates in intent identity,
retiring same-ID/revision callbacks from a different canonical Actor. Combat stat
suggestions use the existing public metadata contract and prepared paths; HP max
is effective maximum. GM selections/explicit initiative overrides remain Core-owned.

Evidence/commands/limits: [C17 ledger](../plans/0001-verification.md#c17--shared-armor-and-initiative-factsexecution-2026-10-21)
and [portable record](evidence/2026-10-21-c17-defenses-initiative.json).
No complete DD/A/M gate closes. Next M2 work is equipped armor/Item preparation,
then remaining movement/senses/final/filter/rule and Q00 domains. E01, wider E05,
M3 onward and installed/native/operator gates remain open. Experimental0.4.1 and
compatibility are unchanged; ADR-0001 remains open.

### C18 — Source equipped armor and post-passive Stealth (2026-10-21)

C17 is `0106422`. C18 advances DD-02/03/09/24/27/34 and A02/A03/A18 partially.
The45 maintained source cases include34 qualified Item/Actor phase comparisons
and11 explicit unqualified dispositions. All34 qualified inputs failed before
(including the absent equipment provenance result for an unequipped case).
`prepareEquipment606` initializes a detached source-only armor subset once per
preparation. Canonical owned identities, source order, base/magical values,
attunement and properties remain distinct. Exact registry types determine armor
versus shields; names/base-item labels and prepared-looking getters are never
mechanics. Actor AC uses the first equipped armor/shield, heavy-armor zero Dex,
other caps including null/unlimited, formula eligibility and source override.
Multiple equipment warns without reordering or changing source.

Native armor preparation adds Stealth disadvantage after skill passive preparation.
The shared check model therefore keeps initial passive mode states separate from
post-armor execution counts. Source advantage cancels armor disadvantage for fresh
rolls while an already-computed passive can remain20. Initial effect overrides/
suppression retain their actual behavior. A selected tool can grant automatic
advantage and cancel armor disadvantage for a primary Stealth check; a primary
tool check does not inherit its secondary skill's local armor mode. Alternate
abilities, explicit manual modes, numeric bonuses and existing die-bound gates
use the same compiler. Equipped armor no longer blocks otherwise qualified
numeric checks/saves/initiative. Unqualified equipped types, flags/migrations,
identity conflicts, Item effects and expressions still refuse affected workflows.
No armor-training penalty or broader Item/activity/final preparation is invented.

Cards and both layouts share AC facts; warnings are formatted once. Equipment
provenance joins roll intent identity, retiring callbacks even when a replacement
owned Item leaves totals/revision equal. Source documents, UUIDs, edition and
extension fields remain unchanged. Evidence: [C18 ledger](../plans/0001-verification.md#c18--source-equipped-armor-and-post-passive-stealth-2026-10-21)
and [portable record](evidence/2026-10-21-c18-equipment.json).
No complete gate closes. Continue M2 movement/senses, then remaining rule/filter/
final/Item and Q00 dependencies. E01/wider E05/native/operator gates and ADR-0001
remain open; experimental0.4.1/compatibility unchanged.

### C19 — Shared movement and senses facts (2026-10-21)

C18 is `3cc76bf`. C19 advances DD-01/02/03/24/34 and A02/A03/A18 partially.
Thirty-eight original inputs failed before; the final39 cases include a separately
reproduced scalar-text cleaning failure. One shared source/default/species path
replaces modern30ft/raw-sense fallbacks. It retains independent movement/sensory
availability and the separately known jump prerequisite. Class/proficiency failure
does not erase unrelated known speed. Source, canonical owned species identity,
edition and extension data remain unchanged.

Exact LocalDocumentField lookup uses the stored owned ID. Missing required local
references stay unavailable; neither a name nor the first race Item substitutes.
Source FormulaField numeric0 cleans to truthy string"0" and blocks species speed
inheritance, while blank/null/missing can inherit. Senses numeric0 blocks
inheritance; null/missing can inherit. This corrects the overly broad C18 local
handoff wording about zero. Native species units fill absent Actor units but do
not convert inherited numeric values into an Actor's explicitly selected unit.
Numeric bonuses do not create a speed from0; armor strength reduction converts
10ft into current units. Nonpersisted multiplier starts1 despite poison. Native
max/slowed are computed before jump is overwritten from prepared Strength.
Movement and sensory notes use verified scalar trimming without changing source.

Desktop/mobile share walk, additional movement and sensory readouts; mobile Skills
now exposes sensory facts. Unknown context/data shows reasons and recovers with
current preparation. Detailed evidence/commands: [C19 ledger](../plans/0001-verification.md#c19--shared-movement-and-senses-facts-2026-10-21)
and [portable record](evidence/2026-10-21-c19-movement-senses.json).
No complete DD/A/M gate closes. Conditions, movement/Item effects, legacy migration,
custom formulas/units/types, travel/canvas and broader final/filter rules remain
open. Continue dependency-ready M2/Q00; E01 and wider E05/native/operator gates
remain open. Experimental0.4.1/compatibility and ADR-0001 status are unchanged.

### C20 — Strict bounded d20 qualification (2026-10-21)

C19 is `b896406`. This advances Q00/M2, DD-02/24/27/34 and A02 partially.
Eight independent per-face contribution tables cover min, max, combined/aggregated,
same and crossed bounds. Exact release d20 configuration/BasicDie selection plus
Foundry14.367 minimum/maximum/total methods match6560 ordered cases and24 complete
distributions. Native min/max test original faces sequentially, setting count/
rerolled even on discarded results. Crossed bounds therefore cannot be replaced
by a generic clamp or flat bonus. Source range aggregation stays distinct from
die configuration, injected raw results and recorded contributions.

A separate isolated public-host harness compares exact entropy, ordered raw faces,
counts/flags, totals and distributions without rewriting serialization. All160
normal bounded rolls match strictly. Of6400 advantage/disadvantage requests,
320 equal-face pairs keep the second index rather than native first. All other
strict assertions pass. These two profiles remain unqualified; the reviewed
plain-d20 equal-index exception is NOT extended to configured ranges. This alone
is not a new Core defect/dependency or compatibility decision. The existing public
Core contract can execute the qualified normal bounded subset. Wider E05 remains
open; no Core or runtime evaluator is added.

Maintained comparator tests explicitly reject count/face/flag/state errors and
equal-index differences for this bounded profile. Evidence/commands/limits:
[C20 ledger](../plans/0001-verification.md#c20--strict-bounded-d20-qualification-2026-10-21),
[portable record](evidence/2026-10-21-c20-range-qualification.json).
This checkpoint changes verification only; DD-R01 execution stays gated until
C21 applies normal bounded compilation consistently across consumers. No full
gate closes. ADR-0001/E01/wider Q00/E05/native/operator acceptance stay open;
experimental0.4.1/compatibility and the parked runtime remain unchanged.

### C21 — Qualified normal configured die ranges (2026-10-21)

C20 is `ad9fa95`. C21 advances Q00/M2, DD-02/24/27/34 and A02/A18 partially.
All30 original normal-bound source cases failed before and now pass across skill,
tool, ability, save and initiative scopes. `d20SourceRange` validates persisted
1–20 integer fields and combines greatest minimum/least maximum. One shared
compiler emits ordered min/max modifiers before the separately prepared bonus;
it preserves crossed bounds instead of approximating a clamp/bonus. Static skill
values/passives remain independent. All441 nullable bound pairs and20 faces
(8820 normal cases) compare with pinned native methods and real public execution.

Execution readiness is distinct from reviewability. A source/automatic bounded
adv/dis default stays unavailable, its shortcut dispatches nothing, and its dialog
can offer an explicitly selected Normal roll. No source default silently changes.
The shared resolver/adapter revalidates the actual requested mode; malformed
ranges, missing context/formulas, flags and other unqualified rules cannot be
rescued by a Normal override. Disabled modes, previews, numeric bonuses, combined/
alternate requests, effect preparation and current-source callbacks use one path.
Bound/context changes retire dialogs and held callbacks, including equal-total/
revision source changes. Existing selected legacy range limits are preserved.

The public Core0.19.3 formula-only initiative HUD hook cannot declare Normal-only
modes; its consumer marks a leading bounded d20 as advantage-capable. A controlled
released-consumer reproduction records this. The module therefore explicitly gates
its HUD hook for configured bounds while the character-sheet/direct Normal check
remains qualified. It neither disguises the formula to influence private host
logic nor exposes unqualified overrides. No Core defect/extension or compatibility
change is justified solely by the tied-index issue. Future HUD coverage needs a
qualified mode-capability decision; this gate stays open under wider E05/A18.

Evidence/commands/limits: [C21 ledger](../plans/0001-verification.md#c21--qualified-normal-configured-die-ranges-2026-10-21),
[portable record](evidence/2026-10-21-c21-normal-ranges.json).
DD-R01's temporary normal-range restriction is superseded only for these qualified
profiles; DD-R01–06 malformed/context/stale protections remain. Bounded adv/dis,
other formulas/flags/groups/effect phases and full lifecycle acceptance remain
open. Next independent M2 work: source/default Item eligibility and remaining
rule/filter/final preparation, then dependency-ready M3 qualification. E01 and
wider Q00/E05/native/operator gates remain open; ADR-0001 and experimental0.4.1/
compatibility are unchanged.

### C22 — Source/default Item effect eligibility

C21 `d97f34b` remains the normal-bound checkpoint. C22 corrects an independently
reproduced eligibility discrepancy under DD-02/24/27/34 and A02: raw omissions
were treated as prepared truthy eligibility, while non-schema source poison could
suppress effects. Five equippable schemas initialize equipped/attuned false;
other Item schemas have neither field. The shared effect plan now records those
defaults/origins and applies exact suppression semantics for the qualified subset,
including trimmed strings and consumable exceptions. It preserves source and
shares the resulting numeric preparation across controls, previews and execution.

Evidence is in the [C22 ledger](../plans/0001-verification.md#c22--item-effect-source-default-eligibility-2026-10-21)
and [portable record](evidence/2026-10-21-c22-item-defaults.json). This supersedes
C12's raw-omission behavior only; historical source/initialized evidence remains.
Malformed/coerced legacy inputs, Item effects/final/filter/dependency phases and
native creation/lifecycle hooks remain unavailable. No complete gate or native/
operator acceptance is claimed, and E01/wider Q00/E05 remain open.

### C23 — Stored species identity across read surfaces

C22 `6f95ea2` is the preceding checkpoint. The first-race-Item fallback in
adapter cards/headers disagreed with the stored exact reference already used by
movement. C23 replaces it with one shared resolver and source identity projection
(DD-02/06/15/34, A02/A14 partial). Reference ID, canonical UUID, source edition and
source label remain distinct. An unresolved fallback string is labeled source
text, never assigned an Item ID by name. Missing context/malformed/duplicate/
foreign/wrong-type identity is unavailable; a missing selection is explicit.

The17 added contract cases fail on the predecessor's absent structured projection;
this includes reproduced wrong-label cases for a second selected Item, no selected
Item and unresolved text.12 qualified states compare against pinned native
cleaning/local-lookup methods. Cards and desktop/mobile headers consume the same
fact; source preservation/poison, class/movement independence, context recovery and
selected legacy boundaries are covered. See [C23 ledger](../plans/0001-verification.md#c23--shared-species-source-identity-2026-10-21)
and [portable evidence](evidence/2026-10-21-c23-species.json). Item prepared-rule,
installed UI/native/operator and full lifecycle acceptance remain open.

### C24 — Bounded defense traits replace constant placeholders

C23 `3bbf52d` precedes this M2 slice (DD-05/27/34, A02/A04 partial).28 maintained
raw-source contracts reproduce the absent preparation/constant placeholder; after
implementation they verify ALL/overlap normalization, source defaults, physical
bypasses, custom text, numeric adjustments, category-level availability, poison,
independent class/armor failures and context recovery.24 controlled source captures
include15 complete condition-free profiles and9 independent-domain comparisons;
other unavailable domains are explicitly omitted, not counted as native parity.

One shared prepared projection drives cards, desktop readouts and the live mobile
modal. Known source immunities survive an unrelated unsupported damage expression;
unknown immunity does not leave resistance silently unnormalized. CI has no native
bypass field, so raw poison there is ignored. Source is unchanged. Active conditions,
trait effects, broader expressions, flag/filter/final/Item phases and actual damage
commands remain unqualified. See [C24 ledger](../plans/0001-verification.md#c24--condition-free-defense-traits-2026-10-21)
and [portable evidence](evidence/2026-10-21-c24-defense-traits.json). No full gate,
installed UI/native/operator acceptance or release readiness is claimed.

### C25 — Initial trait effects through the shared pipeline

C24 `3d46c79` precedes this M2/Q02a slice (DD-05/27/34, A02/A04 partial).
Persisted defense value/bypass Set targets and constant dm.amount fields now join
one ordered initial-effect path.43 maintained source contracts include33 requests
that were unavailable before and now pass, plus10 explicit unavailable boundaries.
Exact primitive applyChange/delta/operation/cleaning/equality/initialization methods
qualify pre-clean comparisons, JSON string parsing, order and later normalization.
The raw-array native diagnostic returns one “fire,cold” member; the module keeps it
unavailable instead of inventing two IDs. Native FormulaField strings and reduced
module constants are recorded separately, not mislabeled native model snapshots.

Existing controls/readouts consume the shared result. Nonpersisted poison, strict
normal bounds, source/manual choices, context recovery and equal-result source
callback retirement remain covered. Active conditions, final/Item/filter phases,
references, unknown/coerced deltas and broader expression operations stay gated.
Legacy execution is unchanged and its defense projection remains unavailable.
See [C25 ledger](../plans/0001-verification.md#c25--initial-defense-trait-effects-2026-10-21)
and [portable evidence](evidence/2026-10-21-c25-trait-effects.json). This closes no
full acceptance gate and creates no new Core dependency or release claim.

### C26 — Fractional and unavailable roll proficiency presentation

C25 `7e147f2` precedes this focused M2 correction (DD-02/06/27/34, A02/A21 partial).
Source1.5 skill proficiency already produces correct +6/passive16 in the level5/
Wisdom14 profile, but Skills rendered the zero dot. Null skill/save proficiency
also rendered zero/false. The maintained actual mounted diagnostic records14 bad
rows (14 skill cells,6 save cells) across1440/390. A shared formatter now shows1½×
or unavailable, keeps known0 distinct, and gives accessible labels/reasons. It
never computes proficiency, guesses training, enables a roll or changes serialization.

Independent pinned numeric methods establish7 supported source profiles;2 malformed
skill inputs stay unavailable, and3 context-loss states never select legacy. Bounded
source advantage keeps its known static coefficient while unqualified default
execution/shortcuts remain fenced; explicit Normal uses existing support. See
[C26 ledger](../plans/0001-verification.md#c26--truthful-roll-proficiency-indicators-2026-10-21)
and [portable record](evidence/2026-10-21-c26-proficiency-indicators.json). The fixed
Proficiencies panel and remaining rules are still open; this is not native/operator
or release acceptance.


### C27 — Source training replaces universal fixed grants

C26 `76c8d81` precedes this bounded M2 slice (DD-02/06/27/34, A02/A21 partial).
36 unchanged independent source contracts fail against the predecessor adapter;
78 actual desktop/mobile diagnostic states lack truthful prepared training displays.
The shared DTO now distinguishes local tool training from effective roll proficiency,
preserves independent facts and reports unavailable/partial reasons instead of fixed
armor/weapons/Common grants. Specific Item labels remain unresolved exact keys with
reference metadata; no content access or grant is inferred. Mastery properties are
conditional source choices. Pinned localization methods preserve actual native order,
not an assumed alphabetical order. Native prototype lookup and phase/stub limits
are recorded, not hidden or used to assert source/runtime parity.

See [C27 ledger](../plans/0001-verification.md#c27--source-training-and-languages-2026-10-21)
and [portable evidence](evidence/2026-10-21-c27-training.json). Effects beyond existing
initial numeric local coefficients, active conditions/flags/filter/final/Item rules,
legacy expansion and native/operator/full acceptance remain open. No version,
compatibility or Core changes; E01 and wider Q00/E05 remain external/open as before.


### C28 — Qualified training effects share the prepared result

C27 `8ad3bbc` precedes this M2/Q02a slice (DD-02/06/27/34, A02/A21 partial).
The shared initial pipeline now handles the independently qualified persisted
training/language/mastery Sets.39 contracts include24 previously unavailable
supported requests and15 precise retained boundaries. Exact primitive methods and
native language preparation establish independent expectations; no module output
is used as its oracle. Identity domains, local/effective proficiency, initialized
source and applied values remain separate. Specific Item labels remain unresolved,
and mastery metadata does not claim active Item options.

See [C28 ledger](../plans/0001-verification.md#c28--initial-training-set-effects-2026-10-21)
and [portable record](evidence/2026-10-21-c28-training-effects.json). Context/source
recovery, retained-callback fences and source poison protection remain. This closes
no full gate; remaining filter/condition/final/Item/broader-expression and command
phases remain open, as do E01/wider Q00/E05/native/operator/full ADR acceptance.


### C29 — Boolean guards do not invent phase snapshots

C28 `ece9970` precedes this bounded M2/Q02a slice (DD-02/05/06/27/34,
A02/A04/A21 partial).40 pinned guards/zero property reads establish only invariant
boolean definitions. Native first-effect cache and fresh change checks remain distinct.
Of54 source contracts,34 supported workflows include32 predecessor failures and
2 unchanged defaults;20 unqualified workflows remain gated. False guards can prove
an otherwise unknown change inactive, while type/duration/flag/Item/malformed gates
are preserved. Every branch is validated; unknown dependent work is never hidden
by short-circuiting. Shared provenance retires equal-outcome callbacks.

See [C29 ledger](../plans/0001-verification.md#c29--snapshot-invariant-filters-2026-10-21)
and [portable record](evidence/2026-10-21-c29-constant-filters.json). Initial/final
replacement-data snapshots, active conditions/flags, Item phases and broader formulas
remain open. No additional Core defect or complete M2/native/operator acceptance
is inferred from these extracted methods or isolated fixtures.


### C30 — False filters retain source qualification boundaries

C29 `24c6bad` precedes this focused M2/Q02a correction (DD-02/05/27/34,
A02/A04/A21 partial). Four false-effect inputs with malformed/unqualified envelopes
incorrectly enabled+5 before. The shared plan now validates key/phase/type/priority
before suppression and reuses normalized entries. All58 contracts preserve34
supported workflows and24 boundaries; source and no-op/order behavior are unchanged.
44 pinned guard observations remain separate from source validation/native parity.
See [C30 ledger](../plans/0001-verification.md#c30--effect-envelope-gates-2026-10-21)
and [portable evidence](evidence/2026-10-21-c30-effect-envelopes.json). No full gate or
native/operator/release acceptance is claimed; dependent filters remain next work.


### C31 — Initial predicates use qualified phase fields

C30 `52fa7b9` precedes this M2/Q02a slice (DD-02/05/27/34,A02/A04/A21
partial).50 source contracts include30 predecessor failures and20 retained limits.
30 independent pinned captures distinguish explicit source, schema defaults,
pre-initial fields and later applied values. Native collects/evaluates before
applying changes: an earlier score/global-floor mutation cannot alter an initial
predicate's input. A proven missing save coefficient0 now feeds shared preparation
and predicates rather than leaving contradictory unavailable saving throws.

C29's two known-initial examples become supported through the new profile, without
weakening its constant-only oracle or unknown-branch qualification. Final/Item/
status/flag/derived/malformed/missing-parent boundaries stay explicit. Definition/
read/default provenance retires old callbacks; raw source/poison remains unchanged.
See [C31 ledger](../plans/0001-verification.md#c31--initial-scalar-filters-2026-10-21)
and [portable record](evidence/2026-10-21-c31-initial-filters.json). Controlled methods
and isolated consumers do not establish full native/installed/operator acceptance;
no complete milestone or release gate closes.


### C32 Q02 disposition — public receipts and command boundaries

C31 is `834b7ca`. DD-20/25/35 and A17/A18 advance in qualification only:
20 isolated public-host observations establish caller-bound owner gates, actual
receipt identities, sequential partial commit, ambiguous empty/lost responses,
real journal-storage faults/restart and the external-edit overwrite reproduction.
No production journal/gameplay command handling is claimed. E02 stays open with
an executable public conditional-write/explicit-conflict-policy gap; it is not a
Core transaction defect claim. Readback of Core primary data alone cannot resolve
all backend outcomes. Native ID/flag policy, atomicity and operator gates remain
unqualified. See [C32 ledger](../plans/0001-verification.md#c32--public-command-contracts-2026-10-21)
and [portable observations](evidence/2026-10-21-c32-command-contracts.json).
Next: shared durable admission/state/Actor serialization with exact acknowledgements,
zero-write rejection and operation-specific unknown fencing, before gameplay routes.


### C33 disposition — command infrastructure, not gameplay completion

C32 is `d00a6ff`. DD-20/24/25/35,A17/A18 advance partially with server-plan
binding, durable admission/readback, current caller/owner/context/domain preflight,
per-Actor queues, exact receipt retention, status and zero-write/partial/uncertain
fences. Prior-process reviews require fresh intent; interrupted execution never
replays. Real public-host faults/restart exercise the actual module coordinator;
its read-only status route is packaged and owner/caller scoped. No domain write
handler, native create/embedded-ID policy or concurrency acceptance is established.
See [C33 ledger](../plans/0001-verification.md#c33--command-journal-foundation-2026-10-21)
and [portable record](evidence/2026-10-21-c33-command-journal.json). Development
regressions caught and corrected context changes during async validation and
prior-process review reuse. All earlier roll/preparation coverage remains. No full
gate closes; E01/E02/wider Q00/E05/installed/native/operator acceptance stay open.


### C34 disposition — initial collection filter profile

C33 is `b2aed3c`. DD-02/05/27/34,A02/A04/A21 remain partial while58 new
initial Set workflows become qualified through shared preparation.83 contracts
preserve25 unavailable boundaries. Exact schema/filter/collection/apply methods
establish initial members and reads before earlier sorted writes or later defense
normalization; raw source/defaults/prepared members and provenance remain distinct.
Both layouts consume the same outcomes for controls,previews,training/cards and
execution; equal-initial-Set raw edits retire retained callbacks. No content grants,
name inference,new evaluator or Core requirement. See [C34 ledger](../plans/0001-verification.md#c34--initial-collection-filters-2026-10-21)
and [portable record](evidence/2026-10-21-c34-initial-collection-filters.json).
Native source-method comparisons are not native/operator acceptance; full lifecycle,
E01/E02/wider Q00/E05 and ADR closeout remain open.


### C35 disposition — class-source initialization shared with predicates

C34 is `98f177a`. DD-01/02/27/34 and A02/A03/A04/A21 remain partial while
base level/proficiency initialization is shared by facts,headers/cards and initial
predicates.30 declared inputs fail C34 and pass after;14 boundaries remain,including
one helper-only malformed Actor input outside the public SDK contract. One historical
class-level scalar restriction is explicitly superseded. Source level/prof99 never
becomes authoritative; explicit source class identities retire stale callbacks even
when totals agree. Level0/prof1,multiclass,thresholds and unavailable/recovery values
are verified in actual headers/proficiency displays at both widths. See [C35 ledger](../plans/0001-verification.md#c35--initial-class-facts-2026-10-21)
and [portable record](evidence/2026-10-21-c35-initial-class-filters.json).
No full lifecycle,condition/effect/formula support or native/operator acceptance is
claimed. E01/E02/wider Q00/E05 and ADR closeout remain open.


### C36 disposition — condition qualification foundation

C35 is `e7d12a4`. DD-05/27/34,A02/A04 advance in controlled-source evidence:
3 primitive source/default,93 status/mode/passive cases and372 native default
configurations pass. Status collection before CI changes is distinguished from
later Document.active/effective status,including add/remove immunity probes. Source
modes,combined proficiency advantage cancellation,empty-status noninference and
nonleveled source99 initialization are explicit. No module availability/UI change;
manual/alternate/initiative/source-boundary qualification precedes integration.
See [C36 ledger](../plans/0001-verification.md#c36--condition-phase-foundation-2026-10-21)
and [portable record](evidence/2026-10-21-c36-condition-foundation.json). These model/
method captures are not full native/operator acceptance. All full gates remain open.


### C37 disposition — bounded poisoned condition integration

C36 is `92b58ff`. DD-02/05/27/34,A02/A04/A21 advance partially through one
shared Actor poisoned status/check/passive path,plus live desktop/mobile readouts.
125 same-input condition/projection failures pass after;14 unsupported workflows
stay gated. Pinned manual/alternate/fractional/mode-effect/initiative comparisons
precede integration. Source preserved,nonpersisted poison ignored,initial status
collection distinct from final immunity and current Document.active. No condition
editing or other-condition/level/flag/clock/Item/final/formula qualification follows.
[C37 ledger](../plans/0001-verification.md#c37--bounded-poisoned-condition-2026-10-21)
and [portable evidence](evidence/2026-10-21-c37-poisoned-condition.json) distinguish
regression,controlled native-method,mounted UI,isolated public-host and packaging
evidence. Full rules/ADR gates and E01/E02/wider Q00/E05 remain open.


### C38 disposition — exhaustion source/map/status qualification

C37 is `11ba39c`. Controlled-source M0/M2 Q02a,DD-02/05/27/34,A02/A04
advances through32 phase profiles/192 builds,81 source-mode vectors/324 builds,576
movement,288 initiative and4 nonpersisted-map initialization captures. Raw persisted
source and prepared levels/statuses/reductions are distinct,including false guards,
CI timing,last-active duplicate order and mixed Poisoned. No production availability
change; numeric movement inputs/model/guard/CI/roll-builder stubs remain explicit.
[C38 ledger](../plans/0001-verification.md#c38--modern-exhaustion-qualification-2026-10-21)
and [portable record](evidence/2026-10-21-c38-exhaustion-foundation.json) retain the
independent inputs/source identities. Bounded runtime integration follows; no full
DataModel/native/operator acceptance or complete gate closure.


### C39 disposition — bounded modern exhaustion integration

C38 is `f9da324`. DD-02/05/27/34,A02/A04/A21 advance partially through a
shared Actor exhaustion level/map/status/reduction path.113 unchanged-input contracts
pass after (including81 source-mode vectors); inactive numeric checks may already
have worked,but prepared map/provenance was absent. Negative totals,fixed score0,
Normal bounds,source preservation/raw poison,384 source movement and unavailable/
recovery cases are maintained. Both layouts consume shared readouts and roll operands.
Controlled native movement now includes armor composition1152 (the probe first needed
its missing pinned armor constant,not a product fix). Source/default/prepared map and
status collection remain distinct. [C39 ledger](../plans/0001-verification.md#c39--bounded-modern-exhaustion-2026-10-21)
and [portable record](evidence/2026-10-21-c39-exhaustion.json) retain independent
inputs,method stubs,artifact identities and limits. Broader conditions/activities,
flags/time/Item/final/expressions and native/operator/full ADR gates stay open.


### C40 disposition — condition save/init/movement phase qualification

C39 is `2063461`. DD-02/05/27/34,A02/A04 advance in controlled-source evidence
only:84 status/phase,972 source-mode and8 effect-state cases,each checking native save/
initiative configurations (2128 total),numeric totals,scores and movement. Independent
frozen expectations retain raw counts,CI timing,dodging restrictions and local-score/
global-roll distinctions. Explicit source sets are not native presets; other combat/
condition behavior remains open. No production availability change. [C40 ledger](../plans/0001-verification.md#c40--condition-mode-and-movement-qualification-2026-10-21)
and [portable record](evidence/2026-10-21-c40-condition-modes.json) retain model/guard/
clock/CI/roll-build stubs and source identities. No full native/operator acceptance
or complete gate closure; bounded shared runtime integration follows.


### C41 disposition — shared condition modes and movement

C40 is `1eb4b6a`. DD-02/05/27/34,A02/A04/A21 advance partially through one
shared condition save/init/movement path.1064 unchanged-input contracts fail C40 and
pass after,including972 source-mode cases and8 effect-state cases. Some inactive
numeric checks already worked; prepared rule projection was absent. Initiative
phases retain local score versus combined execution; opposing counts/suppression/
overrides and source CI timing remain explicit. Source data/ownership/identities are
preserved. Dodging/dead presentation labels identify stored literal IDs,not presets.
[C41 ledger](../plans/0001-verification.md#c41--shared-condition-mode-and-movement-profile-2026-10-21)
and [portable record](evidence/2026-10-21-c41-condition-modes.json) distinguish maintained
regression,controlled source,mounted UI,isolated public host and package checks. Other
conditions/combat/riders/flags/time/Item/final/expressions and full acceptance remain
open. No new Core dependency or compatibility change is implied.


### C42 disposition — petrification status/trait phase qualification

C41 is `b70bfe9`. Controlled-source M0/M2 Q02a,DD-02/05/27/34,A02/A04
advances through18 independently expected source/model profiles. Actor statuses
and rule-effective statuses differ after late poison immunity; damage-trait ordering,
CI add/remove,all-damage immunity and explicit incapacity are captured separately.
No production gate is removed. [C42 ledger](../plans/0001-verification.md#c42--petrification-phase-qualification-2026-10-21)
and [portable record](evidence/2026-10-21-c42-petrification-foundation.json) retain
expectations,source hashes and stubs. Shared integration follows; no complete rules,
native/operator acceptance or full gate closure is claimed.


### C43 disposition — shared petrification trait/status preparation

C42 is `7d85969`. DD-02/05/27/34,A02/A04/A21 advance partially:18 maintained
source/projection contracts fail before/pass after. Actor status snapshot and later
rule-effective status are distinct; validated detached trait grants flow to the
existing shared defense normalizer and all numeric consumers. Source data is unchanged.
Malformed operands and unqualified rules stay unavailable. [C43 ledger](../plans/0001-verification.md#c43--shared-petrification-preparation-2026-10-21)
and [portable record](evidence/2026-10-21-c43-petrification.json) distinguish controlled
methods,regression,mounted UI,public-host and package evidence. No full condition/combat/
preset/rider/native/operator acceptance or complete gate closure. E01/E02/widerQ00/E05
and full ADR remain open.

C44 (after C43 `d0e1000`) qualifies34 explicit Stunned/Unconscious source-state profiles
and648 mode vectors with pinned methods,including CI timing,source defaults and no
implicit incapacity/Prone inference. Runtime remains gated pending shared integration.
[Record](evidence/2026-10-21-c44-incapacity-foundation.json) separates independent frozen
expectations/initialized methods from module regression/package evidence. No full
condition/combat/preset/native/operator gate closes;other M2 phases and E01/E02/wider
Q00/E05/ADR acceptance remain open.

C45 (after `c0ec52f`) implements bounded explicit Stunned/Unconscious source preparation
through shared status/mode/movement rules.680 new cases fail before/pass after;two disabled
cases already pass and1064 earlier cases remain. [Evidence](evidence/2026-10-21-c45-incapacity.json)
records actual consumers and qualification limits. Preset/rider/automatic-downing/combat
and full native/operator gates stay open.

**DD-R07 — confirmed module/oracle phase composition defect:** pinned CharacterData.
prepareDerivedData prepares abilities/skills/tools before Traits.prepareResistImmune.
C42's harness ran trait grants first;C43 copied that ordering for mode derivation.
Mixed Petrified+Poisoned incorrectly loses prepared check disadvantage/passive adjustment
when poison immunity is granted later. Correct the oracle composition and shared phase
snapshots next. Historical C42/C43 captures remain,but do not establish arithmetic
parity for this interaction. This is module evidence/correctness work,not a Core defect.


C46 (after `2bb9b78`) corrects **DD-R07**. Actual CharacterData.prepareDerivedData
phase-order trace plus reordered numeric methods confirm the mixed Poisoned check
counts/passive are prepared before late petrification immunity. Two arithmetic and18
phase-provenance contracts fail unchanged C45/pass after;seven count/override profiles
and actual consumers are covered. [Record](evidence/2026-10-21-c46-character-phase-order.json)
supersedes C42/C43's mixed arithmetic claim. Historical source/host/regression artifacts
remain;they cannot prove composition. No Core defect,version/compatibility change or
full DD/A/M/native/operator gate closure. ADR-0001 remains open.

C47 (after C46 `93629e5`) independently qualifies1188 final mode/source/condition cases,
9504 native check configurations and1188 initiative configurations. Native field changes
occur after passive/score snapshots;actual Foundry Document/Actor and Character phase
traces prevent initial/final conflation. [Record](evidence/2026-10-21-c47-final-modes-foundation.json)
keeps initialized/stub boundaries explicit. Runtime final effects remain unavailable;
shared integration is next. No full final/Item/filter/native/operator gate closes.


C48 (after C47 `1db9f32`) implements qualified Actor-owned final roll modes with
separate passive/score and execution snapshots.1188 maintained cases fail before/pass
after;four late-derived counter cases and actual armor Stealth source interactions are
separate evidence. [Record](evidence/2026-10-21-c48-final-modes.json) tracks shared controls/
previews/shortcuts/direct execution,source preservation and stale callbacks. A retained
malformed-initiative test caught a broader availability gate;the existing local boundary
is preserved. Other final fields/Item-origin final effects/Item preparation/filters/
flags/time/expressions and full DD/A/M/native/operator acceptance remain open.

C48 implementation is `c82480f`. The [C12–C48 index](evidence/2026-10-21-c12-c48-checkpoints.json)
records local commit identities and evidence hashes at each checkpoint. Full requirement/
milestone/native/operator/installed acceptance remains open;there is no release-readiness
claim. Remaining M2 final numeric/proficiency/bonus/Item/filter/formula work is explicit,
as are E01/E02/E04/widerQ00/E05 and later lifecycle gates.

### C49 — Final proficiency phase qualification (2026-10-22)

Parent `82dab23`; partial M0/M2 Q02a, DD-02/03/27/34, A02/A04.
The frozen852-case fixture independently qualifies all four global proficiency
NumberFields and six finite operations after derivation. Exact native methods
compare3408 fresh skill/tool configurations and1704 ability configurations. Earlier
prepared skill/tool totals,passives and proficiency remain intact; fresh skill/tool
builders read current global proficiency. Combined advantage uses earlier prepared
proficiency,including fractional coefficients. Final global save changes do not
rebuild an earlier save proficiency object.32 actual DataModel initialization cases
ignore raw nonpersisted poison and initialize0 before effects.

[Portable evidence](evidence/2026-10-22-c49-final-proficiencies-foundation.json)
records independent inputs,observations,source/artifact hashes,commands and stubs.
Maintained suites,explicit186-file typing,exact source2242/591 and retained/new native
method comparisons pass. This is controlled initialized-model qualification,not native
boot/dice/operator acceptance. No new UI/public-host/package run in this source-only
phase. Runtime final proficiency remains gated pending shared integration. Next
preserve earlier prepared snapshots alongside fresh execution proficiency and verify
actual consumers. Other final/Item/filter/flag/time/expression phases,E01/E02/E04/wider
Q00/E05 and full DD/A/M/ADR acceptance remain open. Experimental0.4.1 unchanged.

### C50 — Shared final proficiency execution (2026-10-22)

C49 qualification checkpoint is `68178a05b402e0a587b964060d18c89ffee9731e`.
Partial M2/Q02a, DD-02/03/27/34, A02/A04/A18/A21. All852 frozen cases fail on
unchanged C49 with the final inputs and pass after integration. Qualified Actor-owned
constant-guard final global check/save/skill/tool proficiency NumberFields now use
six shared finite operations and an execution-only target snapshot. Raw nonpersisted
poison remains ignored; source and canonical identities remain unchanged.

Skill/tool defaults,selections,alternate abilities,previews,shortcuts and direct adapter
execution use current targets. Automatic combined advantage uses earlier prepared
proficiency; ability checks/saves keep earlier proficiency objects. Shared projections
retain preparedTotal/preparedProf separately from current total/prof; passives use the
earlier total. Both layouts render current roll bonuses/coefficients and a shared note
when final proficiency differs from preparation. No UI formulas or second cache exists.
Final save proficiency is a real final field change with no retroactive save rebuilding.

The older actor-initial-final fixture is now qualified: initial WIS+2 gives earlier
Perception+6/passive16; final check proficiency2 gives fresh roll+9. Its old readiness
test assumed every available roll equaled+5. That assertion now separately verifies
availability and independently expected formulas; controlled native methods confirm
this phase composition. Six numeric-string operations use a literal-only Roll stub;
no expression evaluator or native dice claim is added. C49's runtime gate and C48's
blanket final-proficiency restriction are superseded only for this bounded profile.
Unknown fields,invalid choices/dependent guards,Item-origin final effects,broader
expressions/flags/time and remaining final preparation remain unavailable.

[Evidence](evidence/2026-10-22-c50-final-proficiencies.json) and the verification
ledger distinguish regression,controlled source,mounted SDK-seam UI,isolated real
public host and package results. DD-R01–07/strict plain-d20 boundaries remain. Equal
faces retain recorded index diagnostics;actual host serialization is unchanged.
No full DD/A/M/ADR/installed/native/operator gate closes. E01/E02/E04/widerQ00/E05,
remaining M2 final numeric/bonus/Item/filter/formula work and later lifecycle milestones
remain open. Experimental0.4.1/compatibility unchanged. Next qualify the remaining
final numeric/bonus fields against their earlier and fresh execution consumers.

C50 completed checks:60 tooling assertions/8 tooling suites/41 module suites PASS;
explicit188-file source/UI/server/test/hook typing PASS;exact inventory2242/591 and
native checks/effects/119 initial filters/condition matrices PASS. Focused mounted190
states at1440/390 PASS;full retained mounted50 transitions,8 previews,16 facts,18 modes,
56 tools,80 selected,22 eligibility,1172 fields,58 mode effects,58 health,102 AC/init,
90 armor,84 movement,624 training,24 indicators,149 defenses,40 species,180 Normal
range states and callbacks PASS. Public151807 accepted/1 rejected candidate/40 equal-index
diagnostics/0 native writes PASS. Isolated module check/package PASS;archive SHA256
`2aee6bc505c8e215b780f3082f63ba86fe28a1e249bc54eff16332fb47a15ca5`.
Record embeds artifact hashes,scope/stubs and failed-run dispositions. All task-owned
services closed;production untouched. Node24.21 tested;CI Node22 remains unrun locally.

### C51 — Final constant bonus phase qualification (2026-10-22)

C50 implementation is `8f00ad89b82af2d71e15fdf0a27a84706590e409`.
Partial M0/M2 Q02a, DD-02/03/27/34, A02/A04;qualification only.576 frozen independent
profiles compare12 bonus paths,three FormulaField operations,four initialized operand
states and four literal deltas. Actual native methods compare5184 check configurations,
576 initiative configurations and576 fixed scores. Final roll bonuses are read afresh
through native primary/ability/global scopes; selected secondary bonuses do not leak.
Earlier prepared totals/passives/fixed scores remain earlier. Final passive bonus
field changes do not retroactively rebuild the stored passive.

[Portable record](evidence/2026-10-22-c51-final-bonuses-foundation.json) retains
source/fixture/harness hashes,representative observations,commands and stubs. All retained
native matrices and60 tooling assertions/8tooling/41module suites/188file explicit typing
PASS. FormulaField string operations and builder parts are actual extracted methods;
expected constant totals are independent arithmetic,not evaluated native dice. Full
FormulaField validation/schema boot/operator acceptance is unproven. No new mounted,
public-host or package run for this source-only phase;C50 evidence stays separate.

Runtime final bonuses remain unavailable pending C52 shared integration. Preserve
prepared versus current totals,passives and fixed initiative scores;then verify both
layouts,previews,selections/alternate abilities,direct execution,bounds and stale-intent
recovery. Other final numeric/Item/filter/flag/time/expression phases,E01/E02/E04/wider
Q00/E05/fullDD/A/M/ADR/installed/native/operator gates stay open. No compatibility or
experimental0.4.1 change follows.

### C52 — Shared final constant bonus execution (2026-10-22)

C51 qualification is `899fc88f09aa26cfa43608c6b36a117e2862be0d`.
Partial M2/Q02a, DD-02/03/27/34, A02/A04/A18/A21. All576 frozen profiles fail on
an unchanged C51 archive with final maintained inputs and pass after integration.
Qualified Actor-owned constant-guard final bonus add/subtract/override operations
now populate a shared executionBonuses map. Initial operands and earlier snapshots
remain unchanged. Known operation arithmetic is reduced by phase,without parsing
arbitrary formulas or introducing a dice evaluator. Native FormulaField text is
retained in provenance. Null/malformed source operands,unqualified operations/deltas,
Item-origin final changes,unknown fields and dependent guards remain unavailable.

The same compiler supplies current skill/tool defaults,selected checks/alternate
abilities,ability/save and initiative execution,previews and shortcuts. Only actual
primary/ability/global scopes contribute. Prepared totals/proficiencies,passives and
fixed initiative scores remain earlier. A final passive-bonus field update does not
rebuild the stored passive. Shared preparation notes distinguish current roll bonuses
from earlier preparation in both layouts; initiative retains its prepared fact and
projects a current roll fact for controls. No card/UI calculation or second cache is
added. Source,ownership and canonical identity are preserved; changed intent retires
callbacks and requires fresh review after recovery.

C14's final-open fixture is now independently qualified: source local bonus2 gives
prepared skill7/passive17; final add2 gives current skill9. Actual native construction
compares this case and two final-bonus/proficiency/Poisoned/exhaustion compositions.
These are operand/parts comparisons,not evaluated native dice or native boot. The
frozen576-case source fixture,maintained regressions,actual mounted consumers and real
isolated public-host rolls remain distinct evidence categories. C51's runtime gate is
superseded narrowly. Other final numeric/Item/filter/flag/time/expression phases and
E01/E02/E04/widerQ00/E05/fullDD/A/M/ADR/installed/native/operator gates remain open.

[Portable record](evidence/2026-10-22-c52-final-bonuses.json) records commands,
artifact/source identities and evidence limits. Experimental0.4.1/compatibility remains
unchanged. Next qualify final persisted numeric fields: native derived skill/tool.value
and ability.proficient may already differ from raw source before final operations;
ability.mod and proficiency objects retain earlier snapshots. Final ability values
also require separate header and initiative tiebreaker qualification before admission.

C52 validation:60 assertions/8tooling/42module suites,190 explicit module/UI/server/test/
hook files,exact inventory2242/591,native checks/effects/initial119/conditions+576bonus+
3composition cases PASS. Final focused mounted80 at1440/390 and full retained behavior
suite PASS. Full run precedes the compact-note style fix;post-fix focused run and same-
input measurements qualify that final style separately (note right426.95→274.86 at390).
Public176025 accepted/1candidate reject/40equal-index diagnostics/0native writes PASS.
Final isolated check/package PASS;archive SHA256
`80b836621507c23ce6d90f5307f9dd94fae7b1c1aac285ee0514f964a7405771`.
Artifact/source hashes,commands and failed-run dispositions are in the record. All
owned services closed;production untouched. Node24.21 tested;CI Node22 unrun locally.

### C53 — Final persisted numeric phase qualification (2026-10-22)

C52 implementation is `b4c811d3724a9121aeeb720d5e7543cca3471dff`.
Partial M0/M2 Q02a, DD-02/03/27/34, A02/A04;qualification only.1300 independent
profiles compare six persisted NumberField paths/six operations,initial global targets,
source coefficient/save variants and final score31/1001/0/1e9 boundaries. Actual methods
compare11700 check and3900 normal/tie/fixed initiative configurations;every source
snapshot remains unchanged. Three cross-phase cases verify removing a final global
target before changing a skill value,clearing a final save coefficient while retaining
its earlier prof object,and combining final Dexterity/bonus changes with a current tie.

Final operations start from native prepared values: skill/tool.value already reflects
earlier effective proficiency; ability.proficient already includes initial global save.
They do not start from raw source. Final values do not refresh earlier mod,prof,
effectValue,totals,passives or fixed scores. Current ability score is a distinct header
operand; fresh initiative tie reads current score/100. Schema ability.value has min0,
integer cleaning and no maximum;changing that field after preparation does not clamp it
to the earlier max property or recompute mod. Runtime initial-source score boundaries
are unchanged;later admission must qualify finite current-field results explicitly.

[Record](evidence/2026-10-22-c53-final-numbers-foundation.json) contains independent
fixture identities,source hashes,observations,commands and stubs. Native retained/new
comparisons,60 assertions/8tooling/42module suites and190-file explicit typing PASS.
This is controlled field/method/operand evidence,not complete schema/source/native boot,
engine,UI or operator acceptance. No new mounted/public-host/package run for this
source-only phase;C52 evidence stays separate. Runtime final numeric fields remain gated
pending C54 shared integration. Other final/Item/filter/flag/time/expression phases,
E01/E02/E04/widerQ00/E05/fullDD/A/M/ADR gates stay open;experimental0.4.1 unchanged.

### C54 — Shared final numeric fields and current score projection (2026-10-22)

C53 qualification is `f4c84fe555eec5051d3408ed191475518c111a1f`.
Partial M2/Q02a, DD-02/03/27/34, A02/A04/A18/A21.1300 frozen cases fail unchanged
C53 with final maintained inputs and pass after. Shared check/save coefficient helpers
now supply earlier prepared field inputs and fresh roll calculations. Qualified
Actor-owned constant-guard final ability value/proficient and skill/tool.value changes
use a separate finalNumbers map and record prepared/final operand provenance. Repeated
final operations start from the preceding final result. Skill/tool.value starts from
earlier effective proficiency,not raw source or a newly changed final global target.

Current ability score and preparedScore/mod remain distinct. Both layouts show current
scores and explain earlier modifiers. Fresh initiative tiebreakers use current score;
fixed scores and earlier mod/prof/effectValue/static/passive data stay earlier. Current
NumberField results are finite,cleaned by each field's integer/step rules and bounded to1e9; final scores
may exceed30 without refreshing an earlier modifier. The initial-source score0–30
profile remains unchanged. Source,canonical identities,ownership and metadata stay
unchanged; unknown/malformed operands,flags,Item origins,unknown fields/dependent rules
remain gated. Recovery requires fresh current intent and never replays held callbacks.

C13's final-score fixture is now qualified (current WIS16,earlier mod2,roll5/passive15).
Its numeric-method harness now applies initial/final changes on the proper sides of
actual preparation; prior initial-only comparisons remain separate. C24's final-change
fixture now preserves its Fire resistance; an unrelated qualified final score field
cannot invalidate those earlier defenses. Still-unknown max/derived-field gates replace
the narrowly superseded restrictions in older mode/proficiency tests; all1300 new
independent expectations cover the admitted fields.

Tiebreaker verification additionally executes the pinned Foundry parser association and
AST arithmetic on already-evaluated numeric leaves.180 cases establish exact left-to-
right IEEE addition. Regrouped binary and integer-scaled driver expectations were both
incorrect for some operands; they are replaced with an independent ordered-operand
oracle. All total/face/entropy/serialization assertions remain strict. No host result is
rounded or rewritten,and no Core defect/extension follows. This controlled arithmetic
probe is not a dice evaluator or native engine/operator acceptance.

[Evidence](evidence/2026-10-22-c54-final-numbers.json) separates regression,
controlled-source,mounted/public-host/package results and failed-run dispositions.
Other final fields/Item/filter/flag/time/formula phases,E01/E02/E04/widerQ00/E05 and all
fullDD/A/M/ADR/installed/native/operator gates remain open. Experimental0.4.1 and
compatibility are unchanged. Continue the existing dependency-ordered M2 phases and
bounded Q00 qualification before admitting broader rules or domain writes.

C54 completed checks:61 assertions/9tooling/43module suites;193 explicit module/UI/server/
test/hook files;exact source2242/591;native checks/effects/initial119/trait domains/
condition matrices+1300numbers/4compositions/180strict ordered-arithmetic cases PASS.
Focused mounted132 at1440/390 and the full retained behavior suite PASS. Public235850
accepted/1candidate reject/40equal-index diagnostics/0native writes PASS. Final isolated
check/package PASS;archive SHA256
`b2fc3786df0d5a49ace98279e7991c8e388b5873b02e14ccff41bf757f387fc6`.
Record retains commands,hashes,failed-run corrections and precise source/style/fixture
boundaries. All owned services closed;production untouched. Node24.21 tested;CI Node22
unrun locally. No full acceptance gate closes.

C54 implementation checkpoint is `e1dbfb0c97889d5a2acc261ca4d3360e5a786129`.
[C49–C54 checkpoint identities](evidence/2026-10-22-c49-c54-checkpoints.json)
record all six local qualification/implementation commits and evidence hashes as stored
at each checkpoint. ADR-0001/full acceptance stays open. Continue dependency-ready M2
flag/trait/Item/filter/formula qualification;E01/E02/E04/widerQ00/E05 remain open.

### C55 — bounded modern source-flag qualification (2026-10-22)

864 frozen independent profiles compare exact release6.0.6 Common/Creature/Attributes
preparation and actual Actor skill/tool/ability/initiative builders: modern Jack of All
Trades supplies half proficiency only when a skill is selected; independent tools and
ability checks stay unchanged. Earlier prepared skill/tool proficiency controls combined
advantage, including a positive half coefficient whose rounded flat bonus is zero.
Modern Alert supplies initiative proficiency1, independent of global check proficiency;
legacy flat+5 is outside this qualification. Fixed initiative score uses local mode.

Ten absent/null/false/zero/blank flags preserve native falsy defaults. Config declares
both flags Boolean; malformed truthy source types must not become authoritative flags.
Two proficiency-dice configurations prove Alert introduces a separate1d6 term while
ordinary initiative does not. This term remains outside the numeric execution profile.
The fixture is independent arithmetic, not module/captured-output expectations. Actual
initialized shells and declared collaborators establish method/phase behavior, not
source boot, native dice, installed or operator acceptance.

Native comparisons864 profiles/5184 check/1728 initiative configurations, retained
matrices, module61assertions/9tooling/43suites and explicit193-file typing PASS.
[Evidence](evidence/2026-10-22-c55-source-flags-foundation.json) records commands, source/fixture hashes and stubs. C55 is qualification only;
C56 must centralize flag validation and share these semantics across all consumers, with
failing-before tests, malformed/unknown gates and Alert proficiency-dice fencing.
Other flags, effects/Item flag origins, legacy expansion, E01/E02/E04/widerQ00/E05 and
all full DD/A/M/ADR/native/operator gates remain open. No metadata changes.

### C56 — shared modern Jack/Alert source rules (2026-10-22)

C56 integrates C55's two persisted Boolean flags through one source qualifier and
shared numeric preparation. Modern Jack sets a sub-one coefficient to half only for
a request with a selected skill; independent tools and ability checks do not gain it.
Earlier skill/tool prof objects still determine automatic combined advantage. Positive
half proficiency counts even when its flat bonus rounds to zero. Fresh requests and
final-field prepared-before operands use the same coefficient helper. Modern Alert
adds base proficiency to initiative and its earlier fixed score, independent of global
check proficiency. Proficiency-dice Alert remains unavailable because it adds1d6; a
plain initiative with no proficiency term stays independently numeric.

The qualifier accepts true and the verified absent/null/false/zero/blank defaults.
Unknown truthy flags, malformed recognized values/containers, transformations and
Item/effect flag writes remain gated. No name-based grants, legacy expansion, new dice
evaluator or host dependency was introduced. Flags stay source data; the detached
preparation snapshot is revision-owned. Shared skill/tool/ability/initiative compilers
supply both layouts, cards, headers, proficiency indicators, previews, shortcuts and
direct requests. Source metadata and prepared-looking poison fields remain unchanged.

With unchanged864 independent profiles,648 flag-bearing cases fail on C55's intentional
runtime gate and all864 pass after C56. Maintained cases cover levels0/5/9/20, fractional
and expertise coefficients, initialized global targets, modes/manual overrides, fixed
scores, numeric bonuses/bounds, poison/source preservation, invalid flags, context
loss/recovery and stale intent. Actual pinned methods additionally prove final skill
value starts at Jack's prepared half, while the earlier prof/effectValue stays distinct.

[Evidence](evidence/2026-10-22-c56-source-flags.json) separates commands, artifacts and controlled-source/regression/mounted/
isolated-host/package evidence. All full DD/A/M/ADR acceptance remains open. Other
flags, later trait/Item/filter phases, expressions, nonhomogeneous dice, adv/dis ranges,
E01/E02/E04/widerQ00/E05 and native/operator acceptance remain open. Experimental0.4.1
and compatibility are unchanged. Next executable M2 work: qualify final trait/training
field changes against native phase order before admitting their shared projections;
continue bounded Q00 independently of the documented external dependencies.

C56 completed validation:61 assertions/9tooling/44module suites and196 explicit module/
UI/server/test/hook files PASS. Exact inventory2242/591, retained native checks/effects/
condition matrices plus864flags/10defaults/2dice boundaries/1final-field composition
PASS. Focused mounted74 at1440/390 and the full retained mounted suite PASS. Actual
public-host261770accepted/1known candidate rejection/40equal-index diagnostics/0native
writes PASS. Isolated module check/package PASS; archive SHA256
`5ea1b769bdc23af975b3634b1e8ba3b01151c7c8f1e40f051058ea0f3a1b449d`.
All task-owned browsers/hosts closed; no live Foundry or production configuration.
Node24.21 tested;CI Node22 remains unrun. No full acceptance gate closes.

### C57 — final defense Set phase qualification (2026-10-22)

192 independent literal cases compare exact native Traits normalization followed by
actual SetField final operations and native sheet presentation: eight value/bypass
fields, six operations, overlap/ALL/empty/petrified sources. Final operations act on
the earlier normalized Sets and do not replay normalization. A final addition can
therefore leave an overlap or ALL plus specific entries; projecting it as a newly
normalized source would erase a legitimate final change. Raw whitespace deltas still
compare before StringField cleaning, as in the earlier Set qualification.

144 condition-free field/presentation cases are independently bounded.48 additional
petrified initialized-model cases compare fields separately from the native sheet's
All Damage override. That predicate is a declared stub, not a new condition lifecycle
qualification; final condition/status interactions remain open. Runtime must keep that
boundary explicit until actual Actor-query/phase comparisons are available.

[Record](evidence/2026-10-22-c57-final-defense-sets-foundation.json) retains commands, exact source/static-field/fixture/capture hashes, prior
phase evidence and collaborator limits. Maintained native trait comparison PASS:
retained25defense/24trainingSets/33training-language/33initialtrait plus192final cases.
C56 module/typing/public/mounted/package evidence remains unchanged and separate; no
new installed/native/operator acceptance is claimed. Qualification only: C58 must
introduce a shared earlier-normalized/final Set snapshot, preserve raw source and
partial-domain diagnostics, and test both layouts, stale intents and execution gates
before admission. Other final training/Item/filter/formula/condition phases and all
full ADR/DD/A/M gates remain open. Experimental0.4.1 and compatibility unchanged.

### C58 — condition-free final defense Sets (2026-10-22)

C58 admits Actor-owned constant-guard final value Sets for damage resistance, immunity,
vulnerability and condition immunity, plus the four damage-category bypass Sets. One
shared normalizer produces the earlier trait state. A detached finalDefenseSets map
then applies qualified literal Set operations in native order; repeated changes consume
the preceding final result. The projection reads this current map without normalizing
it again. Earlier source/condition/check snapshots remain separate and unchanged.

148 independent supported profiles fail on C57 with the same final inputs and pass
after C58. Four added physical-bypass captures extend C57's192 historical source cases
to196; native sheet icons and actual Set fields compare independently. The historical
C25 `unavailable-final` row now supports its unchanged plain-fire input, with an actual
final-phase receipt and Fire resistance. Its original fixture and historical evidence
are preserved; only the obsolete unavailable expectation is superseded. Still-unknown
String/training/formula/Item phases and malformed/reference deltas remain gated.

Condition-bearing final-Set workflows stay explicitly unavailable. C57's48 petrified
initialized field/presentation comparisons do not establish the complete actual Actor
status/query lifecycle. No final immunity change may be treated as an initial grant,
retroactively erase an earlier mode, or silently restore an omitted source status.
These remaining condition phases must be qualified separately before admission.

Both layouts' existing defense surfaces, physical bypass descriptions and cards read
the same projection; roll previews/buttons/shortcuts/direct adapter requests keep the
shared compiler. Source, canonical metadata and prepared-looking poison are preserved.
Context loss, unsupported conditions and identity changes retire held callbacks;
recovery requires fresh valid intent and never replays a roll.

[Record](evidence/2026-10-22-c58-final-defense-sets.json) separates baseline failures, regression, controlled-native-method, mounted,
public-host and package results. Temporary data/config and synthetic endpoints only;
no live Foundry or native/operator acceptance. Experimental0.4.1 and compatibility
unchanged. All full M/DD/A/ADR gates remain open, with E01/E02/E04/widerQ00/E05 external
or unresolved as documented. Next executable M2 work: final training Set field/label
phase qualification and final defense condition-query composition, before broader
Item/filter/formula work. No unavailable state counts as completed rules support.

C58 completed validation:61assertions/9tooling/45module suites and199 explicit
source/UI/server/test/hook files PASS. Exact inventory2242/591, traits196 plus retained
source domains, native effects and condition matrices PASS. Focused mounted106 at
1440/390 and the full retained mounted suite PASS. Real isolated public-host262510
accepted/1known candidate rejection/40equal-index diagnostics/0nativewrites PASS.
Isolated check/package PASS; archive SHA256
`9a35b65c8045e42be1161c5d20d8f347fbf12d3e3d7fae7b69b46ab1d0f055cd`.
Failed retained-expectation/import/typing runs and their corrections remain recorded;
none is reported as passing. All owned hosts/browsers closed. Experimental/version/
compatibility unchanged;ADR/fullacceptance remains open.

### C59 — final training Set field/label qualification (2026-10-22)

90 frozen independent cases compare five persisted training Sets, six operations and
three literal source profiles. Actual prepareLanguages runs before final SetField
operations. It overwrites poisoned model labels, then those cached language labels
remain earlier even after current language values change. The native sheet uses that
earlier language cache while armor/weapon/mastery presentation reads current Sets.
Current fields, earlier labels and caller-visible facts must remain distinct.

The actual conditional masteryOptions getter reads current explicit longsword/base-sap
and bonus keys. Bonus choices require an already mastered weapon with a base mastery;
they do not grant missing weapon/mastery data or establish Item action support.
Native sheet key membership, field values, earlier spoken labels and fresh conditional
options compare independently. Raw source labels must never become authoritative.

Maintained native trait comparison PASS:90training/196finaldefense plus retained source/
default/initial domains. Explicit199-file module/UI/server/test/hook typing PASS.
[Record](evidence/2026-10-22-c59-final-training-sets-foundation.json) retains source/static-field/fixture/capture identities and declared stubs.
This is initialized method/phase evidence, not full DataModel/source boot, native dice,
installed UI or operator acceptance. C58's full regression/mounted/public-host/package
results remain separate and unchanged. Runtime final training stays gated pending
C60 shared snapshots and consumer tests. Existing M2 dependency order continues;
E01/E02/E04/widerQ00/E05,other effect/Item/filter/formula/condition phases and all full
M/DD/A/ADR acceptance remain open. Experimental0.4.1 and compatibility unchanged.

### C60 — shared final training Sets and truthful language projection (2026-10-22)

C60 admits the five qualified Actor-owned final training Sets. Literal operations use
initialized/initial-effect operands and repeated final results in one finalTrainingSets
map, with source/default/null-cleaned and prepared/final provenance in applied records.
Raw source and the earlier detached system remain unchanged. Current armor, weapon,
mastery and language keys feed shared training facts; grants are not inferred from
names, additional mastery choices or unresolved base Item references.

Languages have two separate contracts. preparedSpoken preserves the earlier native
label cache; spoken/display formats current qualified language values for the caller.
One verified formatter handles both. A separate native formatting shell independently
checks current-key presentation; it does not mutate the original model/cache or claim
an extra native Actor preparation phase. Both layouts show current labels and an
earlier-label note when they differ. Native sheet cache behavior remains preserved in
evidence rather than being mistaken for current field data. The historical sourceKeys
property denotes current local initialized/final keys; preparedKeys records the earlier
operand. Neither is an instruction to persist a projection back over Actor source.

The maintained90 independent profiles fail on C59 with the same inputs and pass after
C60. Source/model label poison, fractional unrelated globals, enum identity, unknown/
malformed/reference deltas, repeated changes, Item origins, context loss/recovery and
held callbacks stay covered. C27's original unqualified-effect and C28's final-training
inputs are retained and now support their final heavy-armor Set changes; only their
obsolete unavailable expectations are superseded. Other unsupported gates remain.

[Record](evidence/2026-10-22-c60-final-training-sets.json) separates regression, controlled native methods/formatting, mounted consumers,
real public-host and isolated package evidence. Native sheet weapon/mastery presentation
unions keys, while the module keeps local weapon training and mastered source choices
separate so it cannot infer proficiency from a mastery choice. Item/mastery activities
remain unqualified. Broader String/Formula/Item/filter/final-condition phases remain
open, as do E01/E02/E04/widerQ00/E05 and all full M/DD/A/ADR/native/operator acceptance.
Experimental0.4.1 and compatibility unchanged. Continue existing dependency-ready M2
final condition-query/trait composition and bounded Q00 qualification next.

C60 completed validation:61assertions/9tooling/46module suites and201 explicit
source/UI/server/test/hook files PASS. Exact inventory2242/591 and native trait
methods90training/current-format+196finaldefense+retained source domains PASS.
Focused mounted86 at1440/390 and full retained mounted suite PASS. Real public-host
262960accepted/1known candidate rejection/40equal-index diagnostics/0nativewrites
PASS. Isolated check/package PASS; archive SHA256
`2d9fb4d1062fbe8cfb15138c896a3b97c75be0f87975ce10c9d7be43ff354f3a`.
All owned hosts/browsers closed. Historical-expectation failures and corrections
remain identified;no failed runs count as passing. Experimental/version/compatibility
unchanged;ADR/fullacceptance stays open.

### C61 — final CI/current query/earlier cache qualification (2026-10-22)

168 frozen independent profiles compare final condition-immunity Set operations for
poisoned and modern exhaustion1–6, explicit present/empty source statuses and initial
immunity absent/present. Actual Actor queries read current CI. Earlier omitted/deleted
Actor statuses are not restored by final immunity removal; adding final immunity does
not replay Actor status collection or trait cleanup. Native condition level maps and
level-six dead derivation are compared independently from status membership.

Prepared modes, passives and cached conditionRollReductions remain earlier. Fresh
skill/tool/check/save/initiative configuration still constructs the separate reduction
parts from that earlier cache. A probe initially omitted these parts from its numeric
assertion; pinned addConditionRollReduction confirms their membership/data. Corrected
constructed-operand accounting retains the frozen expected total and all assertions.
No native behavior or Core contract changed.

Maintained comparison PASS:168profiles/1008ordinary builders/336initiative configs plus
all retained matrices. Actual primitive Set constructors are shared with the maintained
trait oracle; imported evidence cannot overwrite the directly invoked command capture.
Direct trait capture and explicit201-file module typing PASS. [Record](evidence/2026-10-22-c61-final-ci-conditions-foundation.json) retains exact
source/helper/capture identities and precise constructor/phase/query limits.

Qualification only: C62 must integrate current CI, preserved Actor status/level data and
earlier modes/reductions through one shared path, with failing-before and both-layout
recovery tests. Other conditions, combinations, movement/fresh threshold/Item/automatic
result semantics remain open. Native method construction is not native/operator
acceptance. C60 runtime/UI/public-host/package evidence remains separate. Experimental
0.4.1 and compatibility unchanged;E01/E02/E04/widerQ00/E05 and all full gates stay open.

### C62 — bounded final CI with earlier condition snapshots (2026-10-22)

C62 admits final Actor condition-immunity Set changes for one eligible poisoned or
modern exhaustion1–6 source, without initial CI changes and within the qualified
poisoned/exhaustion immunity identities. Other condition combinations, inactive/unqualified predicates,
identities and condition-bearing final defense fields remain explicitly unavailable.
This extends the C58 condition-free profile; it does not close general condition rules.

Current CI and effective status presentation share the final defense snapshot. Actor
statuses collected earlier, condition levels, prepared mode counters, static/passive
values and cached roll/speed adjustments remain earlier. Repeated final changes filter
the preserved Actor status snapshot, never a previously filtered list: an existing
status may become visible again, while a status omitted earlier is never recreated.
Both layouts explain when current immunity masks a condition whose earlier prepared
adjustments still affect numeric checks. No source data or persistence is changed.

With unchanged168 independent inputs, all168 fail on C61's intentional gate and pass
after C62. Native reduction operands and source/manual modes remain shared with the
existing compiler. Tests additionally cover malformed/reference deltas, unsupported
condition combinations/initial CI/other defense fields, repeated add/subtract, source
poison, context transitions and held callback retirement. Recovery requires fresh
current intent and never replays a retired roll.

[Record](evidence/2026-10-22-c62-final-ci-conditions.json) separates regression, C61 controlled source/field construction, mounted UI,
real public-host and package evidence. Single-condition ordinary numeric workflows
are bounded support; movement/fresh general condition queries, Item/automatic-result
semantics and broader final condition combinations are not newly qualified. Existing
prepared domains retain their earlier snapshots. Experimental0.4.1 and compatibility
unchanged. E01/E02/E04/widerQ00/E05 and all full DD/A/M/ADR/native/operator gates remain
open. Next executable M2 work: actual final petrification/defense field/query and
presentation composition before broadening these gates, plus remaining final fields/
Item/filter/formula qualification in existing dependency order.

C62 completed validation:61assertions/9tooling/47module suites,203explicit module/
UI/server/test/hook files,exact inventory2242/591 and native168finalCI+all retained
matrices PASS. Focused mounted138 at1440/390 and full retained mounted suite PASS.
Actual public-host268000accepted/1known candidate rejection/40equal-index diagnostics/
0nativewrites PASS. Isolated module check/package PASS; archive SHA256
`da4ec5b3dba7302c204a4e984abf4c02b163935c958d3058a981d072e9cde07e`.
All owned hosts/browsers closed;no live Foundry or production settings. Version/
experimental/compatibility unchanged;fullADR and native/operator acceptance stay open.

### C63 — actual petrification/final-field/query/presentation qualification (2026-10-22)

48 unchanged C57 petrified final-field profiles now compare actual Actor condition
queries, earlier Actor status/passive state and current field values.2,304 actual
#changeHasEffect/#changeIsIgnored calls compare three defense categories, four damage
types and four property variants. Current Sets and physical bypasses govern native
membership, including final overrides/removals while petrification remains active.

The native sheet independently keeps its All Damage display override through the real
Actor query. Current field membership, earlier petrification grants and that native
presentation are distinct contracts. C64 must preserve these distinctions in shared
caller facts rather than reapplying grants or treating a display override as current
resistance data. No damage totals/application or Item activity support is established.

Maintained native comparison48profiles/2304predicates plus all retained matrices PASS;
direct trait capture and explicit203-file module typing PASS. [Record](evidence/2026-10-22-c63-final-petrified-foundation.json) retains exact
sources,constructor/Color/presentation-shell stubs and capture identities. This is
initialized method/field construction,not full native dispatcher/source boot/preset/
operator acceptance. C62 runtime/UI/public/package evidence remains separate. Runtime
gate stays open pending C64 tests and projections. Other conditions, combinations,
fields/Item/filter/formula phases and E01/E02/E04/widerQ00/E05 remain open. Experimental
0.4.1 and compatibility unchanged;all full ADR/DD/A/M/native/operator gates stay open.


### C64 disposition — bounded petrification/final Sets (2026-10-22)

The 48 C63 petrified inputs now pass shared preparation, preserving current final
values separately from earlier grants and native sheet display. The old unavailable
expectations for these rows are superseded; DD-R01–07 remain corrected and covered.
Mixed/inferred statuses, initial-defense composition, broader CI identities, Item
origins and damage application are still unavailable. No additional Core defect or
compatibility dependency is alleged. [C64 record](evidence/2026-10-22-c64-final-petrified.json)
contains independent-oracle, before/after, consumer recovery and verification identities.
This is partial DD-03/11/27/34 and A03/A04/A18/A21 work; all full ADR gates stay open.


### C65 — final custom String qualification (2026-10-22)

210 independent cases qualify seven SimpleTraitField.custom targets through actual
release6.0.6/Foundry14.367 primitive methods and native sheet/language helpers. Source
strings and the verified missing blank default remain distinct from prepared fields.
Add concatenates the literal delta before cleaning; subtract removes the first exact
substring; override cleans its delta; upgrade/downgrade/multiply are no-ops. Language
labels retain their earlier cache while other trait custom labels read current fields.
A separate formatting shell qualifies current labels without replaying Actor phases.

[Record](evidence/2026-10-22-c65-final-custom-foundation.json) retains the frozen table, source/helper hashes and declared empty-Set/
constructor/presentation collaborators. All210 plus retained trait matrices PASS. This
is qualification only; runtime custom effects remain gated until C66 shared integration,
source invariance and consumer/recovery tests. Null/coercion, references, initial String
effects, conditions, Item phases and full native dispatcher/operator acceptance are
not qualified. Partial M0/M2 Q02a,DD-03/11/27/34,A03/A04 only; all full gates stay open.
Experimental0.4.1/compatibility/E01/E02/E04/widerQ00/E05 are unchanged.


### C66 disposition — literal final custom fields (2026-10-22)

C65's210 original inputs now pass module preparation;217 native/module comparisons
include seven canonical-prefix compositions. Source/default/current Strings and earlier
language caches stay distinct. Both layouts/cards use shared projections; mounted
intent retirement covers source identity/value and all three unavailable contexts.
Initial String effects, null/coercions, references, conditions and Item origins remain
gated. [C66 evidence](evidence/2026-10-22-c66-final-custom.json) records exact checks and
limits. The first repeated-change test had an incorrect explicit priority in its setup;
it was corrected without changing expected order or frozen cases. An isolated socket
closure is retained as failed evidence; a fresh complete public-host rerun passes. No
Core defect/dependency follows. DD-R01–07 stay corrected; full ADR acceptance is open.


### C67 — initial custom String phase qualification (2026-10-22)

238 independent initialized-field chains qualify initial custom text before language
preparation and final text afterward. The 217 earlier final cases remain retained.
Actual primitive/trait/sheet methods and a separate current formatter agree; the
condition oracle independently preserves native document/Character phase order.
[Evidence](evidence/2026-10-22-c67-initial-custom-foundation.json) records source hashes, frozen expectations and constructor/scheduling
limits. Native comparisons and explicit206-file typing PASS; runtime stays gated until
C68 source/default/projection/recovery checks. This is partial M0/M2 Q02a,DD-03/11/27/34,
A03/A04, not DataModel/installed/native/operator acceptance. Condition/Item composition,
null/coercions/references and wider formulas remain open. Experimental0.4.1/compatibility,
E01/E02/E04/widerQ00/E05 and fullADR gates are unchanged.


### C68 disposition — initial custom Strings (2026-10-22)

238 original inputs now pass shared preparation, including phase/priority chains and
source/default provenance. C28's unchanged Cant String input is supported separately
from Set syntax; its old unavailable disposition is superseded only for this profile.
The maintained historical test exposed that earlier gate expectation and now asserts
the actual independent label and receipt; no frozen inputs were rewritten. Cards and
both layouts agree through shared projections. [C68 evidence](evidence/2026-10-22-c68-initial-custom.json)
records before/after and checks. Conditions/Item origins/null/coercions/references remain
unavailable. DD-R01–07 and full ADR/native/operator acceptance remain as previously stated.


### C69 — single-condition custom String qualification (2026-10-22)

442 independent poisoned/exhaustion1–6 text-phase/source-mode cases pass actual
primitive, Actor condition/cache/build and language/sheet methods:2652 fresh checks
and442 initiative configurations, plus all retained native matrices. Initial/current
text and earlier labels remain distinct; text containing condition names grants no
immunity. Primary tool scope excludes selected-skill local modes. Explicit208-file
typing and a separate direct custom-trait capture PASS.

[Record](evidence/2026-10-22-c69-condition-custom-foundation.json) retains exact sources/fixtures and declared constructor, scheduling,
presentation-copy and dice-stub boundaries. Runtime stays gated until C70. No mixed/
immune/CI-changing conditions, Item origins, inferred statuses, broader expressions or
native/operator acceptance follows. Partial M0/M2 Q02a,DD-02/03/11/27/34,A02/A03/A04
only; experimental0.4.1/compatibility and E01/E02/E04/widerQ00/E05/fullADR remain open.


### C70 disposition — bounded condition/custom text (2026-10-22)

All442 original sources now pass shared preparation/execution. Current text and earlier
labels do not alter condition identity, immunity or cached adjustments. C66's original
Poisoned String input is supported with explicit independent assertions; its historical
restriction is superseded only for the qualified profile. All other unqualified condition/
Item/CI boundaries remain. The first C70 test assumed normal initiative: exact native
getInitiativeRollConfig includes ability-check mode, so442 independent fresh-mode
assertions were added without changing source inputs or earlier fixed scores. [Record](evidence/2026-10-22-c70-condition-custom.json)
keeps this test correction distinct from implementation defects. DD-R01–07 remain covered;
no Core defect, compatibility change or full native/operator acceptance is established.


### C71 — transferred Item initial custom-field qualification (2026-10-22)

686 independent cases pass exact release6.0.6 / static Foundry14.367 initial
collection, suppression and dispatch methods with actual primitive String and native
language/sheet methods. The table retains217 frozen initial String cases, crosses65
previously qualified Item eligibility/default inputs with seven fields, and adds14
Actor/two-Item priority and stable-order chains. Effect and owned Item identities,
source/default operands and earlier language labels remain distinct.

[Evidence](evidence/2026-10-22-c71-item-initial-custom-foundation.json) records exact source/artifact hashes, maintained regressions,
211-file explicit typing and2242/591 source inventory. Schema initialization and field
routing are declared collaborators; no full DataModel/Document boot, Item final
preparation, native dice or operator acceptance follows. Runtime remains gated until
C72 integration and consumer/recovery checks. Partial M0/M2 Q02a,DD-03/11/27/34,A03/A04
only; no full requirement closes. E01/E02/E04/widerQ00/E05, experimental0.4.1 and
compatibility remain unchanged. Conditions/Item-final/filter/formula compositions
remain dependency-ordered work.


### C72 — shared transferred Item initial custom text (2026-10-22)

C71's686 source/expectation rows are unchanged:434 active-effect cases fail before
and pass after admission;252 suppressed-Item controls already pass. Eligible identified
transferred Item Actor-target initial text now uses the shared String interpreter and
existing preparation/projection path. Receipts retain owned Item/effect identity and
source/default provenance. Initial language labels include the result; source and
canonical identities remain unchanged. C68's original Item-only negative input now has
explicit positive Added/receipt assertions, preserving its historical input/evidence.

[Evidence](evidence/2026-10-22-c72-item-initial-custom.json) separates regressions, pinned initialized native methods,
mounted SDK consumers, public host execution and isolated managed packaging. Checks:
51 module/9 tooling suites,61 tooling assertions;212 explicitly typed files;2242/591
source inventory;686 native Item text cases and retained condition/trait matrices;
1374 desktop/mobile current-field states plus16 selected skill/tool/alternate-ability
states;300926 accepted public requests,1 known candidate rejection,40 bounded equal-index
diagnostics and0 native writes;module check/package PASS. The full retained mounted
run is recorded there separately. Eligibility, identity/value, context loss/recovery
and held callbacks require fresh intent. No unavailable behavior counts as rules support.

This supersedes the blanket initial Item-custom gate only for the qualified
condition-free profile. Item final preparation, Item/condition composition, dependent
filters/riders, missing identities, null/coercions, references and broader expressions
remain unavailable. Partial M2/Q02a,DD-03/11/27/34,A03/A04/A18/A21 only;all full ADR gates
and E01/E02/E04/widerQ00/E05 remain open. Experimental0.4.1 and compatibility unchanged;
no installed/native/operator or release acceptance. Next qualify bounded Item final
preparation before admitting transferred final Actor fields; existing phase trace stubs
alone are insufficient. Continue independent M2 filter/formula work in dependency order.


### C73 — empty-feat final preparation qualification (2026-10-22)

434 independent cases retain217 frozen final String/cache results with missing or
explicit empty feat activities/uses. Actual Item final attributes/proficiency/labels,
feat getters/final data, Activities final data and UsesField methods run inside actual
Actor initial/final dispatch. Proficiency3/multiplier1 and empty uses value0/labels agree.
No formula replacement, dice, activity or recovery execution is allowed. Earlier
language labels remain separate from final current text.

[Record](evidence/2026-10-22-c73-feat-final-foundation.json) includes source hashes and213-file explicit typing. Initialized
empty collections/uses and Item roll data/spellcasting collaborators remain declared;
this is not full source DataModel boot or general Item/native/operator acceptance.
Runtime stays gated pending C74 source/poison/consumer integration. Partial M0/M2 Q02a,
DD-03/11/27/34,A03/A04 only;full ADR/E01/E02/E04/widerQ00/E05 remain open.


### C74 — shared empty-feat final custom text (2026-10-22)

All434 unchanged C73 profiles fail before/pass after admission through the existing
final String interpreter, snapshots and shared projections/compiler. Each receipt keeps
owned Item/effect identity and source/default/operand phase. Current text differs from
earlier language labels without replaying preparation. The original C72 final-Item
negative input is retained with positive current-text/earlier-label/receipt assertions.

The recipe is deliberately bounded:unique identified condition-free feat,missing or
empty activities,absent/0 uses.spent,absent/blank uses.max,and absent/empty recovery.
Other persisted system fields (including description) currently require further final
preparation qualification. Prepared-looking prof/getter/uses.value/label fields do not
supply overrides. General feats/Items,activities/configured uses,conditions,dependent
filters/references and other transferred final field types remain gated.

[Evidence](evidence/2026-10-22-c74-feat-final-custom.json) records52 module/9 tooling suites and61 assertions,215 explicit
typed files,2242/591 source inventory,434 final/686 initial Item native cases and retained
condition/trait matrices,870 both-layout consumer states plus16 selected skill/tool/
alternate-ability states,311776 public accepted requests/1known candidate/40bounded tie
index diagnostics/0native writes,and isolated check/package PASS. A suppressed-tool
negative setup was corrected to equipped:true;the frozen434 inputs are unchanged.
The first package check caught a CLI console log;it now uses process.stdout. Failed logs
are retained;neither finding establishes a Core defect. Source preservation,poison,
recipe/context recovery and held-callback fences pass. C72's full retained mounted run
also completed and is recorded separately against C72 code,not recaptured as C74.

Partial M2/Q02a,DD-03/11/27/34,A03/A04/A18/A21 only. Experimental0.4.1 and compatibility
unchanged;all full ADR/E01/E02/E04/widerQ00/E05/native/operator gates remain open.
Next qualify bounded nonempty feat uses/defaults and final preparation collaborators,
then extend the source recipe through shared fields/projections before general Item
final support. No resource writes follow until the E02 conflict/receipt gate is resolved.


[C71–C74 checkpoint index](evidence/2026-10-22-c71-c74-checkpoints.json) records full commit/evidence identities,
completed validation and final package hash. All owned fixtures are stopped;Core baseline
clean. C72 retained full UI and C74 focused consumers remain distinct evidence. No full
ADR/native/operator/release gate closes;continue bounded feat uses/final qualification.


### C75 — shared Item read surfaces (2026-10-22)

One owned-Item preparation model now supplies resources, inventory, features,
activities, cards and live Item/spell details in both layouts. Parent Item and
activity counters remain separate. Numeric capacities/defaults/recovery metadata,
physical quantity/unit weight, native weapon attack arithmetic and canonical spell
metadata replace UI guesses. The same weapon fixture displayed +7 before and +6
after; its independent Item/activity remaining counts are 2/3 and 1/2. Container
quantity projects native1 while preserving source2; no contents-weight guess is made.
Modern activity/casting execution remains gated for M4/M5.

[Evidence](evidence/2026-10-22-c75-item-read-surfaces.json) records53 module/9 tooling suites,61 assertions,220 explicitly
typed files,2242/591 source inventory,108 resource/6 attack/7 container native-method
cases,1440/390 mounted consumers/removal/context recovery and isolated check/package
PASS. Formula-based capacity remains unavailable. Current-source modal lookup and
Item-target effect gates prevent stale/unsupported readouts;source is unchanged.
These are regression,controlled initialized-method,mounted SDK-seam and packaging
evidence,not installed/native/operator acceptance. C74 public-roll evidence is
retained separately;C75 changes no roll compiler. Partial M2/DD-01–06/11/27/31/34
and A02–A06 read preparation only. ADR-0001 stays open;next initialize sparse
ability/skill source mappings before broadening formula and Item final preparation.


### C76 — shared sparse source initialization (2026-10-22)

The shared pre-effect initializer now creates the6 standard abilities and18 native
skills from absent/empty mappings. Missing abilities receive score10/save coefficient0;
missing skills receive the keyed registry ability and proficiency0. An existing partial
skill receives RollConfig's dex default instead. Source/prepared-looking fields never
supply derived overrides. Initial filters,checks/saves/tools,passives,AC/initiative,
health/movement and attacks consume the same detached operands and default provenance.
Explicit malformed values remain unavailable;missing tools are never granted.

[Evidence](evidence/2026-10-22-c76-source-initialization.json) records the same-input 0/0 →6/18 regression,4 pinned schema/default
profiles and native arithmetic,54 module/9 tooling suites/61 assertions,222 explicitly
typed files,mounted1440/390 selections/recovery/held callbacks,311953 public-host
requests including144 new default requests,and isolated check/package PASS. Full
retained mounted checks are pending at this checkpoint and are not claimed passed.
Historical initialized-method fixture JSON is preserved. Its missing-source assumptions
are explicitly superseded in maintained source expectations:CON10/HP8,STR10/jump5,
DEX10/initiative0 and Dodge save+0;missing standard skill becomes untrained. This is
partial M2/A02–A04/A18/A21,not native/operator acceptance. Next address deterministic
formula/reference preparation across shared readouts;full ADR gates remain open.


### C77 — shared deterministic source formulas (2026-10-22)

Qualified FormulaFields now share one pure arithmetic/reference preparation pass,
with source expressions retained in receipts. Checks/saves/tools/passives,AC,
movement,HP bonus fields,damage adjustments,Item/activity uses and numeric attack
readouts consume prepared results. Fresh d20 bonuses use current score references
with earlier modifiers;passives and Item final operands retain their earlier phase.
The unchanged source fixture moves from unavailable to Perception11/passive23,
tool13,AC16,walk30 and Item/activity counters5/7 and1/2. With a later score change,
prepared23/current25/passive35 and earlier Item capacity remain distinct.

[Evidence](evidence/2026-10-22-c77-deterministic-formulas.json) records26 independent frozen native math/reference cases,
56 module/9 tooling suites,61 assertions,227 explicitly typed files,2242/591 source
inventory,both-layout mounted previews/selected abilities/recovery/held callbacks,
311995 public-host requests (42 new formula requests) and isolated check/package
PASS. Full retained mounted execution is pending here;C76's failed range assertion
and corrected hover/focus setup remain recorded. Public case generation is now async
so the synthetic transport stays responsive;the earlier closed-host attempt is
retained without alleging a Core defect.

Supported arithmetic is +,-,*,/,%,parentheses and floor/ceil/round/abs/min/max with
explicit numeric prof,details.level and standard ability value/mod bindings. New
d20 expression results use bounded multiples1/1024;other fractions stay gated.
No dice evaluator,eval,private imports,missing-reference zero or source writes.
Broader grammar/scaling/class references and expression/effect composition remain
unqualified. Historical source fixtures are preserved while newly qualified source
expectations explicitly supersede their earlier blanket-expression gates. Native
methods use declared deterministic Roll collaborators,not full parser/runtime boot.
Partial M2/Q00 only;ADR/full acceptance and experimental metadata remain unchanged.


### C78 — class/default and numeric scaling dependencies (2026-10-22)

Persisted class/subclass and ScaleValue identities now supply qualified numeric
formula dependencies. Scale lookup follows class level,sparse/null inheritance,
zero values and primary/secondary restrictions;subclass lookup uses its exact
linked class,not total Actor level. Missing class levels initialize native1 and
feed the same facts,filters,health and references. Old prepared scale/class fields
are ignored without changing source. Missing,ambiguous,nonnumeric or dependent
grant/root data remains unavailable;unknown references identify their exact path.

[Evidence](evidence/2026-10-22-c78-class-scales.json) records21 native scale levels/126 restrictions,subclass3 versus
Actor8,default class1 and actual native namespace/replacement methods;57 module/
9 tooling suites,61 assertions,230 explicit typed files,both-layout mounted current
resources/checks/recovery and9866 public-host requests in a declared dependency
profile (15 new scale requests),plus isolated check/package PASS. The profile keeps
complete d20/Normal-bound distributions;C77's full311995 host run stays separate.
C77's full retained desktop/mobile suite also completed;its artifact/counts are
supplemented in the historical C76/C77 records without relabeling runtime capture.
No complete source DataModel,installed UI,native/operator or advancement-write
acceptance follows. Partial M2/Q00 only;ADR-0001 remains open.


### C79 — fresh roll reference correction (2026-10-22)

Pinned builder comparisons found a module defect in C77's fresh `@prof` binding.
BasicRoll.constructParts replaces root prof with a proficient check's term;an
untrained check retains Actor base prof. The same half-profile source rolled+9
before,where native construction requires+7;expertise rolled+14 instead of+17.
The shared compiler now resolves original roll expressions after current selection/
proficiency validation. Earlier prepared9/14 and passive21/26 remain unchanged.
Selected tool expertise19 and prepared ability12/current15 are also covered.
This supersedes C77's blanket fresh Actor-base substitution,not its prepared math
proof. No Core/SDK change or native support expansion is implied.

[Evidence](evidence/2026-10-22-c79-formula-roll-context.json) records8 native profiles/8 selected tools/1 ability build,
58 module/9 tooling suites,61 assertions,231 explicitly typed files,both-layout
half/expertise/clearing previews and stale-callback/context recovery,9878 public
requests (12 new reference-context requests) and isolated check/package PASS.
Old/incomplete formula context rejects execution. Notes report earlier/current
numbers without assuming every difference comes from effects. Source is preserved.
Controlled initialized native builders,mounted SDK seam and synthetic host evidence
remain separate from installed/native/operator acceptance. Partial M2/Q00 only;
next finish independent proficiency-dice qualification and other M2 exit work.


### C80 — proficiency-dice preparation and qualified Normal execution (2026-10-22)

The shared Actor/check model separates the known proficiency base,prepared check
subtotal,flat passive contribution and symbolic roll term. Dice mode now prepares
skills/tools/checks/saves with native half,ordinary and expertise terms;cards and
both layouts display the die instead of implying a flat bonus. Normal execution
uses public roll primitives,including existing Normal bounds and qualified numeric
situational bonuses. Fresh dice-bearing references remain unavailable rather than
being folded to prepared flat values. Fractional dice count1.5 and proficiency-dice
advantage/disadvantage remain unqualified;manual Normal is available when independently
valid. The plain-d20 DD-R05 equivalence is unchanged and is not extended here.

[C80 evidence](../audits/evidence/2026-10-22-c80-proficiency-dice.json) retains30
pinned initialized-model profiles and120 actual module-compiled public-host profiles:
45400 Normal requests/all120 complete distributions,plus800 explicitly unqualified
adv/dis diagnostic probes. Source data is unchanged;mounted desktop/mobile controls,
preview/direct/shortcut agreement,context recovery and held callbacks are covered.
These are separate regression,controlled native-method,mounted SDK-seam and isolated
host results,not installed/native/operator acceptance. Full M2/Q00 and ADR remain open.


### C81 — shared embedded physical preparation (2026-10-22)

One shared model now prepares nested Item totals,container contents/count/capacity,
Actor and container currency,unit conversion and source-only carrying thresholds.
Both inventory layouts and current Item details format this model. Containers count
once in Actor weight;weightless contents still occupy capacity. Currency is rounded
by denomination before weight. Native mixed-unit container currency/capacity behavior
is preserved,including capacity labels using their declared units. Raw nonpersisted
encumbrance and totalWeight poison never supply overrides. Powerful Build's Boolean
carrying-size effect is independently qualified;this does not infer a feature grant.

[C81 evidence](../audits/evidence/2026-10-22-c81-physical.json) records same-input
missing →26lb,weightless13.5lb,metric9.7kg and currency-off20.5lb comparisons against
actual pinned methods/configuration,12 size/Powerful Build thresholds and16 unit
conversions. Malformed quantities,units,coins,capacity,broken/cyclic identities and
unqualified Item effects remain explicit unavailable profiles;unidentified container
contents/capacity are conservatively hidden. Mounted1440/390 current details and
context/source recovery are separate from controlled-source and regression evidence.
No inventory writes,automatic encumbrance status synchronization or live/native
acceptance is introduced. Non-none encumbrance check/condition execution remains gated
pending status-effect qualification;known source-only weights remain truthful.
Partial M2/DD-03/06/09/11/24/27/31/34,A02–A06 read preparation;full M2/ADR remain open.


### C82 — prepared combat modifier dependencies (2026-10-22)

A shared read model now prepares all6 ability attack bonuses/DCs,Actor spell
attribute defaults and4 damage bonus scopes from qualified source formulas and
earlier modifiers. Native prepared attack remains flat in proficiency-dice mode;
this does not authorize random proficiency activity execution. Blank spellcasting
ability uses the proven native base-proficiency/8+proficiency defaults,while unknown
or malformed requested abilities stay unavailable. Prepared-looking attack/DC/spell
source fields are ignored;legitimate persisted bonus expressions remain authoritative.
Spells/Actions in both layouts and spell cards format the same model. Existing Item
casting/consumption execution gates and legacy projection boundaries are unchanged.

[C82 evidence](../audits/evidence/2026-10-22-c82-combat-modifiers.json) records
108 independent pinned native attack/DC/default profiles and16 actual damage-part
builds. Native damage scope follows action type (including thrown weapon remapping)
and applies its global/Item bonus to the first part only. The read model preserves
scope expressions;activity-specific references such as @mod remain unavailable until
resolved by a qualified activity configuration. Per-spell class/ability eligibility,
activity save/DC construction,damage/scaling/critical execution and broader expression/
effect profiles remain later dependency work,not completed casting support.

The exact settings comparison also corrects C81's `standard` spelling to native
`normal`. The same source formerly returned unavailable carrying thresholds in normal
mode;none/normal/variant now retain26lb/150lb with their exact selected identity.
This was a module defect,not a Core limitation. Unknown settings remain unavailable.
Regression,initialized native-method,mounted SDK-seam and managed package results
remain separate;full M2/ADR/native/operator acceptance remain open.


### C83 — stored encumbrance status preparation (2026-10-22)

Actor-owned base effects with qualified stored encumbrance statuses now share native
initial status collection,physical check/save modes,passives and movement preparation.
None/normal/variant settings are admitted without inventing statuses from weight.
Heavily Encumbered gives physical disadvantage;selected mental abilities remain
independent,and combined proficiency advantage cancels source disadvantage. Source
order is retained when typed Poisoned,Exhaustion or Prone effects compose with the
base source. Disabled/false guards remain inactive;unsupported status/rider/change/
magic/dependent-filter profiles stay unavailable. Existing range and proficiency-dice
execution limits remain distinct from these prepared facts.

[C83 evidence](../audits/evidence/2026-10-22-c83-encumbrance.json) records140 pinned
native source-phase/configuration profiles,420 source/context regressions,actual both-
layout condition/movement/roll consumers and11930 isolated public-host requests
(2052 new encumbrance requests). The retained plain-d20/Normal-bound distributions,
ordered faces,entropy,counts/discards/totals and40 equal-index diagnostics are unchanged.
No source,weight-derived status synchronization or native/operator writes occur.
This supersedes C81's blanket non-none setting gate for the qualified profile.
Remaining Item-final/filter/expression/activity dependency gates keep M2/ADR open.


### C84 — Item final dependencies and attack-reference correction

[C84 portable evidence](evidence/2026-10-22-c84-item-final.json) qualifies per-type
Item proficiency and parent-before-activity resources. A later Actor tool target0
leaves cached Item proficiency6 and counters9/11 while current tool check is +2.
Source poison never overrides those phases. Native attack construction, unlike an
untrained skill, rebinds root `@prof` even when Item proficiency is0: same-input +5
before becomes native +2. Earlier resources/current Actor references are compared
separately (+36 mixed-phase example). C77's blanket attack-root claim is superseded;
its literal/arithmetic evidence remains historical. Broader final/effect/activity
preparation is still open;no installed/native/operator or action-write acceptance.


### C85 — shared conditional applied rules

[C85 evidence](evidence/2026-10-22-c85-applied-rules.json) replaces blanket applied-rule
rejection for the qualified serialized Actor/transferred-rule profile. Same-input
check bonus2 failed before (null versus7);afterward fresh skill7/passive17. Final
bonus4 changes current roll to11 while passive stays17. Collection,overrides,
suppression,selection-dependent guards and Normal bounds follow pinned methods.
Expertise-bound root prof resolves before constructor substitution;Item attack
proficiency-filter data remains distinct from Actor prepared attack data. Unsupported
filter snapshots/Item-local effect remapping/dice expressions retain explicit gates.
This is partial M2/Q02a,not full native/operator/installed acceptance.


### C86 — modern Boolean feature read dependencies

[C86 evidence](evidence/2026-10-22-c86-read-flags.json) adds320 pinned initialized
profiles and the corresponding immutable-source/poison/context regressions for
Diamond Soul,Tool Expertise,Observant and Remarkable Athlete. Same-input ordinary
flagged checks were unavailable before;source-only profiles now expose independently
expected totals/passives/proficiency/modes. Tool Expertise does not double a later
global check target:raw0/check1 stays1,while raw0/tool1 becomes2. Modern Remarkable
Athlete grants no half proficiency. Earlier initial scalar/Set flag-only gates are
explicitly superseded with additional expected facts,without rewriting old JSON.
Other flags,flag-writing effects,legacy expansion and full M2 acceptance remain open.


### C87 — retain known reads while qualifying execution separately

[C87 evidence](evidence/2026-10-22-c87-remaining-flags.json) supersedes the historical
Halfling Lucky blanket numeric refusal: same source keeps Perception5/passive15 and
level5/card proficiency3,while direct/shortcut/modal reroll execution stays blocked.
Normal Reliable Talent uses the existing range compiler after validating current
primary value;final primary0 can disable its minimum without erasing cached prof,
and final primary1 can enable minimum10 on an otherwise untrained fresh check.
Enhanced dual-wielding modes and armor-speed flags share the Item/movement models.
261 controlled native profiles and4160 new isolated public requests retain independent
expected values and actual host serialization. Broader effect/flag/dice and M2 gates
remain open;no new Core defect or compatibility change is asserted.

### C88 — flags,permanent source defaults and applicability

[C88 evidence](evidence/2026-10-22-c88-effect-flags.json) records3,024 native Boolean
flag/phase profiles,50 applicability rows and24 permanent duration rows. Same-input
nontransfer template previously blocked ordinary+5;now retains+5,while eligible
base transfer gives+7. Final Jack affects fresh+3 while earlier passive remains12;
initial Jack gives passive13. Source data and historical evidence are unchanged.
Old blanket nontransfer/valid permanent-start refusals are explicitly superseded;
malformed starts,timed effects,dependent references and applied enchantments remain
gated. Actual mounted consumers and isolated public execution are separate from
controlled native-method evidence. No new Core defect or full M2/ADR acceptance.

### C89 — FormulaField expression/effect composition

[C89 evidence](evidence/2026-10-22-c89-formula-effects.json) adds120 operation,
960 preparation/fresh and20 scope comparisons. The unchanged empty-bonus multiply
source previously made even+2 unavailable;qualified composition now preserves it.
An expert's raw@prof+1 with final multiply2 prepares+12/passive22 but rolls+22;
half proficiency with initial multiply2 prepares+11/passive21 but rolls+7. These
are actual native builder results,not formulas extrapolated from prepared totals.

Named historical constant/final-bonus expression restrictions are supplemented;
the old JSON evidence is unchanged. Missing references,random expressions,unsupported
fractions,malformed source,Item-final and unrelated fields remain gated. Current
invalid expressions cannot restore earlier execution. Controlled source,mounted
SDK seam and isolated host evidence remain separate from installed/native/operator
acceptance. Partial M2/Q00/Q02a only;no Core defect or compatibility decision.

### C90 — class/prepared/current Actor proficiency and nonarmor gear

[C90 evidence](evidence/2026-10-22-c90-base-proficiency.json) adds192 native phase/
root/cached-term profiles and7 nonarmor AC cases. Same+1 source formerly blocked
all checks;current+4 and correct earlier/current numbers now agree across consumers.
A final expert check keeps prepared11/passive21 but rolls18;cached save8 and Item
flat6 remain. Current unqualified base no longer erases a known earlier passive.
Raw prof99 remains ignored. Named historical @attributes.prof defense-reference
refusal is supplemented by native3,not changed in the original capture.

Equipped wondrous/clothing/ring/rod/trinket/vehicle/wand sources are not armor;
formerly they incorrectly gated ordinary stats. Exact SRD Mastery Stone source
eligibility now gives+3→+4→+3 across attunement changes without source mutations.
Native method,regression,mounted SDK-seam and isolated-host evidence remain distinct.
Nonpositive/fractional bases,unguided reference/compound deltas,wider die execution,
other Item/effect/scene profiles and full M2/ADR acceptance remain unqualified.

### C91 — correct final Item suppression and attunement reads

[C91 evidence](evidence/2026-10-22-c91-equippable-final.json) records the unchanged
+5-before/+6-after reproduction and240 independently expected native phase cases.
Initial source suppression no longer silently suppresses a final effect after
Equippable cleanup changes eligibility. Initially suppressed/unqualified final
recipes now reject execution. Only the qualified no-activity/no-counter Actor-prof
composition is enabled;other final target/condition/range profiles stay explicit.

Source attuned=true can prepare false without a persistence write. Shared inventory
badges,live Item detail controls,Actor capacity and cards now use prepared values;
raw Actor count99 is ignored. Actual mounted source changes retire held roll intent
when totals remain equal;context loss/recovery does not replay. No new Core defect,
full Item/Activity lifecycle,installed/native/operator or full M2 acceptance claim.
