# Patch +10 — Large-file virtual windows, full-file export and line gutter

## Implementation
- Added newline-aligned byte window reads (up to 1 MiB + 64 KiB scan).
- ChunkLoaderUI navigates windows and uses original footer progress/status elements.
- FileOperationsUI stores edits per byte window; save builds a full Blob from unchanged source slices and modified UTF-8 windows. Never silently truncates the source.
- EditorViewportUI pages forward on bottom wheel and backward using history at top, and renders visible gutter lines and caret Ln/Col.
- New/close clears stale file loader state. LinkCore release OCDA-P10.

## Risks and incomplete work
- Long single lines exceeding window size are rejected instead of being split unsafely.
- Window history supports sequential navigation only, not arbitrary jumps.
- Export requests a browser download; successful disk write cannot be confirmed.
- Dirty state remains after download request intentionally.
- Source byte range replacement is UTF-8 text oriented; non-UTF-8 files and CRLF normalization require further verification.
- No actual browser E2E or large-file stress test completed.

## EHU / relation tests
- WINDOW_FAILED: 409 cancel or 500 decode/window failure.
- SAVE_ASSEMBLY_FAILED: 500 overlap/corruption guard.
- OPEN_WINDOW and SAVE_DOWNLOAD_REQUESTED: 200 request logs.
- Test pending: 10 MiB/1 GiB sequential navigation, UTF-8 boundaries, edit+export+hash comparison, line gutter alignment and scrolling.
