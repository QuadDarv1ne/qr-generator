import { NextRequest, NextResponse } from 'next/server';
import { generateQRSVG } from '@/lib/qr-renderer';
import type {
  DotShape,
  EyeFrameShape,
  EyeBallShape,
  ErrorCorrectionLevel,
} from '@/lib/qr-types';

export const runtime = 'nodejs';

const DOT_SHAPES: DotShape[] = [
  'square', 'rounded', 'dots', 'classy', 'classy-rounded', 'diamond', 'star', 'extra-rounded',
];
const EYE_FRAMES: EyeFrameShape[] = ['square', 'dot', 'rounded', 'extra-rounded', 'circle'];
const EYE_BALLS: EyeBallShape[] = ['square', 'dot', 'rounded', 'circle'];
const EC_LEVELS: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];

const isHexColor = (v: string | null): v is string =>
  !!v && /^#[0-9a-fA-F]{3,8}$/.test(v);

const pick = <T>(list: readonly T[], v: string | null, fallback: T): T =>
  list.includes(v as T) ? (v as T) : fallback;

const intParam = (sp: URLSearchParams, name: string, fallback: number, min: number, max: number) => {
  const parsed = parseInt(sp.get(name) || '', 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

/**
 * GET /api/qr?data=...&size=1024&foreground=#000000&background=#FFFFFF
 *     &dotShape=square&eyeFrame=square&eyeBall=square&ec=M&mode=solid
 *     &gradientStart=...&gradientEnd=...&gradientRotation=45&margin=8
 *
 * Returns a pure vector SVG of the QR code (no raster embedded).
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const data = sp.get('data')?.trim();
  if (!data || data.length < 2) {
    return NextResponse.json(
      { error: 'Параметр "data" обязателен (минимум 2 символа)' },
      { status: 400 }
    );
  }

  const size = intParam(sp, 'size', 1024, 128, 4096);
  const marginPct = intParam(sp, 'margin', 8, 0, 20);
  const mode = sp.get('mode') === 'gradient' ? 'gradient' : 'solid';
  const gradientType = sp.get('gradientType') === 'radial' ? 'radial' : 'linear';
  const gradientRotation = intParam(sp, 'gradientRotation', 0, 0, 360);
  const ec = pick(EC_LEVELS, sp.get('ec'), 'M');

  const foreground = isHexColor(sp.get('foreground')) ? sp.get('foreground')! : '#000000';
  const background = isHexColor(sp.get('background')) ? sp.get('background')! : '#FFFFFF';
  const gradientStart = isHexColor(sp.get('gradientStart')) ? sp.get('gradientStart')! : '#000000';
  const gradientEnd = isHexColor(sp.get('gradientEnd')) ? sp.get('gradientEnd')! : '#4F46E5';

  try {
    const svg = await generateQRSVG({
      data,
      size,
      colors: {
        mode,
        foregroundColor: foreground,
        backgroundColor: background,
        gradientType,
        gradientStartColor: gradientStart,
        gradientEndColor: gradientEnd,
        gradientRotation,
        useSeparateDotColor: false,
        dotColor: '#000000',
      },
      dotShape: pick(DOT_SHAPES, sp.get('dotShape'), 'square'),
      eyeFrame: pick(EYE_FRAMES, sp.get('eyeFrame'), 'square'),
      eyeBall: pick(EYE_BALLS, sp.get('eyeBall'), 'square'),
      errorCorrection: ec,
      logo: null,
      margin: size * (marginPct / 100),
    });

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': 'inline; filename="qrcode.svg"',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Не удалось сгенерировать QR-код' },
      { status: 422 }
    );
  }
}
