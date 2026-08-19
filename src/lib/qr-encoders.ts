import type { QRDataType, QRDataForms, ErrorCorrectionLevel } from './qr-types';

export function encodeQRData(type: QRDataType, data: QRDataForms): string {
  switch (type) {
    case 'url':
      return normalizeUrl(data.url);
    case 'text':
      return data.text || 'Привет, мир!';
    case 'email':
      return encodeEmail(data.email);
    case 'phone':
      return `tel:${normalizePhone(data.phone) || '+79991234567'}`;
    case 'sms':
      return encodeSms(data.sms);
    case 'wifi':
      return encodeWifi(data.wifi);
    case 'vcard':
      return encodeVCard(data.vcard);
    case 'location':
      return encodeLocation(data.location);
    case 'event':
      return encodeEvent(data.event);
    case 'crypto':
      return encodeCrypto(data.crypto);
    case 'telegram':
      return encodeTelegram(data.telegram);
    case 'whatsapp':
      return encodeWhatsApp(data.whatsapp);
    default:
      return '';
  }
}

/** Add https:// prefix if the URL has no scheme (e.g. "example.com" -> "https://example.com") */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return trimmed;
  if (/^(mailto|tel|sms|geo|bitcoin|ethereum|tron|litecoin|dogecoin|bitcoincash|tg|wtai):/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Estimate the maximum number of characters that can be encoded in a QR code
 * at the given error correction level. Version 40 (largest) can hold:
 * - Alphanumeric: ~4296 chars
 * - Byte (UTF-8): ~2953 chars
 * - Numeric: ~7089 chars
 */
export function getQRDataLimit(ecLevel: ErrorCorrectionLevel): number {
  switch (ecLevel) {
    case 'L': return 2953;
    case 'M': return 2331;
    case 'Q': return 1663;
    case 'H': return 1273;
    default: return 2953;
  }
}

/**
 * Check if the provided data exceeds the QR code capacity.
 * Returns null if data is valid, or an error message if it's too long.
 */
export function validateQRData(data: string, ecLevel: ErrorCorrectionLevel): string | null {
  if (!data || data.length < 2) {
    return 'Введите данные для генерации QR-кода';
  }
  const limit = getQRDataLimit(ecLevel);
  if (data.length > limit) {
    return `Слишком много данных. Максимум ~${limit} символов при уровне коррекции "${ecLevel}".`;
  }
  return null;
}

function encodeEmail(e: QRDataForms['email']): string {
  if (!e.to || e.to.trim() === '') {
    return 'mailto:';
  }
  const params: string[] = [];
  if (e.subject) params.push(`subject=${encodeURIComponent(e.subject)}`);
  if (e.body) params.push(`body=${encodeURIComponent(e.body)}`);
  const query = params.length ? `?${params.join('&')}` : '';
  return `mailto:${e.to}${query}`;
}

/** Keep only digits and a leading "+" — removes spaces, dashes, parentheses */
function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return cleaned;
}

function encodeSms(s: QRDataForms['sms']): string {
  const phone = s.phone.trim();
  const body = encodeURIComponent(s.message || '');
  if (phone) return `sms:${phone}?body=${body}`;
  return `sms:?body=${body}`;
}

/**
 * Escape special characters per the WIFI: scheme spec:
 * `\`, `;`, `,`, `:` and `"` must be prefixed with a backslash.
 */
function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,":])/g, '\\$1');
}

function encodeWifi(w: QRDataForms['wifi']): string {
  const hidden = w.hidden ? 'H:true' : '';
  const parts = [
    `T:${w.encryption}`,
    `S:${escapeWifiValue(w.ssid || 'Unnamed')}`,
    w.encryption !== 'NOPASS' ? `P:${escapeWifiValue(w.password)}` : '',
    hidden,
  ].filter(Boolean);
  return `WIFI:${parts.join(';')};;;`;
}

