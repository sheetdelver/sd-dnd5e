# ADR-0001: Complete D&D character lifecycle on the current native system

- Status: **Accepted for implementation — in progress; acceptance gates remain open**
- Date: 2026-10-19
- Owner: SheetDelver D&D module
- Primary native target: **D&D 5e 6.0.6 / Foundry 14.367**, 2024 rules
- Evidence: [current audit DD-01–36](../audits/2026-10-19-character-lifecycle.md), [versioned native map](../reference/native-6.0.6.md), [verification and completion matrix](../plans/0001-verification.md)

## Context and outcome

The experimental 0.4.1 module has a substantial sheet layout but incomplete rules and persistence. Basic check rendering does not establish a usable character lifecycle. Modern spells, activities, source identity, effects, resting and advancement require integrated behavior, not isolated UI patches. This plan uses the current **Foundry-installable** release, not upstream development HEAD. C02 adopted the documented Core0.19.3/module-api1.5 floors; module release metadata remains0.4.1/experimental.

The end state is a complete **player-character experience** for the selected native rules profile: discover authorized content, build a character, edit it, advance it through all supported levels and multiclass choices, play it with correct actions/resources, recover from failures, and converge with Foundry edits. D&D Beyond is an information-design reference. Its accounts, marketplace, campaign hosting and content importer are not part of the work.

Core ADRs 0027/0038/0051/0052/0054/0057/0064 remain architectural constraints. Core owns transport, authorization, source/prepared stores, session/world lifecycle, maintenance and shared presentation. This module owns D&D interpretation and UI. The native preparation-runtime experiment stays parked; this plan neither resumes it nor requires a browser for normal operation.

## Definition of complete

Completion requires all in-scope rows of DD-01–36 and acceptance A01–A24, not just populated tabs or successful packaging:

1. All 12 bundled modern classes and their bundled subclasses can be created at level 1 and advanced through levels 2–20 with correct native grants, HP, proficiency, choices, spells, resource scaling and stored advancement history. `xpBoons` post-20 progression must have the native supported boon workflow; it must not invent a level-21 class. Higher-level creation is a reviewable replay of the same advancement engine.
2. A character can complete a play cycle: equip/attune, make checks and saves, attack/damage, cast/prep/upcast/ritual/concentrate, spend uses/ammo/materials/slots, take damage/heal/death saves, rest/recharge, update narrative fields, and resume after reconnect without duplicated effects or silent lost changes.
3. Multiclassing, supported level-up replacements and native choice editing use the same rule interpreter. Cross-class slots, prerequisites, original-class distinctions, grant origins and ability changes match native behavior. Full arbitrary respec/conversion is a separate decision below.
4. SRD-only installation is sufficient. Optional authorized books/homebrew expand choices dynamically. Missing/inaccessible content yields precise reasons, preserves owned data, and blocks only dependent choices/actions. Same-name documents remain distinct.
5. Desktop/mobile/card/detail/action views use one prepared rules result. Owner/observer/limited/none behavior, privacy, keyboard use, errors and realtime changes are verified in actual Core, with both development and managed packages.
6. Supported native behaviors are established with independently captured source/prepared/action results and exact version/settings provenance. Every intentional unsupported native feature has a visible disposition and scope rationale. An intermediate milestone may remain experimental; it cannot be relabeled “complete” by deferring ordinary character rules.

“Complete” does not promise that network/storage can never fail. It requires trustworthy outcomes: no invented data, no false completion, no replay of an unknown write, and a usable recovery path with exact identities. A failed multi-document operation is not assumed rolled back.

## Compatibility and scope policy

This table is the **recommended implementation target**, not a manifest change or present compatibility claim.

| Combination | Proposed disposition / required behavior |
| --- | --- |
| Foundry 14.367 + D&D 6.0.6, world `rulesVersion=modern`, 2024 documents | Primary qualification; complete lifecycle and ordinary play. Qualify later Foundry builds explicitly before advertising a broad tested range. |
| Same native version, 2014 documents in modern world | Preserve and display exact edition/provenance; run shared native schema behavior where supported; respect world policy and item-specific metadata separately. Permit explicitly supported mixed choices; reject unresolved incompatibility before persistence. No replacement by same-name modern content. |
| Same native version, world `rulesVersion=legacy` | Reuse source adapters and rule interpreter with a distinct rule profile for the branches identified in `applyLegacyRules`. Preservation/read access and explicit unsupported reasons are mandatory. Full creation/advancement/play parity for the legacy profile is a separately estimated scope decision, not silently claimed by modern completion. |
| Foundry 13.351 + D&D 5.3.3 | Separate older schema/version profile. Do not include in primary 6.0.6 qualification or reuse 6.0.6 effects/spell assumptions. Preserve existing data; unsupported-version gating must precede mutation. User may select this follow-up after 2024. |
| Older or future D&D versions | Unknown until versioned schema/oracle review. Clear unsupported state; no broad semver promise or automatic migration of native data. |
| Core | C02 adopts released **0.19.3** as the application/CI baseline for public native world context and caller-safe projection (module-api floor1.5). SDK3.4/module-api1.6/UI3.2/roll1.0 are supplied by that tested host. E01/E02/E04 may require a later released contract; do not speculate about its floor. |
| Optional native rules | Modern defaults plus normal/gritty/epic rests, XP/milestone/xpBoons, encumbrance, units, proficiency dice, optional abilities, feats and concentration/exhaustion policy need explicit fixtures. Unsupported selected variants disable the affected automation with a reason until implemented; they remain visible roadmap obligations. |
| Homebrew / third-party documents | Support compatible native data models, formula grammar, built-in activities/advancements and authorized sources. Preserve unknown fields. Unsupported custom activity types, executable macros, hooks and model extensions are diagnosed; no arbitrary JavaScript execution or claimed plugin compatibility. |

Content availability is independent of rule support. Legacy options are not limited to SRD: installed 2014 premium/custom content may use the same supported schemas. Modern content is not all premium: the bundled SRD 5.2 packs provide a substantial complete baseline. Source editions may be unknown or mixed; neither pack suffixes nor Item names decide mechanics.

### Actor and broader workflow boundary

- **Characters:** full lifecycle and normal play as above; manual edits must retain native field meaning and distinguish overrides from automatic values.
- **PC-linked companions/summons/transformed forms:** include authorized Actor selection/creation when supported, stats/resources/commands needed by the character, effect origins/durations and return/reversion. Use the NPC model for NPC forms, never the PC formula fallback. Canvas token placement is external E04; it is not a reason to omit the character-facing rules from the target.
- **Standalone NPCs:** accurate read-only resource cards and an explicit unsupported editing/advancement state initially. Full GM NPC authoring, encounter building and bestiary management require separate scope; capture shared NPC calculations needed for PC-linked forms.
- **Group, vehicle, encounter and other Actor types:** preserve data; identify type and supported read fields; do not present editable PC controls. Party loot/XP distribution, group initiative, vehicle rules and encounter management are explicit broader-system follow-ups.
- **Bastions/facilities/order activities, downtime/crafting/shop systems:** preserve/display relevant content; no misleading active control. Recommend separate scope because these are broader management systems. Their absence must be in published boundaries, not hidden in a checklist.
- **Scene mechanics:** grid targeting, measured templates, movement, teleport placement, region behavior, vision/lighting, combat turn hooks and automated world time remain Foundry-owned until an explicit public Core capability is approved. Manual target selection may use readable Actor identities without promising canvas automation.
- **Retraining/respec:** implement native level-up replacements and bounded “modify choices” with dependency reversal/reapplication. Recommend deferring arbitrary whole-character respec, edition conversion and unrestricted level removal unless selected; show exact grant-loss preview if subsequently supported.

## Architecture

### One source interpretation, multiple projections

Proposed files below are work destinations, not claims that they currently exist:

