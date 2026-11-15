import test from 'node:test';
import assert from 'node:assert/strict';
import { UnifiedRegistrationUnit } from '../Program/LinkCore/UnifiedRegistrationUnit.js';
import { ObjectManagementUnit } from '../Program/LinkCore/ObjectManagementUnit.js';
import { HubUnit } from '../Program/LinkCore/HubUnit.js';
import { EntireDomainPropertyManagementUnit } from '../Program/LinkCore/EntireDomainPropertyManagementUnit.js';

test('HubUnit routes registered requests and records failure/EHU', async () => {
  const registry = new UnifiedRegistrationUnit();
  const omu = new ObjectManagementUnit();
  const hub = new HubUnit(registry, omu);
  registry.register('Echo', { echo: value => value });
  assert.equal((await hub.request('A', 'Echo', 'echo', 'hello')).data, 'hello');
  assert.equal((await hub.request('A', 'Missing', 'echo', null)).code, 404);
  assert.equal(omu.log().filter(entry => entry.kind === 'EHU').length, 1);
});

test('PASS cooldown does not suppress FAIL or EHU', () => {
  let now = 1000;
  const omu = new ObjectManagementUnit({ clock: () => now });
  omu.record({ source: 'A', action: 'read', result: 'PASS' });
  omu.record({ source: 'A', action: 'read', result: 'PASS' });
  omu.record({ source: 'A', action: 'read', result: 'FAIL' });
  omu.record({ source: 'A', action: 'read', kind: 'EHU', result: 'FAIL' });
  assert.equal(omu.log().length, 3);
  now += 1000;
  omu.record({ source: 'A', action: 'read', result: 'PASS' });
  assert.equal(omu.log().length, 4);
});

test('Property updates enforce expected version', () => {
  const registry = new EntireDomainPropertyManagementUnit();
  assert.equal(registry.define('Theme', 'dark').ok, true);
  assert.equal(registry.update('Theme', 'light', 1).data.version, 2);
  assert.equal(registry.update('Theme', 'dark', 1).code, 409);
});
