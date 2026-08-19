import { describe, expect, test } from 'bun:test';
import {
  encodeQRData,
  normalizeUrl,
  validateQRData,
  validateEventDates,
  validateCoordinates,
  getQRDataLimit,
} from './qr-encoders';
import type { QRDataForms } from './qr-types';

const baseForm: QRDataForms = {
  url: '',
  text: '',
  email: { to: '', subject: '', body: '' },
  phone: '',
  sms: { phone: '', message: '' },
  wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
  vcard: {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    title: '',
    url: '',
    address: '',
    note: '',
  },
  location: { latitude: '', longitude: '', query: '' },
  event: {
    title: '',
    location: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    description: '',
  },
  crypto: { currency: 'BTC', address: '', amount: '', label: '' },
  telegram: { username: '', text: '' },
  whatsapp: { phone: '', message: '' },
};

describe('normalizeUrl', () => {
  test('добавляет https:// при отсутствии схемы', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl('  example.com/path  ')).toBe('https://example.com/path');
  });

  test('не меняет URL со схемой', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    expect(normalizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
  });
});

describe('encodeQRData', () => {
  test('url нормализуется', () => {
    const form = { ...baseForm, url: 'example.com/page' };
    expect(encodeQRData('url', form)).toBe('https://example.com/page');
  });

  test('text использует запасное значение', () => {
    expect(encodeQRData('text', { ...baseForm, text: '' })).toBe('Привет, мир!');
    expect(encodeQRData('text', { ...baseForm, text: 'Привет' })).toBe('Привет');
  });

  test('email собирает subject и body', () => {
    const form = {
      ...baseForm,
      email: { to: 'test@example.com', subject: 'Hello world', body: 'Body text' },
    };
    expect(encodeQRData('email', form)).toBe(
      'mailto:test@example.com?subject=Hello%20world&body=Body%20text'
    );
  });

  test('phone нормализует пробелы и дефисы', () => {
    const form = { ...baseForm, phone: '+7 999 123-45-67' };
    expect(encodeQRData('phone', form)).toBe('tel:+79991234567');
  });

  test('sms кодирует сообщение', () => {
    const form = { ...baseForm, sms: { phone: '+79991234567', message: 'Привет' } };
    expect(encodeQRData('sms', form)).toBe(
      'sms:+79991234567?body=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82'
    );
  });

  test('wifi экранирует спецсимволы', () => {
    const form = {
      ...baseForm,
      wifi: { ssid: 'My;Net"1', password: 'p:a,s', encryption: 'WPA' as const, hidden: false },
    };
    expect(encodeQRData('wifi', form)).toBe('WIFI:T:WPA;S:My\\;Net\\"1;P:p\\:a\\,s;;;');
  });

  test('wifi без пароля и со скрытой сетью', () => {
    const form = {
      ...baseForm,
      wifi: { ssid: 'OpenNet', password: '', encryption: 'NOPASS' as const, hidden: true },
    };
    expect(encodeQRData('wifi', form)).toBe('WIFI:T:NOPASS;S:OpenNet;H:true;;;');
  });

  test('vcard собирает поля и экранирует', () => {
    const form = {
      ...baseForm,
      vcard: {
        firstName: 'Иван',
        lastName: 'Иванов',
        phone: '+79991234567',
        email: 'ivan@example.com',
        organization: 'Maestro7IT',
        title: 'Преподаватель',
        url: 'https://example.com',
        address: 'г. Москва',
        note: 'Строка 1\nСтрока 2',
      },
    };
    const out = encodeQRData('vcard', form);
    expect(out.startsWith('BEGIN:VCARD')).toBe(true);
    expect(out).toContain('N:Иванов;Иван;;;');
    expect(out).toContain('FN:Иван Иванов');
    expect(out).toContain('TEL;TYPE=CELL:+79991234567');
    expect(out).toContain('ORG:Maestro7IT');
    expect(out).toContain('NOTE:Строка 1\\nСтрока 2');
    expect(out.endsWith('END:VCARD')).toBe(true);
  });

  test('location по координатам и по запросу', () => {
    expect(
      encodeQRData('location', { ...baseForm, location: { latitude: '55.75', longitude: '37.62', query: '' } })
    ).toBe('geo:55.75,37.62');
    expect(
      encodeQRData('location', { ...baseForm, location: { latitude: '', longitude: '', query: 'Москва' } })
    ).toBe('geo:0,0?q=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0');
  });

  test('event форматирует даты', () => {
    const form = {
      ...baseForm,
      event: {
        title: 'Встреча',
        location: 'Офис',
        startDate: '2026-08-20',
        startTime: '09:00',
        endDate: '2026-08-20',
        endTime: '10:00',
        description: 'Планёрка',
      },
    };
    const out = encodeQRData('event', form);
    expect(out).toContain('DTSTART:20260820T090000');
    expect(out).toContain('DTEND:20260820T100000');
    expect(out).toContain('SUMMARY:Встреча');
    expect(out).toContain('LOCATION:Офис');
  });

  test('crypto формирует BIP-21', () => {
    const form = {
      ...baseForm,
      crypto: {
        currency: 'BTC' as const,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        amount: '0.001',
        label: 'Донат',
      },
    };
    expect(encodeQRData('crypto', form)).toBe(
      'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.001&label=%D0%94%D0%BE%D0%BD%D0%B0%D1%82'
    );
  });

  test('telegram убирает @ и добавляет текст', () => {
    expect(
      encodeQRData('telegram', { ...baseForm, telegram: { username: '@user', text: 'Привет' } })
    ).toBe('https://t.me/user?text=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82');
    expect(encodeQRData('telegram', { ...baseForm, telegram: { username: '', text: '' } })).toBe(
      'https://t.me/'
    );
  });

  test('whatsapp оставляет только цифры', () => {
    const form = { ...baseForm, whatsapp: { phone: '+7 (999) 123-45-67', message: '' } };
    expect(encodeQRData('whatsapp', form)).toBe('https://wa.me/79991234567');
  });
});