| Layer | Proposed location | Responsibility / allowed dependencies |
| --- | --- | --- |
| Versioned schemas/rule context | `src/logic/native/6.0.6/`, `src/logic/rules-context.ts` | Decode source shapes, proven defaults, rules settings and unsupported states. No IO, browser globals or persistence. |
| Pure preparation | `src/logic/preparation/`, existing `src/logic/adapter.ts` | Deterministic Actor/Item/effect interpretation in native order, dependency provenance and diagnostics. Consumes explicit immutable source/context inputs. |
| Content normalization | `src/logic/content/` | Canonical UUIDs, owned identities, edition/source labels, supported activity/advancement classification. No authorization inferred from content. |
| Pure operation plans | `src/logic/actions/`, `src/logic/advancement/`, `src/logic/creation/` | Resolve choices/requirements and produce planned source changes, roll requests and messages using the same prepared semantics. No writes and no randomness during ordinary preparation. |
| Server orchestration | `module/server.ts`, `src/server/routes/`, `src/server/operations/` | Bind caller, fetch authorized current source/dependencies, validate, serialize module operations, persist intent/receipts and dispatch through `req.runtime`. |
| Caller content/projector | adapter `getSystemDataForUser`, `src/server/content/`, `src/logic/projections/` | Caller-safe catalog/detail/action options, concealed descriptions and native identification policy. Shared bootstrap caches never become a player response by accident. |
| Presentation | `src/ui/Sheet.tsx`, shared blocks/tabs, `src/ui/tools/CharacterBuilder.tsx`, `src/ui/pages/ActorPage.tsx` if needed | Format authoritative view models; collect intent; use Core document hooks, authenticated module endpoints and shared SDK presentation. No independent rules formulas. |

Preparation pipeline: decode source and distinguish missing/invalid/explicit overrides → establish class/advancement/embedded relationships → base attributes and effects applicable to that phase → derived attributes/skills/AC/HP → final Item/activity/spellcasting preparation → final effects/rule projections. Specify exact ordering from the reference sources with fixtures before coding; do not flatten native effects into one post-processing loop. Do not materialize a native client Document runtime.

`PreparedDndCharacter` should include rule profile/version, readiness per domain, diagnostics with safe source IDs, derived values/roll terms, Item/activity/spell/resource view models and provenance. Preserve source separately; never write generated totals back merely to make the UI work. Optional absence can use a **proven native default**, labeled in evidence. Missing prerequisite input cannot use invented AC, dice, slots, class grants or same-name lookups.

The adapter, dashboard card, standard/mobile views, resource modal, action preview and execution must call the same pure interpretation. UI helpers may sort/filter/format but cannot recalculate ability choices, proficiency, damage or resource maxima. Remove duplicated `itemRows.ts` rules only after each consumer has a shared replacement.

Preparation is synchronous under the current public adapter contract. It must
not perform network/async document reads. Prefer embedded authoritative data;
exceptional cross-document inputs need an immutable, versioned dependency
projection loaded from Core during initialization/refresh, with the corresponding
native invalidation proven. A compact derived lookup is not permission to copy
entire world stores or expose a privileged index to callers. Core currently
rebuilds an Actor on its source change and rebuilds context on settings/pack
refresh; arbitrary world Item/Journal/cross-Actor dependency graphs are not a
declared public preparation contract. Q01 must identify which native references
actually affect numbers versus caller-only content and qualify their refresh.
If needed, extend E01 with a host-owned dependency/revision invalidation contract;
do not subscribe to private stores or serve stale derived state silently.

### Native reuse boundary

Use upstream source as a versioned specification and independent oracle. Extract/adapt environment-neutral algorithms or tables only with a reviewed dependency list and retained MIT/SRD attribution as applicable. Native methods depend on `game`, `CONFIG`, `Hooks`, `fromUuid`, Document models/collections, dice subclasses, native applications and canvas. Importing `Actor5e` or `AdvancementManager` does not make those available.

Implement module-owned pure semantics where no public host primitive exists; document exact upstream symbol, source revision, known exclusions and comparison cases. Runtime hooks from arbitrary installed Foundry extensions remain unsupported. If a domain cannot be reproduced reliably under these constraints, raise the bounded decision task before claiming that domain complete. Do not revive the parked native-runtime approach as a shortcut.

### World context and source discovery

Declare only the native world settings actually required, with exact version applicability and registration-derived defaults. `runtime.world.snapshot()` and `settings.get()` provide immutable snapshots that are replaced when native settings change. Consume `onWorldContextChanged` on the server and SDK lifecycle signals in the client. A changed revision invalidates previews/drafts that depend on it; it does not mutate the old snapshot. Unavailable required settings block dependent actions with a clear reason.

Content flow:

1. Request-scoped `runtime.access.packs()` discovers currently readable packs; `canReadPack` and request `documents`/`compendium` enforce access. Discover readable world Items with detail-level authorization. Do not use privileged adapter `runtime.documents.list` output as a player catalog.
2. Intersect caller access, native `packSourceConfiguration`, type/schema/edition compatibility and the workflow's enabled sources. Default to readable modern SRD packs; offer other installed compatible packs explicitly. A native source exclusion is different from an authorization denial, but neither should silently reappear in choices.
3. Fetch compact indexes and selected full documents through host-owned storage. E01 must supply dynamic reads for undeclared books/homebrew; the diagnostic live-UUID fallback is not the solution. Until available, expose the precise limitation and use declared SRD scope only as an **intermediate** milestone.
4. Key external options by canonical UUID plus source revision; key owned documents by Actor UUID + embedded Item/activity ID. Preserve `_stats.compendiumSource` and advancement origin/root. Names are labels only. Show same-name options with book/edition/source distinctions; never deduplicate them destructively.
5. A selected option records all required dependencies. Removed pack/access/version/context invalidates affected choices and final validation. Embedded character content remains visible/usable to the extent its own data and caller rights suffice; missing external descriptions or required grant references have separate diagnostics. Never delete embedded Items merely because a catalog option vanished.
6. No second world cache. Short-lived caller projections/draft snapshots are scoped by instance/world/user/role/context/source revisions; discard on invalidation. Let Core own fetch caching and refresh. Open consumers refetch, ignore late old responses, preserve only still-valid manual intent and expose loading/ready/failed/retry states per collection.

### Reliable commands and persistence

Use module server routes for rules-bearing commands. Request examples are **proposed module contracts**, not existing SDK methods: prepare/execute/status for `activity`, `rest`, `creation` and `advancement`. Ordinary scalar edits can use strict `useDocumentMutation` when their validation and readback are adequate. Avoid treating `useActorSheet.update` or roll notification completion as a transaction acknowledgement.

Each command carries operation ID, target identity, context revision and selected IDs/choices; the server derives source changes/formulas itself. Preparation returns a digest-bound plan with current relevant source/dependency fingerprints, choices still required, cost/changes and diagnostics. Do not trust client-submitted Actor bodies, formulas, ownership, grants, cost totals or review hashes as authoritative.

Before the first write: require current caller/ownership/action permission, exact readable sources, valid supported rule context, complete choices and current source/dependency fingerprints. Reject invalid or changed plans with **zero writes** and require a new review. A module-scoped Actor queue prevents overlapping module commands; it does not lock out native Foundry edits. Recheck current source and context before each write and verify exact affected fields/IDs afterward. E02 qualifies residual races and durable receipt behavior; no unproven atomic guarantee.

Persist intent and operation state via public module DataStore, scoped by module/instance/world/caller/Actor/operation ID. This is an operation journal, not a duplicate world store. Retain input digest, source fingerprints, planned steps, exact acknowledged IDs, per-step outcome and result. Reject same ID with changed intent. Duplicate submit/status reads return the current outcome rather than dispatching again.

States: draft → reviewed → executing → confirmed; alternatively rejected-zero-write, partial or uncertain. Proven zero-write failures retire and require fresh intent. Partial/unknown writes remain inspectable and fenced for that affected operation; never declare global maintenance for an ordinary player error. Preserve acknowledged Item IDs even if journal persistence/readback fails. Reconcile via authoritative primary reads; do not infer identity from a name or source UUID shared by two owned copies. Complete only after every required source change is confirmed. Chat/notification failure after confirmed mutation must not repeat consumption or creation.

