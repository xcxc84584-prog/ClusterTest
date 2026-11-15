/** Shared property definitions and versioned values. */
export class EntireDomainPropertyManagementUnit {
  #values = new Map();
  define(name, value) {
    if (this.#values.has(name)) return { ok: false, code: 409 };
    this.#values.set(name, { value, version: 1 });
    return { ok: true, code: 201 };
  }
  read(name) {
    const entry = this.#values.get(name);
    return entry ? { ok: true, code: 200, data: { ...entry } } : { ok: false, code: 404 };
  }
  update(name, value, expectedVersion) {
    const entry = this.#values.get(name);
    if (!entry) return { ok: false, code: 404 };
    if (entry.version !== expectedVersion) return { ok: false, code: 409 };
    this.#values.set(name, { value, version: entry.version + 1 });
    return this.read(name);
  }
  list() { return [...this.#values.keys()]; }
}
