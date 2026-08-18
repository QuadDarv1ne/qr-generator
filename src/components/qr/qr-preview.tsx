'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQRStore } from '@/lib/qr-store';
import { encodeQRData } from '@/lib/qr-encoders';
import { renderQRToCanvas, getPrintPresetConfig } from '@/lib/qr-renderer';

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
  } = useQRStore();

  const [rendering, setRendering] = useState(false);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setRendering(true);
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
        margin: size * 0.08,
      });
    } catch {
      // QR generation failed (likely empty data)
    } finally {
      setRendering(false);
    }
  }, [dataType, formData, colors, dotShape, eyeFrame, eyeBall, errorCorrection, resolution, printPreset, logo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      render();
    }, 50);
    return () => clearTimeout(timer);
  }, [render]);

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
      </div>
    </div>
  );
}

export { QRPreview };