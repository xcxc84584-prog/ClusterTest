import { UnifiedRegistrationUnit } from '../LinkCore/UnifiedRegistrationUnit.js';
import { ObjectManagementUnit } from '../LinkCore/ObjectManagementUnit.js';
import { HubUnit } from '../LinkCore/HubUnit.js';
import { FileLoader } from '../Objects/FileLoader.js';
import { FileSession } from '../Objects/FileSession.js';

/** Isolated OpenFile event chain. No production state is shared. */
export async function runFileOpenVTE(file = new Blob(['test'])) {
  const registry = new UnifiedRegistrationUnit();
  const omu = new ObjectManagementUnit();
  const hub = new HubUnit(registry, omu);
  const session = new FileSession(new FileLoader());
  registry.register('FileSession', session);
  const opened = await hub.request('EditorWindow', 'FileSession', 'open', file);
  const missing = await hub.request('EditorWindow', 'Missing', 'open', file);
  return {
    opened,
    missing,
    events: omu.log(),
    isolated: true
  };
}
