// LanguageUI: DOM adapter. Dictionary is the only translation source.
import { dictionaries, translate } from '../property/language.js';

const bindings = {
  menuBtn: ['file', '⌄'],
  toolBtn: ['tool', ' ›'],
  languageBtn: ['language', ' ›'],
  highlighterBtn: ['highlighter', '', '◇ '],
  highlighterTitle: ['title'],
  highlighterDone: ['done'],
  highlighterHint: ['hint'],
  highlighterPerformanceLabel: ['performance'],
  highlighterPerformanceHint: ['performanceHint'],
  highlighterShortcutLabel: ['shortcut'],
  highlighterShortcutDescription: ['shortcutDescription'],
  highlighterShortcutCombination: ['combination'],
  highlighterShortcutHelp: ['shortcutHelp'],
  highlighterShortcutReset: ['reset'],
  highlighterShortcutSave: ['saveShortcut'],
  highlighterSlices: ['slices'],
  highlighterState: ['state']
};

export function createLanguageUI({ hub, properties, root = document }) {
  let current = 'zh-Hant';
  const get = (id) => root.getElementById(id);
  const original = new Map();

  // Record original markup once; preserve the original visual structure.
  for (const id of ['empty']) {
    if (get(id)) original.set(id, get(id).innerHTML);
  }

  function setLocale(locale) {
    if (!Object.hasOwn(dictionaries, locale)) {
      return { status: 400, result: 'FAIL' };
    }
    const result = hub.dispatch(
      'LanguageUI', 'Language', 'SET_LOCALE', { locale }
    );
    if (result.result !== 'PASS') return result;
    current = locale;
    root.documentElement.lang = locale;
    properties.set('Language', locale);

    for (const [id, [key, suffix = '', prefix = '']] of
      Object.entries(bindings)) {
      const node = get(id);
      if (node) node.textContent =
        prefix + translate(locale, key) + suffix;
    }
    const label = get('highlighterEnabled')?.parentElement;
    if (label) {
      const text = [...label.childNodes].find(
        (node) => node.nodeType === 3
      );
      if (text) text.textContent = ' ' + translate(locale, 'enabled');
    }
    const empty = get('empty');
    if (empty) {
      const paragraph = empty.querySelector('p');
      if (paragraph) paragraph.textContent = translate(locale, 'empty');
    }
    root.querySelectorAll('[data-locale]').forEach((button) => {
      button.setAttribute(
        'aria-pressed', String(button.dataset.locale === locale)
      );
    });
    return { ...result, status: 200 };
  }
  return { setLocale, getLocale: () => current };
}
