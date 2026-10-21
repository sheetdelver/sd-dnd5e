# ADR-0001 verification and completion evidence

Status: implementation in progress, 2026-10-19. Governed by [ADR-0001](../adr/0001-complete-character-lifecycle.md); requirement definitions are [DD-01–36 in the audit](../audits/2026-10-19-character-lifecycle.md). Native oracle and source paths are in [the 6.0.6 map](../reference/native-6.0.6.md). No live acceptance is claimed here.

## Evidence classes

Keep these separate in every checkpoint:

| Class | Establishes | Does not establish |
| --- | --- | --- |
| R — behavior regression | Same defect input fails before correction and passes after; existing intended behavior retained | Native rules correctness when expected output merely reproduces old code |
| S — source-derived independent oracle | Versioned upstream schema/algorithm or manually derived expected value, independent of the implementation under test | Complete Foundry runtime behavior, hooks, transport or browser preparation |
| I — isolated public Core integration | Public module contract, caller handling, real stores/action routes, exact package/receipt behavior in an isolated host | Native backend or actual-world parity when storage/transport is simulated |
| U — rendered interaction | Real installed Core layout, events, focus, accessibility, mobile/desktop state and errors | Correct rule computation or persisted native state without independent comparisons |
| N — native comparison | Exact supported Foundry/system build, real source/prepared data and native action behavior independently observed | Arbitrary untested extensions, releases or configurations |
| O — operator acceptance | User can complete intended workflows and understand failures/recovery/boundaries | Exhaustive rules parity by visual approval alone |

Current R/S and packaging evidence is recorded in C01–C05 and independent RV01/RV02 below. RV02 confirms the original corrections and qualifies C05's card availability and source-phase claims. No milestone has native acceptance yet. Don't backfill an N result from an R/S/I run or a sibling module's acceptance.

## Fixture format and acquisition

M0 should create module-owned `tests/fixtures/native-6.0.6/` and a provenance index. Each fixture records:

- Stable fixture ID; linked DD/A/M IDs; expected result author/method.
- Foundry generation/build, D&D exact release/commit, Core and module version/commit/archive hash, capture date and rule profile.
- Relevant native world settings, source pack/document UUIDs, source edition/book/license and accessible role configuration. No credentials/session cookies/private purchased text.
- Separate untouched **source before**, independent **native prepared** fields, action intent/choices/roll outcomes, **source after**, and ordered receipts/messages/effects. Source values and prepared results must not be merged into one fake source Actor.
- Exact fields compared and any explicitly excluded nondeterministic timestamp/transport data. Never ignore IDs, advancement links, quantities, effects or ownership just to obtain equality.
- Full dependency closure for grants/linked activities/spells/containers/transformations; hashes and canonical IDs; no name-based resolution.
- Expected errors, unsupported states and source-preservation assertions as first-class outcomes.

Use captured SRD content or synthetic records matching the native schema. Test harnesses may execute controlled native pure methods with reviewed stubs and record that as **S**, not **N**. Native browser evaluation is a test oracle only, in a separately approved disposable world; it must not become an application dependency or revive the parked runtime experiment.

### Representative fixture families

| Family | Required cases / independent expectations |
| --- | --- |
| F01 basic PCs | Sparse persisted source; every ability; all skills/tools; proficiencies 0/half/1/expertise; levels 1/5/9/13/17/20; configured proficiency dice; explicit versus derived HP/AC/initiative |
| F02 equipment/effects | Armor/shield/unarmored/custom AC, finesse/thrown/ranged/versatile/offhand, mastery, ammo, attuned/unequipped/unidentified items; conditions/exhaustion; initial/final/conditional/transfer effects and suppression; source inspiration toggle with truthful roll guidance |
| F03 caster profiles | Prepared divine, Wizard spellbook, known/prepared arcane, half caster, subclass/third caster, pact caster; feat/species/item casting; one/multiple abilities, slots overridden, multiclass rounding and granted spells |
| F04 lifecycle | All 12 bundled modern classes/subclasses at each level 1–20; ASI/feat/subclass thresholds; original versus additional class; legal/illegal multiclass; higher-level creation; post-20 boon settings; modify choices with recursive grant origins |
| F05 resources | Mixed class hit dice, HP/temp/max reduction, death saves/revival, concentration checks, short/long/day/dawn/dusk recovery, normal/gritty/epic settings; item/activity spent/max/recovery; quantity destruction and refund where native supports it |
| F06 content | SRD-only, partial optional collection, unfamiliar pack ID, readable world homebrew, duplicate names/editions/owned copies, custom source-less Item, missing pack/reference, permission loss, malformed/cyclic references, unknown activity/advancement types |
| F07 editions | Modern world + modern docs; modern world + explicitly supported legacy/mixed docs; legacy world with native branches; old system-version refusal. Full legacy/v13 qualification only if selected; preservation still mandatory |
| F08 outcomes | Pre-write stale source; timeout before/after dispatch; acknowledged create then bookkeeping failure; unknown Item ID; readback mismatch/delay; crash/restart; duplicate intent/key; conflicting native edit; loss/regain ownership; late old response |
| F09 companion/types | NPC form for PC-linked summon/transform, exact origin/reversion, denied target, missing template; other Actor types read-only/unsupported; no guessed PC values or implicit canvas operations |

For F04, enumerate 12 × 20 level states at minimum, plus their ordered advancement transitions. Checking only levels 1/5/20 or one successful create is not full lifecycle coverage. Shared algorithms may use parameterized cases, but each class's content dependencies and grants need an independent expected record. Optional purchased classes/subclasses require compatible-schema tests when installed; no promise to verify books unavailable to the tester.

## Acceptance matrix

Every row is **planned/open**. Record implementation commit, exact package hash, test identifiers, native oracle identity, result and qualifications when executed. A failed dependent feature is not excluded because a later milestone hasn't been implemented.

