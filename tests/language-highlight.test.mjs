import test from 'node:test';
import assert from 'node:assert/strict';
import { LanguageProperty } from '../Program/Properties/LanguageProperty.js';
import zh from '../Program/Locales/zh-Hant.js';
import en from '../Program/Locales/en.js';
import { detectSyntax } from '../Program/Objects/SyntaxHighlighter.js';

test('Locale registry switches and falls back to zh-Hant', () => {
  const language = new LanguageProperty({ 'zh-Hant': zh, en });
  assert.equal(language.setLocale('en'), true);
  assert.equal(language.t('menu.new'), 'New File');
  assert.equal(language.setLocale('fr'), false);
  language.register('fr', { 'menu.new': 'Nouveau fichier' });
  assert.equal(language.setLocale('fr'), true);
  assert.equal(language.t('menu.new'), 'Nouveau fichier');
  assert.equal(language.t('menu.save'), zh['menu.save']);
});

test('Syntax detection maps common extensions safely', () => {
  assert.equal(detectSyntax('hello.cpp'), 'cpp');
  assert.equal(detectSyntax('script.PY'), 'python');
  assert.equal(detectSyntax('unknown.abc'), 'text');
});
