import test from 'node:test';
import assert from 'node:assert/strict';
import { FileLoader } from '../Implementation/Objects/FileLoader.js';
import { FileSession } from '../Implementation/Objects/FileSession.js';
import { Document } from '../Implementation/Objects/Document.js';

test('FileLoader reads only requested byte range', async () => {
  const loader = new FileLoader();
  const data = await loader.load({ file: new Blob(['abcdefgh']), offset: 2, length: 3 });
  assert.equal(new TextDecoder().decode(data.bytes), 'cde');
  assert.equal(data.totalBytes, 8);
});

test('FileSession does not fully load large files', async () => {
  const loader = new FileLoader();
  const session = new FileSession(loader, { editableLimitBytes: 4 });
  const result = await session.open(new Blob(['12345678']));
  assert.equal(result.editable, false);
  assert.equal(result.totalBytes, 8);
});

test('Document tracks edits and exports text', async () => {
  const doc = new Document({ name: 'a.txt', text: 'old', editable: true });
  doc.replace('new');
  assert.equal(doc.dirty, true);
  assert.equal(await doc.exportBlob().text(), 'new');
});
