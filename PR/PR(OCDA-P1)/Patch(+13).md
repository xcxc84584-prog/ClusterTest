# Patch +13 — File integrity, per-tab viewport, balanced patch tree

## Changes
- Corrected readWindow byte alignment: continuation starts at exact previous byteEnd, avoiding skipped bytes.
- UTF-8 decoder is fatal to reject invalid text rather than silently corrupt it.
- Added viewport snapshot/restore of line offset, paging history and window range for tab switches.
- Added PatchTree AVL sparse index; FileOperationsUI now uses logarithmic patch lookup/insertion and ordered traversal without sorting.
- LinkCore release OCDA-P13.

## Event chain
File input -> ChunkLoaderUI -> readWindow -> FileOperationsUI -> PatchTree -> Blob export.
Tab switch -> FileTabsUI -> FileOperationsUI.restore + EditorViewportUI.restore -> EDPMU.

## Performance / risk
PatchTree insert/find O(log p), ordered export O(p) for p modified windows; active decoded window <= about 1 MiB. This is a balanced patch index, **not** a complete piece-tree text buffer. Full edit-in-window remains textarea string editing.

## EHU / pending
Invalid UTF-8 / oversized line: WINDOW_FAILED 500. Patch offset invalid: RangeError. Pending browser tests: adjacent byte windows exact coverage, cross-tab paging, hash integrity, 1 GiB, overlapping edits, undo/recovery, actual progress UI. No full parity claim.
