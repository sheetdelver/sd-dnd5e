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

C11 `combined-checks.json` distinguishes fresh selected requests from native
in-place dialog edits.38 independent cases use asymmetric primary/secondary and
ability scopes, including half proficiency with zero flat bonus. Original36
cases first failed34 module requests; all now pass. The native harness extracts
#rollSkillTool/_buildSkillToolConfig and BasicRoll.constructParts into controlled
classes, prepares numeric proficiency with explicit defaults, captures request
parts/data without dice evaluation, and checks324 source/automatic combinations.
The six ability-dialog choices use an explicit empty-base/StringField stub.
Native formData ability changes retain process mode; fresh module requests use
final ability for mode and parts. These are separately tested phases. Poison,
invalid/missing choices, clearing and source/context recovery remain maintained
regressions. Public-host152 selected requests supplement the plain-d20 qualifier;
mounted module consumers cover both layouts, not installed Core/native UI.

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

C17 `defenses-initiative.json` supplies48 independent source/default AC/initiative
expectations. The native-defense oracle captures42 AC/41 initiative branches,
explicitly initialized nonpersisted fields, empty rules/conditions/flags and
known constant-expression results, plus3 separate migration observations. Source
aliases that native migrates are not called nonpersisted poison. No Item/native
DataModel/runtime/dice acceptance. Initiative fixed scores use BasicRoll and no
entropy; tiebreaker remains a trailing part to preserve exact operation order.
See the C17 portable record and verification ledger for public/mounted evidence.

C18 `equipment.json`:45 independent cases,34 qualified and11 explicitly unavailable.
The native-equipment oracle captures initialized Item base/derived armor, exact
property/magic getters, Actor skill-before-armor phases, first-source selection,
registry eligibility and fresh counts. Known constant lookup/explicit defaults
and empty rule/condition/flag stubs are limits, not native model acceptance.
Actor/Item source is preserved; prepared-looking getter/field poison is ignored.

C19 `movement-senses.json`:39 independent inputs; source scalar cleaning, exact
local species identity, phase-specific inheritance, units/bonuses/armor reduction,
max-before-jump, separate availability and poison/source preservation. The oracle
compares30 complete movement methods plus1 labeled incomplete-STR diagnostic,
34 sensory cases and scalar/reference methods. No DataModel/runtime/operator
acceptance; see portable C19 limits. Numeric source0 is initialized string"0"
for a FormulaField, unlike an omitted operand. Never erase that distinction.

C20 `d20-ranges.json`:8 independent20-face contribution tables;6560 ordered native
method/public-host comparisons and24 distributions. Source modifiers preserve
raw faces, count/rerolled and exact retained identity. Normal160 pass; bounded
adv/dis320 equal-index mismatches stay unqualified (no plain-profile exception).
Controlled injected-result S is separate from synthetic public-host execution,
installed UI and native/operator acceptance. C20 has no runtime scope expansion.

C21 keeps C20's strict bounded-selection gate and adds all441 nullable1–20 bound
pairs/20 faces for normal mode. The maintained module matrix covers30 source
scope cases and explicit Normal overrides; static/passives/context/malformed/
source/legacy protections remain. Public helper assertions include exact Roll/
Die metadata and441 complete distributions. Formula-only HUD integration is a
separate controlled public-consumer limit and stays gated for bounds. Earlier
normal unavailable evidence is historical; it is not deleted or called support.

C22 `item-effect-eligibility.json`:75 independent raw-source cases,69 qualified
source/default suppression comparisons and6 explicit unavailable boundaries.
Exact primitive clean/default methods and13 schema-template ownership checks
precede the pinned getter. No source/prepared phase substitution, malformed
coercion or native DataModel/creation hook acceptance. Extra fields outside the
equippable schemas remain source poison; numeric initial changes retain C13–15
qualification. Origin changes retire equal-total/revision roll intent.

C23 `species-identity.json`:17 raw-source identity/presentation contracts;12 exact
primitive-clean/local-lookup comparisons,5 unavailable boundaries. This does not
initialize an Item DataModel or derive its rule data. Source fallback text never
becomes an Item UUID; source identity can remain independently visible when rules
are unavailable. The resolver is shared with movement/senses, whose unresolved
reference and other rule gates remain intact. Explicit legacy is separate.

C24 `defense-traits.json`:28 independent source contracts;24 controlled native
captures (15 complete condition-free,9 partial independent-domain comparisons),
4 full unavailable profiles. `defense-registries.json` pins13 damage/26 condition/
3 bypass identities, physical metadata and English labels at exact87e94db. The
oracle executes primitive String/Set/default and exact normalization/presentation
methods with explicit constructors, condition-free state, registry/key-label and
formatter stubs. No native model boot/validation or expression engine acceptance.
Custom duplicates/order, ALL overlap, category-specific unavailable states and
non-schema CI-bypass poison are covered without changing source.

