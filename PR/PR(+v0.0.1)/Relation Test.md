# Relation Test — PR(+v0.0.1)

| ID | Event Chain | Expected | Status |
|---|---|---|---|
| RT-001 | EditorWindow → HubUnit → FileSession.open | PASS | Test defined |
| RT-002 | EditorWindow → HubUnit → Missing.open | FAIL 404 + EHU | Test defined |
| RT-003 | Loop START → PASS steps → END | START/END only | Test defined |
| RT-004 | Loop START → FAIL + EHU → END | All critical events | Test defined |
| RT-005 | HubUnit ↔ URU | Registered target only | Test defined |
| RT-006 | HubUnit ↔ Authorization | Access enforcement | Pending implementation |

Status is not PASS until the test runner executes successfully.

| RT-007 | Locale switch zh-Hant ↔ en | UI updates, persisted | Test defined |
| RT-008 | Register third locale | Fallback + dynamic keys | Test defined |
| RT-009 | File extension → syntax grammar | Known mapping/plain fallback | Test defined |
| RT-010 | Highlight CDN failure | Editor remains usable | Browser test pending |
| RT-011 | Stale async highlight result | Old result discarded | Browser test pending |
