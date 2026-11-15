# ArcD — v0.0.1 Patch +1

## New Object / Property

Object: FileLoader、FileSession、Document、HubUnit、ObjectManagementUnit、UnifiedRegistrationUnit、EntireDomainPropertyManagementUnit。

Property: Version（已註冊）；EditorState、DocumentState、SliceState、ViewportState、LoadProgress（待實作）。

## Event Chain

```text
User → EditorWindow → HubUnit → FileSession.open()
                                    ↓
                                FileLoader.load()
                                    ↓
                                 Document
                                    ↓
                              Editor textarea
HubUnit → OMU.log / EHU (failure)
```

## EHU 表單

| Event | Source | Target | Failure | EHU |
|---|---|---|---|---|
| OpenFile | EditorWindow | FileSession | Missing target | 404 |
| OpenFile | EditorWindow | FileSession | Read/parse exception | 500 |

## 設計限制

HubUnit 是邏輯層，可多實例共享 registry／OMU；本 Patch 僅實作單實例。PASS 相同來源及事件 1 秒冷卻，FAIL／EHU 不冷卻。尚無完整 authorization、Event Chain ID、VTE 與 Relation Test Matrix。
