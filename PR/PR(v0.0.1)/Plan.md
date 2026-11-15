# PR(v0.0.1) — Plan.md

**目標：** 在 ClusterTest 以 OCDA 重構 ClusterOpt 一般編輯器與文件載入，最終保持功能等價並優化效能。

## 需求與例子

- 多分頁文件、文字編輯、儲存、未儲存恢復、行號、語法著色、Explorer 與大文件載入。
- 例：開啟 1 GiB 文件只讀取可視切片，滾動時切換載入，保留未儲存修改。
- 每個 Object／Property 分檔，跨物件互動通過 LinkCore；HubUnit 可並行多實例。

## 所需知識

Blob.slice、File System Access API、IndexedDB、TextDecoder streaming、Piece Tree、虛擬渲染、MVCC、Web Worker、EHU 與 Relation Code。

## 資安與資料一致性

不寫入 Key／絕對路徑；動態註冊不等於授權；過期載入不可覆蓋新編輯；VTE 與正式資料隔離。

## 數據與流量負荷

目標涵蓋 1 MB、100 MB、1 GiB、5 GiB；量測首次可視時間、索引進度、峰值記憶體、輸入 P95、滾動 FPS。目標 P95 輸入 ≤50ms，主執行緒避免 >50ms 長任務。均為待驗收目標，非實測。

## Patch 計畫

- +1 LinkCore、最小 Editor／FileLoader 原型與測試。
- +2 編輯器完整互動與分頁狀態。
- +3 文件載入與 FileSession 相容。
- +4 SliceManager 與大文件虛擬索引。
- +5 ViewportRenderer、行號、著色與增量更新。
- +6 恢復、持久化及儲存。
- +7 功能等價、效能及安全驗收。

**驗收：** 原 ClusterOpt 不受修改；最終以功能等價測試及基準數據判定完成。Patch +1 只代表可運作基礎，不代表全部完成。
