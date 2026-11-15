// Locale dictionary is independent from DOM and supports future languages.
export const dictionaries = {
  'zh-Hant': {
    file: '檔案', tool: '工具', language: '語言',
    highlighter: '文本著色器', title: '文本著色器',
    enabled: '啟用 Shiki 語法著色', done: '完成',
    hint: '依檔案類型自動識別語言；色彩跟隨介面調色盤。',
    empty: '選擇「檔案」建立或開啟文件'
  },
  en: {
    file: 'File', tool: 'Tools', language: 'Language',
    highlighter: 'Text highlighter', title: 'Text highlighter',
    enabled: 'Enable syntax highlighting', done: 'Done',
    hint: 'Detect syntax by file type; colors follow the UI palette.',
    empty: 'Choose File to create or open a document'
  }
};
export function translate(locale, key) {
  return (dictionaries[locale] || dictionaries.en)[key] || key;
}
