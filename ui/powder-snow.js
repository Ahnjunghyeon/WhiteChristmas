import { snowContour, sampleDepth } from './snow-surface.js';

// Production atlas, also consumed by preview/snow-preview.js.
export const POWDER_ATLAS = new URL('./assets/snow/powder-atlas.png', import.meta.url);
const rows = [
  { x: 16, y: 24, width: 2140, height: 174 },
  { x: 16, y: 282, width: 2140, height: 156 },
  { x: 16, y: 528, width: 2140, height: 166 },
];

export function surfaceVariant(id = '') {
  let hash = 0;
  for (const letter of String(id)) hash = (hash * 31 + letter.charCodeAt(0)) >>> 0;
  return hash % rows.length;
}

// Find the bottom of the main opaque snow body, excluding isolated powder specks.
// Transparent padding in the atlas must never become a gap above a window edge.
export function powderBottoms(data, width) {
  return rows.map(row => {
    const result = new Uint16Array(row.width);
    for (let x = 0; x < row.width; x++) {
      let run = 0, longest = 0, bottom = row.y + row.height - 1;
      for (let y = row.y; y < row.y + row.height; y++) {
        if (data[(y * width + row.x + x) * 4 + 3] >= 160) {
          run++;
          if (run > longest) { longest = run; bottom = y; }
        } else run = 0;
      }
      result[x] = bottom;
    }
    return result;
  });
}

export function createPowderPainter({ image: suppliedImage, onReady = () => {}, canvasFactory } = {}) {
  const image = suppliedImage ?? new Image();
  let loaded = Boolean(suppliedImage);
  let revision = loaded ? 1 : 0;
  let bottoms;
  const measure = () => {
    if (!image.width || (!canvasFactory && typeof document === 'undefined')) return;
    const canvas = canvasFactory ? canvasFactory(image.width, image.height) : document.createElement('canvas');
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0);
    bottoms = powderBottoms(ctx.getImageData(0, 0, image.width, image.height).data, image.width);
  };
  if (loaded) measure();
  if (!suppliedImage) {
    image.onload = () => { measure(); loaded = true; revision++; onReady(); };
    image.onerror = () => console.warn('Snow texture unavailable; using shaded fallback.');
    image.src = POWDER_ATLAS.href;
  }
  return {
    get revision() { return revision; },
    get loaded() { return loaded; },
    paint(ctx, profile, width, column, baseline, { overhang = true, variant = 0 } = {}) {
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const rowIndex = ((variant % rows.length) + rows.length) % rows.length;
      const row = rows[rowIndex];
      // Fixed horizontal texture scale: window resizing reveals more snow instead
      // of stretching a single picture across the whole window. Mirror at joins
      // to keep identical texture pixels on both sides of each boundary.
      const sourceStart = row.x + 70;
      const sourceWidth = row.width - 140;
      const tileWidth = sourceWidth * .23;
      const step = 1;
      for (let x = 0; x < width; x += step) {
        const depth = sampleDepth(profile, x + step / 2, column);
        if (depth <= .05) continue;
        const contour = snowContour(depth, x, width, overhang);
        let top = baseline + contour.top;
        let bottom = baseline + contour.bottom;
        if (overhang) {
          // Round the two ends instead of cutting a rectangular snow ribbon.
          const edge = Math.min(1, (x + .5) / 10, (width - x - .5) / 10);
          const extent = Math.sqrt(Math.max(0, 1 - (1 - edge) ** 2));
          // Taper only the top; keep the underside seated on the window edge.
          top = bottom - (bottom - top) * extent;
        }
        const destinationWidth = Math.min(step, width - x);
        ctx.globalAlpha = Math.min(1, depth / 2.5);
        if (loaded) {
          const phase = x + variant * 113;
          const tile = Math.floor(phase / tileWidth);
          const offset = phase % tileWidth;
          const u = tile % 2 ? tileWidth - offset : offset;
          const sourceX = sourceStart + Math.min(sourceWidth - step / .23, u / .23);
          const bodyBottom = bottoms?.[rowIndex][Math.floor(sourceX + step / .46 - row.x)];
          const bodyEnd = bodyBottom ?? row.y + row.height - 1;
          // Reveal/crop snow at a fixed texture density instead of squeezing the
          // whole cap as the user gathers snow. Keep the underside seated.
          const textureScale = .30;
          const sourceHeight = Math.max(1, Math.min(bodyEnd - row.y + 1, (bottom - top) / textureScale));
          const renderedHeight = sourceHeight * textureScale;
          ctx.fillStyle = '#eeeaf7';
          ctx.fillRect(x, top, destinationWidth, bottom - top);
          ctx.drawImage(image, sourceX, bodyEnd + 1 - sourceHeight, step / .23, sourceHeight,
            x, bottom - renderedHeight, destinationWidth, renderedHeight);
        } else {
          const gradient = ctx.createLinearGradient(0, top, 0, bottom);
          gradient.addColorStop(0, '#fffefb');
          gradient.addColorStop(.5, '#f9f6fc');
          gradient.addColorStop(1, '#c9c4e3');
          ctx.fillStyle = gradient;
          ctx.fillRect(x, top, destinationWidth, bottom - top);
        }
      }
      ctx.restore();
    },
  };
}
