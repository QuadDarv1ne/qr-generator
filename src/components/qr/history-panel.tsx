'use client';

import { useSyncExternalStore } from 'react';
import { useQRStore } from '@/lib/qr-store';
import { encodeQRData } from '@/lib/qr-encoders';
import {
  subscribeHistory,
  getHistorySnapshot,
  addHistoryEntry,
  removeHistoryEntry,
  clearHistory,
  type QRHistoryEntry,
} from '@/lib/qr-history';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Save, RotateCcw, Trash2, Trash } from 'lucide-react';
import { toast } from 'sonner';

const DATE_FMT = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const emptySubscribe = subscribeHistory;
const emptyGetSnapshot = () => [] as QRHistoryEntry[];

export function HistoryPanel() {
  const { dataType, formData, snapshotAll } = useQRStore();
  const entries = useSyncExternalStore(emptySubscribe, getHistorySnapshot, emptyGetSnapshot);

  const saveCurrent = () => {
    const label = encodeQRData(dataType, formData).slice(0, 40) || 'QR-код';
    addHistoryEntry(label, snapshotAll());
    toast.success('Текущий QR-код сохранён в историю');
  };

  const restore = (entry: QRHistoryEntry) => {
    const s = entry.snapshot;
    useQRStore.setState({
      dataType: s.dataType,
      formData: s.formData,
      colors: s.colors,
      logoSize: s.logoSize,
      dotShape: s.dotShape,
      eyeFrame: s.eyeFrame,
      eyeBall: s.eyeBall,
      errorCorrection: s.errorCorrection,
      resolution: s.resolution,
      margin: s.margin,
      printPreset: s.printPreset,
    });
    toast.success(`QR-код «${entry.label}» восстановлен`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button onClick={saveCurrent} variant="outline" size="sm" className="flex-1">
          <Save className="h-3.5 w-3.5 mr-1.5" />
          Сохранить текущий
        </Button>
        {entries.length > 0 && (
          <Button
            onClick={() => {
              clearHistory();
              toast.success('История очищена');
            }}
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            <Trash className="h-3.5 w-3.5 mr-1.5" />
            Очистить
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <History className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            История пуста. Сохраняйте готовые QR-коды, чтобы быстро возвращаться к ним.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 rounded-lg border border-border p-2.5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" title={entry.label}>
                  {entry.label}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                    {entry.snapshot.dataType}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {DATE_FMT.format(entry.createdAt)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                title="Восстановить"
                onClick={() => restore(entry)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                title="Удалить"
                onClick={() => removeHistoryEntry(entry.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        До 20 QR-кодов хранится локально в вашем браузере. Логотипы не сохраняются.
      </p>
    </div>
  );
}