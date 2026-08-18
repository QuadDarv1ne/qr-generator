'use client';

import { useQRStore } from '@/lib/qr-store';
import { validateEventDates, validateCoordinates } from '@/lib/qr-encoders';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { QRDataType, QRDataForms } from '@/lib/qr-types';
import { CRYPTO_CURRENCY_LABELS, type CryptoCurrency } from '@/lib/qr-types';

export function DataForm() {
  const { dataType, formData, updateFormData } = useQRStore();

  return (
    <div className="space-y-4">
      {dataType === 'url' && (
        <UrlForm value={formData.url} onChange={(v) => updateFormData('url', v)} />
      )}
      {dataType === 'text' && (
        <TextForm value={formData.text} onChange={(v) => updateFormData('text', v)} />
      )}
      {dataType === 'email' && (
        <EmailForm
          value={formData.email}
          onChange={(v) => updateFormData('email', v)}
        />
      )}
      {dataType === 'phone' && (
        <PhoneForm value={formData.phone} onChange={(v) => updateFormData('phone', v)} />
      )}
      {dataType === 'sms' && (
        <SmsForm
          value={formData.sms}
          onChange={(v) => updateFormData('sms', v)}
        />
      )}
      {dataType === 'wifi' && (
        <WifiForm
          value={formData.wifi}
          onChange={(v) => updateFormData('wifi', v)}
        />
      )}
      {dataType === 'vcard' && (
        <VCardForm
          value={formData.vcard}
          onChange={(v) => updateFormData('vcard', v)}
        />
      )}
      {dataType === 'location' && (
        <LocationForm
          value={formData.location}
          onChange={(v) => updateFormData('location', v)}
        />
      )}
      {dataType === 'event' && (
        <EventForm
          value={formData.event}
          onChange={(v) => updateFormData('event', v)}
        />
      )}
      {dataType === 'crypto' && (
        <CryptoForm
          value={formData.crypto}
          onChange={(v) => updateFormData('crypto', v)}
        />
      )}
      {dataType === 'telegram' && (
        <TelegramForm
          value={formData.telegram}
          onChange={(v) => updateFormData('telegram', v)}
        />
      )}
      {dataType === 'whatsapp' && (
        <WhatsAppForm
          value={formData.whatsapp}
          onChange={(v) => updateFormData('whatsapp', v)}
        />
      )}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

function UrlForm({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <FormField label="URL адрес">
      <Input
        type="url"
        placeholder="https://example.com"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormField>
  );
}

function TextForm({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const charCount = value.length;
  const maxChars = 2000; // Reasonable limit for QR codes
  const isNearLimit = charCount > maxChars * 0.9;
  const isOverLimit = charCount > maxChars;

  return (
    <FormField label="Текст">
      <Textarea
        placeholder="Введите текст..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="resize-none"
        maxLength={maxChars}
        aria-describedby="text-char-count"
      />
      <div id="text-char-count" className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Максимум {maxChars} символов</span>
        <span className={cn(
          isOverLimit ? 'text-destructive font-medium' : isNearLimit ? 'text-amber-500' : ''
        )}>
          {charCount}/{maxChars}
        </span>
      </div>
    </FormField>
  );
}

function EmailForm({
  value,
  onChange,
}: {
  value: { to: string; subject: string; body: string };
  onChange: (v: { to: string; subject: string; body: string }) => void;
}) {
  return (
    <div className="space-y-4">
      <FormField label="Email адрес">
        <Input
          type="email"
          placeholder="name@example.com"
          value={value.to}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
        />
      </FormField>
      <FormField label="Тема">
        <Input
          placeholder="Тема письма"
          value={value.subject}
          onChange={(e) => onChange({ ...value, subject: e.target.value })}
        />
      </FormField>
      <FormField label="Текст письма">
        <Textarea
          placeholder="Текст сообщения..."
          value={value.body}
          onChange={(e) => onChange({ ...value, body: e.target.value })}
          rows={3}
        />
      </FormField>
    </div>
  );
}

function PhoneForm({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <FormField label="Номер телефона">
      <Input
        type="tel"
        placeholder="+79991234567"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormField>
  );
}

function SmsForm({
  value,
  onChange,
}: {
  value: { phone: string; message: string };
  onChange: (v: { phone: string; message: string }) => void;
}) {
  return (
    <div className="space-y-4">
      <FormField label="Номер телефона">
        <Input
          type="tel"
          placeholder="+79991234567"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
        />
      </FormField>
      <FormField label="Сообщение">
        <Textarea
          placeholder="Текст SMS..."
          value={value.message}
          onChange={(e) => onChange({ ...value, message: e.target.value })}
          rows={3}
        />
      </FormField>
    </div>
  );
}

function WifiForm({
  value,
  onChange,
}: {
  value: { ssid: string; password: string; encryption: 'NOPASS' | 'WEP' | 'WPA'; hidden: boolean };
  onChange: (v: { ssid: string; password: string; encryption: 'NOPASS' | 'WEP' | 'WPA'; hidden: boolean }) => void;
}) {
  return (
    <div className="space-y-4">
      <FormField label="Имя сети (SSID)">
        <Input
          placeholder="Моя WiFi сеть"
          value={value.ssid}
          onChange={(e) => onChange({ ...value, ssid: e.target.value })}
        />
      </FormField>
      <FormField label="Пароль">
        <Input
          type="password"
          placeholder="Пароль от сети"
          value={value.password}
          onChange={(e) => onChange({ ...value, password: e.target.value })}
          disabled={value.encryption === 'NOPASS'}
        />
      </FormField>
      <FormField label="Шифрование">
        <Select
          value={value.encryption}
          onValueChange={(v) =>
            onChange({ ...value, encryption: v as 'NOPASS' | 'WEP' | 'WPA' })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WPA">WPA/WPA2</SelectItem>
            <SelectItem value="WEP">WEP</SelectItem>
            <SelectItem value="NOPASS">Без пароля</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Скрытая сеть</Label>
        <Switch
          checked={value.hidden}
          onCheckedChange={(checked) => onChange({ ...value, hidden: checked })}
        />
      </div>
    </div>
  );
}

function VCardForm({
  value,
  onChange,
}: {
  value: QRDataForms['vcard'];
  onChange: (v: QRDataForms['vcard']) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Имя">
          <Input
            placeholder="Иван"
            value={value.firstName}
            onChange={(e) => onChange({ ...value, firstName: e.target.value })}
          />
        </FormField>
        <FormField label="Фамилия">
          <Input
            placeholder="Иванов"
            value={value.lastName}
            onChange={(e) => onChange({ ...value, lastName: e.target.value })}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Телефон">
          <Input
            type="tel"
            placeholder="+79991234567"
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
          />
        </FormField>
        <FormField label="Email">
          <Input
            type="email"
            placeholder="name@example.com"
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Организация">
          <Input
            placeholder="Компания"
            value={value.organization}
            onChange={(e) => onChange({ ...value, organization: e.target.value })}
          />
        </FormField>
        <FormField label="Должность">
          <Input
            placeholder="Менеджер"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
          />
        </FormField>
      </div>
      <FormField label="Веб-сайт">
        <Input
          type="url"
          placeholder="https://example.com"
          value={value.url}
          onChange={(e) => onChange({ ...value, url: e.target.value })}
        />
      </FormField>
      <FormField label="Адрес">
        <Input
          placeholder="г. Москва, ул. Примерная, д. 1"
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />
      </FormField>
      <FormField label="Заметка">
        <Textarea
          placeholder="Дополнительная информация..."
          value={value.note}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
          rows={2}
        />
      </FormField>
    </div>
  );
}

function LocationForm({
  value,
  onChange,
}: {
  value: { latitude: string; longitude: string; query: string };
  onChange: (v: { latitude: string; longitude: string; query: string }) => void;
}) {
  return (
    <div className="space-y-4">
      <FormField label="Поиск по названию">
        <Input
          placeholder="Москва, Красная площадь"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Широта">
          <Input
            placeholder="55.7539"
            value={value.latitude}
            onChange={(e) => onChange({ ...value, latitude: e.target.value })}
          />
        </FormField>
        <FormField label="Долгота">
          <Input
            placeholder="37.6208"
            value={value.longitude}
            onChange={(e) => onChange({ ...value, longitude: e.target.value })}
          />
        </FormField>
      </div>
      {validateCoordinates(value) && (
        <p className="text-xs text-destructive">{validateCoordinates(value)}</p>
      )}
    </div>
  );
}

function EventForm({
  value,
  onChange,
}: {
  value: QRDataForms['event'];
  onChange: (v: QRDataForms['event']) => void;
}) {
  return (
    <div className="space-y-4">
      <FormField label="Название события">
        <Input
          placeholder="Встреча"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </FormField>
      <FormField label="Место проведения">
        <Input
          placeholder="Офис, конференц-зал..."
          value={value.location}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Дата начала">
          <Input
            type="date"
            value={value.startDate}
            onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          />
        </FormField>
        <FormField label="Время начала">
          <Input
            type="time"
            value={value.startTime}
            onChange={(e) => onChange({ ...value, startTime: e.target.value })}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Дата окончания">
          <Input
            type="date"
            value={value.endDate}
            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          />
        </FormField>
        <FormField label="Время окончания">
          <Input
            type="time"
            value={value.endTime}
            onChange={(e) => onChange({ ...value, endTime: e.target.value })}
          />
        </FormField>
      </div>
      <FormField label="Описание">
        <Textarea
          placeholder="Описание события..."
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          rows={2}
        />
      </FormField>
      {validateEventDates(value) && (
        <p className="text-xs text-destructive">{validateEventDates(value)}</p>
      )}
    </div>
  );
}

function CryptoForm({
  value,
  onChange,
}: {
  value: QRDataForms['crypto'];
  onChange: (v: QRDataForms['crypto']) => void;
}) {
  return (
    <div className="space-y-4">
      <FormField label="Валюта">
        <Select
          value={value.currency}
          onValueChange={(v) => onChange({ ...value, currency: v as CryptoCurrency })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CRYPTO_CURRENCY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Адрес кошелька">
        <Input
          placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          className="font-mono"
        />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Сумма (опц.)">
          <Input
            type="number"
            min="0"
            step="any"
            placeholder="0.001"
            value={value.amount}
            onChange={(e) => onChange({ ...value, amount: e.target.value })}
          />
        </FormField>
        <FormField label="Метка (опц.)">
          <Input
            placeholder="Пожертвование"
            value={value.label}
            onChange={(e) => onChange({ ...value, label: e.target.value })}
          />
        </FormField>
      </div>
      <p className="text-xs text-muted-foreground">
        Код генерируется в формате BIP-21 (bitcoin:…, ethereum:…, tron:…) и
        распознаётся криптокошельками.
      </p>
    </div>
  );
}

function TelegramForm({
  value,
  onChange,
}: {
  value: QRDataForms['telegram'];
  onChange: (v: QRDataForms['telegram']) => void;
}) {
  return (
    <div className="space-y-4">
      <FormField label="Имя пользователя">
        <Input
          placeholder="@username"
          value={value.username}
          onChange={(e) => onChange({ ...value, username: e.target.value })}
        />
      </FormField>
      <FormField label="Текст сообщения (опц.)">
        <Textarea
          placeholder="Привет! Напиши мне в Telegram..."
          value={value.text}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
          rows={3}
        />
      </FormField>
      <p className="text-xs text-muted-foreground">
        Код откроет чат с пользователем в Telegram и подставит текст сообщения.
      </p>
    </div>
  );
}

function WhatsAppForm({
  value,
  onChange,
}: {
  value: QRDataForms['whatsapp'];
  onChange: (v: QRDataForms['whatsapp']) => void;
}) {
  return (
    <div className="space-y-4">
      <FormField label="Номер телефона">
        <Input
          type="tel"
          placeholder="+79150000000"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
        />
      </FormField>
      <FormField label="Текст сообщения (опц.)">
        <Textarea
          placeholder="Здравствуйте! Пишу по поводу..."
          value={value.message}
          onChange={(e) => onChange({ ...value, message: e.target.value })}
          rows={3}
        />
      </FormField>
      <p className="text-xs text-muted-foreground">
        Код откроет чат с номером в WhatsApp с готовым текстом сообщения.
      </p>
    </div>
  );
}
