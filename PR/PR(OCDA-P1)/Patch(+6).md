# Patch +6 — LinkCore single-source release architecture

## Problem
Versions were hard-coded in HTML, app.js, and import paths. Updating the entry module did not invalidate cached child modules.

## Architecture
- `LinkCore/release.json` is the sole release declaration: `version`, `build`, and module paths.
- Stable `LinkCore/bootstrap.js` fetches release manifest with `cache: no-store` and generates an import map, attaching a consistent build query to every module URL.
- `main/app.js` and UI objects import only logical `ocda/*` specifiers, with no version literals.
- `LinkCore.publishVersion()` validates, registers and publishes Version to EDPMU and emits OMU `VERSION_PUBLISHED` (200).
- HTML loads the stable bootstrap; it does not define a versioned module URL. Bootstrap updates the visible brand label.

## Event chain
bootstrap -> release.json -> importmap -> app -> LinkCore.publishVersion -> URU/EDPMU -> OMU Log.

## EHU
Missing/invalid release triggers bootstrap console error; missing LinkCore release triggers EHU `VERSION_MISSING` (500).

## Limitations / tests
Browser runtime, GitHub Pages deploy and click tests not yet executed. Manifest + source files must be deployed atomically to avoid mixed revisions. Static HTML title and pre-bootstrap label are not the authoritative version.