SDK `documents.commit` prechecks permissions then dispatches sequential operations. It is not cross-document atomic and does not roll back. Prefer constructing a fully reviewed new Actor with embedded Items/effects in one create where the native backend preserves intended IDs/relationships; verify this before relying on it. Existing-character changes may require ordered Item/effect/Actor writes. Write only affected source paths; do not overwrite whole stale Actor/Item arrays. Cancellation is zero-write before dispatch, and an outcome/status operation afterward. No speculative rollback or automatic deletion of user-owned content.

### Character builder and advancement design

Register `tools: { builder: ... }` and a stable `dashboardActions` tool entry in `module/ui.tsx`. Core renders/navigates the dashboard; module owns `/tools/dnd5e/builder` behavior through the host's declared-tool route (verify exact generated route when wiring; do not hardcode a private route). Reuse public SDK theme/background, navigation, loading, confirmation, rich text and roll components. Sibling tool registrations demonstrate integration; their system rules are not reusable D&D logic.

Recommended guided workflow:

1. **Context/prerequisites:** current world/system/rules, caller create availability, supported version, source availability. Explain limitations before choices. Server creation remains authority even if a UI permission preflight is unavailable.
2. **Sources and identity:** enabled books/world options, edition distinctions, name/portrait/pronouns and level target. Profile and source choices are persisted in the draft, not hidden global defaults.
3. **Class and origins:** exact class, species (`race` native Item type), background; native fixed grants, choices and original-class metadata. Steps can display in a familiar order while evaluation follows the dependency graph.
4. **Abilities/proficiencies/feats:** standard array, point-buy and authorized rolled/manual policy; preserve rolled results through retries. Apply native origin/feat effects and limits. Resolve exact counts, pools, exclusions, multiclass restrictions, duplicate grants and replacements; do not invent a substitute grant for unavailable content.
5. **Equipment/currency:** interpret native starting-equipment groups and currency alternatives; build containers with remapped IDs. No purchase required; optional book kits appear only when readable and compatible.
6. **Spells/resources:** class/subclass/feat/species casting sources, exact spell lists and preparation/known choices, slots/pact pools, granted spells/uses and required ability choices. Show why a choice is unavailable.
7. **Review:** human-readable source/edition choices, final derived preview, all grants/effects, pending requirements, ownership and affected source fields. Back navigation invalidates dependent selections only; preserve unrelated valid input. No world writes yet.
8. **Final submission:** server re-resolves sources and recomputes the complete plan; validates choices and permission/context; persists operation intent then creates. Confirm exact Actor and embedded identities/advancement metadata through primary readback, then navigate via SDK. Duplicate submit and disconnect resume through status, never a second blind create.

Drafts: store only module-owned intent and permitted content references using caller-scoped server DataStore; optionally a scoped local presentation draft with explicit “not saved” status. No privileged full catalog persistence in the browser. Draft schema/version/instance/world/user/profile and dependency revisions are explicit. Resume revalidates; content disappearance pinpoints affected choice. Changing class/species/background/rules invalidates dependent grants/spells/equipment; it must not retain illegal choices invisibly. Cancellation of a draft writes no Foundry document. Retention/expiry and user deletion are part of M6; operation receipts must outlive pending/uncertain writes.

Existing-character editing uses owned IDs and stored advancement values, not regeneration from current catalog names. Advancement implements all nine built-in types, native ordering and recursive effects, per-level HP policy, subclass timing, ASI/feat choices, class-level and character-level distinctions, multiclass prerequisite checks and slot rounding. Spell or feature replacements preserve origin links and remove only proven dependent grants. Bounded modify-choices operates on a detached plan with a review of additions/removals, then the same command machinery. Foreign/native/manual edits are retained unless an explicitly reviewed change affects them.

Unknown advancement/activity types or broken required references produce a bounded unsupported result, with original data intact. Homebrew using supported native structures works through the same interpreter. Existing native characters must reopen in Foundry with no re-grant/choice prompts caused by malformed metadata.

### Sheet and presentation design

- Desktop: persistent identity/health/defenses summary with clear primary actions; tabs for Actions, Spells, Inventory, Features, Character and Notes. Search/filter/sort use shared view models. Detail cards show provenance and effective values, with primary action only when executable.
- Mobile: equivalent operations in focused sections; compact health/resources accessible without losing the active workflow. Register footer space through SDK `useBottomNavigation`; no guessed host offsets. Layout changes preserve the active draft/dialog intent or explicitly close an invalid scope.
- Show base versus effective values where meaningful; tooltips explain modifiers with source attribution. A missing result is “unavailable” with a reason, not a plausible zero/default. Empty inventory, loading, access denied and unsupported content are different states.
- Read-only users can inspect permitted details without a disabled Cast button being the only way to open a card. Mutation controls use owner/action permissions; server authorization remains final. Identify concealed Items/descriptions before projection; do not send hidden content then hide it with CSS.
- Every modal has an accessible name, focus entry/containment/return, keyboard dismissal, safe scrolling and pending/failed states. Use shared SDK components where they fit. Integrate nested rich-text/shared-content/roll surfaces; no native alert/confirm/prompt or duplicate dice/chat system.
- Inspiration is a native boolean with a native sheet toggle. Provide reliable owner-aware grant/spend and rules-context guidance; distinguish any proposed assisted reroll from native automatic behavior. Do not treat a field toggle alone as an executed reroll or spend it implicitly.
- Narrative content uses SDK sanitization/URL handling and supported link actions. Sanitization is not native enrichment: unknown inline rolls, UUID embeds, spell lists or rule tags need explicit handling, not raw HTML or arbitrary scripts (E03).
- Keep Core HUD formula/audience/manual-total contract. System-specific initiative preparation must improve without substituting a UI-generated formula or posting the same roll twice.

## External capability register

These are documented dependencies/proposals, not permission to change Core or reopen a closed ADR. Use released public APIs if they already satisfy a case; prove that before proposing extension.

### E01 — Dynamic authorized content catalog and full reads (confirmed gap)

Evidence: Core `src/shared/sdk/runtime.ts:ModuleRequestRuntime.access` exposes readable packs as `id/label/type`; `CompendiumPackReader` reads declared packs. `src/server/services/documents/DocumentResolver.ts:resolveHydratedPackDocument` rejects undeclared/nonhydrated normal reads. `src/modules/registry/core/compendiumConfig.ts` prefers static declarations, and adapter config cannot negotiate arbitrary per-world packs during pre-initialization hydration. Native browser metadata includes package/source/type hints beyond the current public list.

Minimal proposed capability: a caller-bound host content service with paged discover/query/read operations, typed pack metadata (canonical ID, document types, package provenance, source hints, access and hydration/read availability), opaque revision/cursor, and on-demand bounded host-owned reads for selected authorized packs. Grant metadata only when authorized; preserve document-level edition/license data. Core decides storage, limits, refresh and transport. Do not expose raw sockets or let modules modify pack permissions.

The existing Combat Manager's Actor-pack browse routes are specialized to that
Core feature; they are not a generic Item/Journal builder catalog. Reuse any
suitable public capability established during Core design rather than exposing
its private service. Include preparation-dependency refresh only where Q01 proves
it necessary; distinguish a source-number dependency from a display-only link.

Acceptance: an unfamiliar optional pack installed after module packaging is discovered and selected without manifest edits; permitted documents hydrate/read, denied data never leaks; removal/permission/content revisions retire open results; SRD-only still works; no diagnostic fallback required; memory/paging measured. Needed by M1 discovery completion and M6 optional-content acceptance. Module SRD preparation work can proceed before delivery.

### E02 — Exact command outcome and concurrency qualification (conditional gap)

