# D&D 5e module architecture

`info.json` is the compatibility authority. The module requires Core 0.19.3
and UI API 3.1; the remaining API ranges are declared there. Its experimental
designation is intentional and must not be removed as release housekeeping.

The adapter enters Core's deterministic preparation pipeline without writing
derived values back to Foundry. Bounded modern numeric, health, AC/init, equipment and movement/senses domains
now share source/default/qualified-effect preparation. Remaining activity,
spellcasting, trait and legacy surfaces still include raw reads/fallbacks; a
complete native rule interpretation is not implemented.
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

Latest bounded M2 behavior includes C73/C74 empty-feat final Actor custom text and
C71/C72 transferred Item Actor-target initial
custom text, with original owned Item/effect IDs and source/default receipts. Existing
Item eligibility/defaults gate those effects. Both layouts, cards and roll intents
consume the same detached preparation. General Item final preparation and Item/condition text
composition remain unqualified; historical blanket initial-Item-text restrictions below
are superseded only by this profile.

- The UI manifest registers the sheet, initiative modal and stylesheet. It has
  no builder/tool/dashboard action. The server entry exposes read-only D&D content
  metadata and caller-owned command-status routes. C33 supplies server journal/queue
  infrastructure; domain review/execute and rules-bearing writes remain unimplemented.
- Bounded source-derived numeric ability/save/skill formulas are available;
  unqualified rules and unknown contexts disable these controls with reasons.
  Weapon/spell controls currently request `item` rolls that the adapter does not
  resolve. They are not complete native activity execution.
- Modern health/rest mutation controls are gated pending M3/M4. Selected legacy
  retains partial HP/temp-HP compatibility; complete HD/slot/resource/Item recovery
  remains unimplemented.
- Conditions and appearance include placeholder presentation. Proficiencies now
  expose bounded source facts; modern spell preparation/properties and physical Item weight
  schemas are incompletely read. The active audit records reproducible examples.
- Normal configured d20 bounds use the shared compiler and explicit mode
  readiness. Bounded adv/dis stays gated. The formula-only HUD hook is gated for
  bounds because it cannot express Normal-only overrides; sheet Normal is available.
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
Unqualified FormulaFields,other final fields,filters/status/time/dependencies/Item
phases and custom operations remain explicit unavailable. C48 qualifies only final
Actor-owned roll-mode fields after earlier passive/score preparation. Final source operands must never
be treated as initial inputs to recompute already-derived fields.

### Constant FormulaField adaptation (C14)

Qualified initial add/subtract/override effects on constant roll/passive bonus
operands now share the detached NumericEffects path. Applied provenance keeps
the native FormulaField construction; effective numeric operands feed checks,
saves, tools, skills, passives and fresh configured requests. This is operation
reduction on known scalar inputs, not an arbitrary expression parser. Nonempty
unknown expressions, references, multiply/upgrade/downgrade/custom FormulaField
operations and other final phases remain unavailable. Numeric NumberFields retain
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
unqualified cases remain gated. Literal deltas-1/0/1 only; C48 separately qualifies final Actor-owned mode fields. Other effect
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
`NumericEffects.executionModes` adds the exact post-passive armor Stealth count and
initiative condition counts before qualified final mode changes. SkillToolModel
formats this shared snapshot as `executionModeStates`. This prevents
retroactively changing native passives while keeping fresh roll configuration,
combined/alternate requests, previews and direct execution in agreement. The
prepared equipment identity participates in intent retirement. AC registry
eligibility, shield contribution, caps and warnings use the same equipment result.
Both headers/blocks format one fact; no UI arithmetic or additional world cache.
Source identity, metadata, extension fields and original Item values remain intact.

### Movement/senses source and phase boundary (C19)

`prepareMovement606` creates detached movement and sensory facts. Literal
FormulaField initialization stays distinct from numeric preparation so source0
becomes string"0" and is not accidentally treated as missing during inheritance.
Species resolve by exact owned source ID; unresolved required references never
select the first or same-name Item. Actor and species unit provenance stay separate
and the native inheritance phase performs no implicit numeric unit conversion.
Movement multiplier ignores nonpersisted source poison; max/slowed precede derived
jump. Armor reduction consumes the same selected armor identity plus verified
source strength and initialized ability values. Scalar notes trim in preparation,
preserving original source. Movement/senses and jump availability are independent.

Modern speed/senses no longer expose synthetic30ft or raw flat aliases. One shared
readout drives both layouts and mobile sensory details. Explicit selected legacy
retains a labeled unqualified compatibility projection. Legacy alias migration,
conditions, Item/movement effects, wider formulas/units and canvas/travel automation
remain unavailable or separate ADR scope; these read facts do not authorize writes.

### Range execution qualification boundary (C20)

The test-only range tables/oracle are independent of module preparation. Native
range contributions preserve raw faces and ordered count modifiers, including
crossed bounds. A separate public-host harness preserves actual serialization
and checks entropy, counts/flags, totals, distributions and exact selection.
Normal bounded d20 is qualified; bounded advantage/disadvantage remains gated
under its strict criterion. The plain equal-value index equivalence is unchanged.
C20 adds no runtime compiler behavior; C21 must share normal-range compilation
across preparation, preview and dispatch before removing those normal gates.

### Normal-range compiler and explicit mode readiness (C21)

`prepareD20Configuration` shares source-range validation/aggregation and compilation
across skills/tools/abilities/saves/initiative. Only a qualified Normal mode emits
configured min/max modifiers. `unavailableReason` blocks an entire request;
`defaultUnavailableReason` identifies a known but unqualified default mode, allowing
an explicitly selected Normal alternative without context/data fallback.
`preparedRollReviewable` and default execution readiness are distinct; shortcuts
require the latter. Dialog mode buttons use requested-mode resolution, not the
availability of the currently previewed mode. Held callbacks still validate the
current identity/source/context token before dispatch.

The formula-only public initiative HUD hook cannot restrict overrides, so configured
range formulas are explicitly unavailable there. Character-sheet checks consume
the same prepared normal formula. No synthetic leading term, host rewrite, private
runtime import or compatibility bump disguises this limitation. Fixed no-die
initiative remains separately qualified. Earlier checkpoint descriptions of all
range execution being unavailable are historical; C21 supersedes normal profiles
only. Wider formulas/flags/groups/ranges/phase and installed/native/operator gates
remain open.

### Item eligibility initialization

The shared detached effect plan initializes equipped/attuned defaults only for
release6.0.6's five EquippableItemTemplate schemas, before evaluating transferred
Actor-effect suppression. Origin metadata distinguishes source, missing defaults
and null cleaning and participates in roll intent identity. Other Item schemas
cannot acquire those fields from extra raw source properties. Consumable type and
attunement strings use qualified native trimming; rod/trinket/wand require equip,
ordinary consumables do not. Required attunement still suppresses when unattuned.
Malformed/unknown/legacy-coercion cases and active dependencies remain gated.
This is source/default eligibility plus existing qualified initial changes, not
Item model initialization, creation hooks, Item-target effects or final phases.

### Species source identity

`resolveSpecies606` cleans the stored local reference and resolves only that owned
Item identity. Movement/senses and `prepareSpeciesIdentity606` share the resolver;
no card/header performs its own Item selection. The identity fact is source-only,
so a valid label/UUID can remain visible when unrelated class or movement rules
are unavailable. Canonical identity and edition are preserved without conversion.
Native fallback strings have `source-text` status and no Item UUID; they never
trigger same-name/first-Item substitution. Missing selection, unavailable context
and malformed references have separate statuses/reasons. Both headers expose the
same fact and diagnostics; cards and `getRaceData` share it. Selected legacy first-
Item presentation remains explicitly unqualified. Item effects/grants/prepared
traits do not follow from a source identity label.

### Defense traits

`prepareDefenseTraits606` initializes detached source String/Set defaults and
performs condition-free native ALL/immunity/resistance normalization. Damage and
condition registry identities/English labels are pinned source facts; unknown IDs
are unavailable, never inferred from names. Damage bypasses annotate physical types
only; SimpleTraitField condition immunities cannot acquire a bypass property from
raw poison. Custom text and constant FormulaField damage adjustments preserve
native order/cleaning. Broader expressions remain unavailable per category.

The same prepared category displays feed cards, desktop `Defenses` and the live
mobile `DefensesModal`. Modal content reads current context/source without stored
fact snapshots or write callbacks; accessible heading association uses the shared
frame. A known trait remains independently readable when class/armor preparation
fails. Qualified initial trait-set/constant-adjustment effects use the shared pipeline.
Unqualified active conditions/effect phases gate affected facts; this does
not implement damage application, condition rules or legacy expansion. Preparation
never persists values or creates a second document cache.

### Initial trait effect operands

The detached initial-effect pipeline uses the same StringSet initialization helper
as defense preparation. Literal Set deltas parse JSON before casting; comparisons
use untrimmed operands, with post-operation cleaning and native order preserved.
Registered value/bypass fields alone are accepted; CI cannot gain a bypass field.
Native multiply is a qualified no-op, while upgrade/downgrade require superset/
subset membership and can reorder equal sets. Raw arrays, references and unknown
IDs remain unavailable. This is a bounded typed-field adaptation, not a native
DataModel, condition/filter implementation or another dice evaluator.

Applied provenance records source/default origins, before/delta/after arrays and
actual constant FormulaField construction. Reduced numeric operands are not
persisted field strings or claimed native prepared model data. The existing shared
compiler and current-source intent fences consume these results. Native/operator
acceptance, actual damage commands and unqualified final/Item phases remain open.

