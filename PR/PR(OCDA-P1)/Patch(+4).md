# Patch +4 — Highlighter dialog and version log

## Reported issue
- Cluster.version() returned P3 but File Tool > Highlighter did nothing.
- No version publication entry in Cluster.log().

## Changes
- HighlighterUI.open() now returns a status and opens the existing dialog.
- Add fallback rendering when showModal throws; keep original HTML/CSS.
- Add Cluster.openHighlighter() for direct Console diagnosis.
- Emit OMU Version/VERSION_PUBLISHED log on startup (status 200).
- Synchronize HTML, LinkCore, global property registry to OCDA-P4.

## Testing
- Source committed. Actual click behavior and Pages deployment unverified.
- No claim of full feature parity with ClusterOpt.
