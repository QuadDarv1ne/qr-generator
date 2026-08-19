import type { QRDataType, QRDataForms, CryptoCurrency } from './qr-types';

export interface ImportResult {
  dataType: QRDataType;
  formData: QRDataForms;
}

const emptyVCard: QRDataForms['vcard'] = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  organization: '',
  title: '',
  url: '',
  address: '',
  note: '',
};

const emptyForm: QRDataForms = {
  url: '',
  text: '',
  email: { to: '', subject: '', body: '' },
  phone: '',
  sms: { phone: '', message: '' },
  wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
  vcard: emptyVCard,
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

/**
 * Разобрать WIFI:-строку, учитывая экранирование спецсимволов обратным слешем.
 * Значения вида `KEY:value`, разделитель — неэкранированная `;`.
 */
function parseWifi(content: string): QRDataForms['wifi'] {
  const fields: Record<string, string> = {};
  const body = content.replace(/^WIFI:/i, '').trim();
  let key = '';
  let value = '';
  let readingKey = true;

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (readingKey) {
      if (ch === ':') {
        readingKey = false;
      } else {
        key += ch;
      }
    } else if (ch === '\\' && i + 1 < body.length) {
      value += body[i + 1];
      i++;
    } else if (ch === ';') {
      if (key) fields[key] = value;
      key = '';
      value = '';
      readingKey = true;
    } else {
      value += ch;
    }
  }
  if (key) fields[key] = value;

  const encryption = fields.T === 'NOPASS' ? 'NOPASS' : fields.T === 'WEP' ? 'WEP' : 'WPA';
  return {
    ssid: fields.S ?? '',
    password: fields.P ?? '',
    encryption,
    hidden: fields.H === 'true' || fields.H === '1',
  };
}

