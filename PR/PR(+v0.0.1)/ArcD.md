# ArcD — PR(+v0.0.1)

## Objects
HubUnit、OMU、URU、EntireDomainPropertyManagementUnit、LoopLogUnit、
FileLoader、FileSession、Document、FileOpenVTE。

## Properties
Version、Document.name/text/dirty、FileSession.editableLimitBytes。

## Event Chain
```text
EditorWindow → HubUnit → FileSession.open → FileLoader.load
                    │                         │
                    └── OMU / EHU ←───────────┘
```

## EHU
- Missing target: FAIL 404 + EHU 404
- Handler exception: FAIL 500 + EHU 500
- Successful request: PASS 200 (cooldown applies)
- Loop: START → [FAIL/EHU] → END; intermediate PASS suppressed

## Dependency
HubUnit → URU + OMU; FileSession → FileLoader; FileOpenVTE →
HubUnit + FileSession + URU + OMU. Production and VTE registries are isolated.

## Known gaps
Authorization, complete Response routing, dynamic Relation Code, Property
broadcast, global theme/language state and production loop instrumentation.
