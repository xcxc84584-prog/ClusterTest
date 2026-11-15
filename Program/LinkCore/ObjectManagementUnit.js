/** In-memory event journal; failures and EHU are never suppressed. */
export class ObjectManagementUnit {
  #records = [];
  #cooldown = new Map();
  #next = 0;
  constructor({ clock = () => Date.now(), limit = 10000 } = {}) {
    this.clock = clock;
    this.limit = limit;
  }
  record(event) {
    const time = this.clock();
    const result = event.result ?? 'PASS';
    const key = JSON.stringify([event.source, event.action]);
    if (result === 'PASS' && event.kind !== 'EHU') {
      const last = this.#cooldown.get(key);
      if (last !== undefined && time - last < 1000) return null;
      this.#cooldown.set(key, time);
    }
    const entry = Object.freeze({ ...event, id: ++this.#next, time, result });
    this.#records.push(entry);
    if (this.#records.length > this.limit) this.#records.shift();
    return entry;
  }
  log() { return [...this.#records]; }
  clear() { this.#records = []; this.#cooldown.clear(); }
}
