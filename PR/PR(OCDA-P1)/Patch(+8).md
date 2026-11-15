# Patch +8 — RGB endpoints and bounded chunk-loading switch

## Changes
- Palette Dark endpoint sets #000000 (RGB 0,0,0), Light sets #FFFFFF (255,255,255), including picker/numeric inputs and persistence.
- New ChunkLoaderUI Object and chunkLoading Property, separately registered through LinkCore.
- File Tool toggle switches between 64 KiB incremental decoding and single bounded preview read.
- Open file action connects to existing file input; first 1 MiB preview appears in existing editor.
- Both modes limit memory usage and mark `complete=false` for larger files; **not a full-file virtual editor**.
- LinkCore release manifest upgraded to OCDA-P8.

## Event chain
User -> File Tool -> ChunkLoaderUI -> HubUnit -> OMU/EDPMU -> readFileChunks -> EditorUI.

## Security and load
No file upload or remote network calls; local user-selected Blob only. 64 KiB slices, 1 MiB maximum preview. Text inserted via textarea.value, not HTML. No secrets.

## Pending
Browser click tests, large-file full virtual paging, offset navigation, safe save of partially loaded documents, EHU fail status coverage and relation-code enforcement remain incomplete. A preview must never be treated as the entire file when saving.
