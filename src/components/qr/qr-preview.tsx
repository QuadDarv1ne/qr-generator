'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQRStore } from '@/lib/qr-store';
import { encodeQRData } from '@/lib/qr-encoders';
import { renderQRToCanvas, getPrintPresetConfig } from '@/lib/qr-renderer';
import { Button } from '@/components/ui/button';
import { ScanLine, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ScanResult = { ok: boolean; message: string } | null;

export function QRPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    dataType,
    formData,
    colors,
    dotShape,
    eyeFrame,
    eyeBall,
    errorCorrection,
    resolution,
    printPreset,
    logo,
    logoSize,
  } = useQRStore();

  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult>(null);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setRendering(true);
    setError(null);
    try {
      const data = encodeQRData(dataType, formData);
      const presetConfig = getPrintPresetConfig(printPreset);
      const size = Math.min(resolution, 600);

      await renderQRToCanvas(canvas, {
        data,
        size,
        colors,
        dotShape,
        eyeFrame,
        eyeBall,
        errorCorrection: printPreset !== 'none' ? presetConfig.errorCorrection : errorCorrection,
        logo: logo.dataUrl,
        logoSize,
        margin: size * 0.08,
      });
    } catch {
      setError('Не удалось сгенерировать QR-код. Проверьте введённые данные.');
    } finally {
      setRendering(false);
    }
  }, [dataType, formData, colors, dotShape, eyeFrame, eyeBall, errorCorrection, resolution, printPreset, logo, logoSize]);

  useEffect(() => {
    // Skip rendering during SSR
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      render();
    }, 50);
    return () => clearTimeout(timer);
  }, [render]);

  const verifyScan = useCallback(async () => {
    const data = encodeQRData(dataType, formData);
    if (!data || data.length < 2) {
      setScanResult({ ok: false, message: 'Введите данные для проверки' });
      return;
    }

    setScanning(true);
    setScanResult(null);
    try {
      // Render at a fixed high resolution so the decoder can work reliably
      const canvas = document.createElement('canvas');
      const presetConfig = getPrintPresetConfig(printPreset);
      await renderQRToCanvas(canvas, {
        data,
        size: 1024,
        colors,
        dotShape,
        eyeFrame,
        eyeBall,
        errorCorrection: printPreset !== 'none' ? presetConfig.errorCorrection : errorCorrection,
        logo: logo.dataUrl,
        logoSize,
        margin: 1024 * 0.08,
      });

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no ctx');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const jsQR = (await import('jsqr')).default;
      const result = jsQR(imageData.data, imageData.width, imageData.height);

      if (result && result.data) {
        const matches = result.data === data;
        setScanResult({
          ok: true,
          message: matches
            ? 'QR-код сканируется корректно, содержимое совпадает'
            : 'QR-код сканируется, но содержимое отличается от ожидаемого',
        });
      } else {
        setScanResult({
          ok: false,
          message: 'Код не распознан. Попробуйте увеличить коррекцию ошибок (H) или уменьшить логотип.',
        });
      }
    } catch {
      setScanResult({ ok: false, message: 'Не удалось выполнить проверку' });
    } finally {
      setScanning(false);
    }
  }, [dataType, formData, colors, dotShape, eyeFrame, eyeBall, errorCorrection, printPreset, logo, logoSize]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={
          'relative rounded-2xl border-2 border-border p-4 bg-white transition-all duration-300'
        }
      >
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="max-w-full h-auto"
          style={{
            opacity: rendering ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        />
        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-xl">
            <p className="text-xs text-destructive text-center px-4">{error}</p>
          </div>
        )}
      </div>

      <Button
        onClick={verifyScan}
        disabled={scanning || rendering}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        {scanning ? (
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        ) : (
          <ScanLine className="h-3.5 w-3.5 mr-1.5" />
        )}
        Проверить сканируемость
      </Button>

      {scanResult && (
        <p
          className={cn(
            'text-xs flex items-center gap-1.5 rounded-lg px-3 py-1.5',
            scanResult.ok
              ? 'bg-green-500/10 text-green-600'
              : 'bg-red-500/10 text-red-600'
          )}
        >
          {scanResult.ok ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <XCircle className="h-3.5 w-3.5 shrink-0" />
          )}
          {scanResult.message}
        </p>
      )}
    </div>
  );
}