| ID | Requirement / milestone links | Acceptance and failure cases | Required evidence |
| --- | --- | --- | --- |
| A01 | DD-18–21; M0/M6/M9 | Dashboard tool → guided level-1 create → owner readback → native sheet; all modern classes/origins, fixed and chosen grants, complete metadata; back/cancel/invalid choice write nothing | R/S/I/U/N/O |
| A02 | DD-01/02/06/34; M2 | Ability/save/skill/tool/passive and bonus/dice proficiency agree across all consumers; missing data unavailable; source deeply unchanged | R/S/I/N |
| A03 | DD-01/03/04/34; M2 | AC, HP maximum, total/class levels, initiative, movement/senses and overrides match native source preparation; no fallback fabrication | R/S/I/U/N |
| A04 | DD-05/06/31; M2/M4 | Effects/conditions/defenses/mastery and native phase/priority/eligibility; modern/legacy/exhaustion-disabled branches; removals restore results | R/S/I/N |
| A05 | DD-10/11/27; M4 | Select exact weapon/activity/mode, resolve native attack/damage/crit/ammo/mastery; consume correct owned record, respect visibility, one roll/card per intended phase | R/S/I/U/N |
| A06 | DD-04/05/10/25; M4 | Save/check/heal/damage/utility, resistances/immunities/vulnerabilities and authorized target handling; unsupported scene targets explicitly diagnosed | S/I/U/N |
| A07 | DD-09/25; M3 | Add/edit/equip/attune/identify/move/split/delete exact owned Item, containers/currency/weight; cycles/limits/denied writes rejected; native quantities and links match | R/S/I/U/N |
| A08 | DD-04/07/08; M3/M4 | Spend appropriate class HD and recover correct HP/HD/resources/slots/uses/effects for each selected rest/new-day variant; failures never reported complete | R/S/I/U/N/O |
| A09 | DD-08/10/35; M4 | Formula max/spent uses, activity versus item counters, depletion, ammo/material supply, recharge and native-supported refund; invalid/missing targets block before writes | S/I/N |
| A10 | DD-10/36; M4/M7 | Every built-in activity type has explicit implemented or broader-scope disposition; cast/forward recursion, enchantment dependencies, summon/transform intent verified; unknown types preserve source | S/I/U/N |
| A11 | DD-12/13/16; M5 | Owned spells remain visible independently of catalog access; preparation/spellbook/known grants and limits, correct slots/pact pools and multiple abilities | R/S/I/U/N |
| A12 | DD-13/14/31; M5 | Full/half/third/pact/multiclass native progression, preparation changes, upcast methods, rituals and material/slot consumption; no class-name grant inference | S/I/U/N |
| A13 | DD-04/05/14; M4/M5 | Concentration start/replace/check/end, death saves/HP boundaries, origin and effect cleanup; correct native order and denied target handling | S/I/U/N |
| A14 | DD-12–16/26; M1/M5 | Source removed/access revoked/context changed while spell modal open: current owned data retained, dependent intent retired, retry reloads without stale response resurrection | R/I/U/N |
| A15 | DD-19/21/22/31; M6 | F04 complete class-level matrix, subclass/ASI/replacement/HP/grants; valid/invalid multiclass and higher-level creation; Foundry resumes next advancement correctly | S/I/U/N/O |
| A16 | DD-20/25/35; M3/M6 | Double submit/same key changed intent; zero-write reject/restart; partial/unknown writes fenced; acknowledged IDs retained; exact source readback; no duplicate after crash/restart | R/I/U/N |
| A17 | DD-15–17/25/31; M1/M6 | SRD-only/partial premium/custom sources; pack discovery unfamiliar IDs; owner/observer/limited/none; denied content absent from payload; same-name editions distinguished; dependencies reauthorized at commit | S/I/U/N |
| A18 | DD-24–26/35; M3/M7 | Ownership-only list invalidation, native edits, world/settings change, reconnect/loss, stale dialog and late response; manual unrelated draft retained, invalid intent discarded; no false saving success | R/I/U/N |
| A19 | DD-17/25/28; M3/M7 | Identity/appearance/biography/native links and module notes persist correctly; settings/drafts scoped by world/user/Actor; unsafe HTML/URL and secret/unidentified descriptions do not leak | R/S/I/U/N |
| A20 | DD-20/22/35; M3/M6 | Draft create/advance resume, dependency changes, source-version mismatch, cancel before/after dispatch, current native edits; journal/status readable only to authorized caller, no guessed rollback | I/U/N/O |
| A21 | DD-23/24/27/32; M7 | 360/390/768/1440px, light/dark, keyboard-only, visible focus/labels, zoom, no overflow/tool overlap; nested shared content/roll modal cleanup, no duplicate chat/dice | U/O plus I contracts |
| A22 | DD-29/30/33; M8 | Dev and managed archive on selected minimum/current Core; source map/types/boundaries, package license inventory, no private packs/browser requirement; migration if proven necessary | I/U/N for any migration |
| A23 | DD-31/32/36; M7 | Primary/mixed/legacy boundary and non-PC/companion capability states truthful; reject unsupported system changes before mutation; preserved data; scoped scene/Bastion decisions visible | S/I/U/N/O |
| A24 | All; M9 | Operator completes create → advance → play → rest → reconnect → recovery on exact released package; every scoped gate closed; experimental removal separately approved | N/O with full ledger |

## Execution ladder

1. **Offline:** immutable source and native schema fixtures; compare expected values/plan steps independent of module output. Reproduce confirmed bugs before correction. Test function permutations only where native ordering makes them relevant; prioritize complete player workflows.
2. **Isolated Core public integration:** dedicated data directory/config, packaged module, separate caller roles; actual REST/module APIs and primary store/readiness behavior. Inspect process/listener ownership before starting services. Never load root production settings by default.
3. **Rendered actual host:** use actual providers/theme/appearance/shared overlays and SDK document events; exercise interactions and persistence responses. Static SSR tests remain useful but cannot replace mounted controls.
4. **Disposable native:** obtain current endpoint/world/build/full-GM service-account identity, scoped fixture/account/pack writes and cleanup authorization; record backup limitation acknowledgement where maintenance writes require it. Don't inherit old Shadowdark/Mörk Borg approval. Keep native oracle and SheetDelver caller sessions separate; avoid session interference.
5. **Operator:** demonstrate ordinary play and understandable failures with the final archive; reconcile any reported discrepancy against exact sources. Native permissions and stored source, not a green notification, decide success.

Use current release 6.0.6 on generation 14 first. If full 2014 profile or v13/5.3.3 is separately selected, add a distinct versioned capture and acceptance ledger; do not switch versions repeatedly before finishing the current version's complete selected matrix.

## Toolchain and commands

Current module commands, run from a configured Core checkout (no server required):

```sh
npx tsx data/local/modules/dnd5e/src/tests/prepared-actor.test.ts
npx tsx data/local/modules/dnd5e/src/tests/presentation.test.ts
npm run module:check -- dnd5e
```

Only the first two and the explicit typing below were run in this planning phase. Current CI pins Core v0.18.0 and Node 22.x; Core contribution guidance calls for Node 22.12+. Record actual Node/npm/compiler versions when running future matrices. The reusable release workflow must use the same selected released host as CI; no workflow dispatch/release helper is needed for ordinary verification.

Explicit typing procedure (the audit used this shape): create a temporary JSON config extending the absolute Core `tsconfig.json`; set `compilerOptions.noEmit=true`, `incremental=false`, `typeRoots=[<Core>/node_modules/@types]`; populate `files` with **every** `.ts`/`.tsx` under this module's `src` and `module`, plus migration hooks when added; set `include:[]`, `exclude:[]`. Run Core's `node_modules/.bin/tsc -p <temporary-config>`. Confirm the resulting file list includes the module UI/server/logic/hooks, not just entry files. M0 should make this a maintained module script with tests/CI coverage; `node scripts/typecheck.mjs` is a proposed future command, not currently present here.

Packaging from Core must use an isolated data root with this module under `local/modules/dnd5e`:

```sh
npm run module:check -- dnd5e --data-dir /absolute/path/to/isolated-data
npm run module:package -- dnd5e --data-dir /absolute/path/to/isolated-data
```

Inspect the pinned tool's CLI when preparing that environment; generate managed aliases in the isolated checkout as needed. Do not run setup generation against root production configuration to fill missing fixtures. Record archive SHA-256 and observed loaded module/host identity in installed tests. Module checking bundles/import-scans but is not a rules oracle.

M0 should add a maintained runner enumerating the growing module suites, a native-source comparison runner and installed/browser harness entry points with documented options. Commands must fail on a missing oracle, unsupported version or skipped required suite, not print a generic “parity PASS”. Keep test-only browser tools out of application dependencies and ensure all test processes terminate or are explicitly recorded.

## Completion / release gate

To remove `experimental`, require:

- M0–M9 completed for the accepted scope, all DD rows resolved or explicitly approved broader-scope boundaries, and no open data-loss/privacy/ordinary-rule blocker.
- E01 delivered and tested for dynamic optional content; E02/E05 resolved by evidence or released contract; E03/E04 completed with truthful supported/native-only dispositions.
- Independent expected source/prepared/action comparisons, all 12 class progression cases, actual player permissions, SRD-only creation and optional-content expansion, difficult recovery and realtime cases.
- Final managed archive tested; application compatibility declarations/CI pins reflect actual public contracts; migration choice documented and verified; source/asset provenance retained.
- Native/operator ledger with exact versions/hashes, cleanup evidence and remaining limitations; user approval of scope and removal of the badge.

No commit, version change, tag, push, PR, release or live service is authorized by these checklists. Those operations follow the current user task and repository working agreement.

## Checkpoint evidence ledger

