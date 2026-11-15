/** Extensible BCP-47 locale registry; default messages are zh-Hant. */
export class LanguageProperty {
  #catalogs = new Map();
  #locale = 'zh-Hant';
  #listeners = new Set();
  constructor(catalogs = {}) {
    for (const [locale, messages] of Object.entries(catalogs)) {
      this.register(locale, messages);
    }
  }
  register(locale, messages) {
    if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(locale)) {
      throw new Error('Invalid locale');
    }
    this.#catalogs.set(locale, Object.freeze({ ...messages }));
  }
  setLocale(locale) {
    if (!this.#catalogs.has(locale)) return false;
    this.#locale = locale;
    for (const listener of this.#listeners) listener(locale);
    return true;
  }
  get locale() { return this.#locale; }
  available() { return [...this.#catalogs.keys()]; }
  t(key) {
    return this.#catalogs.get(this.#locale)?.[key] ??
      this.#catalogs.get('zh-Hant')?.[key] ?? key;
  }
  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
}