Evidence: SDK CRUD/embedded mutations return records; `commit` is sequential; DataStore has get/set but no compare-and-set/transaction. Native caller operations can occur outside the module queue. `useActorSheet.update` catches errors. Existing Shadowdark exact-ID recovery is useful precedent but not proof for D&D's larger grant graphs or multi-document rest/consumption.

Bounded task Q02 in M3: exercise public create/embedded/patch receipt shapes, submitted ID preservation, primary readback, lost-response and journal failure, native concurrent edits and restart. Decide which invariants can be proved with current APIs. If current primitives suffice, close E02 with evidence, without adding Core work.

If not: propose the smallest host contract for operation identity, exact acknowledged document IDs/outcome and fresh source revision/readback; optionally a host compare-and-mutate precondition with clearly documented atomicity limits. A Core-side lock is not a database transaction and cannot stop independent native writes. Any cross-client CAS promise needs verified Foundry support or an explicit conflict policy. Acceptance must prove no duplicate create/consumption, no stale overwrite falsely marked successful, and recovery after lost receipts. M3/M6 completion depends on the result, not on assuming rollback.

### E03 — Native description/enricher support (bounded investigation)

Core already exposes `processHtmlContent` for sanitizing enriched HTML, public document reads and shared rich-text/content UI. That does not promise native D&D `@UUID`, `@Embed`, inline-roll/rule/spell-list syntax evaluation. M7 Q03 inventories bundled content directives and maps each to existing SDK rendering/navigation or a pure module formatter. Links must resolve with caller access and preserve exact UUIDs. Unknown syntax renders readable unavailable text; never executes arbitrary macros.

Only an actually missing generic presentation/read capability becomes a Core proposal. Minimum extension, if needed: typed authorized content-reference activation/render results rather than a native browser hook executor. Acceptance includes nested denied references, unsafe HTML/URLs, accessibility and no hidden-data fetch before authorization. This is not a confirmed need for a new Core service yet.

### E04 — Scene/token/time and cross-Actor runtime boundary (confirmed limited surface)

Evidence: ordinary SDK document store mapping in `src/server/shared/utils/moduleDocumentServices.ts` excludes Scene and Setting; migration target relations do not grant gameplay access. Native summon/transform/teleport/area/rest-time code depends on scene/token/time or native registry behavior.

M7 Q04 separates PC-facing rules from canvas/world automation. Existing authorized Actor/Combat/Item/effect operations may satisfy companion and concentration work. If selected behavior needs scene token targets/placement or advancing world time, propose narrow typed caller-authorized capabilities with readiness/revision/outcome rules and explicit native permissions. No generic “execute native method” bridge. Accept exact Actor/Token identity, source-preserving unlinked-token semantics, denied cross-owner actions, world switch and cleanup. Keep canvas/Bastion automation outside this release unless the user selects it; do not claim it is implemented by a card or chat instruction.

### E05 — Numeric roll expressiveness (Q00 open; plain tied-value equivalence reviewed)

Core `src/server/core/foundry/Roll.ts` and `FoundryDieRules.ts`, governed by Core
ADR-0051, implement a bounded numeric grammar. It is not a native D&D `D20Roll`
or `DamageRoll` instance. Current limits include 256 formula characters and a
restricted operator/function/modifier set; raw `@` references and flavor syntax
are not accepted as arbitrary native input. The module must resolve references
and D&D-specific rule options into equivalent supported roll requests, preserving
die selection/critical semantics and recorded results. Do not truncate a formula,
replace an unknown term with zero, evaluate arbitrary JavaScript or introduce a
second dice engine.

Q00 inventories real bundled formula/filter/roll shapes and compares the intended
compiled requests against independently evaluated native outcomes with controlled
die results. Existing primitives may suffice after deterministic compilation;
that is not established yet. Only a demonstrated necessary unrepresentable term
becomes a Core proposal: narrowly typed roll capability/grammar extension with
bounded evaluation, accurate terms/visibility and parity fixtures. Acceptance
requires complete distribution/selection semantics, not merely one coincidentally
matching total. M4/M5 cannot claim complete action support until required terms
are covered; optional custom terms remain explicitly unsupported.

C07 qualifies normal numeric requests through an isolated real public host,
not simulateRoll. Existing kh1/kl1 candidates match all numeric totals and
selection distributions, but40 tied pairs retain the second equal die instead
of native BasicDie's first. C07 introduced an execution block and proposed a
first-tie contract. RV03 independently reproduced the difference and qualifies
that proposal: no necessary external dependency is established for homogeneous
plain d20 rolls solely by the identity of equal-valued dice.

The recommended bounded acceptance rule is correct selected value/count,
discard consistency, ordered observed faces, numerical outcomes and complete
distributions, retaining equal-value index differences as diagnostics. Host
serialization must remain unchanged. This is not an exemption for unequal dice,
rerolls, grouped dice, die-specific metadata or wider native behavior. See
[DD-R05](../audits/evidence/2026-10-19-c06-c07-review.md) and the RV03 addendum.
C08 corrects DD-R05 and restores this qualified adv/dis profile;
do not task Core with first-tie support without evidence that a scoped feature
requires it. Broader expressions/ranges/critical/chat behavior still require Q00.

## Existing world-context and migration adoption

Use Core 0064's released mechanism when a **demonstrated persisted module-owned defect** requires repair. Pure view corrections need no world migration. Native D&D upgrades/migrations are owned by the native system; SheetDelver must not recreate all `migrations.mjs` behavior or convert 2014 content to 2024.

For proven repairs, use a separate `migration.json` catalog and per-version definition/hooks: exact data-read versions, target kinds/paths, required dependencies/parent relations, check/plan/verify and lossless no-op behavior. Cover Actors, embedded Items/effects, relevant deltas and world packs only when affected. Required unreadable/locked/unresolved targets stay explicit blockers; don't quietly make required coverage advisory. Never write system/purchased packs. Preview/approval/maintenance/restart/recovery remain Core-owned; player advancement is not an admin maintenance migration.

Current module `_sheet_delver` flags/localStorage need a preservation decision. Native biography fields should be primary for native semantics; module-only note categories may remain namespaced. Do not auto-import an unscoped browser fallback into a different Actor/world. M8 must prove a safe source mapping before any persistent migration is planned.

## Dependency-ordered implementation roadmap

Every milestone produces a reviewable checkpoint: updated DD status with paths/symbols, acceptance evidence, command outputs with versions, unresolved qualifications, and the current handoff. Current branch and local implementation commit authority are recorded in the handoff; remote writes and releases remain separate. A milestone is complete only when its listed outcomes are evidenced. No version bump is part of ordinary implementation.

### M0 — Reference fixtures and test foundation

**Goal:** DD-01/30/33/36; stop extending synthetic assumptions.

- Use the authorized `feat/adr-0001-character-lifecycle` implementation branch. Record Core/module/native versions and clean/dirty state; preserve parked work.
- Add `tests/fixtures/native-6.0.6/` provenance/index and an independent oracle capture/comparison specification. Include source JSON, prepared snapshots and action before/after expectations separately; do not derive expected totals with module code.
- Add module-owned explicit type-check entry/config, test runner and source-oracle comparisons. Adjust CI deliberately after chosen public contracts are available; do not equate root typecheck or bundle success with module typing.
- Inventory all activity/advancement/setting/effect/schema features used by bundled modern content, including grant/reference closure and cycles. Q00: enumerate formula operators/roll terms/filters and dependencies not implementable by existing SDK utilities; resolve each to adaptation or a bounded external decision.
- Validate asset attribution and fixture licensing. Keep private premium records out of tracked packages.

**Gate:** two existing regression tests retained with honest labels; all new source fixtures versioned; required rule domains mapped to exact native symbols; no native-runtime experiment dependency. Source preservation tests cover nested objects and effects. No migration necessary. Risk: broad native expression/filter surface; return a coverage inventory, not an invented evaluator.

### M1 — Rule context, source model and caller catalog

