'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQRStore } from '@/lib/qr-store';
import { importQRContent } from '@/lib/qr-importer';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Upload, Camera, ScanLine, Copy, Check, Import, Loader2, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DecodeResult {
  data: string;
  type: string;
}

const VIDEO_WIDTH = 640;
const DECODE_INTERVAL_MS = 600;

function describeType(dataType: string): string {
  const labels: Record<string, string> = {
    url: 'URL-ссылка',
    text: 'Текст',
    email: 'Email',
    phone: 'Телефон',
    sms: 'SMS',
    wifi: 'Wi-Fi',
    vcard: 'Контакт (vCard)',
    location: 'Геолокация',
    event: 'Событие',
    crypto: 'Криптовалюта',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
  };
  return labels[dataType] ?? dataType;
}

export function ScannerPanel() {
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [decoding, setDecoding] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCamera = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const decodeFromCanvas = useCallback(async (): Promise<string | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const jsQR = (await import('jsqr')).default;
      const qr = jsQR(imageData.data, imageData.width, imageData.height);
      return qr?.data ?? null;
    } catch {
      return null;
    }
  }, []);

  const handleDecoded = useCallback((data: string) => {
    const { dataType } = importQRContent(data);
    setResult({ data, type: describeType(dataType) });
  }, []);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';
      setBusy(true);
      setResult(null);
      const objectUrl = URL.createObjectURL(file);
      try {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Не удалось прочитать изображение'));
          img.src = objectUrl;
        });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d', { willReadFrequently: true })?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = await decodeFromCanvas();
        if (data) {
          handleDecoded(data);
        } else {
          toast.error('QR-код не найден на изображении');
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Не удалось прочитать изображение');
      } finally {
        URL.revokeObjectURL(objectUrl);
        setBusy(false);
      }
    },
    [decodeFromCanvas, handleDecoded]
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: VIDEO_WIDTH } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setCameraOn(true);

      timerRef.current = setInterval(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) return;
        canvas.width = VIDEO_WIDTH;
        canvas.height = Math.round((video.videoHeight / video.videoWidth) * VIDEO_WIDTH);
        canvas
          .getContext('2d', { willReadFrequently: true })
          ?.drawImage(video, 0, 0, canvas.width, canvas.height);
        setDecoding(true);
        const data = await decodeFromCanvas();
        setDecoding(false);
        if (data) {
          handleDecoded(data);
          stopCamera();
          toast.success('QR-код распознан');
        }
      }, DECODE_INTERVAL_MS);
    } catch {
      setCameraError(
        'Не удалось получить доступ к камере. Разрешите доступ в браузере или используйте загрузку изображения.'
      );
    }
  }, [decodeFromCanvas, handleDecoded, stopCamera]);

  const importToGenerator = useCallback(() => {
    if (!result) return;
    const { dataType, formData } = importQRContent(result.data);
    useQRStore.setState({ dataType, formData });
    toast.success(`Данные импортированы: ${result.type}`);
  }, [result]);

  const copyResult = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Не удалось скопировать');
    }
  }, [result]);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
        <ScanLine className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Сканируйте существующие QR-коды: загрузите фото или наведите камеру.
          Распознанный код можно скопировать или вставить в генератор.
        </p>
      </div>

      <Tabs defaultValue="image">
        <TabsList className="w-full">
          <TabsTrigger value="image" className="flex-1">
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Изображение
          </TabsTrigger>
          <TabsTrigger value="camera" className="flex-1">
            <Camera className="h-3.5 w-3.5 mr-1.5" />
            Камера
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="space-y-3">
          <label
            htmlFor="qr-scan-upload"
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Загрузить изображение с QR-кодом</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP</p>
            </div>
            <input
              ref={fileRef}
              id="qr-scan-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFile}
            />
          </label>
          {busy && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Распознавание…
            </div>
          )}
        </TabsContent>

        <TabsContent value="camera" className="space-y-3">
          {cameraOn ? (
            <div className="relative rounded-xl overflow-hidden border border-border bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-auto max-h-80 object-contain"
              />
              {decoding && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <Button onClick={startCamera} variant="outline" className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Включить камеру
            </Button>
          )}
          {cameraOn && (
            <Button onClick={stopCamera} variant="ghost" size="sm" className="w-full text-muted-foreground">
              Остановить камеру
            </Button>
          )}
          {cameraError && (
            <p className="text-xs text-destructive flex items-start gap-1.5 rounded-lg bg-destructive/10 p-2.5">
              <ImageOff className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {cameraError}
            </p>
          )}
        </TabsContent>
      </Tabs>

      <canvas ref={canvasRef} className="hidden" />

      {result && (
        <div className="space-y-3 rounded-xl border border-border p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Распознано: {result.type}</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={copyResult}
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied ? 'Скопировано' : 'Копировать'}
            </Button>
          </div>
          <div
            className={cn(
              'p-3 rounded-lg border text-xs font-mono break-all max-h-24 overflow-y-auto',
              'bg-muted/50 text-muted-foreground leading-relaxed'
            )}
          >
            {result.data}
          </div>
          <Button onClick={importToGenerator} className="w-full">
            <Import className="h-4 w-4 mr-2" />
            Вставить в генератор
          </Button>
        </div>
      )}
    </div>
  );
}