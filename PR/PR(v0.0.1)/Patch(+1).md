# Patch(+1) — OCDA Bootstrap

## 修補／建置內容

1. 初始化 ClusterTest 靜態網頁與最小編輯器。
2. 新增四個 LinkCore 單元的基礎實作。
3. 新增 Document、FileLoader、FileSession 獨立模組。
4. 新增全域屬性清單、Plan、ArcD 與未完成問題清單。
5. 檔案開啟透過 HubUnit → FileSession → FileLoader。
6. OMU 具 PASS 1 秒冷卻及 FAIL/EHU 保留邏輯。

## 限制

這是第一個可執行原型，尚未達到 ClusterOpt 完整功能等價；大文件僅唯讀預覽，儲存以下載方式完成。
