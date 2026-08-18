'use client';

import { useQRStore } from '@/lib/qr-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ColorPreset {
  name: string;
  mode: 'solid' | 'gradient';
  foregroundColor?: string;
  backgroundColor?: string;
  gradientStartColor?: string;
  gradientEndColor?: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Классический', mode: 'solid', foregroundColor: '#000000', backgroundColor: '#FFFFFF' },
  { name: 'Индиго', mode: 'solid', foregroundColor: '#4F46E5', backgroundColor: '#FFFFFF' },
  { name: 'Изумруд', mode: 'solid', foregroundColor: '#059669', backgroundColor: '#FFFFFF' },
  { name: 'Гранат', mode: 'solid', foregroundColor: '#DC2626', backgroundColor: '#FFFFFF' },
  { name: 'Графит', mode: 'solid', foregroundColor: '#111827', backgroundColor: '#F3F4F6' },
  { name: 'Ночь', mode: 'solid', foregroundColor: '#F8FAFC', backgroundColor: '#0F172A' },
  { name: 'Закат', mode: 'gradient', gradientStartColor: '#F97316', gradientEndColor: '#7C3AED' },
  { name: 'Океан', mode: 'gradient', gradientStartColor: '#06B6D4', gradientEndColor: '#8B5CF6' },
];

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-border cursor-pointer appearance-none bg-transparent p-0.5 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm h-10"
          maxLength={7}
        />
      </div>
    </div>
  );
}

export function ColorPanel() {
  const { colors, updateColors } = useQRStore();

  const applyPreset = (preset: ColorPreset) => {
    if (preset.mode === 'solid') {
      updateColors({
        mode: 'solid',
        foregroundColor: preset.foregroundColor!,
        backgroundColor: preset.backgroundColor!,
      });
    } else {
      updateColors({
        mode: 'gradient',
        gradientStartColor: preset.gradientStartColor!,
        gradientEndColor: preset.gradientEndColor!,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Presets */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Готовые схемы</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              title={preset.name}
              className="group flex flex-col items-center gap-1 p-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/50 transition-all"
            >
              <span
                className="w-full h-5 rounded-md border border-border/60"
                style={{
                  background:
                    preset.mode === 'gradient'
                      ? `linear-gradient(135deg, ${preset.gradientStartColor}, ${preset.gradientEndColor})`
                      : preset.foregroundColor,
                }}
              />
              <span className="text-[10px] leading-tight text-center text-muted-foreground group-hover:text-foreground transition-colors">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Режим цвета</Label>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => updateColors({ mode: 'solid' })}
            className={cn(
              'flex-1 py-2 text-sm font-medium transition-colors',
              colors.mode === 'solid'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-accent text-foreground'
            )}
          >
            Сплошной
          </button>
          <button
            onClick={() => updateColors({ mode: 'gradient' })}
            className={cn(
              'flex-1 py-2 text-sm font-medium transition-colors border-l border-border',
              colors.mode === 'gradient'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-accent text-foreground'
            )}
          >
            Градиент
          </button>
        </div>
      </div>

      {colors.mode === 'solid' ? (
        <>
          <ColorPicker
            label="Цвет QR-кода"
            value={colors.foregroundColor}
            onChange={(foregroundColor) => updateColors({ foregroundColor })}
          />
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Отдельный цвет точек</Label>
            <Switch
              checked={colors.useSeparateDotColor}
              onCheckedChange={(useSeparateDotColor) =>
                updateColors({ useSeparateDotColor })
              }
            />
          </div>
          {colors.useSeparateDotColor && (
            <ColorPicker
              label="Цвет точек данных"
              value={colors.dotColor}
              onChange={(dotColor) => updateColors({ dotColor })}
            />
          )}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Отдельный цвет глаз</Label>
            <Switch
              checked={colors.useSeparateEyeColor}
              onCheckedChange={(useSeparateEyeColor) =>
                updateColors({ useSeparateEyeColor })
              }
            />
          </div>
          {colors.useSeparateEyeColor && (
            <div className="grid grid-cols-2 gap-3">
              <ColorPicker
                label="Рамка глаз"
                value={colors.eyeFrameColor}
                onChange={(eyeFrameColor) => updateColors({ eyeFrameColor })}
              />
              <ColorPicker
                label="Ядро глаз"
                value={colors.eyeBallColor}
                onChange={(eyeBallColor) => updateColors({ eyeBallColor })}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <ColorPicker
            label="Начальный цвет"
            value={colors.gradientStartColor}
            onChange={(gradientStartColor) =>
              updateColors({ gradientStartColor })
            }
          />
          <ColorPicker
            label="Конечный цвет"
            value={colors.gradientEndColor}
            onChange={(gradientEndColor) =>
              updateColors({ gradientEndColor })
            }
          />
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Тип градиента
            </Label>
            <Select
              value={colors.gradientType}
              onValueChange={(gradientType) =>
                updateColors({ gradientType: gradientType as 'linear' | 'radial' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Линейный</SelectItem>
                <SelectItem value="radial">Радиальный</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {colors.gradientType === 'linear' && (
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs font-medium text-muted-foreground">
                  Угол градиента
                </Label>
                <span className="text-xs text-muted-foreground">{colors.gradientRotation}°</span>
              </div>
              <Slider
                value={[colors.gradientRotation]}
                onValueChange={([gradientRotation]) =>
                  updateColors({ gradientRotation })
                }
                min={0}
                max={360}
                step={15}
              />
            </div>
          )}
        </>
      )}

      {/* Background */}
      <ColorPicker
        label="Цвет фона"
        value={colors.backgroundColor}
        onChange={(backgroundColor) => updateColors({ backgroundColor })}
      />
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Прозрачный фон</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Подходит для наклеек и оверлеев на изображения
          </p>
        </div>
        <Switch
          checked={colors.transparentBackground}
          onCheckedChange={(transparentBackground) =>
            updateColors({ transparentBackground })
          }
        />
      </div>
    </div>
  );
}