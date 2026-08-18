import type { QRDataType, QRDataForms } from './qr-types';

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

function encodeEmail(e: QRDataForms['email']): string {
  const params: string[] = [];
  if (e.subject) params.push(`subject=${encodeURIComponent(e.subject)}`);
  if (e.body) params.push(`body=${encodeURIComponent(e.body)}`);
  const query = params.length ? `?${params.join('&')}` : '';
  return `mailto:${e.to || ''}${query}`;
}

function encodeWifi(w: QRDataForms['wifi']): string {
  const hidden = w.hidden ? 'H:true' : '';
  return `WIFI:T:${w.encryption};S:${w.ssid};P:${w.password};${hidden};;`;
}

function encodeVCard(v: QRDataForms['vcard']): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ];
  if (v.firstName || v.lastName) {
    lines.push(`N:${v.lastName};${v.firstName};;;`);
    lines.push(`FN:${v.firstName} ${v.lastName}`.trim());
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
  const fmtDate = (d: string, t: string) => {
    if (!d) return '';
    const dt = t ? `${d}T${t}` : d;
    return dt.replace(/[-:]/g, '').split('.')[0] + '00';
  };
  const start = fmtDate(ev.startDate, ev.startTime);
  const end = fmtDate(ev.endDate, ev.endTime);
  const lines = [
    'BEGIN:VEVENT',
    `SUMMARY:${ev.title || 'Событие'}`,
    `DTSTART:${start || '20250101T090000'}`,
    `DTEND:${end || '20250101T100000'}`,
  ];
  if (ev.location) lines.push(`LOCATION:${ev.location}`);
  if (ev.description) lines.push(`DESCRIPTION:${ev.description}`);
  lines.push('END:VEVENT');
  return lines.join('\n');
}
