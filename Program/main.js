import { UnifiedRegistrationUnit } from './LinkCore/UnifiedRegistrationUnit.js';
import { ObjectManagementUnit } from './LinkCore/ObjectManagementUnit.js';
import { EntireDomainPropertyManagementUnit } from './LinkCore/EntireDomainPropertyManagementUnit.js';
import { HubUnit } from './LinkCore/HubUnit.js';
import { FileLoader } from './Objects/FileLoader.js';
import { FileSession } from './Objects/FileSession.js';
import { Document } from './Objects/Document.js';
import { LanguageProperty } from './Properties/LanguageProperty.js';
import zhHant from './Locales/zh-Hant.js';
import english from './Locales/en.js';
import { SyntaxHighlighter } from './Objects/SyntaxHighlighter.js';
import { EditorHighlighterView } from './Objects/EditorHighlighterView.js';

const registry = new UnifiedRegistrationUnit();
const omu = new ObjectManagementUnit();
const properties = new EntireDomainPropertyManagementUnit();
const hub = new HubUnit(registry, omu);
const sessions = new FileSession(new FileLoader());
registry.register('FileSession', sessions);
properties.define('Version', '0.0.1');
const language = new LanguageProperty({
  'zh-Hant': zhHant, en: english
});
const highlighter = new EditorHighlighterView(
  document.getElementById('editor'),
  document.getElementById('highlightOverlay'),
  new SyntaxHighlighter(),
  state => {
    const label = document.getElementById('highlighterState');
    if (label) label.textContent = language.t('highlight.state.' + state);
  }
);
const savedLocale = localStorage.getItem('cluster.locale');
if (savedLocale) language.setLocale(savedLocale);


const docs = [];
let current = null;
let untitled = 0;
const $ = id => document.getElementById(id);
const editor = $('editor');
const fileInput = $('fileInput');
const menu = $('menu');
const pane = $('editorPane');
const empty = $('empty');

function position() {
  const text = editor.value.slice(0, editor.selectionStart);
  const lines = text.split('\n');
  $('position').textContent = 'Ln ' + lines.length +
    ', Col ' + (lines.at(-1).length + 1);
  $('gutter').textContent = Array.from(
    { length: Math.max(1, editor.value.split('\n').length) },
    (_, i) => i + 1
  ).join('\n');
}
function renderTabs() {
  const tabs = $('tabs');
  tabs.replaceChildren();
  for (const doc of docs) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tab' + (doc === current ? ' active' : '');
    button.textContent = doc.name + (doc.dirty ? ' ●' : '');
    button.addEventListener('click', () => show(doc));
    tabs.append(button);
  }
}
function show(doc) {
  current = doc;
  empty.hidden = !!doc;
  pane.hidden = !doc;
  if (!doc) {
    $('filename').textContent = '未命名.txt';
    renderTabs();
    return;
  }
  editor.value = doc.text;
  editor.readOnly = !doc.editable;
  $('filename').textContent = doc.name;
  $('status').textContent = doc.editable
    ? (doc.dirty ? '未儲存' : '就緒')
    : '大文件唯讀預覽（待完整載入）';
  $('fileType').textContent = doc.name.split('.').at(-1) || '純文字';
  renderTabs();
  position();
  highlighter.schedule(doc.name);
}
function create() {
  const doc = new Document({
    name: '未命名' + (++untitled) + '.txt',
    file: new Blob([]), text: '', editable: true
  });
  docs.push(doc);
  show(doc);
}
async function openFiles(files) {
  for (const file of files) {
    $('status').textContent = '載入中…';
    const response = await hub.request(
      'EditorWindow', 'FileSession', 'open', file
    );
    if (!response.ok) {
      $('status').textContent = '載入失敗';
      continue;
    }
    const doc = new Document(response.data);
    docs.push(doc);
    show(doc);
  }
}
function save() {
  if (!current || !current.editable) return;
  const url = URL.createObjectURL(current.exportBlob());
  const link = document.createElement('a');
  link.href = url;
  link.download = current.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('status').textContent = '已下載（未覆寫原檔）';
}
function close(all = false) {
  if (!current) return;
  if (all) docs.splice(0);
  else docs.splice(docs.indexOf(current), 1);
  show(docs.at(-1) || null);
  if (!current) highlighter.dispose();
}
$('menuBtn').addEventListener('click', () => { menu.hidden = !menu.hidden; });
menu.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    menu.hidden = true;
    if (action === 'new') create();
    if (action === 'open') fileInput.click();
    if (action === 'save' || action === 'saveas') save();
    if (action === 'close') close();
    if (action === 'closeall') close(true);
  });
});
fileInput.addEventListener('change', async () => {
  await openFiles([...fileInput.files]);
  fileInput.value = '';
});
$('explorerToggle').addEventListener('click', () => {
  const panel = $('explorerPanel');
  panel.hidden = !panel.hidden;
  $('explorerToggle').setAttribute('aria-expanded', String(!panel.hidden));
});
$('explorerClose').addEventListener('click', () => {
  $('explorerPanel').hidden = true;
  $('explorerToggle').setAttribute('aria-expanded', 'false');
});
$('explorerAddFile').addEventListener('click', () => fileInput.click());
$('explorerAddFolder').addEventListener('click', () => {
  $('status').textContent = '資料夾導入尚待移植';
});
$('toolBtn').addEventListener('click', () => {
  $('toolOptions').hidden = !$('toolOptions').hidden;
});
$('languageBtn').addEventListener('click', () => {
  $('languageOptions').hidden = !$('languageOptions').hidden;
});
editor.addEventListener('input', () => {
  if (!current || !current.editable) return;
  current.replace(editor.value);
  $('status').textContent = '未儲存';
  renderTabs();
  position();
  highlighter.schedule(current.name);
});
editor.addEventListener('click', position);
editor.addEventListener('keyup', position);
editor.addEventListener('scroll', () => {
  $('gutter').scrollTop = editor.scrollTop;
  highlighter.scroll();
});
$('goLineButton').addEventListener('click', () => {
  const line = Math.max(1, Number($('goLineInput').value) || 1);
  const lines = editor.value.split('\n');
  const offset = lines.slice(0, line - 1).reduce(
    (n, text) => n + text.length + 1, 0
  );
  editor.focus();
  editor.setSelectionRange(offset, offset);
  position();
});