function parseVCard(content: string): QRDataForms['vcard'] {
  const normalized = content.replace(/\r\n/g, '\n');
  const find = (key: string): string => {
    const m = normalized.match(new RegExp(`(?:^|\\n)${key}(?:;TYPE=[A-Z]+)?:([^\\n]*)`, 'i'));
    if (!m) return '';
    return m[1].replace(/\\n/g, '\n').replace(/\\([\\;,":])/g, '$1').trim();
  };

  const fn = find('FN');
  const nLine = normalized.match(/(?:^|\n)N:([^;\n]*);([^;\n]*)/i);
  let firstName = '';
  let lastName = '';
  if (fn) {
    const parts = fn.split(/\s+/);
    firstName = parts.slice(0, -1).join(' ');
    lastName = parts[parts.length - 1] ?? '';
  } else if (nLine) {
    lastName = nLine[1];
    firstName = nLine[2];
  }

  return {
    firstName,
    lastName,
    phone: find('TEL'),
    email: find('EMAIL'),
    organization: find('ORG'),
    title: find('TITLE'),
    url: find('URL'),
    address: find('ADR'),
    note: find('NOTE'),
  };
}

/**
 * Разобрать MECARD-строку (компактный формат визиток, часто используется
 * вместо vCard в QR-кодах). Формат: `MECARD:N:Имя;ORG:Компания;TEL:...;...;;`
 */
function parseMeCard(content: string): QRDataForms['vcard'] {
  const body = content.replace(/^MECARD:/i, '').replace(/;;+$/, '').trim();
  const fields = body.split(';');
  const get = (key: string): string => {
    const entry = fields.find((f) => f.toUpperCase().startsWith(`${key}:`));
    if (!entry) return '';
    return entry.slice(key.length + 1).replace(/\\[\\;,:]/g, (m) => m[1]).trim();
  };

  const fullName = get('N');
  const parts = fullName.split(/\s+/);
  const firstName = parts.slice(0, -1).join(' ');
  const lastName = parts[parts.length - 1] ?? '';

  return {
    firstName,
    lastName,
    phone: get('TEL'),
    email: get('EMAIL'),
    organization: get('ORG'),
    title: get('TITLE'),
    url: get('URL'),
    address: get('ADR'),
    note: get('NOTE'),
  };
}

/**
 * Разобрать VEVENT-блок: `BEGIN:VEVENT` … `END:VEVENT`.
 * Даты в формате YYYYMMDDTHHMMSS (или с Z на конце).
 */
function parseVEvent(content: string): QRDataForms['event'] {
  const normalized = content.replace(/\r\n/g, '\n');
  const find = (key: string): string => {
    const m = normalized.match(new RegExp(`(?:^|\\n)${key}:([^\\n]*)`, 'i'));
    return m ? m[1].trim() : '';
  };

  const splitDateTime = (value: string): { date: string; time: string } => {
    const m = value.match(/^(\d{8})(?:T(\d{6}))?/);
    if (!m) return { date: '', time: '' };
    const date = `${m[1].slice(0, 4)}-${m[1].slice(4, 6)}-${m[1].slice(6, 8)}`;
    const time = m[2] ? `${m[2].slice(0, 2)}:${m[2].slice(2, 4)}` : '';
    return { date, time };
  };

  const start = splitDateTime(find('DTSTART'));
  const end = splitDateTime(find('DTEND'));

  return {
    title: find('SUMMARY'),
    location: find('LOCATION'),
    startDate: start.date,
    startTime: start.time || '09:00',
    endDate: end.date,
    endTime: end.time || '10:00',
    description: find('DESCRIPTION'),
  };
}

function parseTelegram(content: string): QRDataForms['telegram'] {
  const m = content.match(/^https:\/\/t\.me\/([^/?]+)/i);
  const username = m?.[1] ?? '';
  let text = '';
  try {
    text = new URL(content).searchParams.get('text') ?? '';
  } catch {
    // ignore malformed URLs
  }
  return { username, text };
}

function parseWhatsApp(content: string): QRDataForms['whatsapp'] {
  const m = content.match(/^https:\/\/wa\.me\/(\d+)/i);
  const phone = m?.[1] ?? '';
  let text = '';
  try {
    text = new URL(content).searchParams.get('text') ?? '';
  } catch {
    // ignore malformed URLs
  }
  return { phone, message: text };
}

function parseMailto(content: string): QRDataForms['email'] {
  const url = new URL(content);
  return {
    to: decodeURIComponent(url.pathname.replace(/^\//, '')),
    subject: url.searchParams.get('subject') ?? '',
    body: url.searchParams.get('body') ?? '',
  };
}

function parseSms(content: string): QRDataForms['sms'] {
  const m = content.match(/^sms:([^?]*)\??(.*)$/i);
  const params = m?.[2] ? new URLSearchParams(m[2]) : null;
  return {
    phone: m?.[1] ?? '',
    message: params?.get('body') ?? '',
  };
}

function parseGeo(content: string): QRDataForms['location'] {
  const m = content.match(/^geo:([^,]+),([^?]+)(?:\?q=(.*))?$/i);
  if (!m) return { latitude: '', longitude: '', query: '' };
  return {
    latitude: m[1],
    longitude: m[2],
    query: m[3] ? decodeURIComponent(m[3]) : '',
  };
}

function parseCrypto(content: string): QRDataForms['crypto'] {
  const m = content.match(/^([a-z]+):(.+)$/i);
  const scheme = (m?.[1] ?? '').toLowerCase();
  const [address = '', query = ''] = (m?.[2] ?? '').split('?', 2);
  const params = new URLSearchParams(query);

  const schemeToCurrency: Record<string, CryptoCurrency> = {
    bitcoin: 'BTC',
    ethereum: 'ETH',
    tron: 'USDT',
    litecoin: 'LTC',
    dogecoin: 'DOGE',
    bitcoincash: 'BCH',
  };

  return {
    currency: schemeToCurrency[scheme] ?? 'BTC',
    address,
    amount: params.get('amount') ?? '',
    label: params.get('label') ?? '',
  };
}

/**
 * Распознать содержимое QR-кода: определить тип данных и заполнить форму.
 * Используется при импорте из сканера. Неизвестные строки попадают в «Текст».
 */
export function importQRContent(content: string): ImportResult {
  const raw = content.trim();
  const result: ImportResult = { dataType: 'text', formData: { ...emptyForm } };

  if (/^https?:\/\//i.test(raw)) {
    if (/^https:\/\/t\.me\//i.test(raw)) {
      result.dataType = 'telegram';
      result.formData.telegram = parseTelegram(raw);
    } else if (/^https:\/\/wa\.me\//i.test(raw)) {
      result.dataType = 'whatsapp';
      result.formData.whatsapp = parseWhatsApp(raw);
    } else {
      result.dataType = 'url';
      result.formData.url = raw;
    }
  } else if (/^tel:/i.test(raw)) {
    result.dataType = 'phone';
    result.formData.phone = raw.slice(4);
  } else if (/^mailto:/i.test(raw)) {
    result.dataType = 'email';
    try {
      result.formData.email = parseMailto(raw);
    } catch {
      result.formData.email = { to: raw.slice(7), subject: '', body: '' };
    }
  } else if (/^sms:/i.test(raw)) {
    result.dataType = 'sms';
    result.formData.sms = parseSms(raw);
  } else if (/^WIFI:/i.test(raw)) {
    result.dataType = 'wifi';
    result.formData.wifi = parseWifi(raw);
  } else if (/^geo:/i.test(raw)) {
    result.dataType = 'location';
    result.formData.location = parseGeo(raw);
  } else if (/^BEGIN:VCARD/i.test(raw)) {
    result.dataType = 'vcard';
    result.formData.vcard = parseVCard(raw);
  } else if (/^MECARD:/i.test(raw)) {
    result.dataType = 'vcard';
    result.formData.vcard = parseMeCard(raw);
  } else if (/^BEGIN:VEVENT/i.test(raw)) {
    result.dataType = 'event';
    result.formData.event = parseVEvent(raw);
  } else if (/^(bitcoin|ethereum|tron|litecoin|dogecoin|bitcoincash):/i.test(raw)) {
    result.dataType = 'crypto';
    result.formData.crypto = parseCrypto(raw);
  } else {
    result.dataType = 'text';
    result.formData.text = raw;
  }

  return result;
}