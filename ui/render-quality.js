// Keep sharp geometry and sprites separate from the softer snowfall layer.
const MODES = {
  balanced: { sceneDpr: 1.5, snowDpr: 1, pixels: 8_294_400, sceneInterval: 1000 / 30 },
  high: { sceneDpr: 2, snowDpr: 1.5, pixels: 8_294_400, sceneInterval: 1000 / 30 },
  economy: { sceneDpr: 1, snowDpr: 1, pixels: 2_073_600, sceneInterval: 1000 / 24 },
};

export function renderQuality(width, height, dpr = 1, mode = 'balanced') {
  width = Math.max(1, Number.isFinite(width) ? width : 1);
  height = Math.max(1, Number.isFinite(height) ? height : 1);
  dpr = Math.max(1, Number.isFinite(dpr) ? dpr : 1);
  const options = MODES[mode] || MODES.balanced;
  const cap = Math.min(Math.sqrt(options.pixels / (width * height)),
    8192 / width, 8192 / height);
  return {
    sceneScale: Math.min(dpr, options.sceneDpr, cap),
    snowScale: Math.min(dpr, options.snowDpr, cap),
    sceneInterval: options.sceneInterval,
  };
}

export function ballTextureSize(radius, scale) {
  const required = Math.max(64, radius * 2 * scale);
  return Math.min(512, 2 ** Math.ceil(Math.log2(required)));
}
