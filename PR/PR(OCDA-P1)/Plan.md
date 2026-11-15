# Plan — OCDA P1 → P2

## Requirements and examples
- Original ClusterOpt v0.0.69 HTML/CSS preserved.
- LanguageUI: zh-Hant/en toggles in original File > Tools menu.
- HighlighterUI: open original dialog; toggle syntax coloring.
- Console: Cluster.log(), Cluster.objectlist(), VTE.A().

## Knowledge and references
- Original ClusterOpt implementation, VS Code editor architecture concepts.
- Browser requestAnimationFrame for coalesced paint work.

## Security
- No absolute filesystem paths or embedded API keys.
- Runtime registry clears on reload. Untrusted text is HTML-escaped.
- No external HTTP log endpoint is configured.

## Performance and load
- Preview currently processes up to 128 KiB, O(n) per frame.
- Large files and full editor parity are out of scope.
- No claims of gigabyte editing or true visible-range virtualization.

## Patch status
- +1: initial skeleton.
- +2: modular UI adapters and rendering scheduler.

## P3 update
- Version synchronized to OCDA-P3 across bootstrap and HTML.
- Menu state and editor fallback improved; browser E2E pending.

## P6 — LinkCore release migration
- Requirement: eliminate manual version strings in HTML, app and UI modules.
- Runtime: fetch release.json with no-store, resolve six modules via one import map and shared build identifier.
- Load: one manifest request and one module request per module; browser cache reuse within build.
- Risk: partial GitHub Pages deployment may temporarily mix manifest and source; browser E2E required.

## P7 — Palette implementation
- Requirements: original File Tool palette dialog; RGB color picker, numeric channels, dark/light endpoints, live CSS tokens, persistence and Console diagnostics.
- Knowledge: CSS custom properties, HTML dialog, contrast and color conversion, localStorage failure handling.
- Security: strict hex validation, no HTML injection, no keys, no remote palette calls.
- Load: constant-time token update per change; no editor re-tokenization.
- Risk: existing ClusterOpt CSS may contain hard-coded colors; browser contrast audit pending.

## P8
- Requirements: RGB 0/255 endpoints, basic chunk loading toggle and bounded preview.
- Load: 64 KiB slices, maximum 1 MiB decoded preview; yields event loop between slices.
- Security: no network upload, no unsafe HTML, no credentials; partial preview must not be saved as full file.
- Risk: full-file virtual pagination, byte-offset indexing and browser E2E not yet implemented.

## P9 — File baseline
- Requirement: always-on chunk loader, no Tool switch, new/open/save/save-as/close, partial preview save protection.
- Load: 64 KiB chunks, 1 MiB preview; full virtual scrolling is a pending task.
- Security: local-only file input, explicit browser download, prevent partial data loss.
- Test plan: small file, large file, unsaved confirmation, save block 409, open/close, no startup sample.

## P10 — Full-file window navigation
- Requirement: original status bar progress, full-file export preserving unmodified bytes, editable windows, scrolling between windows, visible line numbers.
- Algorithm: newline-aligned byte windows (1 MiB), immutable source Blob slices plus sparse edited window patches, sorted assembly at export.
- Load: O(window size) decoding and O(visible lines) gutter rendering; exported Blob references original slices without full source string allocation.
- Risks: non-UTF8, giant lines, overlap conflicts, browser Blob limits and scroll alignment; full browser test pending.
