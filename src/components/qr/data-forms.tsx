'use client';

import { useQRStore } from '@/lib/qr-store';
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
import type { QRDataType } from '@/lib/qr-types';

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
  return (
    <FormField label="Текст">
      <Textarea
        placeholder="Введите текст..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
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
  value: QRDataType extends 'vcard' ? any : any;
  onChange: (v: any) => void;
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
    </div>
  );
}

function EventForm({
  value,
  onChange,
}: {
  value: {
    title: string;
    location: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    description: string;
  };
  onChange: (v: any) => void;
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
    </div>
  );
}