**Goal:** DD-01/12/15/16/17/25/26/29/31/34; prerequisites M0, E01 for full dynamic scope.

- Implement versioned source decoding, unsupported-version/type states, identity helpers and world-settings declarations/refresh in adapter. Files: `info.json`, `src/logic/rules-context.ts`, `src/logic/native/6.0.6`, adapter.
- Implement caller-safe content index/detail routes and `getSystemDataForUser`; classify native pack IDs correctly, source provenance and edition by data. Add missing declared SRD dependencies as justified; do not hydrate every book as a workaround for E01.
- Model owned versus catalog data separately. Resolve dependency closure by exact UUID; support readable world Items and selection-specific sources. Wire request/current-user/world/context invalidation without a second world cache.
- Q01: extract structured calendar/source-configuration/visibility defaults and native spell-list registry inputs; add fixtures for default and changed settings, including missing/invalid values. Confirm data-revision signals used by the future E01 contract.

**Gate:** SRD-only and restricted-user catalog/choice tests; same-name 2014/2024 options distinct; missing/inaccessible references diagnosed; forbidden bytes absent from responses; context change rejects stale plans. Full E01 behavior must pass before optional-content completion, but pure SRD work can continue. No native document repair implied by schema decoding.

### M2 — Shared preparation and truthful read surfaces

**Goal:** DD-01–06/11/27/31/34; prerequisites M1.

- Implement class level/proficiency, ability/save/skill/tool/passive rules; AC/init/HP/HD/movement/senses; proficiencies/defenses/conditions; initial/final effects, applied-rule filters and Item final preparation in source order.
- Introduce the shared view/projection model consumed by adapter/card/standard/mobile/detail/roll-preview. Replace fallback guesses with native defaults only where proven; attach unavailable diagnostics elsewhere.
- Map effect conditions/transfer/suppression/priority/phase, equipped/attuned eligibility, spell and damage modifier dependencies; verify formula vocabulary from Q00.
- Replace UI attack/proficiency/item-row calculations with formats of shared results. Keep source immutable and environment-neutral.

**Gate:** A02–A06 reference comparisons on sparse source, overrides, effect ordering and multiclass levels; all visible consumers agree; no preparation writes. Q02a: any native filter not yet reproducible gets an explicit unsupported fixture and decision before marking this milestone complete. Risk: effects and formula dependencies are the largest pure-rules task; milestone may be split into checkpoints without reducing the gate.

### M3 — Strict command outcomes, inventory, health and narrative editing

**Goal:** DD-04/09/17/20/24/25/28/35; prerequisites M1/M2; E02 qualification.

- Add server manifest/routes, source-review plans, operation journal/status and module Actor serialization. Use public request runtime exclusively. Implement exact acknowledgement/readback and stale-plan rejection; preserve IDs across bookkeeping failure.
- Execute Q02 receipt/concurrency experiments using isolated public Core first, then separately authorized disposable native fixtures. Document achievable atomicity; propose Core extension only with a failing contract case.
- Implement owned Item acquire/edit/move/split/delete, container links, quantity/currency/equipment/attunement/identification and health/narrative commands with validated source paths and errors. Multiple writes use the same outcomes protocol.
- Replace callback-presence permission checks and swallowed successes. Native biography fields and module note sections remain distinct; scope presentation settings and never persist unscoped browser data automatically.

**Gate:** A07/A08/A16–A20; zero-write stale validation, duplicate submit, partial write, missing receipt, persistence failure, owner loss, external edit, readback mismatch and retry have documented outcomes. Native source never gains UI-only derived fields. No broad rollback guarantee; completion waits for authoritative receipts.

### M4 — Activities, combat actions, resources and rests

**Goal:** DD-04/05/07/08/10/11/27/31; prerequisites M2/M3, E05 qualification from Q00.

- Implement activity identity/selection and common plan/execute flow; attack/check/save/damage/heal/utility first, then linked cast/forward/enchant pathways needed by spells/features. Core rolls/chat evaluate/present; module computes native request semantics.
- Cover attack ability, mastery/modes, proficiency, ammunition, advantage/disadvantage, situational choices, criticals, damage types/scaling and permitted target updates. Treat descriptive native guidance separately from automatic mutations.
- Implement Item/activity uses, spell/resource consumption targets, material/quantity costs, recharge and authorized refund semantics. Preserve ordered consumption → concentration/message/final steps per native case.
- Implement hit-die spending, class HD recovery, HP/resources/slots/Item uses, exhaustion and effect expiry for normal/gritty/epic and new-day choices. Automatic time advancement remains E04, not a simulated timestamp write.

**Gate:** A05/A06/A08–A10/A13/A16–A20; independent formulas and all source deltas, exact roll/message counts, denied cross-owner targets and failure order. No “Cast succeeded” card if required source changes are unknown. Native comparison includes rest variant/modern-versus-legacy HD fraction. Compatibility fixtures must distinguish current source shape from old shims.

### M5 — Complete spellcasting model

**Goal:** DD-12–14/16/31/34; prerequisites M1–M4.

- Implement class/subclass/feat/species casting capabilities, multiple abilities, known/prepared/spellbook data, sourceItem/advancement grants and supported native spell-list registry semantics.
- Implement shared caster progression, pact pools, slot/uses choices, preparation maxima, rituals, upcasting, material supply, concentration creation/replacement/check/end and effects. Avoid class-name inference.
- Add owned spell management with catalog search/edition/provenance and exact ID selection; adding/removing/preparing/spell replacement validates native limits. Missing source does not hide an owned custom spell.
- Q05: resolve linked spell-list journal/reference closure and native methods with variable preparation modes; each uncovered shape gets an explicit fixture/handler before closure.

**Gate:** A11–A14/A17; full, half, third/subclass, pact and multiclass configurations; granted/innate/cantrip/ritual spells; duplicate names/copies; source revoked while dialog open; slot spend/recovery and concentration independently read back. No premium prerequisite.

### M6 — Guided builder and existing-character advancement

**Goal:** DD-06/13/15/16/18–22/25/31/35; prerequisites M1–M5 and E01/E02 resolved for applicable scope.

- Register tool/dashboard entry and build guided draft/review pages using the dependency graph above. Persist caller-scoped drafts and operation statuses; do not accept client-built authoritative Actor source.
- Implement native equipment and all nine advancement handlers with apply/reverse/restore semantics and exact metadata. Shared engine handles first creation, higher-level creation, existing level-up, multiclass, subclass and permitted choice/replacement edits.
- Prepare complete grant/effect/Item graph before creation. Revalidate everything server-side; assign Actor ownership to caller under native create permissions, preserve metadata and verify exact IDs. Do not assume an empty batch proves Actor-create permission.
- Implement valid-choice retention, back/cancel/resume, expired sources/context, invalid counts/prerequisites, duplicate grants, multiple levels and special post-20 boon behavior.
- Q06: prove single-Actor create preserves embedded IDs and cross-grant links on the supported native build; otherwise specify the exact staged creation/reconciliation protocol before shipping.

**Gate:** A01/A15/A16–A20; every bundled class/subclass completes 1–20; representative valid/invalid multiclass pairs, changed sources, cancellation, duplicate submission and crashes; open the result in native Foundry to verify advancement continuity/no duplicate grants. No inferred legacy conversion or unrestricted respec.

### M7 — Full presentation, accessibility and broader character interactions

**Goal:** DD-17/23/24/26–28/32/36; prerequisites stable M2–M6 projections/actions. Layout prototypes may proceed earlier without new rules logic.

- Replace placeholders with authoritative conditions/defenses/proficiencies/appearance/identity; complete unified tabs/cards and accessible loading/failed/unsupported states. Remove false promises from Extras or clearly label its selected scope.
- Consolidate common standard/mobile controllers and modal intent; refresh open details without overwriting valid manual edits; route invalid scope to accessible explanation. Footer/tool overlap, light/dark theme and world background are acceptance requirements.
- Verify nested SDK dialogs/shared content/rolls and host navigation. Q03 inventory/enricher task resolves supported native text directives and privacy.
- Q04 implements PC-linked companions/transformations and defines permitted scene-independent targets; record unresolved scene/time automation as a distinct external scope, with truthful controls. Preserve other Actor types without PC mutation actions.

