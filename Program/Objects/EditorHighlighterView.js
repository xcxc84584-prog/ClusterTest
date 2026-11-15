import { detectSyntax } from './SyntaxHighlighter.js';

/** Render a bounded document window; never parse arbitrary Shiki HTML into input. */
export class EditorHighlighterView {
  constructor(editor, overlay, engine, onStatus = () => {}) {
    this.editor = editor;
    this.overlay = overlay;
    this.engine = engine;
    this.onStatus = onStatus;
    this.enabled = true;
    this.performance = true;
    this.timer = null;
    this.revision = 0;
  }
  schedule(name, theme = 'github-dark') {
    clearTimeout(this.timer);
    const revision = ++this.revision;
    this.editor.classList.remove('highlight-active');
    this.overlay.replaceChildren();
    if (!this.enabled || !name) return;
    // Full overlay is intentionally bounded until virtualized editor lands.
    if (this.editor.value.length > 200000) return;
    this.timer = setTimeout(async () => {
      const language = detectSyntax(name);
      if (language === 'text') return;
      this.onStatus('loading');
      try {
        const html = await this.engine.highlight(
          this.editor.value, language, theme
        );
        if (revision !== this.revision || !html) return;
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const code = parsed.querySelector('pre code');
        if (!code) return;
        const fragment = document.createDocumentFragment();
        // Preserve only text and colors; never insert untrusted HTML.
        const append = (node, parent) => {
          if (node.nodeType === Node.TEXT_NODE) {
            parent.append(document.createTextNode(node.textContent));
            return;
          }
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const span = document.createElement('span');
          const color = node.style?.color;
          if (color && CSS.supports('color', color)) {
            span.style.color = color;
          }
          for (const child of node.childNodes) append(child, span);
          parent.append(span);
        };
        const lines = code.querySelectorAll(':scope > .line');
        if (lines.length) {
          lines.forEach((line, index) => {
            for (const child of line.childNodes) append(child, fragment);
            if (index < lines.length - 1) {
              fragment.append(document.createTextNode('\n'));
            }
          });
        } else {
          for (const child of code.childNodes) append(child, fragment);
        }
        this.overlay.replaceChildren(fragment);
        this.overlay.scrollTop = this.editor.scrollTop;
        this.overlay.scrollLeft = this.editor.scrollLeft;
        this.editor.classList.add('highlight-active');
        this.onStatus('ready');
      } catch {
        if (revision !== this.revision) return;
        this.editor.classList.remove('highlight-active');
        this.onStatus('error');
      }
    }, 120);
  }
  scroll() {
    this.overlay.scrollTop = this.editor.scrollTop;
    this.overlay.scrollLeft = this.editor.scrollLeft;
  }
  dispose() {
    clearTimeout(this.timer);
    this.revision++;
    this.editor.classList.remove('highlight-active');
    this.overlay.replaceChildren();
  }
}
