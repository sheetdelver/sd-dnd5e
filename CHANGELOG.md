# Releases

Historical entries are reconstructed from [published releases](https://github.com/sheetdelver/sd-dnd5e/releases), their tags, and merged changes. Version numbers follow the published tags; unreleased branch work is excluded.

## Unreleased

- Prepare stored encumbrance conditions, physical roll modes and movement consistently across both layouts.

- Share prepared spell defaults, ability combat modifiers and damage bonus scopes; recognize native normal encumbrance.

- Share nested inventory weight, container capacity, currency and carrying thresholds across both layouts.

- Prepare proficiency dice and passive scores consistently; support qualified Normal checks through the public roll path.

- Resolve roll formula proficiency references from the current check while preserving earlier passive values.

- Resolve qualified numeric class/subclass scales and native class defaults by persisted identity.

- Prepare qualified arithmetic and Actor references consistently across checks, resources and character readouts.

- Initialize sparse standard ability and skill source consistently across checks, effects and character readouts.

- Share Item/activity counters, inventory facts, numeric attack readouts and current Item/spell details across both layouts.

- Support qualified final Actor custom text from empty feat Items while retaining earlier language labels.

- Prepare qualified transferred Item initial custom text with shared eligibility and identity provenance.

- Support bounded custom trait text with a single Poisoned or Exhaustion condition across shared checks and readouts.

- Apply qualified initial custom trait text before language labels while preserving final-field provenance.

- Share bounded final custom defense/training text while retaining earlier language labels.

- Share bounded petrification/final defense fields while preserving earlier grants and current physical bypasses.

- Share bounded final condition immunity while preserving earlier status and roll-adjustment snapshots.

- Share qualified final training Sets and current language labels while retaining earlier prepared labels.

- Share bounded final defense Set effects after earlier native normalization.

- Share bounded modern Jack of All Trades and Alert source rules across character checks and initiative.

- Share qualified final numeric fields and current scores while preserving prepared modifiers, proficiency and fixed initiative scores.

- Apply qualified final constant bonuses across shared rolls while retaining earlier passive and initiative-score values.

- Share qualified final proficiency effects across rolls while preserving earlier passive and proficiency snapshots.

- Qualify final global proficiency effects separately from earlier passive and prepared proficiency snapshots.

- Apply qualified Actor-owned final roll modes through shared execution while preserving earlier passive and initiative-score values.

- Qualify final roll-mode changes separately from prepared passive and initiative-score snapshots; runtime integration remains separate.

- Correct Character phase ordering so late petrification immunity preserves earlier Poisoned check modes and passive scores.

- Share qualified explicit Stunned/Unconscious status, mode and movement preparation across both layouts and roll execution; preset/rider automation remains separate.

- Qualify explicit Stunned/Unconscious source-status, immunity, mode and movement phases against native6.0.6; runtime integration remains separate.
- Shared bounded petrification defenses and effective-condition rules without changing source.
- Qualified petrification status, immunity and defense preparation phases.
- Shared qualified condition save/initiative modes and movement restrictions across character controls.
- Qualified additional condition save, initiative and movement mode phases.
- Shared bounded modern exhaustion reductions across checks, passives, initiative, movement and condition readouts.
- Qualified modern exhaustion status/level, reduction, movement and roll configuration phases.
- Applied bounded poisoned condition modes/passives with shared desktop/mobile status readouts.
- Added controlled condition source/status/mode preparation comparisons.
- Shared class-derived level/proficiency facts with initial rule predicates.
- Qualified bounded initial trait/training Set predicates with source-aware intent retirement.
- Added scoped command journaling, Actor queues and caller-owned status inspection.
- Added isolated public command/receipt, persistence and concurrency qualification.
- Qualified bounded initial numeric filters and shared save-proficiency defaults.
- Preserved malformed change-envelope gates before effect suppression.
- Qualified snapshot-invariant effect/change filters with explicit suppression and intent provenance.
- Applied qualified initial training, language and mastery Set effects through shared preparation.
- Replaced fixed training/language grants with shared source facts and explicit unresolved identities.
- Distinguished fractional and unavailable skill/save proficiency indicators.
- Applied qualified initial defense Set and constant adjustment effects through shared preparation.
- Prepared bounded defense traits and numeric adjustments with a live mobile readout.
- Shared stored species identity across cards, headers, movement and senses.
- Initialized Item effect eligibility from verified schema defaults without changing source.
- Qualified normal d20 bounds and explicit Normal choices; kept unsupported modes and HUD bounds gated.
- Shared source/species movement and senses, truthful units and unavailable states in both layouts.
- Prepared bounded equipped armor/shields and native post-passive Stealth disadvantage.
- Shared bounded AC/initiative facts and rolls, fixed scores, and stale-context protection.
- Shared source-derived HP/Hit Dice facts across cards and layouts; gated unqualified health/rest controls.
- Shared qualified effect-mode counts, suppression and native passive scope ordering.
- Applied bounded constant check/passive bonus effects through shared preparation.
- Applied qualified initial numeric effects to shared checks and proficiency.
- Distinguished effect eligibility and phase order; preserved checks for proven inactive effects.
- Reuse merge validation checks
- Reuse validated release artifacts

- Added combined skill/tool checks and alternate-ability selection.

- Preserved focused roll-mode previews when the pointer leaves.

- Added shared independent source tool checks and desktop/mobile roll controls.

- Restored qualified plain-d20 advantage/disadvantage; retained equal-die diagnostics.

- Added source mode/passive preparation.

- Made level/proficiency availability explicit; separated source defaults from prepared proficiency targets.

- Blocked unqualified skill die bounds and unavailable-context fallback; retired stale roll intents.
- Shared source-derived numeric ability checks/saves and validated prepared roll previews.
- Added exact-release character-lifecycle fixtures and maintained verification tools.
- Added versioned rule context, source decoding and caller-safe content metadata.
- Corrected bundled SRD labels; required Core 0.19.3 public world/content contracts.
- Corrected source-derived numeric skills; exposed unsupported checks and passives.

## 0.4.1

- Reused native HUD roller
- Centered native roll dialogs
- Required Core 0.18.0

## 0.4

- Adopted UI API 2
- Required Core 0.14.2
- Added module presentation checks
- Refreshed release validation tooling

## 0.3

- Adopted prepared Actor lifecycle
- Typed prepared Actor consumers
- Added Actor preparation regressions

## 0.2

- Initial experimental module release
- Added themed character sheets
- Added rest and resource dialogs
- Bundled CSP-compatible local fonts
- Added validated release packaging
