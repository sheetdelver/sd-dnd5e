# ADR-0001 verification and completion evidence

Status: plan, 2026-10-19. Governed by [ADR-0001](../adr/0001-complete-character-lifecycle.md); requirement definitions are [DD-01–36 in the audit](../audits/2026-10-19-character-lifecycle.md). Native oracle and source paths are in [the 6.0.6 map](../reference/native-6.0.6.md). No live acceptance is claimed here.

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

Current evidence is only the audit's two existing passing tests, explicit module typing, source inspection and synthetic direct-function probes. No milestone has native acceptance yet. Don't backfill an N result from an R/S/I run or a sibling module's acceptance.

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