/** Escape values per the vCard 3.0 spec: `\`, `;`, `,` and newlines */
function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function encodeVCard(v: QRDataForms['vcard']): string {
  const esc = escapeVCardValue;
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ];

  // Handle name fields
  const hasName = v.firstName || v.lastName;
  if (hasName) {
    const fullName = esc([v.firstName, v.lastName].filter(Boolean).join(' ').trim());
    lines.push(`N:${esc(v.lastName || '')};${esc(v.firstName || '')};;;`);
    lines.push(`FN:${fullName}`);
  }

  if (v.organization) lines.push(`ORG:${esc(v.organization)}`);
  if (v.title) lines.push(`TITLE:${esc(v.title)}`);
  if (v.phone) lines.push(`TEL;TYPE=CELL:${esc(v.phone)}`);
  if (v.email) lines.push(`EMAIL:${esc(v.email)}`);
  if (v.url) lines.push(`URL:${esc(v.url)}`);
  if (v.address) lines.push(`ADR:;;${esc(v.address)};;;;`);
  if (v.note) lines.push(`NOTE:${esc(v.note)}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

/**
 * Validate event dates: returns an error message or null.
 * Checks that the end date/time is not before the start date/time.
 */
export function validateEventDates(ev: QRDataForms['event']): string | null {
  const startDate = ev.startDate;
  const endDate = ev.endDate;
  if (!startDate || !endDate) return null;
  const start = new Date(`${startDate}T${ev.startTime || '00:00'}`);
  const end = new Date(`${endDate}T${ev.endTime || '00:00'}`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  if (end < start) {
    return 'Дата окончания раньше даты начала';
  }
  return null;
}

/**
 * Validate geo coordinates: returns an error message or null.
 * Latitude must be in [-90, 90], longitude in [-180, 180].
 */
export function validateCoordinates(loc: QRDataForms['location']): string | null {
  if (loc.query) return null;
  const lat = parseFloat(loc.latitude);
  const lon = parseFloat(loc.longitude);
  if (loc.latitude && (Number.isNaN(lat) || lat < -90 || lat > 90)) {
    return 'Широта должна быть числом от -90 до 90';
  }
  if (loc.longitude && (Number.isNaN(lon) || lon < -180 || lon > 180)) {
    return 'Долгота должна быть числом от -180 до 180';
  }
  return null;
}

function encodeLocation(loc: QRDataForms['location']): string {
  if (loc.query) {
    return `geo:0,0?q=${encodeURIComponent(loc.query)}`;
  }
  return `geo:${loc.latitude || '0'},${loc.longitude || '0'}`;
}

function encodeEvent(ev: QRDataForms['event']): string {
  const fmtDate = (d: string, t: string): string => {
    const date = (d || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
    const time = (t || '09:00').replace(/:/g, '');
    // iCalendar требует формат YYYYMMDDTHHMMSS
    return `${date}T${time}00`;
  };
  const start = fmtDate(ev.startDate, ev.startTime);
  const end = fmtDate(ev.endDate, ev.endTime);
  const lines = [
    'BEGIN:VEVENT',
    `SUMMARY:${ev.title || 'Событие'}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
  ];
  if (ev.location) lines.push(`LOCATION:${ev.location}`);
  if (ev.description) lines.push(`DESCRIPTION:${ev.description}`);
  lines.push('END:VEVENT');
  return lines.join('\n');
}

const CRYPTO_SCHEMES: Record<QRDataForms['crypto']['currency'], string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tron',
  LTC: 'litecoin',
  DOGE: 'dogecoin',
  BCH: 'bitcoincash',
};

function encodeCrypto(c: QRDataForms['crypto']): string {
  const address = c.address.trim();
  if (!address) return '';
  let result = `${CRYPTO_SCHEMES[c.currency]}:${address}`;
  const params: string[] = [];
  if (c.amount) params.push(`amount=${c.amount}`);
  if (c.label) params.push(`label=${encodeURIComponent(c.label)}`);
  if (params.length) result += `?${params.join('&')}`;
  return result;
}

function encodeTelegram(t: QRDataForms['telegram']): string {
  const username = t.username.trim().replace(/^@/, '');
  if (!username) return 'https://t.me/';
  const params = t.text ? `?text=${encodeURIComponent(t.text)}` : '';
  return `https://t.me/${username}${params}`;
}

function encodeWhatsApp(w: QRDataForms['whatsapp']): string {
  const phone = w.phone.replace(/\D/g, '');
  const params = w.message ? `?text=${encodeURIComponent(w.message)}` : '';
  return `https://wa.me/${phone}${params}`;
}
