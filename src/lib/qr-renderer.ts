import QRCode from 'qrcode';
import type { QRColorSettings, DotShape, EyeFrameShape, EyeBallShape, ErrorCorrectionLevel, LogoShape } from './qr-types';

export interface QRRenderOptions {
  data: string;
  size: number;
  colors: QRColorSettings;
  dotShape: DotShape;
  eyeFrame: EyeFrameShape;
  eyeBall: EyeBallShape;
  errorCorrection: ErrorCorrectionLevel;
  logo?: string | null;
  logoSize?: number;
  logoShape?: LogoShape;
  margin: number;
}

export type { LogoShape };

function getFinderPositions(moduleCount: number) {
  return [
    { row: 0, col: 0 },
    { row: 0, col: moduleCount - 7 },
    { row: moduleCount - 7, col: 0 },
  ];
}

function isFinderZone(row: number, col: number, moduleCount: number) {
  const finders = getFinderPositions(moduleCount);
  for (const f of finders) {
    if (row >= f.row && row < f.row + 7 && col >= f.col && col < f.col + 7) {
      return true;
    }
  }
  return false;
}

export async function generateQRMatrix(data: string, ecLevel: ErrorCorrectionLevel) {
  const qr = QRCode.create(data, {
    errorCorrectionLevel: ecLevel,
    version: undefined,
  });
  const modules = qr.modules;
  const moduleCount = modules.size;
  const data2d: boolean[][] = [];
  for (let r = 0; r < moduleCount; r++) {
    data2d[r] = [];
    for (let c = 0; c < moduleCount; c++) {
      data2d[r][c] = modules.get(r, c);
    }
  }
  return { data2d, moduleCount };
}

/** Create gradient on the actual target context — no temp canvas */
function createGradient(
  ctx: CanvasRenderingContext2D,
  colors: QRColorSettings,
  size: number
): CanvasGradient {
  const half = size / 2;
  if (colors.gradientType === 'radial') {
    return ctx.createRadialGradient(half, half, 0, half, half, half);
  }
  const angle = (colors.gradientRotation * Math.PI) / 180;
  const len = half;
  return ctx.createLinearGradient(
    half - Math.cos(angle) * len,
    half - Math.sin(angle) * len,
    half + Math.cos(angle) * len,
    half + Math.sin(angle) * len
  );
}

