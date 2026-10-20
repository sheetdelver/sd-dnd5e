# D&D module audits

The current audit is [2026-10-19 character-lifecycle discovery](2026-10-19-character-lifecycle.md), governed by [ADR-0001](../adr/0001-complete-character-lifecycle.md). It contains stable DD-01–36 findings and the verified repository/toolchain baseline.

Implementation progress belongs in that ADR's milestone ledger and the linked [verification matrix](../plans/0001-verification.md). This is the module's only active plan. Ignored `temp/audit-report/` preparation-runtime research remains parked and is not a parallel implementation queue. Core and sibling-module audits are references only.


The current [independent C08/C09 review](evidence/2026-10-20-c08-c09-review.md)
confirms the DD-R05 correction and bounded tool checks. All maintained checks
pass again. **DD-R06 (low)** records a focused-button preview lost on pointer
exit, corrected by C10. C11 implements bounded combined checks/alternate abilities.
No new Core dependency or full acceptance closure follows.

The earlier [independent C06/C07 review](evidence/2026-10-19-c06-c07-review.md)
confirms DD-R01–DD-R04 corrections. **DD-R05** recommends removing the blanket
adv/dis block for the proven plain numeric profile, with explicit equivalence
criteria and preserved equal-die index diagnostics. A mandatory first-tie Core
extension has not been established. Wider E05 and the existing E01 remain open.

The earlier [C04/C05 review](evidence/2026-10-19-c04-c05-review.md)
confirms DD-R01/DD-R02 corrections and fresh offline checks. **DD-R03/DD-R04**
were corrected in C06: shared card/header availability and nonpersisted
proficiency source/default boundaries. The verification ledger records evidence;
continue the existing mode/passive and public roll qualification roadmap. Neither requires Core changes. The earlier
[C01–C03 review](evidence/2026-10-19-c01-c03-review.md) is retained as historical
failing evidence, not an instruction to redo its completed corrections.

C08 corrects DD-R05 with bounded numeric equivalence and actual consumer tests.
Wider Q00/E05 remains open.

C09 implements bounded independent Actor source tool checks in both layouts.
[Portable evidence](evidence/2026-10-20-c09-tools.json) records R/S/mounted/public-host
checks; combined tool choices, effects and full acceptance remain open.

C11 supersedes C09's selected-check refusal for the qualified numeric source
profile. Effects and full acceptance remain open; see its portable evidence.