**Gate:** A18–A23, keyboard-only and four widths/both themes, all workflows available equivalently; open consumer permission/world changes retire stale data, no late request resurrection. UI acceptance is actual installed Core evidence, not static component screenshots only.

### M8 — Packaging, compatibility and any proven data repair

**Goal:** DD-29/30/33 plus all release-facing contracts; prerequisites completed implementation slices.

- Audit persisted differences from native/previous module data. Decide whether any module-owned repair is necessary; if none, record “no migration needed” with evidence. If needed, use existing reviewed maintenance contract and complete target scope/history.
- Verify module source/UI/server/hook types, all maintained suites, boundary checking and isolated package. Test minimum selected released Core and current supported Core, actual managed install and source checkout.
- Reconcile actual contract use with `info.json`, CI/release pins and public docs; compatibility floor changes need explicit dependency evidence and authorization. Do not add an invented sdkVersion authority.
- Audit packaged licenses/assets and permitted fixture contents; independent archive/hash identity in every installed test. Do not bundle private premium packs or native runtime code indiscriminately.

**Gate:** A21/A22/A24; package works without dev checkout, no Core private imports/browser service, correct migrations or explicit no-op decision, documentation links/architecture/feature boundaries accurate. Release metadata/tag/publication remain separately authorized.

### M9 — Native and operator completion

**Goal:** all DD requirements within accepted scope; prerequisites M0–M8, E01 closed and other external dispositions proven.

- Execute [the complete native/permission/recovery matrix](../plans/0001-verification.md) against explicitly approved disposable Foundry 14.367/D&D 6.0.6 and current approved Core/package identities.
- Collect independent source and prepared oracles, ordered action receipts, UI interactions, actual player/GM permissions and source preservation. Exercise SRD-only, partial optional collections, mixed/custom/denied content and future-version refusal.
- Complete operator review of creation/advancement/play/rest/reconnect/recovery and scope explanations. Clean only task fixtures; retain evidence with versions and exact hashes, no credentials.
- Remove experimental designation only after explicit user acceptance and every selected gate has passed; this phase does not remove it.

**Gate:** no open confirmed critical rules/privacy/data-loss defect; no unsupported ordinary 2024 lifecycle hidden behind a passing mock; all acceptance rows have evidence or an explicitly approved broader-scope exclusion. An external unresolved dependency required by the target keeps the ADR open.

### Critical path and progress ledger

Critical path: **M0 → M1 → M2 → M3 → M4 → M5 → M6 → M8 → M9**. M7 consumes the same contracts and must finish before M9. E01 can be proposed while pure SRD work proceeds; E02 is resolved during M3, before larger lifecycle writes. E03/E04 are bounded in M7 and must not become an unreviewed generic native-runtime project.

| Gate | Current phase state | Required evidence location |
| --- | --- | --- |
| M0 | In progress: C01 foundation plus C05 numeric/source-mode/d20-selection S comparisons; full Q00 open | `tests/fixtures/native-6.0.6/`, maintained scripts, verification C01/C05 |
| M1 | In progress: C02 detached schemas/context and caller metadata; E01/Q01/installed gates open | Settings/catalog/source/closure tests; verification C02 |
| M2 | In progress: C06 corrects DD-R03/R04; C07 source modes/passives; C08 corrects DD-R05 plain-d20 execution; C09 independent source tool checks. C10 corrects DD-R06; C11 qualifies selected checks/abilities. C12 eligibility, C13 initial numeric fields and C14 constant bonuses and C15 effect modes/passive order and C16 HP/HD, C17 armor/initiative and C18 source equipment and C19 movement/senses are bounded slices. Final/filters/Item phases, broader expressions and bounded-mode execution remain open; C20 qualifies normal ranges | RV01–RV04 retained; C06–C19 separate R/S/mounted/isolated-host evidence |
| M3 | Not started; E02 qualification needed | Command/receipt/concurrency results |
| M4 | Not started | Activity/rest/action source deltas |
| M5 | Not started | Casting/preparation/slot/concentration matrix |
| M6 | Not started | Builder/advancement class-level matrix |
| M7 | Not started; E03/E04 bounded tasks | Installed UI/linked-creature results |
| M8 | Not started | Archive/compatibility/migration/license evidence |
| M9 | Not started, no live authority in this phase | Native/operator acceptance ledger |

## Decision register

Recommendations below make the next implementation task bounded. The implementation task accepts the recommended 2024-first architecture and boundaries; decisions do not authorize work outside the module.

| ID | Recommendation | Alternatives / tradeoff | Disposition |
| --- | --- | --- | --- |
| D01 | Exact current Foundry-installable 6.0.6 as oracle; primary v14.367 | Development HEAD changes unreviewed behavior; v13 needs older system profile | Confirmed target; preserve checkout beyond tag |
| D02 | Complete modern 2024 lifecycle first; shared 2014 document compatibility where proven, full legacy-world/v13 qualification separate | Full dual-profile delivery substantially increases fixtures, rule branches and support; no legacy preservation exemption either way | Accepted 2024-first; full legacy qualification separate |
| D03 | Pure versioned module interpreter with public Core primitives | Native runtime/browser bridge violates current parked decision; naive fallback formulas cannot satisfy parity | Recommended; experiment remains parked |
| D04 | Dynamic caller-authorized content, SRD sufficient, E01 generic Core extension | Static premium lists miss arbitrary installations; privileged preload leaks data; diagnostic live reads are not contract | Recommended; requires separate Core task for E01 |
| D05 | Durable intent/receipt/status, reject zero-write stale attempts, reconcile uncertain outcomes | Blind retry duplicates writes; rollback is not guaranteed; global maintenance for ordinary play is inappropriate | Recommended; E02 qualification may require narrowly scoped host work |
| D06 | Native choice editing and level-up replacements; unrestricted respec/edition conversion deferred | Full respec requires reversible dependency closure, policies for manual grants and extensive native comparison | Accepted bounded choice editing; unrestricted respec/conversion separate |
| D07 | PC-linked companions/summons/transforms included; canvas/Bastions/GM authoring separate | Full virtual tabletop management expands Core/SDK scope beyond character sheets | Accepted PC-facing target; broader automation separate |
| D08 | Supported native optional rules enumerated and tested, unknown extensions explicitly unsupported | Claim arbitrary hook/module compatibility would require unavailable runtime and weaken evidence | Recommended |
| D09 | Runtime authorized content references with per-asset rights review and neutral fallback | Bundling all native art/content conflicts with mixed licenses; URL access alone is insufficient | Recommended; seek asset permission if restricted art is desired |
| D10 | Keep experimental until M9; choose version floors from actual released contract dependencies | Early badge removal or speculative minimums hide incomplete behavior | Recommended; no metadata edits in planning |

## Consequences and handoff

This is a substantial implementation with a rules foundation on the critical path. Existing visual work and public host contracts remain useful, but their presence cannot close the missing behavior. The plan allows intermediate reviewable delivery while retaining the complete 2024 target. Discovery work is module-owned; new Core capabilities require their own approved task and release before this module relies on them.

Implementation has begun with the C01 foundation checkpoint. Continue M0/Q00 and dependency-ready M1 work; E01 remains external. D02/D06/D07 follow the user-selected recommended scope. Keep this ADR, the DD matrix, acceptance ledger and module handoff current at each implementation checkpoint. Do not reopen completed Core ADR-0064 merely because this document references its mechanisms.


## Independent C01–C03 review addendum — 2026-10-19