### Roll proficiency formatting

Skills and saving throws share `ProficiencyIndicator`, a formatter of already-
prepared effective coefficients. It preserves0 versus unknown, handles the native
1.5 coefficient explicitly and labels2 as double proficiency without inferring a
particular grant. Saving throws map their known boolean to a display coefficient;
null remains unavailable. Static coefficient and execution availability stay
separate, including bounded source advantage. This is not the actor proficiency
bonus or stored armor/weapon/tool training; those distinct values never derive
from the marker. Preparation/preview/shortcut/direct execution are unchanged.


### Source training and language presentation (C27)

`prepareTraining606` consumes the same detached initialized/effect operands and
local skill/tool model as check preparation. It never infers armor, weapon, tool,
language or mastery grants from a name, class, effective roll coefficient or old
prepared-looking fields. Local tool coefficients remain separate from the global
proficiency floor used in execution. Invalid class/ability/roll preparation does
not erase independently qualified local training. Unknown contexts never select
legacy; the selected legacy training projection remains explicitly unqualified.

The prepared training DTO supplies cards and the desktop/mobile Proficiencies
block. Registered groups and canonical English language labels/order come from
pinned configuration/localization methods. ALL languages, selectable Primordial
groups, custom semicolon entries (including duplicates), and positive communication
ranges with known units/defaults preserve native presentation. Missing range
context leaves independently known spoken languages visible with a partial reason.
No ambient user locale/session is read during deterministic preparation.

Individual armor/weapon/mastery source keys retain literal identity and known
canonical reference UUID metadata, with labels explicitly unresolved. These static
native identity references are not pack discovery, a premium allowlist or an
access grant; preparation never reads a private base Item index or fetches content.
E01 caller-authorized enrichment remains external. Additional mastery properties
are conditional stored options, not additional mastered weapons or active Item
execution. Source/mastery fields are persisted; nonpersisted source poison is
ignored. Effects outside the qualified initial local tool subset still gate facts;
source trait-set effects await their own bounded qualification.


### Initial training Set effects (C28)

The same ordered initial-effect pipeline now accepts persisted armorProf.value,
weaponProf.value, languages.value and weaponProf.mastery.value/bonus targets.
`trainingSetField606` provides one pinned identity vocabulary for target validation
and language selection; it is immutable rule metadata, never a world/content cache.
Registered armor/weapon group or base identity keys and language ALL/selectable
keys are distinct from mastery weapon/property identities. Native StringField
accepts wider IDs, but effects outside this independently qualified vocabulary
remain unavailable rather than inventing grants. Specific Item labels still stay
unresolved as established by C27; a known UUID is not content permission.

Source/default/null-cleaned origins, untrimmed delta comparisons, JSON parsing,
priority/order, typed-field results and later presentation stay separate. Existing
Set add/subtract/override/superset/subset and multiply no-op semantics are reused;
no new evaluator or UI-only application exists. Source/raw nonpersisted poison is
unchanged. Cards, both panels, previews and execution share the detached results,
and source changes retire intents even when numeric totals are equal. Filtered,
final, unknown/coerced/reference/custom-string targets and condition/Item phases
remain explicitly unavailable. This supersedes C27's pending initial training Set
restriction only within the declared identity/operation profile.


### Snapshot-invariant effect/change filters (C29)

`constantFilter606` qualifies only root empty JSON definitions and correctly shaped
boolean-only AND/NAND/OR/NOR/XOR/NOT trees. Every branch is validated before boolean
logic; a true OR cannot hide an unqualified property comparison. Unknown operators,
malformed/coerced definitions, data-dependent paths and bounded-size/depth/node
excess remain unavailable. This pure boolean guard is not a roll evaluator or a
replacement-data snapshot. No ambient locale, property lookup, clock or cache exists.

The shared effect plan records original definition/default provenance and result.
A false effect suppresses its changes/status contribution; a false change skips only
that change. Existing type/duration/flag/Item eligibility and malformed-status gates
are preserved. Unknown targets or final phases behind a proven false guard are not
applied. Source definition changes retire held intents even when outcomes/totals
agree and a fixture retains the same source revision. Source is never rewritten.

Pinned native methods show effect conditions cache their first evaluation, while
change conditions use current phase replacementData. C29 is safe across those
lifetimes only because its trees read zero snapshot properties. It does not use raw
source/current derived data as a substitute for native initial/final getRollData.
Data-dependent filters, active conditions/flags, Item/final preparation and wider
formula semantics remain unqualified; Q02a/M2 stay open.


### Effect envelope validation precedes suppression (C30)

Before evaluating an effect guard, the shared plan validates/normalizes each nonempty
change key, supported phase/type and finite priority. False guards can prove valid
unknown targets inactive; they cannot make an unqualified change envelope authoritative.
The same normalized fields feed later condition checks and ordering, preserving
proven empty-key no-ops, source order and typed unavailable reasons. This restores
four malformed/unqualified boundaries missed by C29's whole-effect shortcut. It
adds no source coercion, evaluator, cache, persistence or new roll support.


### Qualified initial scalar filter projection (C31)

The shared filter grammar accepts a second bounded profile: exact and numeric
comparison leaves over explicit integral0–30 ability scores, initialized save
coefficients0/1 and nonpersisted global roll proficiency0 under explicit parent
containers. `initialFilterData606` supplies only these scalar fields and origins;
it is not full getRollData, current derived data, a content/world cache or an
arbitrary property walker. Missing optional roll parents remain unavailable rather
than borrowing C13's arithmetic floor0 as proof of path existence. No formulas,
locale-sensitive comparisons, Item context or final snapshots are evaluated.

Actor-owned effect predicates require a verified first initial evaluation with
no active statuses/riders; per-change leaves require the initial phase. All
conditions are checked before applying any initial change, matching the native
collection/apply boundary. Constant trees retain their phase-invariant path. Every
branch must qualify even when native boolean short-circuit could skip a branch.
Definitions/read values/schema origins enter plan provenance and intent retirement.
Final-only/no-initial effects, derived mods/classes, flags, missing/malformed fields
and source Item replacement remain unavailable. C29's two known initial-field
examples are now qualified; its constant-only helper still rejects dependent leaves.
Unknown-field OR branches remain unavailable.

`initializedSaveProficiency606` provides one proven missing-field default0 on an
existing ability record. It is shared by the filter projection and detached numeric
initialization, so saves/indicators/execution do not contradict the filter. Explicit
persisted0/1 remain authoritative; null/coerced/out-of-profile values are gated.
Defaults are recorded in effectPreparation.initialized and never written to source.
Raw mod/global proficiency poison remains nonauthoritative; qualified effects can
subsequently alter actual operands. This supersedes only the bounded C29 dependent
filter restriction, not wider Q02a/M2 or legacy qualification.


### Command qualification boundary (C32)

Public caller-bound document operations enforce ownership and return actual create/
patch records; embedded/nested parents route through the same SDK. Delete resolves
void. Sequential commit is not atomic and its rejection does not carry earlier
receipts. Journal individual steps rather than assuming a transaction or request-ID
preservation. Public DataStore admission must verify its persisted value by readback;
namespace failure can otherwise resolve without storage. Exact acknowledged IDs
must survive later bookkeeping failure. Executing/unknown outcomes fence that
operation across restart; names, source UUIDs and untrusted tags cannot prove identity.

Core primary reads are source-store reads, not guaranteed fresh native confirmation.
Empty acknowledgements can hide applied writes, and a public absolute patch can
race with an independent native edit while acknowledgement/readback both match the
stale desired value. Actor queues serialize module commands only. Derived-resource
commands need E02's verified native precondition or an explicit conflict-policy
decision. C32 is synthetic public-host qualification; production journal/routes and
native ID/concurrency/operator acceptance remain open.


### Server operation journal foundation (C33)

`src/server/commands/journal.ts` uses public request-runtime DataStore/documents and
server-only crypto for strict JSON digests and review-session identity. Keys bind
module/instance/world/caller/Actor/operation; records contain intent, relevant
fingerprints, ordered step descriptions, context identity, receipts and outcomes,
never a second Actor/world cache. Request-bound domain handlers must construct
plans and revalidate current rules/sources/choices themselves. No generic write
endpoint accepts client patches, formulas, costs or ownership.

The shared coordinator queues Actors across callers; unrelated Actors proceed.
Ownership precedes journal inspection and every write. Domain/owner reads finish
before the synchronous context fence. Persistence must be read back before each
dispatch; steps are individually acknowledged/confirmed and failures stop further
writes. Duplicate IDs return current state; changed intent conflicts. Parsed exact
IDs survive later detail/bookkeeping failures in the returned/local fenced record.
Executing records fence after restart; missing receipts cannot be invented. Prior-
process reviewed records retire, preventing reuse after failed zero-write retirement.
Draft resume and exact-ID reconciliation are future domain work, with fresh review.

`GET /api/modules/dnd5e/commands/status?actorId=…&operationId=…` is inspection only,
requires current owner access and returns only the current caller's operation.
Corrupt records fail closed; source/owner/context changes retire or fence intent.
No automatic replay, speculative rollback or global maintenance mode. Plans are
bounded64KiB/64steps, receipts256 ASCII identities of256 characters plus4KiB details;
aggregate records have8MiB/131072-node/depth24 limits. Future domain handlers must
qualify their acknowledgement shape and bounds before writes. Module-process
serialization is not native/cross-process atomicity; C32/E02's external-edit gap and
native ID/freshness/confirmation gates remain open.


