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

### E05 — Numeric roll expressiveness (conditional, qualify in Q00)

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

| Gate | State at planning checkpoint | Required evidence location |
| --- | --- | --- |
| M0 | In progress: C01 verification foundation/source inventory; Q00 and executable rule-domain oracles open | `tests/fixtures/native-6.0.6/`, maintained scripts, verification C01 |
| M1 | In progress: C02 detached schemas/context and caller metadata; E01/Q01/installed gates open | Settings/catalog/source/closure tests; verification C02 |
| M2 | In progress: C04 corrects DD-R01/DD-R02; die-range execution, other domains/Q00/effect phases open | RV01 retained; C04 source/static/mounted correction evidence |
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
