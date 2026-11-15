import { LinkCore } from '../LinkCore/core.js';
import { dictionaries, translate } from '../property/language.js';
import { highlight } from '../property/highlighter.js';
const { URU, OMU, EDPMU, Hub } = LinkCore;
for (const name of ['LanguageUI', 'HighlighterUI', 'EditorUI']) {
  URU.register(name);
}
for (const name of ['Language', 'SyntaxHighlight', 'Version']) {
  URU.register(name, 'Property');
}
EDPMU.set('Version', 'OCDA-P1');
let locale = 'zh-Hant';
let enabled = true;
const $ = (id) => document.getElementById(id);
const on = (id, type, fn) => $(id)?.addEventListener(type, fn);
const set = (id, value) => { if ($(id)) $(id).textContent = value; };
const editor = $('editor');
const overlay = $('highlightOverlay');
const pane = $('editorPane');
const empty = $('empty');
function paint() {
  if (!editor || !overlay) return;
  overlay.innerHTML = enabled ? highlight(editor.value) : '';
  overlay.scrollTop = editor.scrollTop;
  overlay.scrollLeft = editor.scrollLeft;
}
function applyLocale(next) {
  if (!dictionaries[next]) return;
  Hub.dispatch('LanguageUI', 'Language', 'SET_LOCALE', { locale: next });
  locale = next;
  document.documentElement.lang = next;
  set('menuBtn', translate(next, 'file') + '⌄');
  set('toolBtn', translate(next, 'tool') + ' ›');
  set('languageBtn', translate(next, 'language') + ' ›');
  set('highlighterBtn', '◇ ' + translate(next, 'highlighter'));
  set('highlighterTitle', translate(next, 'title'));
  set('highlighterDone', translate(next, 'done'));
  set('highlighterHint', translate(next, 'hint'));
  set('empty', translate(next, 'empty'));
  const label = $('highlighterEnabled')?.parentElement;
  if (label) {
    const textNode = [...label.childNodes].find(n => n.nodeType === 3);
    if (textNode) textNode.textContent = ' ' + translate(next, 'enabled');
  }
  EDPMU.set('Language', next);
}
on('menuBtn', 'click', () => { $('menu').hidden = !$('menu').hidden; });
on('toolBtn', 'click', () => {
  $('toolOptions').hidden = !$('toolOptions').hidden;
});
on('languageBtn', 'click', () => {
  $('languageOptions').hidden = !$('languageOptions').hidden;
});
document.querySelectorAll('[data-locale]').forEach(button => {
  button.addEventListener('click', () => applyLocale(button.dataset.locale));
});
on('highlighterBtn', 'click', () => {
  Hub.dispatch('HighlighterUI', 'SyntaxHighlight', 'OPEN_SETTINGS');
  $('highlighterDialog')?.showModal();
});
for (const id of ['highlighterDone', 'highlighterClose']) {
  on(id, 'click', () => $('highlighterDialog')?.close());
}
on('highlighterEnabled', 'change', () => {
  enabled = $('highlighterEnabled').checked;
  EDPMU.set('SyntaxHighlight', enabled);
  Hub.dispatch('HighlighterUI', 'SyntaxHighlight', 'SET_ENABLED',
    { enabled });
  paint();
});
on('editor', 'input', paint);
on('editor', 'scroll', paint);
function openSample() {
  if (!editor || !pane) return;
  pane.hidden = false;
  if (empty) empty.hidden = true;
  editor.value = '// OCDA syntax test\nconst greet = "Hello Cluster";\nfunction demo() {\n  return greet;\n}\n';
  paint();
}
document.querySelectorAll('[data-action="new"]').forEach(button => {
  button.addEventListener('click', () => {
    openSample();
    $('menu').hidden = true;
  });
});
window.Cluster = Object.freeze({
  log: () => OMU.log(),
  objectlist: () => URU.list().filter(x => x.kind === 'Object'),
  propertylist: () => URU.list().filter(x => x.kind === 'Property'),
  rep: () => OMU.log().filter(x => x.type === 'Response'),
  subobject: () => [],
  version: () => EDPMU.get('Version')
});
window.VTE = Object.freeze({
  log: () => OMU.log(),
  C: (name) => URU.register(name),
  U: (name, value) => EDPMU.set(name, value),
  D: (name) => URU.unregister(name),
  A: (source, target, action) => Hub.simulate(source, target, action)
});
applyLocale(locale);
openSample();
