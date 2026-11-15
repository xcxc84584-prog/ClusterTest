# Patch +11 — Footer progress and line viewport optimization

## Fixes
- Original Footer progress meter now exposes reading/done/error phases, current byte offset percentage and ARIA progressbar values.
- EditorViewportUI renders only visible line numbers and batches redraw through requestAnimationFrame.
- Avoids allocating arrays with split() for line count and caret line calculation.
- Corrects gutter offset using original textarea 16px padding and scroll position.
- LinkCore release updated to OCDA-P11.

## Event chain
Wheel/Input -> EditorViewportUI -> VisibleLineRange via EDPMU; Navigate -> ChunkLoaderUI -> progress/status DOM + HubUnit/OMU.

## EHU
WINDOW_FAILED 409 cancellation / 500 read failure; previous P10 safeguards retained.

## Risks / pending
Footer percentage is byte-position progress, not full background indexing. CSS gutter alignment and multiline scroll require browser validation. No automated browser E2E, 1 GiB test, arbitrary seek, crash recovery or atomic disk save has been performed. Full large-file parity is not claimed.
