'use client';

import { useCallback, useState } from 'react';
import { useQRStore } from '@/lib/qr-store';
import { validateQRData } from '@/lib/qr-encoders';
import { renderQRToCanvas, generateQRSVG, getPrintPresetConfig } from '@/lib/qr-renderer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileArchive, Loader2, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const BATCH_SIZE_OPTIONS = [
  { value: '512', label: '512 px' },
  { value: '1024', label: '1024 px' },
  { value: '2048', label: '2048 px' },
];

export function BatchPanel() {
  const {
    dataType,
    formData,
    colors,
    dotShape,
    eyeFrame,
    eyeBall,
    errorCorrection,
    printPreset,
    logo,
    logoSize,
  } = useQRStore();

  const [lines, setLines] = useState('');
  const [format, setFormat] = useState<'png' | 'svg'>('png');
  const [size, setSize] = useState(1024);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const items = lines
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const effectiveEC =
    printPreset !== 'none' ? getPrintPresetConfig(printPreset).errorCorrection : errorCorrection;

  const buildOptions = useCallback(
    (data: string, renderSize: number) => ({
      data,
      size: renderSize,
      colors,
      dotShape,
      eyeFrame,
      eyeBall,
      errorCorrection: effectiveEC,
      logo: logo.dataUrl,
      logoSize,
      margin: renderSize * 0.08,
    }),
    [colors, dotShape, eyeFrame, eyeBall, effectiveEC, logo, logoSize]
  );

  const download = async () => {
    if (!items.length) {
      toast.error('Введите хотя бы одну строку');
      return;
    }

    const tooLong = items.filter((item) => validateQRData(item, effectiveEC) !== null);
    if (tooLong.length) {
      toast.error(
        `Строк слишком длинных для QR: ${tooLong.length}. Увеличьте коррекцию ошибок или сократите текст.`
      );
      return;
    }

    setBusy(true);
    setProgress(0);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const folder = zip.folder('qrcodes')!;

      for (let i = 0; i < items.length; i++) {
        const data = items[i];
        const opts = buildOptions(data, size);
        const slug =
          data
            .replace(/[^\p{L}\p{N}]+/gu, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 24) || 'qr';
        const name = `qr-${String(i + 1).padStart(3, '0')}-${slug}`;

        if (format === 'png') {
          const canvas = document.createElement('canvas');
          await renderQRToCanvas(canvas, opts);
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/png')
          );
          if (blob) folder.file(`${name}.png`, blob);
        } else {
          const svg = await generateQRSVG(opts);
          folder.file(`${name}.svg`, svg);
        }
        setProgress(Math.round(((i + 1) / items.length) * 100));
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcodes-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Сгенерировано ${items.length} QR-кодов в ZIP`);
    } catch {
      toast.error('Ошибка при пакетной генерации');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
        <Layers className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Создайте множество QR-кодов сразу: введите по одному значению в строку — номера столов,
          ссылки, серийные номера и т.д. Используются текущие настройки дизайна.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Значения (одно на строку)</Label>
        <Textarea
          placeholder={'https://example.com/1\nhttps://example.com/2\nСтол №3'}
          value={lines}
          onChange={(e) => setLines(e.target.value)}
          rows={5}
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Готово строк: <span className="font-medium text-foreground">{items.length}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Формат</Label>
          <Select
            value={format}
            onValueChange={(v) => setFormat(v as 'png' | 'svg')}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="svg">SVG (вектор)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Размер</Label>
          <Select
            value={String(size)}
            onValueChange={(v) => setSize(parseInt(v, 10))}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BATCH_SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {busy && (
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">{progress}%</p>
        </div>
      )}

      <Button
        onClick={download}
        disabled={busy || items.length === 0}
        className={cn('w-full')}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileArchive className="h-4 w-4 mr-2" />
        )}
        {busy ? `Генерация… ${progress}%` : 'Скачать все как ZIP'}
      </Button>
    </div>
  );
}