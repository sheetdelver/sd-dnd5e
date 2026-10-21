# D&D 5e module architecture

`info.json` is the compatibility authority. The module requires Core 0.19.3
and UI API 3.1; the remaining API ranges are declared there. Its experimental
designation is intentional and must not be removed as release housekeeping.

The adapter enters Core's deterministic preparation pipeline without writing
derived values back to Foundry. Current normalization still depends on some
prepared-looking inputs and fallback values. Sheets, cards, item rows and modals
also contain overlapping raw reads and calculations; they do not yet implement
one complete native rule interpretation.
Core owns authorization, world/session lifecycle, roll execution and shared
chat/media/dice presentation. Use public SDK contracts, not private host APIs.

The active implementation architecture is defined by
[ADR-0001: complete character lifecycle](adr/0001-complete-character-lifecycle.md)
and the [current audit](audits/2026-10-19-character-lifecycle.md). The planning
reference is the current Foundry-installable D&D system **6.0.6**, requiring
Foundry **14.367+**, with 2024 rules primary. This is a future implementation
target, not a new compatibility claim for module 0.4.1. See the
[native source map](reference/native-6.0.6.md) for exact release provenance and
[verification matrix](plans/0001-verification.md) for completion evidence.

## Current executable boundaries

- The UI manifest registers the sheet, initiative modal and stylesheet. It has
  no builder/tool/dashboard action. The server entry exposes read-only D&D content
  metadata routes; rules-bearing write commands remain unimplemented.
- Bounded source-derived numeric ability/save/skill formulas are available;
  unqualified rules and unknown contexts disable these controls with reasons.
  Weapon/spell controls currently request `item` rolls that the adapter does not
  resolve. They are not complete native activity execution.
- Rest controls currently perform partial HP/temp-HP changes only. Hit-dice,
  slot, resource and item-use recovery remain unimplemented.
- Conditions, defenses, proficiencies and appearance include placeholder
  presentation. Modern spell preparation/properties and physical Item weight
  schemas are incompletely read. The active audit records reproducible examples.
- Versioned native world settings are declared and decoded from immutable public
  host snapshots. No maintenance migration is needed for these pure projections.

The proposed architecture separates versioned pure rules/preparation, caller
projections, server action/receipt orchestration and UI intent. Dynamic optional
content needs the external host capability documented as E01; other host limits
have bounded qualification tasks. No Core or sibling changes are authorized by
that plan. Native-runtime research remains parked.

The self-hosted fonts and their provenance/licenses are documented in
[assets/fonts/README.md](../assets/fonts/README.md).

## Initiative

Core resolves a saved GM override first, then the module formula, then its
generic fallback. The HUD adapter reuses the module's roll frame and returns
only a roll choice or final manual total. The resolved formula and audience
are read-only; default execution preserves the expression, while permitted
Advantage/Disadvantage choices are explicit overrides.

Sheet bonus/configuration fields do not recalculate the HUD formula. Centering,
scrolling and narrow-screen button layout belong to the shared module frame.
This integration does not provide native Foundry browser-hook/effect parity.

## Preparation limits

Experimental status includes known differences between module-prepared and native
values. The existing prepared-actor tests preserve bounded behavior; they do not
prove complete native rule parity. ADR-0001 implementation is in progress; its complete-lifecycle acceptance remains open. Native preparation-runtime research remains
separate from shipping functionality. No connected native frontend or backend
browser is required for normal module operation.

## Distribution and verification

`info.json` declares the module version and API compatibility. CI/release
workflows use the released Core `v0.19.3` toolchain. Release assets
include the package archive, checksum, catalog manifest and release history.
A module release tag identifies the matching manifest version.

