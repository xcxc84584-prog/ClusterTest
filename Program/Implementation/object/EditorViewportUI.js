// EditorViewportUI: visible line numbers and sequential window paging.
export function createEditorViewportUI({
  hub, properties, root = document, loader
}) {
  const get = (id) => root.getElementById(id);
  const editor = get('editor');
  const gutter = get('gutter');
  const history = [];
  let startLine = 1;
  let windowStart = 0;
  let windowEnd = 0;
  let totalBytes = 0;
  let busy = false;
  let scheduled = false;

  function render() {
    if (!editor || !gutter) return;
    const text = editor.value;
    let lineCount = 1;
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) === 10) lineCount++;
    }
    const style = getComputedStyle(editor);
    const lineHeight = Number.parseFloat(style.lineHeight) ||
      Number.parseFloat(style.fontSize) * 1.5 || 20;
    const first = Math.max(0,
      Math.floor(editor.scrollTop / lineHeight) - 3);
    const count = Math.ceil(editor.clientHeight / lineHeight) + 8;
    const end = Math.min(lineCount, first + count);
    const numbers = [];
    for (let line = first; line < end; line++) {
      numbers.push(String(startLine + line));
    }
    gutter.textContent = numbers.join('\n');
    gutter.style.paddingTop = (first * lineHeight) + 'px';
    gutter.scrollTop = editor.scrollTop;
    if (get('position')) {
      const caret = editor.selectionStart;
      const prefix = text.slice(0, caret);
      let localLine = 1;
      let lastBreak = -1;
      for (let i = 0; i < prefix.length; i++) {
        if (prefix.charCodeAt(i) === 10) {
          localLine++;
          lastBreak = i;
        }
      }
      const column = prefix.length - lastBreak;
      get('position').textContent =
        'Ln ' + (startLine + localLine - 1) +
        ', Col ' + column;
    }
    properties.set('VisibleLineRange', {
      first: startLine + first, last: startLine + end - 1
    });
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      render();
    });
  }

  function receive(data) {
    if (data.byteStart === 0) {
      history.length = 0;
      startLine = 1;
    }
    windowStart = data.byteStart;
    windowEnd = data.byteEnd;
    totalBytes = data.totalBytes;
    schedule();
  }

  async function next() {
    if (busy || windowEnd >= totalBytes) return;
    busy = true;
    const oldText = editor.value;
    const oldEnd = windowEnd;
    const oldStart = windowStart;
    const oldLine = startLine;
    const result = await loader.navigate(oldEnd);
    if (result.status === 200 && result.byteStart > oldStart) {
      history.push({ offset: oldStart, line: oldLine });
      let lines = 0;
      for (let i = 0; i < oldText.length; i++) {
        if (oldText.charCodeAt(i) === 10) lines++;
      }
      startLine = oldLine + lines;
      render();
    }
    busy = false;
  }

  async function previous() {
    if (busy || !history.length) return;
    busy = true;
    const previousWindow = history[history.length - 1];
    const result = await loader.navigate(previousWindow.offset);
    if (result.status === 200) {
      history.pop();
      startLine = previousWindow.line;
      render();
    }
    busy = false;
  }

  editor?.addEventListener('input', schedule);
  editor?.addEventListener('click', schedule);
  editor?.addEventListener('keyup', schedule);
  editor?.addEventListener('scroll', schedule, { passive: true });
  editor?.addEventListener('wheel', (event) => {
    if (event.deltaY > 0 &&
        editor.scrollTop + editor.clientHeight >=
        editor.scrollHeight - 2) {
      void next();
    } else if (event.deltaY < 0 && editor.scrollTop <= 0) {
      void previous();
    }
  }, { passive: true });
  hub.dispatch('EditorViewportUI', 'VisibleLineRange',
    'VIEWPORT_READY');
  return { receive, next, previous, render };
}
