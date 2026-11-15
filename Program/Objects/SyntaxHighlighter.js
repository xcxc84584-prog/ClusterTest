/**
 * Shiki adapter. No editor state is owned here.
 * A failed CDN load degrades to plain text without modifying the document.
 */
const EXTENSIONS = Object.freeze({
  js: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', jsx: 'jsx', tsx: 'tsx', py: 'python',
  c: 'c', h: 'cpp', cpp: 'cpp', cc: 'cpp', hpp: 'cpp',
  java: 'java', rs: 'rust', go: 'go', cs: 'csharp',
  html: 'html', htm: 'html', css: 'css', json: 'json',
  md: 'markdown', yaml: 'yaml', yml: 'yaml',
  sh: 'bash', ps1: 'powershell', sql: 'sql',
  xml: 'xml', svg: 'xml'
});
const SHIKI_URL = 'https://esm.sh/shiki@3.15.0';
export function detectSyntax(name = '') {
  const extension = name.toLowerCase().split('.').pop();
  return EXTENSIONS[extension] ?? 'text';
}
export class SyntaxHighlighter {
  #engine = null;
  #pending = null;
  #generation = 0;
  async #load() {
    if (this.#engine) return this.#engine;
    if (!this.#pending) {
      this.#pending = import(SHIKI_URL).then(module => {
        this.#engine = module;
        return module;
      }).catch(error => {
        this.#pending = null;
        throw error;
      });
    }
    return this.#pending;
  }
  invalidate() { return ++this.#generation; }
  async highlight(text, language, theme = 'github-dark') {
    const generation = this.invalidate();
    const engine = await this.#load();
    const html = await engine.codeToHtml(text, {
      lang: language, theme
    });
    if (generation !== this.#generation) return null;
    return html;
  }
}
