# Plan — PR(+v0.0.1)

## 研究（2026-11-16）
1. Google JavaScript Style Guide — 命名、ES Modules、錯誤處理、格式規範。
   https://google.github.io/styleguide/jsguide.html
2. MDN Blob.slice — 有界讀取，避免將大型 Blob 完整讀入記憶體。
   https://developer.mozilla.org/en-US/docs/Web/API/Blob/slice
3. MDN Web Workers — 未來將索引及解析移至背景工作執行緒。
   https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

## 開發階段
1. 建立 Program、三份清單、QuestionList1 與 PR 文件。
2. 移植 ClusterOpt UI 與 OCDA 最小 Editor/FileSession。
3. 建立 LoopLogUnit 與 FileOpenVTE。
4. 補齊 Relation Test 與 CI。
5. 下一 Patch 才進行完整功能遷移與效能測試。

## 安全／負載
動態註冊不得視為授權。大文件讀取使用 Blob.slice。
未來測試 1MB、100MB、1GiB、5GiB；不得宣稱未測量的效能成果。