### Qualified initial collection reads (C34)

The existing initial-field filter grammar now accepts primitive Set membership,
any/all/subset and empty checks for thirteen closed trait paths. Explicit parent
containers are required. `initializeTraitSet606` supplies the same proven StringField
trim/Set deduplication used by detached trait preparation; missing/null values are
verified empty defaults. Typed read provenance stores raw source and initialized
members separately. Unknown literal members are exact source comparisons,not content
lookup,training grants or prepared labels/effectValue overrides.

The grammar shares scalar/boolean logic and validates every branch. Initial inputs
are collected before any ordered initial effect application,including earlier Set
adds/subtracts,and before later ALL/immunity normalization. Schema members never
borrow current derived traits. Source/definition edits enter intent identity even
when initialized members and totals stay equal. Source Item/final/status/flag data,
nested object predicates,iterable coercion,Set equality,unknown paths,missing/malformed
parents and oversized/malformed members remain gated. No second interpreter/cache
or browser dependency. Native primitive/model-shell and unrelated-domain stubs are
explicit in the controlled evidence; full preparation parity is still open.


### Shared base class initialization (C35)

`initializeClassFacts606` owns explicit PC class level/proficiency arithmetic and
class-source provenance. Character facts and initial predicate reads consume the
same result; neither reconstructs values from raw details.level/attributes.prof,
labels or prepared-looking fields. It has no effects/context/transport dependency,
avoiding a cycle through effect planning. Existing context/effect/flag/equipment gates
and caller projections remain separate. Explicit levels0–20 and total<=20 qualify;
missing/coerced class values remain unavailable rather than assuming schema default1.

Native nonpersisted details.level initializes0 before Character base summation;
base attributes.prof is assigned by Proficiency.calculateMod (level0 produces1).
Initial details.level/attributes.prof predicates capture those facts before changes.
Class identity/source inputs enter intent provenance even when totals do not change.
No class-specific namespace,Proficiency object,grant lookup,alternate edition or
class-mutating effect qualification is implied. Missing actor.items is outside the
public FoundryActor contract and tested only at the pure initializer boundary.


### Condition-phase boundary established by C36

Active condition behavior remains gated. Controlled native captures establish that
ConditionData source/default initialization,Actor status aggregation and current
Document.active are distinct phases. Initial collection precedes sorted CI writes;
final immunity can remove a status,but later removal of initial immunity does not
add an omitted status retroactively. An eventual shared condition model must retain
that snapshot and then apply qualified immunity filtering,not recompute solely from
final active documents or trust prepared-looking source statuses/levels.

Poisoned adds native ability-check disadvantage counts before skill/tool/passive
preparation; source/manual/combined mode semantics must retain overrides and
suppression. Type/name does not grant an absent status. Three primitive,93 phase/
mode and372 default-build captures provide groundwork only. Manual/alternate/
initiative/source-boundary qualification and runtime/UI integration remain open;
no dice evaluator,world cache or Native preparation runtime is introduced.


### Shared bounded condition preparation (C37)

C37 supersedes C36's runtime restriction only for Actor-owned nonleveled poisoned
documents: explicit type/status identity,verified primitive defaults,constant guard,
no timing/flags/riders/own changes. Effect admission still validates all change
envelopes before suppression. Nonpersisted source level/isSuppressed/hasLevels and
raw prepared-looking condition maps never supply prepared facts; source is unchanged.

`conditions.ts` captures statuses before initial CI writes,then filters final CI.
Removing initial immunity cannot add an omitted status retroactively. After initial
effects,poisoned adds native disadvantage counts to existing ability checks before
skill/tool passives; overrides/suppression survive. The shared configuration/compiler
continues to own selected checks,alternate abilities,manual choices and execution.
Saves are unchanged. Initiative score uses its own source mode; initiative roll mode
also includes ability-check mode. Explicit Normal bounds retain their separate gate.

`derived.conditions` carries effective status,availability,source/default and phase
provenance. Desktop Conditions and the live mobile Conditions modal format it without
recomputing rules. Known condition facts can remain visible when an unrelated malformed
mode prevents rolls. Context,flags,legacy exhaustion and unknown status sources gate
the projection. Source/context changes retire held roll intents and require a fresh
action after recovery. No condition writes,second cache,dice evaluator or native
preparation runtime. Other conditions/levels,dependent filters,Item/final phases and
broader formulas remain dependency-ordered M2 work; C37 is not complete condition support.


### Exhaustion integration boundary (C38)

Exhaustion remains unavailable pending runtime integration. Pinned comparisons
separate nonpersisted condition-map initialization,ConditionData derived level/status
updates,initial guard/status collection,final CI and lazy roll reductions. The map
is initially empty even when raw source contains99; a false initial guard may leave
a previously prepared map entry without effective status/reduction. Last active
duplicate writes its level in source order. Do not collapse these phases to a sum,
maximum,final Document.active or a guessed status from type/name. Modern reduction
is -2 per effective exhaustion level for D20 tests/passives and5ft per level for
speeds,converted before numeric bonus/multiplier; levels cap6 and add dead. Movement
intermediates/effects/source fields remain separately qualified. The eventual shared
path must feed ability/save/skill/tool/initiative/movement and both condition readouts
without writing source or treating raw prepared-looking maps as authoritative.


### Shared modern exhaustion profile (C39)

C39 supersedes C38's runtime restriction only for constant-guard,untimed Actor-owned
exhaustion with empty own changes/riders. `conditions.ts` initializes the detached
nonpersisted map,assigns levels in source order before initial guard evaluation,
collects statuses separately and filters final CI. Missing/null level→1; positive
safe integer→min(6,level). Source coercions/legacy exhaustion stay gated. Level6 adds
configured dead; no status is guessed from type/name. Guard/CI/duplicate phase facts
match C38. The last assigned level and effective status determine one roll/speed
reduction. Raw map99 and virtual source values cannot override it.

Ability/save,skill/tool model (including alternate/selected checks),passives,initiative
and movement consume the same prepared reduction. Initiative score/roll/fixed remain
distinct; fixed0 is valid. Exhaustion and armor reductions add before conversion,
numeric movement bonus and zero-speed handling; nonpersisted raw multiplier remains
ignored. The conditioned mode path from C37 remains separate from numeric reduction.
Source CI provenance joins condition/default/ID provenance for stale-intent retirement.
Desktop/mobile readouts format effective statuses and levels; no editing/writes.
Other condition types,dependent guards,flags/time,Item/final effects and expressions
remain explicitly unqualified. No extra evaluator/cache/runtime/Core dependency.


### Condition family phase boundary (C40)

Additional types remain unavailable pending runtime integration. Controlled profiles
separate effective statuses,Dexterity-save modes,initiative local mode/score,global
execution modes and no-movement/crawl. Dodging depends on absence of incapacity and
no-movement statuses. Native initiative-specific conditions mutate the local field
before score calculation; an ability/global check mode is a separate roll operand.
A resolved numeric mode0 can retain opposing counts; combining another source must
use those counts,not reconstruct from0. Overrides and suppression retain C15's distinct
passive/dispatch semantics. CI can remove a primary status after collection while
secondary statuses remain even when final Document.active is false.

The fixture's source type/status sets are explicit. It does not construct presets,
infer missing statuses,qualify riders/petrification/other combat rules or extend flag/
time/Item/final/formula behavior. A future shared path must supply the same mode and
movement facts to every consumer/compiler,with no UI formulas or new dice evaluator.


### Shared condition mode/movement profile (C41)

C41 supersedes C40's runtime restriction for the eight qualified family IDs only.
`conditions.ts` emits effective statuses,phase-specific mode descriptors and movement
facts. It preserves primary-type CI suppression before collection and per-status
filtering afterward. Explicit status sets may compose within the qualified family;
missing statuses are never inferred. Unknown types/statuses,riders/changes/flags/time
and dependent guards remain unavailable. Poisoned/exhaustion retain their own bounded
source envelopes and prepared level semantics.

NumericEffects applies ability-phase modes before passives. prepareInitiative606
applies initiative-phase descriptors to a copied local state after initial effects,
then shares that state with score and execution scopes. Local resolved mode and
combined execution mode are distinct; counts/overrides/suppression are never rebuilt
from a normalized0. Multiple initiative-disadvantage statuses produce one native
query contribution. Movement consumes shared noMovement/crawl before reductions and
bonus; native jump overwrite follows max/slowed. No UI recalculation or source mutation.

The versioned condition identity helper separates supported source types from labels.
Dodging/dead are exact stored IDs recognized by pinned condition queries/configuration,
not assertions of a preset/content identity. Their presentation/immunity Set operations
share this map; other unknown values stay gated. Desktop/mobile readouts and existing
roll controls consume prepared facts. Static known facts may remain when a distinct
malformed initiative operand prevents only initiative. No new cache,evaluator,transport
or Core contract. This does not qualify full condition/combat/Item/final behavior.


### Petrification phase boundary (C42)

Petrification remains gated pending integration. Pinned phase captures distinguish
initial collected statuses,Actor.statuses after current-CI removal,and rule-effective
statuses after later immunity grants. Traits.prepareResistImmune applies its initial
status deletions before petrification adds ALL resistance,clears resistance bypasses,
adds poison damage immunity and poisoned/diseased condition immunity. Damage trait
normalization follows; DI.ALL clears DR even after the petrification grant.