Repository workflow and verification commands live in [AGENTS.md](../AGENTS.md).
The shared contracts are described in Core's
[module authoring guide](https://github.com/sheetdelver/sheetdelver/blob/v0.19.3/docs/MODULE_AUTHORING.md)
and [release process](https://github.com/sheetdelver/sheetdelver/blob/v0.19.3/docs/RELEASING.md).

## ADR-0001 verification foundation

Module-owned `npm test` enumerates tooling and module suites. `npm run typecheck`
explicitly includes every source/UI/server/test/migration hook file, independent
of Core's root exclusions. Both accept `-- --core /path/to/core`. No host files
are generated. `npm run check:package` uses retained temporary data/output and
read-only toolchain aliases; it starts no service.

`npm run test:native-source -- --native /path/to/dnd5e` reads pinned Git objects,
not HEAD. The versioned fixture index distinguishes source, manually independent
expectations and absent native captures. Static inventories do not establish
formula support, grant closure, runtime behavior or native/operator acceptance.

## Rule context and content foundation

`src/logic/rules-context.ts` accepts the host's immutable world snapshot. Exact
system6.0.6 / Foundry14 build367+ is the selected schema boundary; legacy worlds
are labeled `legacy-limited`. This is context readiness, not completed rules
automation or later-build native acceptance. Missing/invalid settings remain
unavailable; the module never applies a local default to an unreadable setting.
CalendarConfig has no declared default because its Foundry field initialization
has not been independently qualified. Consumers must require their own inputs.

`src/logic/native/6.0.6/source.ts` decodes detached Actor/Item identity and
advancement/activity collections. It preserves source fields, editions,
origin/root links and owned IDs. Arrays and keyed advancements are accepted;
collisions, mismatched IDs and unknown types are diagnosed. No decoded value is
written back. The adapter publishes context/capability readiness separately from
its old numeric projection, which remains explicitly unqualified pending M2.

M2's bounded replacements are `src/logic/preparation/skills.ts`, `abilities.ts` and `tools.ts`:
modern PC numeric skill checks/passives, ability checks/saves and independent tool checks derive from
class levels, source ability scores, proficiency multipliers, constant bonuses
and initialized global proficiency targets. `character-profile.ts` shares prerequisites,
class-level proficiency, constant parsing and numeric representation checks.
Source `total/passive/mod/check.value/save.value` are never reused as an oracle.
Adapter execution and both layouts consume the same result/formula. Cards also
consume `characterFacts` with explicit value/status/reason/provenance; missing
facts never select old source/default numbers. C06 corrects DD-R03 across card
projection and both headers/proficiency controls. Known class facts survive
unresolved equipped armor; unknown context/class data/effects remain unavailable. This subset supports
normal rolls and numeric situational bonuses within the released host literal
limit (absolute1e9). C08 restores normal/source/manual advantage and disadvantage
for homogeneous plain d20 selection using existing public Core primitives. Source
modes determine defaults; native-consistent explicit buttons override them.
Focused/hovered buttons preview the actual selected formula. Forty equal-valued
index differences are nonblocking diagnostics, with actual host records unchanged.
This supersedes C07's blanket execution restriction; wider E05 remains open.
Opposed sources cancel to a normal roll;
C11 permits selected source abilities for skill/tool checks; unqualified bonus
expressions and alternate generic ability/save requests remain rejected. It is not
the complete native skill/ability/save/tool interpreter. Active effects,
conditions, equipped equipment/encumbrance, active native Actor flags,
proficiency dice, unsupported abilities and missing inputs yield explicit unavailable
checks. Valid source modes share numeric execution; malformed modes remain unavailable. UI disables them
and passives render an unavailable state instead of a guessed10 within that
tested branch. The [independent review](audits/evidence/2026-10-19-c01-c03-review.md)
identified two exceptions corrected by C04: all four native die-range scopes now
block unqualified execution without altering known totals/passives (DD-R01), and
unknown/unsupported context produces unavailable values and rejects direct rolls
(DD-R02). Legacy fallback requires an explicitly supported `legacy-limited`
profile, never missing prepared checks. Configured bounds, malformed bounds and
combined ranges remain unavailable until Q00 qualifies equivalent execution.
Ability/check/save range scopes apply the same execution gate. Check/save totals
remain distinct from base ability modifiers; a check bonus does not change the
displayed score. Only six standard ability scores0–30 and the explicit numeric
profile are qualified. C06 corrects DD-R04: `roll-initialization.ts` creates
separate detached global check/save/skill/tool configs with verified initial0
for nonpersisted proficiency, preserving persisted bonus/mode/range fields.
Source fields remain unchanged. Effects must be qualified through future phases;
stale source proficiency is never an effect substitute. Eight intermediate-model
arithmetic expectations remain separate from eight source/default expectations.
Other numeric domains (including HP/AC) and the legacy
compatibility projection remain unqualified.

`getSystemDataForUser` and GET `content` / `content/detail` under
`/api/modules/dnd5e/` use only the supplied caller runtime. Catalog supports
`page`, `pageSize` (1–100) and optional `packId`; detail takes a typed canonical
Item `uuid`. The static declared reader cannot page its underlying read; result
paging is module-local and transient. No additional world/content cache exists.
Caller access, native source exclusions and current world identity/revision are
checked around reads. World/owned detail requires observer access. Optional
undeclared packs expose E01 availability only; full reads fail before dispatch.
Owned Items can still be inspected when their original catalog is gone.

Responses allowlist metadata; they omit raw source, flags, ownership and
descriptions. Unidentified names/provenance are concealed. Description rendering
remains an explicit Q03 unavailable state. This endpoint is not a complete
builder catalog/choice validator. Required ItemGrant closure uses exact UUIDs
on caller-authorized supplied sources, with missing/cyclic/limit failures;
optional pools and description/provenance backlinks are not required grants.

Core0.18 lacks world context and caller-safe projection. These contracts are
released in module-api1.5 (Core0.19.0); Core0.19.3 is the selected tested baseline.
The manifest floor and CI/release pins align with that actual dependency.

Skill/check/save intents bind to Actor identity, host world/epoch/context/source
revisions and the current prepared projection. Both layouts use the same
`usePreparedRollIntent` controller. Modern previews and confirmation use the
same `numericD20Roll` compiler as direct adapter execution; unsupported bonus
expressions disable submit rather than showing an executable formula.
ModalHost hides stale roll controls immediately and retires the slot; mounted
callbacks also carry a transition token and an unmount fence so recovery cannot
revive prior intent. This is consumer intent state, not a world cache or a write
receipt protocol. Core still validates the current prepared revision at execution.

`npm run test:mounted -- --browser-tools /path/to/test-tools [--chromium /path/to/executable]`
runs maintained isolated React/Chromium fixtures with fresh contexts and all
requests intercepted. No fixture service is started. Playwright stays outside
module/runtime dependencies; missing tools fail instead of skipping. Explicit
typing includes `tests/browser`. These mounted module tests use a test SDK
presentation seam and do not establish installed Core I/U or native N/O parity.

C07's `test:public-rolls` launches Core's normal entry point with an isolated data
root, synthetic loopback transport/users, and test-only dependency entropy. A
fixture module calls actual request-bound `runtime.rolls.roll` after public player
login; no private Core import, live Foundry, new module runtime evaluator or
production configuration is used. All901 totals/serialized faces and numeric
distributions match. Forty tied adv/dis pairs retain index1 where exact native
BasicDie retains index0. RV03 confirms all901 selected values/counts, ordered
faces and discard consistency match; no unequal pair differs. Its recommended
plain-profile equivalence records tied-index differences without disabling
otherwise qualified rolls. This does not change Core's generic keep/drop
contract or claim support for die-identity-sensitive rules. At C07 the strict
qualification command exited2. C08 corrects that overbroad criterion and
execution guard (DD-R05), as recorded below. Wider E05 remains open.
Silent numeric execution is qualified only within the bounded fixture; full
Actor-route, chat/audience/critical annotations, installed UI and native/operator
acceptance remain open.

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

### Independent tool projection (C09)

`tools.ts` prepares one `derived.tools` mapping and a collection availability
reason. The adapter, shared roll compiler/intent controller and Tool checks
block consume it. Desktop places it below Skills; mobile includes it in Skills.
Presentation only formats the prepared identity, ability, multiplier, total and
reason. There is no second tool cache, transport, rules calculation or evaluator.

The exact Actor mapping key must be one of release-6.0.6's36 tool or4 vehicle
identities. Labels are display-only; Item names, configured content UUIDs and
owned Items never create proficiency or substitute identities. Existing entries
initialize missing ability to INT and value to0 from verified schema declarations;
missing entries create no checks. Required numeric ability scores remain explicit.
The tool schema's INT default is distinct from CONFIG.tools' suggested abilities.

The qualified total is ability modifier + floor(class proficiency × source
multiplier) + numeric tool-local, ability-check, global-check and global-tool
bonuses. Persisted modes from those four scopes combine through the existing
shared interpretation. Initialized global proficiency targets remain0;
nonpersisted tool `bonuses`, prepared `total/mod/prof/effectValue` and stale global
proficiency fields are ignored. No source field is modified. Active effects and
flags remain unavailable until their preparation phases are qualified.

Independent checks use the same plain-d20 numeric execution qualified at C08.
Native selected skill/tool combinations also take maximum proficiency and may
add advantage. At C09 the compiler rejected combination/alternate ability
requests; C11 below supersedes that restriction for qualified skill/tool choices.
Pace,
Item activities, expressions, ranges and shared profile exclusions remain gated.
Range blockers preserve independently known totals; they add no passive bonus.
No tool passive score is invented. The visible boundary and stale-intent fencing
apply to both layouts. C09 evidence is R/S plus isolated mounted/public-host
fixtures, not installed UI or native/operator qualification.

C10 corrects DD-R06: shared numeric roll previews track focus and hover separately.
A focused action takes precedence over hover on another action; blur restores
hover, and neither restores the configured source default. Execution and host
serialization are unchanged. Maintained mounted tests cover pointer exit with
focus retained, keyboard submit, focus transfer, blur and default restoration.

### Configurable source checks (C11)

`prepareSkillToolModel606` creates `derived.checkConfiguration` once per prepared
Actor revision. It holds detached source operands, verified tool defaults,
qualified class proficiency, ability scores/check scopes and exact skill/tool
identities. Nonpersisted targets/counts and prepared-looking totals are excluded.
`configureSkillToolCheck` is the single calculation for independent/default
Skills/Tools, selected modal previews and direct adapter requests. The existing
plain-d20 compiler handles the resulting total/mode and numeric situational
bonus. There is no UI formula, additional evaluator, transport or world cache.

A selected combination takes max proficiency and adds automatic advantage if
both source multipliers are positive, even when a half-proficiency flat bonus
rounds to0. It never stacks bonuses from both resources: only primary local roll,
primary global skill/tool, selected ability check and global check contribute.
Secondary proficiency availability is independent of its unused bonus/mode/range
or ability. Primary and selected-ability ranges still block execution. Global
proficiency remains verified initialized0 until effects are implemented.

Shared modal selectors pass exact IDs and optional ability. Empty selection
means cleared/default; null, malformed, missing or unsupported choices reject
with a reason. Unknown rule options require qualification; existing legacy
behavior gains no combinations or alternate abilities. The modal updates heading,
preview and configured default mode together; all buttons explicitly override
that mode. Changing/clearing the secondary recomputes dependent proficiency and
mode while preserving a valid ability choice. Clearing ability restores the
primary source default. No choice changes the static independent passive score.

Every choice configures a fresh request with its final ability, equivalent to
native #rollSkillTool(config) followed by _buildSkillToolConfig. Native internal
formData changes are a different phase: they rebuild parts/ranges with the new
ability but retain initial process mode. C11 compares and documents both; it
makes no claim of native UI identity. The source/context/model participates in
intent signatures, so secondary source loss retires the whole modal and retained
callbacks; recovery requires a new review. R/S/mounted/public-host evidence does
not close installed UI or native/operator gates.

### Effect eligibility and phase boundary (C12)

`planEffects606` emits detached initial/final changes, stable priority order and
per-effect eligibility decisions in `derived.effectPreparation`. Modern source
uses `system.changes`; initialized missing phase/type/priority use initial/add/
native operation priority. Source remains unchanged. Only proven disabled,
no-change or Item-suppressed effects can currently leave numeric checks ready.
Actual active field changes, filters, statuses, time-dependent expiry, legacy
migration and owned Item preparation stay explicitly unavailable. Nontransfer
Item effects are not harmless: they can change class data before Actor preparation.
This is a static eligibility foundation, not completed effect support.

### Detached initial numeric effects (C13)

`prepareNumericEffects606` interprets the eligible initial numeric field subset
once per adapter preparation. It clones persisted operands, initializes global
proficiency targets to verified0, applies ordered qualified operations and emits
applied-field provenance separately from source. Character facts, abilities and
checkConfiguration consume this same result. No effect output is reclassified
as persisted source. The prepared skill/tool model retains raw post-initial local
multipliers separately from global proficiency targets; independent projections
and configured fresh requests use native scope rules and floor once.

Combined automatic advantage tests both independently prepared proficiencies,
including global targets, while the selected request computes proficiency using
only applicable selected scopes. Effects join roll-intent signatures, retiring
callbacks on relevant provenance changes even if a total stays equal. Source
bonus/mode/range semantics and explicit manual overrides remain shared.

This supersedes the blanket C12 active-field restriction only for initial
NumberField ability score/save proficiency, known local skill/tool multipliers
and global check/save/skill/tool proficiency targets. Finite numeric literal
changes support add/subtract/multiply/override/upgrade/downgrade and bounded
native cleaning. Invalid global choices, unsupported initial source values,
FormulaFields, final changes, filters/status/time/dependencies/Item phases and
custom operations remain explicit unavailable. Final source operands must never
be treated as initial inputs to recompute already-derived fields.

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

### Equipped armor phase (C18)

`NumericEffects.equipment` holds one detached `prepareEquipment606` result, with
canonical owned IDs, initialized base/magical armor inputs, verified equipment
registry types, source-order armor/shield selection and diagnostics. It is not an
Item cache or persisted preparation. No native getters or source names are trusted
as mechanics. Existing checks can proceed with this bounded equipment profile;
unknown Item/effect/migration/formula dependencies retain explicit reasons.

`SkillToolModel.modeStates` remains the initial passive phase;
`executionModeStates` adds the exact post-passive armor Stealth count. This prevents
retroactively changing native passives while keeping fresh roll configuration,
combined/alternate requests, previews and direct execution in agreement. The
prepared equipment identity participates in intent retirement. AC registry
eligibility, shield contribution, caps and warnings use the same equipment result.
Both headers/blocks format one fact; no UI arithmetic or additional world cache.
Source identity, metadata, extension fields and original Item values remain intact.
