'use client';

import { useCallback, useState } from 'react';
import { useQRStore } from '@/lib/qr-store';
import { encodeQRData } from '@/lib/qr-encoders';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QRDataPreview() {
  const { dataType, formData } = useQRStore();
  const [copied, setCopied] = useState(false);

  const dataString = useCallback(() => {
    return encodeQRData(dataType, formData);
  }, [dataType, formData]);

  const data = dataString();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = data;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!data || data.length < 2) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Code2 className="h-3.5 w-3.5" />
          Данные QR-кода ({data.length} символов)
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-3 w-3 mr-1 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 mr-1" />
          )}
          {copied ? 'Скопировано' : 'Копировать'}
        </Button>
      </div>
      <div className={cn(
        'p-3 rounded-lg border text-xs font-mono break-all max-h-24 overflow-y-auto',
        'bg-muted/50 text-muted-foreground leading-relaxed'
      )}>
        {data}
      </div>
    </div>
  );
}
