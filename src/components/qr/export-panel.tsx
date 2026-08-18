'use client';

import { useCallback, useState } from 'react';
import { useQRStore } from '@/lib/qr-store';
import { encodeQRData, validateQRData } from '@/lib/qr-encoders';
import { renderQRToCanvas, generateQRSVG, getPrintPresetConfig } from '@/lib/qr-renderer';
import { Button } from '@/components/ui/button';
import { Download, FileImage, FileText, Loader2, Copy, RotateCcw, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PDF_SIZE_OPTIONS = [
  { value: 'auto', label: 'Авто' },
  { value: '15', label: '15 × 15 мм' },
  { value: '20', label: '20 × 20 мм' },
  { value: '25', label: '25 × 25 мм' },
  { value: '30', label: '30 × 30 мм' },
  { value: '40', label: '40 × 40 мм' },
  { value: '50', label: '50 × 50 мм' },
];

export function ExportPanel() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [pdfSize, setPdfSize] = useState('auto');
  const [copied, setCopied] = useState(false);

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

  const getDataString = useCallback(() => {
    return encodeQRData(dataType, formData);
  }, [dataType, formData]);

  /** Effective error correction: print presets override the manual setting */
  const getEffectiveErrorCorrection = useCallback(() => {
    return printPreset !== 'none'
      ? getPrintPresetConfig(printPreset).errorCorrection
      : errorCorrection;
  }, [printPreset, errorCorrection]);

  const getExportOptions = useCallback(() => {
    const data = getDataString();
    const presetConfig = getPrintPresetConfig(printPreset);
    const size = printPreset !== 'none' ? presetConfig.size : resolution;
    return {
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
    };
  }, [dataType, formData, colors, dotShape, eyeFrame, eyeBall, errorCorrection, resolution, printPreset, logo, logoSize, getDataString]);

  const validate = (): string | null => {
    const data = getDataString();
    const err = validateQRData(data, getEffectiveErrorCorrection());
    if (err) return err;
    return null;
  };

  const copyToClipboard = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }

    try {
      const canvas = document.createElement('canvas');
      const opts = getExportOptions();
      opts.size = 512;
      opts.margin = 512 * 0.08;
      await renderQRToCanvas(canvas, opts);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (!blob) { toast.error('Не удалось создать изображение'); return; }

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      toast.success('QR-код скопирован в буфер обмена');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Не удалось скопировать. Попробуйте скачать PNG.');
    }
  };

  const resetAll = () => {
    useQRStore.getState().reset();
    toast.success('Настройки сброшены');
  };

  const exportPNG = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }

    setExporting('png');
    try {
      const canvas = document.createElement('canvas');
      const opts = getExportOptions();
      await renderQRToCanvas(canvas, opts);

      // Fallback: use toDataURL if toBlob is not available
      const blob = await new Promise<Blob | null>((resolve) => {
        if (canvas.toBlob) {
          canvas.toBlob(resolve, 'image/png');
        } else {
          // Fallback for environments without toBlob support
          const dataUrl = canvas.toDataURL('image/png');
          const byteString = atob(dataUrl.split(',')[1]);
          const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          resolve(new Blob([ab], { type: mimeString }));
        }
      });

      if (!blob) {
        toast.error('Не удалось создать изображение');
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('PNG успешно сохранён');
    } catch {
      toast.error('Ошибка при экспорте PNG');
    } finally {
      setExporting(null);
    }
  };

  const exportSVG = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }

    setExporting('svg');
    try {
      const opts = getExportOptions();
      const svgStr = await generateQRSVG(opts);

      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('SVG успешно сохранён');
    } catch {
      toast.error('Ошибка при экспорте SVG');
    } finally {
      setExporting(null);
    }
  };

  const exportPDF = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }

    setExporting('pdf');
    try {
      const { jsPDF } = await import('jspdf');
      const canvas = document.createElement('canvas');
      const opts = getExportOptions();
      await renderQRToCanvas(canvas, opts);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      let qrMM: number;
      if (pdfSize === 'auto') {
        qrMM = Math.min(pdfW * 0.6, pdfH * 0.6);
      } else {
        qrMM = parseFloat(pdfSize);
      }

      const x = (pdfW - qrMM) / 2;
      const y = (pdfH - qrMM) / 2;

      pdf.addImage(imgData, 'PNG', x, y, qrMM, qrMM);
      pdf.save(`qrcode-${Date.now()}.pdf`);
      toast.success('PDF успешно сохранён');
    } catch {
      toast.error('Ошибка при экспорте PDF');
    } finally {
      setExporting(null);
    }
  };

  const isExporting = !!exporting;

  return (
    <div className="flex flex-col gap-3 w-full">
        {/* Main PNG button */}
        <Button
          onClick={exportPNG}
          disabled={isExporting}
          className="w-full"
          size="lg"
        >
          {exporting === 'png' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileImage className="h-4 w-4 mr-2" />
          )}
          Скачать PNG
        </Button>

        {/* Secondary row */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={exportSVG}
            disabled={isExporting}
            variant="outline"
            size="lg"
            className="text-xs"
          >
            {exporting === 'svg' ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 mr-1" />
            )}
            SVG
          </Button>
          <Button
            onClick={exportPDF}
            disabled={isExporting}
            variant="outline"
            size="lg"
            className="text-xs"
          >
            {exporting === 'pdf' ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5 mr-1" />
            )}
            PDF
          </Button>
          <Button
            onClick={copyToClipboard}
            disabled={isExporting}
            variant="outline"
            size="lg"
            className="text-xs"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 mr-1" />
            ) : (
              <Copy className="h-3.5 w-3.5 mr-1" />
            )}
            {copied ? 'Готово' : 'Копия'}
          </Button>
        </div>

        {/* PDF size selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Размер в PDF</label>
          <Select value={pdfSize} onValueChange={setPdfSize}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PDF_SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset button */}
        <Button
          onClick={resetAll}
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Сбросить настройки
        </Button>
      </div>
  );
}
