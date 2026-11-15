# Patch +7 — Original palette UI functionality

## Requirement
Keep ClusterOpt HTML/CSS unchanged while enabling File > Tools > Interface Palette.

## New modules
- `object/PaletteUI.js`: Request/Response through Hub, original dialog handlers, local persistence, User API.
- `property/palette.js`: RGB validation, dark/light token generation, pure conversion.

## Event chain
User click -> PaletteUI.open -> Hub.dispatch -> OMU; input -> PaletteUI.apply -> Hub.dispatch -> EDPMU.set(UIPalette) -> CSS custom properties -> localStorage.

## EHU / failures
- Invalid hex or mode: 400 FAIL.
- Missing dialog: 404 FAIL.
- Dialog exception: 500 FAIL.
- Storage failure: STORAGE_FAILED event (storage persistence is best effort).

## Load and security
- No network requests for palette updates. Single localStorage key contains only hex and mode, never credentials.
- Constant-sized CSS token updates; no full document rebuild.
- Contrast uses fixed dark/light foreground tokens rather than tinting text with selected color.

## Validation
Source committed; browser interaction, contrast audits and GitHub Pages deployment not verified.