### C01 — M0 verification foundation (2026-10-19)

- Planning checkpoint: `e0fd608`, branch `feat/adr-0001-character-lifecycle`.
  Module 0.4.1 remains experimental; no version/compatibility changes.
- R: `npm test`: 31 tooling assertions plus both existing module suites pass.
  Their labels explicitly distinguish synthetic behavior from native parity.
- Typing: `npm run typecheck`: all 69 module TS/TSX files pass, including UI.
  CI now invokes the maintained runner and explicit typing; its Core v0.18.0
  and Node22 pins remain unchanged. Local run: Core0.19.3/90c13e5, Node24.21.0,
  npm11.19.0. The pinned CI profile has not been executed locally.
- S: `npm run test:native-source -- --native temp/dnd5e`: matches exact
  87e94db release inventory: 2,242 modern records, 591 candidate expression
  strings, setting registrations, references and all module-source hashes.
  Missing oracle/wrong tag/hash mismatch fail; no native module execution.
  Fixture byte identities are in `tests/fixtures/native-6.0.6/index.json`.
- Boundaries/package: isolated check/package on Core0.19.3; output identity
  recorded in the local handoff. Initial alias/cwd and CLI logging failures
  were corrected before the successful run. This is packaging evidence only,
  not installed I/U/N/O acceptance. No service or native connection.
- Completed subrequirements: maintained test enumeration, explicit module
  typing/CI invocation, exact-release comparison and provenance/source separation
  (DD-30 foundation; DD-01/33/36 evidence foundation). No DD or A row is closed.
- Open: Q00 formula/filter/distribution qualification, executable native rule
  domain oracles, live captures, installed/browser harnesses and all M0–M9 gates.
  Next executable step: M1 detached decoding/context and caller-bound declared
  SRD catalog tests; E01 dynamic reads remain an external dependency.

### C02 — M1 schema/context and caller metadata foundation (2026-10-19)

- Implementation commit `0958d83`, following C01 `801a417`.
  Module version0.4.1/experimental retained. No native writes.
- Completed subrequirements: detached Actor/Item and advancement-array/object
  decoding; canonical owned/catalog identities; source edition/provenance;
  29 versioned world-setting declarations and immutable context fences;
  observer-level caller metadata routes/projection and bounded fixed ItemGrant
  closure. Links: DD-01/12/15/16/17/25/26/29/31/34, A14/A17/A23 foundations.
  Full DD workflows, all A rows and M1 completion remain open.
- R/S: `npm test`: 31 tooling assertions and six module suites pass. New suites
  exercise source deep preservation, unknown types/edition, duplicate IDs/names,
  denied/missing/unfamiliar packs, native exclusions, owned data after source
  removal, limited/none detail refusal, changed context and access revocation.
  Context defaults compare against independent exact-release registration data.
  Catalog tests use a mock caller runtime; they are R, not public-host I or N.
- `npm run typecheck`: explicitly includes 80 TS/TSX module/UI/server/test files.
  `npm run test:native-source -- --native temp/dnd5e`: exact inventory matches.
  `npm run check:package`: isolated boundary/type/bundle/package checks on
  released Core0.19.3, including the new server entry. Final archive identity is
  SHA-256 `a005c7502d8080070effb418c8d77fff5cdc0e986bf4619a7cb7d438c48ed689`.
  Its 21 entries include all three compiled entries, module/font licenses and
  experimental0.4.1 metadata, with no test/native-reference fixtures. The local
  path is in the handoff. Managed installation/browser/native acceptance is
  unexecuted.
- Necessary compatibility adoption: released Core0.18 has no world/caller-safe
  contracts; Core0.19.0 introduces module-api1.5. Selected/tested Core0.19.3
  (90c13e5) supplies them. Core floor and both workflow pins are now0.19.3;
  module-api>=1.5, UI/roll ranges unchanged. Node24.21/npm11.19 locally; Node22
  CI has not run here. Core SDK files match v0.19.3; unrelated host edits retained.
- Q01 partial: source-policy semantics and static scalar defaults qualified.
  Calendar default and spell-list dependency refresh remain open; see the native
  reference update. Description bytes are unavailable pending Q03, not sent and
  hidden client-side. No migration is needed for detached pure decoding.
- E01 minimal contract remains the ADR's caller-bound paged discovery/query/read,
  authorized metadata and host-owned dynamic hydration/revisions. A01/A14–A17
  optional-content/full lifecycle gates and A24 remain open until it is released
  and tested. E02/E05 still require executable qualifications; E03/E04 retain
  bounded investigations. No additional Core defect is asserted.
- Next executable step: Q00 controlled formula/filter comparisons and M2's
  shared source-derived preparation, beginning with the recorded +5 Perception
  defect and explicit unsupported states. Continue independently of E01.

### C03 — M2 bounded numeric skill preparation (2026-10-19)

- DD-02 confirmed defect: `skills-source.test.ts` first failed `1 !== 5` on
  unchanged C01 source-before/expected fixtures. The same input now returns
  skill+5, passive15 and formula1d20+5. Independent class-level/multiplier cases
  include levels1/5/9/13/17/20, no/half/full/expert proficiency and missing ability.
  Poisoned source `total99/passive109` does not affect the prepared result.
- Exact S sources: `CharacterData.prepareEmbeddedData`, `Proficiency.calculateMod`
  and `flat`, `CommonTemplate.calculateAbilityCheckProficiency`,
  `CreatureTemplate.prepareSkill`, `AdvantageModeField._defaults` and
  `simplifyBonus` at87e94db. Absent bonuses are proven zero by simplifyBonus;
  unknown expressions are unavailable, not truncated or replaced with zero.
- Shared modern numeric result drives adapter skills/passives, both layouts,
  fixed-ability dialog defaults and getRollData. Normal/manual adv/dis plus
  numeric situational choices compile to public Core roll formulas; no second
  dice evaluator. Arbitrary expressions/ability changes are rejected. Effects,
  conditions, equipped equipment/encumbrance, active native flags, optional
  abilities, proficiency dice/source roll modes and missing
  prerequisites disable checks with reasons. These exclusions remain ordinary
  rule obligations; this is a bounded checkpoint, not M2/A02 completion.
- R/S: `npm test`:31 tooling assertions +7 module suites pass. Static rendering
  confirms unavailable skill controls are disabled and missing passives do not
  display10. `npm run typecheck`:82 explicit files pass. Isolated check/package
  on Core0.19.3 passes; archive SHA-256 is
  `e316f716bb64d6a757702f7bcbf21c6039d8a9960f2166ae9297d5400e372997`.
  The retained path/commit is in the handoff. No mounted U, installed
  I, native N or operator O acceptance; no write/migration/live service.
- Next: Q00 formula/filter/distribution qualification, remaining proficiency and
  skill flag/mode semantics, source ability/save/tool preparation and native
  effect phases. E01 remains external; M0/M1/M2 and all A gates stay open.


### RV01 — independent C01–C03 review (2026-10-19)

Reviewed `6189dcd` with no source edits or live access. See the
[report](../audits/evidence/2026-10-19-c01-c03-review.md) and
[portable evidence](../audits/evidence/2026-10-19-c01-c03-review.json).

- Fresh passes:31 tooling assertions,7 module suites,82-file explicit typing,
  exact6.0.6 inventory (2,242 records/591 candidate expressions),host check and
  isolated package. Node24.21.0; Node22 CI not executed here.
- Fresh archive SHA-256:
  `13fb02734430e2561ba0cb19da7c882c987e4b07f0acc819d1283de1653490bb`.
  All15 regular file contents equal C03's archive,including the three bundles.
- DD-R01:8 min/max scope inputs incorrectly remain executable;8 controlled exact
  native method comparisons confirm the range must be retained. S/R only.