Poisoned can therefore remain in the collected Actor status set while its rule effect
is suppressed by newly granted immunity. Recomputing from final active documents or
filtering once before all trait phases loses native behavior. The eventual shared
condition/trait path must retain separate snapshots and feed defenses,modes,passives
and movement without source mutation. These captures use explicit status documents
and initialized defense Sets; no preset/rider/source-bootstrap/combat acceptance.


### Shared petrification trait phase (C43)

C43 supersedes C42's runtime restriction for the bounded Petrified source envelope.
Condition preparation stores actorStatuses after existing CI removal separately from
rule-effective statuses after later grants. condition-traits.ts validates qualified
initialized trait operands and applies only petrification's grant phase to a detached
system: DR.ALL,cleared DR bypasses,DI.poison and CI.poisoned/diseased. Existing defense
preparation remains the single owner of DR/DI/DV normalization and its projections.
Unknown/malformed required operands produce unavailability,never guessed Sets.

C46 corrects the initial C43 composition: check/passive/initiative/movement rules
consume preparationStatuses,which captures current-CI queries before late trait grants.
The Actor snapshot and final effective status readout remain separate. Late poison
immunity suppresses final Poisoned queries without erasing already prepared check
disadvantage/passive adjustment. Final Document.active cannot reconstruct these phases. Context/source changes retire held intents; source and its canonical
IDs/ownership/metadata remain unchanged. No new command/cache/evaluator/transport.
Petrified source statuses are explicit Petrified/incapacitated only; other condition
family envelopes,riders/own changes/dependent guards/flags/time/Item/final/formula
boundaries remain. Full native source boot/combat/operator acceptance remains open.

### Explicit Stunned/Unconscious source boundary (C44)

Pinned phase qualification separates explicit statuses from condition preset metadata.
Unconscious's noMovement query works without incapacity; Stunned alone has no movement
restriction. Both affect initiative through explicit incapacity/surprise only. Dodging's
save advantage is disabled by noMovement or incapacity. An explicit Prone status and
the preset's separate Prone rider are different source inputs; preparation must not
construct either from a display name/type. C44 is qualification only; runtime admission
stays unavailable until shared integration. No automatic downed/combat/preset support.

### Explicit incapacity-condition preparation (C45)

C45 supersedes C44's runtime gate for bounded Stunned/Unconscious source documents.
The shared condition preparer admits only explicit own/qualified family statuses and
keeps constant-guard,empty own-change/rider,untimed Actor ownership boundaries. NoMove
includes Unconscious;Stunned alone does not stop movement. Initiative disadvantage
still requires explicit incapacity/surprise. The same prepared results feed status/
movement/passive/save/init/skill/tool controls and direct execution. No preset or Prone
rider is constructed. Actor/context changes retire intent rather than replay a roll.

DD-R07 was discovered after C45 and corrected in C46: the C42/C43 composition of late
petrification grants before ability modes is inaccurate. Native Character preparation
calculates ability modes/passives first. Final rule-effective statuses cannot replace
that earlier snapshot. Historical C42/C43 arithmetic claims for mixed Poisoned profiles are superseded by
C46;defense/status grant observations remain useful.


### Character preparation composition correction (C46 / DD-R07)

The oracle now executes actual CharacterData.prepareDerivedData with trace-only phase
collaborators to assert order,then composes the independently tested numeric methods
in that order: abilities/skills/tools before Traits.prepareResistImmune. Initiative/
movement arithmetic is tested separately;the bounded late grants do not alter their
queried identities. This remains controlled source evidence,not native model boot.

Conditions now expose preparationStatuses (current-CI query snapshot before late trait
grants),actorStatuses (after current-CI deletion) and statuses (final rule-effective
readout after late immunity grants). Mode descriptors,movement rules and reductions
consume the preparation snapshot. Defense grants/normalization and final readouts keep
their later-phase semantics. A mixed Petrified+Poisoned source prepares disadvantage
and passive10,while its final readout omits Poisoned. Manual/automatic mode overrides
and count suppression/cancellation keep native behavior. Source is never rewritten.

### Final mode qualification boundary (C47)

Final roll-mode fields require a separate execution state. Native Character preparation
has already stored passives and initiative scores before final changes run. Reusing a
mutated final scope to rebuild passive/score values would move the effect to the wrong
phase. The frozen1188-case qualification covers constant Actor fields and raw mode/count
combination separately from source initialization and document phase order. Runtime final
effects remain gated pending integration;other fields/filters/Item preparation are not
qualified by these mode cases.


### Shared final mode execution snapshot (C48)

C48 supersedes C47's runtime restriction for qualified Actor-owned constant-guard
final roll-mode fields. `NumericEffects.modes` preserves initial effects/ability
condition counts used for passives and pre-final initiative scores. `executionModes`
clones those states,adds post-passive armor Stealth and initiative condition counts,
then applies final mode operations in the shared plan's priority/source order. Raw
source and the earlier initialized operand snapshot remain unchanged. Final provenance
records effect identity,key,phase,before/value; nonpersisted raw counts stay ignored.

Skill/tool configuration,ability/save execution and initiative previews/direct adapter
rolls consume that one execution map. Fixed initiative scores retain their earlier
local-mode snapshot. Source/default,manual override,combined proficiency advantage,
suppression/subtraction and Normal-only ranges retain existing compiler semantics.
A malformed initiative source remains local to initiative; unrelated qualified facts
are not hidden. Unknown final fields/values/filters or Item-transferred final modes
remain explicitly unavailable. Effect-plan Item identity distinguishes those final
origins; Item-target and Item-final preparation remain separate qualification work.

No browser formula calculation,second cache/evaluator or write route is added. Both
layouts consume the same projected totals/passives and modal compiler; changed source,
ownership/context or unavailable final intent retires held callbacks and requires a
fresh review. Earlier DD-R01–07 and plain-d20 equivalence boundaries remain.

### Final proficiency snapshots (C49 qualification)

Final global proficiency effects cannot be applied to the earlier operand snapshot.
Native skill/tool preparation stores prof/effectValue/total/passive before final effects;
the fresh builder recalculates proficiency from effectValue and current global targets.
Automatic combined advantage retains earlier prof.hasProficiency. Ability checks/saves
retain their earlier proficiency objects. C49 qualifies these distinctions with frozen
independent inputs and actual bounded methods; runtime final proficiency remains gated
pending integration. Raw persisted:false fields still initialize0 and never become
source overrides. Other final numeric/bonus/Item fields remain separate work.

### Shared prepared and current proficiency (C50)

C50 supersedes C49's runtime final-proficiency gate for qualified Actor-owned constant
check/save/skill/tool global proficiency fields. Initial globals remain detached verified
schema defaults plus initial effects. executionGlobals clones them after preparation
and applies qualified final NumberField operations in plan order. The shared skill/tool
model exposes earlier proficiencies and current executionProficiencies. Its compiler
uses earlier independent proficiency for automatic combined advantage and current
selected targets for the fresh roll multiplier. No raw nonpersisted field is trusted.

The independent projection uses that compiler for both snapshots: total/prof describe
the current roll,preparedTotal/preparedProf retain earlier preparation. Passives consume
the earlier total/mode. Both layouts render the current values and the same prepared
bonus note when they differ. Ability checks/saves retain earlier proficiency objects,
including a final global save change that does not recompute an existing save. Changed
source/plan/context retires callbacks; recovery requires fresh intent. Existing mode,
Normal-only range and unsupported Item/filter/formula boundaries remain unchanged.

### Final constant bonus qualification (C51)

The fresh native skill/tool,ability/save and initiative builders read their current
local/global bonus scopes after final effects. Earlier derived totals,passives and
fixed initiative score retain preparation-time values. A selected secondary resource
supplies proficiency/automatic advantage without adding its bonus scopes. Final passive
bonus fields do not recompute an earlier stored passive. C51 qualifies actual constant
FormulaField string construction and builder operands against independent expectations;
validation/evaluation and runtime admission remain separate. C52 must share current
bonus operands across projection and execution without rewriting earlier snapshots.

### Shared final constant bonuses (C52)

C52 supersedes C51's runtime restriction for qualified Actor-owned constant-guard
final roll/passive bonus add/subtract/override operations. executionBonuses stores
only qualified operation results keyed by canonical field path. Earlier initialized
fields remain untouched; applied provenance retains native FormulaField construction.
The shared numericScopeBonus accessor combines the current map with initialized scopes;
it never evaluates arbitrary source expressions. Other operations,unknown fields,
null/malformed operands,Item origins and dependent rules remain gated.

Skill/tool configuration selects current versus prepared bonus operands through its
existing compiler. Shared projections keep preparedTotal/preparedProf beside current
total/prof; passives use earlier totals/modes/bonus. Ability/save checks expose earlier
preparedTotal and current total,retaining earlier proficiency. Initiative preserves
its original fact/score and adds a current roll fact only when needed for nonfixed
controls; fixed scores retain their earlier value. Both layouts render prepared-bonus
notes and current controls from these projections. A compact note explicitly wraps
inside the mobile chip. No browser rules calculation,second source cache or evaluator
is added. Source/plan/context changes retire current dialogs and callbacks.

### Final persisted numeric qualification (C53)

