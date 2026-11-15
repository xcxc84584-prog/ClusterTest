# Patch +12 — Requested-window progress, file tabs and Explorer

## Changes
- Loading progress now measures the currently requested byte window, not whole-file position. Yellow busy, green loaded, red error, retaining original Footer design.
- FileTabsUI owns tab and Explorer entries using existing #tabs/#explorerTree containers; no redesign.
- Per-file snapshots retain original Blob, active byte range, dirty text and sparse patches when switching tabs.
- File open/new/close wired into tab lifecycle; LinkCore publishes OCDA-P12.

## Event chain
Open -> ChunkLoaderUI.beforeOpen -> FileTabsUI.snapshot -> ChunkLoaderUI.navigate -> FileOperationsUI.receive -> FileTabsUI.opened -> HubUnit -> OMU.
Tab select -> FileTabsUI -> ChunkLoaderUI.attach -> FileOperationsUI.restore -> EDPMU(FileState/OpenFileTabs).

## Security and load
File content remains in browser memory. No upload, credentials, unsafe innerHTML or absolute paths. Session snapshots are references plus modified windows; memory increases with number of dirty tabs.

## Known gaps
This is basic flat-file Explorer and tab switching, not a directory tree or full original ClusterOpt feature parity. File tab close buttons, arbitrary line seek, persistent session recovery, full 1 GiB tests, exact line indexing, and verified disk write are pending. Current progress reaches 100% when a requested window completes; it does not represent full-file scan progress. Browser E2E unverified.
