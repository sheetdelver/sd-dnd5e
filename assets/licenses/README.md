# Native system software attribution

[dnd5e-system-MIT.txt](dnd5e-system-MIT.txt) retains the software license from
native D&D5e release 6.0.6, commit
`87e94dbd9f930135e0694cd7e7d49f210603cd2c` (upstream `LICENSE.txt`).

The module uses that release as a versioned rules specification. Its pure
damage-source formula assembly adapts `DamageData._automaticFormula` and
`DamageData._manualFormula` from `module/data/shared/damage-field.mjs`. The helper
uses primitive field normalization, ordered string Sets and string construction;
it imports no native runtime or dice evaluator. Source-method comparisons and
known boundaries are recorded in `docs/reference/native-6.0.6.md` and the C103
evidence record.

This software notice does not license native artwork or purchased content. Their
separate distribution decisions remain in the module's license inventory work.
