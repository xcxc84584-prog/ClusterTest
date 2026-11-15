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
