# Exact-release offline evidence

`source-inventory.json` is generated from Git objects at release-6.0.6, commit
87e94dbd9f930135e0694cd7e7d49f210603cd2c. HEAD and the working tree are never
used as oracle inputs. It records hashes, static registration defaults, record
shapes, candidate expressions and references. Candidate expressions deliberately
include false positives; they are an inventory for Q00, not an evaluator. A
reference cycle may be an ordinary backlink; it does not prove a grant cycle.
Missing references are relative to the modern bundled subset, not proof of a
broken native installation. Actual caller access and hydrated payloads are
separate M1/E01 evidence.

`source-before.json` is module-authored synthetic JSON. `expected.json` is a
separate manually specified S oracle: advancement storage migration from
`AdvancementTemplate.#migrateStorage`, source identity from `SourceField`, and
WIS 14 => +2, level 5 => proficiency +3, multiplier 1 => skill +5/passive 15 from
`CharacterData`/`CreatureTemplate.prepareSkill`. This is not captured native
preparation: `nativePrepared` is explicitly null. The intended no-write action
retains the entire source, including nested effects, flags and extension fields.
Only decode expectations are consumed until M2 implements the skill interpreter.

`index.json` identifies evidence, settings, revisions, licenses and payload hashes.
Unknown installed host/module archive identities stay null. No live endpoint,
credentials, purchased text, native art or native runtime is included. Inventory
formula fragments and IDs identify source semantics, not a redistributed book.
Upstream software is MIT (Foundry Gaming LLC); SRD 5.1/5.2 text is CC BY 4.0,
Dungeons & Dragons, Wizards of the Coast LLC. See upstream `LICENSE.txt`/`README.md`
at the pinned commit and the module's existing font license inventory.

Read-only comparison (Core toolchain with js-yaml/TypeScript required):

```sh
npm run test:native-source -- --native /path/to/dnd5e --core /path/to/core
```

A missing checkout, wrong release tag or changed inventory fails. To deliberately
regenerate after review, supply `--write-inventory /absolute/output.json`, compare
that file, and update provenance; never silently bless changes in ordinary tests.
Native N/action capture and installed I/U harnesses remain open acceptance gates.

`ability-checks.json` extends the fixture with eight independent, manually
specified numeric ability/check/save expectations. These were authored before
the M2 ability implementation; six cases failed on C04. Scores, class levels,
local/global bonuses and proficiency overrides are synthetic source inputs.

```sh
npm run test:native-checks -- --native /path/to/dnd5e --core /path/to/core
```

This controlled S comparison extracts exact-release method syntax via the
TypeScript AST, not the native module loader. It compares all eight cases,
81 source advantage-mode combinations, 800 ordered advantage/disadvantage die
selections (including ties), combined ranges and null range defaults. Stubs are
explicit: numeric classification, empty applied rules/compatibility shims,
no conditions/cover/flags, plain property access and count merging. Unknown
formula evaluation fails. It does not boot Foundry, prepare native Documents,
evaluate arbitrary formulas, or qualify the SDK dice engine or native ranges.
`--write-evidence /path/result.json` retains observations and exclusions.

C06 phase clarification (DD-R04): `expected` in `ability-checks.json` describes
an already-initialized intermediate model with explicitly supplied later-phase
proficiency targets. `sourceExpected` describes persisted source plus verified
default0, with effects absent. `abilitySource` never injects those nonpersisted
targets. Both sets are independently specified and compared separately. C05's
original arithmetic remains useful but is not source initialization parity.

`skill-modes.json` contains81 independent persisted-mode/passive expectations.
The exact-source runner now compares both combineFields and prepareSkill for
these cases. Native BasicDie tie identity is independent of numeric totals.

`npm run test:public-rolls` exercises candidate formulas via a real isolated
Core0.19.3 public request runtime with synthetic loopback transport/auth and
controlled dependency entropy. No private Core imports or native runtime boot.
At C07 normal requests came from adapter execution; adv/dis candidates used
the shared formatter in isolation. At C08 all requests come from adapter execution. Exact faces and draw
consumption are asserted, not assumed. All901 totals/distributions pass but40
tied selections differ from native; C07 exited2 on the stricter identity criterion,
superseded by C08 below. Artifacts
include observed serialized results and a compact evidence record. No Core
service is retained. This script is not part of npm test and does not silently
turn a qualification mismatch into a passing module regression.

C08 supersedes the C07 first-tie restriction: the public harness now passes narrow
plain-d20 equivalence and records equal-index differences as diagnostics. Faces,
retained value/count, flags, exact unequal identity, entropy and distributions
remain strict. Actual host serialization is preserved. Negative oracle cases
reject nonplain metadata/modifiers/groups and corrupt records. Native dialog
defaults and explicit mode overrides are controlled S comparisons, not native UI.

`tool-checks.json` supplies independent source-only totals at levels1/5/9/13/17/20,
negative/zero ability modifiers, multipliers0/.5/1/1.5/2, four numeric bonus scopes
and verified omitted-field defaults. No nonpersisted proficiency injection is
used. The native harness checks the exact40 CONFIG tool/vehicle keys and schema
syntax, initializes explicit defaults, then compares extracted prepareTools and
proficiency methods. It separately checks81 source mode combinations and20
intermediate combined skill/tool proficiencies. The latter explain a refused
workflow, not completed combined checks or effect support. Module regressions
cover poisoned fields, source preservation, bounds, malformed data and recovery.
Mounted consumers cover both layouts; public-host cases add24 tool requests.
All evidence limits in C08 continue to apply.
