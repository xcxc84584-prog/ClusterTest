/** Runtime-only registry; registration does not grant authorization. */
export class UnifiedRegistrationUnit {
  #entries = new Map();
  register(name, instance, kind = 'Object') {
    if (typeof name !== 'string' || !name || !instance) {
      return { ok: false, code: 400, message: 'Invalid registration' };
    }
    if (this.#entries.has(name)) {
      return { ok: false, code: 409, message: 'Already registered' };
    }
    this.#entries.set(name, { name, instance, kind });
    return { ok: true, code: 201, data: name };
  }
  resolve(name) { return this.#entries.get(name) ?? null; }
  unregister(name) { return this.#entries.delete(name); }
  list() { return [...this.#entries.values()].map(({ name, kind }) => ({ name, kind })); }
}