Native prepared skill/tool.value and ability.proficient can differ from raw source
before final effects. NumberField operations must start from those prepared values.
Changing them does not rebuild earlier prof objects/effectValue. Final ability scores
also leave earlier mod/derived totals untouched; current score and initiative tie are
separate read operands. C53 qualifies1300 cases plus three cross-phase compositions
through actual methods and independent expectations. No runtime admission follows yet.
C54 must share earlier effective-coefficient calculation when initializing final fields,
project current scores with earlier modifiers,and use current score only for fresh ties.

### Shared final numeric snapshot (C54)

C54 supersedes C53's runtime final-number gate for qualified constant Actor-owned
ability value/proficient and skill/tool.value fields. Shared proficiency helpers supply
native prepared-before coefficients and existing roll/proficiency projection. finalNumbers
holds current results separately from initialized operands. Provenance records whether
an operand came from the earlier prepared state or a preceding final write. Source
nonpersisted poison is ignored; malformed initial data/flags/containers remain gated.

Ability projections expose current score,preparedScore and earlier mod; score notes
explain divergence. Current finite final scores can exceed30 (schema has no maximum)
without broadening the initial-source0–30 profile or recomputing mod. Fresh initiative
tie reads the current selected ability score/100; fixed score and prepared modifiers
remain earlier. Skill/tool prof/effectValue and ability/save prof objects remain earlier;
a final value/proficient field cannot act as a fresh proficiency override. Both layouts,
previews,shortcuts and direct requests consume these same projections/compiler.

The public qualification keeps exact totals,including IEEE addition order for retained
face + earlier modifier + current score/100. Actual pinned parser/AST methods compare
already-evaluated numeric leaves;no formula parser/dice evaluator enters runtime. Neither
host serialization nor equal-die diagnostic criteria are changed. Other final fields,
flags/Item/time/dependent rules/expressions remain separate qualification work.

C55 qualifies modern persisted Jack/Alert flags separately from other flags: Jack half
proficiency requires a selected skill; Alert supplies initiative proficiency, not a
global-check target. Earlier combined advantage and fixed-score phases stay separate.
864 independent profiles,10falsy defaults and2proficiency-dice boundaries compare
actual pinned methods on initialized shells. Runtime admission remains C56 work.
[Qualification record](audits/evidence/2026-10-22-c55-source-flags-foundation.json)
retains exact sources, commands and limits; no native/runtime acceptance follows.

### Qualified modern source flags (C56)

`sourceRuleFlags606` recognizes only persisted Actor Jack of All Trades and Alert
booleans plus their verified falsy defaults. NumericEffects owns the detached result;
shared gates consult it instead of independently rejecting every nonempty flag object.
Unknown/malformed flags and Item/effect flag operations remain unavailable. No source
fields are rewritten, class-name grants inferred or general flag/legacy rules admitted.

The shared coefficient helper applies modern Jack only with a selected skill. Earlier
prepared positive coefficients control automatic advantage; current globals configure
a fresh roll. It also initializes final skill/tool value operands from the earlier
prepared state. Alert supplies initiative proficiency rather than a check-scope bonus.
It requires qualified numeric proficiency; Alert in a proficiency-dice world stays
unavailable. Ordinary initiative without that term retains independent readiness.
Cards, headers, indicators, passives and roll surfaces consume the existing projections.
[Evidence](audits/evidence/2026-10-22-c56-source-flags.json) keeps native method, mounted
and real public-host observations separate; full preparation/installed parity is open.

C57 qualifies192 final defense Set cases: native normalization precedes final field
operations and must not be replayed afterward. Current Sets can differ from earlier
normalized data. Petrified sheet AllDamage override is separately captured with a
declared predicate stub; no condition-query/phase admission follows. Runtime remains
gated until C58 shared snapshots and consumer tests. [Record](audits/evidence/2026-10-22-c57-final-defense-sets-foundation.json)
keeps actual method/field comparisons separate from source boot/UI/native acceptance.

### Final defense Set snapshot (C58)

`normalizeDamageSets606` owns earlier ALL/overlap normalization for both initial
projections and the final-effect input snapshot. Qualified final Actor Set changes
start there and update `NumericEffects.finalDefenseSets`; each applied record retains
its before/value/delta/phase and prepared-or-final operand provenance. Earlier detached
system fields remain unchanged. Defense projections consume the final map and skip
normalization replay. Final data may legitimately contain an overlap or ALL plus a
specific value. No UI consumer calculates a defense rule or stores another copy.

The bounded profile requires known initialized defense Sets, qualified primitive
literal deltas and no condition preparation. Unknown/reference/malformed inputs,
Item origins, final training/custom String/formula fields and condition compositions
remain unavailable. In particular,48 petrified field-model cases do not authorize full
final CI/status/query behavior. Earlier condition/check preparation stays separate.
Cards, desktop/mobile defense readouts and physical bypass descriptions share these
facts; existing intent signatures include the changed effect receipts.
[Evidence](audits/evidence/2026-10-22-c58-final-defense-sets.json) distinguishes actual
method/field construction, regression, mounted/public-host and native/operator limits.

C59 qualifies90 final training Set field/label/getter configurations. Final language
values differ from earlier cached labels; native sheet uses the cache while current
armor/weapon/mastery fields and conditional options remain dynamic. Raw prepared-looking
labels are not source authority. Runtime final training remains gated until C60
shared snapshots/projections and tests. [Record](audits/evidence/2026-10-22-c59-final-training-sets-foundation.json) retains phase,constructor,
content-index and explicit weapon-shell limits;no Item action/native acceptance.

### Final training and language field/cache projections (C60)

NumericEffects.finalTrainingSets holds qualified final armor/weapon/language/mastery
values separately from initialized/initial-effect system operands. One existing Set
interpreter applies primitive literal operations; receipts retain before/value/delta,
phase, initialization origin and earlier-or-final operand provenance. No source write,
content cache, name inference or Item action is added.

Native languages.labels is an earlier preparation cache. LanguageCategory.preparedSpoken
retains that result; spoken/display formats current qualified field values for callers.
One environment-neutral formatter supplies both snapshots. A separate native formatting
shell qualifies the current-value presentation without replaying actual native Actor
preparation. An earlier-label note explains differing values in both layouts. sourceKeys
is the existing current-local-key projection, not raw persistence data; preparedKeys
is the earlier initialized/initial-effect operand. Commands must read original source
and current authorized intent instead of persisting these projections.

```mermaid
flowchart LR
  S[Persisted Actor source] --> I[Initialized and initial-effect operands]
  I --> P[Earlier language labels]
  I --> F[Final training Sets]
  F --> C[Current caller labels]
  P --> N[Earlier-label note]
  C --> U[Shared sheets and cards]
  N --> U
```

Mastery source choices remain separate from local weapon training. Current conditional
mastery getter evidence does not authorize Item attacks/activities. Unknown IDs remain
unresolved keys or unavailable operations; E01 content access is not bypassed.
[Evidence](audits/evidence/2026-10-22-c60-final-training-sets.json) records the actual
field/cache/getter, formatting-shell and mounted/public-host limits separately.

C61 qualifies168 literal final-CI cases on actual Actor query/cache/build methods.
Current immunity differs from earlier collected statuses,condition maps,modes/passives
and cached reductions. Final CI never replays status collection;fresh ordinary rolls
retain cached reduction operands. Actual primitive field constructors are shared with
the native trait oracle;direct evidence files remain independent. Runtime gate remains
until C62 source/projection/recovery tests. [Record](audits/evidence/2026-10-22-c61-final-ci-conditions-foundation.json) keeps specific poison/
exhaustion scope and phase/dispatcher/native acceptance limitations explicit.

### Current CI and earlier condition data (C62)

The shared final defense map may update CI for the qualified single poisoned/modern
exhaustion profile. currentConditionImmunities606 filters preserved actorStatuses with
currentImmunities; it never reruns status collection, condition map preparation, mode
writes, passive calculations or cached penalties. Source immunitySource, levels,
preparationStatuses, Actor statuses and earlier roll/speed reductions stay distinct.
Applying the final mask once after all operations prevents cumulative filtering from
losing an existing status. Earlier omitted statuses are never invented on CI removal.

Conditional admission requires one matching eligible source, no initial CI changes,
CI-only final defense operations and qualified poisoned/exhaustion identities. Other
conditions/combinations/defense fields remain unavailable. A shared conditions view
explains masked conditions with earlier prepared adjustments in both layouts. The
normal numeric compiler, cards, passives, previews, shortcuts and direct requests use
the same earlier/current snapshots. General fresh condition queries, movement/Item/
automatic-result workflows are not newly qualified by these numeric comparisons.
[Record](audits/evidence/2026-10-22-c62-final-ci-conditions.json) retains explicit source,
method, UI/public/package and native/operator evidence limits.

C63 compares actual Actor petrification query/status with48current final defense
field snapshots and2304actual membership predicates. Native damage membership uses
current fields/bypasses;native sheet AllDamage override remains a separate presentation
contract. Earlier grants must not overwrite final values or be promoted into current
membership. Runtime remains gated pendingC64 projection/tests. [Record](audits/evidence/2026-10-22-c63-final-petrified-foundation.json)
keeps initialized constructor/Color/presentation-copy and damage-action limitations
separate from full native/operator acceptance.


### Petrification and final defense snapshots (C64)

C64 extends C58/C62 only for one matching Actor-owned condition with the explicit
serialized status `petrified`, without initial defense-field changes. Mixed/inferred
statuses, initial-defense composition, Item origins and final immunity identities
outside poisoned/diseased/stunned stay gated. This supersedes C58's blanket petrified
final-Set restriction for the qualified profile; it does not qualify general queries.

