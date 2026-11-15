# Patch +5 — ESM cache consistency

## Reproduction evidence
- Cluster.version(): OCDA-P4
- Cluster.openHighlighter(): undefined
- highlighterDialog.open: false
- VERSION_PUBLISHED event present

## Root-cause hypothesis
Entry script was cache-busted, but child ES module import URLs were unchanged. A stale HighlighterUI module can return undefined even when the entry script reports P4.

## Changes
- Add version query to all static imports in main/app.js.
- Add version query to nested property imports in LanguageUI and HighlighterUI.
- Update HTML, LinkCore published version and global property list to OCDA-P5.

## Verification
- GitHub source changes committed.
- Browser deployment/click testing pending; cache hypothesis not yet proven.
