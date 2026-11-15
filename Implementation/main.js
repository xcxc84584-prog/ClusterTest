import { UnifiedRegistrationUnit } from './LinkCore/UnifiedRegistrationUnit.js';
import { ObjectManagementUnit } from './LinkCore/ObjectManagementUnit.js';
import { EntireDomainPropertyManagementUnit } from './LinkCore/EntireDomainPropertyManagementUnit.js';
import { HubUnit } from './LinkCore/HubUnit.js';
import { FileLoader } from './Objects/FileLoader.js';
import { FileSession } from './Objects/FileSession.js';
import { Document } from './Objects/Document.js';

const registry = new UnifiedRegistrationUnit();
const omu = new ObjectManagementUnit();
const properties = new EntireDomainPropertyManagementUnit();
const hub = new HubUnit(registry, omu);
const sessions = new FileSession(new FileLoader());
registry.register('FileSession', sessions);
properties.define('Version', '0.0.1');

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
});
editor.addEventListener('click', position);
editor.addEventListener('keyup', position);
editor.addEventListener('scroll', () => {
  $('gutter').scrollTop = editor.scrollTop;
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
window.Cluster = Object.freeze({
  log: () => omu.log(),
  objectlist: () => registry.list(),
  propertylist: () => properties.list(),
  version: () => properties.read('Version').data.value
});
show(null);
