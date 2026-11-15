// PaletteUI: existing ClusterOpt dialog; no replacement markup.
import { makePalette, parseHex } from 'ocda/palette-property';

const STORAGE_KEY = 'cluster.ocda.palette';
const DEFAULT = Object.freeze({ hex: '#000000', mode: 'dark' });

export function createPaletteUI({ hub, properties, root = document }) {
  const get = (id) => root.getElementById(id);
  let state = { ...DEFAULT };

  function apply(next, persist = true) {
    const tokens = makePalette(next.hex, next.mode);
    if (!tokens) return { status: 400, result: 'FAIL' };
    const event = hub.dispatch(
      'PaletteUI', 'UIPalette', 'SET_PALETTE', { ...next }
    );
    if (event.result !== 'PASS') return event;
    state = { ...next };
    for (const [key, value] of Object.entries(tokens)) {
      root.documentElement.style.setProperty(key, value);
    }
    root.documentElement.dataset.paletteMode = state.mode;
    properties.set('UIPalette', { ...state });
    if (get('palettePicker')) get('palettePicker').value = state.hex;
    if (get('paletteHex')) get('paletteHex').textContent =
      state.hex.toUpperCase();
    if (get('paletteMode')) get('paletteMode').textContent =
      state.mode.toUpperCase();
    root.querySelectorAll('[data-rgb]').forEach((input) => {
      const channels = parseHex(state.hex);
      input.value = channels[Number(input.dataset.rgb)];
    });
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        hub.dispatch('PaletteUI', 'UIPalette', 'STORAGE_FAILED',
          { message: String(error) });
      }
    }
    return { ...event, status: 200, state: { ...state } };
  }

  function open() {
    const dialog = get('paletteDialog');
    if (!dialog) return { status: 404, result: 'FAIL' };
    try {
      if (!dialog.open) dialog.showModal();
    } catch (error) {
      return { status: 500, result: 'FAIL', error: String(error) };
    }
    hub.dispatch('PaletteUI', 'UIPalette', 'OPEN_SETTINGS');
    return { status: 200, result: 'PASS', visible: dialog.open };
  }

  function close() {
    const dialog = get('paletteDialog');
    if (dialog?.open) dialog.close();
  }

  function setHex(hex) {
    return apply({ ...state, hex: hex.toLowerCase() });
  }

  function setMode(mode) {
    return apply({ ...state, mode });
  }

  get('paletteBtn')?.addEventListener('click', open);
  for (const id of ['paletteClose', 'paletteDone']) {
    get(id)?.addEventListener('click', close);
  }
  get('palettePicker')?.addEventListener('input', (event) => {
    setHex(event.target.value);
  });
  root.querySelectorAll('[data-rgb]').forEach((input) => {
    input.addEventListener('change', () => {
      const values = [...root.querySelectorAll('[data-rgb]')]
        .sort((a, b) => Number(a.dataset.rgb) - Number(b.dataset.rgb))
        .map((node) => Math.max(0, Math.min(255,
          Number(node.value) || 0)));
      setHex('#' + values.map((value) =>
        Math.round(value).toString(16).padStart(2, '0')
      ).join(''));
    });
  });
  get('paletteDark')?.addEventListener('click', () => setMode('dark'));
  get('paletteLight')?.addEventListener('click', () => setMode('light'));

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && makePalette(saved.hex, saved.mode)) {
      state = { hex: saved.hex, mode: saved.mode };
    }
  } catch {
    // Invalid or inaccessible local storage must not break the UI.
  }
  apply(state, false);
  return { open, close, setHex, setMode, getState: () => ({ ...state }) };
}
