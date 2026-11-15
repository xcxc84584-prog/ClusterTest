# Patch +9 — Always-on chunk loading and basic file operations

## Scope
- Removed chunk-loading toggle from File Tool. Chunk reading is always enabled.
- Added independent FileOperationsUI object, FileState property and LinkCore registration.
- File menu: new, open, save (browser download), save as, close and close all (single-editor only).
- Initial editor sample removed. Open uses existing file input and 64 KiB chunk decoder.
- Loading >1 MiB is **preview-only**. Saving partial previews is blocked with 409 to prevent data loss.
- Unsaved changes require confirmation before new/close.

## Architecture / event chain
File menu -> FileOperationsUI -> HubUnit -> OMU / EDPMU -> FileState.
Open -> ChunkLoaderUI -> chunkLoading Property -> FileOperationsUI.receive -> editor.

## Security / performance
No server upload, no absolute paths or credentials. 64 KiB slices and 1 MiB cap, UTF-8 streaming decoder. Downloads are explicit; no silent disk overwrites. User input enters textarea.value, not HTML.

## Known limitations
Not full virtual paging or multi-file tabs; >1 MiB file cannot yet be completely edited/saved. No native disk writeback, only download. Browser and relation tests pending.
