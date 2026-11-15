# Patch +2 — LanguageUI / HighlighterUI

## Fixes
- Separate DOM adapters into dedicated Object files.
- Translate test-critical highlighter controls through shared locale Property.
- Toggle original editor highlight-active class to show overlay or native text.
- Coalesce input rendering with requestAnimationFrame.
- Add shortcut recording, reset and performance checkbox state.
- Preserve original HTML and CSS.

## Verification
- Source files committed to GitHub; browser E2E and CI not executed.
- UI demo is not feature-parity with ClusterOpt.
- No Shiki, worker, virtualized viewport, or HTTP log transport yet.