The [review report](../audits/evidence/2026-10-19-c01-c03-review.md) and
[portable results](../audits/evidence/2026-10-19-c01-c03-review.json) independently
verify the reported 31 tooling assertions, seven module suites,82-file typing,
exact-release inventory and isolated package at `6189dcd`. All15 packaged regular
files match the implementer's archive. These remain R/S/static-render/package
results, not I/U/N/O acceptance.

Two module corrections qualify C03's availability claims:

| ID | Required correction | Gate / evidence |
| --- | --- | --- |
| DD-R01 | Native skill/ability/global-check/global-skill `roll.min` and `roll.max` cannot be silently ignored. Until equivalent SDK execution is qualified, give a precise unavailable state for affected rolls. Preserve independently known static/passive values where separable. | DD-02/24/34,A02,M2/Q00. Eight same-input failures plus eight controlled exact-native range comparisons. |
| DD-R02 | An unavailable setting, absent world snapshot or unsupported native version must not fall through to the old multiplier-as-total skill calculation. Return consistent unavailable controls and reject direct skill execution; explicitly selected legacy scope remains separate. | DD-01/02/24/31/34,A02/A18,M1/M2. Three cases reproduce +1/passive11 and an enabled control where the supported baseline is +5/passive15. |

Resolve these two bounded corrections with failing-before/passing-after source,
static and mounted consumer evidence, then continue Q00 and remaining M2 phases.
Restore supported context and verify correct results return without stale intent.
This does not select a new dice engine, data migration or Core change. E01 stays
the existing external content dependency; other E cases remain conditional.
M0/M1/M2,all full DD/A workflows and ADR closeout remain open. No version bump,
live acceptance or release follows from this checkpoint. The ADR was saved locally
before annotation; no application changes or Git writes were made by the review.

### C04 correction disposition

DD-R01/DD-R02 are corrected as module readiness defects: configured/malformed
native min/max fields block execution, while independently known static skill
totals/passives remain separate. Unknown/unsupported context produces unavailable
values and cannot select legacy by absence of prepared checks. Explicitly selected
legacy compatibility remains unqualified and distinct. Mounted desktop/mobile
consumers retire open intent and fence retained callbacks through loss/recovery.
See verification C04 and its portable evidence. Native die-range execution still
requires Q00 qualification; temporary unavailable states do not close M2/A02.
Next, continue bounded Q00/M2 shared ability/check/save preparation using the
same source-context and execution-readiness separation. No new Core requirement.

### C05 shared preparation disposition

C04 is checkpoint `e9c579d`; the review checkpoint remains `1163db4`. C05
continues DD-01/02/24/34 and A02/A18 with independent numeric ability/check/save
expectations. Six of eight cases failed on C04; all now pass using a shared
source profile, proficiency calculation and numeric D20 compiler. Cards use the
same qualified level/proficiency. Both layouts, previews, shortcuts and direct
execution consume prepared results, fence stale intent and reject unsupported
options or unavailable context. Source remains unchanged.

Q00 advances through controlled exact-release comparisons: eight preparation
cases,81 source-mode combinations,800 ordered d20 selections, combined ranges
and null defaults. These are S evidence with declared stubs, not native/SDK
engine or installed acceptance. Native source modes are not implemented by this
checkpoint. Bounds remain unavailable; effects/filters, conditions/flags,
proficiency dice, expressions, transformations and tools still need work.
No full DD/A/M gate closes; E01 is unchanged and E02–E05 have no new Core defect
claim. See verification C05 and its portable evidence for commands and artifacts.
Next implement source-mode combination/passive semantics from the controlled
expectations, then qualify the public roll path before widening formula/range
support. Continue shared tool preparation and the planned effect phases after
their independent expectations are ready. ADR-0001 remains open.

### Independent C04/C05 review addendum — 2026-10-19

RV02 reviewed `b45e144`, independently reran the reported offline checks and
confirmed DD-R01/DD-R02 corrections. See the
[review report](../audits/evidence/2026-10-19-c04-c05-review.md) and
[portable ledger](../audits/evidence/2026-10-19-c04-c05-review.json).
All15 regular package files match the reported archive. This remains offline
and controlled-source evidence, not native/operator acceptance.

Two corrections qualify C05 and should be included in the next M2 checkpoint:

| ID | Decision / correction | Required evidence |
| --- | --- | --- |
| DD-R03 | Level/proficiency must have explicit availability. When the shared profile is unavailable, cards/headers must not reuse old defaults or stale source fields. Preserve independently qualified facts where separable; use one projection for every consumer. | Supported5/+3 → unknown/unqualified → recovered5/+3; equipped equipment, invalid class levels and poisoned source fields. Check cards, desktop/mobile headers/proficiency, and unchanged source. |
| DD-R04 | Respect native schema initialization before rule preparation. Global roll proficiency fields are nonpersisted targets initialized to0, not raw source overrides. Keep later effect-derived values separate from source fixtures. | Poisoned nonpersisted source values cannot affect output. Separate source/default cases from the existing intermediate-model arithmetic cases; future effect cases must traverse the real preparation phases. |

Both are module corrections under DD-01/02/24/30/34 and A02/A03/A04/A18;
neither requires a Core change, migration, broader legacy support or a native
runtime. The previous eight arithmetic comparisons retain value at their stated
phase but do not prove source initialization. Once corrected, resume source-mode
combination/passives and public roll-path qualification in dependency order.
No full milestone or acceptance gate closes; E01 remains the existing external
dependency. Review-only documentation changes are uncommitted; application code,
compatibility and version metadata were not changed. The prior ADR was saved
locally before this addendum.

### C06 correction disposition

Review documentation was checkpointed separately as `35c6abc`; the ADR was saved
before revision. DD-R03/DD-R04 are corrected as bounded module defects. Shared
class facts carry status/value/display/reason/provenance to cards and both sheet
headers/proficiency controls. Unknown context or class data cannot reuse source
level/prof or old defaults. Independently known level5/+3 survives unresolved
equipped armor while rolls remain unavailable. Effects remain unqualified.

Detached global roll initialization restores nonpersisted proficiency0 and
preserves persisted fields and source bytes. Eight intermediate arithmetic cases
remain separate from eight source/default cases; no source override stands in
for effect support. Maintained tests first reproduced five fact fallback cases
and three poisoned proficiency cases; all pass after correction. DD-R01/DD-R02
remain corrected. Verification C06 records regressions, controlled S comparisons,
mounted header/proficiency checks and isolated packaging separately. Full DD/A/M
gates and ADR-0001 remain open. Next execute the existing source-mode/passive
package and public roll-path qualification; E01 and E02–E05 dispositions unchanged.

### C07 bounded modes/passives and public execution qualification

C06 corrections are checkpoint `f4d78f6`; DD-R01–DD-R04 coverage remains passing.
The ADR was saved before C07 revisions. Eighty of81 independent source-mode
cases were unavailable before this slice. All81 static mode/passive cases now
agree with exact native methods, including cancellation and passive±5. Ability/
save source modes share the same interpretation. Nonpersisted mode counts and
proficiency remain separate from source. Ranges/effects remain unavailable.

Public host qualification uses the normal released Core entry point, public
login/module request runtime and synthetic loopback transport. All901 numeric
outcomes agree;40 native tie-index mismatches keep E05 explicitly open. Normal
numeric requests are qualified within the documented literal bound. Default and
manual adv/dis execution are fenced consistently in controls, previews, shortcuts
and direct calls; known static totals/passives remain visible. This intentionally
supersedes C03/C05's unqualified manual adv/dis execution assumption. It does not
count unavailable execution as completed native rules support.

See verification C07 and portable evidence for hashes, blocked qualification
exit2 and separate R/S/isolated-I evidence. No new Core defect, version/floor
change, installed UI or N/O acceptance. E01 remains external. Next qualify a
public first-tie selection primitive under separately scoped Core authority;
independently continue source-only tool preparation and planned effect phases
with their own oracles. Full DD/A/M gates and ADR-0001 remain open.

### RV03 — independent C06/C07 review and E05 scope correction

