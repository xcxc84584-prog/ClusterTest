// OCDA P2 bootstrap: UI adapters communicate through LinkCore.
import { LinkCore } from 'ocda/linkcore';
import { createLanguageUI } from 'ocda/language-ui';
import { createHighlighterUI } from 'ocda/highlighter-ui';
import { createPaletteUI } from 'ocda/palette-ui';
import { createChunkLoaderUI } from 'ocda/chunk-ui';
import { createFileOperationsUI } from 'ocda/file-ui';
import { createEditorViewportUI } from 'ocda/viewport-ui';
import { createFileTabsUI } from 'ocda/tabs-ui';

const { URU, OMU, EDPMU, Hub } = LinkCore;
const get = (id) => document.getElementById(id);
for (const name of ['LanguageUI', 'HighlighterUI', 'EditorUI', 'PaletteUI', 'ChunkLoaderUI', 'FileOperationsUI',
  'EditorViewportUI', 'FileTabsUI']) {
  URU.register(name);
}
for (const name of [
  'Language', 'SyntaxHighlight', 'Version',
  'HighlightShortcut', 'HighlightPerformance', 'UIPalette', 'ChunkLoading', 'FileState', 'VisibleLineRange', 'OpenFileTabs'
]) {
  URU.register(name, 'Property');
}
LinkCore.publishVersion();
const language = createLanguageUI({ hub: Hub, properties: EDPMU });
const highlighter = createHighlighterUI({
  hub: Hub, properties: EDPMU
});
const palette = createPaletteUI({ hub: Hub, properties: EDPMU });
const files = createFileOperationsUI({
  hub: Hub, properties: EDPMU
});
let viewport;
let tabs;
const chunks = createChunkLoaderUI({
  hub: Hub, properties: EDPMU,
  beforeNavigate: () => files.canNavigate(),
  beforeOpen: () => tabs?.beforeOpen(),
  onLoaded: (data) => {
    files.receive(data);
    viewport?.receive(data);
    tabs?.opened(data);
  }
});
viewport = createEditorViewportUI({
  hub: Hub, properties: EDPMU, loader: chunks
});
files.setOnReset(() => chunks.reset());
tabs = createFileTabsUI({
  hub: Hub, properties: EDPMU, files, loader: chunks
});
files.setBeforeNew(() => tabs.beforeOpen());
files.setOnNew(() => tabs.addCurrent('untitled.txt'));
files.setOnClose(() => tabs.closed());

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
  loadFile: (file) => chunks.load(file),
  fileState: () => files.getState(),
  newFile: () => files.newFile(),
  saveFile: () => files.save(),
  closeFile: () => files.close(),
  nextWindow: () => viewport.next(),
  previousWindow: () => viewport.previous(),
  tabs: () => tabs.list(),
  selectTab: (id) => tabs.select(id)
});
window.VTE = Object.freeze({
  log: () => OMU.log(),
  C: (name) => URU.register(name),
  U: (name, value) => EDPMU.set(name, value),
  D: (name) => URU.unregister(name),
  A: (source, target, action) => Hub.simulate(source, target, action)
});
language.setLocale('zh-Hant');
