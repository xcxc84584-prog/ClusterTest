// Lightweight test tokenizer. Not a replacement for ClusterOpt Shiki.
const escapeHtml = (value) => value.replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export function highlight(source) {
  const pattern = /(\/\/[^\n]*|\b(?:const|let|function|return|class|if|else|import|export)\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
  let out = '', start = 0;
  for (const match of source.matchAll(pattern)) {
    out += escapeHtml(source.slice(start, match.index));
    const value = match[0];
    const color = value.startsWith('//') ? '#8fba9c'
      : /^["']/.test(value) ? '#d5ad7d' : '#91afff';
    out += '<span style="color:' + color + '">' +
      escapeHtml(value) + '</span>';
    start = match.index + value.length;
  }
  return out + escapeHtml(source.slice(start));
}
