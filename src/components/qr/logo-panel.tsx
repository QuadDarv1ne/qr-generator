'use client';

import { useRef } from 'react';
import { useQRStore } from '@/lib/qr-store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload, X, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export function LogoPanel() {
  const { logo, setLogo, logoSize, setLogoSize } = useQRStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 2 МБ.');
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Неподдерживаемый формат. Используйте PNG, JPG, WEBP или SVG.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogo({ dataUrl: reader.result as string, name: file.name });
    };
    reader.onerror = () => {
      toast.error('Ошибка при чтении файла');
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogo({ dataUrl: null, name: '' });
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {!logo.dataUrl ? (
        <label
          htmlFor="logo-upload"
          className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Загрузить логотип</p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, SVG, WEBP до 2 МБ
            </p>
          </div>
          <input
            ref={inputRef}
            id="logo-upload"
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="hidden"
            onChange={handleFile}
          />
        </label>
      ) : (
        <div className="relative rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              <img
                src={logo.dataUrl}
                alt={logo.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{logo.name}</p>
              <p className="text-xs text-muted-foreground">Логотип установлен</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={removeLogo}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {logo.dataUrl && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              Размер логотипа
            </Label>
            <span className="text-xs text-muted-foreground font-mono">{logoSize}%</span>
          </div>
          <Slider
            value={[logoSize]}
            onValueChange={([v]) => setLogoSize(v)}
            min={10}
            max={40}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            Большой логотип снижает читаемость кода. Рекомендуется 15–25%.
          </p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Рекомендуется использовать логотип с высокой коррекцией ошибок (H).
      </p>
    </div>
  );
}
