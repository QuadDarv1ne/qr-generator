'use client';

import { useQRStore } from '@/lib/qr-store';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRINT_PRESET_LABELS, type PrintPreset, type ErrorCorrectionLevel } from '@/lib/qr-types';
import { Printer, Shield } from 'lucide-react';

const EC_LABELS: Record<ErrorCorrectionLevel, { label: string; desc: string }> = {
  L: { label: 'Низкая (L)', desc: '~7% восстановление' },
  M: { label: 'Средняя (M)', desc: '~15% восстановление' },
  Q: { label: 'Высокая (Q)', desc: '~25% восстановление' },
  H: { label: 'Максимальная (H)', desc: '~30% восстановление' },
};

export function SettingsPanel() {
  const {
    errorCorrection,
    setErrorCorrection,
    resolution,
    setResolution,
    margin,
    setMargin,
    printPreset,
    setPrintPreset,
  } = useQRStore();

  return (
    <div className="space-y-5">
      {/* Error Correction */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <Label className="text-xs font-medium text-muted-foreground">
            Коррекция ошибок
          </Label>
        </div>
        <Select
          value={errorCorrection}
          onValueChange={(v) => setErrorCorrection(v as ErrorCorrectionLevel)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EC_LABELS).map(([key, val]) => (
              <SelectItem key={key} value={key}>
                <div className="flex flex-col">
                  <span>{val.label}</span>
                  <span className="text-xs text-muted-foreground">{val.desc}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resolution */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-xs font-medium text-muted-foreground">
            Разрешение
          </Label>
          <span className="text-xs text-muted-foreground font-mono">{resolution} px</span>
        </div>
        <Slider
          value={[resolution]}
          onValueChange={([r]) => setResolution(r)}
          min={256}
          max={2048}
          step={128}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>256</span>
          <span>2048</span>
        </div>
      </div>

      {/* Margin */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-xs font-medium text-muted-foreground">
            Отступ вокруг кода
          </Label>
          <span className="text-xs text-muted-foreground font-mono">{margin}%</span>
        </div>
        <Slider
          value={[margin]}
          onValueChange={([m]) => setMargin(m)}
          min={0}
          max={15}
          step={1}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0</span>
          <span>15</span>
        </div>
      </div>

      {/* Print Preset */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Printer className="h-4 w-4 text-muted-foreground" />
          <Label className="text-xs font-medium text-muted-foreground">
            Назначение печати
          </Label>
        </div>
        <Select
          value={printPreset}
          onValueChange={(v) => setPrintPreset(v as PrintPreset)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PRINT_PRESET_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {printPreset !== 'none' && (
          <p className="text-xs text-muted-foreground">
            Пресет переопределяет разрешение и коррекцию ошибок при экспорте.
          </p>
        )}
      </div>
    </div>
  );
}
