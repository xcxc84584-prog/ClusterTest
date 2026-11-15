// OCDA P2 bootstrap: UI adapters communicate through LinkCore.
import { LinkCore } from '../LinkCore/core.js';
import { createLanguageUI } from '../object/LanguageUI.js';
import { createHighlighterUI } from '../object/HighlighterUI.js';

const { URU, OMU, EDPMU, Hub } = LinkCore;
const get = (id) => document.getElementById(id);
for (const name of ['LanguageUI', 'HighlighterUI', 'EditorUI']) {
  URU.register(name);
}
for (const name of [
  'Language', 'SyntaxHighlight', 'Version',
  'HighlightShortcut', 'HighlightPerformance'
]) {
  URU.register(name, 'Property');
}
EDPMU.set('Version', 'OCDA-P4');
OMU.record({
  type: 'Version', source: 'LinkCore', target: 'Version',
  action: 'VERSION_PUBLISHED', result: 'PASS',
  status: 200, version: 'OCDA-P4'
});
const language = createLanguageUI({ hub: Hub, properties: EDPMU });
const highlighter = createHighlighterUI({
  hub: Hub, properties: EDPMU
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
  version: () => EDPMU.get('Version'),
  locale: () => language.getLocale(),
  highlight: () => highlighter.getEnabled(),
  openHighlighter: () => highlighter.open()
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
