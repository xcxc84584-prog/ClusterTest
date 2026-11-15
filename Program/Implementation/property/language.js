// Shared Property: extensible locale registry.
export const dictionaries = Object.freeze({
  'zh-Hant': {
    file: '檔案', tool: '工具', language: '語言',
    highlighter: '文本著色器', title: '文本著色器',
    enabled: '啟用語法著色', done: '完成',
    hint: '依檔案類型自動識別語言；色彩跟隨介面調色盤。',
    empty: '選擇「檔案」建立或開啟文件',
    performance: '效能化（僅著色可見文本）',
    performanceHint: '僅解析目前視窗中的文字；捲動後更新。',
    shortcut: '切換快捷鍵',
    shortcutDescription: '點擊輸入框，直接按下想使用的快捷鍵。',
    combination: '快捷鍵組合',
    shortcutHelp: 'Ctrl 必選，Shift 可選；支援 A–Z、0–9。',
    reset: '重設', saveShortcut: '儲存快捷鍵',
    slices: '測試模式：僅著色目前編輯器內容。',
    state: '測試著色器已就緒'
  },
  en: {
    file: 'File', tool: 'Tools', language: 'Language',
    highlighter: 'Text highlighter', title: 'Text highlighter',
    enabled: 'Enable syntax highlighting', done: 'Done',
    hint: 'Detect language by file type; colors follow the UI palette.',
    empty: 'Choose File to create or open a document',
    performance: 'Performance mode (visible text only)',
    performanceHint: 'Analyze visible text only; update on scroll.',
    shortcut: 'Toggle shortcut',
    shortcutDescription: 'Focus the input and press a shortcut.',
    combination: 'Shortcut combination',
    shortcutHelp: 'Ctrl is required; Shift optional; A–Z or 0–9.',
    reset: 'Reset', saveShortcut: 'Save shortcut',
    slices: 'Test mode: only the current editor content is highlighted.',
    state: 'Test highlighter ready'
  }
});
export function translate(locale, key) {
  return (dictionaries[locale] || dictionaries.en)[key] || key;
}