`NumericEffects.preparedDefenseSets` retains the earlier normalized fields; the final
map is a detached copy updated by the existing primitive Set interpreter. DefenseFacts
publishes the earlier fields with phase provenance separately from current categories.
The existing condition projection retains the earlier petrification grant receipt.
A separate native-presentation observation records the native sheet's All Damage
resistance override; it never supplies current field values or damage membership.
Cards and both layouts consume current categories. A shared note explains later
changes, and an ALL entry explicitly describes physical-damage bypasses when present.
No new damage evaluator, source mutation, world cache or transport is introduced.

[Evidence](audits/evidence/2026-10-22-c64-final-petrified.json) separates regression,
pinned initialized methods, mounted consumers, isolated public-host and packaging.
Other conditions/compositions, damage amounts/application, Items and native/operator
acceptance remain open, as do the full ADR milestones and external dependencies.


C65 qualifies210 literal final custom String cases independently of module rules.
Native plain StringField concatenation/first-substring removal/override/no-op modes
differ from FormulaField semantics. Current custom fields and earlier language labels
are separate; a distinct formatting shell proves current labels, not Actor phase replay.
Runtime stays gated pending C66. [Evidence](audits/evidence/2026-10-22-c65-final-custom-foundation.json) records exact source hashes and
restricted source/default/empty-Set/sheet collaborators; no native/operator acceptance.


### Literal final custom traits (C66)

`trait-strings.ts` initializes the verified missing blank String default separately
from source text, then applies qualified final literal StringField operations.
`NumericEffects.finalTraitStrings` retains current custom values without mutating
earlier `system` operands or source. Receipts keep before/value/phase/initialization
and prepared-or-final operand provenance. Final string operations preserve native
priority/order, raw-delta concatenation, first-substring subtraction and cleaning.
This is plain custom text; it supplies no proficiency, identity or numeric formula.

Shared defense/training projections consume those values. Language `preparedSpoken`
formats earlier Sets/custom text while `spoken` formats current values with the same
formatter; the existing earlier-label note explains a difference. Cards, both layouts,
previews, shortcuts and direct execution retain one prepared intent path. No UI formula,
additional data cache, evaluator or transport is added.

The profile is condition-free Actor-owned final custom text for dr/di/dv/ci, armor,
weapon and language traits. Initial String effects, null/coercions, reference expansion,
condition compositions and Item origins stay gated. Seven canonical-prefix comparisons
extend C65's empty-Set cases without inferring names or grants. [C66 evidence](audits/evidence/2026-10-22-c66-final-custom.json)
keeps source/method, regression, mounted/public-host and packaging limits separate.


C67 qualifies238 initial custom String/cache chains plus217 retained final cases.
Initial text enters the language cache; final text changes current fields without
replaying that cache. Native primitive/method execution and independently compared
dispatcher phase order remain distinct evidence. Runtime admission awaits C68.
[Record](audits/evidence/2026-10-22-c67-initial-custom-foundation.json) preserves phase/source/default and initialized-shell limitations.


### Initial custom String preparation (C68)

Qualified Actor-owned initial custom Strings use the same initializer/interpreter as
final custom text. Initial results update detached preparation operands before language
labels; final results remain in `finalTraitStrings`. Original source/default origin is
captured once and retained through both phases. Receipts expose each before/current
value in native phase/priority order. Source documents and prepared-looking label poison
remain untouched. Existing defense/training/card/UI projections consume these facts.

This supersedes C66's initial-String gate for condition-free Actor literal text. Item
origins, conditions, null/coercions and reference expansion remain unavailable. C28's
original `custom-string-not-set` input is now explicitly supported as String text;
its historical Set-only evidence remains intact. [C68 evidence](audits/evidence/2026-10-22-c68-initial-custom.json)
keeps initialized native methods, regressions, mounted consumers and real public-host
execution distinct. No source boot/native/operator acceptance is claimed.


C69 qualifies442 single poisoned/exhaustion String/cache/source-mode cases through
actual Actor queries/builders and native String/trait/sheet methods.2652 check builds
and442 initiative configurations preserve reductions/passives and primary-scope modes.
A separate read-only presentation copy preserves current text and earlier labels.
Runtime awaits C70; initialized scheduling is not full native source/dispatcher/dice
acceptance. [Evidence](audits/evidence/2026-10-22-c69-condition-custom-foundation.json) keeps these limits explicit.


### Single-condition custom text admission (C70)

`customStringConditionReason606` shares initial/final admission using raw Actor source,
qualified condition envelopes and the planned changes. One matching explicit poisoned
source (absent/null level) or exhaustion source with explicit level1–6 is supported.
Initial immunity must be empty and no initial/final CI-value change may participate.
Mixed, immune, inactive, inferred-status, other-condition, raw Actor-status and Item
compositions remain unavailable. Raw level defaults/clamping beyond this String profile
retain their existing independent condition behavior; they are not silently admitted.

Both String phases use the existing interpreter and projections. Current text, earlier
language labels, condition maps/statuses, cached reductions and earlier passives remain
distinct. Text containing a condition name grants no immunity. Ordinary/selected rolls,
previews, shortcuts and direct requests use the shared numeric compiler. Fresh initiative
mode includes ability-check/init/global-check scopes; fixed initiative score retains its
earlier snapshot. The C69 table gains an explicit native-checked fresh-mode assertion.
[Evidence](audits/evidence/2026-10-22-c70-condition-custom.json) separates frozen inputs,
actual native-method construction, module regressions, UI/public-host and package checks.


C71 qualifies686 transferred Item Actor-target initial custom-field cases through
actual native/base Actor collection, suppression, phase/priority dispatch and native
primitive String/language/sheet methods. Source/default initialization and schema-field
routing are explicit test collaborators; no Item final phase or full native model boot
is claimed. Runtime stays gated pending C72. [Record](audits/evidence/2026-10-22-c71-item-initial-custom-foundation.json) preserves independent
expectations, identities and exact hashes; full ADR/native/operator gates stay open.


### Transferred Item initial custom text (C72)

The effects planner supplies source/default eligibility and native priority/order.
The existing initial String branch admits identified eligible Item effects only without
condition composition. Receipts add the owned Item ID alongside effect ID; the shared
intent signature includes those receipts and planner eligibility/provenance. Suppression
or changed attunement/equipped/default state retires an open intent even when its numeric
check remains5. A recovered source requires fresh intent. No new world cache or UI rules
calculation is introduced. Defense/training projections and initial language labels use
the same prepared operands; source text, UUIDs, ownership and Item data remain unchanged.

[C72 evidence](audits/evidence/2026-10-22-c72-item-initial-custom.json) preserves fail-before/pass-after,
current consumers, combined skill/tool/manual/alternate-ability controls, stale callbacks
and exact public-host/package identities. Item final preparation, active condition
composition, dependent filters/riders and broader expressions remain outside this slice.


C73 qualifies434 empty-feat final custom-field/cache cases through actual native
Item final preparation, feat/Activities/UsesField methods and Actor phase dispatch.
Empty collections/uses initialization and Item roll-data/spellcasting collaborators
remain explicit; no expression/activity/recovery execution or full DataModel boot.
[Record](audits/evidence/2026-10-22-c73-feat-final-foundation.json) preserves frozen results and limits. Runtime admission awaitsC74.


### Empty-feat final Actor custom fields (C74)

`feat-final-profile.ts` validates one current owned feat identity and the qualified
empty activities/uses recipe. It gates additional persisted system fields and configured
uses/activities;prepared-looking proficiency/getter/uses fields remain nonauthoritative.
Only literal custom String targets pass that gate;other transferred final fields remain
unavailable. Existing final String snapshots/receipts now retain owned Item ID alongside
effect ID,initial source/default and prepared/final operand phase. No general Item model,
resource calculation/cache,activity execution or writes are introduced. Both layouts,
cards,previews,shortcuts and direct requests continue to share one preparation/compiler.

[C74 evidence](audits/evidence/2026-10-22-c74-feat-final-custom.json) separates434 frozen before/after cases,
initialized native Item/feat/Activities/Uses methods,870 mounted readouts plus16 selected
controls,311776 public-host requests and packaged output. Additional source recipe keys
and nonempty uses/activities need further qualification;this is not general feat support.


### Owned Item read preparation

`derived.ownedItems` is the shared revision-owned Item projection,prepared once by
`item-facts.ts`;UI rows format it without recomputing proficiency/attacks/resources.
Counters distinguish source maximum,initialized spent,prepared remaining and recovery
metadata. Item and activity identities/counters remain independent. Containers use
native migrated quantity1;unit weight is distinct from unqualified contents weight.
Numeric weapon/feat attack facts use `item-combat.ts`;execution remains M4-gated.
`spell-metadata.ts` exposes canonical persisted properties and native level1 default,
not effective preparation/casting capability. Modern guessed spell attack/DC fields
are unavailable pending M5. Explicit legacy projection remains separate. Live detail
modals resolve current exact owned IDs and use SDK rich text processing. C75 adds no
world cache,transport,dice evaluator or writes;configured Item/effect phases and broader
expressions remain explicit boundaries. See [C75 evidence](audits/evidence/2026-10-22-c75-item-read-surfaces.json).