- DD-R02:3 context failures yield+1/passive11/`1d20+1`,and static rendering leaves
  the control enabled. Supported baseline+5/passive15 remains passing. R/static
  rendering only; no mounted/native lifecycle claim.
- No I/U/N/O acceptance,no source mutation,new Core finding,Git or remote write.
  These are required corrections to C03's availability boundary,not closure of
  M2 or a reason to repeat the entire investigation. Next checkpoint fixes both,
  then resumes Q00 and dependency-ready preparation work.

### C04 — DD-R01/DD-R02 corrections (2026-10-19)

- Review-only checkpoint `1163db4` preserves RV01 separately. Maintained
  `skill-review.test.ts` first reproduced all eleven unchanged review inputs:
  eight unrestricted bounded rolls and three +1/passive11 context fallthroughs.
  After correction all pass; source is deeply unchanged through transitions.
- DD-R01: all four scopes, min/max, absent/null defaults, neutral/combined/
  contradictory ranges and malformed values are covered. Configured/malformed
  bounds reject normal/adv/dis execution and previews, retaining known +5/15.
  This closes silent range loss, not native die-range execution support (Q00).
- DD-R02: unsupported/missing context returns null totals/passives/formula with
  reasons. No missing `skillChecks` selects legacy. Explicit supported legacy
  compatibility is retained with its documented unqualified math; bounds also
  gate that path. Supported → unavailable → supported restores +5/15.
- R: `npm test` passes31 tooling assertions/eight suites; `npm run typecheck`
  explicitly checks88 module/UI/server/test/browser files. Exact-release source
  verification matches2242 records/591 candidate expressions at87e94db.
- Mounted R is separate: the first browser run reproduced an open stale dialog
  (retirement timeout). `npm run test:mounted -- --browser-tools <test-tools>
  --chromium <installed-executable>` now passes22 actual module desktop/mobile
  transitions at1440/390px, blocked shortcuts, fresh recovery and retained-
  callback fences after recovery. Chromium143.0.7499.4/Playwright1.56.1; fresh
  browser contexts and intercepted requests, no service. SDK presentation is a
  test seam, not installed Core I/U. Missing tools fail; Node22 CI not run here.
- Isolated `npm run check:package` passes on released Core0.19.3; SHA-256
  `a319f71833355e9d5845743af547302408b22e7d0db4117f9a6b52e06d57aee6`.
  Fifteen regular files, no test/native-reference fixtures. Module remains
  experimental0.4.1; no metadata version/floor changes or data migration.
- [Portable correction record](../audits/evidence/2026-10-19-c04-corrections.json)
  contains exact cases, artifact identity and mounted results. No N/O or release
  readiness claim. E01 unchanged; no additional Core requirement. Next execute
  bounded Q00 native roll configuration comparisons and shared M2 ability/save
  preparation with independent expected values and the same execution gates.

### C05 — Q00 comparisons and shared numeric abilities/checks/saves (2026-10-19)

- C04 correction commit is `e9c579d`; review-only checkpoint is `1163db4`.
  DD-R01/DD-R02 remain corrected. No complete DD/A/M requirement is closed.
  C05 advances DD-01/02/24/34 and A02/A18 within the explicit numeric profile.
- `ability-checks.json` contains eight independent expected results authored
  before implementation. Six initially failed against C04: `wis-save`,
  `check-half-and-bonuses`, `int-check-expert`, `dex-multiclass`,
  `con-global-save`, `cha-high-level`. All eight pass after correction. The
  half-proficient WIS case now gives mod2/check6/save10, including separate
  local/global check/save bonuses. Source is deeply unchanged. Poisoned source
  mod/check.value/save.value99 is ignored. Level/proficiency thresholds,
  global overrides, bonus rejection, range gates and context recovery are covered.
- Shared profile and D20 compiler now drive skills, abilities, saving throws,
  card level/proficiency, desktop/mobile controls, previews and direct formulas.
  A maintained direct-call regression additionally failed with retained
  `1d20+6` after context retirement; explicit profile validation now rejects all
  three check kinds. A selected legacy profile remains separate and unqualified.
- R: `npm test` passes31 tooling assertions/nine module suites;
  `npm run typecheck` explicitly checks93 module/UI/server/test/browser files.
  Mounted R (`npm run test:mounted -- --browser-tools <test-tools> --chromium
  <installed-executable>`) passes50 transitions at1440/390px, retained-callback
  fences for all three kinds and six preview validations. `1d4`/`1+2` bonuses
  show unavailable/disabled submits; numeric2 preview and options agree with the
  direct compiler tests. An initial new-driver declaration-order error was
  corrected before the passing run. Playwright1.56.1/Chromium143.0.7499.4;
  intercepted requests, fresh browser contexts, no fixture listener/service.
- S: `npm run test:native-source -- --native ../../../../temp/dnd5e` matches2242
  records/591 candidate expressions. `npm run test:native-checks -- --native
  ../../../../temp/dnd5e --write-evidence temp/c05-native-checks.json` passes8
  ability/check/save cases,81 source-mode combinations and800 ordered native
  advantage/disadvantage selections (400 each, including ties), plus12/14 combined
  ranges and null defaults. Both read release objects at87e94db, never HEAD.
  The older module-local checkout gives identical release results; both native
  worktrees remain unchanged. Extraction uses declared numeric/no-rule stubs;
  these are not native Documents, engine distributions or action acceptance.
- Isolated `npm run check:package` passes module checks/types/public boundaries
  and logic/UI/server packaging against Core0.19.3/90c13e5. Archive identity is
  recorded in the [portable record](../audits/evidence/2026-10-19-c05-preparation.json).
  SHA-256 `a7c6dcc5d9c00716b070dd4eeaa7a43e40798dd03a6445cd92ba9b0dd8e21188`.
  Fifteen regular files; no tests/native-reference fixtures. Node24.21.0/
  npm11.19.0; Node22 CI was not run here. Version0.4.1 and experimental status
  unchanged; no migration needed for pure projections.
- Q00/E05 remains partial: public `simulateRoll` fallback is insufficient as a
  kh/kl oracle; no SDK-engine parity or new Core defect is claimed. Nonzero
  source modes, ranges, expressions, proficiency dice, effects/filters,
  conditions/flags, transforms and tools remain work. No installed I/U, native
  N/O or release readiness. Next implement source-mode/passive semantics using
  the81 independent cases, qualify the public execution path, then continue
  shared tools and effect phases. E01 remains the existing external dependency.

### RV02 — independent C04/C05 review (2026-10-19)

Reviewed `b45e144` without source edits or live access. The
[review report](../audits/evidence/2026-10-19-c04-c05-review.md) and
[portable evidence](../audits/evidence/2026-10-19-c04-c05-review.json) retain
reproductions and qualifications. DD-R01/DD-R02 remain corrected.

- Fresh passes:31 tooling assertions,9 module suites,93-file explicit typing,
  exact6.0.6 inventory (2242 records/591 expressions),8 arithmetic cases,
  81 source-mode combinations,800 die selections,50 mounted transitions,
  6 preview cases and retained-callback fences; isolated check/package passes.
- Fresh archive SHA-256:
  `8394dbeff020c349cc2df131d8385f329312fa82a8ed32cab48e7bc496c97223`.
  All15 regular file contents equal the reported C05 archive.
- DD-R03:6 unavailable/unqualified inputs retain fabricated or stale card
  level/proficiency; supported baseline is5/+3. Context loss, equipped armor or
  invalid class source gives0/+2; poisoned source produces99/+99. Rolls refuse
  correctly. Add shared card/header availability and recovery coverage.
- DD-R04:3 injected nonpersisted proficiency fields change module results.
  Exact6.0.6 field declarations and controlled Foundry14.367 `SchemaField`
  initialization show those raw fields initialize to0. Three C05 arithmetic
  cases are intermediate-model evidence, not equivalent source preparation.
  Separate fixture phases and test stale-field invariance before widening M2.
