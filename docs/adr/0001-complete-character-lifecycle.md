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

### E02 — Exact command outcome and concurrency qualification (bounded public gap; open)

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
| M2 | In progress: shared source/default Actor rules, qualified checks/combined selections, typed initial/final effects and conditions; C75 Item reads, C76 mappings, C77–C79 formulas/class references, C80 Normal proficiency dice, C81 physical reads,C82 combat modifiers,C83 stored encumbrance and C84 Item proficiency/resource/reference phases. Full exit work is tracked in the verification ledger; earlier C06–C74 evidence remains below. | RV01–RV04 and C06–C78 preserve separate regression/controlled-source/mounted/public-host evidence; full acceptance open |
| M3 | C32 Q02 public qualification; C33 journal/admission/Actor queue and read-only status foundation | No domain review/execute routes; native ID/concurrency and acceptance remain open |
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
[portable record](../audits/evidence/2026-10-21-c21-normal-ranges.json).
DD-R01's temporary normal-range restriction is superseded only for these qualified
profiles; DD-R01–06 malformed/context/stale protections remain. Bounded adv/dis,
other formulas/flags/groups/effect phases and full lifecycle acceptance remain
open. Next independent M2 work: source/default Item eligibility and remaining
rule/filter/final preparation, then dependency-ready M3 qualification. E01 and
wider Q00/E05/native/operator gates remain open; ADR-0001 and experimental0.4.1/
compatibility are unchanged.

### C22 — Item effect source/default eligibility (2026-10-21)

C21 is `d97f34b`. C22 advances M2/Q00, DD-02/24/27/34 and A02 partially.
The initial eligibility plan previously consulted raw `equipped`/`attuned` fields.
Exact release6.0.6 declares these on five equippable Item schemas; Foundry14.367
initializes both to false. Omitted/null values could incorrectly admit an initial
transferred effect. Conversely, extra equipped/attunement fields on other Item
schemas could incorrectly suppress it. The source-only eligibility path now
initializes only the declared fields before suppression, retains origin metadata,
and ignores extra fields outside their schema. Exact StringField trimming and the
consumable rod/trinket/wand exception are preserved. Source is never rewritten.

Independent source/default cases and pinned getter comparisons are separate from
C12's initialized phase traces and C13–15's later arithmetic. Malformed/coerced or
legacy numeric attunement, unknown types, active dependencies, Item-target effects,
filters, final phases and creation hooks remain unqualified. Proven inactive
transfers do not block otherwise qualified checks. No new Core requirement follows.

