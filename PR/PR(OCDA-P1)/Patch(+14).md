# Patch +14 — Explorer interactions, tab close and original-path save

## Implementation
- Open: use showOpenFilePicker in supporting secure-context browsers; store permissioned FileSystemFileHandle per file session. Fallback HTML file input is read-only (no original-path overwrite).
- Save: assemble unchanged Blob ranges and patches; createWritable/write/close on the original handle. Save As invokes showSaveFilePicker. No automatic download fallback; unsupported API reports 501 FAIL.
- Explorer: enable filename search and click-to-select; tabs now show close controls, confirm on dirty close.
- On save: refresh source Blob and tab file identity, clear old patches after write.
- LinkCore version OCDA-P14.

## Security and permissions
- Browser requires secure context, user gesture, and may prompt for file access. No absolute paths, stored credentials, or hidden disk writes. Permissioned handles remain only in runtime memory.

## Event chain / EHU
File open -> picker -> ChunkLoaderUI -> FileOperationsUI.setHandle -> FileTabsUI.
Save -> FileOperationsUI.assemble -> createWritable -> write -> close -> reload -> HubUnit/OMU.
Errors: OPEN_FAILED 500; SAVE_NO_HANDLE 501; SAVE_CANCELLED 409; SAVE_FAILED 500; TAB_CLOSE_CANCELLED 409.

## Pending verification
No browser E2E performed. Folder tree, directory permissions, bulk close, multiple file selection, permission persistence, direct disk write stress tests and File System Access compatibility require further work.
