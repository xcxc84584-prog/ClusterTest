import test from 'node:test';
import assert from 'node:assert/strict';
import { runFileOpenVTE } from '../Program/VTE/FileOpenVTE.js';
import { ObjectManagementUnit } from '../Program/LinkCore/ObjectManagementUnit.js';
import { LoopLogUnit } from '../Program/LinkCore/LoopLogUnit.js';

test('VTE: open succeeds and missing target records EHU', async () => {
  const result = await runFileOpenVTE(new Blob(['hello']));
  assert.equal(result.opened.ok, true);
  assert.equal(result.missing.code, 404);
  assert.ok(result.events.some(event => event.kind === 'EHU'));
  assert.equal(result.isolated, true);
});

test('Loop: keep START, FAIL, EHU and END only', () => {
  const omu = new ObjectManagementUnit();
  const loops = new LoopLogUnit(omu);
  loops.start({ loopId: 'load-1', source: 'FileLoader', action: 'Load' });
  loops.step({ loopId: 'load-1', result: 'PASS' });
  loops.step({ loopId: 'load-1', result: 'FAIL', code: 500 });
  loops.step({ loopId: 'load-1', kind: 'EHU', result: 'FAIL', code: 500 });
  loops.end({ loopId: 'load-1' });
  assert.deepEqual(
    omu.log().map(event => event.phase),
    ['START', 'STEP', 'STEP', 'END']
  );
});