- R/S/mounted fixture/package only; no I/U/N/O acceptance. Node24.21.0;
  Node22 CI not executed. No Core finding or new contract floor. Existing
  Q00/Q01, effects/modes/ranges/tools and E01 remain open. ADR-0001 stays open.

### C06 — DD-R03/DD-R04 corrections (2026-10-19)

- Review-only `35c6abc` preserves RV02; ADR saved before substantive revision.
  Maintained `profile-review.test.ts` first failed five DD-R03 context/class/poison
  cases and three DD-R04 source proficiency inputs. All pass after correction.
  Equipped armor retains independently known5/+3 while rolls stay unavailable;
  unknown context, invalid class source and active effects display unavailable.
- Shared facts drive adapter/card/header/proficiency with reasons/provenance.
  Source details.level99/attributes.prof99 is ignored. Poisoned nonpersisted
  proficiency across all four scopes cannot affect preparation, including
  malformed values. Persisted proficiency/bonuses/ranges/modes are preserved;
  active effects do not become source overrides. Source deeply unchanged.
- C05's eight arithmetic cases are retained as intermediate-model expectations;
  eight separate source/default expectations and exact four field declarations
  are verified. This supersedes its source-parity claim, not historical results.
- `npm test`:31 tooling assertions/10 module suites PASS. Explicit `npm run
  typecheck`:96 files PASS. `test:native-source -- --native ../../../../temp/dnd5e`
  matches2242 records/591 candidates. `test:native-checks` with the same reference
  passes8 intermediate +8 source/default cases,81 modes and800 die selections.
- `test:mounted` with the documented external Playwright/Chromium paths passes
  50 existing transitions,6 previews and16 fact projection/recovery cases at
  1440/390. Actual module headers/proficiency are mounted; card adapter projection
  is asserted separately. No installed Core card/UI claim or I/U/N/O acceptance.
- `npm run check:package` passes isolated public-boundary/types/bundles/package
  on Core0.19.3/90c13e5. Fifteen regular files; archive SHA256
  `ffa1b6a8d05a3af043845e1875f9570a614d53566e3a570b938a10e804e0acc7`.
  [Portable record](../audits/evidence/2026-10-19-c06-corrections.json) records raw
  results and hashes. Node24.21/npm11.19; Node22 CI not run. No source migration.
- DD-R03/DD-R04 corrected, DD-R01/DD-R02 regressions retained; full DD/A/M gates
  remain open. Next: source modes/passives and public roll execution qualification.
  Effects/ranges/formulas/tools and E01 remain their existing dependency work.

### C07 — source modes/passives and public roll qualification (2026-10-19)

- Correction checkpoint `f4d78f6`; ADR saved before revision. DD-R01–DD-R04 remain
  corrected. `modes-source.test.ts` first failed80 of81 readiness cases. All81
  static mode/passive results now agree with independent native expectations.
  Eighteen ability/save combinations, malformed modes, poisoned prepared counts,
  bounded ranges, manual option refusal and numeric limits are covered. Source
  preserved. Source modes±1 retain known totals/passives while execution is fenced.
- `npm test`:31 tooling assertions/11 module suites PASS. `npm run typecheck`:
  97 explicit module/UI/server/test/browser files PASS. Exact-release
  `test:native-source -- --native ../../../../temp/dnd5e`:2242/591 match.
  `test:native-checks` same reference:8 intermediate +8 source/default cases,81
  exact prepareSkill mode/passive comparisons,800 ordered selections PASS.
- Mounted R:50 existing transitions,6 numeric previews,16 fact projections and
  18 source-mode checks at1440/390 PASS. Actual controls/passive displays retire
  stale intent; normal cancellation recovers, adv/dis/defaults/shortcuts are
  disabled consistently. Card adapter projections remain separate from mounted
  headers. SDK presentation seam; no installed UI U or N/O acceptance.
- Isolated public-host I (numeric path only): `npm run test:public-rolls` exits2
  with901 totals/serialized face records and exact distribution counts passing,
  but40 native tie-index mismatches. Core0.19.3/90c13e5 normal entry point, fresh
  data/config, public player login, test module `req.runtime.rolls.roll`, synthetic
  loopback transport and dependency entropy. Both CJS/ESM engine seams and exact
  draw consumption verified. No private Core imports, simulateRoll or extra dice
  evaluator. Auth is synthetic; no full actor-endpoint/permission/installed-UI
  workflow acceptance. Silent rolls produce no synthetic native writes/chat.
- E05 concrete minimum: native first-tie retention with ordered evaluated faces/
  active flags and serialization through a public caller-bound roll contract,
  or a proven equivalent existing primitive. Generic kh1/kl1 numeric results are
  correct; this is a D&D equivalence gap, not a generic Core defect. Broader
  grammar, ranges, critical annotations/chat/audience remain unqualified. Module
  now refuses all modern adv/dis requests and source-default±1 rolls rather than
  modifying host results. C03/C05 manual-mode claims are superseded accordingly.
  Numeric literal magnitude is bounded at1e9; larger known static totals remain
  visible but unexecutable. The public rejection was observed independently.
- Isolated `npm run check:package` passes boundaries/types/logic/UI/server; archive
  SHA256 `dc68321ae55655d1f18808f34b0250bbfd91d660aeb407340f62a845ca11a10e`,
  15 regular files. Version/compatibility/experimental status unchanged.
  [Portable record](../audits/evidence/2026-10-19-c07-modes.json) includes exact
  artifact identities and blocked qualification. Node24.21/npm11.19; Node22 CI
  not run. Fixture startup/entropy/term-shape mistakes were corrected before the
  accepted comparison. One automatic approval timeout prevented execution; its
  single retry succeeded. No task-owned service remains.
- Complete source-mode/passive static slice only; no full DD/A/M gate closes.
  Next: separately qualify/release E05 first-tie support and, independently,
  shared source-only tools and planned effect phases. E01 remains unchanged.

### RV03 — independent C06/C07 review (2026-10-19; completed October20)

Reviewed `a1492d8`; see the [report](../audits/evidence/2026-10-19-c06-c07-review.md)
and [portable results](../audits/evidence/2026-10-19-c06-c07-review.json).
DD-R01–DD-R04 remain corrected. Source/mode/passive preparation passes within
its documented scope; no additional calculation defect was confirmed.

- Fresh passes:31 tooling assertions,11 module suites,97-file typing,
  2242-record/591-expression inventory,16 phase-labelled ability cases,
  81 source modes/passives,800 die selections; mounted50 transitions/6 previews/
  16 facts/18 modes and callback fences; isolated check/package.
- Public-host harness exit2 independently reproduced:901 numeric outcomes
  and distributions pass,40 first/second index differences on equal-faced dice.
  Secondary comparison verifies901 retained values/counts, ordered faces and
  discard consistency; unequal pairs all select the exact native index.
- DD-R05: the blanket adv/dis block and mandatory first-tie Core dependency
  overstate this representation difference for plain numeric d20 rolls. Adopt
  the review's narrow equivalence criterion and restore qualified execution
  with actual module-consumer coverage. Keep equal-value index diagnostics and
  actual host serialization; do not generalize to unqualified dice features.
- Fresh archive SHA256
  `428fb51ea6cb5e21c06adc94774890c05d81df3eba6fac23079ee4068c3e0ca3`;
  all15 regular files match C07's reported archive. Node24.21.0; Node22 CI unrun.
- Isolated public silent-roll evidence is not full Actor-route, chat/audience,
  critical annotation, installed D&D UI or native/operator acceptance. Services
  stopped; operator Foundry untouched. No source/version/Git writes. Wider
  Q00/E05 and E01 remain open; no full DD/A/M or ADR gate closes.

### C08 — DD-R05 correction (2026-10-20)