The [review](../audits/evidence/2026-10-19-c06-c07-review.md) at `a1492d8`
independently confirms DD-R01–DD-R04 corrections, the new mode/passive
preparation and reported checks. The unchanged public harness again exits2:
901 numeric outcomes pass;40 equal-faced pairs differ only in retained index.
All15 packaged regular files match the reported C07 archive.

**DD-R05** qualifies the C07 next-step recommendation above. A first-tie Core
extension is not demonstrated necessary for the current plain numeric d20
profile. The review recommends treating interchangeable equal values as
equivalent for this profile while retaining their index difference as diagnostic
evidence. Ordered faces, correct retained value/count, discard consistency,
totals and distributions remain required; actual host records remain untouched.
This is a bounded adaptation decision, not a relaxation for unequal dice,
rerolls, grouped dice, effects or distinguishable per-die rules.

Next module checkpoint: encode that acceptance boundary in maintained tests;
restore qualified manual/source advantage and disadvantage through the existing
public primitive; verify mode choices, previews, shortcuts and direct requests
plus stale-intent recovery. Then continue source-only tool preparation. Preserve
range/effect/formula/other unqualified gates and continue wider Q00/E05 work.
An actual future die-identity-sensitive requirement may justify a narrow Core
proposal; the tied-index diagnostic alone does not. E01 remains external.

At the RV03 checkpoint the guards were still present (C08 corrects them below).
That review changed documentation
only and does not close ADR-0001, any full acceptance gate or native/operator
qualification. The prior ADR was saved before annotation.

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

### C09 — Independent source tool checks (2026-10-20)

Implementation commit: `bbce67765f8ddc34781d22d5ff75add70e454051`.

C08 (`6839b73f1dcba855be4dec9da615b2ec0b46e1bb`) corrects DD-R05 after
review checkpoint `89f4645`. C09 advances the existing M2 tool work under
DD-02/24/34 and A02/A18; it does not close those full requirements. Independent
expectations were written first: the untrained case failed with no tool result
where the pinned expectation was−1, then passed with the same source.

Shared source-only preparation now handles exact native Actor tool/vehicle keys,
verified existing-entry defaults (INT/0), source proficiency0/.5/1/1.5/2, numeric
bonuses and all81 four-scope mode combinations. Direct execution, both layouts,
roll previews/buttons/shortcuts and stale-intent recovery consume that result.
Nonpersisted/prepared fields never override source defaults; source stays intact.

Native combined skill/tool checks use the larger selected proficiency and can
add advantage when both selected prepared proficiencies are positive. They are
separate from independent checks: C09 rejects combination, pace and alternate
ability requests and explains that boundary on the tool surface. Owned Item
activities, effects/flags, expressions, ranges and other unqualified phases stay
open; temporary unavailable states do not count as support.

See [C09 verification](../plans/0001-verification.md#c09--independent-source-tool-checks-2026-10-20)
and [portable evidence](../audits/evidence/2026-10-20-c09-tools.json). R/S,
mounted module and isolated public-host evidence are distinct from installed
UI/native/operator acceptance. E01 remains external, wider Q00/E05 remains open,
experimental0.4.1 and compatibility are unchanged. ADR-0001 stays open.
Next executable M2/Q00 package: independently qualify selected combined
skill/tool checks and alternate-ability re-preparation against the pinned native
roll builder before exposing those choices, then continue planned effect phases.

### RV04 — independent C08/C09 verification (2026-10-20)

Review at `1c81d05` confirms DD-R05's bounded plain-d20 correction and shared
source-only tool preparation. DD-R01–DD-R04 regressions remain passing. The
fresh public-host run passes 943 requests with the 40 equal-index diagnostics
retained; mounted consumers, explicit typing, native-source/method checks and
isolated packaging pass. The rebuilt archive's 15 regular files match C09's
reported archive. These are separate R/S/mounted/isolated-host observations,
not installed UI/native/operator acceptance.

One low-priority module presentation finding, **DD-R06**, belongs with the next
M2 package: pointer exit clears a focused mode button's formula preview, although
keyboard activation still submits the correct selected mode. Track focus/hover
independently and add a mounted regression; keep source defaults, explicit
overrides and intent retirement intact. This does not reopen DD-R05 or establish
a Core dependency, and need not hold combined-check investigation.

See [RV04](../audits/evidence/2026-10-20-c08-c09-review.md) for reproduction,
commands and limitations. Continue selected combined skill/tool and alternate
ability qualification against the exact native builder before exposing choices.
E01, wider Q00/E05, later milestones and ADR-0001 remain open. The prior ADR was
saved as `temp/ADR-0001-before-rv04.md`; review annotations are uncommitted.

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

### C11 — Selected skill/tool checks and alternate abilities (2026-10-20)

Implementation commit: `53270c40d1ed01e8a87daab45da56132433b8710`.

Review checkpoint `e9be054`; DD-R06 correction `508369f`. The saved C11 ADR
precedes substantive changes. C11 advances DD-02/24/27/34 and A02/A18 within
M2/Q00. Of the original36 independent requests,34 failed before and pass after;
38 final cases compare with exact87e94db native dispatch/preparation/builders.

One source-only prepared operand model now serves independent projections and
configured execution. A skill may select a tool, a tool may select a skill, and
either may select a supported source ability. Proficiency is the larger selected
multiplier, rounded down once against class proficiency. Both positive selected
proficiencies grant advantage, including half proficiency with a zero flat bonus.
Only the primary local/global type and selected-ability/global-check scopes
supply numeric bonuses/modes/ranges. A secondary check does not add its bonus,
mode, ability or range. Automatic advantage cancels source disadvantage; manual
buttons remain explicit overrides. Source and nonpersisted-field boundaries hold.

Each module selection previews a freshly configured native-equivalent request
using the final ability. Exact native in-place formData ability edits instead
rebuild parts/ranges while retaining process mode; that phase difference is
compared separately, not represented as native dialog parity. The shared modal
shows the selected ability, combined source mode and unavailable reasons.
Clearing selections restores independent/default checks, retains still-valid
ability choices, and never persists roll choices. Actor/context changes retire
whole dialogs/callbacks; recovery starts with current, empty selections.

The [C11 ledger](../plans/0001-verification.md#c11--selected-checks-and-alternate-abilities-2026-10-20)
and [portable record](../audits/evidence/2026-10-20-c11-selections.json) distinguish
R, S, mounted and isolated-host evidence. Effects/flags, range execution,
proficiency dice, expressions, pace, Item activities and general legacy expansion
remain unavailable. E01 and wider Q00/E05 remain open. No full DD/A/M gate closes;
ADR-0001 and native/operator acceptance remain open, experimental0.4.1 unchanged.
Next executable M2/Q00 package: independent effect eligibility/phase-order and
numeric proficiency/check-bonus fixtures, then the first qualified shared effect
slice. Apply Q02a to unsupported filters; do not invent a Core dependency.

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
and [portable record](../audits/evidence/2026-10-21-c12-effects.json).
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
and [portable record](../audits/evidence/2026-10-21-c13-numeric-effects.json).
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
and [portable record](../audits/evidence/2026-10-21-c14-constant-bonuses.json).
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
and [portable record](../audits/evidence/2026-10-21-c15-effect-modes.json).
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
and [portable record](../audits/evidence/2026-10-21-c16-health.json).
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
and [portable record](../audits/evidence/2026-10-21-c17-defenses-initiative.json).
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
and [portable record](../audits/evidence/2026-10-21-c18-equipment.json).
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
and [portable record](../audits/evidence/2026-10-21-c19-movement-senses.json).
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
[portable record](../audits/evidence/2026-10-21-c20-range-qualification.json).
This checkpoint changes verification only; DD-R01 execution stays gated until
C21 applies normal bounded compilation consistently across consumers. No full
gate closes. ADR-0001/E01/wider Q00/E05/native/operator acceptance stay open;
experimental0.4.1/compatibility and the parked runtime remain unchanged.
