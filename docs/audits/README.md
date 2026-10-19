# D&D module audits

The current audit is [2026-10-19 character-lifecycle discovery](2026-10-19-character-lifecycle.md), governed by [ADR-0001](../adr/0001-complete-character-lifecycle.md). It contains stable DD-01–36 findings and the verified repository/toolchain baseline.

Implementation progress belongs in that ADR's milestone ledger and the linked [verification matrix](../plans/0001-verification.md). This is the module's only active plan. Ignored `temp/audit-report/` preparation-runtime research remains parked and is not a parallel implementation queue. Core and sibling-module audits are references only.


The [independent C01–C03 review](evidence/2026-10-19-c01-c03-review.md) confirms
foundation checks and adds **DD-R01/DD-R02** to the existing active audit:
ignored native skill die ranges and incorrect fallback on unavailable rules
context. Both are module corrections; resolve them before extending the bounded
skill slice. They do not replace the roadmap or establish new Core dependencies.