const localeBindings = [
  ['menuBtn', 'menu.file'],
  ['[data-action="new"]', 'menu.new'],
  ['[data-action="open"]', 'menu.open'],
  ['[data-action="save"]', 'menu.save'],
  ['[data-action="saveas"]', 'menu.saveas'],
  ['[data-action="close"]', 'menu.close'],
  ['[data-action="closeall"]', 'menu.closeall'],
  ['toolBtn', 'menu.tools'],
  ['languageBtn', 'menu.language'],
  ['highlighterBtn', 'menu.highlighter'],
  ['paletteBtn', 'menu.palette'],
  ['explorerTitle', 'explorer.title'],
  ['explorerAddFolder', 'explorer.folder'],
  ['explorerAddFile', 'explorer.file'],
  ['highlighterTitle', 'highlight.title'],
  ['highlighterDone', 'highlight.done'],
  ['highlighterClose', 'highlight.close'],
  ['highlighterHint', 'highlight.hint'],
  ['highlighterSlices', 'highlight.slices'],
  ['highlighterPerformanceLabel', 'highlight.performance'],
  ['goLineButton', 'line.goto']
];
function applyLocale() {
  document.documentElement.lang = language.locale;
  for (const [selector, key] of localeBindings) {
    const node = selector.startsWith('[')
      ? document.querySelector(selector) : $(selector);
    if (node) node.textContent = language.t(key);
  }
  const search = $('explorerSearch');
  if (search) search.placeholder = language.t('explorer.search');
  const emptyHint = $('empty')?.querySelector('p');
  if (emptyHint) emptyHint.textContent = language.t('empty.hint');
  const lineLabel = document.querySelector('label[for="goLineInput"]');
  if (lineLabel) lineLabel.textContent = language.t('line.label');
  const lineHint = document.querySelector('.goLineHint');
  if (lineHint) lineHint.textContent = language.t('line.hint');
  const switchLabel = $('highlighterEnabled')?.parentElement;
  if (switchLabel) {
    const input = $('highlighterEnabled');
    switchLabel.replaceChildren(input,
      document.createTextNode(' ' + language.t('highlight.enabled')));
  }
  const localeButtons = document.querySelectorAll('[data-locale]');
  for (const button of localeButtons) {
    button.setAttribute('aria-pressed',
      String(button.dataset.locale === language.locale));
  }
}
language.subscribe(applyLocale);
document.querySelectorAll('[data-locale]').forEach(button => {
  button.addEventListener('click', () => {
    if (language.setLocale(button.dataset.locale)) {
      localStorage.setItem('cluster.locale', language.locale);
      $('languageOptions').hidden = true;
    }
  });
});
$('highlighterBtn')?.addEventListener('click', () => {
  $('highlighterDialog')?.showModal();
});
$('highlighterClose')?.addEventListener('click', () => {
  $('highlighterDialog')?.close();
});
$('highlighterDone')?.addEventListener('click', () => {
  $('highlighterDialog')?.close();
});
$('highlighterEnabled')?.addEventListener('change', event => {
  highlighter.enabled = event.target.checked;
  highlighter.schedule(current?.name);
});
$('highlighterPerformance')?.addEventListener('change', event => {
  highlighter.performance = event.target.checked;
  highlighter.schedule(current?.name);
});
applyLocale();
window.Cluster = Object.freeze({
  log: () => omu.log(),
  objectlist: () => registry.list(),
  propertylist: () => properties.list(),
  version: () => properties.read('Version').data.value,
  locale: () => language.locale,
  locales: () => language.available()
});
show(null);
