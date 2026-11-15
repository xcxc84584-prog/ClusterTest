// OCDA LinkCore P1: runtime-only registry; no persisted credentials.
const now = () => new Date().toISOString();
export class UnifiedRegistrationUnit {
  #items = new Map();
  register(name, kind = 'Object') {
    if (!name || !['Object', 'Property'].includes(kind)) {
      throw new Error('INVALID_REGISTRATION');
    }
    this.#items.set(name, { name, kind, time: now() });
    return this.#items.get(name);
  }
  unregister(name) { return this.#items.delete(name); }
  has(name) { return this.#items.has(name); }
  list() { return [...this.#items.values()]; }
}
export class ObjectManagementUnit {
  #logs = [];
  #lastPass = new Map();
  record(event) {
    const entry = { time: now(), ...event };
    const key = [entry.source, entry.action, entry.target].join('|');
    if (entry.result === 'PASS' && entry.type !== 'EHU') {
      const t = Date.now();
      if (t - (this.#lastPass.get(key) || 0) < 1000) return null;
      this.#lastPass.set(key, t);
    }
    this.#logs.unshift(entry);
    return entry;
  }
  log() { return [...this.#logs]; }
  clear() { this.#logs.length = 0; this.#lastPass.clear(); }
}
export class EntireDomainPropertyManagementUnit {
  #values = new Map();
  set(name, value) { this.#values.set(name, value); return value; }
  get(name) { return this.#values.get(name); }
  list() { return [...this.#values.keys()]; }
}
export class HubUnit {
  #eventId = 0;
  constructor(registry, omu) { this.registry = registry; this.omu = omu; }
  dispatch(source, target, action, payload = {}, kind = 'Request') {
    const eventId = ++this.#eventId;
    for (const name of [source, target]) {
      if (!this.registry.has(name)) {
        this.omu.record({ type: 'Log', source: 'HubUnit',
          target: name, action: 'AUTO_REGISTER', result: 'FAIL' });
        try { this.registry.register(name); }
        catch (error) {
          this.omu.record({ type: 'EHU', source: 'URU', target: name,
            action: 'REGISTER', result: 'FAIL', detail: String(error) });
          return { eventId, result: 'FAIL' };
        }
      }
    }
    this.omu.record({ type: kind, eventId, source, target,
      action, result: 'PASS' });
    return { eventId, result: 'PASS', payload };
  }
  simulate(source, target, action, payload) {
    return this.dispatch(source, target, action, payload);
  }
}
export const URU = new UnifiedRegistrationUnit();
export const OMU = new ObjectManagementUnit();
export const EDPMU = new EntireDomainPropertyManagementUnit();
export const Hub = new HubUnit(URU, OMU);
// Only LinkCore publishes the current application release.
let publishedVersion = null;
export const LinkCore = Object.freeze({
  URU, OMU, EDPMU, Hub,
  publishVersion() {
    if (publishedVersion !== null) return publishedVersion;
    const release = globalThis.__OCDA_RELEASE__;
    if (!release || typeof release.version !== 'string') {
      OMU.record({
        type: 'EHU', source: 'LinkCore', target: 'Version',
        action: 'VERSION_MISSING', result: 'FAIL', status: 500
      });
      throw new Error('LINKCORE_VERSION_MISSING');
    }
    URU.register('Version', 'Property');
    publishedVersion = release.version;
    EDPMU.set('Version', publishedVersion);
    OMU.record({
      type: 'Version', source: 'LinkCore', target: 'Version',
      action: 'VERSION_PUBLISHED', result: 'PASS',
      status: 200, version: publishedVersion
    });
    return publishedVersion;
  },
  version() { return publishedVersion; }
});