`source-initialization.ts` applies the qualified standard MappingField/default hooks
before initial effects and filters. Both use the same detached initialized values;
`effectPreparation.sourceInitialization` exposes defaults and ignored registry keys.
Six standard abilities default10/0 and18 skills use keyed defaults only for missing
entries;an existing partial skill instead uses dex. This is not source persistence,
a migration write or a second source cache. Unknown tools/abilities are not inferred.
See [C76 evidence](audits/evidence/2026-10-22-c76-source-initialization.json) for phase distinctions and superseded missing-key gates.


### Deterministic FormulaFields

`deterministic-formula.ts` implements bounded pure arithmetic for rule preparation,
without a dice grammar/evaluator,entropy,eval or runtime dependencies. Explicit
bindings come from qualified class base/ability preparation;unknown references stay
unavailable. `formula-fields.ts` folds only declared FormulaField paths in detached
operands and records original expressions/results. NumberFields and effect deltas
retain typed semantics. Prepared and fresh execution bindings preserve final-score/
earlier-modifier order;earlier passive/Item facts do not replay after final effects.
New expression-derived d20 bonuses are bounded dyadic multiples1/1024;broader fractions
remain gated. Item uses retain raw capacity identity while using this same arithmetic.
See [C77 profile/evidence](audits/evidence/2026-10-22-c77-deterministic-formulas.json) for exact vocabulary and remaining boundaries.


`class-initialization.ts` shares proven missing-level1 initialization and source/default
origins. `class-scales.ts` derives only numeric ScaleValue entries from exact owned
class/subclass/advancement identities,using linked class level and native restriction/
inheritance order. It supplies the `classes.<identifier>.levels` and
`scale.<itemIdentifier>.<scaleIdentifier>` formula bindings once per revision.
Raw/prepared-looking scale maps and names never supply replacements. Subclass parent,
identifier collisions,grant roots and unqualified types yield diagnostics/no binding.
[Source and phase evidence](audits/evidence/2026-10-22-c78-class-scales.json). No grant execution or source writes are introduced.


Fresh d20 reference context is distinct from preparation. Native constructParts
rebinds root prof only when a check supplies a proficiency part. Shared configuration
retains original roll expressions and phase bindings,and resolves them after current
selection/proficiency validation. Prepared passives continue using earlier Actor-base
prof. Generic checks/saves/initiative use this same resolver;UI performs no rule math.
Missing current formula metadata cannot fall back to cached totals. [C79 correction](audits/evidence/2026-10-22-c79-formula-roll-context.json) supersedes C77's blanket fresh prof binding.


Proficiency-dice preparation keeps Actor base proficiency distinct from random roll
terms. `proficiency-term.ts` compiles only pinned native terms;the shared d20 compiler
sends them to public Core roll primitives. Static totals omit random terms;passives
retain flat proficiency. Consumers format subtotal + term. Dice-mode fresh FormulaField
references cannot fall back to prepared numeric values. Normal with qualified bounds
is supported;adv/dis with proficiency terms,1.5 dice counts and broader dice expressions
remain unavailable. Other workflows must explicitly qualify Dice mode before opting in.
[C80 evidence](audits/evidence/2026-10-22-c80-proficiency-dice.json).


`physical.ts` consumes the shared owned-Item source facts once per preparation to
resolve embedded container identities,contents/counts,total weights and currency.
The same result is attached to owned Item facts and the Actor physical projection;
UI never totals inventory. Nonpersisted encumbrance initializes independently of raw
source overrides. Thresholds use earlier qualified Strength and native size factors;
Powerful Build changes the carrying size only. Container capacity and visible totals
are distinct from conservative contents visibility. Cycles,broken references and
unqualified effect phases return reasons,without repairing source or resolving names.
Automatic status writes/movement penalties are separate from this read model.
[C81 source/phase evidence](audits/evidence/2026-10-22-c81-physical.json).


`combat-modifiers.ts` prepares numeric Actor ability attack/DC dependencies and
explicit Actor spell defaults once from the initialized shared operands. Damage
bonus scopes preserve original expressions and state first-part-only application;
activity-specific references are not guessed from an Actor default. Cards/Spells/
Actions format these same facts. Raw prepared attack.value,ability.dc and attributes.
spell fields do not supply values. These read facts are distinct from per-Item
casting capability and fresh action construction,which remain gated. The deprecated
root spell execution slots remain unavailable for modern profiles. [C82 evidence](audits/evidence/2026-10-22-c82-combat-modifiers.json).


`base-statuses.ts` admits qualified Actor-owned base encumbrance sources separately
from typed ConditionData. The common effect plan records identities and invariant
guards;the condition model merges sources in Actor order and preserves early mode/
movement versus later immunity snapshots. Physical disadvantage flows through the
existing shared compiler,including selected abilities,proficiency cancellation and
manual modes. Movement uses stored status flags with native units/order. Preparation
never synthesizes/synchronizes status documents from the physical weight model.
[C83 evidence](audits/evidence/2026-10-22-c83-encumbrance.json) supersedes the earlier blanket non-none setting gate.


`item-proficiency.ts` prepares exact per-type coefficients once, before Actor final
fields. Owned Items share this cached proficiency and explicit numeric bindings with
parent/activity counters and details. Parent counters bind Actor-base prof;fresh
attack construction binds Item prof even0,using current Actor references alongside
earlier Item resources/modifiers. Source prof/hasProficiency/proficiencyMultiplier
are never overrides. Source selectors are identities,not names. Dice terms remain
symbolic;only `.flat` is deterministic. [C84 phase evidence](audits/evidence/2026-10-22-c84-item-final.json).


`applied-rules.ts` consumes phase-ordered serialized effect-plan entries,without a
second rule/world cache. It shares d20-before-category collection,admitted lazy
change guards,numeric bonuses,ordered advantage/suppression and qualified die bounds
across prepared reads and fresh configurations. Rule conditions/bounds read their
pre-construction snapshot;bonus expressions use constructor proficiency substitution.
Static passives exclude later registrations and die bounds. Raw appliedRules and
Proficiency-looking objects are never overrides;unqualified filter properties return
reasons. [C85 evidence](audits/evidence/2026-10-22-c85-applied-rules.json).


The shared Boolean read-rule profile includes Diamond Soul,Tool Expertise,Observant
and modern Remarkable Athlete. Initial fields,derived saves,earlier tool coefficients,
passives and current modes retain native phase/order. Initial snapshot predicates
admit only qualified flags that leave those source/default operands unchanged.
Source flags and flag-writing effects remain distinct;unknown/transformation flags
still fence unsupported interpretation. [C86 source/phase evidence](audits/evidence/2026-10-22-c86-read-flags.json).


Known native flags have per-workflow execution readiness. Reroll flags preserve
independently known preparation while affected d20 requests return a reason. Normal
Reliable Talent contributes a range scope only during current construction,using the
primary's current value;earlier prof objects still control combined advantage.
`checkConfiguration.currentValues` is module-produced phase data,never a raw source
override. Equipment flags feed shared weapon modes/movement;details format those
same facts. Missing current metadata retires support rather than replaying cached
eligibility. [C87 evidence](audits/evidence/2026-10-22-c87-remaining-flags.json).

Effect flag preparation now exposes source/prepared/current snapshots on the shared
model. Cached native stats/Item proficiency use initial flags;fresh checks use
current Jack/Tool Expertise/Halfling/Reliable Talent flags. Primitive Boolean deltas
follow native normalization and six Foundry operations;unqualified flag types and
operations fail explicitly. Current metadata is required for check execution.

Effect eligibility distinguishes Actor transfers,stored nontransfer templates,
exact rider references and applied Item enchantments. Identity metadata never
resolves content or substitutes documents. The shared admission helper also serves
Item/physical/equipment consumers. Permanent durations reprepare expired=false;
valid start fields do not imply expiry. Timed/flag-forced profiles remain gated.
[C88 evidence](audits/evidence/2026-10-22-c88-effect-flags.json) describes phase and
source/default limits separately from native/operator acceptance.

Qualified check FormulaField effects compose expressions before deterministic
folding. The model keeps earlier source/prepared expression and final expression
separate. Fresh compilation rebinds references after current ability/proficiency
selection;static passives use the earlier Actor context. Native compound negative
add retains its unparenthesized text. Multiply groups both operands within the
qualified arithmetic grammar;max/min can nest equivalently. This is formula text
composition,not NumberField delta evaluation or dice evaluation. Unsupported final
references cannot fall back to the earlier numeric bonus. Existing public compiler,
bounds,mode and stale-intent gates apply unchanged. [C89 evidence](audits/evidence/2026-10-22-c89-formula-effects.json).

Actor proficiency has class-base,prepared and current phase metadata. The adapter,
cards,headers and proficiency block format the same facts;cached ability/save/Item
proficiency and passives use the earlier base. Fresh skill/tool selection computes
against current base. Generic rolls use cached proficiency terms,with current
root prof retained when no term is supplied. `attributes.prof` remains a separate
numeric roll-data reference. Raw prof/level poison is ignored. Native derived-field
unguided number deltas are not evaluated as NumberField formulas.

When current reference readiness is lost,the earlier folded bonus/passive remains
known;fresh compilation retains its original expression and rejects unavailable
current operands. Positive integer base qualification and die execution readiness
are separate;unknown die sides remain visible symbolic terms. Known miscellaneous
equipment types are excluded from armor selection,as native does. This permits
ordinary transferred SRD gear effects without changing armor,ownership or source.
[C90 evidence](audits/evidence/2026-10-22-c90-base-proficiency.json).

