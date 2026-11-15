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