Implementation commit: `6839b73f1dcba855be4dec9da615b2ec0b46e1bb`.

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

C08 evidence: `npm test`33 tooling assertions/12 module suites PASS; explicit
`npm run typecheck`98 files PASS; exact source2242/591 match; native comparisons
16 phase-labelled abilities/81 modes-passives/800 selections +9 manual overrides
PASS. Mounted50 transitions/6 previews/16 facts/18 modes plus source/context
callback fences PASS at1440/390. All three buttons preview and dispatch the same
shared formula; shortcuts retain source defaults.

`npm run test:public-rolls` exits0:919 totals/ordered serialized faces and
complete distributions PASS,40 nonblocking equal-index diagnostics retained.
The additional18 cases exercise all manual choices over source modes with numeric
bonuses. `npm run check:package` PASS,15 regular files, archive SHA256
`bbae8b02b290d15bb641bd080bf995c5d3d64fee20a7bbab5f97d0648f3d5c96`.
[Portable C08 evidence](../audits/evidence/2026-10-20-c08-correction.json) records
hashes and separate R/S/isolated-host results. No installed UI/N/O acceptance.
Node24.21/npm11.19; Node22 CI not run. Experimental0.4.1/compatibility unchanged.
DD-R01–DD-R04 preserved; DD-R05 corrected. No full DD/A/M gate closes. Next:
shared source-only tool preparation with independent schema/method expectations.

### C09 — Independent source tool checks (2026-10-20)

Implementation commit: `bbce67765f8ddc34781d22d5ff75add70e454051`.

C08 implementation: `6839b73f1dcba855be4dec9da615b2ec0b46e1bb`.
Review documentation: `89f4645`. The ADR was saved locally before C09 revisions.
No DD-R01–DD-R05 finding is reopened; all maintained protections pass.

- **R failing before / passing after:** independent tool-checks.json and the
  maintained tools-source suite were added before implementation. The untrained
  fixture expected−1 and got undefined; unchanged source now produces−1. Eight
  independent totals cover levels1/5/9/13/17/20, proficiency0/.5/1/1.5/2, negative
  modifiers, numeric four-scope bonuses and existing-entry INT/0 defaults.
- **R source/gates:**81 mode combinations, manual overrides/numeric bonuses,
  poisoned nonpersisted and prepared-looking fields, source preservation,
  unknown identities, malformed/missing inputs, four-scope bounds, context
  loss/recovery and explicit combined-check/alternate-ability refusal pass.
- **S:** `npm run test:native-source -- --native ../../../../temp/dnd5e`
  matches2242 records/591 candidate expressions at exact87e94db. Native HEAD
  is not the oracle. `npm run test:native-checks -- --native ../../../../temp/dnd5e
  --write-evidence temp/c09-native.json` passes16 phase-labelled ability cases,
  81 skill modes/passives,800 ordered selections,9 manual overrides,8 tool
  arithmetic cases,81 tool modes and20 intermediate combined proficiencies.
  Forty tool/vehicle keys and explicit schema defaults match syntax. Stubs:
  explicit initialized plain objects, empty AppliedRules, no flags/conditions,
  Remarkable Athlete false, numeric literal classification and property/count
  helpers. No actual Foundry model initialization or native engine acceptance.
- **Mounted R:** `npm run test:mounted -- --browser-tools /tmp/sd-dice-preview-tools
  --chromium /home/juvinious/.cache/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-linux64/chrome-headless-shell`
  passes50 existing transitions,8 preview validations,16 fact projections,
  18 existing source modes and56 tool cases at1440/390. Actual full-sheet tool
  controls show the same totals/proficiency/ability; previews, buttons,
  shortcuts, disabled reasons and retired callbacks agree. Playwright1.56.1 /
  Chromium143.0.7499.4, network intercepted, SDK presentation seam. This is
  distinct from installed Core UI and native/operator acceptance.
- **Isolated host:** `npm run test:public-rolls` passes943 numeric requests,
  including24 tool cases; ordered faces/entropy, retained count/value and
  states, unequal identity, totals and complete distributions remain strict.
  Forty equal-index diagnostics and actual host serialization are preserved.
  Public player login/request-bound rolls on Core0.19.3/90c13e5, synthetic
  transport and temporary configuration; no live connection. Full D&D Actor
  route, chat/audience/criticals and installed UI remain unqualified.
- **Checks/package:** `npm test` passes33 tooling assertions and13 module
  suites. `npm run typecheck` explicitly checks102 module/source/UI/server/
  hook/test files. `npm run check:package` passes public boundaries, managed
  types and logic/UI/server bundles. Archive15 regular files, no fixtures:
  `dnd5e-0.4.1.tgz`, SHA256
  `ada0a65274a1800eac2c4c6c85f2d34feb382e4e220ab578c480e161599abd6b`.
  Node24.21.0/npm11.19.0; Node22 CI unrun. Services stopped after fixtures.

[Portable C09 evidence](../audits/evidence/2026-10-20-c09-tools.json) retains
separate R/S/mounted/host observations, artifact hashes, archive entries and
phase limits without requiring ignored reports. Local artifacts are in
`/tmp/dnd5e-mounted-DfGKIH`, `/tmp/dnd5e-public-rolls-Ad4Rqf` and
`/tmp/dnd5e-package-hhmq9z`; source observation in temp/c09-native.json.

This partially advances DD-02/24/34 and A02/A18. No full DD/A/M gate closes;
independent Actor mapping checks are not complete tool support. Selected
combined skill/tool checks, alternate-ability re-preparation, Item activities,
effects/flags/conditions/armor/encumbrance, broader formulas, ranges and wider
Q00/E05 remain open. Next bounded M2 package: independent combined-choice/
alternate-ability expectations and exact native roll-builder comparisons, then
shared preparation/UI only for qualified choices before planned effect phases.
E01 remains the separate external content dependency. Experimental0.4.1 and all
compatibility requirements are unchanged. ADR-0001 remains open.

### RV04 — independent C08/C09 review (2026-10-20)

Reviewed `1c81d05` against exact native `87e94db` and Core 0.19.3/`90c13e5`.
The [review](../audits/evidence/2026-10-20-c08-c09-review.md) records commands,
source symbols and evidence limits; its [portable result](../audits/evidence/2026-10-20-c08-c09-review.json)
is self-contained. DD-R05 is corrected and DD-R01–DD-R04 remain covered.

Fresh checks pass: 33 tooling assertions / 13 suites; 102 typed files;
2242 records / 591 expressions; controlled native methods; mounted 50 transitions,
8 previews, 16 facts, 18 modes and 56 tool cases; 943 public-host roll cases with
40 nonblocking equal-index diagnostics; isolated check/package. All 15 regular
archive entries match the implementer's final archive. Node 22 CI and native,
installed UI, chat/audience and operator acceptance were not performed.

An additional mounted probe reproduces **DD-R06** at 1440 and 390: hover exit
while Advantage retains focus resets preview to normal, then Enter submits
advantage. It asserts the defect, not corrected behavior. Add its failing case
to maintained coverage and correct it alongside combined-check/alternate-ability
qualification. No new arithmetic/Core blocker or full acceptance closure.

### C10 — DD-R06 focused preview correction (2026-10-20)

Implementation commit: `508369f1af77cc38f7f555aa8c61dd3105452dfc`.

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

### C11 — Selected checks and alternate abilities (2026-10-20)

Implementation commit: `53270c40d1ed01e8a87daab45da56132433b8710`.

RV04 review checkpoint `e9be054f41d689294aca4e8e48715ba2319a99c9`;
DD-R06 corrective implementation `508369f1af77cc38f7f555aa8c61dd3105452dfc`.
ADR saved before substantive C11 revision. DD-R01–DD-R06 remain covered.