Equippable preparation is one revision-owned result shared by effect planning and
owned Item projections. Initial source/default eligibility is distinct from final
attunement cleanup and eligibility. Registered equippable types all permit mgc;
without it the final hook clears attunement,then clears attuned when unattunable.
The Actor count starts at verified nonpersisted0 and sums current attuned Items,
including unequipped Items. Persisted source max/default3 stays separate;malformed
max/context/unknown Item outcomes produce unavailable capacity. Count/max effects
remain unqualified and cannot be ignored.

Final transferred effects are tested against the final state,with qualified
no-activity/no-counter recipes for Actor proficiency. Other final target/lifecycle
profiles remain fenced. This corrects an initial-suppression shortcut that silently
omitted a real final effect. Inventory badges/current detail controls/capacity/cards
format shared results;source data is not repaired or persisted. [C91 evidence](audits/evidence/2026-10-22-c91-equippable-final.json)
records the exact recipe,range/condition and source/default boundaries.


Scalar FormulaFields share the same deterministic composition/folding path as
checks. Source/default initialization precedes initial effects;AC bonus/minimum,
entire encumbrance fields and movement multiplier ignore nonpersisted raw poison.
Native species movement/senses inheritance runs once in embedded preparation,
before effects. Original walk/from-species metadata remains available for slowed;
late preparation cannot re-inherit over an effect. Carrying threshold bonuses are
added after native multiplier/size rounding. AC,HP,movement,carrying and combat
read surfaces format the shared results. Unknown expressions keep their domain
unavailable;this does not invent a value or erase independently qualified facts.
Final scalar operands and broader Item hooks remain separately qualified phases.
[C92 evidence](audits/evidence/2026-10-22-c92-scalar-fields.json).


Scalar final effects take operands from one detached earlier-phase snapshot using
existing preparation functions. Typed current HP/senses fields and movement speeds
are projected without recomputing earlier effective HP,max/slowed or armor value.
AC cover is nonpersisted0 before effects;initial cover contributes to earlier DEX
saves and armor,and current cover contributes to fresh DEX saves. Current fields
have effect receipts and a shared numeric projection. Initial movement multiplier
applies before stored encumbrance reductions;final multiplier never replays movement.
Prepared numeric AC/movement FormulaFields qualify add/subtract/override;other
operations retain an explicit diagnostic boundary. Reference-bearing final text
resolves using the existing current bindings after final changes;unknown values
cannot fall back. [C93 evidence](audits/evidence/2026-10-22-c93-scalar-phases.json).


Transferred final check fields share the Actor handlers after the qualified
no-activity/no-counter equippable final hook. Earlier source/default and final
eligibility still differ;nonmagic attunement cleanup can activate a final effect.
The explicit field family covers scores,skill/tool current values and check/skill/
tool proficiency,bonus and mode fields. It introduces no extra calculation or
Item-data cache. Current value fields,earlier effectValue/proficiency and fresh
configuration remain separate. Combined advantage uses earlier positive-prof flags;
selected secondary checks contribute their qualified proficiency,not their bonuses
or modes. Actor/context/source changes retire current dialogs even when totals stay
equal. Unknown Item hooks/fields/identities and conditions still gate the workflow.
[C94 evidence](audits/evidence/2026-10-22-c94-transferred-final.json).


Scalar schema defaults are initialized separately from source and prepared operands.
Absent HP/AC parents and nullable leaves use pinned defaults;malformed containers
stay unavailable. Receipts preserve null and source/default provenance. A final
nullable effect uses the earlier prepared operand,including HPmax and ACflat.
Native non-improving upgrade/downgrade can leave null unchanged. Prepared numeric
zero uses falsey FormulaField semantics;after a text override,the string "0" uses
ordinary expression composition. Earlier HP/armor caches remain unchanged. Positive
numeric prepared multiply/max/min and wider phases retain their explicit gates.
[C95 evidence](audits/evidence/2026-10-23-c95-nullable-scalars.json).


Owned Item counters and equippable final admission share the environment-neutral
Uses preparation function. Qualified independent capacities/spent/fixed recovery
metadata permit the no-activity final recipe;they do not replay Actor changes or
execute recovery. Unknown capacities/scale recovery and malformed containers retain
specific unavailable reasons. The prepared counter is not an extra cache and raw
value/label/recharge fields never override it. Activity final and broader reference
phases remain unqualified. [C96 evidence](audits/evidence/2026-10-23-c96-equippable-uses.json).


One shared rules function prepares qualified utility Activity common fields for
owned-Item reads and final admission. Native defaults and Item
schema ownership decide activation and range inheritance;unknown legacy-looking
parent fields do not override Activity fields. Inferred range text/number and final
scalar values remain distinct. Parent-before-child counters use the shared Uses
path. The existing Item modal formats these facts in both layouts;action rows use
the same default activation. Common readiness is independent of Activity execution
and full subtype/usability readiness. Unsupported references/templates/subtypes
retain explicit diagnostics. No new source writes or Item/world cache is added.

Roll intent compares the current caller-visible Actor source as well as world,
profile and prepared configuration. Metadata-only changes retire Numeric dialogs
and held callbacks even when the prepared roll stays equal. The signature remains
ephemeral UI intent,not a revision/permission authority. Native/operator acceptance
and broader M8 performance/accessibility qualification remain open.
[C97 evidence](audits/evidence/2026-10-23-c97-activity-common.json).


Utility template facts share the common Activity path. One pinned dimension map
and deterministic expression fold prepare count/size/width/height;UI only formats
those facts. Source0 becomes initialized string"0" before falsey fallbacks,so it
never becomes1/5. Template units and missing/null/blank weapon-range units use the
captured length setting passed through effect/equippable preparation. Explicit
units remain independent of that setting;missing required defaults are unavailable.
Nonpersisted dimensions/labels never override source or computed results. These
are read facts,not canvas placement/collision/application or Activity execution.
[C98 evidence](audits/evidence/2026-10-23-c98-activity-targets.json).


Consumption references share one environment-neutral helper across Activity reads
and final admission. Raw targets,prepared IDs,missing/unqualified references and
schema readiness stay distinct. Source indexes use only caller-visible owned Items
and explicit identifiers;native source precedence/order is preserved. Missing known
references warn without blocking independent checks;unknown canonical identity does
not select another Item. UI formats the shared result in both layouts. No secondary
index cache or consumption write is added.
[C99 evidence](audits/evidence/2026-10-23-c99-consumption-references.json).


Owned spell preparation resolves source ability and class/subclass/grant identities
once with caller-owned Items. Generic Activity ability and default attack ability
are separate native semantics. Item and Spell details format this shared context
and numeric attack result;neither enables casting. Unknown identities,malformed
abilities,unqualified Item effects and contexts keep explicit reasons. Source
availableAbilities/classIdentifier and old attack totals never override the model.
[C100 evidence](audits/evidence/2026-10-23-c100-spell-context.json).


Filter predicates consume only explicit initialized or configured-roll read
whitelists. Scalar substring/prefix/suffix conversion and strict Array membership
share the same path as numeric/Set predicates. Native case-insensitive comparisons
remain unavailable pending locale qualification;object collection traversal and
unknown snapshot paths remain unavailable. Reads retain initial/configured/mixed
provenance. Boolean short-circuiting cannot conceal an unqualified branch.
[C101 decisions/evidence](audits/evidence/2026-10-23-c101-filter-dispositions.json).


Spell intrinsic fields and qualified child common fields use one schema/default/
expression fold. Child override flags apply before preparation;overrideSet/labels
from source never override that intent. Parent and child counters stay phase-ordered.
Save DCs use the shared casting context and earlier prepared combat facts;flat0
remains0. Nonpersisted DC bonus/value never supply source overrides. Actor default
DC and Activity DC have distinct labels. Modern Spell summaries,action rows and
Item/Spell details format the same facts;source and execution readiness stay separate.
[C102 evidence](audits/evidence/2026-10-23-c102-spell-fields.json).


DamageData source/default formulas have a shared initialized-source read model.
Source part identity and computed includeBase placement stay separate. Symbolic
references,manual/modifier/scaling metadata survive;no evaluator or effective roll
is introduced. Action/Item/Spell surfaces label these Base formulas. Empty data
never supplies a die,legacy shapes diagnose migration and unqualified ammo base
combinations remain unavailable. Schema-owned inputs ignore prepared-looking
formula/base poison. [C103 evidence](audits/evidence/2026-10-23-c103-damage-source.json).


Weapon range has a shared initialized-source→derived fact before Activity
inheritance and natural/improvised mode selection. Source,default,missing and
not-applicable fields remain distinct;missing scalar metadata does not poison
independent qualified Actor final facts. Both layouts format these shared results.
[C104 evidence](audits/evidence/2026-10-23-c104-weapon-range.json).


Finite timed effects retain an explicit E04 gate:source expired can differ from
native prepared applicability when worldTime changes. Neither local wall time nor
raw native-looking duration metadata supplies the missing public host input.
Source/context changes retire open roll intents;recovery requires a fresh intent.
[C105 contract/evidence](audits/evidence/2026-10-23-c105-effect-time.json).


Transferred final scalar fields share the existing scalar handlers after the
qualified Item final recipe. Exact owned Item identity stays in effect receipts.
Initial/prepared/current operands and earlier HP/AC/movement caches remain
distinct;utilities prepare before these final changes. No consumer recalculates
the results or bypasses unresolved Item/time/condition gates.
[C106 evidence](audits/evidence/2026-10-23-c106-transferred-scalars.json).
