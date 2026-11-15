// ChunkLoaderUI: default-on, newline-aligned virtual byte windows.
import { readWindow } from 'ocda/chunk-property';

export function createChunkLoaderUI({
  hub, properties, root = document, onLoaded, beforeNavigate
}) {
  const get = (id) => root.getElementById(id);
  let file = null;
  let active = null;
  let last = null;

  function progress(loaded, total, label) {
    const percent = total ? Math.round(loaded / total * 100) : 100;
    if (get('meterFill')) get('meterFill').style.width =
      percent + '%';
    if (get('meterPercent')) {
      get('meterPercent').hidden = false;
      get('meterPercent').textContent = percent + '%';
    }
    if (get('status')) get('status').textContent = label;
  }

  async function navigate(offset = 0) {
    if (!file) return { status: 400, result: 'FAIL' };
    if (last && beforeNavigate?.() === false) {
      return { status: 409, result: 'FAIL' };
    }
    active?.abort();
    const controller = new AbortController();
    active = controller;
    progress(0, 1, '讀取切片中…');
    hub.dispatch('ChunkLoaderUI', 'ChunkLoading', 'WINDOW_START',
      { offset });
    try {
      const window = await readWindow(file, offset, controller.signal);
      if (active !== controller) {
        return { status: 409, result: 'FAIL' };
      }
      last = { name: file.name, file, ...window };
      onLoaded?.(last);
      progress(window.byteEnd, file.size, '切片已載入');
      hub.dispatch('ChunkLoaderUI', 'ChunkLoading', 'WINDOW_READY',
        { start: window.byteStart, end: window.byteEnd });
      return { status: 200, result: 'PASS', ...last };
    } catch (error) {
      const status = error.name === 'AbortError' ? 409 : 500;
      progress(0, 1, '載入失敗');
      hub.omu.record({
        type: 'EHU', source: 'ChunkLoaderUI',
        target: 'ChunkLoading', action: 'WINDOW_FAILED',
        result: 'FAIL', status, detail: String(error)
      });
      return { status, result: 'FAIL', error: String(error) };
    } finally {
      if (active === controller) active = null;
    }
  }

  function reset() {
    active?.abort();
    file = null;
    last = null;
    progress(0, 1, '就緒');
  }

  function load(nextFile) {
    if (!(nextFile instanceof Blob)) {
      return Promise.resolve({ status: 400, result: 'FAIL' });
    }
    file = nextFile;
    last = null;
    return navigate(0);
  }

  get('fileInput')?.addEventListener('change', (event) => {
    const selected = event.target.files?.[0];
    if (selected) void load(selected);
    event.target.value = '';
  });
  root.querySelector('[data-action="open"]')
    ?.addEventListener('click', () => get('fileInput')?.click());

  properties.set('ChunkLoading', true);
  return {
    load, navigate, reset, cancel: () => active?.abort(),
    getState: () => ({
      enabled: true,
      last: last && {
        name: last.name, byteStart: last.byteStart,
        byteEnd: last.byteEnd, totalBytes: last.totalBytes
      }
    })
  };
}