[C22 ledger](../plans/0001-verification.md#c22--item-effect-source-default-eligibility-2026-10-21)
and [portable evidence](../audits/evidence/2026-10-21-c22-item-defaults.json)
record failing-before/passing-after cases, actual consumer/host verification,
commands, artifacts and phase limits. No full DD/A/M gate closes. Next: truthful
shared identity/trait projections and remaining M2 rule/filter/final phases,
followed by dependency-ready M3 qualification. E01, wider Q00/E05 and installed/
native/operator acceptance remain open. ADR-0001 and experimental0.4.1 unchanged.

### C23 — Shared species source identity (2026-10-21)

C22 is `6f95ea2`. C23 advances M2, DD-02/06/15/34 and A02/A14 partially.
Cards and headers previously chose the first owned race Item even when a different
stored species ID was selected. One exact local-reference resolver now feeds
movement/senses and a detached source identity fact. Cards, both headers and
`getRaceData` consume that fact. It carries status/provenance, canonical owned ID/
UUID, preserved edition metadata and explicit absent/unavailable reasons. Unknown
context never chooses legacy. Selected legacy retains its clearly labeled,
unqualified first-Item compatibility boundary.

Native LocalDocumentField deliberately returns an unmatched stored string when
fallback=true. That is displayed as source text with no Item identity, not resolved
by name or first Item. Movement remains unavailable when it needs an unresolved
species. Conversely, a valid source name/identity can remain visible when unrelated
class or movement data is unqualified. Item rule/effect preparation is not inferred
from that source fact. Malformed/wrong-type/duplicate/cross-Actor references remain
unavailable. No source mutation, new lookup cache or content-access bypass exists.

[C23 ledger](../plans/0001-verification.md#c23--shared-species-source-identity-2026-10-21)
and [portable record](../audits/evidence/2026-10-21-c23-species.json) distinguish
regression, controlled source, mounted/public-host and package evidence. Earlier
C19 fallback-string diagnostics are now exposed truthfully as identity text,
without weakening movement/rule gates. No full DD/A/M or installed/native/operator
gate closes. Next: remaining trait/defense/condition and rule/filter/final/Item
preparation under M2/Q02a. E01 and wider Q00/E05 remain open; experimental0.4.1,
compatibility and ADR-0001's open status are unchanged.

### C24 — Condition-free defense traits and presentation (2026-10-21)

C23 is `3bbf52d`. C24 advances M2, DD-05/27/34 and A02/A04 partially.
The constant “No active defenses” placeholder is replaced by one shared detached
projection for damage resistances/immunities/vulnerabilities, condition immunities
and numeric damage adjustments. Verified String/Set/schema defaults precede exact
condition-free native ALL/overlap normalization. Physical-only bypass metadata,
custom semicolon text, duplicates and source order are retained. UI/cards consume
prepared displays; they do not compute trait rules. The mobile Defenses button
opens the shared accessible frame and reads current facts while open.

Category availability is explicit. Unknown/malformed immunity also gates dependent
resistance normalization; independent categories can remain known. Unqualified
modifier expressions do not erase known source immunities. Class or armor failure
alone does not erase independently qualified defenses. Non-schema/prepared-looking
fields, including condition-immunity bypass poison, never become source overrides.
No Actor/Item/effect source is mutated. No damage application or condition-effect
execution is implied by a readout. Active conditions, unqualified initial/final/
Item/filter/flag phases, broader expressions and general legacy remain gated.

[C24 ledger](../plans/0001-verification.md#c24--condition-free-defense-traits-2026-10-21)
and [portable record](../audits/evidence/2026-10-21-c24-defense-traits.json) distinguish
independent source expectations, controlled primitive/normalization/presentation
methods, actual mounted consumers, public roll regression and packaging. No full
DD/A/M or installed/native/operator gate closes. Next: qualified initial trait-set
and constant modifier effects, then remaining conditions/proficiencies/languages,
rule/filter/final/Item phases under M2/Q02a. E01/wider Q00/E05 remain open;
ADR-0001, experimental0.4.1 and compatibility unchanged.

### C25 — Initial trait-set and constant adjustment effects (2026-10-21)

C24 is `3d46c79`. C25 advances M2/Q02a, DD-05/27/34 and A02/A04 partially.
The existing shared initial-effect pipeline now accepts the qualified persisted
StringSet defense targets and constant damage-adjustment FormulaFields. Source
initialization, native deltas, prepared operand arrays/reduced constants and later
defense normalization remain separate. Source and nonpersisted poison are unchanged.
The same operands feed numeric readiness, cards, readouts, previews and execution;
there is no UI-only application path or extra cache/evaluator.

Native ArrayField parses JSON before element casting. Raw arrays are not equivalent
to JSON array strings. Set comparisons precede StringField trimming: subtracting
“ fire ” does not remove existing “fire”; equal-member upgrade/downgrade can change
order. Add/subtract/override/superset/subset behavior and native multiply no-op are
qualified by exact field methods, including native equality and Set primitives.
Constant modifier add/subtract/override records the actual native formula string
separately from the module's reduced operand. Unknown/reference/coerced deltas,
non-schema targets, broader formula operations and final/active-condition phases
stay unavailable; explicit legacy behavior is unchanged and remains unqualified.

[C25 ledger](../plans/0001-verification.md#c25--initial-defense-trait-effects-2026-10-21)
and [portable record](../audits/evidence/2026-10-21-c25-trait-effects.json) retain
failing-before/passing-after, ordered field/native-source, actual mounted/public-
host and package evidence. No source persistence or automatic damage/condition
application is added. No full DD/A/M/installed/native/operator gate closes. Next:
remaining proficiencies/languages/conditions and rule/filter/final/Item preparation,
then dependency-ready M3/Q02. E01 and wider Q00/E05 remain open; ADR-0001,
experimental0.4.1 and compatibility unchanged.

### C26 — Truthful roll proficiency indicators (2026-10-21)

C25 is `7e147f2`. C26 advances the existing M2 read-surface work, DD-02/06/27/34
and A02/A21 partially. Skill coefficient1.5 previously fell through to the empty
untrained dot; null/unavailable skill or saving-throw proficiency also appeared as
zero/false. One shared formatting component now renders all qualified coefficients,
an explicit1½× marker, and an unavailable state with accessible labels/reasons.
Saving-throw nullable state is preserved. This formats already-prepared effective
roll proficiency, not stored training or a new grant. No rule/formula/mode/source
calculation or execution gate changes.

The maintained mounted diagnostic captures14 mismatching rows/20 wrong cells at
1440/390 before correction; the normal maintained suite retains strict assertions.
Pinned numeric methods independently establish the source coefficient/total/passive/
save expectations, including half and1.5 rounding and bounded source advantage.
Known static coefficient remains visible when its default bounded execution mode
is unqualified; explicit Normal still uses the existing compiler. Source/global
nonpersisted poison and context recovery remain covered.

[C26 ledger](../plans/0001-verification.md#c26--truthful-roll-proficiency-indicators-2026-10-21)
and [portable evidence](../audits/evidence/2026-10-21-c26-proficiency-indicators.json)
separate regression/controlled-source/mounted/public-host results. No full gate or
native/operator acceptance closes. The larger Proficiencies panel still contains
fixed grants; next M2 work replaces it with shared source training/languages,
then remaining conditions/rule/filter/final/Item phases. E01/wider Q00/E05 remain
open; ADR-0001, experimental0.4.1 and compatibility unchanged.


### C27 — Shared source training and language facts (2026-10-21)

C26 is `76c8d81`. This advances M2, DD-02/06/27/34 and A02/A21 partially. The fixed
universal armor/weapons/Common panel is replaced by one detached source/default/
qualified-initial-local DTO consumed by cards and both layouts. Global check/tool
proficiency never implies training. Known local training can survive independently
unresolved class/roll preparation; unknown context never falls through to legacy.

Pinned native schemas, localization, trait/language presentation, tool preparation
and conditional mastery methods establish independent expectations before UI wiring.
Source, initialized defaults, local effectValue and effective prepared value remain
separate. Specific source keys retain exact identity/canonical reference metadata
with unresolved labels; no private Item index, discovery cache or same-name lookup.
Mastery bonus properties remain conditional metadata, not Item execution. Language
ALL/group/custom/ranges and category-level unavailable reasons are shared, canonical
English and deterministic. Prototype lookup diagnostics are preserved as evidence,
not usable labels. Source and nonpersisted poison remain unchanged.

[C27 ledger](../plans/0001-verification.md#c27--source-training-and-languages-2026-10-21)
and [portable evidence](../audits/evidence/2026-10-21-c27-training.json) distinguish
R/S/mounted/public-host/package checks and limits. No full gate closes. Next bounded
M2 work: qualified initial training/language/mastery Set effects using established
field semantics, then remaining conditions/rules/filter/final/Item phases and
M3/Q02. E01/wider Q00/E05, installed/native/operator acceptance and ADR-0001 remain
open; experimental0.4.1 and compatibility unchanged.


### C28 — Initial persisted training Set effects (2026-10-21)

C27 is `8ad3bbc`. This bounded M2/Q02a slice advances DD-02/06/27/34 and A02/A21
partially. The existing initial typed-field path now applies qualified armor/weapon
training, languages and separate mastery weapon/property Sets. A single pinned
identity classifier serves preparation and effect validation; there is no duplicate
world/content cache, grant inference, private index or new dice evaluator.

24 independent expected source/default/field-operation cases are established and
compared with exact pinned primitive/schema/native language methods before module
support; all24 fail before and pass after.15 unknown/coerced/reference/custom-string/
filtered/final boundaries stay unavailable. Priority/source order, null defaults,
untrimmed comparisons, native no-op multiply and grouped/ALL language presentation
are preserved. Source/nonpersisted poison, known static facts, context recovery and
same-total stale intent retirement remain covered. Native source IDs can be wider
than the bounded vocabulary; unavailable is not asserted native schema rejection.

[C28 ledger](../plans/0001-verification.md#c28--initial-training-set-effects-2026-10-21)
and [portable evidence](../audits/evidence/2026-10-21-c28-training-effects.json)
separate regression, controlled methods, actual mounted consumers, isolated public
host and package evidence. C27's pending initial training Set restriction is
superseded only for these qualified targets. No full DD/A/M gate closes. Remaining
conditions/rules/filter/final/Item phases, broader expressions and M3+ are open.
E01/wider Q00/E05/installed/native/operator acceptance and ADR-0001 remain open;
experimental0.4.1 and compatibility unchanged.


### C29 — Snapshot-invariant boolean filters (2026-10-21)

C28 is `ece9970`. This bounded M2/Q02a slice advances DD-02/05/06/27/34 and
A02/A04/A21 partially. It qualifies empty/default and boolean-only effect/change
FiltersField trees through the shared plan.40 independent native guard observations
make zero property reads; separate exact method probes establish cached first-effect
versus fresh phase-change evaluation. Only snapshot-invariant trees bypass the
unqualified replacement-data dependency. Data-dependent, malformed/unknown branches
remain unavailable even where a boolean short-circuit could hide them.

54 maintained source contracts include34 supported workflows,32 failing before and
2 existing defaults, plus20 retained boundaries. False effects contribute neither
changes nor statuses; false changes skip only themselves. Existing type/duration/
flag/Item eligibility and malformed-source gates remain. Definitions/default origins/
results are recorded in the shared plan; equivalent-outcome edits retire old intents.
No source write, private transport, cache, new dice evaluator or Core requirement.

[C29 ledger](../plans/0001-verification.md#c29--snapshot-invariant-filters-2026-10-21)
and [portable record](../audits/evidence/2026-10-21-c29-constant-filters.json)
distinguish regression, controlled methods, mounted consumers, isolated public host
and package evidence. No full DD/A/M gate closes. Next bounded Q02a work qualifies
actual initial replacement-data fields/collection timing before enabling dependent
comparisons; final/Item/condition/flag/broader-expression rules and M3+ remain open.
E01/wider Q00/E05/native/operator/full acceptance and ADR-0001 remain open;
experimental0.4.1 and compatibility unchanged.


### C30 — Preserve source-envelope gates before suppression (2026-10-21)

C29 is `24c6bad`. Before extending dependent filters, four maintained same-input
regressions find that a false whole-effect guard skips malformed priority/entry or
unqualified phase/type checks and permits+5. The shared plan now normalizes these
fields before guard evaluation, preserving the established unavailable boundaries.
Unknown targets behind valid false guards remain inactive; empty-key no-ops, phase/
priority/source ordering and source data remain unchanged. This advances M2/Q02a,
DD-02/05/27/34 and A02/A04/A21 partially, without adding broader rules support.

[C30 ledger](../plans/0001-verification.md#c30--effect-envelope-gates-2026-10-21)
and [portable record](../audits/evidence/2026-10-21-c30-effect-envelopes.json)
record all four failures-before/passes-after, retained positive filter/roll profiles,
actual mounted consumers, controlled guard/source evidence and isolated checks.
No new Core requirement or full gate closes. Next is still qualified initial
replacement-data fields and collection timing before dependent filters; final/Item/
conditions/flags, broader expressions and M3+ remain open. E01/wider Q00/E05/native/
operator/full acceptance and ADR-0001 stay open; experimental0.4.1 unchanged.


### C31 — Initial scalar filter fields and schema save default (2026-10-21)

C30 is `52fa7b9`. This advances M2/Q02a, DD-02/05/27/34 and A02/A04/A21
partially. One grammar now supports bounded Actor-owned initial exact/numeric
predicates over explicit ability scores, initialized save coefficients and global
nonpersisted proficiency under explicit parents. Source/schema/default/prepared
values and predicate/read provenance remain separate. No arbitrary property lookup,
formula engine, private Core import, caller cache or source write is introduced.

50 declared contracts include30 failures-before/passes-after and20 retained
boundaries. Exact pinned schema/base/embedded/getRollData/effect/collection/field
methods produce30 independent captures: all predicates are checked before any
initial field mutation, not progressively against earlier effects. Effect first-
evaluation cache and change phase snapshots stay distinct. Final-only/no-initial,
Item replacement, status/flags, derived mods/classes, missing optional parents and
malformed/coerced leaves remain unavailable; every branch must qualify.

The verified missing persisted save coefficient0 now initializes once in the shared
numeric path and the same helper feeds predicate reads. Applied effects can then
alter prepared values; stale mod/global99 never supplies overrides. Source remains
unchanged and default origins enter effect provenance/intents. C29's known initial
field and known-branch OR examples are superseded by this qualified profile, while
the constant-only helper and unknown-branch restrictions remain strict.

[C31 ledger](../plans/0001-verification.md#c31--initial-scalar-filters-2026-10-21)
and [portable evidence](../audits/evidence/2026-10-21-c31-initial-filters.json)
separate maintained regression, controlled-source phase projection, actual mounted
consumers, public-host primitives and package checks. Native DataModel/engine/
operator parity is not claimed, and the preparation-runtime experiment remains
parked. No full DD/A/M gate closes. Continue dependency-ready Q02a rule/filter/
condition/final/Item preparation and bounded M3/Q02 receipt qualification. E01/
wider Q00/E05/full acceptance and ADR-0001 remain open; experimental0.4.1 and
compatibility unchanged.


### C32 — Public command receipts, admission and residual races (2026-10-21)

C31 is `834b7ca`. Q02/M3 now has20 maintained observations through released
Core0.19.3 caller-bound public SDK, isolated configuration and synthetic transport.
Owner denial/loss and caller-subject spoof reject before dispatch. Exact Actor,
embedded Item/effect and nested-effect receipts preserve actual acknowledged IDs;
deletes return void. Submitted IDs can differ under the controlled backend policy,
so native ID preservation still needs independent qualification. Sequential commit
can apply the first step and reject the next without returning previous receipts.

Identical empty acknowledgements and unchanged Core primary reads represent both
no-write and applied-without-event outcomes. Applied/lost response times out after
one dispatch without SDK replay. A concurrent external HP edit15→20 between read
and absolute damage5 patch is overwritten to10; full acknowledgement and readback
still make naive confirmation pass, although a fresh calculation would produce15.
The public patch options have no native compare precondition. This is executable
evidence of a bounded A17/E02 contract/decision gap, not a claim that Core promised
transactions or that native atomic compare is impossible. Qualify backend support
or explicitly decide conflict policy before exposing affected resource commands.

Real isolated DataStore file failure after an Item acknowledgement preserves its
exact ID in the response, fences continuation and survives restart as executing.
Exact operation/step tags identify a candidate among duplicate names/source UUIDs,
but tags alone are not trusted history or proof of native persistence. Namespace
failure can resolve set(void) without saving: persist-and-readback admission catches
it with zero document writes. Successful journal data survives actual host restart.

[C32 ledger](../plans/0001-verification.md#c32--public-command-contracts-2026-10-21)
and [portable observations](../audits/evidence/2026-10-21-c32-command-contracts.json)
record commands, hashes and limits. No production command route, new Core import,
version change or native/operator acceptance. Continue module journal/serialization/
intent foundation independently while E02 native/concurrency gates remain open.
E01, wider Q00/E05, full M2/M3+ and ADR-0001 remain open.


### C33 — Durable command admission and inspectable outcomes (2026-10-21)

C32 is `d00a6ff`. M3/DD-20/24/25/35,A17/A18 now have a shared server-only
journal foundation. Trusted request/world identities scope module/instance/world/
caller/Actor/operation keys. Strict server-plan digests bind intent, fingerprints
and ordered steps; the journal stores no Actor cache or client-supplied source patch.
Actor queues serialize module commands across callers while other Actors proceed.
Current ownership is required before inspection and each dispatch; context is
checked after asynchronous domain/source/owner revalidation. Persist-and-readback
must succeed before dispatch. Same-ID changed intent rejects; duplicates return
the current outcome without replay. No gameplay review/execute route is exposed.

Exact acknowledgement identities are retained before ancillary validation and
journal bookkeeping. Unknown first outcomes fence uncertain; prior confirmed steps
produce partial. Confirmation and persistence failure stop continuation. Persisted
executing state fences after restart without guessing IDs. A process-session marker
retires old reviewed intent, including when zero-write retirement could not be
saved; fresh operation/review is required. This is separate from future draft resume.
Owner-loss attempts retire review without returning private journal contents.
Corrupt records never become empty drafts. There is no automatic resume/reconcile,
rollback, global maintenance or claim of native/cross-process locking.

The public `GET commands/status` route uses this same coordinator and current owner/
caller scope. Domain drivers must still recompute native rules, exact choices and
source/dependency fingerprints and provide a qualified confirmation policy. Core
primary equality cannot solve C32's external-edit race; affected source-derived
writes remain gated by E02's native precondition/conflict-policy decision.

[C33 ledger](../plans/0001-verification.md#c33--command-journal-foundation-2026-10-21)
and [portable evidence](../audits/evidence/2026-10-21-c33-command-journal.json)
record28 maintained state/storage/identity/queue cases and29 isolated public-host
observations (20 retainedC32,9 actual-module additions), real storage faults/restarts,
source/typing/package identities and development failure corrections. No production
creation/inventory/health/activity workflow or installed/native/operator acceptance.
Next continue independent Q02a initial collection-filter/condition/final/Item rules,
and domain-specific command qualification as dependencies permit. E01/E02/wider
Q00/E05, full M2/M3+ acceptance and ADR-0001 remain open.


### C34 — Initial collection predicates and source provenance (2026-10-21)

C33 is `b2aed3c`. M2/Q02a,DD-02/05/27/34,A02/A04/A21 advance partially:
the same bounded filter grammar now reads thirteen schema-initialized String/Set
fields under explicit trait parents (defenses/bypasses,training/languages/mastery).
Primitive has/hasany/hasall/subsetof/empty semantics are independently qualified.
Omitted/null values initialize empty Sets; StringField trimming and Set deduplication
precede membership. Read provenance preserves raw source separately from initialized
members, so equal-result source edits still retire intent. Unknown literals compare
exactly without granting training or resolving content. Source remains unchanged.

83 maintained contracts include58 baseline failures/passes-after and25 retained
boundaries. The pinned oracle supplies88 scalar/collection phase captures,58 new:
all predicates read before earlier priority changes, and before later ALL/immunity
normalization. The parser validates every boolean branch and supports mixed scalar/
collection trees without a new expression or dice evaluator. Nested predicates,
string-iterable coercion,Set equality,missing/malformed parents,oversized/malformed
members,unknown paths,source Item/final/status/flag snapshots remain unavailable.

[C34 ledger](../plans/0001-verification.md#c34--initial-collection-filters-2026-10-21)
and [portable evidence](../audits/evidence/2026-10-21-c34-initial-collection-filters.json)
separate declared expectations,unchanged C33 baseline,controlled primitive/schema/
method evidence,mounted consumers and isolated public execution. No full DataModel/
native engine/operator acceptance. Continue source/schema-backed initial predicates,
conditions/final/Item phases and wider Q00 formulas in dependency order; domain command
work retains C33 admission/receipt protocol and E02 concurrency gates. E01/E02/wider
Q00/E05,full M2/M3+ acceptance and ADR-0001 remain open;experimental0.4.1 unchanged.


### C35 — Shared base class facts and initial predicates (2026-10-21)

C34 is `98f177a`. M2/Q02a,DD-01/02/27/34,A02/A03/A04/A21 advance partially.
One context-free class initializer now supplies the existing facts/projections and
initial details.level/attributes.prof reads. It uses explicit class levels0–20 and
total<=20; it never trusts old level/prof fields,names or prepared metadata. Context,
effects,equipment,flags and caller projection remain separate gates. Typed class
source identities enter predicate provenance,retiring equal-result identity edits.

44 contracts cover30 same-input failures/passes-after,13 retained unavailable Actor
workflows and one missing-items helper-only input outside the public Actor contract.
Pinned ClassData/DetailsField initialization and actual Character base preparation/
Proficiency.calculateMod compare30 class cases. Native level0 yields proficiency1;
no plausible2 is substituted. Multiclass and every proficiency threshold agree.
The former class-level-not-qualified initial-scalar case is now explicitly qualified;
the classes namespace and Proficiency object remain unavailable. Missing class levels
still gate rather than silently taking native schema default1 in this bounded profile.

[C35 ledger](../plans/0001-verification.md#c35--initial-class-facts-2026-10-21)
and [portable record](../audits/evidence/2026-10-21-c35-initial-class-filters.json)
separate119 controlled phase captures,maintained regression,mounted consumers and
isolated public rolls/package checks. No native DataModel/operator acceptance or
full gate closure. Next qualify the condition-data/status lifecycle and its mode/
passive interactions before enabling active condition behavior; broader expressions,
remaining initial/final/Item rules and domain commands remain dependency ordered.
E01/E02/wider Q00/E05,full M2/M3+ acceptance and ADR-0001 stay open;experimental0.4.1
and compatibility unchanged.


### C36 — Condition source and status-phase qualification (2026-10-21)

C35 is `e7d12a4`. M0/M2 Q02a,DD-05/27/34,A02/A04 advance in qualification
only. A maintained pinned-method harness separates primitive ConditionData/source
initialization,Actor initial status collection,CI suppression/normalization and
numeric ability/skill/tool mode/passive preparation. Three primitive captures and
93 phase/mode cases pass,plus372 actual native default skill/tool/combined builds.
No production condition gate is removed by this checkpoint.

Poisoned's check disadvantage is added as native mode counts,not a flat passive
bonus or a lost normalized flag. Source advantage cancels; combined trained skill/
tool automatic advantage cancels the condition's disadvantage. Saves stay unchanged.
Missing statuses do not acquire a status from a type/name. Source level99 on this
nonleveled condition becomes prepared null. Explicit disabled/guard/CI cases and
81 source-mode vectors retain independent expectations and exact source hashes.

Native status aggregation precedes sorted initial CI writes. Adding immunity later
removes the collected status; removing initial immunity does not retroactively add
a status omitted during collection. Document.active after mutation can therefore
differ from effective Actor status. The CI change executor in the probe is synthetic;
actual native aggregation/suppression/normalization/query methods establish timing,
not complete field/write/runtime acceptance.

[C36 ledger](../plans/0001-verification.md#c36--condition-phase-foundation-2026-10-21)
and [portable captures](../audits/evidence/2026-10-21-c36-condition-foundation.json)
state schema/model/guard/clock/custom-rule/roll-builder stubs and remaining gates.
Next qualify manual choices,alternate abilities,initiative and complete source
boundaries before integrating this bounded condition profile into shared preparation
and consumers. No native/operator acceptance,Core extension or complete rules claim.
E01/E02/wider Q00/E05,full M2/M3+ acceptance and ADR-0001 stay open.


### C37 — Shared bounded poisoned condition preparation (2026-10-21)

C36 is `92b58ff`. Partial M2/Q02a,DD-02/05/27/34,A02/A04/A21: Actor-owned
nonleveled poisoned documents now feed shared status and numeric preparation. Raw
source, primitive defaults, initial status snapshot, final immunity filtering and
ability-phase mode counts remain distinct. Missing statuses do not acquire a status
from the condition type/name. Initial immunity removal cannot retroactively collect
a status. Source IDs/default provenance retire same-result roll intent.

Pinned qualification adds324 alternate-ability,50 fractional/expertise combined,
14 mode-effect,9 manual-dialog and4 initiative configurations to C36's3 primitive,
93 phase/mode and372 default-build captures. Both positive proficiencies,including
.5, grant combined advantage. Poisoned affects checks before passives; saves stay
unchanged. Initiative roll mode includes ability-check disadvantage while the score
uses its own mode; fixed-score and tie configurations remain separate.

125 declared workflows fail C36's condition/projection contract and pass after;14
unqualified workflows retain execution gates. Desktop condition readouts and the
live mobile Conditions dialog share the projection. Sheets,previews,shortcuts and
direct execution consume existing shared modes,including explicit Normal bounds.
The generic mounted loop's prior Normal-only expectation was extended with explicit
independent per-check modes; existing cases retain their original expectations.

This qualifies only constant-guard,untimed Actor poisoned documents with empty own
changes/riders and known source fields. Other conditions,leveled exhaustion,dependent
guards,flags,Item status behavior,travel pace,final phases and broader expressions
remain unavailable. Condition editing is separate command work. [C37 evidence](../audits/evidence/2026-10-21-c37-poisoned-condition.json)
and [ledger](../plans/0001-verification.md#c37--bounded-poisoned-condition-2026-10-21)
separate maintained regression,controlled native methods,mounted UI,isolated public
host and package checks. No installed/native/operator acceptance or complete DD/A/M
gate closes. E01/E02/wider Q00/E05/full ADR remain open;experimental0.4.1 unchanged.


### C38 — Modern exhaustion phase qualification (2026-10-21)

C37 is `11ba39c`. M0/M2 Q02a,DD-02/05/27/34,A02/A04 qualification only.
The maintained condition harness adds32 exhaustion profiles/192 builds,81 source-mode
vectors/324 builds,576 movement,288 initiative and4 nonpersisted-map initialization
captures against exact87e94db/static14.367. C37's Poisoned comparisons remain intact.

CommonTemplate.conditions is persisted:false. Actual DataModel._initialize chooses
its initial empty MappingField value over raw99 fields. ConditionData prepares levels
1–6 (missing/null→1,high→6),adds dead at6 and writes the condition map before initial
guard evaluation. A false guard can leave a map entry without an effective status
or roll reduction. Last active duplicate wins the map; levels neither add nor take
a maximum. Effective exhaustion status and prepared level are both required for the
modern -2/level roll reduction and5ft/level speed reduction. CI timing retains the
precollection boundary. Mixed Poisoned,source/manual/selected scopes and initiative
remain distinct. Fixed initiative stores its score in options.fixed,not data.mod.

Movement comparisons use initialized numeric intermediates (ft/m,bonus,multiplier),
not a new source/effect/expression qualification. The native modern noMovement set
does not include dead; do not infer an extra rule. Model constructors/initialization
order/getDefiningClass,guard/clock/custom-rule/CI executor and roll-build stubs remain
explicit. This checkpoint removes no runtime gate and makes no native/operator
acceptance claim. [C38 record](../audits/evidence/2026-10-21-c38-exhaustion-foundation.json)
and [ledger](../plans/0001-verification.md#c38--modern-exhaustion-qualification-2026-10-21)
preserve inputs,observations,hashes and limits. Next implement the bounded Actor
exhaustion path through shared preparation/readouts/compiler with unchanged-source
regressions,mounted consumers and real public-host execution. Other conditions,
flags/time/dependent guards,Item/final phases and broader formulas stay open.
E01/E02/wider Q00/E05/full ADR remain open;experimental0.4.1 unchanged.


### C39 — Shared bounded modern exhaustion (2026-10-21)

C38 is `f9da324`. Partial M2/Q02a,DD-02/05/27/34,A02/A04/A21. The shared
condition path now initializes an empty nonpersisted level map,prepares qualified
Actor exhaustion levels1–6,adds the configured dead status at6,and retains separate
map/status/CI phases. Missing/null level initializes1; positive safe integers above6
clamp6. Other coercions remain explicitly unavailable. Last active source assignment
wins; a false initial guard can leave a map without effective status/reduction.

One prepared reduction feeds abilities,saves,skills/tools/passives,selected checks,
alternate abilities,initiative and movement. Raw source maps/proficiencies/virtual
fields remain non-authoritative and unchanged. Source immunity/default provenance
retires same-result intent. Desktop/mobile condition readouts share levels/statuses;
editing remains separate command work. Native armor+exhaustion movement composition
extends the controlled matrix from576 to1152,with explicit model/configuration stubs;
678 actual native ability-check/save builds add configuration evidence.

113 condition/projection contracts fail C38 and pass after,including81 source-mode
vectors. Some inactive numeric checks already worked but lacked the prepared map
contract. Independently expected negative totals,fixed initiative0,Normal-only bounds,
384 source movement/unit/bonus/armor cases,poisoned prepared fields and unavailable/
recovery behavior are maintained. [C39 evidence](../audits/evidence/2026-10-21-c39-exhaustion.json)
and [ledger](../plans/0001-verification.md#c39--bounded-modern-exhaustion-2026-10-21)
distinguish regression,controlled native methods,mounted UI,isolated host and package
checks. This remains the constant-guard,untimed Actor source profile with empty own
changes/riders. It is not complete conditions,activities,legacy/effects/flags/time/
Item/final-phase/expression support or installed/native/operator acceptance. E01/E02/
widerQ00/E05 and full DD/A/M/ADR gates stay open;experimental0.4.1 unchanged.


### C40 — Additional condition mode/movement qualification (2026-10-21)

C39 is `2063461`. M0/M2 Q02a,DD-02/05/27/34,A02/A04 qualification only.
A frozen independent fixture covers84 explicit status/phase profiles,972 source-mode
cases and8 override/suppression cases against pinned native methods. Each case checks
a Dexterity-save and initiative configuration (2128 configurations total),numeric
totals,score,status collection and movement. Earlier condition comparisons remain
intact. No additional runtime type is admitted by this checkpoint.

The explicit source profiles include restrained,grappled,paralyzed,incapacitated,
invisible,surprised,prone,dodging and selected combinations; these are serialized
status sets,not fromStatusEffect preset construction. Missing statuses stay absent.
Dodging's save advantage is suppressed by incapacity or no-movement status. Initiative
conditions change the local initiative field BEFORE score calculation; global check
mode affects the roll separately. Canceled numeric field modes retain their opposing
counts when another scope is combined. Overrides/suppression remain distinct from
source flags. CI add/remove retains precollection semantics,including secondary
statuses from a document whose final active state changes.

SimpleTraitField CI stores strings without fixed choices; exact membership does not
resolve content or guarantee a display label. Source/default/initialized/prepared
and caller phases remain separate. The model,constant guard,clock,custom-rule absence,
CI executor and roll-build callbacks remain controlled stubs; source mode operands
are independently initialized inputs. [C40 record](../audits/evidence/2026-10-21-c40-condition-modes.json)
and [ledger](../plans/0001-verification.md#c40--condition-mode-and-movement-qualification-2026-10-21)
retain expectations,source identities and limits. Next integrate only the qualified
mode/movement source profile through shared preparation and consumers,with before/
after,UI and public-host execution. Other condition/combat behavior,petrification,
riders,dependent guards,flags/time,Item/final phases and expressions stay open.
E01/E02/widerQ00/E05/fullADR remain open;experimental0.4.1 unchanged.


### C41 — Shared condition save,initiative and movement profile (2026-10-21)

C40 is `1eb4b6a`. Partial M2/Q02a,DD-02/05/27/34,A02/A04/A21. The shared
source profile now admits restrained,grappled,paralyzed,incapacitated,invisible,
surprised,prone and dodging,alongside Poisoned/exhaustion. Source status sets remain
explicit; type/name never grants a missing status. Only the qualified family IDs
may compose inside these documents. Other types/riders/own changes/flags/time/
dependent guards remain unavailable. No preset construction or complete combat/
condition behavior is claimed.

Condition preparation supplies effective statuses,ability-phase modifiers,initiative-
phase modifiers and no-movement/crawl facts once. Ability modifiers apply before
passives. Initiative modifiers apply to a copied local mode state during initiative
preparation; local state supplies score while global/ability scopes supply execution.
Opposing counts,ordered overrides and suppression survive. The initiative-disadvantage
query adds once even if multiple contributing statuses exist. Movement restrictions
apply before reductions/bonus and preserve native jump overwrite order. Every sheet,
preview,shortcut and adapter request uses the shared result/compiler.

Stored dodging/dead immunity IDs have exact membership semantics proven by native
SimpleTraitField and phase probes. Their module presentation labels do not assert
preset/content identities or add them to conditionTypes. Other unknown identities
retain availability boundaries. Canonical source fields/ownership remain unchanged.
1064 maintained condition/projection contracts fail C40 and pass after (inactive
numeric checks may already work). Context/source/malformed boundaries,raw prepared
poison,manual/selected/alternate checks and Normal-only ranges are retained.
[C41 record](../audits/evidence/2026-10-21-c41-condition-modes.json) and [ledger](../plans/0001-verification.md#c41--shared-condition-mode-and-movement-profile-2026-10-21)
separate regression,controlled methods,mounted consumers,public host and packaging.
Petrification/unconscious/stunned/other conditions,activities,riders,effects/flags/
time/Item/final phases/expressions and full lifecycle acceptance stay open. E01/E02/
widerQ00/E05/native/operator/fullADR gates remain open;experimental0.4.1 unchanged.


### C42 — Petrification trait/status phase qualification (2026-10-21)

C41 is `b70bfe9`. M0/M2 Q02a,DD-02/05/27/34,A02/A04 qualification only.
Eighteen frozen source/initialized-model profiles compare actual native status/CI,
defense normalization,check/passive,initiative and movement behavior. They include
explicit incapacity status,Poisoned as a separate document,initial immunity,CI add/
remove,false guards,disabled documents and all-damage immunity. Earlier comparisons
remain intact. Petrified remains unavailable in production at this checkpoint.

Traits.prepareResistImmune first removes statuses from current CI,then applies
petrification's ALL resistance/bypass clearing,poison damage immunity and poisoned/
diseased condition immunity,then normalizes damage traits. Actor.statuses may retain
Poisoned collected before the later immunity grant while hasConditionEffect suppresses
its check disadvantage. Source all-damage immunity clears the new ALL resistance.
A final Document.active query cannot replace either status snapshot. No source
status is inferred from type/name; explicit incapacity is separate from Petrified.

[Record](../audits/evidence/2026-10-21-c42-petrification-foundation.json) and [ledger](../plans/0001-verification.md#c42--petrification-phase-qualification-2026-10-21)
retain independent expected fields,method/source identities and model/guard/clock/
custom-rule/CI executor/roll-build stubs. This is initialized phase evidence,not
complete source boot,condition/combat behavior or native/operator acceptance. Next
integrate only the qualified trait/status phases through shared preparation with
source-preserving regressions,consumers and public-host execution. Other condition/
rider/flag/time/Item/final/expression and full lifecycle gates remain open. E01/E02/
widerQ00/E05/fullADR remain open;experimental0.4.1 unchanged.


### C43 — Shared bounded petrification preparation (2026-10-21)

C42 is `7d85969`. Partial M2/Q02a,DD-02/05/27/34,A02/A04/A21. Petrified
now joins the qualified untimed Actor condition profile,with only explicit Petrified/
incapacitated source statuses and constant guards/empty own changes/riders. Other
family documents still cannot introduce an unqualified Petrified status. Source type
never grants incapacity or any missing status.

The shared condition path retains collected Actor statuses after current CI deletion,
applies qualified petrification grants to the detached rules system,and derives
rule-effective statuses using the later immunity state. Native ALL resistance/bypass
clearing,poison damage immunity and poisoned/diseased condition immunity are shared
with existing defense preparation. Damage normalization has one owner in the existing
defense preparer; it is not recalculated by UI. Poisoned may remain in the Actor
snapshot while its rule effect is suppressed. Source DI.ALL still clears resistance.
No source data is mutated and no write command is added.

18 maintained source/projection contracts fail C42 and pass after. Context/source
recovery,prepared poison,malformed trait/guard/time/flag gates,manual/selected checks
and Normal-only bounds are retained. [C43 record](../audits/evidence/2026-10-21-c43-petrification.json)
and [ledger](../plans/0001-verification.md#c43--shared-petrification-preparation-2026-10-21)
separate controlled methods,maintained regression,mounted consumers,public host and
package evidence. This is not complete petrification/combat/preset/rider behavior.
Other conditions,flags/time/dependent rules,Item/final/expressions and full lifecycle
gates remain open. E01/E02/widerQ00/E05/nativeoperator/fullADR acceptance stay open;
experimental0.4.1/compatibility unchanged.

### C44 — Explicit incapacity-condition phase qualification (2026-10-21)

C43 runtime checkpoint is `d0e1000`. This M0/M2 Q02a,DD-02/05/27/34,A02/A04
qualification adds34 frozen Stunned/Unconscious source-state profiles and648 mode
vectors against exact release6.0.6. Empty/missing/null status Sets,trim/dedup,disabled/
false guards,primary/secondary immunity,initial CI add/remove,explicit Prone/Dodging/
Invisible/Surprised statuses remain separate from preset construction. Expectations
are independent literal conditionEffects/CI-phase predicates,not observed/module totals.

Unconscious blocks movement even without explicit incapacity; Stunned alone does not.
Initiative disadvantage follows explicit incapacity/surprise,not type/name. Dodging
save advantage stops under incapacity or no movement. Local initiative modes determine
score; global check mode joins only execution. Explicit Prone affects nonwalking
movement; the Unconscious preset's rider is not generated by source preparation.
Runtime admission remains gated at C44. [Evidence](../audits/evidence/2026-10-21-c44-incapacity-foundation.json)
and ledger preserve schema/method stubs and source identities. No automatic downed/
combat/attack/save-failure/preset/rider or native/operator acceptance. Next integrate
only these qualified source states,then continue existing M2 phases. E01/E02/wider
Q00/E05/fullDD/A/M/ADR remain open;experimental0.4.1/compatibility unchanged.

### C45 — Shared explicit incapacity-condition preparation (2026-10-21)

C44 is `c0ec52f`. Partial M2/Q02a,DD-02/05/27/34,A02/A04/A21. Stunned and
Unconscious now join the bounded untimed Actor condition profile with explicit own/
previously qualified family statuses,constant guards and empty own changes/riders.
Unconscious noMovement,Dodging interaction and explicit incapacity/surprise initiative
modes use the same shared path as all check/preview/execution consumers. No missing
status or preset rider is inferred. Unsupported cross-type status envelopes,riders,
changes,dependent guards,time/flags and prior expression/range boundaries stay gated.

680 maintained cases fail unchanged C44 and pass after;two new disabled cases already
pass. The existing1064 condition cases remain covered. Both widths use the existing
status/movement/save/init/selected-check controls,including source/immunity/context
recovery and retained callbacks. [Record](../audits/evidence/2026-10-21-c45-incapacity.json)
and ledger distinguish regression,controlled methods,mounted UI and public-host results.
No full condition/combat/preset/automatic-downing/native/operator gate closes.

**DD-R07 discovered while composing the next phase:** C42's petrification harness
called Traits.prepareResistImmune before abilities/skills/tools,but the exact Character
prepareDerivedData method calls it afterward. C43 inherited this incorrect composition:
a newly granted poison immunity can suppress Poisoned too early. This supersedes C42/
C43's arithmetic parity claim for mixed Petrified+Poisoned profiles;their trait/status
observations and recorded host results remain historical evidence. C45's new profiles
contain no Petrified grants and their qualifications are unaffected. Correct the phase
oracle and shared preparation immediately next,with failing-before/passing-after cases.
E01/E02/widerQ00/E05/fullDD/A/M/ADR remain open;experimental0.4.1/compatibility unchanged.


### C46 — Correct Character phase composition (DD-R07,2026-10-21)

C45 is `2bb9b78`. DD-R07 corrected,partial M2/Q02a,DD-02/05/27/34,A02/A04/A21.
The oracle executes actual pinned CharacterData.prepareDerivedData against trace-only
collaborators to prove phase order separately from arithmetic. Numeric composition now
prepares abilities/skills/tools before Traits.prepareResistImmune. Two independently
expected mixed Petrified+Poisoned arithmetic cases fail unchanged C45/pass after;
18 new phase-provenance contracts also fail before/pass after. Seven initial-mode
profiles preserve override/suppression/subtraction/automatic-advantage behavior.

Shared condition preparation records the pre-trait current-CI query snapshot separately
from Actor status deletion and final effective readout. Prepared Poisoned disadvantage/
passive10 survives a later poison-immunity grant,while final status queries/readouts
suppress Poisoned. Source,IDs,ownership and metadata stay unchanged. Existing defense
normalization remains the sole owner; no dice/effect evaluator or write path is added.

[C46 evidence](../audits/evidence/2026-10-21-c46-character-phase-order.json) and ledger
supersede C42/C43's mixed-condition arithmetic parity claim without deleting historical
captures. Their host serialization/regression/trait observations remain historical,
not evidence of correct composition. Corrected mounted/public comparisons are separate
from source methods and still do not establish installed/native/operator acceptance.
DD-R01–06 and C45 boundaries remain. Other condition/preset/rider/combat,flags/time/
dependent rules,Item/final/expression and full lifecycle gates remain open. E01/E02/
widerQ00/E05/fullDD/A/M/ADR stay open;experimental0.4.1/compatibility unchanged.

### C47 — Final roll-mode phase qualification (2026-10-21)

C46 correction is `93629e5`. M0/M2 Q02a,DD-02/03/27/34,A02/A04 qualification
only.1188 frozen independent cases cover11 mode paths,three source modes,12 qualified
operation/delta pairs and three explicit condition contexts. Actual native field/count,
selected skill/tool,ability/save and initiative methods compare9504 check configurations
plus1188 initiative configurations and pre-final passive/score snapshots. No module
output generates the independent fixture. Runtime final effects stay unavailable.

The actual static Foundry ClientDocument/Actor prepareData methods execute with trace-only
collaborators to establish initial→model/Actor derived→final order. The retained actual
Character trace establishes internal ordering. Field arithmetic is tested separately;
no full model/Document boot,Item final preparation or effect filter/transport claim.
Final mode changes alter execution while passives/fixed initiative scores remain the
values prepared earlier. Applying final changes as initial effects would be incorrect.

[Record](../audits/evidence/2026-10-21-c47-final-modes-foundation.json) and ledger retain
source/fixture/harness/artifact identities and limits. Next implement only qualified
constant-guard Actor final mode fields with separate prepared/execution states,then
verify actual consumers/public rolls. All other final fields,Item phases,dependent
filters,flags/time/formulas and full lifecycle gates remain open. E01/E02/widerQ00/E05/
fullDD/A/M/ADR stay open;experimental0.4.1/compatibility unchanged.


### C48 — Shared bounded final mode execution (2026-10-21)

C47 is `1db9f32`. Partial M2/Q02a,DD-02/03/27/34,A02/A04/A18/A21.1188
maintained independent source cases fail unchanged C47/pass after. Qualified
Actor-owned constant-guard final roll-mode changes now use a separate shared execution
snapshot after initial/condition/armor/initiative counts. Passives and fixed initiative
scores retain their earlier preparation snapshot. Other final fields,Item-transferred
final modes,Item phases,dependent guards/flags/time/formulas remain unavailable.

The compiler shares final state across skill/tool/selected checks,abilities/saves and
initiative; UI consumes it without recalculation. Source,ownership,canonical IDs and
metadata stay unchanged. Explicit manual modes and existing Normal-only bounds remain.
Four separately qualified late-counter cases preserve armor Stealth's earlier passive
while final changes alter execution. The old final-open fixture now has independent
qualified expectations; its native comparison applies final changes after derivation.

[Record](../audits/evidence/2026-10-21-c48-final-modes.json) and ledger preserve failing
inputs,source/native phase boundaries,actual consumers,public-host and packaged evidence.
The retained malformed-initiative case caught an overly broad availability gate during
implementation; local availability is preserved. Item-origin provenance keeps unqualified
transferred final effects fenced. No dice evaluator/Core dependency/write path is added.
DD-R01–07 remain corrected;full final/effect/native/operator/DD/A/M/ADR gates stay open.
E01/E02/widerQ00/E05 remain open;experimental0.4.1/compatibility unchanged.

C48 implementation checkpoint: `c82480fb9437e05efc43e9d7b44c908482b01a58`.
[All C12–C48 commit/evidence identities](../audits/evidence/2026-10-21-c12-c48-checkpoints.json)
are recorded without changing acceptance status. Full M0/M1/M2/M3 and later lifecycle
milestones remain incomplete;E01/E02/E04/widerQ00/E05 and installed/native/operator gates
remain open. Continue the existing dependency-ordered M2 final numeric/proficiency/
bonus qualification;do not recalculate earlier prepared snapshots from final source.

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

[Portable evidence](../audits/evidence/2026-10-22-c49-final-proficiencies-foundation.json)
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

[Evidence](../audits/evidence/2026-10-22-c50-final-proficiencies.json) and the verification
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

[Portable record](../audits/evidence/2026-10-22-c51-final-bonuses-foundation.json) retains
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

[Portable record](../audits/evidence/2026-10-22-c52-final-bonuses.json) records commands,
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

[Record](../audits/evidence/2026-10-22-c53-final-numbers-foundation.json) contains independent
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

[Evidence](../audits/evidence/2026-10-22-c54-final-numbers.json) separates regression,
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
[C49–C54 checkpoint identities](../audits/evidence/2026-10-22-c49-c54-checkpoints.json)
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
[Evidence](../audits/evidence/2026-10-22-c55-source-flags-foundation.json) records commands, source/fixture hashes and stubs. C55 is qualification only;
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

[Evidence](../audits/evidence/2026-10-22-c56-source-flags.json) separates commands, artifacts and controlled-source/regression/mounted/
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

[Record](../audits/evidence/2026-10-22-c57-final-defense-sets-foundation.json) retains commands, exact source/static-field/fixture/capture hashes, prior
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

[Record](../audits/evidence/2026-10-22-c58-final-defense-sets.json) separates baseline failures, regression, controlled-native-method, mounted,
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
[Record](../audits/evidence/2026-10-22-c59-final-training-sets-foundation.json) retains source/static-field/fixture/capture identities and declared stubs.
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

[Record](../audits/evidence/2026-10-22-c60-final-training-sets.json) separates regression, controlled native methods/formatting, mounted consumers,
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
Direct trait capture and explicit201-file module typing PASS. [Record](../audits/evidence/2026-10-22-c61-final-ci-conditions-foundation.json) retains exact
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

[Record](../audits/evidence/2026-10-22-c62-final-ci-conditions.json) separates regression, C61 controlled source/field construction, mounted UI,
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
direct trait capture and explicit203-file module typing PASS. [Record](../audits/evidence/2026-10-22-c63-final-petrified-foundation.json) retains exact
sources,constructor/Color/presentation-shell stubs and capture identities. This is
initialized method/field construction,not full native dispatcher/source boot/preset/
operator acceptance. C62 runtime/UI/public/package evidence remains separate. Runtime
gate stays open pending C64 tests and projections. Other conditions, combinations,
fields/Item/filter/formula phases and E01/E02/E04/widerQ00/E05 remain open. Experimental
0.4.1 and compatibility unchanged;all full ADR/DD/A/M/native/operator gates stay open.


### C64 — shared petrification/final defense snapshots (2026-10-22)

C64 implements C63's bounded profile through the existing preparation/projection path,
partially advancing M2/Q02a, DD-03/11/27/34 and A03/A04/A18/A21. All 48 unchanged
petrified final-field inputs fail on C63's intentional gate and pass after admission.
Earlier normalized fields and petrification grants remain distinct from current final
Sets and the native sheet's independent All Damage display override. Cards, desktop/
mobile readouts and ordinary numeric execution share current prepared facts; source is
unchanged. Physical bypasses on ALL are described explicitly. Historical restrictions
in C57/C58/C63 are superseded only for this qualified profile.

The profile requires one matching explicit petrified status, no initial defense-field
changes, known primitive Sets and bounded final CI identities. Mixed/inferred statuses,
initial composition, Item origins, broader immunity/query behavior and damage amounts/
application remain gated. [C64 evidence](../audits/evidence/2026-10-22-c64-final-petrified.json)
records before/after, mounted recovery, public-host, typing and isolated package checks.
No full requirement, milestone or acceptance gate closes. Experimental0.4.1, compatibility,
E01/E02/E04/wider Q00/E05 and ADR-0001 remain unchanged/open. Continue the existing M2
final String/formula/Item/filter qualification order; native/operator acceptance is absent.


### C65 — final custom String qualification (2026-10-22)

210 independent cases qualify seven SimpleTraitField.custom targets through actual
release6.0.6/Foundry14.367 primitive methods and native sheet/language helpers. Source
strings and the verified missing blank default remain distinct from prepared fields.
Add concatenates the literal delta before cleaning; subtract removes the first exact
substring; override cleans its delta; upgrade/downgrade/multiply are no-ops. Language
labels retain their earlier cache while other trait custom labels read current fields.
A separate formatting shell qualifies current labels without replaying Actor phases.

[Record](../audits/evidence/2026-10-22-c65-final-custom-foundation.json) retains the frozen table, source/helper hashes and declared empty-Set/
constructor/presentation collaborators. All210 plus retained trait matrices PASS. This
is qualification only; runtime custom effects remain gated until C66 shared integration,
source invariance and consumer/recovery tests. Null/coercion, references, initial String
effects, conditions, Item phases and full native dispatcher/operator acceptance are
not qualified. Partial M0/M2 Q02a,DD-03/11/27/34,A03/A04 only; all full gates stay open.
Experimental0.4.1/compatibility/E01/E02/E04/widerQ00/E05 are unchanged.


### C66 — shared literal final custom traits (2026-10-22)

C66 integrates C65's 210 unchanged String cases; all210 fail on the earlier runtime
gate and pass after integration. Seven new independent canonical-prefix compositions
also pass actual native methods and module projections. This partially advances
M2/Q02a,DD-03/11/27/34,A03/A04/A18/A21; no full requirement or milestone closes.
One final String snapshot and shared defense/training formatter serve cards and both
layouts, retaining earlier language caches separately from current custom values.
Source remains unchanged; repeated changes use current fields in native priority order.

Condition-free Actor-owned literal final custom effects are admitted. Initial String
phases, null/coercions, reference expansion, condition combinations and Item origins
remain unavailable. This supersedes only the corresponding final-String restrictions
in earlier checkpoints. [C66 record](../audits/evidence/2026-10-22-c66-final-custom.json)
separates pinned construction, regression, mounted consumers, real public-host and
package evidence. DD-R01–07 and the bounded plain-d20 equivalence remain covered.

Continue existing M2/Q00 work with initial custom String phase/cache qualification,
then remaining formula/Item/filter dependencies. E01/E02/E04/widerQ00/E05 and full
DD/A/M/ADR/native/operator acceptance remain open. Experimental0.4.1/compatibility are
unchanged; no release readiness is claimed.


### C67 — initial custom String phase qualification (2026-10-22)

238 independent initialized-field chains qualify initial custom text before language
preparation and final text afterward. The 217 earlier final cases remain retained.
Actual primitive/trait/sheet methods and a separate current formatter agree; the
condition oracle independently preserves native document/Character phase order.
[Evidence](../audits/evidence/2026-10-22-c67-initial-custom-foundation.json) records source hashes, frozen expectations and constructor/scheduling
limits. Native comparisons and explicit206-file typing PASS; runtime stays gated until
C68 source/default/projection/recovery checks. This is partial M0/M2 Q02a,DD-03/11/27/34,
A03/A04, not DataModel/installed/native/operator acceptance. Condition/Item composition,
null/coercions/references and wider formulas remain open. Experimental0.4.1/compatibility,
E01/E02/E04/widerQ00/E05 and fullADR gates are unchanged.


### C68 — shared initial custom text and cache provenance (2026-10-22)

All238 unchanged C67 cases fail before and pass after initial String admission. Initial
text feeds prepared language labels; final text changes current fields while preserving
that cache. One existing interpreter and projection path serve cards, both layouts,
previews, shortcuts and execution. Source/default origin persists through initial/final
chains. Source remains unchanged. C28's original `custom-string-not-set` input is also
supported with explicit Cant label/receipt assertions; its historical capture is retained.

Partial M2/Q02a,DD-03/11/27/34,A03/A04/A18/A21 only. [C68 record](../audits/evidence/2026-10-22-c68-initial-custom.json)
separates before/after, pinned construction, mounted recovery, public-host and package
checks. Conditions, Item origins, null/coercions, reference expansion and broader
formula interpretation remain gated. DD-R01–07 remain covered. Experimental0.4.1 and
compatibility unchanged; E01/E02/E04/widerQ00/E05 and fullADR acceptance remain open.
Next qualify bounded poisoned/exhaustion custom-text composition through actual native
condition/cache/build methods before extending these gates; other M2 dependencies remain.


### C69 — single-condition custom String qualification (2026-10-22)

442 independent poisoned/exhaustion1–6 text-phase/source-mode cases pass actual
primitive, Actor condition/cache/build and language/sheet methods:2652 fresh checks
and442 initiative configurations, plus all retained native matrices. Initial/current
text and earlier labels remain distinct; text containing condition names grants no
immunity. Primary tool scope excludes selected-skill local modes. Explicit208-file
typing and a separate direct custom-trait capture PASS.

[Record](../audits/evidence/2026-10-22-c69-condition-custom-foundation.json) retains exact sources/fixtures and declared constructor, scheduling,
presentation-copy and dice-stub boundaries. Runtime stays gated until C70. No mixed/
immune/CI-changing conditions, Item origins, inferred statuses, broader expressions or
native/operator acceptance follows. Partial M0/M2 Q02a,DD-02/03/11/27/34,A02/A03/A04
only; experimental0.4.1/compatibility and E01/E02/E04/widerQ00/E05/fullADR remain open.


### C70 — shared single-condition custom text (2026-10-22)

442 unchanged source inputs fail before and pass after String-phase admission for one
eligible unimmune explicit poisoned or exhaustion1–6 source. Current text and earlier
language labels share existing projections; condition maps/statuses/reductions and
passives retain native timing. Ordinary/combined checks, ability/save and initiative
requests use the same compiler across both layouts, previews, shortcuts and execution.
The fresh initiative mode is independently checked against native ability-check/init/
global-check scope membership; its earlier fixed score remains distinct.

The C66 Poisoned String negative is superseded with its original input and explicit
+5/disadvantage/passive10/label assertions. Mixed/immune/inactive/CI-changing conditions,
petrification and other condition types, raw level defaults/out-of-profile levels,
inferred/raw Actor statuses and Item origins remain gated. [C70 record](../audits/evidence/2026-10-22-c70-condition-custom.json)
records before/after, source poison/preservation, context and held-intent recovery,
independent native comparisons and isolated consumer/execution checks. Partial M2/Q02a,
DD-02/03/11/27/34,A02/A03/A04/A18/A21 only; no full gate closes. Experimental0.4.1 and
compatibility unchanged. E01/E02/E04/widerQ00/E05 and ADR/native/operator acceptance
remain open. Continue dependency-ready M2 Item/filter/formula qualification next.


### C71 — transferred Item initial custom-field qualification (2026-10-22)

686 independent cases pass exact release6.0.6 / static Foundry14.367 initial
collection, suppression and dispatch methods with actual primitive String and native
language/sheet methods. The table retains217 frozen initial String cases, crosses65
previously qualified Item eligibility/default inputs with seven fields, and adds14
Actor/two-Item priority and stable-order chains. Effect and owned Item identities,
source/default operands and earlier language labels remain distinct.

[Evidence](../audits/evidence/2026-10-22-c71-item-initial-custom-foundation.json) records exact source/artifact hashes, maintained regressions,
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

[Evidence](../audits/evidence/2026-10-22-c72-item-initial-custom.json) separates regressions, pinned initialized native methods,
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

[Record](../audits/evidence/2026-10-22-c73-feat-final-foundation.json) includes source hashes and213-file explicit typing. Initialized
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

[Evidence](../audits/evidence/2026-10-22-c74-feat-final-custom.json) records52 module/9 tooling suites and61 assertions,215 explicit
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


[C71–C74 checkpoint index](../audits/evidence/2026-10-22-c71-c74-checkpoints.json) records full commit/evidence identities,
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

[Evidence](../audits/evidence/2026-10-22-c75-item-read-surfaces.json) records53 module/9 tooling suites,61 assertions,220 explicitly
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

[Evidence](../audits/evidence/2026-10-22-c76-source-initialization.json) records the same-input 0/0 →6/18 regression,4 pinned schema/default
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

[Evidence](../audits/evidence/2026-10-22-c77-deterministic-formulas.json) records26 independent frozen native math/reference cases,
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

[Evidence](../audits/evidence/2026-10-22-c78-class-scales.json) records21 native scale levels/126 restrictions,subclass3 versus
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

[Evidence](../audits/evidence/2026-10-22-c79-formula-roll-context.json) records8 native profiles/8 selected tools/1 ability build,
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


### C84 — Item proficiency, final resources and fresh attack references (2026-10-22)

One shared owned-Item preparation now separates Actor base proficiency, cached Item
proficiency, parent counters, activity counters and current attack references. Exact
persisted weapon/equipment/tool selectors and qualified traits/Boolean Tavern Brawler
supply coefficients; feat/spell use native fixed proficiency. Prepared-looking source
fields remain ignored and unchanged. Both details layouts display the same facts.

Pinned construction exposed a C77 attack-reference defect: attacks always supply the
Item proficiency term, including zero. A zero-proficiency weapon with one `@prof`
bonus displayed +5 before and +2 after, matching native; four scopes previously +14
now +2. This supersedes C77's Actor-base attack substitution, without changing C79's
untrained-skill distinction. Earlier parent/activity capacities14/15 and modifier2
can coexist with current DEX20; the qualified fresh attack is +36.

[C84 evidence](../audits/evidence/2026-10-22-c84-item-final.json) records52 independent
initialized native proficiency/resource profiles,11 attack constructor comparisons,
source/poison/context regressions and both-layout mounted consumers. Declared Uses-only
activity collaborators are not complete Item lifecycle/native acceptance. Effects on
Items, wider final hooks, casting and action writes remain separate;M2/ADR stay open.


### C85 — conditional applied rules across shared d20 preparation (2026-10-22)

Source `dnd5e.bonus/advantage/minimum/maximum` changes register in their native
initial/final phases. One shared interpreter collects d20 rules before category
rules,then evaluates admitted effect/change guards. Skill/tool/ability/save/
initiative and attack read models use the same phase-aware bonus configuration;
passives keep earlier rule additions and advantage. Fresh skill/tool configuration
uses current identities,selected ability and combined proficiency. Manual modes
retain the qualified plain-d20 compiler and existing bound/dice restrictions.

A distinct constructor boundary matters: bonus expressions bind the current check's
prof,while rule bounds resolve before that rebinding. Expertise with `@prof + 7`
minimum remains10,not13. Actor attack preparation sets roll.proficient=true,while
Item attack roll data does not invent that property. Known roll identity/Boolean
and numeric property filters are bounded;root Proficiency-object comparisons,Item
source remapping,scene/caller/status/unknown predicates and broader expressions
remain explicitly unavailable. This does not complete those rules or Q02a.

[C85 evidence](../audits/evidence/2026-10-22-c85-applied-rules.json) separates maintained
source regressions,17 pinned initialized preparation/constructor profiles,mounted
both-layout interactions,isolated public rolls and packaging. M2 remains open for
remaining final/effect/formula dependencies;E01 is independent. No native acceptance.


### C86 — persisted Boolean feature read rules (2026-10-22)

The shared source-only preparation admits Diamond Soul,Tool Expertise,Observant and
modern Remarkable Athlete. Diamond Soul sets saves during ability preparation;
Tool Expertise tests exactly1 before later global check/skill targets;Observant
adds5 only to Perception/Investigation passives;modern Remarkable Athlete adds
Athletics/initiative advantage without legacy half proficiency. Cached Item tool
proficiency uses that same earlier coefficient. No grants are inferred from names.

[C86 evidence](../audits/evidence/2026-10-22-c86-read-flags.json) records320 independent
native initialized profiles and source regressions across flags,coefficients and
legitimate effect-produced global targets. Qualified flags do not modify the known
pre-initial filter operands,so the historical flag-only refusal is superseded for
one scalar and one Set fixture;raw historical captures are preserved. Unknown/
transformation flags and unqualified snapshots remain gated. Both-layout passive,
save proficiency,Athletics/initiative modes,tool/combined checks and stale intent
recovery are verified separately from10240 new public-host requests. Broader flag/
effect/formula and Item final obligations remain;M2 and ADR stay open.


### C87 — known flag availability and Normal Reliable Talent (2026-10-22)

Known native roll/critical metadata no longer erases independently prepared character
facts. Halfling Lucky retains totals/passives/cards while reroll execution remains
explicitly unavailable. Elven Accuracy/critical action behavior is not enabled by
recognizing its source metadata. Enhanced Dual Wielding supplies native weapon modes;
Ignore Armor Speed Reduction affects the shared movement result. Both layouts and
live Item details use those same facts. Missing critical flags remain absent,not a
fabricated placeholder override;source coercions outside the qualified types stay gated.

Reliable Talent compiles through the existing Normal-range path. Its gate uses the
current primary skill/tool value,including qualified final-field changes;cached prof
and secondary proficiency remain distinct. Half-proficient skill plus trained tool
can grant ordinary advantage without Talent;the trained tool as primary instead
gets minimum10 and the existing bounded-advantage unavailable state. Bounds retain
native original-face/count semantics,including contradictory minimum/maximum values.
No reroll evaluator or extension of tied-index equivalence is introduced.

[C87 evidence](../audits/evidence/2026-10-22-c87-remaining-flags.json) records9 independent
flag-read,160 Talent/range,48 current-primary,36 weapon-mode and8 armor-speed native
profiles. Public-host4160 new requests cover208 complete Normal face distributions;
actual mounted both-layout reads/previews/controls/context recovery are separate.
Effect-written flags,wider formulas/filters and Item final dependencies still keep
M2/ADR open;native/operator/installed acceptance is not claimed.

### C88 — effect-written Boolean flags and source applicability (2026-10-22)

The shared preparation model now separates source,initial-prepared and current
flags. Actual native flag normalization/Foundry Boolean operations qualify14 known
flags in both phases. Initial flags feed cached stats/passives/Item proficiency;
final flags affect fresh checks and dynamic getters without recomputing earlier
results. Reliable Talent and reroll execution keep C87's independent boundaries.
Powerful Build thresholds use the initial-prepared flag,not raw Actor flags.

Actual native applicability also supersedes the blanket nontransfer restriction:
base/condition templates stored on Items do not prepare the owner or Item;
nonapplied enchantment templates likewise do nothing. Exact rider references are
dormant. Applied Item enchantments remain gated. Benign source/advancement identity
metadata is preserved without resolution;dependent references remain unavailable.
Permanent native durations reinitialize raw expired poison tofalse;valid start
metadata alone does not make them timed. Timed/forced-temporary effects stay gated.
Historical fixtures remain intact with explicitly named C88 expectation supplements.

[C88 evidence](../audits/evidence/2026-10-22-c88-effect-flags.json) records independent
source/default/operation/phase comparisons,maintained regressions,mounted1440/390
consumers and isolated public execution. No full DataModel/runtime/operator or
installed acceptance follows. This advances existing M2/Q02a/DD-03/11/27/34 and
A02–A06 read preparation;full M2/ADR remain open. Next:formula/effect composition
and required Item final preparation,with existing Q00/E01/E02/E04/E05 boundaries.

### C89 — shared deterministic check FormulaField effects (2026-10-22)

The existing deterministic grammar now composes native add/subtract/multiply/
upgrade/downgrade/override for qualified check/save/skill/tool/init/passive bonus
FormulaFields. Text remains unresolved through effects;earlier preparation folds
initial expressions,while fresh checks use final expressions/current fields and
native proficient-check root-prof rebinding. This is distinct from NumberField
delta evaluation. Compound negative addition follows native textual flattening;
it must not be approximated by adding an independently reduced scalar.

[C89 evidence](../audits/evidence/2026-10-22-c89-formula-effects.json) records120
independent operation cases,960 actual native preparation/fresh profiles and20
actual scope profiles. Earlier passives/cached modifiers stay unchanged by final
fields. Source documents and historical captures remain unchanged. Multiplication
is explicitly grouped with equivalent deterministic semantics;no dice AST/parser,
evaluator or new SDK contract is introduced. Unknown references,dice/nonqualified
fractions and unsupported fields remain unavailable. Full M2/ADR remain open;
next finish required wider fields/Item final/filter preparations and Q00 boundaries.

### C90 — Actor proficiency effects and ordinary equipped gear (2026-10-22)

One shared model now distinguishes class-base,initial-prepared and current Actor
proficiency. Literal numeric effects on derived `system.attributes.prof` use the
native unguided number operations,not raw prepared-looking source overrides or
NumberField formula arithmetic. Cached passives/Item/generic proficiency retain
the earlier base;fresh skill/tool configuration and current header/card facts see
the current base. An untrained generic roll retains current root prof,a trained
one uses its cached term. Explicit notes explain differing current/prepared facts.

Native Actor roll-data `attributes.prof` is a current numeric reference;root
`prof` is a separate object rebound by construction. Both are qualified separately.
Prepared folding now preserves a known earlier bonus when the current reference
profile is unavailable;current execution cannot fall back to that earlier number.
The named historical damage-reference refusal is superseded with native3;other
unknown references remain gated. Known native miscellaneous equipment types do
not become armor. The real SRD Ioun Stone effect key and equipped/attuned eligibility
work without name inference,content substitution or hard-coded module grants.

[C90 evidence](../audits/evidence/2026-10-22-c90-base-proficiency.json) records192
actual initialized native phase/configuration profiles and7 nonarmor AC profiles.
Positive integer proficiency bases are qualified for numeric checks. Other bases
stay explicitly unavailable;wider die sides remain symbolic/readable with execution
gated by existing Q00 qualification. No term is silently omitted. This advances
M2/DD-03/11/24/27/34 and A02–A06 reads;full M2/ADR remain open. Next:remaining
scalar/effect fields and Item final composition from the existing exit ledger.

### C91 — equippable final cleanup and phase eligibility (2026-10-22)

Actual per-type Item final hooks reveal a module defect:an initially suppressed
transferred effect can become active after nonmagical gear loses its attunement
requirement. The unchanged qualified source previously executed+5,where native
final Actor proficiency requires+6. Effect planning now uses separate initial and
final Item eligibility. Unqualified final recipes are fenced,including when initial
suppression previously hid them;they do not silently restore an independent roll.

One shared Item result prepares native Equippable cleanup and Actor attunement
increments. Nonmagical gear loses attunement;unattunable Items clear attuned state;
unequipped-but-attuned gear still counts. Raw Actor count99 is ignored. Inventory,
current Item details,cards and capacity reads format the same prepared fields;
source and ownership/identity metadata remain unchanged. Existing modern command
restrictions remain. Coupled final Actor proficiency is qualified for the recorded
no-activity/no-counter Item recipes;other final targets/activities remain gated.

[C91 evidence](../audits/evidence/2026-10-22-c91-equippable-final.json) records240
actual Item/Actor final phase profiles and unchanged source regressions,plus mounted
and isolated-host checks. Primitive defaults/source initialization remain distinct
from these initialized native-method comparisons. Full M2/ADR remain open;continue
remaining scalar fields,Item activity/final composition and formula dependencies
from the existing exit ledger. No Core or compatibility decision follows.


### C92 — initial scalar fields and embedded movement (2026-10-22)

Parent `5cd067f`;partial M2/Q02a,DD-01–06/11/27/31/34,A02–A06 read preparation.
126 independently expected FormulaField/domain cases now cover AC bonus/minimum,
HP level/overall bonuses,movement speeds/bonus,carrying bonuses/multipliers and
Actor ability/global attack,spell DC and four damage scopes. Six pinned native
embedded-method cases establish species inheritance before initial effects;zero
blocks inheritance and an effect-created zero is never overwritten by the species.
Raw nonpersisted AC/carrying/movement multiplier poison is ignored without source
changes. Carrying adds bonuses after native multiplier/size rounding. All read
consumers use the same prepared model. Unknown domain expressions stay unavailable;
independent known checks can remain available.

The maintained regression fails unchanged against C91 (AC null versus independently
expected16) and passes after. Actual desktop/mobile consumers,stale callbacks and
context recovery are exercised separately from extracted native methods. Commands,
hashes and limits: [C92 record](../audits/evidence/2026-10-22-c92-scalar-fields.json).
No final scalar/effect,Item activity lifecycle,broader expression or installed/native/
operator qualification is inferred. The M2 exit table and ADR remain open;continue
final scalar snapshots and remaining Item/filter dependencies. No version/compatibility
or external dependency change.


### C93 — scalar field phases and cached operands (2026-10-22)

Parent `5477229`;partial M2/Q02a,DD-01–06/11/27/31/34,A02–A06 preparation.
432 independently expected typed scalar cases qualify literal effects on AC flat/
override/cover,HP fields,movement multiplier and four sense ranges. Rounding,minimums,
negative deltas and negative-zero diagnostics are retained.13 native final FormulaField
cases use prepared AC bonus/minimum and movement speed/jump operands. One detached
snapshot calls the existing shared preparation functions;final changes never rerun
HP/AC/movement derivation. Earlier effective HP,max speed and AC stay cached while
current fields,reads and fresh Dexterity saves use the appropriate values. Current
proficiency references cannot rebind the earlier numeric AC operand.

Twelve explicit unavailable cases retain the numeric-prepared FormulaField multiply/
upgrade/downgrade boundary:the pinned native handlers pass a numeric value to a
string-only Roll constructor. The controlled method diagnostic is recorded;this is
not an installed native defect claim or a missing Core contract. Add/subtract/
override are qualified. Nullable operands,broader effect references and remaining
final scalar/Item/filter phases are not silently admitted.

The unchanged maintained input fails C92 (AC flat effect receipt absent versus17)
and passes after. Actual desktop/mobile AC/HP/movement/sense/save consumers,focus
preview,shortcuts and held callbacks pass separately. The isolated public host adds
1,896 cases,including complete plain-d20 distributions and Normal bounds for current
cover. [C93 evidence](../audits/evidence/2026-10-22-c93-scalar-phases.json) records
commands/artifact hashes and limitations. Full M2/ADR/installed/native/operator
acceptance stays open;experimental0.4.1 and compatibility are unchanged.


### C94 — transferred final check fields (2026-10-22)

Parent `6ce43c6`;partial M2/Q02a,DD-01/02/03/06/24/27/31/34,A02–A06 read preparation.
The C91 no-activity/no-counter equippable final recipe now admits already qualified
Actor score,skill/tool current-value,check/skill/tool proficiency,bonus and mode
handlers. No field arithmetic,Item lifecycle or execution grammar is duplicated.
All earlier Item eligibility,range,conditions,configured counters/activities and
unknown-target boundaries remain.18 field groups ×5 native Item types ×4 eligibility
states ×4 proficiency coefficients produce1,440 independent profiles. Native methods
capture independent,combined and alternate-ability skill/tool configurations.

Current skill/tool value fields are distinct from earlier effectValue/prof caches.
Late current-value changes do not rebuild proficiency;combined advantage uses the
earlier positive-prof flags. Current global proficiency and primary-only bonus/mode
scopes follow actual native construction. Half proficiency,expertise,source-mode
cancellation and manual choices are qualified without changing host serialization.

The exact maintained suite fails C93 in792/1,440 profiles and passes after. C91 and
older final-number/bonus/proficiency tests explicitly supersede only their
valid no-activity Item restrictions;the older mode fixture retains its explicit
condition composition gate;historical JSON and missing-identity/unknown-
field checks remain. Actual desktop/mobile selection,preview,shortcut,direct roll,
unchanged-total source retirement and recovery pass. The isolated public host adds
44,640 requests,including full plain-d20 distributions and Normal bounds.
[C94 evidence](../audits/evidence/2026-10-22-c94-transferred-final.json) retains
commands,hashes,source/default versus initialized-model limits and evidence classes.
No full Item/Activity lifecycle,native installation/operator acceptance or Core
extension is inferred. M2/ADR remain open;next finish remaining scalar/default and
Item Activity final dependencies in the existing exit ledger. Version/compatibility
and external dependencies are unchanged.


C94 verification correction:the final C93 poison supplement referenced an absent
raw senses container and failed. It had been appended after the successful73-suite
run,and its supplemental command was incorrectly recorded as PASS. The original
failed log hash is preserved in the corrected C93 record;the C94 record supersedes
that final-tree claim with the initialized fixture and a complete final-tree run.
Other C93 arithmetic/native-method/public-host evidence is not relabeled.


### C95 — nullable scalar initialization and prepared zero (2026-10-23)

The shared scalar initializer now supplies schema-proven absent HP/AC parents and
nullable leaves without overwriting malformed containers or source. Effect receipts
retain the actual null operand and source/default origin. Native non-improving
upgrade/downgrade may retain null;other qualified operations clean numeric results.
Final operands use earlier HP/AC preparation,not raw null. Cached effective HP and
armor are not recomputed by later field changes. Numeric prepared zero remains
distinct from text "0" in FormulaField operations and ordered composition. Positive
numeric prepared multiply/upgrade/downgrade stays explicitly unqualified.

[C95 evidence](../audits/evidence/2026-10-23-c95-nullable-scalars.json) records
756/792 same-input historical failures and0 after,12 native schema-default captures,
720 NumberField phases and72 numeric-zero/text cases.75 module/9 tooling suites,
281 explicit typed files,exact2242/591 source comparison,mounted1440/390 checks,
105650 accepted public-host requests (3216 new) and isolated check/package PASS.
Regression,controlled native methods,mounted SDK seam and synthetic public-host
evidence remain separate;no installed/native/operator acceptance. M2/ADR stay open.
Next:remaining Item/Activity final and formula/filter dependencies in the exit ledger.


### C96 — configured parent Uses and Item final composition (2026-10-23)

C95 committed as `9577a95`. One shared Uses preparation now serves owned Item
readouts and the no-activity equippable final recipe. Literal/arithmetic capacity,
spent and fixed recovery metadata no longer block a qualified transferred effect.
Native initial suppression and final attunement cleanup still decide eligibility
independently. Later Actor changes do not replay Item counters/proficiency. Source
value/label/recharge poison remains ignored;dependent capacities,scale recovery,
malformed data,Activity final hooks and condition composition remain unavailable.
Recovery formulas are metadata here;none is executed. C91's blanket literal counter
restriction is superseded only for this qualified recipe.

[C96 evidence](../audits/evidence/2026-10-23-c96-equippable-uses.json) records
480/960 same-input failures before and0 after against actual pinned per-type final
hooks/UsesField/Actor phase methods.76 module/9 tooling suites,284 explicit typed
files,exact2242/591 source comparison,mounted1440/390 live inventory details and
stale intent recovery,110330 accepted public-host requests (4680 new) and isolated
check/package PASS. Native initialized-model,regression,mounted SDK seam and public
host evidence remain distinct;no installed/native/operator acceptance. Task-owned
services stopped. M2/ADR remain open. Next:actual BaseActivity final/schema/override/
field preparation and required formula/filter dependencies in the M2 exit ledger.


### C97 — shared utility Activity common/final preparation (2026-10-23)

C96 committed as `bb2dd55`. The shared owned-Item model now prepares qualified
nonspell utility activation,duration,range,target and visibility requirements from
raw source and verified schema defaults. Native default activation is action.
Weapon range inheritance/override,long/reach and inferred versus final values stay
distinct;nonspell Item source fields outside their schema cannot supply overrides.
Parent uses prepare before child uses,including the qualified parent-counter
reference. Actual per-type Item/Actor final composition permits these utility
activities with the existing transferred check profile. This supersedes only the
blanket activity restriction for the qualified recipe. Activity execution remains
unavailable;common metadata is not a claim of complete subtype/usability support.

The real schema/primitive/default and BaseActivity final methods supply180 independent
captures,then528 real Item/Actor compositions execute actual Base final rather than
C84's Uses-only stub. All708 final-input cases fail C96 and pass after. Raw source,
initialized models and prepared results remain separate. Area templates,
nonempty consumption references/behaviors/effects,spell parents,other subtypes and
dependent field profiles remain explicit boundaries.

Mounted checks also reproduced a source-retirement gap:Activity metadata could
change without changing prepared skill results,leaving a roll dialog open. The
shared UI intent identity now compares the current caller-visible source alongside
world/profile/preparation identity. This ephemeral comparison adds no document
store,revision authority or authorization bypass. Held callbacks retire and recovery
requires current intent,including unchanged totals. Both layouts format shared
common facts and current details;unsupported details have a clear unavailable state.

[C97 evidence](../audits/evidence/2026-10-23-c97-activity-common.json) separates
regression,controlled native methods,mounted SDK seam and isolated public-host
results. No full DataModel/runtime,installed/native/operator or release acceptance
follows. M2 and ADR remain open. Next:remaining Activity reference/field/subtype and
spell modifier dependencies,then outstanding formula/filter and A02–A06 exit work.

C97 checkpoint checks:77 module/9 tooling suites (61 assertions),288 explicit typed
files,exact2242/591 source comparison,all three relevant mounted harnesses at1440/390,
113282 accepted public-host requests (2952 new) and isolated check/package PASS.
The retained unary candidate and1800 tied-index diagnostics remain visible;no host
serialization is rewritten. Task-owned services stopped;version/compatibility unchanged.


### C98 — target-template preparation and captured length units (2026-10-23)

C97 committed as `b6c64fd`. The shared utility Activity path now prepares all10
release-defined template shapes,dimension roles,count and size/width/height values.
Native count1/width5/height5 defaults apply to initialized strings;source numeric0
cleans to truthy "0" and remains0. Missing required size and unknown expressions/
shapes/units stay unavailable. Clearing the template returns to the independent
nonarea metadata. No template is placed or applied.

Rules context now passes through the existing effect/equippable preparation path
so final admission and owned-Item reads share the captured metric setting. Missing,
null or blank weapon-range units use this verified default instead of hardcoded
feet. Explicit units remain independently known when the default setting is not
available. Original source and nonpersisted dimension/label/scalar poison remain
unchanged. C97's blanket area-metadata restriction is superseded only for this
qualified read/final-composition profile;canvas and Activity execution stay open.

[C98 evidence](../audits/evidence/2026-10-23-c98-activity-targets.json) records
80 actual native target profiles,320 real per-type Item/Actor final compositions
and12 native unit defaults.410/412 same final inputs fail C97 and0 after.78 module/
9 tooling suites (61 assertions),290 explicit typed files,exact2242/591 source
comparison,mounted1440/390 dimensions/metric/zero/source-context recovery,115402
accepted public-host requests (2120 new) and isolated check/package PASS. The
unary candidate and1840 tied-index diagnostics stay recorded;host serialization
is unchanged. Task-owned services stopped. These evidence classes remain separate
from full DataModel/runtime,installed UI,native/operator or release acceptance.
M2/ADR remain open;next qualify owned consumption-reference indexes/remapping,then
remaining Activity/spell/formula/filter dependencies in the existing exit ledger.


### C99 — shared source-only consumption references (2026-10-23)

C98 is `46bbcb3`. One shared preparation path now resolves qualified utility
Activity itemUses/material references from caller-visible owned sources. Bare
owned IDs, exact world/owned source UUIDs and explicit persisted identifiers
(including type prefixes) retain native first-insertion order. Native Item base
indexing prefers `_stats.compendiumSource` over `flags.dnd5e.sourceId`; source and
prepared targets remain separate. Names and prepared-looking index fields never
supply identities. Both layouts format these facts from the existing owned-Item
model. No consumption is executed and no source is changed.

Actual release index/schema/Base final methods establish44 remap/default/warning
cases and176 real Item/Actor final compositions. All176 composition inputs fail
C98 and pass after. A missing known target produces a native warning without
blocking an independent Actor check; reference availability is distinct from common
schema preparation. This supersedes C97's blanket nonempty-consumption restriction
only for this bounded read/final-composition recipe. Unknown index members remain
unavailable. An executable compendium redirect collision proves raw string matching
is insufficient; canonical compendium consumption matching stays unqualified. This
is no new Core defect or dependency claim. E01 remains separately open.

79 module/9 tooling suites (61 assertions),293 explicitly typed files,exact2242/591
source verification,mounted1440/390 current details/order/warnings/source-context
retirement/recovery,116946 accepted public-host requests (1544 new) and isolated
check/package PASS. One unary candidate and1880 tied-index diagnostics stay visible;
host serialization is unchanged. Task-owned services stopped. Controlled native
methods,regression,mounted seams and isolated-host evidence remain separate from
full DataModel/installed/native/operator acceptance. M2/ADR remain open;next finish
remaining Item/spell/formula/filter obligations and A02–A06/Q02a exit comparisons.

[C99 evidence](../audits/evidence/2026-10-23-c99-consumption-references.json) records commands,hashes,declared collaborators and limits.


### C100 — source-linked spell ability and numeric attack readouts (2026-10-23)

C99 is `a6a5028`. Shared owned-Item preparation now resolves exact persisted
spell ability/sourceItem,class/subclass identities and advancement-root links.
Native class mapping retains last value/first key order;source indexes retain
first-match order. No name inference or prepared-looking maps supply an override.
The generic Activity fallback may use the Actor's strongest class ability,while
a default Spell attack can legitimately have no ability modifier. Effective
subclass ability and explicit attack/spellcasting/none choices stay distinct.
Numeric spell attacks share the existing Item compiler and ability/global/msak/rsak
scopes;source proficiency and spell proficiency-dice labels remain separately gated.
Both layouts format the same current Item/Spell facts;casting stays unavailable
until the reviewed M4/M5 workflow. No source writes or second preparation cache.

16 actual native source/default/getter contexts and128 actual attack constructions
use independently asserted expectations. Native final ability-Set/getters execute
with declared common/damage-label/neutral label seams;construction is compared
separately,not claimed as full Activity or Actor source preparation parity. All144
final maintained inputs fail C99 and pass after. Poison/identity/malformed/context
recovery,live spell details and stale callbacks are covered.

80 module/9 tooling suites (61 assertions),297 explicitly typed files,exact2242/591
source verification,mounted1440/390,117010 accepted public-host requests (64 new
independent skill checks with spell-source graphs) and isolated check/package PASS.
One unary candidate and1880 tied-index diagnostics remain;host serialization is
unchanged. Task-owned services stopped. No installed/native/operator,slot/casting
execution or release acceptance follows. M2/ADR remain open. Next complete Q02a's
filter vocabulary/snapshot dispositions and remaining shared Item/spell common
read preparation,then the existing M2 source/override/effect-order exit comparisons.

[C100 evidence](../audits/evidence/2026-10-23-c100-spell-context.json) records commands,hashes and limits.
