// HighlighterUI: bounded rendering, preserving the original editor DOM.
import { highlight } from '../property/highlighter.js';

export function createHighlighterUI({ hub, properties, root = document }) {
  const get = (id) => root.getElementById(id);
  const editor = get('editor');
  const overlay = get('highlightOverlay');
  let enabled = true;
  let performance = false;
  let frame = 0;
  let shortcut = 'Ctrl+Shift+H';

  function render() {
    if (!editor || !overlay) return;
    // Bounded fallback prevents long synchronous tokenization stalls.
    const source = editor.value;
    const bounded = source.length > 131072;
    const safeText = bounded ? source.slice(0, 131072) : source;
    overlay.innerHTML = enabled ? highlight(safeText) : '';
    overlay.scrollTop = editor.scrollTop;
    overlay.scrollLeft = editor.scrollLeft;
    const state = get('highlighterState');
    if (state && bounded) {
      state.textContent = 'Preview limited to 128 KiB';
    }
  }
  function schedule() {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = 0;
      render();
    });
  }
  function setEnabled(next) {
    const response = hub.dispatch(
      'HighlighterUI', 'SyntaxHighlight', 'SET_ENABLED',
      { enabled: Boolean(next) }
    );
    if (response.result !== 'PASS') return response;
    enabled = Boolean(next);
    properties.set('SyntaxHighlight', enabled);
    if (get('highlighterEnabled')) {
      get('highlighterEnabled').checked = enabled;
    }
    schedule();
    return { ...response, status: 200 };
  }
  function open() {
    hub.dispatch('HighlighterUI', 'SyntaxHighlight', 'OPEN_SETTINGS');
    get('highlighterDialog')?.showModal();
  }
  function bind() {
    editor?.addEventListener('input', schedule);
    editor?.addEventListener('scroll', () => {
      if (overlay) {
        overlay.scrollTop = editor.scrollTop;
        overlay.scrollLeft = editor.scrollLeft;
      }
    }, { passive: true });
    get('highlighterEnabled')?.addEventListener(
      'change', (event) => setEnabled(event.target.checked)
    );
    get('highlighterPerformance')?.addEventListener(
      'change', (event) => {
        performance = event.target.checked;
        properties.set('HighlightPerformance', performance);
        schedule();
      }
    );
    get('highlighterBtn')?.addEventListener('click', open);
    for (const id of ['highlighterDone', 'highlighterClose']) {
      get(id)?.addEventListener('click', () => {
        get('highlighterDialog')?.close();
      });
    }
    const input = get('highlighterShortcutInput');
    if (input) {
      input.value = shortcut;
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          input.value = shortcut;
          return;
        }
        if (!event.ctrlKey || event.altKey || event.metaKey ||
          !/^[a-z0-9]$/i.test(event.key)) return;
        event.preventDefault();
        input.value = 'Ctrl+' +
          (event.shiftKey ? 'Shift+' : '') +
          event.key.toUpperCase();
        get('highlighterShortcutSave').disabled = false;
      });
    }
    get('highlighterShortcutSave')?.addEventListener('click', () => {
      shortcut = input.value;
      properties.set('HighlightShortcut', shortcut);
      get('highlighterShortcutSave').disabled = true;
    });
    get('highlighterShortcutReset')?.addEventListener('click', () => {
      shortcut = 'Ctrl+Shift+H';
      input.value = shortcut;
      properties.set('HighlightShortcut', shortcut);
      get('highlighterShortcutSave').disabled = true;
    });
    editor?.addEventListener('keydown', (event) => {
      const pressed = 'Ctrl+' +
        (event.shiftKey ? 'Shift+' : '') +
        event.key.toUpperCase();
      if (event.ctrlKey && pressed === shortcut) {
        event.preventDefault();
        setEnabled(!enabled);
      }
    });
  }
  bind();
  return { render: schedule, setEnabled, open,
    getEnabled: () => enabled };
}
