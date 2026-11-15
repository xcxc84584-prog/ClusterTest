// Palette property: pure color conversion and accessible theme tokens.
const clamp = (value) => Math.max(0, Math.min(255, value));
const rgb = (values) => 'rgb(' + values.map(Math.round).join(', ') + ')';

export function parseHex(value) {
  if (!/^#[0-9a-f]{6}$/i.test(value)) return null;
  return [1, 3, 5].map((offset) =>
    Number.parseInt(value.slice(offset, offset + 2), 16)
  );
}

export function makePalette(hex, mode = 'dark') {
  const channels = parseHex(hex);
  if (!channels || !['dark', 'light'].includes(mode)) return null;
  const blend = (base, ratio) => base.map((value, index) =>
    clamp(value * (1 - ratio) + channels[index] * ratio)
  );
  const light = mode === 'light';
  const base = light ? [250, 250, 252] : [9, 10, 13];
  const surface = light ? [239, 241, 245] : [29, 31, 38];
  const panel = light ? [246, 247, 250] : [20, 22, 28];
  const text = light ? [19, 23, 32] : [245, 246, 249];
  const muted = light ? [55, 61, 73] : [184, 188, 201];
  return {
    '--ui-background': rgb(blend(base, 0.12)),
    '--ui-surface': rgb(blend(surface, 0.2)),
    '--ui-panel': rgb(blend(panel, 0.16)),
    '--ui-control': rgb(blend(light ? [220, 224, 232] :
      [54, 57, 68], 0.25)),
    '--ui-hover': rgb(blend(light ? [204, 210, 221] :
      [73, 77, 91], 0.28)),
    '--ui-border': rgb(blend(light ? [145, 151, 164] :
      [83, 87, 101], 0.18)),
    '--ui-text': rgb(text),
    '--ui-muted': rgb(muted),
    '--ui-editor': rgb(blend(base, 0.07)),
    '--ui-gutter': rgb(blend(surface, 0.12)),
    '--ui-text-on-surface': rgb(text),
    '--ui-text-on-panel': rgb(text),
    '--ui-text-on-control': rgb(text),
    '--ui-accent': rgb(channels)
  };
}
