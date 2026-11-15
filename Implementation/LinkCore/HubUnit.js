/** Logical hub: multiple instances may share a registry and journal. */
export class HubUnit {
  constructor(registry, omu) { this.registry = registry; this.omu = omu; }
  async request(source, target, action, payload) {
    const event = { source, target, action, kind: 'Request' };
    const receiver = this.registry.resolve(target);
    if (!receiver) {
      this.omu.record({ ...event, result: 'FAIL', code: 404 });
      this.omu.record({ ...event, kind: 'EHU', result: 'FAIL', code: 404 });
      return { ok: false, code: 404, message: 'Target not registered' };
    }
    try {
      const handler = receiver.instance[action];
      if (typeof handler !== 'function') throw new Error('Unknown action');
      const data = await handler.call(receiver.instance, payload);
      this.omu.record({ ...event, result: 'PASS', code: 200 });
      return { ok: true, code: 200, data };
    } catch (error) {
      this.omu.record({ ...event, result: 'FAIL', code: 500 });
      this.omu.record({ ...event, kind: 'EHU', result: 'FAIL', code: 500 });
      return { ok: false, code: 500, message: String(error) };
    }
  }
}