- **Independent before/after R:**36 original asymmetric selected requests were
  authored before implementation and compared against exact native methods.
  The module first failed34, then passed the same requests. Two later edge
  cases independently qualify positive half proficiency with zero flat bonus.
  Final38 cases,114 manual numeric-bonus choices and324 combined source-mode
  cases pass. Poisoned nonpersisted/prepared fields cannot override source;
  current invalid/missing identities/abilities/options reject without fallback.
  Secondary local/global bonuses, modes and ranges remain unused, as native.
- **S:** `npm run test:native-source -- --native ../../../../temp/dnd5e` passes
  exact2242 records/591 candidate expressions at87e94db. `npm run
  test:native-checks -- --native ../../../../temp/dnd5e --write-evidence
  temp/c11-native.json` passes prior16 ability phases/81 skill modes-passives/
  800 ordered selections/9 manual overrides/8 tool totals/81 tool modes/20
  intermediate combinations, plus38 selected request builds,324 auto/source
  combinations and6 ability-dialog choices. Exact #rollSkillTool,
  _buildSkillToolConfig, preparation/proficiency, BasicRoll.constructParts,
  D20 combination and relevant dialog methods are exercised. Initialized plain
  models, empty AppliedRules preserving supplied source parts/counts/ranges,
  absent travel/effects/flags/conditions/transforms and build capture are stubs.
  No native dice evaluation, Document/DataModel or browser lifecycle is proved.
- **Phase distinction:** module selectors configure a fresh request with final
  ability for modifier, ability bonus/mode/range. Native in-place dialog ability
  edits rebuild parts/ranges while retaining initial process mode. Both are
  compared separately. The module is not claiming native dialog identity.
- **Mounted R:** `npm run test:mounted -- --browser-tools /tmp/sd-dice-preview-tools
  --chromium /home/juvinious/.cache/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-linux64/chrome-headless-shell`
  passes50 transitions/8 previews/16 facts/18 modes/56 tools,80 selected-check
  cases and stale callbacks, plus DD-R06 focus/hover/blur restoration, at1440/390.
  Selected ability headings/previews/direct requests agree. Clearing selectors
  restores independent/default; a valid ability remains selected when clearing
  the secondary. Source/context loss retires dialogs/callbacks; recovery has
  empty selections and dispatches no prior roll. Playwright1.56.1/Chromium
  143.0.7499.4; all network intercepted; actual consumers with SDK presentation
  seam, not installed Core/native UI acceptance.
- **Isolated public host:** `npm run test:public-rolls` passes1095 requests,
  including152 new selected/default/manual/numeric-bonus cases. Ordered faces,
  exact entropy use, retained value/count, consistent flags, totals, unequal
  identity and full plain-d20 distributions remain strict.40 equal-index
  diagnostics and actual serialization remain unchanged. Public player login,
  request-bound silent rolls, temporary config and synthetic loopback transport
  on Core0.19.3/90c13e5; no live Foundry/full D&D Actor route/chat/audience or
  critical/native/operator acceptance.
- **Maintained checks:** `npm test` passes33 tooling assertions/14 module suites;
  `npm run typecheck` explicitly checks106 module/UI/server/hook/test/browser
  files. The final combined-check suite also passes when run directly via
  `node ../../../../node_modules/tsx/dist/cli.mjs --tsconfig ../../../../tsconfig.json
  src/tests/combined-checks.test.ts`. `npm run check:package` passes public
  boundaries, managed typing and logic/UI/server bundles. Archive15 regular
  files; no test fixtures. SHA256
  `a0e18f5d77ef21a20f7cfbc31b92d35b6c56677e280350f0468060a2c81a59cc`.
  Node24.21.0/npm11.19.0; CI's Node22 not executed.

[Portable C11 evidence](../audits/evidence/2026-10-20-c11-selections.json) records
observations, before failures, fixture/script hashes and all15 archive entry
hashes. Local artifacts: /tmp/dnd5e-mounted-bA52WJ,
/tmp/dnd5e-public-rolls-VVimUz, /tmp/dnd5e-package-MCabgW; exact native observation
temp/c11-native.json. Services stopped after fixtures. These artifact references
are supplemental; tracked cases and summaries are self-contained.

Completed bounded selected-check behavior advances DD-02/24/27/34 and A02/A18;
no full DD/A/M gate closes. Effects/flags, range execution, proficiency dice,
expressions, pace, Item activities, transformations and general legacy expansion
remain unavailable. E01 and wider Q00/E05 stay open. Next M2/Q00 package:
independent effect eligibility/phase-order and numeric proficiency/check-bonus
fixtures, then the first qualified shared effect slice, with Q02a unsupported
filters explicit. Experimental0.4.1/compatibility unchanged; ADR-0001 open.

Final baseline isolation: unrelated concurrent Core maintenance edits were
observed and preserved. Offline temporary checkout
`/tmp/dnd5e-core-baseline-iDcWjQ/core` is pristine at90c13e5. Final `npm test`,
`npm run typecheck`, `npm run test:public-rolls` and `npm run check:package`
were rerun with `-- --core /tmp/dnd5e-core-baseline-iDcWjQ/core` and passed
33/14,106,1095/40 and public boundaries/types/bundles/archive15 respectively.
Dependencies/managed aliases remain read-only; synthetic transport/config only.
The final archive above is from that pristine baseline. The earlier workspace
archive is retained in evidence; build-root JS comments and one Tailwind utility
differ, so byte identity is not claimed. No Core source was changed by this task.
Both secondary source-loss directions retire callbacks even at unchanged fixture
revision numbers; final mounted80 cases include those fences.

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

`npm test` passes56 tooling assertions in7 suites and15 module suites; explicit
`npm run typecheck` covers108 files. `test:native-source` retains2242 records/591
candidate expressions; `test:native-checks` retains16 ability phases/81 modes/
800 ordered selections/8 tools/81 tool modes/20 intermediate combinations/
38 selected builds/324 selected modes. `test:native-effects -- --native
../../../../temp/dnd5e --foundry /home/juvinious/projects/foundryvtt/foundryvtt-v14`
passes5 controlled static-source cases, pinned to87e94db and Foundry14.367.
Mounted fixtures pass earlier protections plus22 effect/recovery cases at1440/390;
isolated public-host1098 requests pass with40 equal-index diagnostics unchanged.
Isolated check/package passes all boundaries/types/bundles; the first check found
and then corrected test-harness console logging. All host runs use pristine
Core0.19.3/90c13e5 via `-- --core /tmp/dnd5e-core-baseline-iDcWjQ/core`.

See [portable C12 evidence](../audits/evidence/2026-10-21-c12-effects.json) for
hashes, observations, archive identity and evidence limits. This advances DD-02/
24/27/34 and A02/A18 partially, closing no complete requirement or acceptance
gate. E01, Q02a filters, active field arithmetic and wider Q00/E05 remain open.
Next executable phase: independently qualify initial numeric effect fields and
proficiency targets, then consume their detached prepared operands through the
same ability/check configuration path. ADR-0001 remains open; experimental0.4.1
and compatibility unchanged. No installed UI/native/operator acceptance claimed.

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

`npm test` passes56 tooling assertions/7 tooling suites/16 module suites; explicit
`npm run typecheck` covers112 module/UI/server/hook/test files. Pinned source
comparison remains2242/591; all previous native-check comparisons pass. Extended
`test:native-effects` matches5 eligibility/order cases plus20 numeric cases and40
combined skill/tool dispatch/build captures. Static Foundry NumberField operation/
cleaning and exact native preparation/proficiency/dispatch/build methods are used.
Field clean/validate/initialize wrappers, explicit initialized defaults, numeric-
literal-only Roll stub, empty applied rules/flags/conditions and capture-only dice
build are explicit stubs. No native Documents/DataModel/runtime acceptance follows.