function applyModuleFillStyle(
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  moduleCount: number,
  colors: QRColorSettings,
  size: number,
  margin: number,
  gradient: CanvasGradient | null
) {
  if (colors.mode === 'solid') {
    if (colors.useSeparateDotColor && !isFinderZone(row, col, moduleCount)) {
      ctx.fillStyle = colors.dotColor;
    } else {
      ctx.fillStyle = colors.foregroundColor;
    }
  } else {
    // Gradient mode — reuse pre-built gradient (it covers full canvas)
    ctx.fillStyle = gradient!;
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  shape: DotShape
) {
  const s = size;
  const gap = s * 0.08;
  const ds = s - gap * 2;
  const cx = x + s / 2;
  const cy = y + s / 2;

  switch (shape) {
    case 'square':
      ctx.fillRect(x + gap, y + gap, ds, ds);
      break;
    case 'rounded': {
      const r = ds * 0.25;
      roundRect(ctx, x + gap, y + gap, ds, ds, r);
      ctx.fill();
      break;
    }
    case 'dots': {
      ctx.beginPath();
      ctx.arc(cx, cy, ds / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'classy': {
      // Slightly smaller circles with more gap for a distinguished look
      const r = ds * 0.42;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'classy-rounded': {
      const r = ds * 0.35;
      roundRect(ctx, x + gap, y + gap, ds, ds, r);
      ctx.fill();
      break;
    }
    case 'diamond': {
      ctx.beginPath();
      ctx.moveTo(cx, y + gap);
      ctx.lineTo(x + gap + ds, cy);
      ctx.lineTo(cx, y + gap + ds);
      ctx.lineTo(x + gap, cy);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'star': {
      drawStar(ctx, cx, cy, ds / 2, ds / 4, 4);
      ctx.fill();
      break;
    }
    case 'extra-rounded': {
      const r = ds * 0.5;
      roundRect(ctx, x + gap, y + gap, ds, ds, r);
      ctx.fill();
      break;
    }
    case 'triangle': {
      ctx.beginPath();
      ctx.moveTo(cx, y + gap);
      ctx.lineTo(x + gap + ds, y + gap + ds);
      ctx.lineTo(x + gap, y + gap + ds);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'hexagon': {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = cx + Math.cos(angle) * (ds / 2);
        const py = cy + Math.sin(angle) * (ds / 2);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'flower': {
      const petalR = ds * 0.28;
      const petals: [number, number][] = [
        [cx - ds * 0.2, cy],
        [cx + ds * 0.2, cy],
        [cx, cy - ds * 0.2],
        [cx, cy + ds * 0.2],
      ];
      for (const [px, py] of petals) {
        ctx.beginPath();
        ctx.arc(px, py, petalR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, petalR * 0.85, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}

function drawEyeFrame(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  moduleSize: number,
  shape: EyeFrameShape
) {
  const outerSize = moduleSize * 7;
  const half = outerSize / 2;
  const x = cx - half;
  const y = cy - half;

  ctx.strokeStyle = ctx.fillStyle as string;
  ctx.lineWidth = moduleSize;
  ctx.lineJoin = 'round';

  switch (shape) {
    case 'square':
      ctx.beginPath();
      ctx.rect(x + 0.5, y + 0.5, outerSize - 1, outerSize - 1);
      ctx.stroke();
      break;
    case 'dot':
      ctx.beginPath();
      ctx.arc(cx, cy, half - moduleSize / 2, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'rounded': {
      const r = outerSize * 0.12;
      roundRect(ctx, x, y, outerSize, outerSize, r);
      ctx.stroke();
      break;
    }
    case 'extra-rounded': {
      const r = outerSize * 0.35;
      roundRect(ctx, x, y, outerSize, outerSize, r);
      ctx.stroke();
      break;
    }
    case 'circle':
      ctx.beginPath();
      ctx.arc(cx, cy, half - moduleSize / 2, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }
}

function drawEyeBall(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  moduleSize: number,
  shape: EyeBallShape
) {
  const size = moduleSize * 3;
  const half = size / 2;

  switch (shape) {
    case 'square':
      ctx.fillRect(cx - half, cy - half, size, size);
      break;
    case 'dot': {
      ctx.beginPath();
      ctx.arc(cx, cy, half * 0.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'rounded': {
      const r = size * 0.2;
      roundRect(ctx, cx - half, cy - half, size, size, r);
      ctx.fill();
      break;
    }
    case 'circle':
      ctx.beginPath();
      ctx.arc(cx, cy, half, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  logoDataUrl: string,
  size: number,
  moduleCount: number,
  margin: number,
  bgColor: string,
  logoSizePct = 22,
  logoShape: LogoShape = 'rounded'
) {
  // Skip if no valid logo data
  if (!logoDataUrl || logoDataUrl.trim() === '') {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const logoModules = Math.floor(moduleCount * (logoSizePct / 100));
      const moduleSize = (size - margin * 2) / moduleCount;
      const logoSizePx = moduleSize * logoModules;
      const padding = logoSizePx * 0.15;
      const x = (size - logoSizePx) / 2;
      const y = (size - logoSizePx) / 2;

      const bgRadius =
        logoShape === 'circle'
          ? logoSizePx / 2 + padding
          : logoShape === 'square'
            ? logoSizePx * 0.04
            : logoSizePx * 0.18;
      const clipRadius =
        logoShape === 'circle'
          ? logoSizePx / 2
          : logoShape === 'square'
            ? logoSizePx * 0.04
            : bgRadius * 0.7;

      // Background with padding
      ctx.fillStyle = bgColor;
      roundRect(ctx, x - padding, y - padding, logoSizePx + padding * 2, logoSizePx + padding * 2, bgRadius);
      ctx.fill();

      // Logo image clipped to rounded rect
      ctx.save();
      roundRect(ctx, x, y, logoSizePx, logoSizePx, clipRadius);
      ctx.clip();
      ctx.drawImage(img, x, y, logoSizePx, logoSizePx);
      ctx.restore();

      resolve();
    };
    img.onerror = () => resolve();
    img.src = logoDataUrl;
  });
}

export async function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  options: QRRenderOptions
): Promise<void> {
  const { data, size, colors, dotShape, eyeFrame, eyeBall, errorCorrection, logo, margin, logoSize = 22 } = options;

  if (!data || data.length === 0) {
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Не удалось получить контекст canvas');
    if (!colors.transparentBackground) {
      ctx.fillStyle = colors.backgroundColor;
      ctx.fillRect(0, 0, size, size);
    }
    ctx.fillStyle = '#999999';
    ctx.font = `${Math.round(size * 0.04)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Введите данные для QR-кода', size / 2, size / 2);
    return;
  }

  const { data2d, moduleCount } = await generateQRMatrix(data, errorCorrection);

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Background (skipped when transparent)
  if (!colors.transparentBackground) {
    ctx.fillStyle = colors.backgroundColor;
    ctx.fillRect(0, 0, size, size);
  }

  const moduleSize = (size - margin * 2) / moduleCount;
  const finders = getFinderPositions(moduleCount);

  // Pre-build gradient on the actual context (fix: no temp canvas)
  let gradient: CanvasGradient | null = null;
  if (colors.mode === 'gradient') {
    gradient = createGradient(ctx, colors, size);
    gradient.addColorStop(0, colors.gradientStartColor);
    gradient.addColorStop(1, colors.gradientEndColor);
  }

  // Finder centers for eye rendering
  const finderCenters = finders.map((f) => ({
    cx: margin + (f.col + 3.5) * moduleSize,
    cy: margin + (f.row + 3.5) * moduleSize,
  }));

  // Draw data modules (non-finder zones)
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (isFinderZone(r, c, moduleCount)) continue;
      if (!data2d[r][c]) continue;

      const x = margin + c * moduleSize;
      const y = margin + r * moduleSize;

      applyModuleFillStyle(ctx, r, c, moduleCount, colors, size, margin, gradient);
      drawDot(ctx, x, y, moduleSize, dotShape);
    }
  }

  // Draw finder patterns
  const frameColor =
    colors.mode === 'gradient'
      ? colors.gradientStartColor
      : colors.useSeparateEyeColor
        ? colors.eyeFrameColor
        : colors.foregroundColor;
  const ballColor =
    colors.mode === 'gradient'
      ? colors.gradientEndColor
      : colors.useSeparateEyeColor
        ? colors.eyeBallColor
        : colors.foregroundColor;

  for (let i = 0; i < finders.length; i++) {
    const fc = finderCenters[i];

    ctx.fillStyle = frameColor;
    drawEyeFrame(ctx, fc.cx, fc.cy, moduleSize, eyeFrame);

    ctx.fillStyle = ballColor;
    drawEyeBall(ctx, fc.cx, fc.cy, moduleSize, eyeBall);
  }

  // Draw logo
  if (logo) {
    await drawLogo(ctx, logo, size, moduleCount, margin, colors.backgroundColor, logoSize, logoShape);
  }
}

export function getPrintPresetConfig(preset: string) {
  switch (preset) {
    case 'business-card':
      return { size: 2048, errorCorrection: 'H' as const };
    case 'plastic-card':
      return { size: 2048, errorCorrection: 'H' as const };
    case 'sticker':
      return { size: 1024, errorCorrection: 'M' as const };
    case 'badge':
      return { size: 1024, errorCorrection: 'Q' as const };
    case 'menu':
      return { size: 1536, errorCorrection: 'H' as const };
    case 'packaging':
      return { size: 2048, errorCorrection: 'Q' as const };
    default:
      return { size: 1024, errorCorrection: 'M' as const };
  }
}

/* ------------------------------------------------------------------ */
/* Pure vector SVG export (no raster embedded)                         */
/* ------------------------------------------------------------------ */

const num = (n: number) => (Math.round(n * 100) / 100).toString();

function svgStarPoints(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI * i) / points - Math.PI / 2;
    pts.push(`${num(cx + Math.cos(angle) * r)},${num(cy + Math.sin(angle) * r)}`);
  }
  return pts.join(' ');
}

function svgDot(x: number, y: number, size: number, shape: DotShape, fill: string): string {
  const gap = size * 0.08;
  const ds = size - gap * 2;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const f = `fill="${fill}"`;

  switch (shape) {
    case 'square':
      return `<rect x="${num(x + gap)}" y="${num(y + gap)}" width="${num(ds)}" height="${num(ds)}" ${f}/>`;
    case 'rounded':
      return `<rect x="${num(x + gap)}" y="${num(y + gap)}" width="${num(ds)}" height="${num(ds)}" rx="${num(ds * 0.25)}" ${f}/>`;
    case 'dots':
      return `<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(ds / 2)}" ${f}/>`;
    case 'classy':
      return `<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(ds * 0.42)}" ${f}/>`;
    case 'classy-rounded':
      return `<rect x="${num(x + gap)}" y="${num(y + gap)}" width="${num(ds)}" height="${num(ds)}" rx="${num(ds * 0.35)}" ${f}/>`;
    case 'diamond':
      return `<polygon points="${num(cx)},${num(y + gap)} ${num(x + gap + ds)},${num(cy)} ${num(cx)},${num(y + gap + ds)} ${num(x + gap)},${num(cy)}" ${f}/>`;
    case 'star':
      return `<polygon points="${svgStarPoints(cx, cy, ds / 2, ds / 4, 4)}" ${f}/>`;
    case 'extra-rounded':
      return `<rect x="${num(x + gap)}" y="${num(y + gap)}" width="${num(ds)}" height="${num(ds)}" rx="${num(ds * 0.5)}" ${f}/>`;
    case 'triangle':
      return `<polygon points="${num(cx)},${num(y + gap)} ${num(x + gap + ds)},${num(y + gap + ds)} ${num(x + gap)},${num(y + gap + ds)}" ${f}/>`;
    case 'hexagon': {
      const pts: string[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        pts.push(`${num(cx + Math.cos(angle) * (ds / 2))},${num(cy + Math.sin(angle) * (ds / 2))}`);
      }
      return `<polygon points="${pts.join(' ')}" ${f}/>`;
    }
    case 'flower': {
      const petalR = ds * 0.28;
      const petals: [number, number][] = [
        [cx - ds * 0.2, cy],
        [cx + ds * 0.2, cy],
        [cx, cy - ds * 0.2],
        [cx, cy + ds * 0.2],
      ];
      const circles = petals
        .map(([px, py]) => `<circle cx="${num(px)}" cy="${num(py)}" r="${num(petalR)}" ${f}/>`)
        .join('');
      return `${circles}<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(petalR * 0.85)}" ${f}/>`;
    }
  }
}

function svgEyeFrame(cx: number, cy: number, moduleSize: number, shape: EyeFrameShape, stroke: string): string {
  const outerSize = moduleSize * 7;
  const half = outerSize / 2;
  const x = cx - half;
  const y = cy - half;
  const sw = `stroke="${stroke}" stroke-width="${num(moduleSize)}" stroke-linejoin="round" fill="none"`;

  switch (shape) {
    case 'square':
      return `<rect x="${num(x + 0.5)}" y="${num(y + 0.5)}" width="${num(outerSize - 1)}" height="${num(outerSize - 1)}" ${sw}/>`;
    case 'dot':
    case 'circle':
      return `<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(half - moduleSize / 2)}" ${sw}/>`;
    case 'rounded':
      return `<rect x="${num(x)}" y="${num(y)}" width="${num(outerSize)}" height="${num(outerSize)}" rx="${num(outerSize * 0.12)}" ${sw}/>`;
    case 'extra-rounded':
      return `<rect x="${num(x)}" y="${num(y)}" width="${num(outerSize)}" height="${num(outerSize)}" rx="${num(outerSize * 0.35)}" ${sw}/>`;
  }
}

function svgEyeBall(cx: number, cy: number, moduleSize: number, shape: EyeBallShape, fill: string): string {
  const size = moduleSize * 3;
  const half = size / 2;
  const f = `fill="${fill}"`;

  switch (shape) {
    case 'square':
      return `<rect x="${num(cx - half)}" y="${num(cy - half)}" width="${num(size)}" height="${num(size)}" ${f}/>`;
    case 'dot':
      return `<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(half * 0.8)}" ${f}/>`;
    case 'rounded':
      return `<rect x="${num(cx - half)}" y="${num(cy - half)}" width="${num(size)}" height="${num(size)}" rx="${num(size * 0.2)}" ${f}/>`;
    case 'circle':
      return `<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(half)}" ${f}/>`;
  }
}

/**
 * Generate a pure vector SVG string of the QR code (no raster embedded).
 * The logo, if any, is embedded as an <image> element.
 */
export async function generateQRSVG(options: QRRenderOptions): Promise<string> {
  const { data, size, colors, dotShape, eyeFrame, eyeBall, errorCorrection, logo, margin, logoSize = 22, logoShape = 'rounded' } = options;

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"` +
      ` width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"` +
      ` role="img" aria-label="QR-код">`
  );

  if (colors.mode === 'gradient') {
    if (colors.gradientType === 'radial') {
      parts.push(`<defs><radialGradient id="qrg" cx="50%" cy="50%" r="50%">`);
    } else {
      const angle = (colors.gradientRotation * Math.PI) / 180;
      const len = size / 2;
      const x1 = size / 2 - Math.cos(angle) * len;
      const y1 = size / 2 - Math.sin(angle) * len;
      const x2 = size / 2 + Math.cos(angle) * len;
      const y2 = size / 2 + Math.sin(angle) * len;
      parts.push(`<defs><linearGradient id="qrg" x1="${num(x1)}" y1="${num(y1)}" x2="${num(x2)}" y2="${num(y2)}">`);
    }
    parts.push(`<stop offset="0%" stop-color="${colors.gradientStartColor}"/>`);
    parts.push(`<stop offset="100%" stop-color="${colors.gradientEndColor}"/>`);
    parts.push(
      `</${colors.gradientType === 'radial' ? 'radialGradient' : 'linearGradient'}></defs>`
    );
  }

  if (!colors.transparentBackground) {
    parts.push(`<rect width="100%" height="100%" fill="${colors.backgroundColor}"/>`);
  }

  if (!data || data.length === 0) {
    parts.push(
      `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"` +
        ` font-family="sans-serif" font-size="${num(size * 0.04)}" fill="#999999">Введите данные для QR-кода</text>`
    );
    parts.push('</svg>');
    return parts.join('\n');
  }

  const { data2d, moduleCount } = await generateQRMatrix(data, errorCorrection);
  const moduleSize = (size - margin * 2) / moduleCount;
  const finders = getFinderPositions(moduleCount);
  const gradRef = colors.mode === 'gradient' ? 'url(#qrg)' : '';

  const fillFor = (row: number, col: number): string => {
    if (colors.mode === 'gradient') return gradRef;
    if (colors.useSeparateDotColor && !isFinderZone(row, col, moduleCount)) return colors.dotColor;
    return colors.foregroundColor;
  };

  // Data modules (non-finder zones)
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (isFinderZone(r, c, moduleCount)) continue;
      if (!data2d[r][c]) continue;
      const x = margin + c * moduleSize;
      const y = margin + r * moduleSize;
      parts.push(svgDot(x, y, moduleSize, dotShape, fillFor(r, c)));
    }
  }

  // Finder patterns
  const eyeFrameColor =
    colors.mode === 'gradient'
      ? colors.gradientStartColor
      : colors.useSeparateEyeColor
        ? colors.eyeFrameColor
        : colors.foregroundColor;
  const eyeBallColor =
    colors.mode === 'gradient'
      ? colors.gradientEndColor
      : colors.useSeparateEyeColor
        ? colors.eyeBallColor
        : colors.foregroundColor;

  for (const f of finders) {
    const cx = margin + (f.col + 3.5) * moduleSize;
    const cy = margin + (f.row + 3.5) * moduleSize;
    parts.push(svgEyeFrame(cx, cy, moduleSize, eyeFrame, eyeFrameColor));
    parts.push(svgEyeBall(cx, cy, moduleSize, eyeBall, eyeBallColor));
  }

  // Logo
  if (logo && logo.trim() !== '') {
    const logoModules = Math.floor(moduleCount * (logoSize / 100));
    const logoSizePx = moduleSize * logoModules;
    const padding = logoSizePx * 0.15;
    const x = (size - logoSizePx) / 2;
    const y = (size - logoSizePx) / 2;
    const bgRadius =
      logoShape === 'circle'
        ? logoSizePx / 2 + padding
        : logoShape === 'square'
          ? logoSizePx * 0.04
          : logoSizePx * 0.18;
    const clipRadius =
      logoShape === 'circle'
        ? logoSizePx / 2
        : logoShape === 'square'
          ? logoSizePx * 0.04
          : bgRadius * 0.7;
    parts.push(
      `<rect x="${num(x - padding)}" y="${num(y - padding)}" width="${num(logoSizePx + padding * 2)}"` +
        ` height="${num(logoSizePx + padding * 2)}" rx="${num(bgRadius)}" fill="${colors.backgroundColor}"/>`
    );
    parts.push(`<clipPath id="qrc"><rect x="${num(x)}" y="${num(y)}" width="${num(logoSizePx)}"` +
      ` height="${num(logoSizePx)}" rx="${num(clipRadius)}"/></clipPath>`);
    parts.push(
      `<image clip-path="url(#qrc)" x="${num(x)}" y="${num(y)}" width="${num(logoSizePx)}"` +
        ` height="${num(logoSizePx)}" href="${logo}" xlink:href="${logo}" preserveAspectRatio="none"/>`
    );
  }

  parts.push('</svg>');
  return parts.join('\n');
}
