'use client';

import { useQRStore } from '@/lib/qr-store';
import {
  QR_DATA_TYPE_LABELS,
  type QRDataType,
} from '@/lib/qr-types';
import {
  Link,
  Type,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  Contact,
  MapPin,
  Calendar,
  Coins,
  Send,
  MessageCircle,
} from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const iconMap: Record<QRDataType, React.ElementType> = {
  url: Link,
  text: Type,
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  wifi: Wifi,
  vcard: Contact,
  location: MapPin,
  event: Calendar,
  crypto: Coins,
  telegram: Send,
  whatsapp: MessageCircle,
};

export function TypeSelector() {
  const { dataType, setDataType } = useQRStore();

  const types = Object.keys(QR_DATA_TYPE_LABELS) as QRDataType[];

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {types.map((type) => {
          const Icon = iconMap[type];
          const isActive = dataType === type;
          return (
            <button
              key={type}
              onClick={() => setDataType(type)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shrink-0',
                'border border-border hover:border-primary/30',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-foreground hover:bg-accent'
              )}
            >
              <Icon className="h-4 w-4" />
              {QR_DATA_TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