Mounted fixtures pass prior protections plus56 numeric-effect cases across1440/390
with actual skill/tool/passive/check/save consumers, previews/manual buttons,
shortcuts, source/context loss and retained callbacks. This is an SDK presentation
seam, not installed Core/native UI. Isolated public Core0.19.3 requests pass1578
numeric outcomes/serialized faces, including480 new effect-derived requests;
40 equal-index diagnostics and strict unequal identity/entropy/distributions stay
unchanged. Synthetic auth/transport and temporary configuration only. Isolated
module checking/packaging passes boundaries, explicit managed types and bundles.
All host commands use `-- --core /tmp/dnd5e-core-baseline-iDcWjQ/core`; exact native
is87e94db release-6.0.6; static Foundry14.367 was read, never started. Services close
in harness cleanup. The enlarged test fixture needed a16MiB subprocess buffer;
no runtime browser dependency or production configuration change was introduced.

[Portable C13 evidence](../audits/evidence/2026-10-21-c13-numeric-effects.json)
records original failures, source observations, fixture/script hashes and archive
identity. Numeric invalid choices/unsupported source initialization remain
explicit unavailable rather than claiming native fallback parity. Final effects
are not reapplied as initial changes or used to recompute derived scores.
Next executable phase: constant check-bonus FormulaField effects, qualified
separately from numeric NumberFields; broader expressions/filters and Item phases
stay open. E01 and wider Q00/E05 remain external/open. No complete DD/A/M gate
closes. ADR-0001 remains open; experimental0.4.1/compatibility unchanged; no native/
operator or release acceptance claimed.

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

`npm test` passes56 tooling assertions/7 tooling suites/17 module suites; explicit
`npm run typecheck` covers114 files. Exact source2242/591 and all prior native
checks pass. `test:native-effects` retains5 phase,20 numeric field/derived and40
selected-build comparisons plus19 native FormulaField constructions. These
constructions do not run native Roll validation/evaluation. Independent expected
constant reductions are instead separately qualified through the public host.
Mounted fixtures pass prior protections and102 effect-field cases at1440/390,
including46 new constant-bonus cases, actual consumers, primary-type differences,
manual previews/execution, shortcuts and context/source recovery.

Isolated public Core0.19.3 passes2077 accepted numeric rolls, strict faces/entropy/
retention/states/totals/distributions and40 equal-index diagnostics. This includes
456 constant-effect requests,19 independent constructor expressions and24 requests
for the newly supported prior +2 fixture. One negative candidate is retained:
`1d20+(-(3))` is rejected before entropy consumption. Its explicit binary form
`1d20+(0-(3))` passes, as does the module's normal numeric reduction `1d20+2` for
a skill with base+5 and constant bonus-3. This is a representable deterministic
adaptation, not a required Core extension. The expected rejection is asserted
only for that exact synthetic input. Existing failed-request HTTP/literal-limit
checks remain strict. Actual host serialization is untouched. Wider E05 stays open.

`npm run check:package` passes public boundaries, managed types and all bundles.
Commands use pristine Core0.19.3/90c13e5 with `-- --core
/tmp/dnd5e-core-baseline-iDcWjQ/core`; native87e94db and static Foundry14.367 only.
Services close in cleanup; no live connection. [Portable C14 evidence](../audits/evidence/2026-10-21-c14-constant-bonuses.json)
records failures, constructions, candidate disposition, artifact hashes and limits.
R, controlled S, mounted SDK seam and isolated public-host evidence do not close
installed UI/native/operator gates. DD-02/24/27/34 and A02/A18 advance partially;
no complete gate closes. ADR-0001 stays open, experimental0.4.1/compatibility unchanged.
Next M2/Q00: native effect mode counts/override/suppression and distinct passive
versus fresh-roll combination order. Final effects, filters/status/time/Item
preparation, broader expressions/ranges/flags and E01 remain open.

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

`npm test` passes56 tooling assertions/7 tooling/18 module suites; explicit typing
covers117 files. Exact source2242/591 and prior native-check comparisons pass.
`test:native-effects` retains5 order/20 numeric/40 selected-build/19 constructor
cases plus25 effect-mode cases through actual pinned AdvantageModeField methods,
prepareSkill and Actor dispatch. Initialized plain models, dropped schema-foreign
poison, empty applied rules/conditions/flags and capture-only builds are stubs.
These controlled methods do not establish native Document/DataModel or engine parity.
Mounted actual consumers pass previous protections plus58 mode cases at1440/390;
all19 original defects and6 added scope cases are covered. The SDK presentation
seam does not establish installed UI acceptance. Public Core0.19.3 passes2677
accepted numeric outcomes (600 new mode requests), one exact rejected unary
candidate and40 equal-index diagnostics. Ordered faces/entropy/retained count/
value/states/totals/distributions and host serialization remain strict.

Isolated module check/package passes public boundaries, managed typing and all
bundles. All host tools use pristine Core0.19.3/90c13e5 via `-- --core
/tmp/dnd5e-core-baseline-iDcWjQ/core`; oracle is87e94db release-6.0.6 and static
Foundry14.367, never reference HEAD or a live service. Harness cleanup stops task
services. [Portable C15 evidence](../audits/evidence/2026-10-21-c15-effect-modes.json)
contains original failures, independent observations and artifact identities.
This advances DD-02/24/27/34, A02/A18 partially, closing no complete DD/A/M gate.
Next executable M2 slice: independent character HP/HD source/advancement facts and
truthful health projections before M3 health commands. Other M2 domains, final
phases/filters/status/time/Item preparation, broader formulas/ranges/flags, E01
and wider Q00/E05 remain open. ADR-0001/full acceptance remain open; experimental
0.4.1/compatibility unchanged; native/operator/release acceptance is not claimed.

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

`npm test` passes56 tooling assertions/7 tooling/19 module suites; explicit module/
UI/server/hook typing covers121 files. Pinned source2242/591, prior native-checks
and all effect comparisons pass. `test:native-health` matches17 independent cases
against exact prepareAbilities, class HD preparation, HP advancement, Actor.classes,
HitDice and AttributesFields.prepareHitPoints plus the verbatim character HP branch.
Explicit defaults, numeric-literal-only HD Roll, empty rules/flags/conditions,
no-op class spellcasting, Set.reduce/Math.clamp and initialized class identity are
stubs. The CON effect case starts after its separately qualified initial numeric
phase at explicitly specified16. No native Document/DataModel/runtime is booted.

Mounted fixtures pass earlier protections plus58 health cases at1440/390, including
context loss/recovery, partial facts and disabled heal/damage/rest controls with
zero fixture writes. This is the actual module UI through an SDK presentation
seam, not installed Core/native UI acceptance. Public-host2677 accepted rolls,
one maintained rejected unary candidate and40 equal-index diagnostics remain
unchanged after the shared modifier refactor. All faces/entropy/selection/counts/
flags/totals/distributions and host serialization stay strict. Isolated check/
package passes boundaries, managed types and all bundles. Pristine Core0.19.3/
90c13e5 at `/tmp/dnd5e-core-baseline-iDcWjQ/core` remains clean; commands use
`-- --core` that path. Native oracle is exact87e94db, not reference HEAD; static
Foundry14.367 is read only. Task fixtures stop services in cleanup.

[Portable C16 evidence](../audits/evidence/2026-10-21-c16-health.json) retains
inputs, failures, controlled observations, source/script/archive hashes and limits.
Next M2 work: independently qualify armor class and initiative source/default
preparation, their native Item dependencies and shared read/execution consumers.
Do not trust raw prepared-looking ac.value/init.mod/init.total or default10/0.
Broader M2 effects/final/filter/Item/status/time/formula work, E01, wider Q00/E05,
M3 onward and native/operator gates remain open. No full DD/A/M gate closes;
ADR-0001 stays open, experimental0.4.1/compatibility unchanged.
