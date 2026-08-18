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

  return (
    <div className="space-y-5">
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
          <ColorPicker
            label="Цвет фона"
            value={colors.backgroundColor}
            onChange={(backgroundColor) => updateColors({ backgroundColor })}
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
          <ColorPicker
            label="Цвет фона"
            value={colors.backgroundColor}
            onChange={(backgroundColor) => updateColors({ backgroundColor })}
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
    </div>
  );
}
