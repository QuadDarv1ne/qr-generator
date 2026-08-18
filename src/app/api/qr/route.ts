import { NextRequest, NextResponse } from 'next/server';
import { generateQRSVG } from '@/lib/qr-renderer';
import { validateQRData } from '@/lib/qr-encoders';
import { z } from 'zod';
import type {
  DotShape,
  EyeFrameShape,
  EyeBallShape,
  ErrorCorrectionLevel,
  LogoShape,
} from '@/lib/qr-types';

export const runtime = 'nodejs';

const DOT_SHAPES: DotShape[] = [
  'square', 'rounded', 'dots', 'classy', 'classy-rounded', 'diamond', 'star', 'extra-rounded',
  'triangle', 'hexagon', 'flower',
];
const EYE_FRAMES: EyeFrameShape[] = ['square', 'dot', 'rounded', 'extra-rounded', 'circle'];
const EYE_BALLS: EyeBallShape[] = ['square', 'dot', 'rounded', 'circle'];
const EC_LEVELS: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];
const LOGO_SHAPES: LogoShape[] = ['rounded', 'circle', 'square'];

const isHexColor = (v: string | null): v is string =>
  !!v && /^#[0-9a-fA-F]{3,8}$/.test(v);

const pick = <T>(list: readonly T[], v: string | null, fallback: T): T =>
  list.includes(v as T) ? (v as T) : fallback;

const intParam = (sp: URLSearchParams, name: string, fallback: number, min: number, max: number) => {
  const parsed = parseInt(sp.get(name) || '', 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

const hexColor = (def: string) =>
  z
    .string()
    .regex(/^#[0-9a-fA-F]{3,8}$/, 'Ожидается HEX-цвет вида #RRGGBB')
    .default(def);

/**
 * POST /api/qr
 * JSON-тело: { data, size?, margin?, ec?, mode?, foreground?, background?,
 *   gradientType?, gradientStart?, gradientEnd?, gradientRotation?,
 *   dotShape?, eyeFrame?, eyeBall?, transparent?, logoSize?, logoShape?, logo? }
 * Логотип передаётся как data URL (base64) — позволяет обойти лимиты длины URL.
 * Возвращает векторный SVG.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON в теле запроса' }, { status: 400 });
  }

  const schema = z.object({
    data: z.string().trim().min(2, 'Поле "data" обязательно (минимум 2 символа)').max(10000),
    size: z.number().int().min(128).max(4096).default(1024),
    margin: z.number().min(0).max(20).default(8),
    ec: z.enum(EC_LEVELS).default('M'),
    mode: z.enum(['solid', 'gradient']).default('solid'),
    foreground: hexColor('#000000'),
    background: hexColor('#FFFFFF'),
    gradientType: z.enum(['linear', 'radial']).default('linear'),
    gradientStart: hexColor('#000000'),
    gradientEnd: hexColor('#4F46E5'),
    gradientRotation: z.number().min(0).max(360).default(0),
    // Separate dot color
    useSeparateDotColor: z.boolean().default(false),
    dotColor: hexColor('#000000'),
    // Separate eye colors
    useSeparateEyeColor: z.boolean().default(false),
    eyeFrameColor: hexColor('#000000'),
    eyeBallColor: hexColor('#000000'),
    dotShape: z.enum(DOT_SHAPES).default('square'),
    eyeFrame: z.enum(EYE_FRAMES).default('square'),
    eyeBall: z.enum(EYE_BALLS).default('square'),
    transparent: z.boolean().default(false),
    logoSize: z.number().min(10).max(40).default(22),
    logoShape: z.enum(LOGO_SHAPES).default('rounded'),
    logo: z.string().max(5_000_000).nullable().optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first ? `${first.path.join('.')}: ${first.message}` : 'Некорректный запрос' },
      { status: 400 }
    );
  }
  const p = parsed.data;

  const capacityError = validateQRData(p.data, p.ec);
  if (capacityError) {
    return NextResponse.json({ error: capacityError }, { status: 400 });
  }

  const logo = p.logo && /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/.test(p.logo)
    ? p.logo
    : null;

  try {
    const svg = await generateQRSVG({
      data: p.data,
      size: p.size,
      colors: {
        mode: p.mode,
        foregroundColor: p.foreground,
        backgroundColor: p.background,
        gradientType: p.gradientType,
        gradientStartColor: p.gradientStart,
        gradientEndColor: p.gradientEnd,
        gradientRotation: p.gradientRotation,
        useSeparateDotColor: p.useSeparateDotColor,
        dotColor: p.dotColor,
        transparentBackground: p.transparent,
        useSeparateEyeColor: p.useSeparateEyeColor,
        eyeFrameColor: p.eyeFrameColor,
        eyeBallColor: p.eyeBallColor,
      },
      dotShape: p.dotShape,
      eyeFrame: p.eyeFrame,
      eyeBall: p.eyeBall,
      errorCorrection: p.ec,
      logo,
      logoSize: p.logoSize,
      logoShape: p.logoShape,
      margin: p.size * (p.margin / 100),
    });

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-store',
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

/**
 * GET /api/qr?data=...&size=1024&foreground=#000000&background=#FFFFFF
 *     &dotShape=square&eyeFrame=square&eyeBall=square&ec=M&mode=solid
 *     &gradientStart=...&gradientEnd=...&gradientRotation=45&margin=8&transparent=0
 *     &logoSize=22&logoShape=rounded
 *     &useSeparateDotColor=1&dotColor=#FF0000
 *     &useSeparateEyeColor=1&eyeFrameColor=#0000FF&eyeBallColor=#00FF00
 *
 * Возвращает векторный SVG QR-кода. Для логотипа и больших данных используйте POST.
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
  const dotColor = isHexColor(sp.get('dotColor')) ? sp.get('dotColor')! : '#000000';
  const eyeFrameColor = isHexColor(sp.get('eyeFrameColor')) ? sp.get('eyeFrameColor')! : '#000000';
  const eyeBallColor = isHexColor(sp.get('eyeBallColor')) ? sp.get('eyeBallColor')! : '#000000';
  const useSeparateDotColor = sp.get('useSeparateDotColor') === '1';
  const useSeparateEyeColor = sp.get('useSeparateEyeColor') === '1';

  // Data capacity check for the given error correction level
  const capacityError = validateQRData(data, ec);
  if (capacityError) {
    return NextResponse.json({ error: capacityError }, { status: 400 });
  }

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
        useSeparateDotColor,
        dotColor,
        transparentBackground: sp.get('transparent') === '1',
        useSeparateEyeColor,
        eyeFrameColor,
        eyeBallColor,
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
