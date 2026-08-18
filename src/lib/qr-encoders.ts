import type { QRDataType, QRDataForms, ErrorCorrectionLevel } from './qr-types';

export function encodeQRData(type: QRDataType, data: QRDataForms): string {
  switch (type) {
    case 'url':
      return data.url || 'https://example.com';
    case 'text':
      return data.text || 'Привет, мир!';
    case 'email':
      return encodeEmail(data.email);
    case 'phone':
      return `tel:${data.phone || '+79991234567'}`;
    case 'sms':
      return `sms:${data.sms.phone || ''}?body=${encodeURIComponent(data.sms.message || '')}`;
    case 'wifi':
      return encodeWifi(data.wifi);
    case 'vcard':
      return encodeVCard(data.vcard);
    case 'location':
      return encodeLocation(data.location);
    case 'event':
      return encodeEvent(data.event);
    default:
      return '';
  }
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

function encodeWifi(w: QRDataForms['wifi']): string {
  const hidden = w.hidden ? 'H:true' : '';
  const parts = [
    `T:${w.encryption}`,
    `S:${w.ssid || 'Unnamed'}`,
    w.encryption !== 'NOPASS' ? `P:${w.password}` : '',
    hidden,
  ].filter(Boolean);
  return `WIFI:${parts.join(';')};;;`;
}

function encodeVCard(v: QRDataForms['vcard']): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ];
  
  // Handle name fields
  const hasName = v.firstName || v.lastName;
  if (hasName) {
    const fullName = [v.firstName, v.lastName].filter(Boolean).join(' ').trim();
    lines.push(`N:${v.lastName || ''};${v.firstName || ''};;;`);
    lines.push(`FN:${fullName}`);
  }
  
  if (v.organization) lines.push(`ORG:${v.organization}`);
  if (v.title) lines.push(`TITLE:${v.title}`);
  if (v.phone) lines.push(`TEL;TYPE=CELL:${v.phone}`);
  if (v.email) lines.push(`EMAIL:${v.email}`);
  if (v.url) lines.push(`URL:${v.url}`);
  if (v.address) lines.push(`ADR:;;${v.address};;;;`);
  if (v.note) lines.push(`NOTE:${v.note}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

function encodeLocation(loc: QRDataForms['location']): string {
  if (loc.query) {
    return `geo:0,0?q=${encodeURIComponent(loc.query)}`;
  }
  return `geo:${loc.latitude || '0'},${loc.longitude || '0'}`;
}

function encodeEvent(ev: QRDataForms['event']): string {
  const fmtDate = (d: string, t: string): string => {
    if (!d) return '20250101T090000';
    const dt = t ? `${d}T${t}` : `${d}T090000`;
    return dt.replace(/[-:]/g, '');
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
