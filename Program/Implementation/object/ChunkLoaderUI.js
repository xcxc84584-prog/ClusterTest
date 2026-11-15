// ChunkLoaderUI: user-selected files, bounded preview, cancel switch.
import { readFileChunks } from 'ocda/chunk-property';

export function createChunkLoaderUI({
  hub, properties, root = document, onLoaded
}) {
  const get = (id) => root.getElementById(id);
  const enabled = true;
  let active = null;
  let last = null;

  async function load(file) {
    if (!file) return { status: 400, result: 'FAIL' };
    active?.abort();
    const controller = new AbortController();
    active = controller;
    hub.dispatch('ChunkLoaderUI', 'ChunkLoading', 'LOAD_START',
      { name: file.name, size: file.size });
    try {
      // Off uses one bounded read, never a multi-GiB allocation.
      const result = await readFileChunks(
        file, null, controller.signal
      );
      if (controller !== active) return {
        status: 409, result: 'FAIL'
      };
      last = { name: file.name, ...result };
      onLoaded?.(last);
      hub.dispatch('ChunkLoaderUI', 'ChunkLoading', 'LOAD_COMPLETE',
        { bytesRead: result.bytesRead, complete: result.complete });
      return { status: 200, result: 'PASS', ...last };
    } catch (error) {
      hub.dispatch('ChunkLoaderUI', 'ChunkLoading', 'LOAD_FAILED',
        { error: String(error) });
      return { status: error.name === 'AbortError' ? 409 : 500,
        result: 'FAIL', error: String(error) };
    } finally {
      if (active === controller) active = null;
    }
  }

  get('fileInput')?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) void load(file);
    event.target.value = '';
  });
  root.querySelector('[data-action="open"]')
    ?.addEventListener('click', () => get('fileInput')?.click());
  properties.set('ChunkLoading', enabled);
  return {
    load, cancel: () => active?.abort(),
    getState: () => ({ enabled, last: last && {
      name: last.name, bytesRead: last.bytesRead,
      totalBytes: last.totalBytes, complete: last.complete
    } })
  };
}
