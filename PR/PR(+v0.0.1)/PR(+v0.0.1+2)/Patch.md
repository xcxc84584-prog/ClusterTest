# Patch(+2) — Language & Syntax Highlighting

## Research
- Shiki official docs: https://shiki.style/guide/
- Shiki performance: https://shiki.style/guide/best-performance
- FormatJS fallback concepts: https://formatjs.github.io/docs/intl/

## Implemented
- zh-Hant and en catalogs with stable translation keys.
- LanguageProperty registry with fallback, subscribers and dynamic registration.
- Locale switch in original ClusterOpt UI; locale persisted in localStorage.
- SyntaxHighlighter adapter with lazy-loaded Shiki and extension mapping.
- EditorHighlighterView with revision guards, debounce, safe DOM spans and
  a 200,000-character bound; plain text remains available on load failure.
- Original highlighter dialog buttons and toggles wired to basic behavior.
- Locale and extension mapping unit tests added.

## Known limitations
- Browser CDN access is required for Shiki; no local bundled engine yet.
- Performance-mode toggle is stored but true viewport-only highlighting
  is not yet implemented. Large documents fall back to plain text.
- Full UI translation coverage, syntax color palette integration and
  screenshot/interaction regression tests are still pending.
- Tests have been authored but not executed in this environment.