C25 `trait-effects.json`:43 source contracts,33 qualified initial field cases and
10 explicit unavailable boundaries. expectedOperands are detached arrays/reduced
module constants, not native Set/FormulaField model snapshots. expectedFormula
records native string construction independently. Exact applyChange/delta/cleaning/
equality/Set methods and later trait normalization compare ordered values; source
raw-array parsing is a separate diagnostic. Source remains unchanged, active
conditions/final/filter/Item phases remain gated, and legacy is not expanded.

C26 `proficiency-indicators.json`:9 source profiles (7 independently qualified
numeric skill/save/passive cases,2 malformed skill boundaries), plus3 context-loss
states in mounted tests. Actual before UI mislabels1.5 and null as zero; the new
shared marker formats existing prepared values only. Static bounded coefficients
remain distinct from default execution readiness. Native methods are controlled
arithmetic/source-default comparisons, not engine/operator or full legacy proof.


C27 `training.json` declares36 independent source contracts; `training-registries.json`
records exact modern English native localization/configuration and canonical identity
references, not content discovery.33 controlled native-method comparisons use exact
prepareLanguages, Trait.keyLabel, sheet presentation, prepareTools/proficiency and a
conditional masteryOptions example. Local tool effectValue and prepared effective
value are recorded separately. Global/local overrides begin after the already-qualified
initial effect phase; raw nonpersisted99 never initializes an override. Partial
malformed ranges compare spoken labels only. The prototype-key inherited-function
native diagnostic is retained without inventing a grant. Malformed/source/context
and all preservation tests are module R boundaries, not native coercion parity.


C28 `training-effects.json`:39 independent contracts (24 supported,15 explicitly
unqualified). Expected operands/presentation are declared before implementation and
compared with exact initialized native typed-field operations and prepareLanguages.
Before all24 supported requests are unavailable; after the shared pipeline supplies
both panel/card facts and unchanged numeric checks. Source defaults and local/effective
coefficients remain distinct; stale nonpersisted fields cannot grant training.
The15 boundaries are module availability limits, not native validation parity.


C29 `constant-filters.json`:54 source contracts,34 supported workflows (32 fail before,
2 existing defaults) and20 retained module boundaries.40 independently pinned guard
observations include6 workflows gated separately for statuses/flags/malformed source.
The oracle forbids property reads and separately probes effect caching versus fresh
change checks. It does not qualify a data-dependent snapshot, native source coercion
or installed lifecycle. Boolean short-circuit never hides unknown branches. Depth/
node/size bounds and source/provenance/callback preservation are maintained R tests.


C30 extends `constant-filters.json` to58 contracts:34 supported workflows and24
retained boundaries. Four false-effect envelope inputs previously produced+5 and
now stay unavailable. The maintained regression gathers all four failing-before IDs;
the shared normalization restores gates before suppression.44 native guard observations
include10 unavailable workflows and do not qualify those source envelopes. Existing
C29 historical hashes/counts stay preserved; final focused mounted checks cover58
contracts at both widths.


C31 `initial-filters.json`:50 contracts,30 supported source/default/initial scalar
workflows (all fail before) and20 explicit unqualified boundaries. Native schema,
base/embedded/getRollData/collection/field methods independently establish30 phase
captures, including reads before earlier sorted changes and priority10 global floor.
Raw mod/global99, initialized values and later operands are separate; source is
unchanged. Missing save coefficient0 is shared with numeric preparation. Two known
C29 examples gain `initialTruth` source-workflow expectations; the constant-only
helper/oracle remains strict and unknown-field OR branches stay unavailable.
Primitive/model-shell/domain stubs are declared; not full DataModel/source lifecycle
or native/operator acceptance.


C34 `initial-collection-filters.json`:83 independently declared contracts,58 supported
initial String/Set workflows and25 explicit boundaries. All58 fail on archived C33
with unchanged inputs and pass after shared preparation. Exact primitive cleaning/
initialization,filter and native initial collection/apply methods compare88 captures
(30scalar/58collection). Explicit parents,default/trim/dedup/source preservation,
unknown literals,empty/any/all/subset/mixed trees and earlier-change/later-normalization
phase separation are recorded. Unknown/malformed/nested/final/Item/status/flag cases
remain unavailable. Serialized Set provenance is not a full native prepared snapshot.


C35 `initial-class-filters.json`:44 contracts,30 supported explicit class-source
workflows,13 unqualified Actor workflows and one helper-only missing-items input
outside the SDK Actor contract.30 same-input failures on C34 pass after shared base
facts. DetailsField nonpersisted level0 and actual Character base/class/Proficiency
methods compare all thresholds,multiclass and no-class0/prof1. `initial-filters.json`
now explicitly supersedes its old class-level-not-qualified boundary:31 supported/
19 unqualified scalar cases,with source/global poison still ignored. Together with
58 collection captures,the maintained native initial-field comparison records119.
Historical C31–C34 counts/hashes remain unchanged in their portable records.
