// FileOperationsUI: sparse AVL patch index and lossless Blob export.
import { PatchTree } from 'ocda/patch-tree';
export function createFileOperationsUI({
  hub, properties, root = document
}) {
  const get = (id) => root.getElementById(id);
  const editor = get('editor');
  let name = 'untitled.txt';
  let source = null;
  let fileHandle = null;
  let current = null;
  let dirty = false;
  let loaded = false;
  let programmatic = false;
  let onReset = () => {};
  let onNew = () => {};
  let beforeNew = () => {};
  let onClose = () => {};
  let onSaved = async () => {};
  const patches = new PatchTree();

  function emit(action, status = 200, detail = {}) {
    const result = status < 400 ? 'PASS' : 'FAIL';
    const event = hub.dispatch(
      'FileOperationsUI', 'FileState', action, detail
    );
    if (result === 'FAIL') hub.omu.record({
      type: 'EHU', source: 'FileOperationsUI',
      target: 'FileState', action, result, status, detail
    });
    return { ...event, status, result };
  }

  function getState() {
    return {
      name, dirty, loaded, writable: Boolean(fileHandle),
      windows: patches.size,
      byteStart: current?.byteStart ?? 0,
      byteEnd: current?.byteEnd ?? 0,
      totalBytes: source?.size ?? 0
    };
  }

  function publish() {
    properties.set('FileState', getState());
    if (get('filename')) get('filename').textContent = name;
    if (get('syncLabel')) get('syncLabel').textContent =
      dirty ? 'MODIFIED' : 'READY';
  }

  function show(text) {
    get('editorPane').hidden = false;
    get('empty').hidden = true;
    programmatic = true;
    editor.value = text;
    editor.scrollTop = 0;
    editor.dispatchEvent(new Event('input'));
    programmatic = false;
  }

  function remember() {
    if (!current || !dirty) return;
    patches.set(current.byteStart, {
      start: current.byteStart, end: current.byteEnd,
      text: editor.value
    });
  }

  function canNavigate() {
    remember();
    return true;
  }

  function receive(data) {
    if (source !== data.file) {
      patches.clear();
      source = data.file;
      name = data.name || 'untitled.txt';
      dirty = false;
    }
    current = {
      byteStart: data.byteStart,
      byteEnd: data.byteEnd
    };
    loaded = true;
    const replacement = patches.get(data.byteStart);
    show(replacement ? replacement.text : data.text);
    publish();
    return emit('OPEN_WINDOW', 200, { ...current });
  }

  function snapshot() {
    remember();
    return {
      name, source, fileHandle,
      current: current && { ...current },
      dirty, loaded, text: editor.value,
      patches: [...patches.entries()]
    };
  }

  function restore(state) {
    source = state.source;
    fileHandle = state.fileHandle || null;
    current = state.current && { ...state.current };
    name = state.name;
    dirty = state.dirty;
    loaded = state.loaded;
    patches.clear();
    for (const [key, value] of state.patches) {
      patches.set(key, value);
    }
    if (loaded) show(state.text);
    else {
      get('editorPane').hidden = true;
      get('empty').hidden = false;
    }
    publish();
  }

  function newFile() {
    if (dirty && !confirm('未儲存的變更將遺失，確定繼續？')) {
      return emit('NEW_CANCELLED', 409);
    }
    beforeNew();
    onReset();
    source = null;
    fileHandle = null;
    current = null;
    patches.clear();
    name = 'untitled.txt';
    dirty = false;
    loaded = true;
    show('');
    publish();
    onNew();
    return emit('NEW_FILE');
  }

  function close() {
    if (dirty && !confirm('未儲存的變更將遺失，確定關閉？')) {
      return emit('CLOSE_CANCELLED', 409);
    }
    source = null;
    current = null;
    patches.clear();
    dirty = false;
    loaded = false;
    name = 'untitled.txt';
    get('editorPane').hidden = true;
    get('empty').hidden = false;
    publish();
    onClose();
    return emit('CLOSE_FILE');
  }

  function assemble() {
    remember();
    if (!source) return new Blob([editor.value], {
      type: 'text/plain;charset=utf-8'
    });
    const ordered = patches.values();
    const parts = [];
    let offset = 0;
    for (const patch of ordered) {
      if (patch.start < offset || patch.end > source.size) {
        throw new Error('OVERLAPPING_WINDOW');
      }
      parts.push(source.slice(offset, patch.start));
      parts.push(patch.text);
      offset = patch.end;
    }
    parts.push(source.slice(offset));
    return new Blob(parts, { type: 'text/plain;charset=utf-8' });
  }

  async function save(as = false) {
    if (!loaded) return emit('SAVE_NO_FILE', 400);
    const target = name;
    const safeName = target.replace(/[\\/\x00-\x1f]/g, '_');
    let blob;
    try {
      blob = assemble();
    } catch (error) {
      return emit('SAVE_ASSEMBLY_FAILED', 500, {
        error: String(error)
      });
    }
    try {
      let targetHandle = as ? null : fileHandle;
      if (!targetHandle && 'showSaveFilePicker' in window) {
        targetHandle = await window.showSaveFilePicker({
          suggestedName: safeName
        });
      }
      if (!targetHandle) {
        return emit('SAVE_NO_HANDLE', 501, {
          reason: 'FILE_SYSTEM_ACCESS_UNAVAILABLE'
        });
      }
      const writable = await targetHandle.createWritable();
      try {
        await writable.write(blob);
        await writable.close();
      } catch (error) {
        await writable.abort().catch(() => {});
        throw error;
      }
      fileHandle = targetHandle;
      name = targetHandle.name;
      // Rebase after a successful write to avoid duplicate patches.
      source = await targetHandle.getFile();
      patches.clear();
      dirty = false;
      current = null;
      loaded = true;
      await onSaved(source);
      publish();
      return emit('SAVE_DISK_COMPLETE', 200, {
        name, size: blob.size
      });
    } catch (error) {
      const cancelled = error.name === 'AbortError';
      return emit(cancelled ? 'SAVE_CANCELLED' : 'SAVE_FAILED',
        cancelled ? 409 : 500, { error: String(error) });
    }
  }

  editor?.addEventListener('input', () => {
    if (!loaded || programmatic) return;
    dirty = true;
    publish();
  });
  const actions = {
    new: newFile, save: () => save(false),
    saveas: () => save(true),
    close, closeall: close
  };
  for (const [action, handler] of Object.entries(actions)) {
    root.querySelectorAll('[data-action="' + action + '"]')
      .forEach((button) => button.addEventListener('click', () => {
        Promise.resolve(handler()).then((response) => {
          if (response.status === 200 && get('menu')) {
            get('menu').hidden = true;
          }
        });
      }));
  }
  publish();
  return {
    receive, newFile, close, save, getState, canNavigate,
    setHandle: (handle) => { fileHandle = handle; },
    snapshot, restore,
    setOnReset: (callback) => { onReset = callback; },
    setOnNew: (callback) => { onNew = callback; },
    setBeforeNew: (callback) => { beforeNew = callback; },
    setOnClose: (callback) => { onClose = callback; },
    setOnSaved: (callback) => { onSaved = callback; }
  };
}
