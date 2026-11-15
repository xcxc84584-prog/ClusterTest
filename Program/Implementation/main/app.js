// OCDA P2 bootstrap: UI adapters communicate through LinkCore.
import { LinkCore } from 'ocda/linkcore';
import { createLanguageUI } from 'ocda/language-ui';
import { createHighlighterUI } from 'ocda/highlighter-ui';
import { createPaletteUI } from 'ocda/palette-ui';
import { createChunkLoaderUI } from 'ocda/chunk-ui';

const { URU, OMU, EDPMU, Hub } = LinkCore;
const get = (id) => document.getElementById(id);
for (const name of ['LanguageUI', 'HighlighterUI', 'EditorUI', 'PaletteUI', 'ChunkLoaderUI']) {
  URU.register(name);
}
for (const name of [
  'Language', 'SyntaxHighlight', 'Version',
  'HighlightShortcut', 'HighlightPerformance', 'UIPalette', 'ChunkLoading'
]) {
  URU.register(name, 'Property');
}
LinkCore.publishVersion();
const language = createLanguageUI({ hub: Hub, properties: EDPMU });
const highlighter = createHighlighterUI({
  hub: Hub, properties: EDPMU
});
const palette = createPaletteUI({ hub: Hub, properties: EDPMU });
const chunks = createChunkLoaderUI({
  hub: Hub, properties: EDPMU,
  onLoaded: ({ text, name, complete, bytesRead, totalBytes }) => {
    get('editorPane').hidden = false;
    get('empty').hidden = true;
    get('editor').value = text;
    get('gutter').textContent = String(
      text.split('\n').length
    );
    get('editor').dispatchEvent(new Event('input'));
    OMU.record({ type: 'Log', source: 'ChunkLoaderUI',
      target: 'EditorUI', action: 'PREVIEW_READY', result: 'PASS',
      status: 200, detail: { name, complete, bytesRead, totalBytes }
    });
  }
});

function toggle(id, buttonId) {
  const node = get(id);
  if (!node) return;
  node.hidden = !node.hidden;
  if (buttonId) {
    get(buttonId)?.setAttribute('aria-expanded', String(!node.hidden));
  }
}
get('menuBtn')?.addEventListener('click', () => toggle('menu', 'menuBtn'));
get('toolBtn')?.addEventListener(
  'click', () => toggle('toolOptions', 'toolBtn')
);
get('languageBtn')?.addEventListener(
  'click', () => toggle('languageOptions', 'languageBtn')
);
document.querySelectorAll('[data-locale]').forEach((button) => {
  button.addEventListener('click', () => {
    language.setLocale(button.dataset.locale);
    get('languageOptions').hidden = true;
    get('languageBtn').setAttribute('aria-expanded', 'false');
  });
});
function sample() {
  const editor = get('editor');
  if (!editor) return;
  get('editorPane').hidden = false;
  get('empty').hidden = true;
  editor.value = [
    '// OCDA syntax test',
    'const greet = "Hello Cluster";',
    'function demo() {',
    '    return greet;',
    '}',
    ''
  ].join('\n');
  get('gutter').textContent = '1\n2\n3\n4\n5\n6';
  highlighter.render();
}
document.querySelectorAll('[data-action="new"]').forEach((button) => {
  button.addEventListener('click', () => {
    sample();
    get('menu').hidden = true;
  });
});
get('editor')?.addEventListener('input', () => {
  const count = get('editor').value.split('\n').length;
  get('gutter').textContent = Array.from(
    { length: Math.min(count, 5000) },
    (_, index) => String(index + 1)
  ).join('\n');
});
window.Cluster = Object.freeze({
  log: () => OMU.log(),
  objectlist: () => URU.list().filter((x) => x.kind === 'Object'),
  propertylist: () => URU.list().filter((x) => x.kind === 'Property'),
  rep: () => OMU.log().filter((x) => x.type === 'Response'),
  subobject: () => [],
  version: () => LinkCore.version(),
  locale: () => language.getLocale(),
  highlight: () => highlighter.getEnabled(),
  openHighlighter: () => highlighter.open(),
  openPalette: () => palette.open(),
  palette: () => palette.getState(),
  setPalette: (hex) => palette.setHex(hex),
  paletteMode: (mode) => palette.setMode(mode),
  chunkLoading: () => chunks.getState(),
  setChunkLoading: (enabled) => chunks.setEnabled(enabled),
  loadFile: (file) => chunks.load(file)
});
window.VTE = Object.freeze({
  log: () => OMU.log(),
  C: (name) => URU.register(name),
  U: (name, value) => EDPMU.set(name, value),
  D: (name) => URU.unregister(name),
  A: (source, target, action) => Hub.simulate(source, target, action)
});
language.setLocale('zh-Hant');
sample();