describe('validateQRData', () => {
  test('короткие данные отклоняются', () => {
    expect(validateQRData('', 'M')).toBeTruthy();
    expect(validateQRData('a', 'M')).toBeTruthy();
  });

  test('допустимые данные проходят', () => {
    expect(validateQRData('https://example.com', 'M')).toBeNull();
  });

  test('слишком длинные данные отклоняются', () => {
    const err = validateQRData('x'.repeat(3000), 'H');
    expect(err).toBeTruthy();
    expect(err).toContain('Максимум');
  });
});

describe('getQRDataLimit', () => {
  test('лимиты уровней коррекции', () => {
    expect(getQRDataLimit('L')).toBe(2953);
    expect(getQRDataLimit('M')).toBe(2331);
    expect(getQRDataLimit('Q')).toBe(1663);
    expect(getQRDataLimit('H')).toBe(1273);
  });
});

describe('validateEventDates', () => {
  const ev = (startDate: string, endDate: string) => ({
    title: '',
    location: '',
    startDate,
    startTime: '09:00',
    endDate,
    endTime: '10:00',
    description: '',
  });

  test('конец раньше начала — ошибка', () => {
    expect(validateEventDates(ev('2026-08-20', '2026-08-19'))).toBeTruthy();
  });

  test('равные даты — без ошибки', () => {
    expect(validateEventDates(ev('2026-08-20', '2026-08-20'))).toBeNull();
  });

  test('пустые даты — без ошибки', () => {
    expect(validateEventDates(ev('', ''))).toBeNull();
  });
});

describe('validateCoordinates', () => {
  test('выход за диапазон — ошибка', () => {
    expect(validateCoordinates({ latitude: '91', longitude: '0', query: '' })).toBeTruthy();
    expect(validateCoordinates({ latitude: '0', longitude: '-181', query: '' })).toBeTruthy();
  });

  test('валидные координаты — без ошибки', () => {
    expect(validateCoordinates({ latitude: '55.75', longitude: '37.62', query: '' })).toBeNull();
  });

  test('запрос отключает проверку координат', () => {
    expect(validateCoordinates({ latitude: 'abc', longitude: '', query: 'Москва' })).toBeNull();
  });
});