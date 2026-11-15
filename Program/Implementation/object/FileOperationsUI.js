// FileOperationsUI: native file actions with partial-preview safety.
export function createFileOperationsUI({
  hub, properties, root = document, getLoader
}) {
  const get = (id) => root.getElementById(id);
  const editor = get('editor');
  let name = 'untitled.txt';
  let partial = false;
  let dirty = false;
  let loaded = false;

  function emit(action, status = 200, detail = {}) {
    const result = status < 400 ? 'PASS' : 'FAIL';
    const event = hub.dispatch(
      'FileOperationsUI', 'FileState', action, detail
    );
    if (result === 'FAIL') {
      hub.omu.record({
        type: 'EHU', source: 'FileOperationsUI',
        target: 'FileState', action, result, status, detail
      });
    }
    return { ...event, status, result };
  }

  function setState(next) {
    properties.set('FileState', { ...next });
  }

  function show(text) {
    get('editorPane').hidden = false;
    get('empty').hidden = true;
    editor.value = text;
    editor.dispatchEvent(new Event('input'));
  }

  function receive(data) {
    name = data.name || 'untitled.txt';
    partial = !data.complete;
    dirty = false;
    loaded = true;
    show(data.text);
    dirty = false;
    setState(getState());
    return emit('OPEN_FILE', 200, {
      name, partial, bytesRead: data.bytesRead,
      totalBytes: data.totalBytes
    });
  }

  function newFile() {
    if (dirty && !confirm('未儲存的變更將遺失，確定繼續？')) {
      return emit('NEW_CANCELLED', 409);
    }
    name = 'untitled.txt';
    partial = false;
    dirty = false;
    loaded = true;
    show('');
    dirty = false;
    setState(getState());
    return emit('NEW_FILE');
  }

  function close() {
    if (dirty && !confirm('未儲存的變更將遺失，確定關閉？')) {
      return emit('CLOSE_CANCELLED', 409);
    }
    loaded = false;
    dirty = false;
    partial = false;
    name = 'untitled.txt';
    get('editorPane').hidden = true;
    get('empty').hidden = false;
    setState(getState());
    return emit('CLOSE_FILE');
  }

  function save(as = false) {
    if (!loaded) return emit('SAVE_NO_FILE', 400);
    // A partial preview must never overwrite the source file.
    if (partial) return emit('SAVE_PARTIAL_BLOCKED', 409, {
      reason: 'Only the first preview segment is loaded'
    });
    const target = as
      ? prompt('另存新檔名稱', name) : name;
    if (!target) return emit('SAVE_CANCELLED', 409);
    const safeName = target.replace(/[\\/\x00-\x1f]/g, '_');
    const blob = new Blob([editor.value], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    try {
      const anchor = root.createElement('a');
      anchor.href = url;
      anchor.download = safeName;
      anchor.click();
      name = safeName;
      dirty = false;
      setState(getState());
      return emit('SAVE_DOWNLOAD', 200, { name, size: blob.size });
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  function getState() {
    return { name, partial, dirty, loaded };
  }

  editor?.addEventListener('input', () => {
    if (!loaded) return;
    dirty = true;
    setState(getState());
  });
  const actions = {
    new: newFile,
    save: () => save(false),
    saveas: () => save(true),
    close,
    closeall: close
  };
  for (const [action, handler] of Object.entries(actions)) {
    root.querySelectorAll('[data-action="' + action + '"]')
      .forEach((button) => button.addEventListener('click', () => {
        const result = handler();
        if (result.status === 200 && get('menu')) {
          get('menu').hidden = true;
        }
      }));
  }
  setState(getState());
  return { receive, newFile, close, save, getState };
}
