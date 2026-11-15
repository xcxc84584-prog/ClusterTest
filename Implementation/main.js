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
const loader = new FileLoader();
const sessions = new FileSession(loader);
const docs = [];
let current = null;
const editor = document.querySelector('#editor');
const status = document.querySelector('#status');
const filename = document.querySelector('#filename');
const list = document.querySelector('#documents');
const fileInput = document.querySelector('#file');

registry.register('FileSession', sessions);
properties.define('Version', '0.0.1');

function show(doc) {
  current = doc;
  editor.value = doc.text;
  editor.readOnly = !doc.editable;
  filename.textContent = doc.name;
  status.textContent = doc.editable ? '就緒' : '大文件預覽（唯讀；後續 Patch 開放編輯）';
  list.replaceChildren(...docs.map(item => {
    const li = document.createElement('li');
    li.textContent = item.name + (item.dirty ? ' *' : '');
    if (item === current) li.className = 'active';
    li.addEventListener('click', () => show(item));
    return li;
  }));
}

document.querySelector('#open').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  status.textContent = '載入中…';
  const response = await hub.request('EditorWindow', 'FileSession', 'open', file);
  if (!response.ok) { status.textContent = '載入失敗'; return; }
  const doc = new Document(response.data);
  docs.push(doc);
  show(doc);
  fileInput.value = '';
});
editor.addEventListener('input', () => {
  if (!current || !current.editable) return;
  current.replace(editor.value);
  showStatus();
});
function showStatus() {
  status.textContent = current?.dirty ? '未儲存' : '就緒';
  list.querySelectorAll('li').forEach((li, i) => {
    li.textContent = docs[i].name + (docs[i].dirty ? ' *' : '');
  });
}
document.querySelector('#save').addEventListener('click', () => {
  if (!current || !current.editable) return;
  const url = URL.createObjectURL(current.exportBlob());
  const link = document.createElement('a');
  link.href = url;
  link.download = current.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = '已下載（不會覆寫原檔）';
});
window.Cluster = Object.freeze({
  log: () => omu.log(),
  objectlist: () => registry.list(),
  propertylist: () => properties.list(),
  version: () => properties.read('Version').data.value
});
